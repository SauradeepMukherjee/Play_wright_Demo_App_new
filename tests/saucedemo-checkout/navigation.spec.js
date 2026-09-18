// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

test.describe('Navigation and Cancel Flows (BR5, OQ2, OQ6, OQ9)', () => {
  test('Cancel from Checkout Information page returns to Cart page with items preserved', async ({ page }) => {
    // 1. Log in, add two items to the cart, click 'Checkout' to reach checkout-step-one.html
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);

    // 2. Click 'Cancel' on the Checkout Information page
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL(/.*\/cart\.html/);
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
    ]);
    await expect(page.locator('[data-test="item-quantity"]')).toHaveText(['1', '1']);
    await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(['$29.99', '$9.99']);
  });

  test('DISCREPANCY: Cancel from Checkout Overview page returns to Products page, not the Cart page', async ({ page }) => {
    // 1. Log in, add two items to the cart, proceed through valid checkout information to reach checkout-step-two.html
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);

    // 2. Click 'Cancel' on the Checkout Overview page
    await page.locator('[data-test="cancel"]').click();
    // expect: User is redirected to /inventory.html (Products page), NOT /cart.html — this is inconsistent with
    // the step-one Cancel destination and with the implied 'return to cart' behavior in BR5
    await expect(page).toHaveURL(/.*\/inventory\.html/);
    // expect: Cart badge still shows the original item count, confirming cart contents are preserved even though
    // the landing page differs
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
  });

  test('Browser back button after order confirmation shows a stale Overview page whose Finish button is still clickable', async ({ page }) => {
    // 1. Complete a full order for one item to reach checkout-complete.html
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);

    // 2. Click the browser Back button
    await page.goBack();
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $0');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $0.00');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $0.00');
    await expect(page.locator('[data-test="finish"]')).toBeVisible();
    await expect(page.locator('[data-test="finish"]')).toBeEnabled();

    // 3. Click 'Finish' again
    await page.locator('[data-test="finish"]').click();
    // expect: User is redirected back to /checkout-complete.html without any error, confirming no safeguard
    // exists against re-submitting after order completion via back navigation
    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});
