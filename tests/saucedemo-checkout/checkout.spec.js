const { test, expect } = require('@playwright/test');

const baseURL = 'https://www.saucedemo.com';
const username = 'standard_user';
const password = 'secret_sauce';

async function login(page) {
  await page.goto(baseURL);
  await page.locator('input[data-test="username"]').fill(username);
  await page.locator('input[data-test="password"]').fill(password);
  await page.locator('input[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory\.html/);
}

test.describe('SauceDemo checkout flow', () => {
  test('completes the happy path checkout', async ({ page }) => {
    await login(page);
    await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('a.shopping_cart_link').click();
    await expect(page.locator('text=Your Cart')).toBeVisible();
    await page.locator('button[data-test="checkout"]').click();
    await page.locator('input[data-test="firstName"]').fill('Ada');
    await page.locator('input[data-test="lastName"]').fill('Lovelace');
    await page.locator('input[data-test="postalCode"]').fill('SW1A 1AA');
    await page.locator('input[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await page.locator('button[data-test="finish"]').click();
    await expect(page.locator('text=Thank you for your order!')).toBeVisible();
  });

  test('shows validation when required checkout fields are missing', async ({ page }) => {
    await login(page);
    await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('a.shopping_cart_link').click();
    await page.locator('button[data-test="checkout"]').click();
    await page.locator('input[data-test="continue"]').click();
    await expect(page.locator('h3[data-test="error"]')).toContainText(/First Name|Last Name|Postal Code/);
  });

  test('allows cancellation from checkout information', async ({ page }) => {
    await login(page);
    await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('a.shopping_cart_link').click();
    await page.locator('button[data-test="checkout"]').click();
    await page.locator('button:has-text("Cancel")').click();
    await expect(page).toHaveURL(/cart\.html/);
  });
});
