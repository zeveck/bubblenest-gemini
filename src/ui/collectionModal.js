import * as THREE from 'three';
import { BETTA_VARIETIES } from '../models/bettaTypes.js';
import { BettaMesh } from '../models/betta.js';
import { sound } from '../sound.js';

export class CollectionModal {
  constructor(gameState, onSelectFish) {
    this.gameState = gameState;
    this.onSelectFish = onSelectFish;
    this.isOpen = false;
    this.selectedFishId = gameState.currentFishId;

    this.createDom();
    this.setupPreviewRenderer();
  }

  createDom() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'collection-modal-backdrop';
    this.modalEl.style.display = 'none';

    this.modalEl.innerHTML = `
      <div class="collection-modal">
        <div class="modal-header">
          <h2>🐠 Betta Encyclopedia & Collection (<span id="unlocked-count">1</span>/20)</h2>
          <button id="close-modal-btn" class="close-btn">&times;</button>
        </div>
        <div id="master-banner" class="master-banner" style="display:none;">
          👑 GRAND BETTA MASTER! You have bred and collected all 20 legendary Betta varieties!
        </div>
        <div class="modal-body">
          <div class="fish-grid-container" id="fish-grid"></div>
          <div class="fish-details-panel">
            <div id="preview-canvas-container" class="preview-3d"></div>
            <h3 id="detail-name">Cobalt Halfmoon</h3>
            <div id="detail-title" class="detail-subtitle">The Regal Starter</div>
            <p id="detail-desc">Royal blue with a full 180-degree spread caudal fin.</p>
            <div class="stat-badge" id="detail-bonus">Bonus: Standard balanced swimmer</div>
            <div class="action-row">
              <button id="select-fish-btn" class="btn primary-btn">Swim as this Betta</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    this.modalEl.querySelector('#close-modal-btn').addEventListener('click', () => this.close());
    this.modalEl.querySelector('#select-fish-btn').addEventListener('click', () => {
      if (this.gameState.switchFish(this.selectedFishId)) {
        sound.playBubbleSound();
        if (this.onSelectFish) this.onSelectFish(this.selectedFishId);
        this.renderGrid();
        this.updateDetails(this.selectedFishId);
      }
    });

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });
  }

  setupPreviewRenderer() {
    const container = this.modalEl.querySelector('#preview-canvas-container');
    this.previewScene = new THREE.Scene();
    this.previewScene.background = new THREE.Color(0x0e1b2a);

    this.previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    this.previewCamera.position.set(0, 0, 4.2);

    const light1 = new THREE.DirectionalLight(0xffffff, 1.3);
    light1.position.set(2, 4, 3);
    this.previewScene.add(light1);

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.previewScene.add(ambient);

    this.previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.previewRenderer.setSize(220, 220);
    container.appendChild(this.previewRenderer.domElement);
  }

  open() {
    this.isOpen = true;
    this.modalEl.style.display = 'flex';
    this.renderGrid();
    this.updateDetails(this.gameState.currentFishId);
    this.startPreviewLoop();
  }

  close() {
    this.isOpen = false;
    this.modalEl.style.display = 'none';
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  renderGrid() {
    const grid = this.modalEl.querySelector('#fish-grid');
    grid.innerHTML = '';
    const unlocked = this.gameState.unlockedFishIds;
    this.modalEl.querySelector('#unlocked-count').textContent = unlocked.length;

    const masterBanner = this.modalEl.querySelector('#master-banner');
    if (unlocked.length >= 20) {
      masterBanner.style.display = 'block';
    } else {
      masterBanner.style.display = 'none';
    }

    BETTA_VARIETIES.forEach(v => {
      const isUnlocked = unlocked.includes(v.id);
      const isCurrent = this.gameState.currentFishId === v.id;
      const isSelected = this.selectedFishId === v.id;

      const card = document.createElement('div');
      card.className = `fish-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'active' : ''} ${isSelected ? 'selected' : ''}`;

      const hexColor = '#' + v.colors.fins.toString(16).padStart(6, '0');
      card.innerHTML = `
        <div class="card-badge" style="background-color: ${isUnlocked ? hexColor : '#444'}"></div>
        <div class="card-info">
          <div class="card-num">#${v.id.toString().padStart(2, '0')}</div>
          <div class="card-name">${isUnlocked ? v.name : '??? Locked'}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (isUnlocked) {
          this.selectedFishId = v.id;
          this.updateDetails(v.id);
          this.renderGrid();
        }
      });

      grid.appendChild(card);
    });
  }

  updateDetails(fishId) {
    const fish = BETTA_VARIETIES.find(v => v.id === fishId) || BETTA_VARIETIES[0];
    this.selectedFishId = fish.id;

    this.modalEl.querySelector('#detail-name').textContent = fish.name;
    this.modalEl.querySelector('#detail-title').textContent = fish.title;
    this.modalEl.querySelector('#detail-desc').textContent = fish.description;
    this.modalEl.querySelector('#detail-bonus').textContent = `Bonus: ${fish.bonus}`;

    const selectBtn = this.modalEl.querySelector('#select-fish-btn');
    if (this.gameState.currentFishId === fish.id) {
      selectBtn.textContent = 'Currently Swimming';
      selectBtn.disabled = true;
    } else {
      selectBtn.textContent = 'Swim as this Betta';
      selectBtn.disabled = false;
    }

    // Refresh 3D preview model
    if (this.previewFish) {
      this.previewScene.remove(this.previewFish);
    }
    this.previewFish = new BettaMesh(fish.id, false, false);
    this.previewFish.scale.set(1.2, 1.2, 1.2);
    this.previewScene.add(this.previewFish);
  }

  startPreviewLoop() {
    const loop = () => {
      if (!this.isOpen) return;
      if (this.previewFish) {
        this.previewFish.rotation.y += 0.015;
        this.previewFish.update(0.016, true);
      }
      this.previewRenderer.render(this.previewScene, this.previewCamera);
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }
}
