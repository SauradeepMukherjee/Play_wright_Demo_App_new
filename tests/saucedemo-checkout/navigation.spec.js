// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Navigation and Cancel Flows (BR5, OQ2, OQ6, OQ9)', () => {
  test('Cancel from Checkout Information page returns to Cart page with items preserved', async ({ page }) => {
    // 1. Log in, add two items to the cart, click 'Checkout' to reach checkout-step-one.html
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    // 2. Click 'Cancel' on the Checkout Information page
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    const backpackRow = page.locator('.cart_item', { hasText: 'Sauce Labs Backpack' });
    const bikeLightRow = page.locator('.cart_item', { hasText: 'Sauce Labs Bike Light' });
    await expect(backpackRow.locator('.cart_quantity')).toHaveText('1');
    await expect(backpackRow.locator('.inventory_item_price')).toHaveText('$29.99');
    await expect(bikeLightRow.locator('.cart_quantity')).toHaveText('1');
    await expect(bikeLightRow.locator('.inventory_item_price')).toHaveText('$9.99');
  });

  test('DISCREPANCY: Cancel from Checkout Overview page returns to Products page, not the Cart page', async ({ page }, testInfo) => {
    // WebKit under full-suite parallel execution (heavier resource contention than an
    // isolated run) has intermittently exceeded the default 60s timeout here even though
    // the flow itself completes in ~4s in isolation. Give WebKit extra headroom.
    if (testInfo.project.name === 'webkit') {
      test.slow();
    }

    // 1. Log in, add two items to the cart, proceed through valid checkout information to reach checkout-step-two.html
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

    // 2. Click 'Cancel' on the Checkout Overview page
    await page.locator('[data-test="cancel"]').click();

    // DOCUMENTED DEFECT (inconsistent Cancel destinations): unlike step-one Cancel
    // (which returns to /cart.html), step-two Cancel returns to /inventory.html.
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="shopping-cart-link"]')).toContainText('2');
  });

  test('Browser back button after order confirmation shows a stale Overview page whose Finish button is still clickable', async ({ page }) => {
    // 1. Complete a full order for one item to reach checkout-complete.html
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);

    // 2. Click the browser Back button
    await page.goBack();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $0');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $0.00');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $0.00');
    await expect(page.locator('[data-test="finish"]')).toBeVisible();
    await expect(page.locator('[data-test="finish"]')).toBeEnabled();

    // 3. Click 'Finish' again
    await page.locator('[data-test="finish"]').click();

    // DOCUMENTED DEFECT (no re-submission safeguard): re-clicking Finish on the stale
    // Overview page navigates back to checkout-complete.html without error.
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });
});
