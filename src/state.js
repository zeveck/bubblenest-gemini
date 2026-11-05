import { BETTA_VARIETIES } from './models/bettaTypes.js';

export class GameState {
  constructor() {
    this.bites = 0;
    this.totalBitesEaten = 0;
    this.currentFishId = 1; // Start as Cobalt Halfmoon (#1)
    this.unlockedFishIds = [1];
    this.currentMode = 'TANK'; // 'TANK' | 'PIPE' | 'BUBBLE_ROOM'
    this.currentTankId = 0; // 0 = Home tank
    this.currentWorldId = 1; // 1, 2, or 3
    this.pipeEntrySource = { type: 'TANK', tankId: 0 };

    // 12 Tanks distributed across the 3 Worlds (4 tanks per world: 3 with females, 1 empty sanctuary)
    this.tanks = [
      // --- WORLD 1 TANKS ---
      {
        id: 0,
        name: "Home Tank - Shaded Java Fern",
        worldId: 1,
        claimed: true,
        claimCost: 0,
        hasFemale: false,
        femaleFishId: null,
        bubbleNest: null,
        plantCount: 6,
        gravelColor: 0x3d405b,
        waterColor: 0x1a5276,
        description: "Your starting sanctuary with crystal water and a cozy air stone. Swim up into the tube above to explore!"
      },
      {
        id: 1,
        name: "Sunlit Planted Sanctuary",
        worldId: 1,
        claimed: false,
        claimCost: 15,
        hasFemale: true,
        femaleFishId: 2, // Crimson Crowntail
        bubbleNest: null,
        plantCount: 8,
        gravelColor: 0x81b29a,
        waterColor: 0x117864,
        description: "A lush green planted haven where a graceful Crimson Crowntail watches."
      },
      {
        id: 2,
        name: "Zen Lotus Basin",
        worldId: 1,
        claimed: false,
        claimCost: 20,
        hasFemale: true,
        femaleFishId: 3, // Mustard Gas Plakat
        bubbleNest: null,
        plantCount: 5,
        gravelColor: 0xe07a5f,
        waterColor: 0x1f618d,
        description: "Serene pebbles with an athletic Mustard Gas Plakat resting near the bottom."
      },
      {
        id: 3,
        name: "Empty Coral Alcove",
        worldId: 1,
        claimed: false,
        claimCost: 25,
        hasFemale: false,
        femaleFishId: null,
        bubbleNest: null,
        plantCount: 7,
        gravelColor: 0xd4ac0d,
        waterColor: 0x148f77,
        description: "A tranquil empty coral tank. Build a bubble nest to claim this sanctuary and attract visiting Bettas!"
      },

      // --- WORLD 2 TANKS ---
      {
        id: 4,
        name: "Bioluminescent Grotto",
        worldId: 2,
        claimed: false,
        claimCost: 35,
        hasFemale: true,
        femaleFishId: 4, // Lavender Dumbo
        bubbleNest: null,
        plantCount: 7,
        gravelColor: 0x3f2b96,
        waterColor: 0x4a235a,
        description: "Ethereal twilight waters home to a grand Lavender Dumbo with wing-like pectoral fins."
      },
      {
        id: 5,
        name: "Amethyst Deep Basin",
        worldId: 2,
        claimed: false,
        claimCost: 45,
        hasFemale: true,
        femaleFishId: 8, // Black Orchid
        bubbleNest: null,
        plantCount: 6,
        gravelColor: 0x212f3d,
        waterColor: 0x1b2631,
        description: "A mysterious obsidian basin where a midnight Black Orchid glides silently."
      },
      {
        id: 6,
        name: "Sunken Temple Basin",
        worldId: 2,
        claimed: false,
        claimCost: 55,
        hasFemale: true,
        femaleFishId: 10, // Copper Alien
        bubbleNest: null,
        plantCount: 9,
        gravelColor: 0x145a32,
        waterColor: 0x0e6251,
        description: "Ancient stone pillars and vibrant algae guarded by an iridescent Copper Alien."
      },
      {
        id: 7,
        name: "Empty Abyssal Sanctuary",
        worldId: 2,
        claimed: false,
        claimCost: 65,
        hasFemale: false,
        femaleFishId: null,
        bubbleNest: null,
        plantCount: 8,
        gravelColor: 0x1f1435,
        waterColor: 0x240046,
        description: "A secluded deep-sea alcove waiting to be claimed with a radiant bubble nest."
      },

      // --- WORLD 3 TANKS ---
      {
        id: 8,
        name: "Brass Foundry Aquarium",
        worldId: 3,
        claimed: false,
        claimCost: 75,
        hasFemale: true,
        femaleFishId: 14, // Platinum Samurai
        bubbleNest: null,
        plantCount: 4,
        gravelColor: 0x784212,
        waterColor: 0x7e5109,
        description: "Steampunk brass fittings and warm bubbling waters housing a legendary Platinum Samurai."
      },
      {
        id: 9,
        name: "The Celestial Sky Haven",
        worldId: 3,
        claimed: false,
        claimCost: 95,
        hasFemale: true,
        femaleFishId: 20, // Electric Nebula
        bubbleNest: null,
        plantCount: 10,
        gravelColor: 0x2c003e,
        waterColor: 0x512e5f,
        description: "The crown jewel aquarium of radiant galactic colors and the mythic Electric Nebula!"
      },
      {
        id: 10,
        name: "Firefly Topaz Cavern",
        worldId: 3,
        claimed: false,
        claimCost: 85,
        hasFemale: true,
        femaleFishId: 19, // Firefly Topaz
        bubbleNest: null,
        plantCount: 6,
        gravelColor: 0x6e2c00,
        waterColor: 0xb7950b,
        description: "Golden honey waters radiating with the bioluminescent glow of a Firefly Topaz."
      },
      {
        id: 11,
        name: "Empty Steamworks Sanctuary",
        worldId: 3,
        claimed: false,
        claimCost: 110,
        hasFemale: false,
        femaleFishId: null,
        bubbleNest: null,
        plantCount: 5,
        gravelColor: 0x4a2810,
        waterColor: 0x3d2b1f,
        description: "A warm pressurized aquarium chamber ripe for colonizing with a bubble nest."
      }
    ];

    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  getCurrentFish() {
    return BETTA_VARIETIES.find(b => b.id === this.currentFishId) || BETTA_VARIETIES[0];
  }

  getCurrentTank() {
    return this.tanks[this.currentTankId] || this.tanks[0];
  }

  getNextUndiscoveredFishId() {
    for (let id = 1; id <= 20; id++) {
      if (!this.unlockedFishIds.includes(id)) {
        return id;
      }
    }
    return null;
  }

  addBite(count = 1) {
    const fish = this.getCurrentFish();
    let bonus = 0;
    // Special fish bonus: Sunburst Super Delta (#13) has 10% chance of double bites
    if (fish.id === 13 && Math.random() < 0.1) {
      bonus = 1;
    }
    const gained = count + bonus;
    this.bites += gained;
    this.totalBitesEaten += gained;

    // Advance breeding in current tank if nest exists and needs bites
    this.advanceBreeding(gained);
    this.notify();
    return gained;
  }

  loseBites(count = 3) {
    const fish = this.getCurrentFish();
    // Special fish bonus: Dragonscale Gold (#7) shields 1 bite loss
    if (fish.id === 7) {
      count = Math.max(1, count - 1);
    }
    const lost = Math.min(this.bites, count);
    this.bites = Math.max(0, this.bites - count);
    this.notify();
    return lost;
  }

  advanceBreeding(bitesGained) {
    const tank = this.getCurrentTank();
    if (!tank.bubbleNest || !tank.bubbleNest.built) return null;

    const nest = tank.bubbleNest;
    let remainingBites = bitesGained;

    if (nest.hasEggs && nest.hatchProgress < nest.hatchBitesNeeded) {
      const bitesToHatch = nest.hatchBitesNeeded - nest.hatchProgress;
      if (remainingBites >= bitesToHatch) {
        nest.hatchProgress = nest.hatchBitesNeeded;
        remainingBites -= bitesToHatch;
      } else {
        nest.hatchProgress += remainingBites;
        remainingBites = 0;
      }
    }

    if (nest.hasEggs && nest.hatchProgress >= nest.hatchBitesNeeded && !nest.fryGrown && remainingBites > 0) {
      const bitesToGrow = nest.growBitesNeeded - nest.growProgress;
      if (remainingBites >= bitesToGrow) {
        nest.growProgress = nest.growBitesNeeded;
        nest.fryGrown = true;
        // Unlock this variety in collection!
        if (nest.fryFishId && !this.unlockedFishIds.includes(nest.fryFishId)) {
          this.unlockedFishIds.push(nest.fryFishId);
        }
        return { event: 'grown', fishId: nest.fryFishId };
      } else {
        nest.growProgress += remainingBites;
      }
    }

    if (nest.hatchProgress >= nest.hatchBitesNeeded && !nest.fryGrown) {
      return { event: 'hatched', fryFishId: nest.fryFishId };
    }

    return null;
  }

  getNestCost(tank = this.getCurrentTank()) {
    if (!tank.claimed) {
      return tank.claimCost || 15;
    }
    return 15 + (tank.worldId * 10);
  }

  canBuildNest() {
    const tank = this.getCurrentTank();
    // Cannot build if nest is currently incubating or has an unswitched matured fry
    if (tank.bubbleNest && tank.bubbleNest.built && !tank.bubbleNest.fryGrown) {
      return false;
    }
    const cost = this.getNestCost(tank);
    return this.bites >= cost;
  }

  buildNest() {
    const tank = this.getCurrentTank();
    const cost = this.getNestCost(tank);
    if (this.bites < cost) return false;

    this.bites -= cost;
    tank.claimed = true;

    // Determine female and fry
    let femaleId = tank.femaleFishId;
    if (!femaleId) {
      // Empty tank claimed! Attract a new visiting female betta from locked pool
      femaleId = this.getNextUndiscoveredFishId() || 2;
      tank.femaleFishId = femaleId;
      tank.hasFemale = true;
    }

    // Dynamic bite requirements based on world
    const hatchBites = Math.min(35, 10 + Math.floor(tank.worldId * 5));
    const growBites = Math.min(50, 15 + Math.floor(tank.worldId * 8));

    tank.bubbleNest = {
      built: true,
      cost: cost,
      hasEggs: true,
      hatchBitesNeeded: hatchBites,
      hatchProgress: 0,
      growBitesNeeded: growBites,
      growProgress: 0,
      fryFishId: femaleId,
      fryGrown: false
    };

    this.notify();
    return true;
  }

  switchFish(fishId) {
    if (this.unlockedFishIds.includes(fishId)) {
      this.currentFishId = fishId;
      this.notify();
      return true;
    }
    return false;
  }

  claimFryAndSwitch(fryFishId) {
    const tank = this.getCurrentTank();
    if (!tank.bubbleNest || !tank.bubbleNest.fryGrown) return false;

    const targetId = fryFishId || tank.bubbleNest.fryFishId;
    if (targetId && !this.unlockedFishIds.includes(targetId)) {
      this.unlockedFishIds.push(targetId);
    }

    this.currentFishId = targetId;

    // Ready tank for subsequent breeding cycles with new visitors if collection incomplete
    const nextLocked = this.getNextUndiscoveredFishId();
    if (nextLocked) {
      tank.femaleFishId = nextLocked;
      tank.hasFemale = true;
    }
    tank.bubbleNest = null;

    this.notify();
    return true;
  }

  setMode(mode) {
    this.currentMode = mode;
    this.notify();
  }

  setTank(tankId) {
    if (tankId >= 0 && tankId < this.tanks.length) {
      this.currentTankId = tankId;
      this.currentWorldId = this.tanks[tankId].worldId;
      this.currentMode = 'TANK';
      this.notify();
    }
  }

  setWorld(worldId) {
    this.currentWorldId = worldId;
    this.notify();
  }

  setPipeEntrySource(source) {
    this.pipeEntrySource = source;
  }
}

export const gameState = new GameState();
