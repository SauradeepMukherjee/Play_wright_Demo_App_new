// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

test.describe('Cart Review (AC1, FR-01–FR-03)', () => {
  test('TC-CART-01: Cart page displays complete details for every item', async ({ page }) => {
    // 1. Log in as standard_user, add 'Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt', and 'Sauce Labs Onesie' to the cart, then open the cart page.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/\/cart\.html$/);

    // expect: Each of the 3 items shows its name, full description text, unit price, and quantity (1) in the QTY/Description table
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(3);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    await expect(page.getByText('carry.allTheThings() with the sleek, streamlined Sly Pack')).toBeVisible();
    await expect(page.getByText('Sauce Labs Bolt T-Shirt', { exact: true })).toBeVisible();
    await expect(page.getByText('Get your testing superhero on with the Sauce Labs bolt T-shirt')).toBeVisible();
    await expect(page.getByText('Sauce Labs Onesie')).toBeVisible();
    await expect(page.getByText('Rib snap infant onesie for the junior automation engineer')).toBeVisible();
    await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(['$29.99', '$15.99', '$7.99']);
    await expect(page.locator('[data-test="item-quantity"]')).toHaveText(['1', '1', '1']);
  });

  test('TC-CART-02 [DISCREPANCY]: Cart page does not display a total price', async ({ page }) => {
    // 1. Log in as standard_user, add two items to the cart, and open the cart page.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/\/cart\.html$/);

    // expect: Only each item's individual unit price is shown; the cart page contains no subtotal, item-total, or grand-total element
    await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(['$29.99', '$9.99']);
    // DISCREPANCY (documented, live behavior): the Cart page has no subtotal/item-total/grand-total
    // element at all -- this is a real gap against FR-02 (total price only appears later, on the
    // Overview page), encoded here as the expected behavior rather than left for the Healer.
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveCount(0);
    await expect(page.locator('[data-test="tax-label"]')).toHaveCount(0);
    await expect(page.locator('[data-test="total-label"]')).toHaveCount(0);
  });

  test('TC-CART-03: \'Continue Shopping\' returns to products page without changing cart', async ({ page }) => {
    // 1. Log in as standard_user, add one item to the cart, open the cart page, then click 'Continue Shopping'.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="continue-shopping"]').click();

    // expect: User is redirected to /inventory.html
    await expect(page).toHaveURL(/\/inventory\.html$/);
    // expect: Cart badge still shows '1' (cart contents unchanged)
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('TC-CART-04: Removing an item from the cart page updates the list and badge', async ({ page }) => {
    // 1. Log in as standard_user, add two items to the cart, open the cart page, then click 'Remove' next to one item.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    // expect: The removed item disappears from the cart list
    await expect(page.getByText('Sauce Labs Backpack')).toHaveCount(0);
    await expect(page.locator('.cart_item')).toHaveCount(1);
    // expect: Cart badge count decrements from '2' to '1'
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // 2. Click 'Remove' on the remaining item.
    await page.locator('[data-test="remove-sauce-labs-bike-light"]').click();

    // expect: Cart list is empty
    await expect(page.locator('.cart_item')).toHaveCount(0);
    // expect: Cart icon shows 'Cart, empty' with no numeric badge
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });
});
