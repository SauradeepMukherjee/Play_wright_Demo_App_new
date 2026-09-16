// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Non-Functional Exploratory (NFR2 Mobile Responsiveness, NFR5 Validation Messaging)', () => {
  test('Full checkout flow renders and completes at a mobile viewport (375x667)', async ({ page }) => {
    // 1. Set the browser viewport to 375x667 (e.g., iPhone SE dimensions), log in as standard_user
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://www.saucedemo.com');
    await expect(page.locator('form')).toBeVisible();
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page.locator('#react-burger-menu-btn')).toBeVisible();

    // 2. Add an item to the cart and proceed through Cart -> Checkout Info -> Overview -> Complete at this viewport
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-link"]')).toBeVisible();

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();

    await page.locator('[data-test="checkout"]').click();
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await expect(page.locator('[data-test="continue"]')).toBeVisible();
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('[data-test="finish"]')).toBeVisible();
    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  test('All checkout-flow validation and success messages are captured for content review', async ({ page }) => {
    // 1. Trigger each of: First Name required, Last Name required, Postal Code required, and the order-confirmation success message, capturing the exact text of each
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();

    const errorAlert = page.locator('[data-test="error"]');

    await page.locator('[data-test="continue"]').click();
    await expect(errorAlert).toHaveText('Error: First Name is required');

    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="continue"]').click();
    await expect(errorAlert).toHaveText('Error: Last Name is required');

    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="continue"]').click();
    await expect(errorAlert).toHaveText('Error: Postal Code is required');

    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});
