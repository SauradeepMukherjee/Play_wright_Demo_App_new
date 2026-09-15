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

test.describe('Business Rule Enforcement (BR2, BR3, BR5)', () => {
  test('TC-BR-01: Direct access to Checkout Information page while logged out is blocked', async ({ page }) => {
    // 1. Without logging in (fresh/cleared session), navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');

    // expect: User is redirected to the login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    // expect: Error alert: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
    );
  });

  test('TC-BR-02: Direct access to Cart page while logged out is blocked', async ({ page }) => {
    // 1. Without logging in, navigate directly to https://www.saucedemo.com/cart.html.
    await page.goto('https://www.saucedemo.com/cart.html');

    // expect: User is redirected to the login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    // expect: Error alert: "Epic sadface: You can only access '/cart.html' when you are logged in."
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Epic sadface: You can only access '/cart.html' when you are logged in."
    );
  });

  test('TC-BR-03 [DISCREPANCY]: Checkout with an empty cart is not blocked by the application', async ({ page }) => {
    // 1. Log in as standard_user with an empty cart, open the cart page.
    await login(page);
    await page.locator('[data-test="shopping-cart-link"]').click();

    // expect: 'Checkout' button is present and enabled despite the cart being empty
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeEnabled();

    // 2. Click 'Checkout', fill in valid First Name/Last Name/Zip, click 'Continue'.
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);

    // DISCREPANCY (documented, live behavior): the Overview page is reached with a zeroed-out
    // total and no items listed -- no blocking message is shown, contradicting BR3/FR-13.
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('.cart_item')).toHaveCount(0);
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $0');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $0.00');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $0.00');

    // 3. Click 'Finish'.
    await page.locator('[data-test="finish"]').click();

    // DISCREPANCY (documented, live behavior): order confirmation page is shown as if a normal
    // order succeeded, even though the cart was empty.
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });

  test('TC-BR-04: Cancel on Checkout Information page returns to the Cart page', async ({ page }) => {
    // 1. Reach the Checkout Information page with an item in the cart, then click 'Cancel'.
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="cancel"]').click();

    // expect: User is redirected to /cart.html
    await expect(page).toHaveURL(/\/cart\.html$/);
    // expect: The item added earlier is still present in the cart
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  });

  test('TC-BR-05 [DISCREPANCY]: Cancel on the Overview page returns to Products, not Cart', async ({ page }) => {
    // 1. Reach the Checkout Overview page (step two) with an item in the cart, then click 'Cancel'.
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await fillValidCheckoutInfoAndContinue(page);
    await page.locator('[data-test="cancel"]').click();

    // DISCREPANCY (documented, live behavior): Cancel on the Overview page redirects to
    // /inventory.html (Products page), NOT to /cart.html -- this contradicts the literal
    // wording of BR5 ("cancel at any step and return to cart").
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');

    // expect: The item remains in the cart (verified by navigating to /cart.html afterward)
    await page.goto('https://www.saucedemo.com/cart.html');
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  });
});
