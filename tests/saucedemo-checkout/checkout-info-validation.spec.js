// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

async function loginAndReachCheckoutStepOne(page) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
}

test.describe('Checkout Information Entry and Validation (AC2, AC5, BR1)', () => {
  test('Submitting an entirely empty form shows First Name required error first', async ({ page }) => {
    // 1. Log in as standard_user, add an item, open Cart, click 'Checkout' to reach checkout-step-one.html
    await loginAndReachCheckoutStepOne(page);

    // 2. Leave all three fields empty and click 'Continue'
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('Leaving only Last Name empty shows Last Name required error', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter First Name only, leave Last Name and Zip empty, click 'Continue'
    await loginAndReachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('Leaving only Zip/Postal Code empty shows Postal Code required error', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter First Name and Last Name, leave Zip empty, click 'Continue'
    await loginAndReachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('Valid First Name, Last Name, and Zip proceed to Overview page', async ({ page }) => {
    // 1. Reach checkout-step-one.html and enter First Name 'Jane', Last Name 'Smith', Zip '12345', click 'Continue'
    await loginAndReachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('Error alert can be dismissed via its close control', async ({ page }) => {
    // 1. Reach checkout-step-one.html, click 'Continue' with all fields empty to trigger the required-field error
    await loginAndReachCheckoutStepOne(page);
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();

    // 2. Click the 'Dismiss error' (X) control on the alert
    await page.locator('[data-test="error-button"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="firstName"]')).toBeEditable();
  });

  test('DISCREPANCY: Special characters in Zip/Postal Code are accepted without a format validation error', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter First Name 'John', Last Name 'Doe', Zip '!@#$%', click 'Continue'
    await loginAndReachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('!@#$%');
    await page.locator('[data-test="continue"]').click();

    // DOCUMENTED DEFECT (AC5/FR16/FR17 gap): the app accepts a special-character Zip and
    // proceeds to the Overview page with no format-validation error.
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test('DISCREPANCY: Whitespace-only First Name is accepted as valid', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter First Name as three spaces '   ', Last Name 'Doe', Zip '12345', click 'Continue'
    await loginAndReachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('   ');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    // DOCUMENTED DEFECT: a whitespace-only First Name is treated as non-empty and the
    // app proceeds to the Overview page without any 'First Name is required' error.
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test('DISCREPANCY: Oversized name input and special-character Last Name are both accepted', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter a First Name of 90+ characters, a Last Name containing digits and special characters (e.g., 'Doe123!@#'), and a valid Zip, then click 'Continue'
    await loginAndReachCheckoutStepOne(page);
    const oversizedFirstName = 'A'.repeat(100);
    await page.locator('[data-test="firstName"]').fill(oversizedFirstName);
    await page.locator('[data-test="lastName"]').fill('Doe123!@#');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    // DOCUMENTED DEFECT (AC5/FR16/FR17 gap): no max-length or allowed-character
    // validation exists for First Name / Last Name.
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test('Numeric 5-digit Zip/Postal Code is accepted (happy-path boundary)', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter valid First Name and Last Name, enter Zip '99999', click 'Continue'
    await loginAndReachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('99999');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });
});
