// 3 Distinct Pipe Worlds: Maps, themes, enemies, and portals connecting 12 tanks

export const PIPE_WORLDS = {
  1: {
    id: 1,
    name: "Sunlit Coral Tubes",
    description: "Gentle crystal-blue currents winding through sun-drenched coral branches.",
    theme: {
      pipeColor: 0x00bcd4,
      pipeWallColor: 0x006064,
      pipeGlow: 0x80deea,
      waterColor: 0x002633,
      particleColor: 0x4dd0e1,
      ambientIntensity: 0.85
    },
    enemyType: {
      name: "Water Beetle",
      color: 0xe65100,
      glowColor: 0xff9800,
      speed: 1.8,
      biteDamage: 2
    },
    // Grid: 19 cols x 15 rows
    grid: [
      "###################",
      "#........#........#",
      "#.####.#.#.#.####.#",
      "#1#....#...#....#2#",
      "#.####.#####.####.#",
      "#.................#",
      "####.###.###.###.##",
      "#3...#....S....#..#",
      "####.###.###.###.##",
      "#.................#",
      "#.####.#####.####.#",
      "#.#....#...#....#.#",
      "#.####.#.#.#.####.#",
      "#........#.......B#",
      "###################"
    ],
    enemies: [
      { startX: 4, startY: 1, dir: { x: 1, y: 0 } },
      { startX: 14, startY: 5, dir: { x: -1, y: 0 } },
      { startX: 9, startY: 9, dir: { x: 1, y: 0 } }
    ],
    exits: {
      'S': { type: 'TANK', tankId: 0, label: "Home Tank (Java Fern)" },
      '1': { type: 'TANK', tankId: 1, label: "Tank 1 (Sanctuary)" },
      '2': { type: 'TANK', tankId: 2, label: "Tank 2 (Lotus Basin)" },
      '3': { type: 'TANK', tankId: 3, label: "Tank 3 (Coral Alcove)" },
      'B': { type: 'BUBBLE_ROOM', label: "Bubble Chamber" }
    }
  },

  2: {
    id: 2,
    name: "Bioluminescent Abyssal Pipes",
    description: "Deep-sea neon pipelines surrounded by glowing midnight flora and electric hazards.",
    theme: {
      pipeColor: 0x9c27b0,
      pipeWallColor: 0x311b92,
      pipeGlow: 0xe1bee7,
      waterColor: 0x0a001a,
      particleColor: 0xba68c8,
      ambientIntensity: 0.7
    },
    enemyType: {
      name: "Electric Urchin",
      color: 0x00e5ff,
      glowColor: 0xd500f9,
      speed: 2.2,
      biteDamage: 3
    },
    // Grid: 21 cols x 15 rows
    grid: [
      "#####################",
      "#.........#.........#",
      "#.#####.#.#.#.#####.#",
      "#4#.....#...#.....#5#",
      "#.#####.#####.#####.#",
      "#...................#",
      "#####.#####.#####.###",
      "#6....#...S...#...7.#",
      "#####.#####.#####.###",
      "#...................#",
      "#.#####.#####.#####.#",
      "#.#.....#...#.....#.#",
      "#.#####.#.#.#.#####.#",
      "#.........#........B#",
      "#####################"
    ],
    enemies: [
      { startX: 5, startY: 1, dir: { x: 1, y: 0 } },
      { startX: 15, startY: 5, dir: { x: -1, y: 0 } },
      { startX: 10, startY: 9, dir: { x: 1, y: 0 } },
      { startX: 3, startY: 11, dir: { x: 0, y: 1 } }
    ],
    exits: {
      '4': { type: 'TANK', tankId: 4, label: "Tank 4 (Grotto)" },
      '5': { type: 'TANK', tankId: 5, label: "Tank 5 (Amethyst Deep)" },
      '6': { type: 'TANK', tankId: 6, label: "Tank 6 (Sunken Temple)" },
      '7': { type: 'TANK', tankId: 7, label: "Tank 7 (Abyssal Sanctuary)" },
      'S': { type: 'BUBBLE_ROOM', label: "Bubble Chamber" },
      'B': { type: 'BUBBLE_ROOM', label: "Bubble Chamber" }
    }
  },

  3: {
    id: 3,
    name: "Industrial Brass Aqueduct",
    description: "Heavy pressurized bronze conduits humming with steam power and mechanical traps.",
    theme: {
      pipeColor: 0xffb300,
      pipeWallColor: 0x4e342e,
      pipeGlow: 0xffe082,
      waterColor: 0x1f1206,
      particleColor: 0xffca28,
      ambientIntensity: 0.8
    },
    enemyType: {
      name: "Steam Crab",
      color: 0xd84315,
      glowColor: 0xffab91,
      speed: 2.6,
      biteDamage: 4
    },
    // Grid: 23 cols x 15 rows
    grid: [
      "#######################",
      "#..........#..........#",
      "#.######.#.#.#.######.#",
      "#8#......#...#......#9#",
      "#.######.#####.######.#",
      "#.....................#",
      "######.######.#####.###",
      "#A.....#...S..#....C..#",
      "######.######.#####.###",
      "#.....................#",
      "#.######.#####.######.#",
      "#.#......#...#......#.#",
      "#.######.#.#.#.######.#",
      "#..........#.........B#",
      "#######################"
    ],
    enemies: [
      { startX: 6, startY: 1, dir: { x: 1, y: 0 } },
      { startX: 16, startY: 5, dir: { x: -1, y: 0 } },
      { startX: 11, startY: 9, dir: { x: 1, y: 0 } },
      { startX: 4, startY: 11, dir: { x: 0, y: 1 } },
      { startX: 18, startY: 13, dir: { x: -1, y: 0 } }
    ],
    exits: {
      '8': { type: 'TANK', tankId: 8, label: "Tank 8 (Brass Foundry)" },
      '9': { type: 'TANK', tankId: 9, label: "Tank 9 (Celestial Haven)" },
      'A': { type: 'TANK', tankId: 10, label: "Tank 10 (Firefly Topaz)" },
      'C': { type: 'TANK', tankId: 11, label: "Tank 11 (Steamworks)" },
      'S': { type: 'BUBBLE_ROOM', label: "Bubble Chamber" },
      'B': { type: 'BUBBLE_ROOM', label: "Bubble Chamber" }
    }
  }
};
