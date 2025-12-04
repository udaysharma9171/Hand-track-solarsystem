export class HUD {
  constructor() {
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.pointerEvents = 'none';
    this.container.style.fontFamily = '"Orbitron", sans-serif';
    this.container.style.color = '#00ffff';
    this.container.style.textShadow = '0 0 10px #00ffff';
    document.body.appendChild(this.container);

    this.xp = 0;
    this.level = 1;
    this.gesture = 'NONE';

    this.initUI();
  }

  initUI() {
    // Top Left: Stats
    this.statsDiv = document.createElement('div');
    this.statsDiv.style.position = 'absolute';
    this.statsDiv.style.top = '20px';
    this.statsDiv.style.left = '20px';
    this.statsDiv.innerHTML = `
      <h1 style="margin: 0; font-size: 24px;">CELESTIAL ARCHITECT</h1>
      <div style="margin-top: 10px; font-size: 18px;">LEVEL: <span id="level">1</span></div>
      <div style="font-size: 18px;">XP: <span id="xp">0</span></div>
    `;
    this.container.appendChild(this.statsDiv);

    // Top Right: Gesture
    this.gestureDiv = document.createElement('div');
    this.gestureDiv.style.position = 'absolute';
    this.gestureDiv.style.top = '20px';
    this.gestureDiv.style.right = '20px';
    this.gestureDiv.style.fontSize = '24px';
    this.gestureDiv.style.textAlign = 'right';
    this.gestureDiv.innerHTML = `GESTURE: <span id="gesture">NONE</span>`;
    this.container.appendChild(this.gestureDiv);

    // Bottom Center: Instructions
    this.instructions = document.createElement('div');
    this.instructions.style.position = 'absolute';
    this.instructions.style.bottom = '20px';
    this.instructions.style.width = '100%';
    this.instructions.style.textAlign = 'center';
    this.instructions.style.fontSize = '14px';
    this.instructions.style.opacity = '0.7';
    this.instructions.innerHTML = `
      LEFT: Open Palm (Rotate) | RIGHT: Pinch (Zoom), Fist (Black Hole), V-Sign (Freeze)
    `;
    this.container.appendChild(this.instructions);

    // Start Overlay
    this.overlay = document.createElement('div');
    this.overlay.style.position = 'absolute';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    this.overlay.style.display = 'flex';
    this.overlay.style.justifyContent = 'center';
    this.overlay.style.alignItems = 'center';
    this.overlay.style.pointerEvents = 'auto';
    this.overlay.innerHTML = `
      <button id="start-btn" style="
        padding: 20px 40px; 
        font-size: 24px; 
        background: transparent; 
        color: #00ffff; 
        border: 2px solid #00ffff; 
        cursor: pointer;
        font-family: inherit;
        text-shadow: 0 0 10px #00ffff;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      ">INITIALIZE SYSTEM</button>
    `;
    this.container.appendChild(this.overlay);
  }

  update(xp, level, gesture) {
    if (this.xp !== xp) {
      this.xp = xp;
      document.getElementById('xp').innerText = Math.floor(this.xp);
    }
    if (this.level !== level) {
      this.level = level;
      document.getElementById('level').innerText = this.level;
    }
    if (this.gesture !== gesture) {
      this.gesture = gesture;
      document.getElementById('gesture').innerText = this.gesture;
    }
  }

  hideOverlay() {
    this.overlay.style.display = 'none';
    this.container.style.pointerEvents = 'none';
  }
  
  onStart(callback) {
      document.getElementById('start-btn').addEventListener('click', callback);
  }
}
