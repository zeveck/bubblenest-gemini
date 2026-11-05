import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BETTA_VARIETIES } from '../src/models/bettaTypes.js';
import { GameState } from '../src/state.js';
import { PIPE_WORLDS } from '../src/worlds/pipeWorldsData.js';

describe('Betta Odyssey Game Logic Tests', () => {
  it('should define exactly 20 unique Betta fish varieties', () => {
    assert.strictEqual(BETTA_VARIETIES.length, 20);
    const ids = new Set();
    BETTA_VARIETIES.forEach(v => {
      assert.ok(v.id >= 1 && v.id <= 20);
      assert.ok(v.name.length > 0);
      assert.ok(v.colors && v.colors.body && v.colors.fins);
      assert.ok(v.speed > 0);
      ids.add(v.id);
    });
    assert.strictEqual(ids.size, 20);
  });

  it('should initialize GameState with correct starting values and 12 tanks', () => {
    const state = new GameState();
    assert.strictEqual(state.bites, 0);
    assert.strictEqual(state.currentFishId, 1);
    assert.deepStrictEqual(state.unlockedFishIds, [1]);
    assert.strictEqual(state.currentTankId, 0);
    assert.strictEqual(state.currentMode, 'TANK');
    assert.strictEqual(state.tanks[0].claimed, true);
    assert.strictEqual(state.tanks.length, 12);
  });

  it('should add bites and track total career bites', () => {
    const state = new GameState();
    const gained = state.addBite(5);
    assert.ok(gained >= 5);
    assert.strictEqual(state.bites, gained);
    assert.strictEqual(state.totalBitesEaten, gained);
  });

  it('should lose bites upon collision but never drop below zero (cannot die)', () => {
    const state = new GameState();
    state.addBite(2);
    const lost = state.loseBites(5);
    assert.strictEqual(state.bites, 0);
    assert.strictEqual(lost, 2);
  });

  it('should handle bubble nest building and claiming tanks with female bettas', () => {
    const state = new GameState();
    state.setTank(1); // Sanctuary tank
    assert.strictEqual(state.canBuildNest(), false);

    state.addBite(30);
    assert.strictEqual(state.canBuildNest(), true);

    const built = state.buildNest();
    assert.strictEqual(built, true);
    assert.strictEqual(state.getCurrentTank().claimed, true);
    assert.strictEqual(state.getCurrentTank().bubbleNest.built, true);
    assert.strictEqual(state.getCurrentTank().bubbleNest.hasEggs, true);
  });

  it('should claim empty tanks and attract wild female visitors to the bubble nest', () => {
    const state = new GameState();
    state.setTank(3); // Empty Coral Alcove
    const emptyTank = state.getCurrentTank();
    assert.strictEqual(emptyTank.claimed, false);
    assert.strictEqual(emptyTank.hasFemale, false);
    assert.strictEqual(emptyTank.femaleFishId, null);

    state.addBite(50);
    const claimed = state.buildNest();
    assert.strictEqual(claimed, true);
    assert.strictEqual(emptyTank.claimed, true);
    assert.strictEqual(emptyTank.hasFemale, true);
    assert.ok(emptyTank.femaleFishId !== null);
    assert.strictEqual(emptyTank.bubbleNest.built, true);
    assert.strictEqual(emptyTank.bubbleNest.hasEggs, true);
  });

  it('should progress breeding cycle from eggs to hatch to mature fry and collection unlock', () => {
    const state = new GameState();
    state.setTank(1);
    state.addBite(30);
    state.buildNest();

    const nest = state.getCurrentTank().bubbleNest;
    assert.strictEqual(nest.hasEggs, true);
    assert.strictEqual(nest.hatchProgress, 0);

    // Eat bites to hatch eggs
    state.addBite(nest.hatchBitesNeeded);
    assert.strictEqual(nest.hatchProgress, nest.hatchBitesNeeded);
    assert.strictEqual(nest.fryGrown, false);

    // Eat bites to mature fry
    state.addBite(nest.growBitesNeeded);
    assert.strictEqual(nest.fryGrown, true);
    // Female fish in tank 1 is Crimson Crowntail (id 2)
    assert.ok(state.unlockedFishIds.includes(2));

    // Player switches to new fish
    const switched = state.claimFryAndSwitch(2);
    assert.strictEqual(switched, true);
    assert.strictEqual(state.currentFishId, 2);
  });

  it('should allow progressive breeding to unlock all 20 unique varieties', () => {
    const state = new GameState();
    // Simulate finding and breeding varieties
    for (let i = 2; i <= 20; i++) {
      const nextId = state.getNextUndiscoveredFishId();
      assert.strictEqual(nextId, i);
      state.unlockedFishIds.push(nextId);
    }
    assert.strictEqual(state.unlockedFishIds.length, 20);
    assert.strictEqual(state.getNextUndiscoveredFishId(), null);
  });

  it('should validate all 3 Pipe Worlds structure, grids, and portals', () => {
    [1, 2, 3].forEach(worldId => {
      const world = PIPE_WORLDS[worldId];
      assert.ok(world);
      assert.ok(world.name);
      assert.ok(world.grid.length > 0);
      assert.ok(world.enemies.length > 0);
      assert.ok(world.exits['B']); // Bubble transporter port exists
      
      // Check each row width is consistent
      const width = world.grid[0].length;
      world.grid.forEach(row => {
        assert.strictEqual(row.length, width, `Row width mismatch in World ${worldId}`);
      });
    });
  });
});
