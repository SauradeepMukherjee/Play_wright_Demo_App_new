// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

test.describe('Suite 5 — Cross-Cutting Navigation, Business Rules & End-to-End Regression', () => {
  test('TC-30 BR1 — all three checkout information fields are individually mandatory (combined verification)', async ({ page }) => {
    // 1. Reach the checkout information page with an item in the cart. Attempt to submit with only Zip/Postal Code filled (First Name and Last Name empty).
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');

    // 2. Fill First Name, leave Last Name empty, keep Zip filled. Click 'Continue'.
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');

    // 3. Fill First Name and Last Name, clear Zip/Postal Code. Click 'Continue'.
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');
  });
});
