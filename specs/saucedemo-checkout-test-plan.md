# SauceDemo E-commerce Checkout — Structured Test Plan (SCRUM-101)

## Application Overview

This test plan covers the end-to-end checkout process on the SauceDemo demo storefront (https://www.saucedemo.com) for the `standard_user` persona, derived from the approved Requirement Analysis Report for SCRUM-101 (reports/SCRUM-101/requirement-analysis-report.md). It maps directly to acceptance criteria AC1-AC5 and business rules BR1-BR5, and incorporates the report's flagged edge cases (EDGE-01..06), QA coverage recommendations, and open risks.

Application under test: https://www.saucedemo.com
Test credentials: username `standard_user`, password `secret_sauce` (password is shared across all listed personas: `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`).

Fresh-state assumptions (apply to every scenario unless a step says otherwise):
- Start from a fresh, unauthenticated browser context (no cached session/local storage) at https://www.saucedemo.com.
- Unless a scenario is specifically testing an empty-cart condition, log in as `standard_user` and add the number of items the scenario specifies before proceeding.
- The SauceDemo backend resets item state per session; no server-side seeding/teardown is required between scenarios besides logging in fresh and/or using the "Reset App State" menu option or logging out.
- All monetary calculations assume SauceDemo's fixed 8% tax rate (observed: $39.98 items -> $3.20 tax -> $43.18 total during exploration).

Live-exploration discrepancies found between the approved Requirement Analysis Report and actual application behavior (each is captured as its own scenario below so the gap is regression-tracked, not silently dropped):
1. FR-02 says the cart page must display "the total price calculation." The live cart page (cart.html) shows only per-item QTY/Description/Price — there is no subtotal/total display anywhere on the cart page; totals only appear on the Overview page (checkout-step-two.html).
2. BR3 ("Cart cannot be empty when proceeding to checkout") is NOT enforced by the live application: the Checkout button on an empty cart is enabled and clickable, and direct URL navigation to /checkout-step-one.html with an empty (but logged-in) session succeeds and shows a blank checkout form instead of blocking/redirecting.
3. BR5 ("Users can cancel checkout at any step and return to cart") is only true on the checkout information page (Cancel -> cart.html). On the Overview page, Cancel actually redirects to the Products/inventory page (inventory.html), not the cart page — a direct contradiction of BR5's literal wording for that step.
4. AC5/FR-11 ("invalid data e.g. special characters... must produce appropriate validation error messages and prevent the user from proceeding") is NOT enforced: First Name, Last Name, and Zip/Postal Code fields accept special characters (e.g. `!@#$%^&*()`) and whitespace-only values without any validation error, and the user proceeds normally to the Overview page. The only validation implemented is a "required/non-empty" check per field (evaluated in DOM order: First Name, then Last Name, then Postal Code), surfaced as `Error: First Name is required` / `Error: Last Name is required` / `Error: Postal Code is required`.
5. BR2 (login required) and BR4 (cart cleared after order confirmation) ARE correctly enforced by the live app: unauthenticated direct navigation to any checkout URL redirects to login with `Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.`, and the cart badge/cart contents are empty immediately after order completion.
6. Browser back-button navigation from the Overview page back to the checkout information page clears the previously entered First Name/Last Name/Zip values (form resets) while the cart contents are preserved — this is undocumented in any AC/BR and worth an explicit regression scenario.
7. The order confirmation page includes a "Generate PDF order" button not mentioned anywhere in the requirement document — out of scope for this plan's assertions per the report's guidance not to test undocumented functionality, but flagged for product-owner awareness.

These discrepancies should be reported back to the product owner per the source report's Open Questions (OQ-01 through OQ-05) and QA Coverage Recommendations before automation locks in "expected" values that don't match reality.

## Test Scenarios

### 1. Suite 1 — Cart Review (AC1, FR-01/02/03, BR3, EDGE-06)

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-01 Happy path — cart displays single item with full details

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user/secret_sauce.
    - expect: Redirected to /inventory.html (Products page).
  2. Click 'Add to cart' for Sauce Labs Backpack.
    - expect: Cart badge shows '1'.
    - expect: Button label changes to 'Remove'.
  3. Click the cart icon to navigate to the cart page.
    - expect: URL is /cart.html.
    - expect: Page heading reads 'Your Cart'.
  4. Inspect the cart line item.
    - expect: Item name 'Sauce Labs Backpack' is shown.
    - expect: Item description text is shown.
    - expect: Price '$29.99' is shown.
    - expect: Quantity is '1'.

#### 1.2. TC-02 Happy path — cart displays multiple items with correct per-item quantities

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user. From the Products page, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart.
    - expect: Cart badge shows '2'.
  2. Navigate to the cart page.
    - expect: Both items are listed, each showing name, description, price ($29.99 and $9.99 respectively), and quantity '1'.

#### 1.3. TC-03 Discrepancy check — cart page does not display a total price (FR-02 gap)

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user and add 2 items to the cart, then navigate to the cart page.
    - expect: Cart page renders only a QTY/Description table plus 'Continue Shopping' and 'Checkout' buttons.
  2. Search the cart page for any subtotal/tax/total text.
    - expect: No total price element is present on cart.html — this documents that FR-02 is not met by the current cart page implementation; total only appears later on the Overview page. Record as a known gap rather than a pass/fail on FR-02 in isolation.

#### 1.4. TC-04 'Continue Shopping' returns to Products page and preserves cart contents

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user, add 1 item to cart, navigate to the cart page.
    - expect: Item is listed.
  2. Click 'Continue Shopping'.
    - expect: Redirected to /inventory.html.
  3. Re-open the cart page.
    - expect: The previously added item is still present; cart badge still shows '1'.

#### 1.5. TC-05 'Checkout' button navigates to the checkout information page when the cart has items

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user, add at least 1 item, go to the cart page.
    - expect: Checkout button is visible and enabled.
  2. Click 'Checkout'.
    - expect: Redirected to /checkout-step-one.html.
    - expect: Page heading reads 'Checkout: Your Information'.

#### 1.6. TC-06 Edge case — Checkout button is clickable with an empty cart (BR3 not enforced)

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user without adding any items. Navigate directly to the cart page.
    - expect: Cart page shows no line items; cart badge shows 'empty'.
  2. Click the 'Checkout' button.
    - expect: Per BR3 ('Cart cannot be empty when proceeding to checkout'), this should ideally be blocked. Actual live behavior: the button is enabled and clicking it successfully navigates to /checkout-step-one.html with a blank form — record this as a confirmed BR3 gap, not a test tooling failure.

#### 1.7. TC-07 Removing an item from the cart updates the badge and cart contents

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user, add 2 items to cart, go to the cart page.
    - expect: Cart badge shows '2'; both items listed.
  2. Click 'Remove' on one of the two items.
    - expect: That item disappears from the list.
    - expect: Cart badge decrements to '1'.

### 2. Suite 2 — Checkout Information Entry & Validation (AC2, AC5, FR-04/05/06/11, BR1, EDGE-01/02/03)

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-08 Happy path — valid checkout information proceeds to Overview

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Log in as standard_user, add 1 item to cart, click 'Checkout' from the cart page.
    - expect: On /checkout-step-one.html with First Name, Last Name, Zip/Postal Code fields and Cancel/Continue buttons visible.
  2. Fill First Name = 'Jane', Last Name = 'Smith', Zip/Postal Code = '12345'. Click 'Continue'.
    - expect: Redirected to /checkout-step-two.html.
    - expect: No error message is shown.

#### 2.2. TC-09 Validation — empty First Name shows field-specific required error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Log in, add an item, reach the checkout information page. Leave all fields empty. Click 'Continue'.
    - expect: An error banner appears with the exact text 'Error: First Name is required'.
    - expect: URL remains /checkout-step-one.html (user is not allowed to proceed).

#### 2.3. TC-10 Validation — empty Last Name (First Name filled) shows field-specific required error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the checkout information page, fill First Name only ('John'). Leave Last Name and Zip empty. Click 'Continue'.
    - expect: Error banner text is exactly 'Error: Last Name is required'.
    - expect: User remains on /checkout-step-one.html.

#### 2.4. TC-11 Validation — empty Postal Code (First & Last filled) shows field-specific required error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the checkout information page, fill First Name ('John') and Last Name ('Doe'). Leave Zip/Postal Code empty. Click 'Continue'.
    - expect: Error banner text is exactly 'Error: Postal Code is required'.
    - expect: Note: the live error message says 'Postal Code', not the field label 'Zip/Postal Code' shown on the form — record this label/message wording mismatch.
    - expect: User remains on /checkout-step-one.html.

#### 2.5. TC-12 Edge case (EDGE-01) — submitting with all three fields empty only surfaces the first field's error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On a fresh checkout information page, leave First Name, Last Name, and Zip/Postal Code all empty. Click 'Continue' once.
    - expect: Only a single error is shown: 'Error: First Name is required' (the validation is sequential/first-invalid-field-wins, not an aggregate list of all missing fields).

#### 2.6. TC-13 Discrepancy check (EDGE-02) — whitespace-only values bypass required-field validation

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the checkout information page, enter three spaces ('   ') into First Name, Last Name, and Zip/Postal Code. Click 'Continue'.
    - expect: Per AC5/FR-11 this should arguably be treated as incomplete/invalid. Actual live behavior: no error is shown and the user is redirected to /checkout-step-two.html — record this as a confirmed validation gap (whitespace is not trimmed/rejected).

#### 2.7. TC-14 Discrepancy check (AC5/FR-11) — special characters are accepted without validation error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the checkout information page, enter First Name = 'John', Last Name = 'Doe', Zip/Postal Code = '!@#$%^&*()'. Click 'Continue'.
    - expect: Per AC5/FR-11 special characters should produce a validation error and block progress. Actual live behavior: no error is shown and the user proceeds to /checkout-step-two.html — record this as a confirmed AC5/FR-11 gap.

#### 2.8. TC-15 Boundary — very long input in First Name field is accepted without truncation error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the checkout information page, enter a 300-character string into First Name, valid values in Last Name ('Doe') and Zip ('12345'). Click 'Continue'.
    - expect: Document actual behavior: whether the app accepts the long value and proceeds to Overview, truncates it silently, or shows a length-related error. Flag any silent truncation or overflow/layout break as a defect.

#### 2.9. TC-16 Edge case (EDGE-03) — non-numeric/alphanumeric Zip/Postal Code is accepted

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the checkout information page, enter First Name = 'John', Last Name = 'Doe', Zip/Postal Code = 'SW1A 1AA' (UK-style alphanumeric postal code). Click 'Continue'.
    - expect: No format-specific error is shown; the user proceeds to /checkout-step-two.html — confirms the app performs no format/pattern validation on postal code, only a presence check.

#### 2.10. TC-17 BR5 on checkout information page — Cancel returns user to the Cart page

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Log in, add an item, reach the checkout information page (do not fill any fields).
    - expect: Cancel and Continue buttons are visible.
  2. Click 'Cancel'.
    - expect: Redirected to /cart.html.
    - expect: The previously added item is still present in the cart (not cleared).

#### 2.11. TC-18 Error banner can be dismissed via its close (X) control

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Trigger the 'Error: First Name is required' message by clicking 'Continue' with all fields empty.
    - expect: Error banner is visible.
  2. Click the dismiss/close (X) icon on the error banner.
    - expect: The error banner disappears from the page.

#### 2.12. TC-19 BR2 — direct URL navigation to the checkout information page while logged out redirects to Login

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Ensure no active session (log out if needed, or use a fresh unauthenticated context). Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    - expect: Redirected to the login page (/).
    - expect: An error banner reads exactly: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."

### 3. Suite 3 — Order Overview (AC3, FR-07/08/09, BR5, RISK-04)

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-20 Happy path — Overview page shows item summary, payment info, and shipping info

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Log in as standard_user, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart, proceed through Checkout with valid info (First Name/Last Name/Zip all filled).
    - expect: Redirected to /checkout-step-two.html with heading 'Checkout: Overview'.
  2. Inspect the page content.
    - expect: Both items are listed with name, description, and price.
    - expect: 'Payment Information:' section shows 'SauceCard #31337'.
    - expect: 'Shipping Information:' section shows 'Free Pony Express Delivery!'.
    - expect: Note: SauceDemo has no payment-method-selection UI (per RISK-04) — do not assert on a payment method picker, only on the static payment info text.

#### 3.2. TC-21 Happy path — Overview page calculates item total, tax, and grand total correctly for a multi-item cart

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Add Sauce Labs Backpack ($29.99) and Sauce Labs Bike Light ($9.99) to the cart and proceed to the Overview page with valid checkout info.
    - expect: 'Item total:' reads '$39.98' (sum of item prices).
    - expect: 'Tax:' reads a value consistent with the site's tax rate (observed $3.20, i.e. 8% of item total).
    - expect: 'Total:' reads the sum of item total + tax (observed '$43.18').

#### 3.3. TC-22 Discrepancy check (BR5) — Cancel on the Overview page redirects to Products, not Cart

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Reach the Overview page (/checkout-step-two.html) via a valid checkout flow with at least 1 item in the cart.
    - expect: Cancel and Finish buttons are visible.
  2. Click 'Cancel'.
    - expect: Per BR5 ('...return to cart') this should redirect to /cart.html. Actual live behavior: redirects to /inventory.html (Products page) instead — record this as a confirmed BR5 wording/implementation mismatch.
    - expect: The cart item count is preserved (not cleared) despite the redirect target difference.

#### 3.4. TC-23 Happy path — Finish button on the Overview page completes the order

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Reach the Overview page via a valid checkout flow.
    - expect: Finish button is visible and enabled.
  2. Click 'Finish'.
    - expect: Redirected to /checkout-complete.html.

### 4. Suite 4 — Order Completion (AC4, FR-10, BR4)

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-24 Happy path — confirmation page shows success message and Back Home button

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. Complete a full checkout flow (login -> add item -> cart -> valid checkout info -> Overview -> Finish).
    - expect: On /checkout-complete.html with heading 'Checkout: Complete!'.
    - expect: Text 'Thank you for your order!' is displayed.
    - expect: Supporting text 'Your order has been dispatched, and will arrive just as fast as the pony can get there!' is displayed.
    - expect: A 'Back Home' button is visible.

#### 4.2. TC-25 'Back Home' button returns the user to the Products page

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. From the order confirmation page, click 'Back Home'.
    - expect: Redirected to /inventory.html.
    - expect: Page heading reads 'Products'.

#### 4.3. TC-26 BR4 — cart is cleared after order confirmation

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. Complete a full checkout flow with 2 items in the cart, through to /checkout-complete.html.
    - expect: Cart badge on the confirmation page shows 'empty' (no numeric badge).
  2. Click 'Back Home' and open the cart page.
    - expect: Cart page shows zero line items, confirming BR4 is correctly implemented.

### 5. Suite 5 — Cross-Cutting Navigation, Business Rules & End-to-End Regression (BR2/BR3/BR5, EDGE-04/05, Technical Notes)

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-27 Edge case (EDGE-04) — direct URL navigation to checkout information page with an empty cart while logged in

**File:** `tests/saucedemo-checkout/navigation.spec.js`

**Steps:**
  1. Log in as standard_user. Do not add any items. Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    - expect: Per BR3 this should ideally be blocked/redirected given the empty cart. Actual live behavior: the checkout information form loads normally with an empty cart badge — record as a confirmed BR3 gap consistent with TC-06.

#### 5.2. TC-28 Edge case (EDGE-05, Technical Notes) — browser Back button from Overview clears entered checkout info but preserves cart

**File:** `tests/saucedemo-checkout/navigation.spec.js`

**Steps:**
  1. Log in, add 1 item, proceed through checkout info (First Name='Jane', Last Name='Smith', Zip='12345') to the Overview page.
    - expect: On /checkout-step-two.html with the item and totals shown.
  2. Use the browser's Back navigation (not the in-page Cancel button).
    - expect: Returns to /checkout-step-one.html.
    - expect: First Name, Last Name, and Zip/Postal Code fields are all empty (previously entered values are not restored) — record this as expected/actual behavior for the back-button, since no AC/BR defines it explicitly.
    - expect: Cart badge still shows the item added earlier (cart contents are not lost by the back navigation).

#### 5.3. TC-29 Full end-to-end happy-path regression: Cart -> Checkout Info -> Overview -> Confirmation (AC1 through AC4 chained)

**File:** `tests/saucedemo-checkout/smoke.spec.js`

**Steps:**
  1. Log in as standard_user/secret_sauce.
    - expect: Redirected to /inventory.html.
  2. Add 'Sauce Labs Backpack' and 'Sauce Labs Fleece Jacket' to the cart.
    - expect: Cart badge shows '2'.
  3. Open the cart page and verify both items are listed, then click 'Checkout'.
    - expect: Redirected to /checkout-step-one.html.
  4. Fill First Name='Alex', Last Name='Rivera', Zip='90210', and click 'Continue'.
    - expect: Redirected to /checkout-step-two.html with no validation errors.
  5. Verify the Overview page shows both items, payment/shipping info, and a total of item total ($79.98) plus tax, then click 'Finish'.
    - expect: Redirected to /checkout-complete.html.
  6. Verify the success message and click 'Back Home'.
    - expect: 'Thank you for your order!' is shown before navigating.
    - expect: After clicking, redirected to /inventory.html and the cart is empty, completing the full regression path.

#### 5.4. TC-30 BR1 — all three checkout information fields are individually mandatory (combined verification)

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Reach the checkout information page with an item in the cart. Attempt to submit with only Zip/Postal Code filled (First Name and Last Name empty).
    - expect: Error: 'Error: First Name is required' is shown (first missing mandatory field in DOM order), confirming First Name is enforced as mandatory even when a later field is filled.
  2. Fill First Name, leave Last Name empty, keep Zip filled. Click 'Continue'.
    - expect: Error: 'Error: Last Name is required' is shown, confirming Last Name is independently mandatory regardless of Zip being filled.
  3. Fill First Name and Last Name, clear Zip/Postal Code. Click 'Continue'.
    - expect: Error: 'Error: Postal Code is required' is shown, confirming all three fields are independently mandatory per BR1.
