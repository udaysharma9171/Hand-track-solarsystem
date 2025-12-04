import * as THREE from 'three';

export class AssetLoader {
  static createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    const gradient = context.createRadialGradient(
      64, 64, 0,
      64, 64, 64
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(240, 240, 255, 0.6)');
    gradient.addColorStop(0.5, 'rgba(128, 128, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  static createSunTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    const gradient = context.createRadialGradient(
      256, 256, 0,
      256, 256, 256
    );
    gradient.addColorStop(0, 'rgba(255, 255, 240, 1)'); // White-ish center
    gradient.addColorStop(0.1, 'rgba(255, 240, 200, 0.9)'); // Yellow core
    gradient.addColorStop(0.4, 'rgba(255, 160, 60, 0.4)'); // Orange corona
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
  static createPlanetTexture(baseColor, secondaryColor, type = 'rocky') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    // Fill background
    context.fillStyle = baseColor;
    context.fillRect(0, 0, 256, 256);

    // Add noise/bands
    if (type === 'gas') {
        // Gas Giant Bands
        for (let i = 0; i < 10; i++) {
            context.fillStyle = i % 2 === 0 ? baseColor : secondaryColor;
            context.globalAlpha = 0.5;
            const y = Math.random() * 256;
            const h = Math.random() * 50 + 20;
            context.fillRect(0, y, 256, h);
        }
        // Blur
        context.filter = 'blur(5px)';
    } else {
        // Rocky Craters/Noise
        for (let i = 0; i < 50; i++) {
            context.fillStyle = secondaryColor;
            context.globalAlpha = 0.3;
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const r = Math.random() * 20 + 5;
            context.beginPath();
            context.arc(x, y, r, 0, Math.PI * 2);
            context.fill();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  static createEarthTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      // 1. Water Base
      context.fillStyle = '#1a3b8e';
      context.fillRect(0, 0, 512, 512);
      
      // 2. Land Masses (Random Blobs)
      context.fillStyle = '#2e8b57'; // Sea Green/Forest
      for(let i=0; i<20; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const r = Math.random() * 60 + 20;
          context.beginPath();
          context.arc(x, y, r, 0, Math.PI*2);
          context.fill();
          
          // Detail
          context.fillStyle = '#228b22';
          context.beginPath();
          context.arc(x+10, y+10, r*0.5, 0, Math.PI*2);
          context.fill();
          context.fillStyle = '#2e8b57'; // Reset
      }
      
      // 3. Clouds (White noise/swirls)
      context.fillStyle = 'rgba(255, 255, 255, 0.4)';
      context.filter = 'blur(10px)';
      for(let i=0; i<15; i++) {
           const x = Math.random() * 512;
           const y = Math.random() * 512;
           const w = Math.random() * 200 + 50;
           const h = Math.random() * 40 + 10;
           context.fillRect(x, y, w, h);
      }
      context.filter = 'none';
      
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
  }
}
