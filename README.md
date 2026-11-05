# Betta Odyssey 🐠🫧

A 3D browser game built with **Three.js** featuring a blend of 3D aquarium exploration, arcade 2D pipe mazes, sanctuary claiming, breeding, and collecting 20 unique Betta fish varieties.

Playable directly in your browser on desktop and mobile:
🔗 **Live Demo:** [https://zeveck.github.io/bubblenest-gemini/](https://zeveck.github.io/bubblenest-gemini/)

---

## 🎮 Gameplay & Mechanics

1. **3D Tanks (Free-Roam Swimming):**
   - Steer freely with mouse, touch, or WASD in 3D water.
   - Nibble floating Betta Bites along the surface to earn bites.
   - Swim up into the clear tube hanging from the tank ceiling to enter the pipe network.

2. **2D Pipe Mazes (Pac-Man Style Arcade Action):**
   - Swim through winding pipe networks across **3 distinct Pipe Worlds**:
     - **World 1: Sunlit Coral Tubes** (gentle currents, Water Beetles)
     - **World 2: Bioluminescent Abyssal Pipes** (neon glowing pipelines, Electric Urchins)
     - **World 3: Industrial Brass Aqueduct** (pressurized bronze conduits, Steam Crabs)
   - Munch bites, dodge enemies, and reach pipe branch exits that transport you to other tanks or the Bubble Room.

3. **Sanctuaries & Breeding Cycle:**
   - **Empty Tanks:** Unclaimed basins. Spend bites to build a bubble nest, claim the sanctuary, and attract visiting Bettas!
   - **Female Tanks:** In tanks with a female Betta, building a bubble nest lays eggs!
   - Eat bites to hatch eggs into a baby fry, and eat more bites to grow the fry into a majestic adult Betta.
   - Switch to swim as the grown fry and permanently add it to your collection!

4. **3D Anti-Gravity Bubble Chamber:**
   - Entering a bubble machine encases your Betta inside a floating water bubble.
   - Float in 3D around a sunlit room and dock at portals to travel between World 1, 2, and 3.

5. **20 Unique Betta Varieties:**
   - Collect all 20 Bettas in the **Betta Dex**, each with distinct fin morphologies (`Halfmoon`, `Crowntail`, `Plakat`, `Dumbo`, `Rosetail`, `Veiltail`), color gradients, and swimming bonuses.

---

## 🕹 Controls

| Action | Desktop | Mobile / Touch |
| :--- | :--- | :--- |
| **3D Tank Navigation** | Mouse pointer or `W`/`A`/`S`/`D` | Touch & drag |
| **Ascend / Descend (Depth)** | `Space` / `Shift` or `E` / `Q` | Pointer / touch movement |
| **2D Pipe Navigation** | `Arrow Keys` or `W`/`A`/`S`/`D` | Swipe gestures or on-screen D-Pad |
| **Float in Bubble Room** | Mouse pointer or `WASD` / click ports | Touch / tap docking ports |
| **Toggle Sound** | Speaker icon button in HUD | Speaker icon button in HUD |

---

## 🛠 Tech Stack

- **Three.js** (WebGL 3D & Orthographic 2D rendering)
- **HTML5 & CSS3** (Glassmorphic HUD with mobile responsiveness)
- **Web Audio API** (Procedural dynamic sound effects and ambient water noise)
- **Vite** (Next-generation frontend tooling)
- **Playwright** (Automated end-to-end browser testing)

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Run unit tests & Playwright browser E2E tests
npm test

# Build for production
npm run build

# Preview production build locally
npm run preview
```
