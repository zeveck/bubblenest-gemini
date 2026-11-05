import { sound } from '../sound.js';
import { PIPE_WORLDS } from '../worlds/pipeWorldsData.js';

export class HUD {
  constructor(gameState, onOpenDex, onBuildNest, onSwitchToFry, onDpadInput) {
    this.gameState = gameState;
    this.onOpenDex = onOpenDex;
    this.onBuildNest = onBuildNest;
    this.onSwitchToFry = onSwitchToFry;
    this.onDpadInput = onDpadInput;

    this.createDom();
    this.gameState.subscribe(() => this.update());
  }

  createDom() {
    this.container = document.createElement('div');
    this.container.className = 'game-hud';

    this.container.innerHTML = `
      <!-- Top Navigation Header -->
      <div class="hud-top-bar">
        <div class="hud-left">
          <div class="hud-pill bites-counter" title="Betta Bites available">
            <span class="bite-icon">🔴</span>
            <span id="hud-bites-val" class="bite-val">0</span>
            <span class="bite-label">Bites</span>
          </div>

          <div class="hud-pill fish-badge" id="hud-fish-badge" title="Active Betta Variety">
            <span id="fish-dot" class="fish-dot"></span>
            <span id="hud-fish-name">Cobalt Halfmoon</span>
          </div>

          <div class="hud-pill location-badge" id="hud-loc-badge">
            <span id="hud-loc-icon">🏠</span>
            <span id="hud-loc-name">Home Tank</span>
          </div>
        </div>

        <div class="hud-right">
          <button id="dex-btn" class="hud-btn primary" title="View Betta Encyclopedia">
            <span>🐠 Betta Dex</span>
            <span id="hud-dex-count" class="badge">1/20</span>
          </button>

          <button id="sound-btn" class="hud-btn icon-btn" title="Toggle Sound">
            🔊
          </button>

          <button id="help-btn" class="hud-btn icon-btn" title="How to Play">
            ❓
          </button>
        </div>
      </div>

      <!-- Notification Toast -->
      <div id="hud-toast" class="hud-toast" style="display:none;"></div>

      <!-- Action Panel (Bottom Center) -->
      <div class="hud-action-panel" id="action-panel">
        <div id="tank-actions" class="action-card">
          <div class="action-card-title" id="tank-name-header">Tank Sanctuary</div>
          <div class="action-card-desc" id="tank-desc-body">Explore the aquarium, eat bites, or swim into the tube above!</div>
          <div id="nest-action-area" class="nest-area"></div>
        </div>

        <div id="pipe-hint" class="pipe-hint-card" style="display:none;">
          <div class="pipe-header">
            <span id="pipe-world-title">Sunlit Coral Tubes</span>
            <span class="pipe-sub">Munch bites, dodge enemies, find portals!</span>
          </div>
        </div>

        <div id="bubble-hint" class="bubble-hint-card" style="display:none;">
          <div class="bubble-header">🫧 Anti-Gravity Bubble Chamber</div>
          <div class="bubble-sub">Float around the room in 3D. Click or approach one of the 3 glowing ports to enter that Pipe World!</div>
        </div>
      </div>

      <!-- Virtual D-Pad for Mobile / Casual Controls in Pipe Mode -->
      <div class="dpad-container" id="dpad" style="display:none;">
        <button class="dpad-btn up" data-dir="up">▲</button>
        <div class="dpad-middle">
          <button class="dpad-btn left" data-dir="left">◀</button>
          <div class="dpad-center"></div>
          <button class="dpad-btn right" data-dir="right">▶</button>
        </div>
        <button class="dpad-btn down" data-dir="down">▼</button>
      </div>

      <!-- Help Modal -->
      <div id="help-modal" class="help-modal-backdrop" style="display:none;">
        <div class="help-card">
          <div class="help-header">
            <h3>🎮 How to Play Betta Odyssey</h3>
            <button id="close-help-btn" class="close-btn">&times;</button>
          </div>
          <div class="help-body">
            <p><strong>3D Tanks:</strong> Use your mouse, touch, or WASD to steer your Betta freely in 3D. Nibble floating red Betta Bites on the surface. Swim up into the clear ceiling tube to enter the pipe network!</p>
            <p><strong>2D Pipe Network:</strong> Navigate the maze using Arrow keys, WASD, touch swipe, or the on-screen D-Pad. Eat bites Pac-Man style and avoid bumping into patrolling enemies. Reaching pipe ends transports you to other tanks or the Bubble Room!</p>
            <p><strong>Sanctuaries & Breeding:</strong> Empty tanks can be claimed by blowing a Bubble Nest. In tanks with a female Betta, building a bubble nest lays eggs! Eat more bites to hatch and grow fry. Once grown, switch into that fry to collect all 20 unique Bettas!</p>
            <p><strong>Anti-Gravity Bubble Room:</strong> Float freely in 3D inside an anti-gravity water bubble around a cozy room. Click or float into ports to travel between the 3 distinct Pipe Worlds!</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Button event listeners
    this.container.querySelector('#dex-btn').addEventListener('click', () => {
      sound.ensureContext();
      if (this.onOpenDex) this.onOpenDex();
    });

    const soundBtn = this.container.querySelector('#sound-btn');
    soundBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      soundBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    const helpModal = this.container.querySelector('#help-modal');
    this.container.querySelector('#help-btn').addEventListener('click', () => {
      helpModal.style.display = 'flex';
    });
    this.container.querySelector('#close-help-btn').addEventListener('click', () => {
      helpModal.style.display = 'none';
    });
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) helpModal.style.display = 'none';
    });

    // D-Pad handlers
    const dpadButtons = this.container.querySelectorAll('.dpad-btn');
    dpadButtons.forEach(btn => {
      const dir = btn.getAttribute('data-dir');
      const handlePress = (e) => {
        e.preventDefault();
        sound.ensureContext();
        if (this.onDpadInput) {
          if (dir === 'up') this.onDpadInput(0, -1);
          if (dir === 'down') this.onDpadInput(0, 1);
          if (dir === 'left') this.onDpadInput(-1, 0);
          if (dir === 'right') this.onDpadInput(1, 0);
        }
      };
      btn.addEventListener('pointerdown', handlePress);
    });

    this.update();
  }

  showToast(text, duration = 3000) {
    const toast = this.container.querySelector('#hud-toast');
    toast.textContent = text;
    toast.style.display = 'block';
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, duration);
  }

  update() {
    const currentFish = this.gameState.getCurrentFish();
    const tank = this.gameState.getCurrentTank();
    const mode = this.gameState.currentMode;

    // 1. Header Values
    this.container.querySelector('#hud-bites-val').textContent = this.gameState.bites;
    this.container.querySelector('#hud-fish-name').textContent = currentFish.name;
    const fishDot = this.container.querySelector('#fish-dot');
    fishDot.style.backgroundColor = '#' + currentFish.colors.fins.toString(16).padStart(6, '0');

    this.container.querySelector('#hud-dex-count').textContent =
      `${this.gameState.unlockedFishIds.length}/20`;

    // 2. Mode & Location Displays
    const locIcon = this.container.querySelector('#hud-loc-icon');
    const locName = this.container.querySelector('#hud-loc-name');
    const tankActions = this.container.querySelector('#tank-actions');
    const pipeHint = this.container.querySelector('#pipe-hint');
    const bubbleHint = this.container.querySelector('#bubble-hint');
    const dpad = this.container.querySelector('#dpad');

    if (mode === 'TANK') {
      locIcon.textContent = '🏠';
      locName.textContent = tank.name;
      tankActions.style.display = 'block';
      pipeHint.style.display = 'none';
      bubbleHint.style.display = 'none';
      dpad.style.display = 'none';

      this.updateTankPanel(tank);
    } else if (mode === 'PIPE') {
      const world = PIPE_WORLDS[this.gameState.currentWorldId] || PIPE_WORLDS[1];
      locIcon.textContent = '🌀';
      locName.textContent = world.name;
      tankActions.style.display = 'none';
      pipeHint.style.display = 'block';
      bubbleHint.style.display = 'none';
      dpad.style.display = 'flex';

      this.container.querySelector('#pipe-world-title').textContent = world.name;
    } else if (mode === 'BUBBLE_ROOM') {
      locIcon.textContent = '🫧';
      locName.textContent = 'Bubble Transporter Chamber';
      tankActions.style.display = 'none';
      pipeHint.style.display = 'none';
      bubbleHint.style.display = 'block';
      dpad.style.display = 'none';
    }
  }

  updateTankPanel(tank) {
    this.container.querySelector('#tank-name-header').textContent = tank.name;
    this.container.querySelector('#tank-desc-body').textContent = tank.description;

    const nestArea = this.container.querySelector('#nest-action-area');
    nestArea.innerHTML = '';

    const cost = this.gameState.getNestCost(tank);
    const canAfford = this.gameState.bites >= cost;

    if (!tank.claimed) {
      // Unclaimed tank
      const claimBtn = document.createElement('button');
      claimBtn.className = `btn ${canAfford ? 'primary-btn' : 'disabled-btn'}`;
      claimBtn.innerHTML = tank.hasFemale
        ? `🫧 Build Bubble Nest (${cost} Bites)`
        : `🫧 Claim Sanctuary: Build Bubble Nest (${cost} Bites)`;
      claimBtn.disabled = !canAfford;

      claimBtn.addEventListener('click', () => {
        if (this.onBuildNest) this.onBuildNest();
      });

      nestArea.appendChild(claimBtn);
    } else if (tank.bubbleNest && tank.bubbleNest.built) {
      const nest = tank.bubbleNest;
      const progressBox = document.createElement('div');
      progressBox.className = 'nest-progress-box';

      if (!nest.fryGrown) {
        if (nest.hatchProgress < nest.hatchBitesNeeded) {
          const pct = Math.min(100, (nest.hatchProgress / nest.hatchBitesNeeded) * 100);
          progressBox.innerHTML = `
            <div class="progress-title">🥚 Incubation in Bubble Nest</div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${pct}%"></div>
            </div>
            <div class="progress-sub">${nest.hatchProgress} / ${nest.hatchBitesNeeded} bites eaten to hatch eggs</div>
          `;
        } else {
          const pct = Math.min(100, (nest.growProgress / nest.growBitesNeeded) * 100);
          progressBox.innerHTML = `
            <div class="progress-title">🐟 Baby Fry is Growing!</div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${pct}%"></div>
            </div>
            <div class="progress-sub">${nest.growProgress} / ${nest.growBitesNeeded} bites eaten to mature fry</div>
          `;
        }
      } else {
        progressBox.innerHTML = `
          <div class="progress-title success">✨ Fry has Matured into an Adult Betta!</div>
          <button id="switch-fry-btn" class="btn success-btn">Swim as this Betta (Claim to Betta Dex!)</button>
        `;
        progressBox.querySelector('#switch-fry-btn').addEventListener('click', () => {
          if (this.onSwitchToFry) this.onSwitchToFry(nest.fryFishId);
        });
      }

      nestArea.appendChild(progressBox);
    } else {
      // Claimed tank without active nest
      const hasUndiscovered = this.gameState.unlockedFishIds.length < 20;
      if (hasUndiscovered) {
        const nestBtn = document.createElement('button');
        nestBtn.className = `btn ${canAfford ? 'primary-btn' : 'disabled-btn'}`;
        nestBtn.innerHTML = `🫧 Build Bubble Nest (${cost} Bites) - Breed Next Betta`;
        nestBtn.disabled = !canAfford;

        nestBtn.addEventListener('click', () => {
          if (this.onBuildNest) this.onBuildNest();
        });

        nestArea.appendChild(nestBtn);
      } else {
        const ownedBadge = document.createElement('div');
        ownedBadge.className = 'claimed-badge';
        ownedBadge.textContent = '🏆 All 20 Bettas Collected! Claimed Sanctuary';
        nestArea.appendChild(ownedBadge);
      }
    }
  }
}
