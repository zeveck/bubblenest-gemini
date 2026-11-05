import * as THREE from 'three';
import { BettaMesh } from '../models/betta.js';
import { PIPE_WORLDS } from '../worlds/pipeWorldsData.js';
import { sound } from '../sound.js';

export class PipeScene {
  constructor(container, gameState, onTransition) {
    this.container = container;
    this.gameState = gameState;
    this.onTransition = onTransition; // callback ({ type: 'TANK', tankId } | { type: 'BUBBLE_ROOM' })

    this.scene = new THREE.Scene();

    // 2D orthographic camera view for the pipe network
    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = 16;
    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect / 2,
      viewSize * aspect / 2,
      viewSize / 2,
      -viewSize / 2,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(0, 0, 0);

    this.cellSize = 1.0;
    this.invulnerableTimer = 0;
    this.transitionCooldown = 1.4; // Grace period upon spawning to prevent immediate re-exit
    this.currentDir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };

    this.pellets = [];
    this.enemies = [];
    this.exits = [];
    this.portalMarkers = [];

    this.loadWorld(this.gameState.currentWorldId);
    this.setupInputs();
  }

  loadWorld(worldId) {
    this.worldData = PIPE_WORLDS[worldId] || PIPE_WORLDS[1];
    const theme = this.worldData.theme;

    this.scene.clear();
    this.pellets = [];
    this.enemies = [];
    this.exits = [];
    this.portalMarkers = [];

    this.scene.background = new THREE.Color(theme.waterColor);

    // Grid dimensions
    const grid = this.worldData.grid;
    this.rows = grid.length;
    this.cols = grid[0].length;
    this.originX = -(this.cols * this.cellSize) / 2 + this.cellSize / 2;
    this.originY = (this.rows * this.cellSize) / 2 - this.cellSize / 2;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, theme.ambientIntensity);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(0, 0, 10);
    this.scene.add(dirLight);

    // Wall Material
    const wallGeo = new THREE.BoxGeometry(this.cellSize, this.cellSize, 0.8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: theme.pipeWallColor,
      roughness: 0.5,
      metalness: 0.25
    });

    // Pipe Floor Material
    const floorGeo = new THREE.PlaneGeometry(this.cellSize, this.cellSize);
    const floorMat = new THREE.MeshBasicMaterial({
      color: theme.pipeColor,
      transparent: true,
      opacity: 0.38
    });

    // Pellet Material
    const pelletGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const pelletMat = new THREE.MeshStandardMaterial({
      color: 0xff7043,
      emissive: 0xff3d00,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });

    // Map of exits and default spawn location
    let defaultSpawn = { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) };
    const exitLocations = {};

    // Build grid tiles
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const char = grid[r][c];
        const posX = this.originX + c * this.cellSize;
        const posY = this.originY - r * this.cellSize;

        if (char === '#') {
          // Pipe boundary wall
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(posX, posY, 0);
          this.scene.add(wall);
        } else {
          // Pipe corridor floor
          const floor = new THREE.Mesh(floorGeo, floorMat);
          floor.position.set(posX, posY, -0.4);
          this.scene.add(floor);

          // Add food bite pellet
          if (char === '.') {
            const pellet = new THREE.Mesh(pelletGeo, pelletMat);
            pellet.position.set(posX, posY, 0);
            pellet.userData = { col: c, row: r };
            this.scene.add(pellet);
            this.pellets.push(pellet);
          }

          if (char === 'S') {
            defaultSpawn = { x: c, y: r };
          }

          // Exit / Portal Check
          if (this.worldData.exits[char]) {
            const exitInfo = this.worldData.exits[char];
            exitLocations[char] = { x: c, y: r, info: exitInfo };

            const isBubbleRoom = exitInfo.type === 'BUBBLE_ROOM';
            const ringColor = isBubbleRoom ? 0x00e5ff : 0x76ff03;

            // Visual Portal Rings
            const ringGeo = new THREE.RingGeometry(0.18, 0.46, 24);
            const ringMat = new THREE.MeshBasicMaterial({
              color: ringColor,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.85
            });
            const exitMesh = new THREE.Mesh(ringGeo, ringMat);
            exitMesh.position.set(posX, posY, 0.05);
            this.scene.add(exitMesh);

            // Pulsing inner vortex
            const innerGeo = new THREE.CircleGeometry(0.16, 16);
            const innerMat = new THREE.MeshBasicMaterial({
              color: ringColor,
              transparent: true,
              opacity: 0.4
            });
            const innerMesh = new THREE.Mesh(innerGeo, innerMat);
            innerMesh.position.set(posX, posY, 0.04);
            this.scene.add(innerMesh);

            const exitRecord = {
              char,
              col: c,
              row: r,
              info: exitInfo,
              mesh: exitMesh,
              innerMesh
            };

            this.exits.push(exitRecord);
            this.portalMarkers.push(exitRecord);
          }
        }
      }
    }

    // Determine Spawn Cell based on Entry Source
    let spawnCell = { ...defaultSpawn };
    const source = this.gameState.pipeEntrySource;

    if (source) {
      if (source.type === 'TANK') {
        const foundExit = this.exits.find(e => e.info.type === 'TANK' && e.info.tankId === source.tankId);
        if (foundExit) {
          spawnCell = { x: foundExit.col, y: foundExit.row };
        }
      } else if (source.type === 'BUBBLE_ROOM') {
        const foundExit = this.exits.find(e => e.char === 'B' || e.char === 'S');
        if (foundExit) {
          spawnCell = { x: foundExit.col, y: foundExit.row };
        }
      }
    }

    // Player Betta in 2D pipe mode
    this.playerFish = new BettaMesh(this.gameState.currentFishId, false, false);
    this.playerFish.scale.set(0.48, 0.48, 0.48);
    this.gridPos = { x: spawnCell.x, y: spawnCell.y };
    this.playerFish.position.set(
      this.originX + spawnCell.x * this.cellSize,
      this.originY - spawnCell.y * this.cellSize,
      0.1
    );
    this.scene.add(this.playerFish);

    // Setup Enemies
    this.setupEnemies();
  }

  setupEnemies() {
    const enemyType = this.worldData.enemyType;
    this.enemies = [];

    this.worldData.enemies.forEach(eConfig => {
      const group = new THREE.Group();

      let enemyMesh;
      if (this.worldData.id === 1) {
        // Water Beetle: Ellipsoid with tiny glowing shell
        const geo = new THREE.SphereGeometry(0.3, 10, 10);
        geo.scale(1.2, 0.8, 0.6);
        const mat = new THREE.MeshStandardMaterial({
          color: enemyType.color,
          emissive: enemyType.glowColor,
          emissiveIntensity: 0.6,
          roughness: 0.3
        });
        enemyMesh = new THREE.Mesh(geo, mat);
      } else if (this.worldData.id === 2) {
        // Electric Urchin: spiky dodecahedron
        const geo = new THREE.DodecahedronGeometry(0.32, 1);
        const mat = new THREE.MeshStandardMaterial({
          color: enemyType.color,
          emissive: enemyType.glowColor,
          emissiveIntensity: 0.75,
          wireframe: true
        });
        enemyMesh = new THREE.Mesh(geo, mat);
      } else {
        // Steam Crab: Octahedron
        const geo = new THREE.OctahedronGeometry(0.35);
        const mat = new THREE.MeshStandardMaterial({
          color: enemyType.color,
          emissive: enemyType.glowColor,
          emissiveIntensity: 0.65,
          metalness: 0.8,
          roughness: 0.2
        });
        enemyMesh = new THREE.Mesh(geo, mat);
      }

      group.add(enemyMesh);
      group.position.set(
        this.originX + eConfig.startX * this.cellSize,
        this.originY - eConfig.startY * this.cellSize,
        0.1
      );

      this.scene.add(group);

      this.enemies.push({
        group,
        col: eConfig.startX,
        row: eConfig.startY,
        dir: { ...eConfig.dir },
        speed: enemyType.speed,
        biteDamage: enemyType.biteDamage,
        moveProgress: 0
      });
    });
  }

  setupInputs() {
    const onKeyDown = (e) => {
      sound.ensureContext();
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          this.setDirection(0, -1);
          break;
        case 'arrowdown':
        case 's':
          this.setDirection(0, 1);
          break;
        case 'arrowleft':
        case 'a':
          this.setDirection(-1, 0);
          break;
        case 'arrowright':
        case 'd':
          this.setDirection(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);

    // Touch Swipe handling on screen
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e) => {
      const touch = e.touches[0];
      if (touch) {
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }
    };

    const onTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 25) {
        sound.ensureContext();
        if (absDx > absDy) {
          this.setDirection(dx > 0 ? 1 : -1, 0);
        } else {
          this.setDirection(0, dy > 0 ? 1 : -1);
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    this.cleanupInput = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }

  isWalkable(c, r) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;
    return this.worldData.grid[r][c] !== '#';
  }

  setDirection(x, y) {
    this.nextDir = { x, y };

    // Immediate 180-degree reversal
    if (this.currentDir.x === -x && this.currentDir.y === -y) {
      this.currentDir = { x, y };
      return;
    }

    // Direct turn if stopped
    if (this.currentDir.x === 0 && this.currentDir.y === 0) {
      const testCol = Math.round(this.gridPos.x) + x;
      const testRow = Math.round(this.gridPos.y) + y;
      if (this.isWalkable(testCol, testRow)) {
        this.gridPos.x = Math.round(this.gridPos.x);
        this.gridPos.y = Math.round(this.gridPos.y);
        this.currentDir = { x, y };
      }
    }
  }

  update(delta) {
    const currentFish = this.gameState.getCurrentFish();
    const fishSpeed = 4.2 * (currentFish.speed || 1.0);

    // 1. Timers
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      this.playerFish.visible = Math.floor(Date.now() / 100) % 2 === 0;
    } else {
      this.playerFish.visible = true;
    }

    if (this.transitionCooldown > 0) {
      this.transitionCooldown -= delta;
    }

    // 2. Pac-Man style corner turning assist
    if (this.nextDir.x !== 0 || this.nextDir.y !== 0) {
      // Trying to turn 90 degrees
      if (this.nextDir.x !== 0 && this.currentDir.y !== 0) {
        // Currently moving vertically, wants to turn horizontally
        const roundedRow = Math.round(this.gridPos.y);
        if (Math.abs(this.gridPos.y - roundedRow) < 0.38) {
          const testCol = Math.round(this.gridPos.x) + this.nextDir.x;
          if (this.isWalkable(testCol, roundedRow)) {
            this.gridPos.y = roundedRow;
            this.currentDir = { ...this.nextDir };
          }
        }
      } else if (this.nextDir.y !== 0 && this.currentDir.x !== 0) {
        // Currently moving horizontally, wants to turn vertically
        const roundedCol = Math.round(this.gridPos.x);
        if (Math.abs(this.gridPos.x - roundedCol) < 0.38) {
          const testRow = Math.round(this.gridPos.y) + this.nextDir.y;
          if (this.isWalkable(roundedCol, testRow)) {
            this.gridPos.x = roundedCol;
            this.currentDir = { ...this.nextDir };
          }
        }
      }
    }

    // 3. Move player fish along current direction
    if (this.currentDir.x !== 0 || this.currentDir.y !== 0) {
      const step = fishSpeed * delta;
      const nextX = this.gridPos.x + this.currentDir.x * step;
      const nextY = this.gridPos.y + this.currentDir.y * step;

      const checkC = Math.round(nextX + this.currentDir.x * 0.42);
      const checkR = Math.round(nextY + this.currentDir.y * 0.42);

      if (this.isWalkable(checkC, checkR)) {
        this.gridPos.x = nextX;
        this.gridPos.y = nextY;
      } else {
        // Stop at tile center
        this.gridPos.x = Math.round(this.gridPos.x);
        this.gridPos.y = Math.round(this.gridPos.y);
        this.currentDir = { x: 0, y: 0 };
      }

      // Rotate fish towards movement direction
      let targetRot = 0;
      if (this.currentDir.x > 0) targetRot = 0;
      else if (this.currentDir.x < 0) targetRot = Math.PI;
      else if (this.currentDir.y < 0) targetRot = Math.PI / 2;
      else if (this.currentDir.y > 0) targetRot = -Math.PI / 2;

      this.playerFish.rotation.z = THREE.MathUtils.lerp(this.playerFish.rotation.z, targetRot, 0.28);
    }

    // Update 3D position of player fish in scene
    this.playerFish.position.x = this.originX + this.gridPos.x * this.cellSize;
    this.playerFish.position.y = this.originY - this.gridPos.y * this.cellSize;
    this.playerFish.update(delta, this.currentDir.x !== 0 || this.currentDir.y !== 0);

    // 4. Betta Bites pellet collection
    for (let i = this.pellets.length - 1; i >= 0; i--) {
      const pellet = this.pellets[i];
      const d = this.playerFish.position.distanceTo(pellet.position);
      if (d < 0.48) {
        sound.playBiteSound();
        this.gameState.addBite(1);
        this.scene.remove(pellet);
        this.pellets.splice(i, 1);
      }
    }

    // 5. Update and patrol enemies
    this.enemies.forEach(enemy => {
      const step = enemy.speed * delta;
      const targetC = enemy.col + enemy.dir.x;
      const targetR = enemy.row + enemy.dir.y;

      if (this.isWalkable(targetC, targetR)) {
        enemy.moveProgress += step;
        if (enemy.moveProgress >= 1.0) {
          enemy.col = targetC;
          enemy.row = targetR;
          enemy.moveProgress = 0;

          // Junction turn choice
          const validDirs = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
          ].filter(d => this.isWalkable(enemy.col + d.x, enemy.row + d.y));

          if (validDirs.length > 0) {
            enemy.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
          }
        }
      } else {
        // Bounce / Turn around
        const validDirs = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 }
        ].filter(d => this.isWalkable(enemy.col + d.x, enemy.row + d.y));

        if (validDirs.length > 0) {
          enemy.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
        } else {
          enemy.dir.x *= -1;
          enemy.dir.y *= -1;
        }
        enemy.moveProgress = 0;
      }

      // Smooth enemy position
      const currentX = this.originX + (enemy.col + enemy.dir.x * enemy.moveProgress) * this.cellSize;
      const currentY = this.originY - (enemy.row + enemy.dir.y * enemy.moveProgress) * this.cellSize;
      enemy.group.position.set(currentX, currentY, 0.1);
      enemy.group.rotation.z += delta * 3;

      // Enemy collision check with player
      if (this.invulnerableTimer <= 0) {
        const dist = this.playerFish.position.distanceTo(enemy.group.position);
        if (dist < 0.5) {
          sound.playHurtSound();
          this.gameState.loseBites(enemy.biteDamage);
          this.invulnerableTimer = 1.6; // 1.6s grace period
        }
      }
    });

    // 6. Pulse Portal Rings and Check Exits
    const currentGridC = Math.round(this.gridPos.x);
    const currentGridR = Math.round(this.gridPos.y);

    this.portalMarkers.forEach(portal => {
      portal.mesh.rotation.z += delta * 2.2;
      const scale = 1.0 + Math.sin(Date.now() * 0.005) * 0.1;
      portal.mesh.scale.set(scale, scale, 1);
    });

    // Only allow transition if cooldown has elapsed
    if (this.transitionCooldown <= 0) {
      for (const exit of this.exits) {
        if (exit.col === currentGridC && exit.row === currentGridR) {
          // Trigger exit!
          if (this.onTransition) {
            this.transitionCooldown = 2.0;
            this.onTransition(exit.info);
            break;
          }
        }
      }
    }
  }

  render(renderer) {
    renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.cleanupInput) this.cleanupInput();
  }
}
