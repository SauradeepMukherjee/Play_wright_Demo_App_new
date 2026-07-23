const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.saucedemo.com');
  await page.fill('input[data-test="username"]', 'standard_user');
  await page.fill('input[data-test="password"]', 'secret_sauce');
  await page.click('input[data-test="login-button"]');
  await page.waitForURL(/inventory\.html/);
  await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.waitForSelector('span.shopping_cart_badge', { timeout: 5000 });
  const badge = await page.$('span.shopping_cart_badge');
  console.log('badgeExists', !!badge);
  if (badge) {
    console.log('badgeText', await badge.textContent());
  }
  const cartHtml = await page.innerHTML('a.shopping_cart_link');
  console.log('shopping_cart_link html', cartHtml);

  await page.click('a.shopping_cart_link');
  await page.waitForURL(/cart\.html/);
  await page.click('button[data-test="checkout"]');
  await page.waitForURL(/checkout-step-one\.html/);
  console.log('checkout-info page content');
  console.log(await page.innerHTML('.checkout_info_wrapper'));
  console.log('error exists before invalid input', !!(await page.$('[data-test="error"]')));
  await page.fill('input[data-test="firstName"]', '@da!');
  await page.fill('input[data-test="lastName"]', '#Love');
  await page.fill('input[data-test="postalCode"]', '!@#');
  await page.click('input[data-test="continue"]');
  await page.waitForTimeout(1000);
  const err = await page.$('[data-test="error"]');
  console.log('error exists after continue', !!err);
  if (err) console.log('error text', await err.textContent());
  console.log('checkout input placeholders', await page.$$eval('input.form_input', els => els.map(el => el.getAttribute('placeholder'))));
  console.log('checkout input IDs', await page.$$eval('input.form_input', els => els.map(el => el.id)));

  await page.waitForSelector('button[data-test="finish"]', { timeout: 5000 });
  await page.click('button[data-test="finish"]');
  await page.waitForURL(/checkout-complete\.html/);
  console.log('completion page html', await page.innerHTML('.checkout_complete_container'));
  const completeHeader = await page.textContent('.complete-header');
  console.log('completeHeader', completeHeader);
  console.log('back-to-products exists', !!(await page.$('button[data-test="back-to-products"]')));
  console.log('back-to-products text', await page.textContent('button[data-test="back-to-products"]'));

  await browser.close();
})();
