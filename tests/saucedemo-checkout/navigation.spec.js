// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

async function login(page) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

test.describe('Navigation & Session Edge Cases', () => {
  test('TC-NAV-01: Browser back button from Overview clears entered form data', async ({ page }) => {
    // 1. Reach the Overview page after entering valid checkout information (item in cart).
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();

    // expect: Overview page is displayed correctly
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');

    // 2. Click the browser's Back button.
    await page.goBack();

    // expect: User lands back on /checkout-step-one.html
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    // expect: First Name, Last Name, and Zip fields are all empty (previously entered data is not restored)
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('');
    // expect: Cart badge still shows the correct item count
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('TC-NAV-02: Page refresh mid-checkout clears form data but preserves cart', async ({ page }) => {
    // 1. On the Checkout Information page, enter First Name and Last Name (leave Zip blank), then refresh the page.
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.reload();

    // expect: Page reloads at /checkout-step-one.html
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    // expect: First Name and Last Name fields are now empty
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('');
    // expect: Cart badge count is unchanged from before the refresh
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('TC-NAV-03: Direct URL navigation to Checkout Information page works when logged in with items in cart', async ({ page }) => {
    // 1. Log in as standard_user, add an item to the cart via the inventory page, then navigate directly to https://www.saucedemo.com/checkout-step-one.html (bypassing the cart page's Checkout button).
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');

    // expect: The Checkout Information form loads successfully without requiring the user to visit /cart.html first
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Your Information');
  });

  test('TC-NAV-04: Logout blocks subsequent access to checkout pages', async ({ page }) => {
    // 1. Log in as standard_user, open the hamburger menu, and click 'Logout'.
    await login(page);
    await page.locator('#react-burger-menu-btn').click();
    // The sidebar menu slides in via a CSS transition; on webkit (especially under
    // parallel/loaded execution) the link can resolve in the DOM before the slide-in
    // animation finishes, so explicitly wait for it to become visible before clicking
    // instead of clicking immediately (which can time out mid-transition).
    const logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    await logoutLink.waitFor({ state: 'visible' });
    await logoutLink.click();

    // expect: User is redirected to the login page (/)
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();

    // 2. Attempt to navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');

    // expect: User is redirected back to the login page with the 'You can only access ... when you
    // are logged in' error, confirming the session was fully terminated
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
    );
  });
});
