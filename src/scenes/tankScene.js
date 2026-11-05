import * as THREE from 'three';
import { BettaMesh } from '../models/betta.js';
import { sound } from '../sound.js';

export class TankScene {
  constructor(container, gameState, onEnterPipe) {
    this.container = container;
    this.gameState = gameState;
    this.onEnterPipe = onEnterPipe;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 1.8, 8.5);

    // Tank dimensions (in world units)
    this.bounds = {
      minX: -4.2,
      maxX: 4.2,
      minY: -2.3,
      maxY: 3.2,
      minZ: -2.8,
      maxZ: 2.8
    };

    // Target position for swimming
    this.targetPos = new THREE.Vector3(0, 0, 0);
    this.isMouseDown = false;
    this.keyState = {};
    this.enteringPipe = false;
    this.enterPipeTimer = 0;

    // Interactive entities
    this.bites = [];
    this.bubblePool = [];
    this.plants = [];
    this.femaleMesh = null;
    this.fryMesh = null;
    this.bubbleNestGroup = null;

    this.setupLighting();
    this.setupEnvironment();
    this.setupPlayerFish();
    this.setupFemaleFish();
    this.setupNest();
    this.setupTube();
    this.spawnBites(8);
    this.setupAirStone();
    this.setupInputListeners();
  }

  setupLighting() {
    // Soft aquatic ambient light
    const ambientLight = new THREE.AmbientLight(0xd4f1f4, 0.75);
    this.scene.add(ambientLight);

    // Overhead aquarium tank LED light
    this.tankLight = new THREE.DirectionalLight(0xffffff, 1.45);
    this.tankLight.position.set(0, 7, 1);
    this.scene.add(this.tankLight);

    // Subtle blue underwater point light
    this.waterPointLight = new THREE.PointLight(0x00bcd4, 0.85, 15);
    this.waterPointLight.position.set(0, 1, 0);
    this.scene.add(this.waterPointLight);
  }

  setupEnvironment() {
    const tank = this.gameState.getCurrentTank();
    this.scene.background = new THREE.Color(tank.waterColor || 0x1a5276);
    this.scene.fog = new THREE.FogExp2(tank.waterColor || 0x1a5276, 0.05);

    // Aquarium Glass Frame
    const glassGeo = new THREE.BoxGeometry(9.4, 6.4, 6.4);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 0.25,
      transparent: true,
      roughness: 0.05,
      metalness: 0.05,
      side: THREE.BackSide
    });
    this.glassMesh = new THREE.Mesh(glassGeo, glassMat);
    this.glassMesh.position.set(0, 0.5, 0);
    this.scene.add(this.glassMesh);

    // Gravel bed
    const gravelGeo = new THREE.BoxGeometry(9.4, 0.8, 6.4);
    const gravelMat = new THREE.MeshStandardMaterial({
      color: tank.gravelColor || 0x3d405b,
      roughness: 0.9,
      metalness: 0.1
    });
    const gravel = new THREE.Mesh(gravelGeo, gravelMat);
    gravel.position.set(0, -2.8, 0);
    this.scene.add(gravel);

    // Water Surface Shimmer
    const surfaceGeo = new THREE.PlaneGeometry(9.2, 6.2, 16, 16);
    surfaceGeo.rotateX(-Math.PI / 2);
    const surfaceMat = new THREE.MeshPhysicalMaterial({
      color: 0x76d7c4,
      transmission: 0.75,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.2
    });
    this.waterSurface = new THREE.Mesh(surfaceGeo, surfaceMat);
    this.waterSurface.position.set(0, 3.4, 0);
    this.scene.add(this.waterSurface);

    // Aquatic Plants
    this.createPlants(tank.plantCount || 6);
  }

  createPlants(count) {
    this.plants = [];
    for (let i = 0; i < count; i++) {
      const plantGroup = new THREE.Group();
      const x = (Math.random() - 0.5) * 7.5;
      const z = (Math.random() - 0.5) * 4.5;
      const stemCount = 5 + Math.floor(Math.random() * 4);

      const plantColor = new THREE.Color().setHSL(0.3 + Math.random() * 0.08, 0.75, 0.35);
      const plantMat = new THREE.MeshStandardMaterial({
        color: plantColor,
        roughness: 0.6,
        side: THREE.DoubleSide
      });

      for (let s = 0; s < stemCount; s++) {
        const height = 1.8 + Math.random() * 2.2;
        const leafGeo = new THREE.CylinderGeometry(0.02, 0.08, height, 5);
        leafGeo.rotateZ((Math.random() - 0.5) * 0.25);
        const leaf = new THREE.Mesh(leafGeo, plantMat);
        leaf.position.set((Math.random() - 0.5) * 0.3, height / 2 - 2.4, (Math.random() - 0.5) * 0.3);
        plantGroup.add(leaf);
      }

      plantGroup.position.set(x, 0, z);
      this.scene.add(plantGroup);
      this.plants.push({ group: plantGroup, seed: Math.random() * 10 });
    }
  }

  setupAirStone() {
    // Air stone cylinder on gravel
    const stoneGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.2, 12);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.9 });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.set(-3.4, -2.3, -1.8);
    this.scene.add(stone);

    // Continuous rising bubbles
    this.bubblePool = [];
    const bubbleGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      transparent: true,
      opacity: 0.65,
      roughness: 0.05
    });

    for (let i = 0; i < 28; i++) {
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      bubble.position.set(
        -3.4 + (Math.random() - 0.5) * 0.25,
        -2.2 + Math.random() * 5.5,
        -1.8 + (Math.random() - 0.5) * 0.25
      );
      bubble.userData = {
        speed: 1.2 + Math.random() * 1.5,
        wobble: Math.random() * 10
      };
      this.scene.add(bubble);
      this.bubblePool.push(bubble);
    }
  }

  setupPlayerFish() {
    this.playerFish = new BettaMesh(this.gameState.currentFishId, false, false);
    this.playerFish.position.set(0, 0, 0);
    this.scene.add(this.playerFish);
  }

  setupFemaleFish() {
    if (this.femaleMesh) {
      this.scene.remove(this.femaleMesh);
      this.femaleMesh = null;
    }
    const tank = this.gameState.getCurrentTank();
    if (tank.hasFemale && tank.femaleFishId) {
      this.femaleMesh = new BettaMesh(tank.femaleFishId, true, false);
      this.femaleMesh.position.set(1.8, 0.5, -0.8);
      this.scene.add(this.femaleMesh);
      this.femaleWaypoint = new THREE.Vector3(1.5, 0, 0);
      this.femaleWaitTime = 0;
    }
  }

  setupNest() {
    const tank = this.gameState.getCurrentTank();
    if (this.bubbleNestGroup) {
      this.scene.remove(this.bubbleNestGroup);
      this.bubbleNestGroup = null;
    }

    if (tank.bubbleNest && tank.bubbleNest.built) {
      this.bubbleNestGroup = new THREE.Group();
      this.bubbleNestGroup.position.set(2.8, 3.3, -1.5);

      const bubbleGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const nestBubbleMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.95,
        transparent: true,
        opacity: 0.82,
        roughness: 0.05
      });

      for (let i = 0; i < 35; i++) {
        const nb = new THREE.Mesh(bubbleGeo, nestBubbleMat);
        const radius = Math.random() * 0.8;
        const angle = Math.random() * Math.PI * 2;
        nb.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.15, Math.sin(angle) * radius);
        nb.scale.setScalar(0.6 + Math.random() * 0.8);
        this.bubbleNestGroup.add(nb);
      }

      // Add eggs if present
      if (tank.bubbleNest.hasEggs) {
        const eggGeo = new THREE.SphereGeometry(0.045, 6, 6);
        const eggMat = new THREE.MeshStandardMaterial({
          color: 0xfffdd0,
          emissive: 0xfff59d,
          emissiveIntensity: 0.4,
          roughness: 0.3
        });
        for (let e = 0; e < 18; e++) {
          const egg = new THREE.Mesh(eggGeo, eggMat);
          egg.position.set(
            (Math.random() - 0.5) * 0.9,
            -0.1 - Math.random() * 0.15,
            (Math.random() - 0.5) * 0.9
          );
          this.bubbleNestGroup.add(egg);
        }
      }

      this.scene.add(this.bubbleNestGroup);

      // Check if fry should exist
      if (tank.bubbleNest.hatchProgress >= tank.bubbleNest.hatchBitesNeeded) {
        this.setupFry(tank.bubbleNest.fryFishId, tank.bubbleNest.fryGrown);
      } else if (this.fryMesh) {
        this.scene.remove(this.fryMesh);
        this.fryMesh = null;
      }
    } else if (this.fryMesh) {
      this.scene.remove(this.fryMesh);
      this.fryMesh = null;
    }
  }

  setupFry(fishId, isGrown) {
    if (this.fryMesh) {
      this.scene.remove(this.fryMesh);
      this.fryMesh = null;
    }
    this.fryMesh = new BettaMesh(fishId, false, !isGrown);
    this.fryMesh.position.set(2.6, 2.5, -1.2);
    this.scene.add(this.fryMesh);
  }

  setupTube() {
    // Water-filled tube descending from top of tank
    this.tubeGroup = new THREE.Group();
    this.tubeGroup.position.set(0, 3.4, 0);

    const tubeGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.0, 24, 1, true);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x00ffff,
      transmission: 0.92,
      transparent: true,
      opacity: 0.55,
      roughness: 0.08,
      metalness: 0.25,
      side: THREE.DoubleSide
    });
    this.tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.tubeMesh.position.y = 0.8;
    this.tubeGroup.add(this.tubeMesh);

    // Glowing rim lip
    const rimGeo = new THREE.TorusGeometry(0.88, 0.08, 12, 32);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = -0.2;
    this.tubeGroup.add(rim);

    // Swirling entry vortex effect
    const vortexGeo = new THREE.RingGeometry(0.1, 0.8, 16);
    vortexGeo.rotateX(-Math.PI / 2);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x33eaff,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    this.vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
    this.vortexMesh.position.y = 0.2;
    this.tubeGroup.add(this.vortexMesh);

    this.scene.add(this.tubeGroup);
  }

  spawnBites(count = 8) {
    // Floating Betta Bites pellets at water surface
    const pelletGeo = new THREE.DodecahedronGeometry(0.12);
    const pelletMat = new THREE.MeshStandardMaterial({
      color: 0xbf360c,
      emissive: 0xff5722,
      emissiveIntensity: 0.45,
      roughness: 0.4
    });

    for (let i = 0; i < count; i++) {
      const pellet = new THREE.Mesh(pelletGeo, pelletMat);
      const x = (Math.random() - 0.5) * 7.5;
      const z = (Math.random() - 0.5) * 4.8;
      pellet.position.set(x, 3.25, z);
      pellet.userData = {
        floatSpeed: 1.5 + Math.random(),
        floatPhase: Math.random() * 10
      };
      this.scene.add(pellet);
      this.bites.push(pellet);
    }
  }

  setupInputListeners() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const handlePointer = (clientX, clientY) => {
      this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersectPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.mousePlane, intersectPoint)) {
        this.targetPos.x = THREE.MathUtils.clamp(intersectPoint.x, this.bounds.minX, this.bounds.maxX);
        this.targetPos.y = THREE.MathUtils.clamp(intersectPoint.y, this.bounds.minY, this.bounds.maxY);
        this.targetPos.z = THREE.MathUtils.clamp(this.targetPos.z, this.bounds.minZ, this.bounds.maxZ);
      }
    };

    const onPointerMove = (e) => {
      handlePointer(e.clientX, e.clientY);
    };

    const onPointerDown = (e) => {
      this.isMouseDown = true;
      sound.ensureContext();
      handlePointer(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      this.isMouseDown = false;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    window.addEventListener('keydown', (e) => {
      sound.ensureContext();
      this.keyState[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keyState[e.key.toLowerCase()] = false;
    });

    this.cleanupListeners = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }

  refreshFishModel() {
    if (this.playerFish) {
      this.scene.remove(this.playerFish);
    }
    this.playerFish = new BettaMesh(this.gameState.currentFishId, false, false);
    this.scene.add(this.playerFish);
  }

  update(delta) {
    // If transitioning into tube
    if (this.enteringPipe) {
      this.enterPipeTimer += delta;
      // Animate fish ascending into the tube
      this.playerFish.position.y += delta * 3.5;
      this.playerFish.position.x = THREE.MathUtils.lerp(this.playerFish.position.x, 0, 0.1);
      this.playerFish.position.z = THREE.MathUtils.lerp(this.playerFish.position.z, 0, 0.1);
      this.playerFish.rotation.z = THREE.MathUtils.lerp(this.playerFish.rotation.z, Math.PI / 2, 0.2);
      this.playerFish.update(delta, true);

      if (this.enterPipeTimer > 0.45) {
        this.enteringPipe = false;
        if (this.onEnterPipe) {
          this.onEnterPipe();
        }
      }
      return;
    }

    // 1. Keyboard 3D swim adjustments
    const currentFish = this.gameState.getCurrentFish();
    const speed = 4.6 * (currentFish.speed || 1.0);

    if (this.keyState['w'] || this.keyState['arrowup']) this.targetPos.y += speed * delta;
    if (this.keyState['s'] || this.keyState['arrowdown']) this.targetPos.y -= speed * delta;
    if (this.keyState['a'] || this.keyState['arrowleft']) this.targetPos.x -= speed * delta;
    if (this.keyState['d'] || this.keyState['arrowright']) this.targetPos.x += speed * delta;
    if (this.keyState['e'] || this.keyState[' ']) this.targetPos.z -= speed * delta;
    if (this.keyState['q'] || this.keyState['shift']) this.targetPos.z += speed * delta;

    this.targetPos.x = THREE.MathUtils.clamp(this.targetPos.x, this.bounds.minX, this.bounds.maxX);
    this.targetPos.y = THREE.MathUtils.clamp(this.targetPos.y, this.bounds.minY, this.bounds.maxY);
    this.targetPos.z = THREE.MathUtils.clamp(this.targetPos.z, this.bounds.minZ, this.bounds.maxZ);

    // 2. Smoothly steer fish toward target
    const toTarget = new THREE.Vector3().subVectors(this.targetPos, this.playerFish.position);
    const dist = toTarget.length();

    let isMoving = false;
    if (dist > 0.15) {
      isMoving = true;
      const moveStep = Math.min(dist, speed * delta);
      toTarget.normalize();
      this.playerFish.position.addScaledVector(toTarget, moveStep);

      // Smooth rotation toward direction
      const targetAngle = Math.atan2(toTarget.y, toTarget.x);
      const yawAngle = -Math.atan2(toTarget.z, Math.hypot(toTarget.x, toTarget.y));

      this.playerFish.rotation.z = THREE.MathUtils.lerp(this.playerFish.rotation.z, targetAngle, 0.15);
      this.playerFish.rotation.y = THREE.MathUtils.lerp(this.playerFish.rotation.y, yawAngle, 0.15);
    }

    this.playerFish.update(delta, isMoving);

    // 3. Subtle camera framing follow
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.playerFish.position.x * 0.22, 0.05);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 1.8 + this.playerFish.position.y * 0.12, 0.05);
    this.camera.lookAt(this.playerFish.position.x * 0.35, this.playerFish.position.y * 0.35 + 0.3, 0);

    // 4. Air Stone bubble animation
    this.bubblePool.forEach(b => {
      b.position.y += b.userData.speed * delta;
      b.position.x += Math.sin(b.userData.wobble + b.position.y * 3) * 0.008;
      if (b.position.y > 3.3) {
        b.position.y = -2.2;
      }
    });

    // 5. Plant swaying
    this.plants.forEach(p => {
      p.group.rotation.z = Math.sin(Date.now() * 0.0015 + p.seed) * 0.06;
    });

    // 6. Vortex rotation
    if (this.vortexMesh) {
      this.vortexMesh.rotation.z += delta * 2.5;
    }

    // 7. Female Betta gentle patrol
    if (this.femaleMesh) {
      this.femaleWaitTime -= delta;
      if (this.femaleWaitTime <= 0) {
        this.femaleWaypoint.set(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3
        );
        this.femaleWaitTime = 4 + Math.random() * 4;
      }
      const toFemaleWp = new THREE.Vector3().subVectors(this.femaleWaypoint, this.femaleMesh.position);
      if (toFemaleWp.length() > 0.1) {
        toFemaleWp.normalize();
        this.femaleMesh.position.addScaledVector(toFemaleWp, 1.2 * delta);
        this.femaleMesh.rotation.z = THREE.MathUtils.lerp(
          this.femaleMesh.rotation.z,
          Math.atan2(toFemaleWp.y, toFemaleWp.x),
          0.05
        );
      }
      this.femaleMesh.update(delta, true);
    }

    // 8. Fry gentle patrol around bubble nest
    if (this.fryMesh) {
      this.fryMesh.position.x += Math.sin(Date.now() * 0.003) * 0.004;
      this.fryMesh.position.y += Math.cos(Date.now() * 0.004) * 0.003;
      this.fryMesh.update(delta, true);
    }

    // 9. Pellet (Betta Bites) eating collision check
    const fishPos = this.playerFish.position;
    for (let i = this.bites.length - 1; i >= 0; i--) {
      const pellet = this.bites[i];
      pellet.rotation.y += delta * 1.5;
      pellet.position.y = 3.25 + Math.sin(Date.now() * 0.002 * pellet.userData.floatSpeed + pellet.userData.floatPhase) * 0.05;

      const d = fishPos.distanceTo(pellet.position);
      if (d < 0.65) {
        sound.playBiteSound();
        this.gameState.addBite(1);
        this.scene.remove(pellet);
        this.bites.splice(i, 1);

        // Respawn pellet after delay
        setTimeout(() => {
          this.spawnBites(1);
        }, 3500);
      }
    }

    // 10. Tube entry collision check!
    const tubeEntrance = new THREE.Vector3(0, 3.2, 0);
    const distToTube = fishPos.distanceTo(tubeEntrance);

    if (distToTube < 0.95 && fishPos.y > 2.6) {
      // Swam up into tube!
      this.enteringPipe = true;
      this.enterPipeTimer = 0;
      sound.playPipeEnterSound();
    }
  }

  render(renderer) {
    renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.cleanupListeners) this.cleanupListeners();
  }
}
