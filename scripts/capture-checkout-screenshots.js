const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.resolve(__dirname, '..', 'test-results', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const baseURL = 'https://www.saucedemo.com';

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, '01-login.png'), fullPage: true });

  await page.locator('input[data-test="username"]').fill('standard_user');
  await page.locator('input[data-test="password"]').fill('secret_sauce');
  await page.locator('input[data-test="login-button"]').click();
  await page.waitForURL(/inventory\.html/);
  await page.screenshot({ path: path.join(outDir, '02-inventory.png'), fullPage: true });

  await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('a.shopping_cart_link').click();
  await page.waitForURL(/cart\.html/);
  await page.screenshot({ path: path.join(outDir, '03-cart.png'), fullPage: true });

  await page.locator('button[data-test="checkout"]').click();
  await page.waitForURL(/checkout-step-one\.html/);
  await page.screenshot({ path: path.join(outDir, '04-checkout-info.png'), fullPage: true });

  await page.locator('input[data-test="firstName"]').fill('Ada');
  await page.locator('input[data-test="lastName"]').fill('Lovelace');
  await page.locator('input[data-test="postalCode"]').fill('SW1A 1AA');
  await page.locator('input[data-test="continue"]').click();
  await page.waitForURL(/checkout-step-two\.html/);
  await page.screenshot({ path: path.join(outDir, '05-checkout-overview.png'), fullPage: true });

  await page.locator('button[data-test="finish"]').click();
  await page.waitForURL(/checkout-complete\.html/);
  await page.screenshot({ path: path.join(outDir, '06-checkout-complete.png'), fullPage: true });

  await browser.close();
  console.log(`Screenshots saved to ${outDir}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
