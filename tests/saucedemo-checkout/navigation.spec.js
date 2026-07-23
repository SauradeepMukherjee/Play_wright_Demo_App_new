// spec: specs/saucedemo-checkout-test-plan.md
// seed-file: https://www.saucedemo.com
// test-suite: Checkout Navigation

const { test, expect } = require('@playwright/test');

test.describe('Checkout Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/.*\/inventory\.html/);
  });

  test('Browser Back button from checkout overview does not retain entered info (TC-023)', async ({ page }) => {
    // 1. Add item to cart and proceed to checkout information page
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);

    // 2. Fill First Name "John", Last Name "Doe", Zip "12345" and click Continue
    const firstNameField = page.locator('[data-test="firstName"]');
    await firstNameField.fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);

    // 3. Click the browser Back button
    await page.goBack();

    // Actual observed behavior: the user returns to /checkout-step-one.html, but the
    // previously entered First Name/Last Name/Zip values do NOT persist - all fields
    // render empty again.
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);
    await expect(firstNameField).toHaveValue('');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('');
  });

  test('Cancel on checkout overview returns to inventory (TC-024)', async ({ page }) => {
    // 1. Add item to cart, proceed through checkout information to reach checkout overview
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);

    // 2. Click Cancel
    await page.locator('[data-test="cancel"]').click();

    await expect(page).toHaveURL(/.*\/inventory\.html/);
  });

  test('Cancel on checkout information page returns to cart (TC-025)', async ({ page }) => {
    // Navigate directly to checkout information page
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');

    // 1. Click Cancel
    await page.locator('[data-test="cancel"]').click();

    // Closes the OQ-04 gap: Cancel is present on checkout-step-one and navigates to /cart.html
    await expect(page).toHaveURL(/.*\/cart\.html/);
  });
});
