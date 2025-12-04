import * as THREE from 'three';
import { AssetLoader } from '../utils/AssetLoader.js';

export class SolarSystem {
  constructor(scene) {
    this.scene = scene;
    this.planets = [];
    this.sun = null;
    
    this.init();
  }

  init() {
    // Sun
    const sunGeometry = new THREE.SpriteMaterial({
      map: AssetLoader.createSunTexture(),
      blending: THREE.AdditiveBlending,
      color: 0xffaa00,
      transparent: true,
      depthWrite: false
    });
    this.sun = new THREE.Sprite(sunGeometry);
    this.sun.scale.set(15, 15, 1); // Slightly larger Sun
    this.scene.add(this.sun);

    // Planet Data (Scaled for visual clarity, not 1:1 realism)
    const planetData = [
        { name: 'Mercury', size: 0.8, distance: 10, color: '#A5A5A5', color2: '#5A5A5A', type: 'rocky' },
        { name: 'Venus', size: 1.2, distance: 15, color: '#E3BB76', color2: '#D3A569', type: 'gas' }, // Thick atmosphere
        { name: 'Earth', size: 1.3, distance: 20, color: '#2233FF', color2: '#FFFFFF', type: 'rocky' },
        { name: 'Mars', size: 1.0, distance: 25, color: '#FF4500', color2: '#8B0000', type: 'rocky' },
        { name: 'Jupiter', size: 3.5, distance: 35, color: '#C88B3A', color2: '#F4A460', type: 'gas' },
        { name: 'Saturn', size: 3.0, distance: 45, color: '#F4C542', color2: '#CDBA96', type: 'gas', ring: true },
        { name: 'Uranus', size: 2.0, distance: 55, color: '#4FD0E7', color2: '#FFFFFF', type: 'gas' },
        { name: 'Neptune', size: 2.0, distance: 65, color: '#4169E1', color2: '#00008B', type: 'gas' }
    ];

    planetData.forEach(data => {
      const geometry = new THREE.SphereGeometry(data.size, 32, 32);
      
      let texture;
      if (data.name === 'Earth') {
          texture = AssetLoader.createEarthTexture();
      } else {
          texture = AssetLoader.createPlanetTexture(data.color, data.color2, data.type);
      }
      
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
        metalness: 0.1,
        emissive: new THREE.Color(data.color),
        emissiveIntensity: 0.2 // Luminous glow
      });
      const planet = new THREE.Mesh(geometry, material);
      
      // Ring for Saturn
      if (data.ring) {
          const ringGeo = new THREE.RingGeometry(data.size * 1.4, data.size * 2.2, 32);
          const ringMat = new THREE.MeshBasicMaterial({ 
              color: 0xCDBA96, 
              side: THREE.DoubleSide, 
              transparent: true, 
              opacity: 0.6 
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = Math.PI / 2;
          planet.add(ring);
      }
      
      // Orbit Line
      const orbitCurve = new THREE.EllipseCurve(
          0, 0,            // ax, aY
          data.distance, data.distance, // xRadius, yRadius
          0, 2 * Math.PI,  // aStartAngle, aEndAngle
          false,            // aClockwise
          0                 // aRotation
      );
      const points = orbitCurve.getPoints(64);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      orbitLine.rotation.x = Math.PI / 2;
      this.scene.add(orbitLine);
      
      const orbit = {
        mesh: planet,
        distance: data.distance,
        angle: Math.random() * Math.PI * 2,
        speed: 10 / data.distance, // Kepler-ish
        velocity: new THREE.Vector3(0, 0, 0),
        isSlapped: false
      };
      
      this.planets.push(orbit);
      this.scene.add(planet);
    });
    
    // Sun Light
    const light = new THREE.PointLight(0xffaa00, 3, 150); // Increased intensity and range
    this.scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x404040, 2.0); // Brighter ambient
    this.scene.add(ambientLight);
  }

  burst() {
      this.planets.forEach(p => {
          // Explode outwards from center
          const direction = p.mesh.position.clone().normalize();
          // Randomize slightly
          direction.add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).multiplyScalar(0.5));
          p.velocity = direction.normalize().multiplyScalar(30); // High speed burst
          p.isSlapped = true; // Use physics mode
      });
  }

  update(deltaTime, handData) {
    // Pulse Sun
    const time = Date.now() * 0.001;
    const scale = 10 + Math.sin(time * 2) * 0.5;
    this.sun.scale.set(scale, scale, 1);

    const isBlackHole = handData.gesture === 'FIST';

    // Update Planets
    this.planets.forEach(p => {
      
      if (isBlackHole) {
          // SUCK INTO CENTER
          p.isSlapped = true; // Enable physics mode
          const target = new THREE.Vector3(0, 0, 0);
          const dist = p.mesh.position.distanceTo(target);
          
          if (dist > 1) {
              const direction = target.sub(p.mesh.position).normalize();
              // Much stronger force to overcome distance
              const force = 500 * deltaTime / (dist * 0.1 + 0.1); 
              p.velocity.add(direction.multiplyScalar(force));
              
              // Spiral effect
              const tangent = new THREE.Vector3(-p.mesh.position.z, 0, p.mesh.position.x).normalize();
              p.velocity.add(tangent.multiplyScalar(50 * deltaTime));
          }
      }

      if (p.isSlapped) {
        // Physics movement
        p.mesh.position.add(p.velocity.clone().multiplyScalar(deltaTime));
        // Friction
        p.velocity.multiplyScalar(0.98);
        
        // Return to Orbit Logic (Elasticity)
        if (!isBlackHole) {
            // Target position: Project current position onto orbital circle
            // This pulls them back to their correct distance/ring
            const currentDist = p.mesh.position.length();
            const targetDist = p.distance;
            
            // Vector pointing from center to planet
            const radialDir = p.mesh.position.clone().normalize();
            
            // Where it SHOULD be (on the ring)
            const targetPos = radialDir.multiplyScalar(targetDist);
            
            // Spring force towards target
            const diff = targetPos.sub(p.mesh.position);
            const force = diff.multiplyScalar(2.0 * deltaTime); // Spring strength
            p.velocity.add(force);
            
            // If close to orbit and slow, snap back
            if (diff.length() < 0.5 && p.velocity.length() < 0.5) {
                p.isSlapped = false;
                // Sync angle to current position so it doesn't jump
                p.angle = Math.atan2(p.mesh.position.z, p.mesh.position.x);
            }
        }
      } else {
        // Orbital movement
        p.angle += p.speed * deltaTime * 10; // Speed multiplier
        p.mesh.position.x = Math.cos(p.angle) * p.distance;
        p.mesh.position.z = Math.sin(p.angle) * p.distance;
        p.mesh.position.y = 0;
      }
      
      // Interaction: Slap
      if (handData.gesture !== 'NONE' && !p.isSlapped && !isBlackHole) {
          // Check collision with hand
          const handPos = new THREE.Vector3(handData.position.x * 30, handData.position.y * 30, 0);
          const dist = handPos.distanceTo(p.mesh.position);
          
          if (dist < 3) { // Hit radius
              p.isSlapped = true;
              const direction = p.mesh.position.clone().normalize();
              direction.add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5));
              p.velocity = direction.normalize().multiplyScalar(20); // Slap speed
              return true; 
          }
      }
    });
  }
  
  checkCollisions(handData) {
      let hit = false;
      this.planets.forEach(p => {
          if (!p.isSlapped && handData.gesture !== 'NONE') {
              const handPos = new THREE.Vector3(handData.position.x * 30, handData.position.y * 30, 0);
              if (handPos.distanceTo(p.mesh.position) < 3) {
                  hit = true;
              }
          }
      });
      return hit;
  }
}
