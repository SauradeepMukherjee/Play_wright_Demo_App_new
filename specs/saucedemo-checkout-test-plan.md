# SauceDemo E-commerce Checkout Test Plan (SCRUM-101)

## Application Overview

This test plan covers the SauceDemo (https://www.saucedemo.com) checkout process for SCRUM-101, derived from the approved Requirement Analysis Report (reports/SCRUM-101/requirement-analysis-report.md) and live exploration of the application using the `standard_user` / `secret_sauce` test account.

Scope: Cart Review (AC1) -> Checkout Information Entry (AC2) -> Order Overview (AC3) -> Order Completion (AC4), plus Business Rules BR1-BR5, error handling (AC5), and relevant non-functional aspects (NFR2 mobile, NFR5 validation messages).

Fresh-state assumption: Unless a scenario states otherwise, each test starts from a fresh browser context, navigates to https://www.saucedemo.com, and logs in with `standard_user` / `secret_sauce`. Where a scenario requires an empty cart or logged-out state, this is called out explicitly in the steps. The SauceDemo backend has no real persistence between independent test runs (aside from client-side session/cart state), so tests are designed to be independent and order-agnostic given this fresh-state login precondition.

IMPORTANT — Discrepancies confirmed via live exploration (2026-09-16) vs. the Requirement Analysis Report, each captured as its own scenario below so the automation suite documents actual application behavior rather than assuming the report's expectations are already implemented:
1. FR2 (cart page must show total price calculation) is NOT implemented — the Cart page (cart.html) shows only per-item prices, no subtotal/total. Total/subtotal/tax only appear on the Overview page.
2. AC5 / FR16 / FR17 (validation error messages for invalid data — special characters, incomplete/oversized information) are NOT implemented beyond a simple "required" (non-empty) check. Special characters, whitespace-only text, numeric-only text, and very long strings in First Name, Last Name, and Zip/Postal Code are all silently accepted and the user proceeds to the Overview page.
3. BR3 / FR19 (cart cannot be empty when proceeding to checkout) is NOT enforced — a user can click "Checkout" with zero items, fill in checkout information, and reach the Overview page with "Item total: $0", "Tax: $0.00", "Total: $0.00", and successfully complete an order with no line items.
4. Cancel button destinations are asymmetric: Cancel on the Checkout: Your Information page (step one) returns to cart.html, but Cancel on the Checkout: Overview page (step two) returns to inventory.html (Products page), not to the cart. Cart contents are preserved in both cases.
5. OQ2 is resolved: the checkout information page (step one) DOES expose a Cancel button (contrary to the report's noted risk/ambiguity).
6. OQ4 is resolved: the observed tax rate is 8% of the item subtotal (e.g., $39.98 subtotal -> $3.20 tax -> $43.18 total).
7. An undocumented "Generate PDF order" button appears on the order confirmation page; it is not referenced anywhere in the Requirement Analysis Report's functional requirements.
8. After reaching the order confirmation page, using the browser Back button returns to a stale Checkout: Overview page (now showing an empty/zero cart) whose "Finish" button remains clickable and re-navigates to the confirmation page without any error — no safeguard against re-submitting/re-visiting a completed order was observed (OQ6 area).
9. The product catalog / cart offers no quantity selector — each product can only be added as a single unit per line item; "varying quantities" scenarios referenced in the report's Edge Cases section are not achievable through the UI as implemented.

These discrepancies are treated as confirmed current behavior to be automated and flagged for defect triage per the run-qa-pipeline workflow's downstream Test Healer / AI Failure Classification step — they are not omissions in this test plan.

## Test Scenarios

### 1. Smoke - Full Checkout Happy Path

**Seed:** `tests/seed.spec.ts`

#### 1.1. Complete checkout with a single item

**File:** `tests/saucedemo-checkout/smoke.spec.js`

**Steps:**
  1. Navigate to https://www.saucedemo.com and log in with standard_user / secret_sauce
    - expect: User is redirected to /inventory.html (Products page)
  2. Click 'Add to cart' for Sauce Labs Backpack
    - expect: Cart badge shows '1'
    - expect: Button changes to 'Remove'
  3. Click the cart icon to open the Cart page
    - expect: Cart page (cart.html) lists Sauce Labs Backpack with quantity 1, description, and price $29.99
  4. Click 'Checkout'
    - expect: User is redirected to /checkout-step-one.html ('Checkout: Your Information')
  5. Enter First Name 'Jane', Last Name 'Smith', Zip/Postal Code '12345', then click 'Continue'
    - expect: User is redirected to /checkout-step-two.html ('Checkout: Overview')
  6. Review the Overview page
    - expect: Sauce Labs Backpack line item with qty 1 and price $29.99 is shown
    - expect: Payment Information 'SauceCard #31337' is shown
    - expect: Shipping Information 'Free Pony Express Delivery!' is shown
    - expect: Item total: $29.99, Tax: $2.40 (8%), Total: $32.39
  7. Click 'Finish'
    - expect: User is redirected to /checkout-complete.html
    - expect: Heading 'Thank you for your order!' is displayed
    - expect: Cart badge shows empty (no count)
  8. Click 'Back Home'
    - expect: User is redirected to /inventory.html (Products page)

#### 1.2. Complete checkout with multiple items and verify price arithmetic

**File:** `tests/saucedemo-checkout/smoke.spec.js`

**Steps:**
  1. Log in as standard_user, add Sauce Labs Backpack ($29.99) and Sauce Labs Bike Light ($9.99) to the cart
    - expect: Cart badge shows '2'
  2. Open the Cart page
    - expect: Both items are listed with quantity 1 each and correct individual prices
  3. Click 'Checkout', fill in valid First Name, Last Name, and Zip, then click 'Continue'
    - expect: User reaches the Overview page listing both items
  4. Read the 'Item total', 'Tax', and 'Total' values on the Overview page
    - expect: Item total equals $39.98 (29.99 + 9.99)
    - expect: Tax equals $3.20 (8% of $39.98, rounded)
    - expect: Total equals $43.18 (Item total + Tax)
  5. Click 'Finish'
    - expect: Order completes successfully and cart is cleared

### 2. Cart Review (AC1)

**Seed:** `tests/seed.spec.ts`

#### 2.1. Cart page displays full item details for each product

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user and add Sauce Labs Backpack to the cart
  2. Open the Cart page
    - expect: Item name 'Sauce Labs Backpack' is visible
    - expect: Item description text is visible
    - expect: Item price '$29.99' is visible
    - expect: Item quantity '1' is visible

#### 2.2. Cart page offers Continue Shopping and Checkout options

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user, add any item, and open the Cart page
    - expect: 'Continue Shopping' button is visible and enabled
    - expect: 'Checkout' button is visible and enabled
  2. Click 'Continue Shopping'
    - expect: User is redirected to /inventory.html
    - expect: Cart badge count is unchanged (item still in cart)

#### 2.3. DISCREPANCY: Cart page does not display a total/subtotal price

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user, add two items with different prices, and open the Cart page
    - expect: No subtotal, tax, or total price element is present anywhere on cart.html — only the two individual item prices are shown
    - expect: This contradicts FR2 of the Requirement Analysis Report ('display the total price calculation on the cart page') and should be flagged as a requirement-vs-implementation gap, not silently skipped

### 3. Checkout Information Entry and Validation (AC2, AC5, BR1)

**Seed:** `tests/seed.spec.ts`

#### 3.1. Submitting an entirely empty form shows First Name required error first

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Log in as standard_user, add an item, open Cart, click 'Checkout' to reach checkout-step-one.html
  2. Leave all three fields empty and click 'Continue'
    - expect: An error alert is shown reading 'Error: First Name is required'
    - expect: User remains on checkout-step-one.html

#### 3.2. Leaving only Last Name empty shows Last Name required error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Reach checkout-step-one.html, enter First Name only, leave Last Name and Zip empty, click 'Continue'
    - expect: Error alert reads 'Error: Last Name is required'
    - expect: User remains on checkout-step-one.html

#### 3.3. Leaving only Zip/Postal Code empty shows Postal Code required error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Reach checkout-step-one.html, enter First Name and Last Name, leave Zip empty, click 'Continue'
    - expect: Error alert reads 'Error: Postal Code is required'
    - expect: User remains on checkout-step-one.html

#### 3.4. Valid First Name, Last Name, and Zip proceed to Overview page

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Reach checkout-step-one.html and enter First Name 'Jane', Last Name 'Smith', Zip '12345', click 'Continue'
    - expect: User is redirected to /checkout-step-two.html with no error alert shown

#### 3.5. Error alert can be dismissed via its close control

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Reach checkout-step-one.html, click 'Continue' with all fields empty to trigger the required-field error
    - expect: Error alert is visible
  2. Click the 'Dismiss error' (X) control on the alert
    - expect: The error alert is no longer visible
    - expect: The form fields remain empty and editable

#### 3.6. DISCREPANCY: Special characters in Zip/Postal Code are accepted without a format validation error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Reach checkout-step-one.html, enter First Name 'John', Last Name 'Doe', Zip '!@#$%', click 'Continue'
    - expect: No format-validation error is shown
    - expect: User is redirected to /checkout-step-two.html despite the non-numeric, special-character Zip value
    - expect: This contradicts AC5/FR16/FR17 of the Requirement Analysis Report, which expect a validation error for invalid data such as special characters

#### 3.7. DISCREPANCY: Whitespace-only First Name is accepted as valid

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Reach checkout-step-one.html, enter First Name as three spaces '   ', Last Name 'Doe', Zip '12345', click 'Continue'
    - expect: No 'First Name is required' error is shown even though the field is effectively blank
    - expect: User is redirected to /checkout-step-two.html
    - expect: This contradicts the spirit of FR6/FR7 (mandatory field enforcement) and AC5 (incomplete information should be rejected)

#### 3.8. DISCREPANCY: Oversized name input and special-character Last Name are both accepted

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Reach checkout-step-one.html, enter a First Name of 90+ characters, a Last Name containing digits and special characters (e.g., 'Doe123!@#'), and a valid Zip, then click 'Continue'
    - expect: No length-limit or character-format error is shown for either field
    - expect: User is redirected to /checkout-step-two.html
    - expect: This confirms no max-length or allowed-character validation exists, contradicting the intent of AC5/FR16/FR17

#### 3.9. Numeric 5-digit Zip/Postal Code is accepted (happy-path boundary)

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Reach checkout-step-one.html, enter valid First Name and Last Name, enter Zip '99999', click 'Continue'
    - expect: User is redirected to /checkout-step-two.html with no errors

### 4. Order Overview (AC3)

**Seed:** `tests/seed.spec.ts`

#### 4.1. Overview page lists all cart items with correct details

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Log in, add Sauce Labs Backpack and Sauce Labs Bike Light to the cart, and proceed through checkout information with valid data to reach checkout-step-two.html
    - expect: Both items are listed with correct name, quantity (1 each), and price
    - expect: No 'Add to cart' / 'Remove' controls are shown on this read-only summary

#### 4.2. Overview page displays Payment and Shipping information sections

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Reach checkout-step-two.html with at least one item in the cart
    - expect: 'Payment Information:' section shows 'SauceCard #31337'
    - expect: 'Shipping Information:' section shows 'Free Pony Express Delivery!'

#### 4.3. Overview page provides Cancel and Finish controls

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Reach checkout-step-two.html with at least one item in the cart
    - expect: 'Cancel' button is visible and enabled
    - expect: 'Finish' button is visible and enabled

### 5. Order Completion (AC4, FR20)

**Seed:** `tests/seed.spec.ts`

#### 5.1. Finish redirects to confirmation page with success message

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. Complete checkout information and reach checkout-step-two.html with at least one item, then click 'Finish'
    - expect: User is redirected to /checkout-complete.html
    - expect: Heading 'Thank you for your order!' is displayed
    - expect: Descriptive text about dispatch/delivery is displayed
    - expect: 'Back Home' button is visible

#### 5.2. Back Home button returns to the Products page

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. Reach checkout-complete.html by completing an order
  2. Click 'Back Home'
    - expect: User is redirected to /inventory.html (Products page)
    - expect: Product grid is displayed

#### 5.3. Cart is cleared after order confirmation

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. Add two items to the cart, complete checkout through 'Finish' to reach checkout-complete.html
    - expect: Cart icon shows no item count badge ('Cart, empty')
  2. Open the Cart page directly
    - expect: Cart page shows zero line items

### 6. Business Rules and Access Control (BR2, BR3, FR18, FR19)

**Seed:** `tests/seed.spec.ts`

#### 6.1. Unauthenticated direct access to checkout is blocked and redirected to login

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Without logging in (or after explicitly logging out via the hamburger menu 'Logout' link), navigate directly to https://www.saucedemo.com/checkout-step-one.html
    - expect: User is redirected to the login page ('/')
    - expect: An error alert is shown reading: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."

#### 6.2. DISCREPANCY: Checking out with an empty cart is not blocked and can be completed with a $0.00 total

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Log in as standard_user with a guaranteed-empty cart (e.g., immediately after logging in fresh, or after completing/clearing a prior order), open the Cart page
    - expect: 'Checkout' button is present and enabled even though the cart has zero items
  2. Click 'Checkout'
    - expect: User is unexpectedly redirected to /checkout-step-one.html instead of being blocked or shown an empty-cart message — this contradicts BR3/FR19
  3. Fill in valid First Name, Last Name, and Zip, then click 'Continue'
    - expect: User reaches /checkout-step-two.html showing 'Item total: $0', 'Tax: $0.00', 'Total: $0.00', and no line items
  4. Click 'Finish'
    - expect: Order completes successfully and /checkout-complete.html is shown, confirming an order with zero items was allowed end-to-end — flag as a confirmed defect against BR3/FR19

#### 6.3. Logged-in session persists across checkout steps for a valid multi-step flow

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Log in as standard_user, add an item, and progress through Cart -> Checkout Info -> Overview -> Complete without logging out
    - expect: No re-authentication is required at any step
    - expect: Each page transition succeeds without redirect to login

#### 6.4. Attempting to check out again immediately after order completion (empty cart) reproduces the same empty-cart defect

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Complete a full order for one item so the cart becomes empty, then click 'Checkout' again from the now-empty cart page
    - expect: The application again allows navigation to checkout-step-one.html despite zero items, reproducing the BR3/FR19 gap rather than showing any 'cart is empty' guard message

### 7. Navigation and Cancel Flows (BR5, OQ2, OQ6, OQ9)

**Seed:** `tests/seed.spec.ts`

#### 7.1. Cancel from Checkout Information page returns to Cart page with items preserved

**File:** `tests/saucedemo-checkout/navigation.spec.js`

**Steps:**
  1. Log in, add two items to the cart, click 'Checkout' to reach checkout-step-one.html
  2. Click 'Cancel' on the Checkout Information page
    - expect: User is redirected to /cart.html (Your Cart)
    - expect: Both items are still present in the cart with correct quantities and prices

#### 7.2. DISCREPANCY: Cancel from Checkout Overview page returns to Products page, not the Cart page

**File:** `tests/saucedemo-checkout/navigation.spec.js`

**Steps:**
  1. Log in, add two items to the cart, proceed through valid checkout information to reach checkout-step-two.html
  2. Click 'Cancel' on the Checkout Overview page
    - expect: User is redirected to /inventory.html (Products page), NOT /cart.html — this is inconsistent with the step-one Cancel destination and with the implied 'return to cart' behavior in BR5
    - expect: Cart badge still shows the original item count, confirming cart contents are preserved even though the landing page differs

#### 7.3. Browser back button after order confirmation shows a stale Overview page whose Finish button is still clickable

**File:** `tests/saucedemo-checkout/navigation.spec.js`

**Steps:**
  1. Complete a full order for one item to reach checkout-complete.html
  2. Click the browser Back button
    - expect: Browser navigates to /checkout-step-two.html showing an empty/zero-value order summary (cart already cleared)
    - expect: 'Finish' button is still present and enabled
  3. Click 'Finish' again
    - expect: User is redirected back to /checkout-complete.html without any error, confirming no safeguard exists against re-submitting after order completion via back navigation

### 8. Non-Functional Exploratory (NFR2 Mobile Responsiveness, NFR5 Validation Messaging)

**Seed:** `tests/seed.spec.ts`

#### 8.1. Full checkout flow renders and completes at a mobile viewport (375x667)

**File:** `tests/saucedemo-checkout/mobile-responsiveness.spec.js`

**Steps:**
  1. Set the browser viewport to 375x667 (e.g., iPhone SE dimensions), log in as standard_user
    - expect: Login form and hamburger menu icon render without horizontal overflow
  2. Add an item to the cart and proceed through Cart -> Checkout Info -> Overview -> Complete at this viewport
    - expect: All buttons and form fields remain visible, tappable, and functional at each step
    - expect: No layout element is clipped or overlapping such that a user could not complete checkout

#### 8.2. All checkout-flow validation and success messages are captured for content review

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Trigger each of: First Name required, Last Name required, Postal Code required, and the order-confirmation success message, capturing the exact text of each
    - expect: 'Error: First Name is required'
    - expect: 'Error: Last Name is required'
    - expect: 'Error: Postal Code is required'
    - expect: 'Thank you for your order!' success heading on checkout-complete.html
    - expect: All messages are recorded verbatim in the automated assertions per NFR5 (validate all checkout form validation messages)
