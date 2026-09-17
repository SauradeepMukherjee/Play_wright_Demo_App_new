// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

async function completeOrder(page, { addSecondItem = false } = {}) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  if (addSecondItem) {
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  }
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('Jane');
  await page.locator('[data-test="lastName"]').fill('Smith');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
  await page.locator('[data-test="finish"]').click();
}

test.describe('Order Completion (AC4, FR20)', () => {
  test('Finish redirects to confirmation page with success message', async ({ page, browserName }) => {
    // Multi-step page transitions (full checkout flow) are prone to webkit-only timeouts under full-suite
    // parallel load; extend the timeout for webkit only.
    test.slow(browserName === 'webkit', 'Multi-step checkout flow is slow on webkit under parallel load');

    // 1. Complete checkout information and reach checkout-step-two.html with at least one item, then click 'Finish'
    await completeOrder(page);
    await expect(page).toHaveURL(/\/checkout-complete\.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="complete-text"]')).toBeVisible();
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  test('Back Home button returns to the Products page', async ({ page, browserName }) => {
    // Multi-step page transitions (full checkout flow plus Back Home) are prone to webkit-only timeouts
    // under full-suite parallel load; extend the timeout for webkit only.
    test.slow(browserName === 'webkit', 'Multi-step checkout flow is slow on webkit under parallel load');

    // 1. Reach checkout-complete.html by completing an order
    await completeOrder(page);

    // 2. Click 'Back Home'
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(page.locator('[data-test="title"]')).toBeVisible();
  });

  test('Cart is cleared after order confirmation', async ({ page, browserName }) => {
    // Multi-step page transitions (full checkout flow plus a direct cart re-visit) are prone to webkit-only
    // timeouts under full-suite parallel load; extend the timeout for webkit only.
    test.slow(browserName === 'webkit', 'Multi-step checkout flow is slow on webkit under parallel load');

    // 1. Add two items to the cart, complete checkout through 'Finish' to reach checkout-complete.html
    await completeOrder(page, { addSecondItem: true });
    await expect(page).toHaveURL(/\/checkout-complete\.html/);
    await expect(page.locator('[data-test="shopping-cart-link"]')).toHaveText('');

    // 2. Open the Cart page directly
    await page.goto('https://www.saucedemo.com/cart.html');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
  });
});
