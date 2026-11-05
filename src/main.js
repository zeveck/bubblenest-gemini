import * as THREE from 'three';
import { gameState } from './state.js';
import { sound } from './sound.js';
import { TankScene } from './scenes/tankScene.js';
import { PipeScene } from './scenes/pipeScene.js';
import { BubbleRoomScene } from './scenes/bubbleRoomScene.js';
import { HUD } from './ui/hud.js';
import { CollectionModal } from './ui/collectionModal.js';
import { BETTA_VARIETIES } from './models/bettaTypes.js';

class GameApp {
  constructor() {
    this.container = document.getElementById('game-container');
    this.gameState = gameState;
    this.clock = new THREE.Clock();
    this.activeScene = null;
    this.activeSceneType = null;

    this.initRenderer();
    this.initUI();
    this.setupResizeHandler();

    // Start in the Home Tank!
    this.switchToTank(0);

    // Initial greeting toast
    setTimeout(() => {
      this.hud.showToast("Welcome to Betta Odyssey! Nibble bites & swim into the tube!", 4500);
    }, 500);

    // Monitor breeding milestones
    this.lastHatchedCount = 0;
    this.lastGrownCount = 0;
    gameState.subscribe(() => this.checkBreedingMilestones());

    // Main animation loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);
  }

  initUI() {
    this.collectionModal = new CollectionModal(gameState, (selectedFishId) => {
      const fish = BETTA_VARIETIES.find(b => b.id === selectedFishId);
      this.hud.showToast(`Switched to: ${fish.name}!`, 3000);
      if (this.activeSceneType === 'TANK' && this.activeScene) {
        this.activeScene.refreshFishModel();
      } else if (this.activeSceneType === 'PIPE' && this.activeScene) {
        this.switchToPipe(gameState.currentWorldId);
      }
    });

    this.hud = new HUD(
      gameState,
      // Open Dex
      () => this.collectionModal.open(),
      // Build Nest
      () => this.handleBuildNest(),
      // Switch to matured fry
      (fryFishId) => this.handleSwitchToFry(fryFishId),
      // D-Pad input for 2D pipes
      (dx, dy) => {
        if (this.activeSceneType === 'PIPE' && this.activeScene) {
          this.activeScene.setDirection(dx, dy);
        }
      }
    );
  }

  handleBuildNest() {
    const tank = gameState.getCurrentTank();
    const wasEmpty = !tank.hasFemale;

    if (gameState.buildNest()) {
      sound.playBubbleSound();
      if (wasEmpty) {
        this.hud.showToast(`Sanctuary claimed! A visiting female Betta arrived at your nest!`, 4000);
      } else {
        this.hud.showToast(`Bubble nest constructed! Eggs have been nestled inside.`, 3500);
      }

      if (this.activeSceneType === 'TANK' && this.activeScene) {
        this.activeScene.setupFemaleFish();
        this.activeScene.setupNest();
      }
    } else {
      const cost = gameState.getNestCost(tank);
      this.hud.showToast(`Need ${cost} bites to construct a bubble nest!`, 2500);
    }
  }

  handleSwitchToFry(fryFishId) {
    if (gameState.claimFryAndSwitch(fryFishId)) {
      sound.playHatchSound();
      const fish = BETTA_VARIETIES.find(b => b.id === gameState.currentFishId);
      this.hud.showToast(`🎉 You are now swimming as: ${fish.name}! Added to Betta Dex!`, 4500);
      if (this.activeSceneType === 'TANK' && this.activeScene) {
        this.activeScene.refreshFishModel();
        this.activeScene.setupFemaleFish();
        this.activeScene.setupNest();
      }
    }
  }

  checkBreedingMilestones() {
    let hatched = 0;
    let grown = 0;
    gameState.tanks.forEach(t => {
      if (t.bubbleNest && t.bubbleNest.hasEggs) {
        if (t.bubbleNest.hatchProgress >= t.bubbleNest.hatchBitesNeeded) hatched++;
        if (t.bubbleNest.fryGrown) grown++;
      }
    });

    if (hatched > this.lastHatchedCount) {
      sound.playHatchSound();
      this.hud.showToast("🐣 Eggs hatched! A tiny baby fry is swimming near the bubble nest!", 4000);
      this.lastHatchedCount = hatched;
      if (this.activeSceneType === 'TANK' && this.activeScene) {
        this.activeScene.setupNest();
      }
    }

    if (grown > this.lastGrownCount) {
      sound.playHatchSound();
      this.hud.showToast("✨ The baby fry has fully matured into an adult Betta!", 4500);
      this.lastGrownCount = grown;
      if (this.activeSceneType === 'TANK' && this.activeScene) {
        this.activeScene.setupNest();
      }
    }
  }

  switchToTank(tankId) {
    if (this.activeScene) {
      this.activeScene.destroy();
    }
    gameState.setTank(tankId);
    this.activeSceneType = 'TANK';

    this.activeScene = new TankScene(
      this.container,
      gameState,
      // onEnterPipe
      () => {
        this.hud.showToast("Swimming up into the pipe network...", 2500);
        this.switchToPipe(gameState.currentWorldId, { type: 'TANK', tankId: gameState.currentTankId });
      }
    );

    this.onWindowResize();
  }

  switchToPipe(worldId = 1, source = null) {
    if (this.activeScene) {
      this.activeScene.destroy();
    }
    if (source) {
      gameState.setPipeEntrySource(source);
    }
    gameState.setWorld(worldId);
    gameState.setMode('PIPE');
    this.activeSceneType = 'PIPE';

    this.activeScene = new PipeScene(
      this.container,
      gameState,
      // onTransition
      (exitInfo) => {
        if (exitInfo.type === 'TANK') {
          sound.playPipeEnterSound();
          this.hud.showToast(`Exiting pipe into ${exitInfo.label}...`, 2500);
          this.switchToTank(exitInfo.tankId);
        } else if (exitInfo.type === 'BUBBLE_ROOM') {
          sound.playBubbleSound();
          this.hud.showToast("Entering the Bubble Transporter Chamber...", 2500);
          this.switchToBubbleRoom();
        }
      }
    );

    this.onWindowResize();
  }

  switchToBubbleRoom() {
    if (this.activeScene) {
      this.activeScene.destroy();
    }
    gameState.setMode('BUBBLE_ROOM');
    this.activeSceneType = 'BUBBLE_ROOM';

    this.activeScene = new BubbleRoomScene(
      this.container,
      gameState,
      // onDock
      (targetWorldId) => {
        this.hud.showToast(`Docked! Transporting to World ${targetWorldId} Pipes...`, 2500);
        this.switchToPipe(targetWorldId, { type: 'BUBBLE_ROOM' });
      }
    );

    this.onWindowResize();
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    this.renderer.setSize(width, height);

    if (this.activeScene && this.activeScene.camera) {
      const cam = this.activeScene.camera;
      if (cam.isPerspectiveCamera) {
        cam.aspect = aspect;
        cam.updateProjectionMatrix();
      } else if (cam.isOrthographicCamera) {
        const viewSize = 16;
        cam.left = -viewSize * aspect / 2;
        cam.right = viewSize * aspect / 2;
        cam.top = viewSize / 2;
        cam.bottom = -viewSize / 2;
        cam.updateProjectionMatrix();
      }
    }
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (this.activeScene) {
      this.activeScene.update(delta);
      this.activeScene.render(this.renderer);
    }
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
