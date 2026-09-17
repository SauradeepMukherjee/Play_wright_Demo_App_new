// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

async function reachCheckoutStepTwo(page, { addSecondItem = false } = {}) {
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
}

test.describe('Order Overview (AC3)', () => {
  test('Overview page lists all cart items with correct details', async ({ page, browserName }) => {
    // Multi-step page transitions are prone to webkit-only timeouts under full-suite parallel load;
    // extend the timeout for webkit only.
    test.slow(browserName === 'webkit', 'Multi-step checkout flow is slow on webkit under parallel load');

    // 1. Log in, add Sauce Labs Backpack and Sauce Labs Bike Light to the cart, and proceed through checkout information with valid data to reach checkout-step-two.html
    await reachCheckoutStepTwo(page, { addSecondItem: true });
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);

    const backpackItem = page.locator('[data-test="inventory-item"]').filter({ hasText: 'Sauce Labs Backpack' });
    const bikeLightItem = page.locator('[data-test="inventory-item"]').filter({ hasText: 'Sauce Labs Bike Light' });
    await expect(backpackItem.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(backpackItem).toContainText('$29.99');
    await expect(bikeLightItem.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(bikeLightItem).toContainText('$9.99');

    // expect: No 'Add to cart' / 'Remove' controls are shown on this read-only summary
    await expect(page.locator('button', { hasText: 'Add to cart' })).toHaveCount(0);
    await expect(page.locator('button', { hasText: 'Remove' })).toHaveCount(0);
  });

  test('Overview page displays Payment and Shipping information sections', async ({ page, browserName }) => {
    // Multi-step page transitions are prone to webkit-only timeouts under full-suite parallel load;
    // extend the timeout for webkit only.
    test.slow(browserName === 'webkit', 'Multi-step checkout flow is slow on webkit under parallel load');

    // 1. Reach checkout-step-two.html with at least one item in the cart
    await reachCheckoutStepTwo(page);
    await expect(page.locator('[data-test="payment-info-label"]')).toHaveText('Payment Information:');
    await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
    await expect(page.locator('[data-test="shipping-info-label"]')).toHaveText('Shipping Information:');
    await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');
  });

  test('Overview page provides Cancel and Finish controls', async ({ page, browserName }) => {
    // Multi-step page transitions are prone to webkit-only timeouts under full-suite parallel load;
    // extend the timeout for webkit only.
    test.slow(browserName === 'webkit', 'Multi-step checkout flow is slow on webkit under parallel load');

    // 1. Reach checkout-step-two.html with at least one item in the cart
    await reachCheckoutStepTwo(page);
    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
    await expect(page.locator('[data-test="cancel"]')).toBeEnabled();
    await expect(page.locator('[data-test="finish"]')).toBeVisible();
    await expect(page.locator('[data-test="finish"]')).toBeEnabled();
  });
});
