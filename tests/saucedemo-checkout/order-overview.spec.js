// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

async function loginAndAddItems(page, items) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  for (const item of items) {
    await page.locator(`[data-test="add-to-cart-${item}"]`).click();
  }
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
}

async function fillValidCheckoutInfo(page) {
  await page.locator('[data-test="firstName"]').fill('Jane');
  await page.locator('[data-test="lastName"]').fill('Smith');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
}

test.describe('Suite 3 — Order Overview', () => {
  test('TC-20 Happy path — Overview page shows item summary, payment info, and shipping info', async ({ page }) => {
    // 1. Log in as standard_user, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart, proceed through Checkout with valid info.
    await loginAndAddItems(page, ['sauce-labs-backpack', 'sauce-labs-bike-light']);
    await fillValidCheckoutInfo(page);
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');

    // 2. Inspect the page content.
    // SauceDemo has no payment-method-selection UI (per RISK-04) — only static payment info text is asserted.
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.getByText('Sauce Labs Bike Light')).toBeVisible();
    await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
    await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');
  });

  test('TC-21 Happy path — Overview page calculates item total, tax, and grand total correctly for a multi-item cart', async ({ page }) => {
    // 1. Add Sauce Labs Backpack ($29.99) and Sauce Labs Bike Light ($9.99) to the cart and proceed to the Overview page with valid checkout info.
    await loginAndAddItems(page, ['sauce-labs-backpack', 'sauce-labs-bike-light']);
    await fillValidCheckoutInfo(page);
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $39.98');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $3.20');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $43.18');
  });

  test('TC-22 Discrepancy check (BR5) — Cancel on the Overview page redirects to Products, not Cart', async ({ page }) => {
    // 1. Reach the Overview page via a valid checkout flow with at least 1 item in the cart.
    await loginAndAddItems(page, ['sauce-labs-backpack']);
    await fillValidCheckoutInfo(page);
    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
    await expect(page.locator('[data-test="finish"]')).toBeVisible();

    // 2. Click 'Cancel'.
    // Per BR5 ('...return to cart') this should redirect to /cart.html.
    // Confirmed live behavior: redirects to /inventory.html (Products page) instead — documented BR5 wording/implementation mismatch.
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('TC-23 Happy path — Finish button on the Overview page completes the order', async ({ page }) => {
    // 1. Reach the Overview page via a valid checkout flow.
    await loginAndAddItems(page, ['sauce-labs-backpack']);
    await fillValidCheckoutInfo(page);
    await expect(page.locator('[data-test="finish"]')).toBeEnabled();

    // 2. Click 'Finish'.
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
  });
});
