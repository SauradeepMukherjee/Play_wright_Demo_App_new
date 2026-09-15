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

test.describe('UI Validation / Boundary', () => {
  test('TC-UI-01: Cart badge accurately reflects add/remove actions across pages', async ({ page }) => {
    // 1. From the inventory page, add 3 different items one at a time, checking the cart badge after each.
    await login(page);
    const badge = page.locator('[data-test="shopping-cart-badge"]');

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    // expect: Badge increments 1 -> 2 -> 3 correctly after each add
    await expect(badge).toHaveText('1');

    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(badge).toHaveText('2');

    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    await expect(badge).toHaveText('3');

    // 2. Open the cart page and remove 1 item.
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    // expect: Badge updates to '2' immediately, consistent between the header icon and the cart page
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
    await expect(page.locator('.cart_item')).toHaveCount(2);
  });

  test('TC-UI-02 [BOUNDARY]: Single item vs multiple items checkout totals scale correctly', async ({ page }) => {
    // 1. Complete checkout information with exactly 1 item in the cart and reach the Overview page.
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);

    // expect: Item total equals that single item's price; Tax = 8% of item total (rounded to 2
    // decimals); Total = item total + tax
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $29.99');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $2.40');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $32.39');

    // 2. Repeat with all 6 available items added to the cart and reach the Overview page.
    await page.goto('https://www.saucedemo.com/inventory.html');
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
    await page.locator('[data-test="add-to-cart-test.allthethings()-t-shirt-(red)"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);

    // expect: Item total equals the sum of all 6 item prices ($29.99 + $9.99 + $15.99 + $49.99 +
    // $7.99 + $15.99 = $129.94); Tax and Total are calculated consistently using the same 8% rate
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $129.94');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $10.40');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $140.34');
  });

  test('TC-UI-03 [EDGE CASE]: Rapid double-click on \'Finish\' does not produce a broken or duplicate state', async ({ page }) => {
    // 1. Reach the Overview page with a valid cart and checkout information, then double-click the 'Finish' button as fast as possible.
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);
    await page.locator('[data-test="finish"]').dblclick();

    // Note: the requirement document defines no explicit idempotency rule for this action; this
    // records the actual observed behavior rather than asserting a specific pass/fail expectation.
    // expect: User lands on a single, well-formed /checkout-complete.html page with no duplicate
    // confirmation banners or broken layout
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveCount(1);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});
