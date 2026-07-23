// spec: specs/saucedemo-checkout-test-plan.md
// seed-file: https://www.saucedemo.com
// test-suite: Smoke

const { test, expect } = require('@playwright/test');

test.describe('Smoke', () => {
  test('Application launches and login page renders', async ({ page }) => {
    // 1. Navigate to https://www.saucedemo.com
    await page.goto('https://www.saucedemo.com');

    await expect(page).toHaveTitle('Swag Labs');
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('Standard user can log in', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    // 1. Enter credentials
    const usernameField = page.locator('[data-test="username"]');
    const passwordField = page.locator('[data-test="password"]');
    await usernameField.fill('standard_user');
    await passwordField.fill('secret_sauce');
    await expect(usernameField).toHaveValue('standard_user');
    await expect(passwordField).toHaveValue('secret_sauce');

    // 2. Click Login
    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL(/.*\/inventory\.html/);
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  });

  test('End-to-end happy-path checkout (primary regression)', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // 1. Add "Sauce Labs Backpack" to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // 2. Click the shopping cart icon to open the cart
    await page.locator('[data-test="shopping-cart-link"]').click();

    await expect(page).toHaveURL(/.*\/cart\.html/);
    const cartItem = page.locator('[data-test="cart-list"]').getByText('Sauce Labs Backpack');
    await expect(cartItem).toBeVisible();
    await expect(page.locator('[data-test="cart-list"]')).toContainText('$29.99');
    await expect(page.locator('[data-test="item-quantity"]')).toHaveText('1');

    // 3. Click Checkout button
    await page.locator('[data-test="checkout"]').click();

    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);

    // 4. Enter First Name "John", Last Name "Doe", Zip "12345" and click Continue
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);
    await expect(page.locator('[data-test="cart-list"]').getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('[data-test="payment-info-value"]')).toBeVisible();
    await expect(page.locator('[data-test="shipping-info-value"]')).toBeVisible();
    await expect(page.locator('[data-test="subtotal-label"]')).toBeVisible();
    await expect(page.locator('[data-test="tax-label"]')).toBeVisible();
    await expect(page.locator('[data-test="total-label"]')).toBeVisible();

    // 5. Click Finish
    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });
});
