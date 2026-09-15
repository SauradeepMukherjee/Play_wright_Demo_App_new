// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

test.describe('Suite 5 — Cross-Cutting Navigation, Business Rules & End-to-End Regression', () => {
  test('TC-29 Full end-to-end happy-path regression: Cart -> Checkout Info -> Overview -> Confirmation (AC1 through AC4 chained)', async ({ page }) => {
    // 1. Log in as standard_user/secret_sauce.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/.*inventory\.html/);

    // 2. Add 'Sauce Labs Backpack' and 'Sauce Labs Fleece Jacket' to the cart.
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // 3. Open the cart page and verify both items are listed, then click 'Checkout'.
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.getByText('Sauce Labs Fleece Jacket')).toBeVisible();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);

    // 4. Fill First Name='Alex', Last Name='Rivera', Zip='90210', and click 'Continue'.
    await page.locator('[data-test="firstName"]').fill('Alex');
    await page.locator('[data-test="lastName"]').fill('Rivera');
    await page.locator('[data-test="postalCode"]').fill('90210');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);

    // 5. Verify the Overview page shows both items, payment/shipping info, and a total of item total ($79.98) plus tax, then click 'Finish'.
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.getByText('Sauce Labs Fleece Jacket')).toBeVisible();
    await expect(page.locator('[data-test="payment-info-value"]')).toBeVisible();
    await expect(page.locator('[data-test="shipping-info-value"]')).toBeVisible();
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $79.98');
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);

    // 6. Verify the success message and click 'Back Home'.
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });
});
