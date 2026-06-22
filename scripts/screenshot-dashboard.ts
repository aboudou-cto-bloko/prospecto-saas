import { chromium } from "playwright";

const BASE = "https://prospecto.aboudouzinsou.site";
const EMAIL = "aboudouzinsou@yahoo.com";
const PASSWORD = "Eazysell2026!";
const OUT = "public/screenshots/dashboard-promo.png";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();

  // Login
  console.log("1. Login...");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);

  // Navigate to dashboard
  console.log("2. Dashboard...");
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  // Screenshot dashboard
  console.log("3. Screenshot...");
  await page.screenshot({
    path: OUT,
    fullPage: false,
  });
  console.log(`Screenshot saved: ${OUT}`);

  // Also screenshot prospects page
  console.log("4. Prospects page...");
  await page.goto(`${BASE}/prospects`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: "public/screenshots/prospects-promo.png",
    fullPage: false,
  });
  console.log("Prospects screenshot saved");

  // Also screenshot scraper with map
  console.log("5. Scraper page...");
  await page.goto(`${BASE}/scrape`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: "public/screenshots/scraper-promo.png",
    fullPage: false,
  });
  console.log("Scraper screenshot saved");

  await browser.close();
  console.log("\nDone! Screenshots in public/screenshots/");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
