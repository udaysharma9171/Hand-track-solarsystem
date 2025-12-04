import * as THREE from 'three';
import { AssetLoader } from '../utils/AssetLoader.js';

export class FluidSandbox {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.maxParticles = 5000;
    this.particleIndex = 0;
    
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);
    this.lifetimes = new Float32Array(this.maxParticles); // 0 to 1
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    
    this.material = new THREE.PointsMaterial({
      size: 1.0,
      vertexColors: true,
      map: AssetLoader.createGlowTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
    });
    
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.visible = false;
    this.scene.add(this.mesh);
    
    // Initialize off-screen
    for(let i=0; i<this.maxParticles; i++) {
        this.lifetimes[i] = 0;
        this.sizes[i] = 0;
    }
    
    this.hue = 0;
  }

  show() {
      this.mesh.visible = true;
  }

  hide() {
      this.mesh.visible = false;
  }

  update(deltaTime, handData) {
      if (!this.mesh.visible) return;
      
      // Emit particles if hand is present and pinching (drawing)
      // Or just always emit from index tip for "fluid" feel?
      // User said "control over my screen and make some designs".
      // Let's emit when hand is present.
      
      if (handData.present && handData.indexTip) {
          // Map 2D index tip (0-1) to 3D world space
          // Camera is at (0, 50, 50) looking at (0,0,0)
          // We need to project onto a plane.
          // Let's just map roughly to a plane at Z=0 for simplicity.
          // Screen X (0-1) -> World X (-40 to 40)
          // Screen Y (0-1) -> World Y (-20 to 20) ? No, camera is angled.
          
          // Let's use a raycaster approach or simple mapping if camera is static.
          // Camera is at (0, 50, 50), looking at (0,0,0).
          // Let's draw on the X-Z plane (y=0) or a billboard plane facing camera?
          // User said "fluid particle", maybe 2D screen space feel?
          // Let's draw in 3D space at Y=0.
          
          const x = (handData.indexTip.x - 0.5) * 80; // Scale to world
          const z = (handData.indexTip.y - 0.5) * 60; // Scale to world
          const y = 0;
          
          // Emit multiple particles for density
          const emitCount = 5;
          for(let k=0; k<emitCount; k++) {
              const i = this.particleIndex;
              const i3 = i * 3;
              
              this.positions[i3] = x + (Math.random()-0.5)*2;
              this.positions[i3+1] = y + (Math.random()-0.5)*2;
              this.positions[i3+2] = z + (Math.random()-0.5)*2;
              
              // Cycling Color
              this.hue += 0.001;
              const color = new THREE.Color().setHSL(this.hue % 1, 1.0, 0.5);
              this.colors[i3] = color.r;
              this.colors[i3+1] = color.g;
              this.colors[i3+2] = color.b;
              
              this.sizes[i] = Math.random() * 2 + 1;
              this.lifetimes[i] = 1.0; // Full life
              
              // Velocity? Let's just have them drift slightly or stay static for drawing
              // "Fluid" implies movement.
              
              this.particleIndex = (this.particleIndex + 1) % this.maxParticles;
          }
      }
      
      // Update Particles
      for(let i=0; i<this.maxParticles; i++) {
          if (this.lifetimes[i] > 0) {
              this.lifetimes[i] -= deltaTime * 0.5; // Fade out speed
              
              if (this.lifetimes[i] <= 0) {
                  this.sizes[i] = 0; // Hide
              } else {
                  // Drift
                  const i3 = i*3;
                  this.positions[i3] += (Math.random()-0.5) * 0.1;
                  this.positions[i3+1] += (Math.random()-0.5) * 0.1;
                  this.positions[i3+2] += (Math.random()-0.5) * 0.1;
                  
                  // Scale size by lifetime
                  // this.sizes[i] *= 0.99; 
              }
          }
      }
      
      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;
      this.geometry.attributes.size.needsUpdate = true;
  }
}
