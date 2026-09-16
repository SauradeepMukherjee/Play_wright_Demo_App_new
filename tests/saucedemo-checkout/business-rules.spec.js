// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Business Rules and Access Control (BR2, BR3, FR18, FR19)', () => {
  test('Unauthenticated direct access to checkout is blocked and redirected to login', async ({ page }) => {
    // 1. Without logging in (or after explicitly logging out via the hamburger menu 'Logout' link), navigate directly to https://www.saucedemo.com/checkout-step-one.html
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
    );
  });

  test('DISCREPANCY: Checking out with an empty cart is not blocked and can be completed with a $0.00 total', async ({ page }) => {
    // 1. Log in as standard_user with a guaranteed-empty cart (e.g., immediately after logging in fresh, or after completing/clearing a prior order), open the Cart page
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeEnabled();

    // 2. Click 'Checkout'
    await page.locator('[data-test="checkout"]').click();

    // DOCUMENTED DEFECT (BR3/FR19 gap): the app does not block checkout with an empty
    // cart and instead proceeds straight to checkout-step-one.html.
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    // 3. Fill in valid First Name, Last Name, and Zip, then click 'Continue'
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $0');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $0.00');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $0.00');
    await expect(page.locator('.cart_item')).toHaveCount(0);

    // 4. Click 'Finish'
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });

  test('Logged-in session persists across checkout steps for a valid multi-step flow', async ({ page }) => {
    // 1. Log in as standard_user, add an item, and progress through Cart -> Checkout Info -> Overview -> Complete without logging out
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/\/cart\.html$/);

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('Attempting to check out again immediately after order completion (empty cart) reproduces the same empty-cart defect', async ({ page }) => {
    // 1. Complete a full order for one item so the cart becomes empty, then click 'Checkout' again from the now-empty cart page
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

    await page.goto('https://www.saucedemo.com/cart.html');
    await page.locator('[data-test="checkout"]').click();

    // DOCUMENTED DEFECT (BR3/FR19 gap reproduced): the app again allows navigation to
    // checkout-step-one.html despite zero items, with no 'cart is empty' guard message.
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });
});
