// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

async function completeCheckoutFlow(page, items) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  for (const item of items) {
    await page.locator(`[data-test="add-to-cart-${item}"]`).click();
  }
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('Jane');
  await page.locator('[data-test="lastName"]').fill('Smith');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
  await page.locator('[data-test="finish"]').click();
}

test.describe('Suite 4 — Order Completion', () => {
  test('TC-24 Happy path — confirmation page shows success message and Back Home button', async ({ page }) => {
    // 1. Complete a full checkout flow (login -> add item -> cart -> valid checkout info -> Overview -> Finish).
    await completeCheckoutFlow(page, ['sauce-labs-backpack']);
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Complete!');
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="complete-text"]')).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    );
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  test("TC-25 'Back Home' button returns the user to the Products page", async ({ page }) => {
    // 1. From the order confirmation page, click 'Back Home'.
    await completeCheckoutFlow(page, ['sauce-labs-backpack']);
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  });

  test('TC-26 BR4 — cart is cleared after order confirmation', async ({ page }) => {
    // 1. Complete a full checkout flow with 2 items in the cart, through to /checkout-complete.html.
    await completeCheckoutFlow(page, ['sauce-labs-backpack', 'sauce-labs-bike-light']);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);

    // 2. Click 'Back Home' and open the cart page.
    await page.locator('[data-test="back-to-products"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
  });
});
