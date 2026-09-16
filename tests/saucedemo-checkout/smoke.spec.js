// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Smoke - Full Checkout Happy Path', () => {
  test('Complete checkout with a single item', async ({ page }) => {
    // 1. Navigate to https://www.saucedemo.com and log in with standard_user / secret_sauce
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="title"]')).toBeVisible();

    // 2. Click 'Add to cart' for Sauce Labs Backpack
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-link"]')).toContainText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();

    // 3. Click the cart icon to open the Cart page
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    const cartItem = page.locator('.cart_item', { hasText: 'Sauce Labs Backpack' });
    await expect(cartItem.locator('.cart_quantity')).toHaveText('1');
    await expect(cartItem.locator('.inventory_item_desc')).toBeVisible();
    await expect(cartItem.locator('.inventory_item_price')).toHaveText('$29.99');

    // 4. Click 'Checkout'
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    // 5. Enter First Name 'Jane', Last Name 'Smith', Zip/Postal Code '12345', then click 'Continue'
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

    // 6. Review the Overview page
    const overviewItem = page.locator('.cart_item', { hasText: 'Sauce Labs Backpack' });
    await expect(overviewItem.locator('.cart_quantity')).toHaveText('1');
    await expect(overviewItem.locator('.inventory_item_price')).toHaveText('$29.99');
    await expect(page.getByText('Payment Information:')).toBeVisible();
    await expect(page.getByText('SauceCard #31337')).toBeVisible();
    await expect(page.getByText('Shipping Information:')).toBeVisible();
    await expect(page.getByText('Free Pony Express Delivery!')).toBeVisible();
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $29.99');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $2.40');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $32.39');

    // 7. Click 'Finish'
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    // The shopping-cart-link remains visible (now showing an empty cart) on checkout-complete.html.
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();

    // 8. Click 'Back Home'
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });

  test('Complete checkout with multiple items and verify price arithmetic', async ({ page }) => {
    // 1. Log in as standard_user, add Sauce Labs Backpack ($29.99) and Sauce Labs Bike Light ($9.99) to the cart
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('[data-test="shopping-cart-link"]')).toContainText('2');

    // 2. Open the Cart page
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    const backpackRow = page.locator('.cart_item', { hasText: 'Sauce Labs Backpack' });
    const bikeLightRow = page.locator('.cart_item', { hasText: 'Sauce Labs Bike Light' });
    await expect(backpackRow.locator('.cart_quantity')).toHaveText('1');
    await expect(backpackRow.locator('.inventory_item_price')).toHaveText('$29.99');
    await expect(bikeLightRow.locator('.cart_quantity')).toHaveText('1');
    await expect(bikeLightRow.locator('.inventory_item_price')).toHaveText('$9.99');

    // 3. Click 'Checkout', fill in valid First Name, Last Name, and Zip, then click 'Continue'
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Smith');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('.cart_item', { hasText: 'Sauce Labs Backpack' })).toBeVisible();
    await expect(page.locator('.cart_item', { hasText: 'Sauce Labs Bike Light' })).toBeVisible();

    // 4. Read the 'Item total', 'Tax', and 'Total' values on the Overview page
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $39.98');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $3.20');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $43.18');

    // 5. Click 'Finish'
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await page.goto('https://www.saucedemo.com/cart.html');
    await expect(page.locator('.cart_item')).toHaveCount(0);
  });
});
