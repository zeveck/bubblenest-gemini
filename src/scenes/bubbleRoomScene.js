import * as THREE from 'three';
import { BettaMesh } from '../models/betta.js';
import { sound } from '../sound.js';

export class BubbleRoomScene {
  constructor(container, gameState, onDock) {
    this.container = container;
    this.gameState = gameState;
    this.onDock = onDock; // callback (worldId)

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 3.5, 9.0);
    this.camera.lookAt(0, 2.2, 0);

    this.bounds = {
      minX: -5.8,
      maxX: 5.8,
      minY: 0.8,
      maxY: 5.8,
      minZ: -6.5,
      maxZ: 6.0
    };

    this.targetPos = new THREE.Vector3(0, 2.5, 0);
    this.keyState = {};
    this.ports = [];
    this.ambientBubbles = [];
    this.dockCooldown = 1.0;

    this.setupLighting();
    this.setupRoom();
    this.setupDockingPorts();
    this.setupPlayerBubble();
    this.setupAmbientBubbles();
    this.setupInputs();
  }

  setupLighting() {
    // Warm sunlit room ambiance
    const ambient = new THREE.AmbientLight(0xfff8e7, 0.9);
    this.scene.add(ambient);

    // Warm sunbeam through window
    const sunLight = new THREE.DirectionalLight(0xfff9c4, 1.3);
    sunLight.position.set(7, 11, 5);
    this.scene.add(sunLight);

    const softFill = new THREE.DirectionalLight(0x80deea, 0.5);
    softFill.position.set(-7, 6, -4);
    this.scene.add(softFill);

    const roomPoint = new THREE.PointLight(0xffffff, 0.6, 14);
    roomPoint.position.set(0, 4, 0);
    this.scene.add(roomPoint);
  }

  setupRoom() {
    this.scene.background = new THREE.Color(0xdce775);

    // Hardwood Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x8d6e63,
      roughness: 0.65,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0;
    this.scene.add(floor);

    // Back Wall
    const backWallGeo = new THREE.PlaneGeometry(16, 10);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xc8e6c9,
      roughness: 0.85
    });
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 5, -7.5);
    this.scene.add(backWall);

    // Left Wall
    const leftWallGeo = new THREE.PlaneGeometry(16, 10);
    leftWallGeo.rotateY(Math.PI / 2);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-8, 5, 0);
    this.scene.add(leftWall);

    // Right Wall with Window
    const rightWallGeo = new THREE.PlaneGeometry(16, 10);
    rightWallGeo.rotateY(-Math.PI / 2);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(8, 5, 0);
    this.scene.add(rightWall);

    // Cozy furniture
    this.createFurniture();
  }

  createFurniture() {
    // Desk on left
    const deskGeo = new THREE.BoxGeometry(4.2, 2.0, 2.0);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(-5.2, 1.0, -5.0);
    this.scene.add(desk);

    // Bookshelf
    const shelfGeo = new THREE.BoxGeometry(3.5, 6, 1.2);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.85 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(5.5, 3.0, -6.5);
    this.scene.add(shelf);

    // Potted plant on desk
    const potGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.5, 12);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xbcaaa4 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(-5.2, 2.25, -5.0);
    this.scene.add(pot);

    const leafGeo = new THREE.SphereGeometry(0.45, 8, 8);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
    const plant = new THREE.Mesh(leafGeo, leafMat);
    plant.position.set(-5.2, 2.6, -5.0);
    this.scene.add(plant);
  }

  setupDockingPorts() {
    // 3 Bubble Machine Docking Ports positioned well within reach
    const portConfigs = [
      {
        worldId: 1,
        title: "World 1: Sunlit Coral",
        pos: new THREE.Vector3(-3.8, 3.2, -5.2),
        color: 0x00bcd4,
        ringColor: 0x80deea
      },
      {
        worldId: 2,
        title: "World 2: Bioluminescent Abyss",
        pos: new THREE.Vector3(0.0, 3.5, -5.2),
        color: 0x9c27b0,
        ringColor: 0xe1bee7
      },
      {
        worldId: 3,
        title: "World 3: Brass Aqueduct",
        pos: new THREE.Vector3(3.8, 3.2, -5.2),
        color: 0xffb300,
        ringColor: 0xffe082
      }
    ];

    portConfigs.forEach(cfg => {
      const group = new THREE.Group();
      group.position.copy(cfg.pos);

      // Port base dish
      const dishGeo = new THREE.CylinderGeometry(1.2, 0.95, 0.45, 24);
      dishGeo.rotateX(Math.PI / 2);
      const dishMat = new THREE.MeshStandardMaterial({
        color: 0x263238,
        metalness: 0.8,
        roughness: 0.25
      });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.userData = { isPort: true, worldId: cfg.worldId };
      group.add(dish);

      // Glowing Port Ring
      const ringGeo = new THREE.TorusGeometry(1.05, 0.14, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.85
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.28;
      ring.userData = { isPort: true, worldId: cfg.worldId };
      group.add(ring);

      // Energy suction swirl
      const energyGeo = new THREE.CircleGeometry(0.9, 24);
      const energyMat = new THREE.MeshBasicMaterial({
        color: cfg.ringColor,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const energy = new THREE.Mesh(energyGeo, energyMat);
      energy.position.z = 0.29;
      energy.userData = { isPort: true, worldId: cfg.worldId };
      group.add(energy);

      this.scene.add(group);

      this.ports.push({
        worldId: cfg.worldId,
        title: cfg.title,
        pos: cfg.pos,
        group,
        energy,
        ring,
        interactiveMeshes: [dish, ring, energy]
      });
    });
  }

  setupAmbientBubbles() {
    this.ambientBubbles = [];
    const bGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const bMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1
    });

    for (let i = 0; i < 20; i++) {
      const bubble = new THREE.Mesh(bGeo, bMat);
      bubble.position.set(
        (Math.random() - 0.5) * 10,
        1.0 + Math.random() * 4.5,
        (Math.random() - 0.5) * 8
      );
      bubble.userData = {
        speed: 0.4 + Math.random() * 0.6,
        wobble: Math.random() * 10,
        startY: bubble.position.y
      };
      this.scene.add(bubble);
      this.ambientBubbles.push(bubble);
    }
  }

  setupPlayerBubble() {
    this.bubbleGroup = new THREE.Group();
    this.bubbleGroup.position.set(0, 2.5, 0);

    // Glowing anti-gravity water bubble sphere
    const bubbleGeo = new THREE.SphereGeometry(1.25, 32, 32);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xa7ffeb,
      transmission: 0.92,
      transparent: true,
      opacity: 0.55,
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      ior: 1.33
    });
    this.bubbleSphere = new THREE.Mesh(bubbleGeo, bubbleMat);
    this.bubbleGroup.add(this.bubbleSphere);

    // Interior Betta fish swimming inside the floating bubble
    this.playerFish = new BettaMesh(this.gameState.currentFishId, false, false);
    this.playerFish.scale.set(0.65, 0.65, 0.65);
    this.bubbleGroup.add(this.playerFish);

    this.scene.add(this.bubbleGroup);
  }

  setupInputs() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const checkClickOrPointer = (clientX, clientY, isClick = false) => {
      this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check if user clicked/tapped directly on a docking port
      const allPortMeshes = [];
      this.ports.forEach(p => allPortMeshes.push(...p.interactiveMeshes));
      const intersects = this.raycaster.intersectObjects(allPortMeshes);

      if (intersects.length > 0) {
        const hitWorldId = intersects[0].object.userData.worldId;
        const targetPort = this.ports.find(p => p.worldId === hitWorldId);
        if (targetPort) {
          // Fly directly toward the clicked port!
          this.targetPos.copy(targetPort.pos);
          return;
        }
      }

      // Otherwise, steer toward pointer along an angled depth plane
      const steerPlane = new THREE.Plane(new THREE.Vector3(0, 0.2, 1), 2.0);
      const pt = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(steerPlane, pt)) {
        this.targetPos.x = THREE.MathUtils.clamp(pt.x, this.bounds.minX, this.bounds.maxX);
        this.targetPos.y = THREE.MathUtils.clamp(pt.y, this.bounds.minY, this.bounds.maxY);
        // Gently drift toward docking wall when steering upwards
        if (pt.y > 2.5) {
          this.targetPos.z = THREE.MathUtils.lerp(this.targetPos.z, -5.2, 0.15);
        } else {
          this.targetPos.z = THREE.MathUtils.clamp(pt.z, this.bounds.minZ, this.bounds.maxZ);
        }
      }
    };

    const onPointerMove = (e) => {
      checkClickOrPointer(e.clientX, e.clientY, false);
    };

    const onPointerDown = (e) => {
      sound.ensureContext();
      checkClickOrPointer(e.clientX, e.clientY, true);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);

    window.addEventListener('keydown', (e) => {
      sound.ensureContext();
      this.keyState[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keyState[e.key.toLowerCase()] = false;
    });

    this.cleanupInput = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }

  update(delta) {
    const speed = 4.5;

    if (this.dockCooldown > 0) {
      this.dockCooldown -= delta;
    }

    // Keyboard 3D float controls
    if (this.keyState['w'] || this.keyState['arrowup']) this.targetPos.z -= speed * delta;
    if (this.keyState['s'] || this.keyState['arrowdown']) this.targetPos.z += speed * delta;
    if (this.keyState['a'] || this.keyState['arrowleft']) this.targetPos.x -= speed * delta;
    if (this.keyState['d'] || this.keyState['arrowright']) this.targetPos.x += speed * delta;
    if (this.keyState['e'] || this.keyState[' ']) this.targetPos.y += speed * delta;
    if (this.keyState['q'] || this.keyState['shift']) this.targetPos.y -= speed * delta;

    this.targetPos.x = THREE.MathUtils.clamp(this.targetPos.x, this.bounds.minX, this.bounds.maxX);
    this.targetPos.y = THREE.MathUtils.clamp(this.targetPos.y, this.bounds.minY, this.bounds.maxY);
    this.targetPos.z = THREE.MathUtils.clamp(this.targetPos.z, this.bounds.minZ, this.bounds.maxZ);

    // Smooth bubble movement
    this.bubbleGroup.position.lerp(this.targetPos, 0.08);

    // Gentle floating bob & wobble
    const wobble = Math.sin(Date.now() * 0.003) * 0.08;
    this.bubbleGroup.position.y += wobble * 0.02;
    this.bubbleSphere.scale.set(1 + wobble * 0.15, 1 - wobble * 0.15, 1 + wobble * 0.15);

    // Update fish animation inside bubble
    this.playerFish.update(delta, true);
    this.playerFish.rotation.y += delta * 0.5;

    // Animate floating room bubbles
    this.ambientBubbles.forEach(b => {
      b.position.y += b.userData.speed * delta;
      b.position.x += Math.sin(b.userData.wobble + b.position.y * 2) * 0.006;
      if (b.position.y > 6.0) {
        b.position.y = 0.5;
      }
    });

    // Animate ports and detect docking
    this.ports.forEach(p => {
      p.energy.rotation.z += delta * 2.2;
      const pulse = 1.0 + Math.sin(Date.now() * 0.004) * 0.08;
      p.ring.scale.set(pulse, pulse, 1);

      // Check docking proximity (radius 2.0)
      if (this.dockCooldown <= 0) {
        const dist = this.bubbleGroup.position.distanceTo(p.pos);
        if (dist < 2.0) {
          this.dockCooldown = 2.0;
          sound.playDockSound();
          if (this.onDock) {
            this.onDock(p.worldId);
          }
        }
      }
    });
  }

  render(renderer) {
    renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.cleanupInput) this.cleanupInput();
  }
}
