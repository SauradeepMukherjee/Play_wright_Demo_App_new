// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

async function reachCheckoutStepOne(page) {
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
    await reachCheckoutStepOne(page);

    // 2. Leave all three fields empty and click 'Continue'
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html/);
  });

  test('Leaving only Last Name empty shows Last Name required error', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter First Name only, leave Last Name and Zip empty, click 'Continue'
    await reachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html/);
  });

  test('Leaving only Zip/Postal Code empty shows Postal Code required error', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter First Name and Last Name, leave Zip empty, click 'Continue'
    await reachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html/);
  });

  test('Valid First Name, Last Name, and Zip proceed to Overview page', async ({ page }) => {
    // 1. Reach checkout-step-one.html and enter First Name 'Jane', Last Name 'Smith', Zip '12345', click 'Continue'
    await reachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });

  test('Error alert can be dismissed via its close control', async ({ page }) => {
    // 1. Reach checkout-step-one.html, click 'Continue' with all fields empty to trigger the required-field error
    await reachCheckoutStepOne(page);
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();

    // 2. Click the 'Dismiss error' (X) control on the alert
    await page.locator('[data-test="error-button"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="firstName"]')).toBeEditable();
  });

  test("DISCREPANCY: Special characters in Zip/Postal Code are accepted without a format validation error", async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter First Name 'John', Last Name 'Doe', Zip '!@#$%', click 'Continue'
    await reachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('!@#$%');
    await page.locator('[data-test="continue"]').click();

    // expect: No format-validation error is shown, and user is redirected to /checkout-step-two.html despite the non-numeric, special-character Zip value
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);
  });

  test('DISCREPANCY: Whitespace-only First Name is accepted as valid', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter First Name as three spaces '   ', Last Name 'Doe', Zip '12345', click 'Continue'
    await reachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('   ');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    // expect: No 'First Name is required' error is shown even though the field is effectively blank, and user is redirected to /checkout-step-two.html
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);
  });

  test('DISCREPANCY: Oversized name input and special-character Last Name are both accepted', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter a First Name of 90+ characters, a Last Name containing digits and special characters, and a valid Zip, then click 'Continue'
    await reachCheckoutStepOne(page);
    const oversizedFirstName = 'JohnathanAlexanderConstantineMaximilianTheophilusBartholomewNicodemusPercivalTheodoreWashington';
    await page.locator('[data-test="firstName"]').fill(oversizedFirstName);
    await page.locator('[data-test="lastName"]').fill('Doe123!@#');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    // expect: No length-limit or character-format error is shown for either field, and user is redirected to /checkout-step-two.html
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);
  });

  test('Numeric 5-digit Zip/Postal Code is accepted (happy-path boundary)', async ({ page }) => {
    // 1. Reach checkout-step-one.html, enter valid First Name and Last Name, enter Zip '99999', click 'Continue'
    await reachCheckoutStepOne(page);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('99999');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  });
});

test.describe('Non-Functional Exploratory (NFR2 Mobile Responsiveness, NFR5 Validation Messaging)', () => {
  test('All checkout-flow validation and success messages are captured for content review', async ({ page, browserName }) => {
    // Heavy sequential DOM interaction (three validation retries plus a full checkout completion) is prone
    // to webkit-only timeouts under full-suite parallel load; extend the timeout for webkit only.
    test.slow(browserName === 'webkit', 'Multi-step checkout flow is slow on webkit under parallel load');

    // 1. Trigger each of: First Name required, Last Name required, Postal Code required, and the order-confirmation success message, capturing the exact text of each
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();

    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');

    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');

    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');

    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);

    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});
