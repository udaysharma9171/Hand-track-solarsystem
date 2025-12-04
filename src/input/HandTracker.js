// import { Hands } from '@mediapipe/hands'; // Using CDN global
const Hands = window.Hands;

export class HandTracker {
  constructor() {
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 2, // Enable 2 hands
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults(this.onResults.bind(this));

    this.videoElement = document.createElement('video');
    this.videoElement.style.display = 'none';
    document.body.appendChild(this.videoElement);

    // State for each hand
    this.leftHand = { gesture: 'NONE', position: { x: 0, y: 0 }, pinchDistance: 0, present: false, indexTip: { x: 0, y: 0 }, isPinching: false };
    this.rightHand = { gesture: 'NONE', position: { x: 0, y: 0 }, pinchDistance: 0, present: false, indexTip: { x: 0, y: 0 }, isPinching: false };

    this.cameraRunning = false;
    this.results = null; // Store the latest results
  }

  async start() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Try with ideal constraints first
        const constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };
        
        // Add timeout race
        const streamPromise = navigator.mediaDevices.getUserMedia(constraints);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Camera timeout')), 10000));
        
        const stream = await Promise.race([streamPromise, timeoutPromise]);
        
        this.videoElement.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            this.videoElement.onloadedmetadata = () => {
                resolve();
            };
        });
        
        await this.videoElement.play();
        this.cameraRunning = true;
        this.processVideo();
      } catch (error) {
        console.error('Error accessing camera:', error);
        // Fallback to simpler constraints if first attempt failed
        try {
            console.log("Retrying with simple constraints...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.srcObject = stream;
            await this.videoElement.play();
            this.cameraRunning = true;
            this.processVideo();
        } catch (retryError) {
            console.error('Retry failed:', retryError);
            alert('Camera access failed. Mouse control enabled as fallback.');
            // We don't block the app, just don't run camera loop
        }
      }
    }
  }

  async processVideo() {
    if (this.cameraRunning) {
      await this.hands.send({ image: this.videoElement });
      requestAnimationFrame(this.processVideo.bind(this));
    }
  }

  onResults(results) {
    this.results = results; // Store results for getHandData
    // Reset presence
    this.leftHand.present = false;
    this.rightHand.present = false;
    this.leftHand.gesture = 'NONE';
    this.rightHand.gesture = 'NONE';
    this.leftHand.isPinching = false;
    this.rightHand.isPinching = false;


    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const label = results.multiHandedness[i].label; // "Left" or "Right"
        
        // MediaPipe "Left" is user's Right hand in selfie mode (mirrored)
        // MediaPipe "Right" is user's Left hand in selfie mode (mirrored)
        // So:
        // Label "Left" -> Update this.rightHand
        // Label "Right" -> Update this.leftHand

        let handState = null;
        if (label === 'Left') {
            handState = this.rightHand;
        } else {
            handState = this.leftHand;
        }

        handState.present = true;
        this.updateHandPosition(landmarks, handState);
        handState.gesture = this.detectGesture(landmarks, handState);
        
        // Update indexTip and isPinching directly in handState
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        const thumbIndexDist = dist(thumbTip, indexTip);
        handState.indexTip = { x: indexTip.x, y: indexTip.y };
        handState.isPinching = thumbIndexDist < 0.05;
      }
    }
  }

  updateHandPosition(landmarks, handState) {
    const wrist = landmarks[0];
    // Invert X for mirror effect
    handState.position.x = (wrist.x - 0.5) * 2; 
    handState.position.y = -(wrist.y - 0.5) * 2; 
  }

  detectGesture(lm, handState) {
    // Helper to get distance
    const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    const thumbTip = lm[4];
    const indexTip = lm[8];
    
    const thumbIndexDist = dist(thumbTip, indexTip);
    handState.pinchDistance = thumbIndexDist;

    // Check if fingers are extended
    const isExtended = (tipIdx, pipIdx) => dist(lm[0], lm[tipIdx]) > dist(lm[0], lm[pipIdx]);

    const indexExt = isExtended(8, 6);
    const middleExt = isExtended(12, 10);
    const ringExt = isExtended(16, 14);
    const pinkyExt = isExtended(20, 18);

    // FIST: All fingers closed
    if (!indexExt && !middleExt && !ringExt && !pinkyExt) {
      return 'FIST';
    }

    // PINCH: Thumb and Index close
    if (thumbIndexDist < 0.05) {
      return 'PINCH';
    }

    // V-SIGN: Index and Middle extended
    if (indexExt && middleExt && !ringExt && !pinkyExt) {
      return 'V_SIGN';
    }

    // OPEN_PALM: All extended
    if (indexExt && middleExt && ringExt && pinkyExt) {
      return 'OPEN_PALM';
    }

    return 'NONE';
  }

  getHandData(index) {
      if (!this.results || !this.results.multiHandLandmarks || !this.results.multiHandLandmarks[index]) {
          return { present: false, gesture: 'NONE', position: {x:0, y:0}, indexTip: {x:0, y:0}, isPinching: false };
      }
      
      const lm = this.results.multiHandLandmarks[index];
      const handedness = this.results.multiHandedness[index].label; // 'Left' or 'Right'
      
      // Calculate center (approx)
      let x = 0, y = 0;
      lm.forEach(p => { x += p.x; y += p.y; });
      x /= lm.length;
      y /= lm.length;
      
      // Index Tip for Cursor
      const indexTip = { x: lm[8].x, y: lm[8].y };
      
      // Check Pinch for Click (Thumb + Index)
      const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
      const isPinching = dist(lm[4], lm[8]) < 0.05;

      // Let's just return the raw data needed for App.js to decide
      return {
          present: true,
          gesture: this.detectGestureForHand(lm), // Use the new method for this specific hand
          position: { x: x - 0.5, y: y - 0.5 }, // Center at 0,0
          indexTip: indexTip,
          isPinching: isPinching,
      };
  }

  detectGestureForHand(lm) {
    const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    const isExtended = (tipIdx, pipIdx) => dist(lm[0], lm[tipIdx]) > dist(lm[0], lm[pipIdx]);

    const thumbIndexDist = dist(lm[4], lm[8]);
    const indexExt = isExtended(8, 6);
    const middleExt = isExtended(12, 10);
    const ringExt = isExtended(16, 14);
    const pinkyExt = isExtended(20, 18);

    if (!indexExt && !middleExt && !ringExt && !pinkyExt) return 'FIST';
    if (thumbIndexDist < 0.05) return 'PINCH';
    if (indexExt && middleExt && !ringExt && !pinkyExt) return 'V_SIGN';
    if (indexExt && middleExt && ringExt && pinkyExt) return 'OPEN_PALM';
    
    return 'NONE';
  }
}
