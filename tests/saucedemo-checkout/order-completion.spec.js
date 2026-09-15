// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

const { test, expect } = require('@playwright/test');

async function completeCheckoutThroughOverview(page, itemTestIds) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  for (const testId of itemTestIds) {
    await page.locator(`[data-test="add-to-cart-${testId}"]`).click();
  }
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
}

test.describe('Order Completion (AC4, FR-10, FR-14, BR4)', () => {
  test('TC-COMP-01: Finish redirects to a confirmation page with a success message', async ({ page }) => {
    // 1. Complete the full checkout flow through the Overview page, then click 'Finish'.
    await completeCheckoutThroughOverview(page, ['sauce-labs-backpack']);
    await page.locator('[data-test="finish"]').click();

    // expect: User is redirected to /checkout-complete.html
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    // expect: A 'Pony Express' image, heading 'Thank you for your order!', and dispatch confirmation text are displayed
    await expect(page.locator('[data-test="pony-express"]')).toBeVisible();
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="complete-text"]')).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    );
  });

  test('TC-COMP-02: \'Back Home\' returns to the Products page', async ({ page }) => {
    // 1. From the order confirmation page, click 'Back Home'.
    await completeCheckoutThroughOverview(page, ['sauce-labs-backpack']);
    await page.locator('[data-test="finish"]').click();
    await page.locator('[data-test="back-to-products"]').click();

    // expect: User is redirected to /inventory.html
    await expect(page).toHaveURL(/\/inventory\.html$/);
    // expect: The products grid is displayed
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('TC-COMP-03: Cart is empty immediately after order completion', async ({ page }) => {
    // 1. Complete a checkout with 2 items in the cart through to the confirmation page.
    await completeCheckoutThroughOverview(page, ['sauce-labs-backpack', 'sauce-labs-bike-light']);
    await page.locator('[data-test="finish"]').click();

    // expect: The cart icon shows 'Cart, empty' with no numeric badge on the confirmation page
    // itself, before even clicking 'Back Home'
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);

    // 2. Navigate to /cart.html directly.
    await page.goto('https://www.saucedemo.com/cart.html');

    // expect: Cart page shows no items, confirming BR4/FR-14
    await expect(page.locator('.cart_item')).toHaveCount(0);
  });

  test('TC-COMP-04 [UNDOCUMENTED FEATURE]: \'Generate PDF order\' button is present and does not error', async ({ page }) => {
    // 1. On the order confirmation page, locate and click 'Generate PDF order'.
    await completeCheckoutThroughOverview(page, ['sauce-labs-backpack']);
    await page.locator('[data-test="finish"]').click();

    // Note: this button is not described anywhere in the requirement document; flagged for
    // stakeholder awareness rather than treated as in/out of scope automatically.
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-test="generate-pdf-order"]').click();
    const download = await downloadPromise;

    // expect: The action completes without a JavaScript error or broken navigation
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});
