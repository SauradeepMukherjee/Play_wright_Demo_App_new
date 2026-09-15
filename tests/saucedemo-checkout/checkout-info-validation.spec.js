// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

async function loginAndAddBackpackThenGoToCheckout(page) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
}

test.describe('Checkout Information Entry & Validation (AC2, AC5, BR1)', () => {
  test('TC-CHK-01: \'Checkout\' button on cart page redirects to Checkout Information page', async ({ page }) => {
    // 1. Log in as standard_user, add an item to the cart, open the cart page, and click 'Checkout'.
    await loginAndAddBackpackThenGoToCheckout(page);

    // expect: User is redirected to /checkout-step-one.html with heading 'Checkout: Your Information'
    // and an empty First Name, Last Name, and Zip/Postal Code form
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Your Information');
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('');
  });

  test('TC-CHK-02: Submitting with all fields empty shows First Name required error', async ({ page }) => {
    // 1. Reach the Checkout Information page with an item in the cart. Leave all fields empty and click 'Continue'.
    await loginAndAddBackpackThenGoToCheckout(page);
    await page.locator('[data-test="continue"]').click();

    // expect: User remains on /checkout-step-one.html
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    // expect: An error alert reads 'Error: First Name is required'
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');
    // expect: No other field error is shown simultaneously
    await expect(page.locator('[data-test="error"]')).toHaveCount(1);
  });

  test('TC-CHK-03: Submitting with only First Name filled shows Last Name required error', async ({ page }) => {
    // 1. On the Checkout Information page, enter First Name 'John' only, leave Last Name and Zip empty, click 'Continue'.
    await loginAndAddBackpackThenGoToCheckout(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="continue"]').click();

    // expect: User remains on /checkout-step-one.html
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    // expect: Error alert reads 'Error: Last Name is required'
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');
  });

  test('TC-CHK-04: Submitting with First and Last Name filled shows Postal Code required error', async ({ page }) => {
    // 1. On the Checkout Information page, enter First Name 'John' and Last Name 'Doe', leave Zip empty, click 'Continue'.
    await loginAndAddBackpackThenGoToCheckout(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="continue"]').click();

    // expect: User remains on /checkout-step-one.html
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    // expect: Error alert reads 'Error: Postal Code is required'
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');
  });

  test('TC-CHK-05: Error alert can be dismissed', async ({ page }) => {
    // 1. Trigger a required-field error (e.g. submit with all fields empty), then click the 'Dismiss error' (X) icon on the alert.
    await loginAndAddBackpackThenGoToCheckout(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await page.locator('[data-test="error-button"]').click();

    // expect: The error alert is removed from the page
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    // expect: Form fields remain as previously entered
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('John');
  });

  test('TC-CHK-06 [DISCREPANCY]: Special characters in Zip/Postal Code are accepted without validation error', async ({ page }) => {
    // 1. On the Checkout Information page, enter First Name 'John', Last Name 'Doe', and Zip '!@#$%^&*()', then click 'Continue'.
    await loginAndAddBackpackThenGoToCheckout(page);
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('!@#$%^&*()');
    await page.locator('[data-test="continue"]').click();

    // DISCREPANCY (documented, live behavior): no validation error is shown for special characters
    // in the Zip field; the app proceeds normally. This contradicts AC5 (which expects an
    // appropriate validation error) and is encoded here as the real, observed behavior.
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');
  });

  test('TC-CHK-07 [DISCREPANCY]: Special characters and emoji in First/Last Name are accepted without validation error', async ({ page }) => {
    // 1. On the Checkout Information page, enter First Name '@@@###', Last Name '😀🚀🔥', and a valid Zip, then click 'Continue'.
    await loginAndAddBackpackThenGoToCheckout(page);
    await page.locator('[data-test="firstName"]').fill('@@@###');
    await page.locator('[data-test="lastName"]').fill('😀🚀🔥');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    // DISCREPANCY (documented, live behavior): no validation error is shown for special
    // characters/emoji in First/Last Name; the app proceeds normally to the Overview page,
    // which does not display the name fields anywhere for further verification. Gap against AC5.
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');
    await expect(page.getByText('@@@###')).toHaveCount(0);
    await expect(page.getByText('😀🚀🔥')).toHaveCount(0);
  });

  test('TC-CHK-08 [BOUNDARY]: Excessively long field values are accepted with no visible length limit', async ({ page }) => {
    // 1. On the Checkout Information page, enter a 300-character string into First Name, Last Name, and Zip/Postal Code, then click 'Continue'.
    await loginAndAddBackpackThenGoToCheckout(page);
    const longValue = 'A'.repeat(300);
    await page.locator('[data-test="firstName"]').fill(longValue);
    await page.locator('[data-test="lastName"]').fill(longValue.replace(/A/g, 'B'));
    await page.locator('[data-test="postalCode"]').fill('1'.repeat(300));
    await page.locator('[data-test="continue"]').click();

    // BOUNDARY (documented, live behavior): no client-side length-limit error is shown for
    // 300-character field values; the requirement document specifies no length limit, so this
    // records the actual behavior rather than asserting a pass/fail against an undefined rule.
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test('TC-CHK-09: Valid data in all fields proceeds to the Overview page', async ({ page }) => {
    // 1. On the Checkout Information page, enter First Name 'Jane', Last Name 'Smith', Zip '90210', then click 'Continue'.
    await loginAndAddBackpackThenGoToCheckout(page);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('90210');
    await page.locator('[data-test="continue"]').click();

    // expect: User is redirected to /checkout-step-two.html with heading 'Checkout: Overview'
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');
  });
});
