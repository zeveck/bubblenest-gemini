// 20 Distinct Betta Fish Varieties
export const BETTA_VARIETIES = [
  {
    id: 1,
    name: "Cobalt Halfmoon",
    title: "The Regal Starter",
    description: "Royal blue with a full 180-degree spread caudal fin that flows gracefully through the water.",
    colors: {
      body: 0x154360,
      fins: 0x2980b9,
      secondary: 0x5dade2,
      finEdges: 0xaed6f1,
      eye: 0x0e2b40
    },
    finStyle: "halfmoon",
    speed: 1.0,
    bonus: "Standard balanced swimmer"
  },
  {
    id: 2,
    name: "Crimson Crowntail",
    title: "The Fiery Rebel",
    description: "Spiky, comb-like ray extensions give this crimson fighter a fierce crown aesthetic.",
    colors: {
      body: 0x781212,
      fins: 0xc0392b,
      secondary: 0xe74c3c,
      finEdges: 0xf39c12,
      eye: 0x4a0e0e
    },
    finStyle: "crowntail",
    speed: 1.1,
    bonus: "+10% Swim Speed"
  },
  {
    id: 3,
    name: "Mustard Gas Plakat",
    title: "The Agile Hunter",
    description: "Short athletic fins with deep navy body contrasted by radiant sunburst yellow edges.",
    colors: {
      body: 0x1b263b,
      fins: 0xd4ac0d,
      secondary: 0xf1c40f,
      finEdges: 0xf9e79f,
      eye: 0x0d1b2a
    },
    finStyle: "plakat",
    speed: 1.25,
    bonus: "Fast burst acceleration"
  },
  {
    id: 4,
    name: "Lavender Dumbo",
    title: "The Winged Angel",
    description: "Extraordinary oversized pectoral fins that look like soft elephant ears gliding through water.",
    colors: {
      body: 0x6c5b7b,
      fins: 0x9b59b6,
      secondary: 0xbb8fce,
      finEdges: 0xebdef0,
      eye: 0x4a235a
    },
    finStyle: "dumbo",
    speed: 0.95,
    bonus: "Wider bite pickup radius"
  },
  {
    id: 5,
    name: "Galaxy Koi",
    title: "The Living Marbled Jewel",
    description: "Splotches of intense black, vermillion, and icy white glistening with cosmic iridescent scales.",
    colors: {
      body: 0xca6f1e,
      fins: 0xba4a00,
      secondary: 0x17202a,
      finEdges: 0xfafafa,
      eye: 0x111111
    },
    finStyle: "halfmoon",
    speed: 1.05,
    bonus: "Detects hidden bites"
  },
  {
    id: 6,
    name: "Emerald Veiltail",
    title: "The Classic Siren",
    description: "A timeless cascading ribbon tail that drapes gently downward in deep forest greens.",
    colors: {
      body: 0x0e6251,
      fins: 0x16a085,
      secondary: 0x48c9b0,
      finEdges: 0xa3e4d7,
      eye: 0x083329
    },
    finStyle: "veiltail",
    speed: 1.0,
    bonus: "Smooth hydro-glide"
  },
  {
    id: 7,
    name: "Dragonscale Gold",
    title: "The Armored Sun",
    description: "Thick metallic scales with golden luster reminiscent of legendary aquatic dragon armor.",
    colors: {
      body: 0xb7950b,
      fins: 0xf39c12,
      secondary: 0xf7dc6f,
      finEdges: 0xfff9c4,
      eye: 0x5a4a00
    },
    finStyle: "halfmoon",
    speed: 1.0,
    bonus: "Shields 1 bite loss on enemy bump"
  },
  {
    id: 8,
    name: "Black Orchid",
    title: "The Midnight Phantom",
    description: "Velvety obsidian skin with electric cyan striations running through the inner webbing.",
    colors: {
      body: 0x111115,
      fins: 0x1b1f24,
      secondary: 0x00bcd4,
      finEdges: 0x26c6da,
      eye: 0x050508
    },
    finStyle: "crowntail",
    speed: 1.15,
    bonus: "Enemies detect you from further away"
  },
  {
    id: 9,
    name: "Candy Nemo",
    title: "The Sweet Spot",
    description: "Playful confetti of fiery red, orange creamsicle, and translucent spots of pure charm.",
    colors: {
      body: 0xe67e22,
      fins: 0xd35400,
      secondary: 0xf39c12,
      finEdges: 0xffffff,
      eye: 0x562800
    },
    finStyle: "plakat",
    speed: 1.1,
    bonus: "Produces extra bubbles"
  },
  {
    id: 10,
    name: "Copper Alien",
    title: "The Celestial Hybrid",
    description: "Futuristic iridescent green-copper sheen that refracts rainbow light under crystal water.",
    colors: {
      body: 0x196f3d,
      fins: 0x229954,
      secondary: 0xb9770e,
      finEdges: 0x52be80,
      eye: 0x0b3d1e
    },
    finStyle: "plakat",
    speed: 1.2,
    bonus: "+15% Pipe Maze Speed"
  },
  {
    id: 11,
    name: "Ruby Rosetail",
    title: "The Blooming Duchess",
    description: "Extravagant overlapping folds like crushed red velvet rose petals in full bloom.",
    colors: {
      body: 0x900c3f,
      fins: 0xc70039,
      secondary: 0xff5733,
      finEdges: 0xffc0cb,
      eye: 0x4a001a
    },
    finStyle: "rosetail",
    speed: 0.95,
    bonus: "Higher attraction for female bettas"
  },
  {
    id: 12,
    name: "Azure Butterfly",
    title: "The Cloud Glider",
    description: "Crisp cerulean core encircled by immaculate translucent cellophane fin ribbons.",
    colors: {
      body: 0x2980b9,
      fins: 0x3498db,
      secondary: 0x85c1e9,
      finEdges: 0xffffff,
      eye: 0x154360
    },
    finStyle: "halfmoon",
    speed: 1.05,
    bonus: "Smooth turning response"
  },
  {
    id: 13,
    name: "Sunburst Super Delta",
    title: "The Dawn Chaser",
    description: "Vibrant dawn gradient that blazes from tangerine belly to lemony sunny wingtips.",
    colors: {
      body: 0xe65100,
      fins: 0xf57c00,
      secondary: 0xffb74d,
      finEdges: 0xfff176,
      eye: 0xbf360c
    },
    finStyle: "halfmoon",
    speed: 1.05,
    bonus: "Bites yield +1 extra point 10% of time"
  },
  {
    id: 14,
    name: "Platinum Samurai",
    title: "The Steel Warrior",
    description: "Jet-black body crowned with an impenetrable crest of blinding platinum white scales.",
    colors: {
      body: 0x212121,
      fins: 0x424242,
      secondary: 0xe0e0e0,
      finEdges: 0xffffff,
      eye: 0x000000
    },
    finStyle: "plakat",
    speed: 1.2,
    bonus: "Quick recovery from collisions"
  },
  {
    id: 15,
    name: "Opal Feathertail",
    title: "The Dreamer",
    description: "Branches like intricate swan feathers with iridescent opalescent sheen catching light.",
    colors: {
      body: 0x8e44ad,
      fins: 0xa569bd,
      secondary: 0xd7bde2,
      finEdges: 0xfff0f5,
      eye: 0x512e5f
    },
    finStyle: "rosetail",
    speed: 0.95,
    bonus: "Bubble nests build 20% faster"
  },
  {
    id: 16,
    name: "Tangerine Giant",
    title: "The Citrus Leviathan",
    description: "Nearly twice the size of ordinary bettas with thunderous sweeps of juicy orange fins.",
    colors: {
      body: 0xd35400,
      fins: 0xe67e22,
      secondary: 0xf39c12,
      finEdges: 0xfad7a0,
      eye: 0x6e2c00
    },
    finStyle: "halfmoon",
    speed: 0.9,
    bonus: "Enormous bite collection radius"
  },
  {
    id: 17,
    name: "Pearl Albino",
    title: "The Spectral Gem",
    description: "Ghostly alabaster shimmer with delicate pink hues and luminous ruby eyes.",
    colors: {
      body: 0xf5eef8,
      fins: 0xebdef0,
      secondary: 0xfadbd8,
      finEdges: 0xffffff,
      eye: 0x900c3f
    },
    finStyle: "veiltail",
    speed: 1.0,
    bonus: "Shimmers brightly in dark abyssal pipes"
  },
  {
    id: 18,
    name: "Jade Spiketail",
    title: "The Thorned Serpent",
    description: "Spearmint jade body adorned with needle-like thorned rays on all fin extremities.",
    colors: {
      body: 0x117864,
      fins: 0x1abc9c,
      secondary: 0x48c9b0,
      finEdges: 0xa2d9ce,
      eye: 0x0b5345
    },
    finStyle: "crowntail",
    speed: 1.1,
    bonus: "Passes through narrow gaps easily"
  },
  {
    id: 19,
    name: "Firefly Topaz",
    title: "The Glowing Ember",
    description: "Deep warm honey-topaz body with glowing rhythmic bioluminescent spots.",
    colors: {
      body: 0xb7950b,
      fins: 0xd4ac0d,
      secondary: 0xf4d03f,
      finEdges: 0xfffee0,
      eye: 0x7d6608
    },
    finStyle: "dumbo",
    speed: 1.05,
    bonus: "Attracts nearby floating bites"
  },
  {
    id: 20,
    name: "Electric Nebula",
    title: "The Cosmic Sovereign",
    description: "The ultimate collector's betta. Swirling galactic purples, deep space teal, and starlight pink.",
    colors: {
      body: 0x4a148c,
      fins: 0x7b1fa2,
      secondary: 0x00e5ff,
      finEdges: 0xff4081,
      eye: 0x1a0033
    },
    finStyle: "rosetail",
    speed: 1.3,
    bonus: "Supreme Betta Mastery (+20% all stats)"
  }
];
