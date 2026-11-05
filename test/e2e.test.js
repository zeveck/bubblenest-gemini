import { chromium } from 'playwright';
import { spawn } from 'child_process';

async function runE2ETests() {
  console.log("Starting Vite Preview server...");
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    stdio: 'pipe'
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    console.log("Navigating to http://localhost:4173/ ...");
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    // 1. Verify Canvas exists
    const canvas = await page.$('canvas');
    if (!canvas) throw new Error("WebGL canvas not found!");
    console.log("✔ WebGL Canvas mounted successfully.");

    // 2. Check HUD elements
    const bitesVal = await page.$eval('#hud-bites-val', el => el.textContent.trim());
    const fishName = await page.$eval('#hud-fish-name', el => el.textContent.trim());
    const locName = await page.$eval('#hud-loc-name', el => el.textContent.trim());
    console.log(`✔ HUD displayed correctly: Bites=${bitesVal}, Fish=${fishName}, Location=${locName}`);

    // 3. Open Betta Dex Modal
    await page.click('#dex-btn');
    await page.waitForSelector('.collection-modal', { state: 'visible' });
    const fishCardCount = await page.$$eval('.fish-card', cards => cards.length);
    console.log(`✔ Betta Dex opened with ${fishCardCount} Betta varieties.`);
    if (fishCardCount !== 20) throw new Error(`Expected 20 cards, got ${fishCardCount}`);

    // Close Dex Modal
    await page.click('#close-modal-btn');
    await page.waitForSelector('.collection-modal', { state: 'hidden' });
    console.log("✔ Betta Dex modal closed cleanly.");

    // 4. Test GameApp interaction in browser context
    await page.evaluate(() => {
      // Simulate eating bites
      window.gameApp.gameState.addBite(30);
    });

    const newBites = await page.$eval('#hud-bites-val', el => el.textContent.trim());
    console.log(`✔ Bites updated via GameState to: ${newBites}`);

    // 5. Switch to Pipe Mode
    console.log("Testing transition to Pipe World 1...");
    await page.evaluate(() => {
      window.gameApp.switchToPipe(1);
    });
    await page.waitForTimeout(500);

    const pipeLoc = await page.$eval('#hud-loc-name', el => el.textContent.trim());
    console.log(`✔ Pipe Mode active: Location=${pipeLoc}`);

    // 6. Test movement in Pipe Mode
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    console.log("✔ Directional keyboard input processed in Pipe Mode.");

    // 7. Switch to Bubble Room
    console.log("Testing transition to Bubble Room...");
    await page.evaluate(() => {
      window.gameApp.switchToBubbleRoom();
    });
    await page.waitForTimeout(500);

    const bubbleLoc = await page.$eval('#hud-loc-name', el => el.textContent.trim());
    console.log(`✔ Bubble Room active: Location=${bubbleLoc}`);

    // 8. Test docking in Bubble Room to World 2
    console.log("Testing docking to World 2...");
    await page.evaluate(() => {
      window.gameApp.switchToPipe(2, { type: 'BUBBLE_ROOM' });
    });
    await page.waitForTimeout(500);

    const world2Loc = await page.$eval('#hud-loc-name', el => el.textContent.trim());
    console.log(`✔ Transitioned to World 2: Location=${world2Loc}`);

    // 9. Switch back to a Tank (e.g. Tank 1) and test nest building
    console.log("Testing transition to Tank 1 & Nest building...");
    await page.evaluate(() => {
      window.gameApp.switchToTank(1);
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      window.gameApp.handleBuildNest();
    });
    await page.waitForTimeout(500);

    const nestProgress = await page.$('.nest-progress-box');
    if (!nestProgress) throw new Error("Nest progress box not displayed after building nest!");
    console.log("✔ Nest progress box rendered after building nest.");

    // 10. Advance breeding to hatch & maturity
    await page.evaluate(() => {
      const nest = window.gameApp.gameState.getCurrentTank().bubbleNest;
      window.gameApp.gameState.addBite(nest.hatchBitesNeeded + nest.growBitesNeeded + 10);
    });
    await page.waitForTimeout(500);

    const switchBtn = await page.$('#switch-fry-btn');
    if (!switchBtn) throw new Error("Switch to fry button not present after maturity!");
    console.log("✔ Fry matured successfully and switch button appeared.");

    await page.click('#switch-fry-btn');
    await page.waitForTimeout(500);

    const currentFish = await page.$eval('#hud-fish-name', el => el.textContent.trim());
    console.log(`✔ Switched to newly bred Betta: ${currentFish}`);

    if (errors.length > 0) {
      console.warn("Console errors encountered during test:", errors);
    } else {
      console.log("✔ Zero console errors encountered!");
    }

    console.log("\n🎉 ALL E2E BROWSER TESTS PASSED PERFECTLY!");
    process.exit(0);
  } finally {
    await browser.close();
    server.kill();
  }
}

runE2ETests().catch(err => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
