// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

async function login(page) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

async function fillValidCheckoutInfoAndContinue(page) {
  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
}

test.describe('Order Overview (AC3, FR-07–FR-09)', () => {
  test('TC-OVW-01: Overview page item summary matches cart contents', async ({ page }) => {
    // 1. Log in, add 'Sauce Labs Fleece Jacket' and 'Sauce Labs Onesie' to the cart, complete valid checkout information, and reach the Overview page.
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

    // expect: Both items are listed with correct name, description, price, and quantity,
    // matching what was shown on the cart page
    await expect(page.getByText('Sauce Labs Fleece Jacket')).toBeVisible();
    await expect(page.getByText('Sauce Labs Onesie')).toBeVisible();
    await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(['$49.99', '$7.99']);
    await expect(page.locator('[data-test="item-quantity"]')).toHaveText(['1', '1']);
  });

  test('TC-OVW-02: Overview page shows static payment and shipping information', async ({ page }) => {
    // 1. Reach the Overview page with any item in the cart.
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);

    // expect: 'Payment Information:' section shows 'SauceCard #31337'
    await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
    // expect: 'Shipping Information:' section shows 'Free Pony Express Delivery!'
    await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');
  });

  test('TC-OVW-03 [BOUNDARY]: Tax and total calculations are correct for 1 item vs. multiple items', async ({ page }) => {
    // 1. Complete checkout information with only 'Sauce Labs Bike Light' ($9.99) in the cart and reach the Overview page.
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);

    // expect: Item total: $9.99, Tax: $0.80, Total: $10.79 (8% tax rate)
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $9.99');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $0.80');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $10.79');

    // 2. Repeat with 3 items in the cart totaling a known sum (Backpack $29.99 + Bike Light $9.99 + Bolt T-Shirt $15.99 = $55.97) and reach the Overview page.
    await page.goto('https://www.saucedemo.com/inventory.html');
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);

    // expect: Item total: $55.97, Tax: $4.48, Total: $60.45 -- verifying the calculation scales correctly
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $55.97');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $4.48');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $60.45');
  });

  test('TC-OVW-04: Overview page provides Cancel and Finish options', async ({ page }) => {
    // 1. Reach the Overview page with an item in the cart.
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);

    // expect: Both a 'Cancel' button and a 'Finish' button are visible and enabled
    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
    await expect(page.locator('[data-test="cancel"]')).toBeEnabled();
    await expect(page.locator('[data-test="finish"]')).toBeVisible();
    await expect(page.locator('[data-test="finish"]')).toBeEnabled();
  });
});
