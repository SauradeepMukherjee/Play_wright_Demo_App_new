// spec: specs/saucedemo-checkout-test-plan.md
// seed-file: https://www.saucedemo.com
// test-suite: Checkout UI Validation

const { test, expect } = require('@playwright/test');

test.describe('Checkout UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/.*\/inventory\.html/);

    // Add an item to cart and navigate to checkout information page
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);
  });

  test('Checkout info field placeholders render correctly (TC-026)', async ({ page }) => {
    // 1. Inspect the First Name, Last Name, and Zip/Postal Code input fields
    await expect(page.locator('[data-test="firstName"]')).toHaveAttribute('placeholder', 'First Name');
    await expect(page.locator('[data-test="lastName"]')).toHaveAttribute('placeholder', 'Last Name');
    await expect(page.locator('[data-test="postalCode"]')).toHaveAttribute('placeholder', 'Zip/Postal Code');
  });

  test('Error message styling appears on validation failure (TC-027)', async ({ page }) => {
    // 1. Trigger the empty-field error (leave First Name blank, click Continue)
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('94107');
    await page.locator('[data-test="continue"]').click();

    // 2. Inspect the error container and input styling
    const errorContainer = page.locator('.error-message-container');
    await expect(errorContainer).toBeVisible();
    await expect(errorContainer).toContainText('Error: First Name is required');
    await expect(page.locator('[data-test="firstName"]')).toHaveClass(/input_error/);
  });

  test('Order confirmation success message and imagery render (TC-028)', async ({ page }) => {
    // Complete the checkout flow to reach the confirmation page
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);

    // 1. Review the confirmation page
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="complete-text"]')).toBeVisible();
    await expect(page.locator('[data-test="complete-text"]')).toContainText('Your order has been dispatched, and will arrive just as fast as the pony can get there!');
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });
});
