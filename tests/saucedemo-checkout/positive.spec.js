// spec: specs/saucedemo-checkout-test-plan.md
// seed-file: https://www.saucedemo.com
// test-suite: Positive Functional Checkout

const { test, expect } = require('@playwright/test');

test.describe('Positive Functional Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/.*\/inventory\.html/);
  });

  test('Cart displays item name, description, price, quantity (FR-01)', async ({ page }) => {
    // 1. Add "Sauce Labs Backpack" to the cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // 2. Open the cart page
    await page.locator('[data-test="shopping-cart-link"]').click();

    const cartList = page.locator('[data-test="cart-list"]');
    await expect(cartList.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(cartList).toContainText('carry.allTheThings()');
    await expect(cartList).toContainText('$29.99');
    await expect(page.locator('[data-test="item-quantity"]')).toHaveText('1');
  });

  test('Cart displays correct total price (FR-02)', async ({ page }) => {
    // 1. Add both items ("Sauce Labs Backpack" $29.99 + "Sauce Labs Bike Light" $9.99)
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // 2. Checkout through to step-two
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('94107');
    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $39.98');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $3.20');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $43.18');
  });

  test('Cart provides Continue Shopping and Checkout options (FR-03)', async ({ page }) => {
    // 1. Open the cart page (cart has 1 item)
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();

    await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
    await expect(page.locator('[data-test="continue-shopping"]')).toBeEnabled();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeEnabled();
  });

  test('Continue Shopping returns to inventory', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();

    // 1. Click Continue Shopping
    await page.locator('[data-test="continue-shopping"]').click();

    await expect(page).toHaveURL(/.*\/inventory\.html/);
  });

  test('Checkout button redirects to checkout info page (FR-04)', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();

    // 1. Click Checkout on cart page
    await page.locator('[data-test="checkout"]').click();

    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);
  });

  test('Checkout info form accepts valid data and proceeds (FR-07)', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();

    // 1. Fill all 3 fields
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('94107');

    // 2. Click Continue
    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);
  });

  test('Overview page shows item summary, payment/shipping info, subtotal/tax/total (FR-08)', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('94107');
    await page.locator('[data-test="continue"]').click();

    // 1. Reach overview page
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);
    await expect(page.locator('[data-test="cart-list"]')).toBeVisible();
    await expect(page.locator('[data-test="payment-info-value"]')).toBeVisible();
    await expect(page.locator('[data-test="payment-info-value"]')).not.toBeEmpty();
    await expect(page.locator('[data-test="shipping-info-value"]')).toBeVisible();
    await expect(page.locator('[data-test="shipping-info-value"]')).not.toBeEmpty();
    await expect(page.locator('[data-test="subtotal-label"]')).toBeVisible();
    await expect(page.locator('[data-test="tax-label"]')).toBeVisible();
    await expect(page.locator('[data-test="total-label"]')).toBeVisible();
  });

  test('Overview page offers Cancel and Finish (FR-09)', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('94107');
    await page.locator('[data-test="continue"]').click();

    // 1. Reach overview page
    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
    await expect(page.locator('[data-test="cancel"]')).toBeEnabled();
    await expect(page.locator('[data-test="finish"]')).toBeVisible();
    await expect(page.locator('[data-test="finish"]')).toBeEnabled();
  });

  test('Finish completes the order and shows confirmation (FR-10)', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('94107');
    await page.locator('[data-test="continue"]').click();

    // 1. Click Finish
    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="complete-text"]')).toBeVisible();
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  test('Back Home returns to products page (FR-10)', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('94107');
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);

    // 1. Click Back Home
    await page.locator('[data-test="back-to-products"]').click();

    await expect(page).toHaveURL(/.*\/inventory\.html/);
  });

  test('Product sort — Name A to Z / Z to A / Price low-high / high-low', async ({ page }) => {
    const productNames = page.locator('.inventory_item_name');
    const productPrices = page.locator('.inventory_item_price');
    const sortDropdown = page.locator('[data-test="product-sort-container"]');

    // 1. Select "Name (A to Z)" from product-sort-container
    await sortDropdown.selectOption('az');
    await expect(productNames).toHaveText([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ]);

    // 2. Select "Name (Z to A)"
    await sortDropdown.selectOption('za');
    await expect(productNames).toHaveText([
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Onesie',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Bike Light',
      'Sauce Labs Backpack',
    ]);

    // 3. Select "Price (low to high)"
    await sortDropdown.selectOption('lohi');
    await expect(productPrices).toHaveText(['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99']);

    // 4. Select "Price (high to low)"
    await sortDropdown.selectOption('hilo');
    await expect(productPrices).toHaveText(['$49.99', '$29.99', '$15.99', '$15.99', '$9.99', '$7.99']);
  });

  test('Multi-item cart totals (FR-02 boundary)', async ({ page }) => {
    // 1. Add 3 items
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('3');

    // 2. Proceed to overview
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('94107');
    await page.locator('[data-test="continue"]').click();

    const cartList = page.locator('[data-test="cart-list"]');
    await expect(cartList.locator('[data-test="inventory-item-name"]', { hasText: 'Sauce Labs Backpack' })).toBeVisible();
    await expect(cartList.locator('[data-test="inventory-item-name"]', { hasText: 'Sauce Labs Bike Light' })).toBeVisible();
    await expect(cartList.locator('[data-test="inventory-item-name"]', { hasText: 'Sauce Labs Bolt T-Shirt' })).toBeVisible();
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $55.97');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $4.48');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $60.45');
  });
});
