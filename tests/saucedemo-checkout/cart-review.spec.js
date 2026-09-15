// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

test.describe('Suite 1 — Cart Review', () => {
  test('TC-01 Happy path — cart displays single item with full details', async ({ page }) => {
    // 1. Log in as standard_user/secret_sauce.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/.*inventory\.html/);

    // 2. Click 'Add to cart' for Sauce Labs Backpack.
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();

    // 3. Click the cart icon to navigate to the cart page.
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');

    // 4. Inspect the cart line item.
    const cartItem = page.locator('[data-test="inventory-item"]');
    await expect(cartItem.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
    await expect(cartItem.locator('[data-test="inventory-item-desc"]')).toBeVisible();
    await expect(cartItem.locator('[data-test="inventory-item-price"]')).toHaveText('$29.99');
    await expect(cartItem.locator('[data-test="item-quantity"]')).toHaveText('1');
  });

  test('TC-02 Happy path — cart displays multiple items with correct per-item quantities', async ({ page }) => {
    // 1. Log in as standard_user. From the Products page, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // 2. Navigate to the cart page.
    await page.locator('[data-test="shopping-cart-link"]').click();
    const cartItems = page.locator('[data-test="inventory-item"]');
    await expect(cartItems).toHaveCount(2);

    const backpackItem = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    await expect(backpackItem.locator('[data-test="inventory-item-desc"]')).toBeVisible();
    await expect(backpackItem.locator('[data-test="inventory-item-price"]')).toHaveText('$29.99');
    await expect(backpackItem.locator('[data-test="item-quantity"]')).toHaveText('1');

    const bikeLightItem = cartItems.filter({ hasText: 'Sauce Labs Bike Light' });
    await expect(bikeLightItem.locator('[data-test="inventory-item-desc"]')).toBeVisible();
    await expect(bikeLightItem.locator('[data-test="inventory-item-price"]')).toHaveText('$9.99');
    await expect(bikeLightItem.locator('[data-test="item-quantity"]')).toHaveText('1');
  });

  test('TC-03 Discrepancy check — cart page does not display a total price (FR-02 gap)', async ({ page }) => {
    // 1. Log in as standard_user and add 2 items to the cart, then navigate to the cart page.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();

    // 2. Search the cart page for any subtotal/tax/total text.
    // Documents a confirmed FR-02 gap: no subtotal/tax/total element exists on cart.html.
    await expect(page.getByText(/subtotal|tax|total/i)).toHaveCount(0);
  });

  test("TC-04 'Continue Shopping' returns to Products page and preserves cart contents", async ({ page, browserName }) => {
    // This test is known to be sensitive to CPU/memory contention on webkit when the full
    // 90-test / 3-browser suite runs concurrently (not reproducible in isolation or under
    // Playwright MCP tooling, only under real full-suite `npx playwright test` load).
    // test.slow() triples the timeout budget for webkit to absorb that contention.
    if (browserName === 'webkit') {
      test.slow();
    }

    // 1. Log in as standard_user, add 1 item to cart, navigate to the cart page.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    // Wait for the cart page navigation to complete before asserting on item name —
    // the "inventory-item-name" data-test is shared with the Products page, so asserting
    // before the navigation lands (a webkit-specific timing race, worsened under full-suite
    // contention) matches multiple elements. A generous explicit timeout absorbs slow
    // navigation under heavy parallel load.
    await expect(page).toHaveURL(/.*cart\.html/, { timeout: 15000 });
    // Scope to the cart's own item container (not just the bare data-test attribute) so a
    // slow-to-unmount previous page under contention can't leave a stale/duplicate element
    // in the DOM that this locator would otherwise also match.
    const cartItem = page.locator('[data-test="inventory-item"]');
    await expect(cartItem.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');

    // 2. Click 'Continue Shopping'.
    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL(/.*inventory\.html/, { timeout: 15000 });

    // 3. Re-open the cart page.
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/.*cart\.html/, { timeout: 15000 });
    await expect(cartItem.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test("TC-05 'Checkout' button navigates to the checkout information page when the cart has items", async ({ page }) => {
    // 1. Log in as standard_user, add at least 1 item, go to the cart page.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="checkout"]')).toBeEnabled();

    // 2. Click 'Checkout'.
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Your Information');
  });

  test('TC-06 Edge case — Checkout button is clickable with an empty cart (BR3 not enforced)', async ({ page }) => {
    // 1. Log in as standard_user without adding any items. Navigate directly to the cart page.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.goto('https://www.saucedemo.com/cart.html');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);

    // 2. Click the 'Checkout' button.
    // Per BR3 ('Cart cannot be empty when proceeding to checkout') this should ideally be blocked.
    // Confirmed live behavior: the button is enabled and navigates to /checkout-step-one.html with a blank form — documented BR3 gap.
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(page.locator('[data-test="firstName"]')).toHaveValue('');
    await expect(page.locator('[data-test="lastName"]')).toHaveValue('');
    await expect(page.locator('[data-test="postalCode"]')).toHaveValue('');
  });

  test('TC-07 Removing an item from the cart updates the badge and cart contents', async ({ page }) => {
    // 1. Log in as standard_user, add 2 items to cart, go to the cart page.
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(2);

    // 2. Click 'Remove' on one of the two items.
    await page.locator('[data-test="remove-sauce-labs-bike-light"]').click();
    await expect(page.getByText('Sauce Labs Bike Light')).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });
});
