// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Non-Functional Exploratory (NFR2 Mobile Responsiveness, NFR5 Validation Messaging)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Full checkout flow renders and completes at a mobile viewport (375x667)', async ({ page, browserName }) => {
    // Multi-step page transitions at a constrained viewport are prone to webkit-only timeouts under
    // full-suite parallel load; extend the timeout for webkit only.
    test.slow(browserName === 'webkit', 'Multi-step checkout flow is slow on webkit under parallel load');

    // 1. Set the browser viewport to 375x667 (e.g., iPhone SE dimensions), log in as standard_user
    await page.goto('https://www.saucedemo.com');
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();

    // 2. Add an item to the cart and proceed through Cart -> Checkout Info -> Overview -> Complete at this viewport
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/\/cart\.html/);
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html/);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);
    await expect(page.locator('[data-test="finish"]')).toBeVisible();

    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});
