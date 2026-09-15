// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

test.describe('Suite 5 — Cross-Cutting Navigation, Business Rules & End-to-End Regression', () => {
  test('TC-27 Edge case (EDGE-04) — direct URL navigation to checkout information page with an empty cart while logged in', async ({ page }) => {
    // 1. Log in as standard_user. Do not add any items. Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    // Per BR3 this should ideally be blocked/redirected given the empty cart.
    // Confirmed live behavior: the checkout information form loads normally with an empty cart badge — documented BR3 gap consistent with TC-06.
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });

  test('TC-28 Edge case (EDGE-05, Technical Notes) — browser Back button from Overview clears entered checkout info but preserves cart', async ({ page }) => {
    // 1. Log in, add 1 item, proceed through checkout info (First Name='Jane', Last Name='Smith', Zip='12345') to the Overview page.
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
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);

    // 2. Use the browser's Back navigation (not the in-page Cancel button).
    await page.goBack();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('');
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });
});
