import * as THREE from 'three';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.targetZoom = 50; 
    
    this.currentRotationX = 0;
    this.currentRotationY = 0;
    this.currentZoom = 50;
    
    this.minZoom = 20;
    this.maxZoom = 100;

    this.lastLeftPos = { x: 0, y: 0 };
    this.lastRightPos = { x: 0, y: 0 };
    this.isLeftActive = false;
    this.isRightActive = false;
  }

  update(deltaTime, leftHand, rightHand) {
    // Rotation (Left Hand - Drag)
    if (leftHand.present && leftHand.gesture === 'OPEN_PALM') {
        if (!this.isLeftActive) {
            // Just started
            this.isLeftActive = true;
            this.lastLeftPos.x = leftHand.position.x;
            this.lastLeftPos.y = leftHand.position.y;
        } else {
            // Dragging
            const deltaX = leftHand.position.x - this.lastLeftPos.x;
            const deltaY = leftHand.position.y - this.lastLeftPos.y;
            
            this.targetRotationY -= deltaX * 3.0; // Sensitivity
            this.targetRotationX -= deltaY * 2.0;
            
            this.targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotationX));
            
            this.lastLeftPos.x = leftHand.position.x;
            this.lastLeftPos.y = leftHand.position.y;
        }
    } else {
        this.isLeftActive = false;
    }

    // Zoom (Right Hand - Drag)
    if (rightHand.present && rightHand.gesture === 'PINCH') {
        if (!this.isRightActive) {
            this.isRightActive = true;
            this.lastRightPos.y = rightHand.position.y;
        } else {
            const deltaY = rightHand.position.y - this.lastRightPos.y;
            
            // Move Up (Positive Delta) -> Zoom In (Decrease Distance)
            // Move Down (Negative Delta) -> Zoom Out (Increase Distance)
            this.targetZoom -= deltaY * 100; // Sensitivity
            this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom));
            
            this.lastRightPos.y = rightHand.position.y;
        }
    } else {
        this.isRightActive = false;
    }

    // Smooth Interpolation
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 10 * deltaTime;
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 10 * deltaTime;
    this.currentZoom += (this.targetZoom - this.currentZoom) * 10 * deltaTime;

    // Update Camera Position
    const y = Math.sin(this.currentRotationX) * this.currentZoom;
    const r = Math.cos(this.currentRotationX) * this.currentZoom;
    const x = Math.sin(this.currentRotationY) * r;
    const z = Math.cos(this.currentRotationY) * r;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }
}
