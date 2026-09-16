// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cart Review (AC1)', () => {
  test('Cart page displays full item details for each product', async ({ page }) => {
    // 1. Log in as standard_user and add Sauce Labs Backpack to the cart
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // 2. Open the Cart page
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    const cartItem = page.locator('.cart_item', { hasText: 'Sauce Labs Backpack' });
    await expect(cartItem.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
    await expect(cartItem.locator('[data-test="inventory-item-desc"]')).toBeVisible();
    await expect(cartItem.locator('[data-test="inventory-item-price"]')).toHaveText('$29.99');
    await expect(cartItem.locator('.cart_quantity')).toHaveText('1');
  });

  test('Cart page offers Continue Shopping and Checkout options', async ({ page }) => {
    // 1. Log in as standard_user, add any item, and open the Cart page
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
    await expect(page.locator('[data-test="continue-shopping"]')).toBeEnabled();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeEnabled();

    // 2. Click 'Continue Shopping'
    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="shopping-cart-link"]')).toContainText('1');
  });

  test('DISCREPANCY: Cart page does not display a total/subtotal price', async ({ page }) => {
    // 1. Log in as standard_user, add two items with different prices, and open the Cart page
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/\/cart\.html$/);

    // DOCUMENTED DEFECT (FR2 gap): cart.html shows only the two individual item prices,
    // with no subtotal/tax/total element anywhere on the page.
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveCount(0);
    await expect(page.locator('[data-test="tax-label"]')).toHaveCount(0);
    await expect(page.locator('[data-test="total-label"]')).toHaveCount(0);
    await expect(page.getByText(/item total/i)).toHaveCount(0);
    await expect(page.locator('.inventory_item_price')).toHaveCount(2);
    await expect(page.locator('.cart_item').filter({ hasText: 'Sauce Labs Backpack' }).locator('.inventory_item_price')).toHaveText('$29.99');
    await expect(page.locator('.cart_item').filter({ hasText: 'Sauce Labs Bike Light' }).locator('.inventory_item_price')).toHaveText('$9.99');
  });
});
