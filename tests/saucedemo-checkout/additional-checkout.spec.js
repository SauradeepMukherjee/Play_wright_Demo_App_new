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

async function addBackpackAndOpenCart(page) {
  await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('a.shopping_cart_link').click();
  await expect(page.locator('text=Your Cart')).toBeVisible();
}

test.describe('SauceDemo additional checkout scenarios', () => {
  test('shows an empty cart state before checkout', async ({ page }) => {
    await login(page);
    await page.locator('a.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('text=Your Cart')).toBeVisible();
    await expect(page.locator('text=QTY')).toBeVisible();
    await expect(page.locator('button[data-test="checkout"]')).toBeVisible();
  });

  test('shows validation when only one field is missing', async ({ page }) => {
    await login(page);
    await addBackpackAndOpenCart(page);
    await page.locator('button[data-test="checkout"]').click();
    await page.locator('input[data-test="firstName"]').fill('Ada');
    await page.locator('input[data-test="lastName"]').fill('Lovelace');
    await page.locator('input[data-test="continue"]').click();
    await expect(page.locator('h3[data-test="error"]')).toContainText(/Postal Code/);
  });

  test('allows user to continue shopping from the cart', async ({ page }) => {
    await login(page);
    await addBackpackAndOpenCart(page);
    await page.locator('button:has-text("Continue Shopping")').click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('shows checkout overview before finishing order', async ({ page }) => {
    await login(page);
    await addBackpackAndOpenCart(page);
    await page.locator('button[data-test="checkout"]').click();
    await page.locator('input[data-test="firstName"]').fill('Ada');
    await page.locator('input[data-test="lastName"]').fill('Lovelace');
    await page.locator('input[data-test="postalCode"]').fill('SW1A 1AA');
    await page.locator('input[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('text=Payment Information')).toBeVisible();
    await expect(page.locator('text=Shipping Information')).toBeVisible();
  });
});
