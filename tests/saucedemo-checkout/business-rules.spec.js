// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

test.describe('Business Rules and Access Control (BR2, BR3, FR18, FR19)', () => {
  test('Unauthenticated direct access to checkout is blocked and redirected to login', async ({ page }) => {
    // 1. Without logging in, navigate directly to https://www.saucedemo.com/checkout-step-one.html
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
    );
  });

  test('DISCREPANCY: Checking out with an empty cart is not blocked and can be completed with a $0.00 total', async ({ page }) => {
    // 1. Log in as standard_user with a guaranteed-empty cart (immediately after logging in fresh), open the Cart page
    await login(page);
    await page.goto('https://www.saucedemo.com/cart.html');
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeEnabled();

    // 2. Click 'Checkout'
    await page.locator('[data-test="checkout"]').click();
    // expect: User is unexpectedly redirected to /checkout-step-one.html instead of being blocked or shown an
    // empty-cart message — this contradicts BR3/FR19
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);

    // 3. Fill in valid First Name, Last Name, and Zip, then click 'Continue'
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $0');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $0.00');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $0.00');
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveCount(0);

    // 4. Click 'Finish'
    await page.locator('[data-test="finish"]').click();
    // expect: Order completes successfully and /checkout-complete.html is shown, confirming an order with zero
    // items was allowed end-to-end — flag as a confirmed defect against BR3/FR19
    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });

  test('Logged-in session persists across checkout steps for a valid multi-step flow', async ({ page }) => {
    // 1. Log in as standard_user, add an item, and progress through Cart -> Checkout Info -> Overview -> Complete
    // without logging out
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*\/cart\.html/);

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);

    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);

    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);
    // expect: No re-authentication was required at any step; each transition above succeeded without
    // being redirected back to the login page ('/').
  });

  test('Attempting to check out again immediately after order completion (empty cart) reproduces the same empty-cart defect', async ({ page }) => {
    // 1. Complete a full order for one item so the cart becomes empty, then click 'Checkout' again from the
    // now-empty cart page
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

    await page.goto('https://www.saucedemo.com/cart.html');
    await page.locator('[data-test="checkout"]').click();
    // expect: The application again allows navigation to checkout-step-one.html despite zero items, reproducing
    // the BR3/FR19 gap rather than showing any 'cart is empty' guard message
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);
  });
});
