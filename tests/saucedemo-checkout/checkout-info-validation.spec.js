// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

async function loginAndReachCheckoutInfo(page) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
}

test.describe('Suite 2 — Checkout Information Entry & Validation', () => {
  test('TC-08 Happy path — valid checkout information proceeds to Overview', async ({ page }) => {
    // 1. Log in as standard_user, add 1 item to cart, click 'Checkout' from the cart page.
    await loginAndReachCheckoutInfo(page);
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test="lastName"]')).toBeVisible();
    await expect(page.locator('[data-test="postalCode"]')).toBeVisible();
    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
    await expect(page.locator('[data-test="continue"]')).toBeVisible();

    // 2. Fill First Name = 'Jane', Last Name = 'Smith', Zip/Postal Code = '12345'. Click 'Continue'.
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('TC-09 Validation — empty First Name shows field-specific required error', async ({ page }) => {
    // 1. Log in, add an item, reach the checkout information page. Leave all fields empty. Click 'Continue'.
    await loginAndReachCheckoutInfo(page);
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  });

  test('TC-10 Validation — empty Last Name (First Name filled) shows field-specific required error', async ({ page }) => {
    // 1. On the checkout information page, fill First Name only ('John'). Leave Last Name and Zip empty. Click 'Continue'.
    await loginAndReachCheckoutInfo(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  });

  test('TC-11 Validation — empty Postal Code (First & Last filled) shows field-specific required error', async ({ page }) => {
    // 1. On the checkout information page, fill First Name ('John') and Last Name ('Doe'). Leave Zip/Postal Code empty. Click 'Continue'.
    await loginAndReachCheckoutInfo(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="continue"]').click();
    // Note: the live error message says 'Postal Code', not the field label 'Zip/Postal Code' shown on the form — documented label/message wording mismatch.
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  });

  test("TC-12 Edge case (EDGE-01) — submitting with all three fields empty only surfaces the first field's error", async ({ page }) => {
    // 1. On a fresh checkout information page, leave First Name, Last Name, and Zip/Postal Code all empty. Click 'Continue' once.
    await loginAndReachCheckoutInfo(page);
    await page.locator('[data-test="continue"]').click();
    // Validation is sequential/first-invalid-field-wins, not an aggregate list of all missing fields.
    await expect(page.locator('[data-test="error"]')).toHaveCount(1);
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');
  });

  test('TC-13 Discrepancy check (EDGE-02) — whitespace-only values bypass required-field validation', async ({ page }) => {
    // 1. On the checkout information page, enter three spaces ('   ') into First Name, Last Name, and Zip/Postal Code. Click 'Continue'.
    await loginAndReachCheckoutInfo(page);
    await page.locator('[data-test="firstName"]').fill('   ');
    await page.locator('[data-test="lastName"]').fill('   ');
    await page.locator('[data-test="postalCode"]').fill('   ');
    await page.locator('[data-test="continue"]').click();
    // Per AC5/FR-11 this should arguably be treated as incomplete/invalid.
    // Confirmed live behavior: no error is shown and the user is redirected — documented validation gap (whitespace is not trimmed/rejected).
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('TC-14 Discrepancy check (AC5/FR-11) — special characters are accepted without validation error', async ({ page }) => {
    // 1. On the checkout information page, enter First Name = 'John', Last Name = 'Doe', Zip/Postal Code = '!@#$%^&*()'. Click 'Continue'.
    await loginAndReachCheckoutInfo(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('!@#$%^&*()');
    await page.locator('[data-test="continue"]').click();
    // Per AC5/FR-11 special characters should produce a validation error and block progress.
    // Confirmed live behavior: no error is shown and the user proceeds — documented AC5/FR-11 gap.
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('TC-15 Boundary — very long input in First Name field is accepted without truncation error', async ({ page }) => {
    // 1. On the checkout information page, enter a long (300+ character) string into First Name, valid values in Last Name ('Doe') and Zip ('12345'). Click 'Continue'.
    await loginAndReachCheckoutInfo(page);
    const longFirstName = 'A'.repeat(300);
    await page.locator('[data-test="firstName"]').fill(longFirstName);
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    // Document actual behavior: the app accepts the long value without truncation.
    await expect(page.locator('[data-test="firstName"]')).toHaveValue(longFirstName);
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('TC-16 Edge case (EDGE-03) — non-numeric/alphanumeric Zip/Postal Code is accepted', async ({ page }) => {
    // 1. On the checkout information page, enter First Name = 'John', Last Name = 'Doe', Zip/Postal Code = 'SW1A 1AA' (UK-style alphanumeric postal code). Click 'Continue'.
    await loginAndReachCheckoutInfo(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('SW1A 1AA');
    await page.locator('[data-test="continue"]').click();
    // Confirms the app performs no format/pattern validation on postal code, only a presence check.
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('TC-17 BR5 on checkout information page — Cancel returns user to the Cart page', async ({ page }) => {
    // 1. Log in, add an item, reach the checkout information page (do not fill any fields).
    await loginAndReachCheckoutInfo(page);
    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
    await expect(page.locator('[data-test="continue"]')).toBeVisible();

    // 2. Click 'Cancel'.
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
  });

  test('TC-18 Error banner can be dismissed via its close (X) control', async ({ page }) => {
    // 1. Trigger the 'Error: First Name is required' message by clicking 'Continue' with all fields empty.
    await loginAndReachCheckoutInfo(page);
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();

    // 2. Click the dismiss/close (X) icon on the error banner.
    await page.locator('[data-test="error-button"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('TC-19 BR2 — direct URL navigation to the checkout information page while logged out redirects to Login', async ({ page }) => {
    // 1. Ensure no active session. Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
    );
  });
});
