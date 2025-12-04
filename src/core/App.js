import * as THREE from 'three';
import { CameraController } from './CameraController.js';
import { PostProcessing } from './PostProcessing.js';
import { Galaxy } from '../world/Galaxy.js';
import { SolarSystem } from '../world/SolarSystem.js';
import { StarField } from '../world/StarField.js';
import { HandTracker } from '../input/HandTracker.js';
import { HUD } from '../ui/HUD.js';
import { Menu } from '../ui/Menu.js';

import { FluidSandbox } from '../world/FluidSandbox.js';
import { AudioManager } from '../utils/AudioManager.js';

export class App {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    
    this.cameraController = null;
    this.postProcessing = null;
    
    this.galaxy = null;
    this.solarSystem = null;
    this.starField = null;
    this.fluidSandbox = null;
    this.handTracker = null;
    this.hud = null;
    this.menu = null;
    this.audioManager = null;
    
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 100;
    this.prevRightGesture = 'NONE';
    
    this.gameState = 'MENU'; // MENU, PLAYING, SANDBOX
    
    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.002);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 50, 50);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(this.renderer.domElement);
    
    // Audio
    this.audioManager = new AudioManager();

    // Components
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);
    this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);
    
    this.galaxy = new Galaxy(this.scene);
    this.solarSystem = new SolarSystem(this.scene);
    this.starField = new StarField(this.scene);
    this.fluidSandbox = new FluidSandbox(this.scene);
    
    this.handTracker = new HandTracker();
    this.hud = new HUD();
    this.menu = new Menu(document.body);

    // Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Mouse Fallback
    this.mouse = { x: 0, y: 0, isDown: false };
    window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX / window.innerWidth;
        this.mouse.y = e.clientY / window.innerHeight;
    });
    window.addEventListener('mousedown', () => {
        this.mouse.isDown = true;
        if (this.gameState === 'MENU') {
             // Trigger click logic immediately for mouse
             const action = this.menu.updateCursor(this.mouse.x, this.mouse.y, true, this.audioManager);
             if (action) {
                 this.audioManager.playClick();
                 this.handleMenuAction(action);
             }
        }
    });
    window.addEventListener('mouseup', () => {
        this.mouse.isDown = false;
    });
    
    this.hud.onStart(() => {
        this.handTracker.start();
        this.hud.hideOverlay();
        this.menu.show(); // Show menu after init
        this.audioManager.startAmbient(); // Start music
    });

    this.animate();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.postProcessing.resize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const deltaTime = this.clock.getDelta();
    
    const leftHand = this.handTracker.leftHand;
    const rightHand = this.handTracker.rightHand;
    
    if (this.gameState === 'MENU') {
        // Use Right Hand OR Mouse for Cursor
        let cursorX = this.mouse.x;
        let cursorY = this.mouse.y;
        let isClicking = this.mouse.isDown;
        
        if (rightHand.present && rightHand.indexTip) {
            cursorX = rightHand.indexTip.x;
            cursorY = rightHand.indexTip.y;
            isClicking = rightHand.isPinching;
        }
        
        // Update cursor visual (pass false for click if using mouse, as we handle mousedown separately to avoid rapid fire)
        // Actually, for visual feedback, we want to show click state.
        // But for action triggering, we want single shot.
        // Menu.updateCursor returns action if hovering.
        
        // If using mouse, we handled click in event listener.
        // If using hand, we handle it here.
        
        if (rightHand.present) {
             const action = this.menu.updateCursor(cursorX, cursorY, isClicking, this.audioManager);
             if (action && isClicking) {
                 // Debounce? HandTracker might report pinch for multiple frames.
                 // Menu doesn't debounce.
                 // Let's rely on user un-pinching or add a simple debounce here if needed.
                 // For now, just trigger.
                 this.audioManager.playClick();
                 this.handleMenuAction(action);
             }
        } else {
            // Mouse Mode: Just update visual, click handled in mousedown
            this.menu.updateCursor(cursorX, cursorY, isClicking, this.audioManager);
        }
        
        this.postProcessing.render(); 
        return;
    }

    if (this.gameState === 'SANDBOX') {
        // Fluid Sandbox Logic
        this.fluidSandbox.update(deltaTime, rightHand);
        
        // Camera Control (Optional, maybe just orbit)
        this.cameraController.update(deltaTime, leftHand, rightHand);
        
        this.postProcessing.render();
        return;
    }

    // PLAYING STATE (Galaxy/Solar)
    const isTimeFrozen = rightHand.gesture === 'V_SIGN';
    
    if (!isTimeFrozen) {
        // Galaxy Physics
        this.galaxy.update(deltaTime, rightHand, false);
        
        // Solar System Interaction
        const planetHit = this.solarSystem.update(deltaTime, rightHand);
        
        if (planetHit) {
            this.audioManager.playSlap();
            this.addXP(50);
        }
        
        if (rightHand.gesture === 'FIST') {
            // Sucking particles
            this.addXP(10 * deltaTime);
            this.audioManager.startBlackHole();
        } else {
            this.audioManager.stopBlackHole();
            
            if (this.prevRightGesture === 'FIST') {
                // Burst!
                this.galaxy.burst(rightHand.position);
                this.solarSystem.burst();
                this.audioManager.playBurst();
            }
        }
    } else {
        this.galaxy.update(deltaTime, rightHand, true);
        this.audioManager.stopBlackHole(); // Stop if frozen
    }
    
    this.prevRightGesture = rightHand.gesture;

    // Camera Control
    this.cameraController.update(deltaTime, leftHand, rightHand);
    
    // HUD Updates
    const gestureString = `L:${leftHand.gesture} R:${rightHand.gesture}`;
    this.hud.update(this.xp, this.level, gestureString);

    // Render
    this.postProcessing.render();
  }

  handleMenuAction(action) {
      console.log("Menu Action:", action);
      
      if (action === 'explore') {
          this.menu.showGalaxySelect();
      } else if (action === 'back') {
          this.menu.showMainMenu();
      } else if (action.startsWith('galaxy_')) {
          const type = action.split('_')[1]; // spiral, ring, nebula
          this.galaxy.generate(type);
          
          this.gameState = 'PLAYING';
          this.menu.hide();
          this.hud.container.style.display = 'block';
          
          this.fluidSandbox.hide();
          this.galaxy.particles.visible = true;
          this.solarSystem.sun.visible = true; // Show solar system
          
      } else if (action === 'solar') {
          this.gameState = 'PLAYING';
          this.menu.hide();
          this.cameraController.targetZoom = 20;
          this.fluidSandbox.hide();
          this.galaxy.particles.visible = true;
      } else if (action === 'sandbox') {
          this.gameState = 'SANDBOX';
          this.menu.hide();
          this.fluidSandbox.show();
          
          // Hide other worlds
          this.galaxy.particles.visible = false;
          this.solarSystem.sun.visible = false;
          this.solarSystem.planets.forEach(p => p.mesh.visible = false);
      }
  }

  addXP(amount) {
      this.xp += amount;
      if (this.xp >= this.xpToNextLevel) {
          this.levelUp();
      }
  }

  levelUp() {
      this.level++;
      this.xp = 0;
      this.xpToNextLevel *= 1.5;
      this.galaxy.updateColor(this.level);
      this.audioManager.playLevelUp();
      console.log("Level Up! " + this.level);
  }
}
