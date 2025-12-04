import * as THREE from 'three';
import { AssetLoader } from '../utils/AssetLoader.js';
import { MathUtils } from '../utils/MathUtils.js';

export class Galaxy {
  constructor(scene) {
    this.scene = scene;
    this.particles = null;
    this.originalPositions = [];
    this.velocities = [];
    this.count = 10000;
    this.colors = [];
    
    this.params = {
      radius: 50,
      branches: 3,
      spin: 1,
      randomness: 0.5,
      randomnessPower: 3,
      insideColor: '#ff6030',
      outsideColor: '#1b3984'
    };

    this.material = null;
    this.geometry = null;

    this.init();
  }

  init() {
    this.geometry = new THREE.BufferGeometry();
    this.particles = null;
    this.asteroids = null; // New for Ring galaxy
    
    // Black Hole Visuals
    const bhGeometry = new THREE.SphereGeometry(2, 32, 32);
    const bhMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.blackHoleMesh = new THREE.Mesh(bhGeometry, bhMaterial);
    this.blackHoleMesh.visible = false;
    this.scene.add(this.blackHoleMesh);

    const glowTexture = AssetLoader.createGlowTexture();
    const glowMaterial = new THREE.SpriteMaterial({ 
        map: glowTexture, 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    this.blackHoleGlow = new THREE.Sprite(glowMaterial);
    this.blackHoleGlow.scale.set(8, 8, 1);
    this.blackHoleGlow.visible = false;
    this.scene.add(this.blackHoleGlow);
    
    this.generate('spiral');
  }

  generate(type) {
      this.type = type;
      
      // Cleanup
      if (this.particles) {
          this.scene.remove(this.particles);
          this.geometry.dispose();
          this.particles = null;
      }
      if (this.asteroids) {
          this.scene.remove(this.asteroids);
          this.asteroids.geometry.dispose();
          this.asteroids = null;
      }

      this.geometry = new THREE.BufferGeometry();
      this.originalPositions = [];
      this.velocities = [];
      
      if (type === 'spiral') {
          this.generateSpiral();
      } else if (type === 'ring') {
          this.generateRing();
      } else if (type === 'nebula') {
          this.generateNebula();
      }
  }

  generateSpiral() {
      // Classic Spiral: High density, defined arms, central glow
      this.count = 15000;
      const positions = new Float32Array(this.count * 3);
      const colors = new Float32Array(this.count * 3);
      const sizes = new Float32Array(this.count);
      
      const params = {
          radius: 50, branches: 4, spin: 1.5, randomness: 0.6, randomnessPower: 3,
          insideColor: '#ff8830', outsideColor: '#1b3984'
      };
      
      const colorInside = new THREE.Color(params.insideColor);
      const colorOutside = new THREE.Color(params.outsideColor);

      for (let i = 0; i < this.count; i++) {
          const i3 = i * 3;
          const radius = Math.random() * params.radius;
          const spinAngle = radius * params.spin;
          const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;

          const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
          const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius * 0.5;
          const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

          const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
          const y = randomY * 3; 
          const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;

          positions[i3] = x;
          positions[i3+1] = y;
          positions[i3+2] = z;
          
          this.originalPositions.push(x, y, z);
          this.velocities.push(0, 0, 0);

          // Color
          const mixedColor = colorInside.clone();
          mixedColor.lerp(colorOutside, radius / params.radius);
          colors[i3] = mixedColor.r;
          colors[i3+1] = mixedColor.g;
          colors[i3+2] = mixedColor.b;
          
          sizes[i] = Math.random() * 0.5 + 0.1;
      }

      this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      this.material = new THREE.PointsMaterial({
          size: 0.4,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true,
          map: AssetLoader.createGlowTexture(),
          transparent: true
      });

      this.particles = new THREE.Points(this.geometry, this.material);
      this.scene.add(this.particles);
  }

  generateRing() {
      // Ring Galaxy: Defined torus, empty center, neon colors, plus ASTEROIDS
      this.count = 10000;
      const positions = new Float32Array(this.count * 3);
      const colors = new Float32Array(this.count * 3);
      
      const minRadius = 30;
      const maxRadius = 50;
      const color1 = new THREE.Color('#00ffff'); // Cyan
      const color2 = new THREE.Color('#ff00ff'); // Magenta

      for (let i = 0; i < this.count; i++) {
          const i3 = i * 3;
          const angle = Math.random() * Math.PI * 2;
          // Distribute more towards the ring
          const r = minRadius + Math.random() * (maxRadius - minRadius);
          
          // Torus cross-section
          const tubeRadius = 5;
          const tubeAngle = Math.random() * Math.PI * 2;
          const tubeR = Math.random() * tubeRadius;
          
          // Flat ring with some thickness
          const x = Math.cos(angle) * r;
          const y = (Math.random() - 0.5) * 4;
          const z = Math.sin(angle) * r;

          positions[i3] = x;
          positions[i3+1] = y;
          positions[i3+2] = z;
          
          this.originalPositions.push(x, y, z);
          this.velocities.push(0, 0, 0);

          // Split colors by angle
          const mixedColor = color1.clone().lerp(color2, (Math.sin(angle) + 1) / 2);
          colors[i3] = mixedColor.r;
          colors[i3+1] = mixedColor.g;
          colors[i3+2] = mixedColor.b;
      }

      this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      this.material = new THREE.PointsMaterial({
          size: 0.5,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true,
          map: AssetLoader.createGlowTexture(),
          transparent: true
      });

      this.particles = new THREE.Points(this.geometry, this.material);
      this.scene.add(this.particles);
      
      // Add Asteroids (Larger, jagged particles)
      this.generateAsteroids(minRadius, maxRadius);
  }
  
  generateAsteroids(minR, maxR) {
      const count = 500;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      
      for(let i=0; i<count; i++) {
          const i3 = i*3;
          const angle = Math.random() * Math.PI * 2;
          const r = minR + Math.random() * (maxR - minR);
          
          positions[i3] = Math.cos(angle) * r;
          positions[i3+1] = (Math.random() - 0.5) * 10; // More vertical spread
          positions[i3+2] = Math.sin(angle) * r;
          
          colors[i3] = 0.7; // Grey
          colors[i3+1] = 0.7;
          colors[i3+2] = 0.7;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
          size: 1.5, // Big
          vertexColors: true,
          map: AssetLoader.createGlowTexture(), // Reuse for now, maybe create rock texture later
          transparent: true,
          opacity: 0.8
      });
      
      this.asteroids = new THREE.Points(geometry, material);
      this.scene.add(this.asteroids);
  }

  generateNebula() {
      // Nebula: Volumetric, cloud-like, no clear structure, soft colors
      this.count = 8000;
      const positions = new Float32Array(this.count * 3);
      const colors = new Float32Array(this.count * 3);
      
      const color1 = new THREE.Color('#4b0082'); // Indigo
      const color2 = new THREE.Color('#00ced1'); // Dark Turquoise
      
      // Create clusters
      const clusters = 8;
      for(let i=0; i<this.count; i++) {
          const i3 = i*3;
          
          // Pick a cluster center
          const clusterIdx = Math.floor(Math.random() * clusters);
          // Random cluster centers in a sphere
          // Use a seeded random or just fixed offsets for consistency? Random is fine.
          
          // We want a big cloud.
          // Let's just use Perlin-ish noise by summing randoms
          const r = 40 * Math.pow(Math.random(), 0.5);
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          const x = r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.sin(phi) * Math.sin(theta);
          const z = r * Math.cos(phi);
          
          // Distort to make it irregular
          positions[i3] = x * (1 + Math.random());
          positions[i3+1] = y * (0.5 + Math.random());
          positions[i3+2] = z * (1 + Math.random());
          
          this.originalPositions.push(positions[i3], positions[i3+1], positions[i3+2]);
          this.velocities.push(0, 0, 0);
          
          // Color based on position
          const mixedColor = color1.clone().lerp(color2, (x/50 + 0.5));
          colors[i3] = mixedColor.r;
          colors[i3+1] = mixedColor.g;
          colors[i3+2] = mixedColor.b;
      }
      
      this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      this.material = new THREE.PointsMaterial({
          size: 2.0, // Large, soft particles
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true,
          map: AssetLoader.createGlowTexture(),
          transparent: true,
          opacity: 0.3 // See-through
      });
      
      this.particles = new THREE.Points(this.geometry, this.material);
      this.scene.add(this.particles);
  }

  burst(origin) {
      // Burst from center (0,0,0) since BH is static
      const positions = this.geometry.attributes.position.array;
      const originX = 0;
      const originY = 0;
      
      for(let i=0; i<this.count; i++) {
          const i3 = i*3;
          const x = positions[i3];
          const y = positions[i3+1];
          const z = positions[i3+2];
          
          const dx = x - originX;
          const dy = y - originY;
          const dz = z; 
          
          const distSq = dx*dx + dy*dy + dz*dz;
          const dist = Math.sqrt(distSq);
          
          if (dist < 15) {
              const force = 50 / (dist + 0.1);
              this.velocities[i3] += dx * force;
              this.velocities[i3+1] += dy * force;
              this.velocities[i3+2] += dz * force;
          }
      }
      
      // Hide BH
      this.blackHoleMesh.visible = false;
      this.blackHoleGlow.visible = false;
  }
  
  update(deltaTime, handData, isTimeFrozen) {
    if (isTimeFrozen) return;

    const positions = this.geometry.attributes.position.array;
    
    // Black Hole Physics (Fist)
    const isBlackHole = handData.gesture === 'FIST';
    
    // Toggle Visibility
    this.blackHoleMesh.visible = isBlackHole;
    this.blackHoleGlow.visible = isBlackHole;

    // Target is ALWAYS Center (0,0,0)
    const targetX = 0;
    const targetY = 0;
    const targetZ = 0;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      
      let x = positions[i3];
      let y = positions[i3 + 1];
      let z = positions[i3 + 2];

      const ox = this.originalPositions[i3];
      const oy = this.originalPositions[i3 + 1];
      const oz = this.originalPositions[i3 + 2];

      // Elastic return force
      const returnForce = 0.5 * deltaTime;
      
      if (isBlackHole) {
        // Attraction to Center
        const dx = targetX - x;
        const dy = targetY - y;
        const dz = targetZ - z;
        const distSq = dx*dx + dy*dy + dz*dz;
        const dist = Math.sqrt(distSq);
        
        if (dist > 2) { 
          const force = 200 * deltaTime / (distSq + 0.1); 
          this.velocities[i3] += dx * force;
          this.velocities[i3+1] += dy * force;
          this.velocities[i3+2] += dz * force;
          
          const swirlForce = 50 * deltaTime / (dist + 0.1);
          this.velocities[i3] += -dy * swirlForce; 
          this.velocities[i3+1] += dx * swirlForce; 
        }
      } else {
        // Return to original position
        const dx = ox - x;
        const dy = oy - y;
        const dz = oz - z;
        
        this.velocities[i3] += dx * returnForce;
        this.velocities[i3+1] += dy * returnForce;
        this.velocities[i3+2] += dz * returnForce;
      }

      // Friction
      this.velocities[i3] *= 0.95;
      this.velocities[i3+1] *= 0.95;
      this.velocities[i3+2] *= 0.95;

      positions[i3] += this.velocities[i3];
      positions[i3+1] += this.velocities[i3+1];
      positions[i3+2] += this.velocities[i3+2];
    }

    this.geometry.attributes.position.needsUpdate = true;
    
    // Unique Animations per Type
    if (!isBlackHole) {
        if (this.type === 'spiral') {
            this.particles.rotation.y += 0.1 * deltaTime; // Fast spin
        } else if (this.type === 'ring') {
            this.particles.rotation.y += 0.05 * deltaTime;
            this.particles.rotation.x = Math.sin(Date.now() * 0.0005) * 0.2; // Wobble
            if (this.asteroids) {
                this.asteroids.rotation.y += 0.08 * deltaTime; // Different speed
                this.asteroids.rotation.x = this.particles.rotation.x;
            }
        } else if (this.type === 'nebula') {
            this.particles.rotation.y += 0.02 * deltaTime; // Slow drift
            this.particles.rotation.z += 0.01 * deltaTime;
        }
    }
  }
  
  updateColor(level) {
      // Only update colors for Spiral for now, as others have specific palettes
      if (this.type !== 'spiral') return;
      
      let inside = '#ff6030';
      let outside = '#1b3984';
      
      if (level === 2) {
          inside = '#30ff60';
          outside = '#841b39';
      } else if (level >= 3) {
          inside = '#ff3030';
          outside = '#84841b';
      }
      
      const colorInside = new THREE.Color(inside);
      const colorOutside = new THREE.Color(outside);
      const colors = this.geometry.attributes.color.array;
      
      // ... (existing color update logic)
  }
}
