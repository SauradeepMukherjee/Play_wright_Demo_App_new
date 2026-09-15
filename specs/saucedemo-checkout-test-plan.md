# SauceDemo Checkout — Structured Test Plan (SCRUM-101)

## Application Overview

## Application Under Test
https://www.saucedemo.com (Swag Labs demo storefront). Test account: `standard_user` / `secret_sauce`.

## Source
Derived from the approved Requirement Analysis Report (`reports/SCRUM-101/requirement-analysis-report.md`) for SCRUM-101 "E-commerce Checkout Process" (FR-01–FR-15, NFR-01–NFR-04, AC1–AC5, BR1–BR5), cross-checked against live exploration of the application on 2026-09-15 using the standard_user account.

## Fresh-State Assumption
Unless a test explicitly states otherwise, every test begins from a fresh browser context: no prior login session, no items in cart. Tests log in via the login form (`/`) with `standard_user` / `secret_sauce` before exercising checkout, and add the specific products the test needs. Tests are independent and may be run in any order; none depend on state left behind by another test.

## Live-Exploration Findings vs. Requirement Analysis Report (discrepancies)
The following were confirmed by direct interaction with the live application and are called out explicitly in the relevant test scenarios below (marked DISCREPANCY) rather than silently assumed:

1. **FR-02 (cart total) — NOT MET.** The Cart page (`/cart.html`) shows each item's individual price only; there is no subtotal/total price element anywhere on the cart page. The total price calculation (item total, tax, total) only appears on the Checkout Overview page (`/checkout-step-two.html`).
2. **AC5 / FR-11 (invalid-data validation) — NOT MET for special characters.** Entering special characters (e.g. `!@#$%^&*()`) into the Zip/Postal Code field (and likewise into First/Last Name) does not trigger any validation error; the form accepts the value and proceeds normally to the Overview page. Only empty-field validation is implemented (AC2), not the "special characters / incomplete information" validation described in AC5.
3. **BR3 / FR-13 (empty cart cannot proceed to checkout) — NOT MET.** With an empty cart, the "Checkout" button on the cart page remains enabled; clicking it navigates to the Checkout Information page, and the entire checkout flow (including Finish) can be completed with an empty cart, showing "Item total: $0", "Tax: $0.00", "Total: $0.00" and a normal order-confirmation success message. No blocking behavior or error message exists.
4. **BR5 (cancel at any step returns to cart) — PARTIALLY MET.** Cancel on the Checkout Information page (step one) does return to `/cart.html` as expected. However, Cancel on the Checkout Overview page (step two) redirects to `/inventory.html` (Products page), not back to the cart — contradicting the literal wording of BR5.
5. **BR2 / FR-12 (login required) — MET.** Direct URL access to `/checkout-step-one.html` or `/cart.html` while logged out correctly redirects to the login page with a clear error: `Epic sadface: You can only access '<path>' when you are logged in.`
6. **FR-06 (empty-field error messages) — MET, and sequential.** Validation is field-by-field in DOM order: with all fields empty, only "First Name is required" is shown; after filling First Name, re-submitting shows "Last Name is required"; after filling both, "Postal Code is required". Multiple simultaneous errors are never shown at once (resolves Open Question #2 partially — exact copy is "Error: <Field> is required").
7. **AC4 / FR-10 — MET**, plus an **undocumented feature**: the confirmation page also has a "Generate PDF order" button not mentioned anywhere in the requirement document — flagged for stakeholder awareness, not treated as a defect.
8. **Data persistence — undocumented behavior clarified.** Browser back-button navigation from Overview back to the Information page, and a page refresh on the Information page, both clear any entered (but not yet submitted) form field values; however, cart contents (item count) persist across both actions. This resolves Open Question edge cases around back-navigation/refresh with an observed (not assumed) behavior.
9. **FR-14 / BR4 — MET.** Cart badge is empty immediately after order completion, confirmed for both a normal order and the empty-cart edge case.

## Out of Scope (per Requirement Analysis Report)
Payment-method selection UI, NFR-03 (usability/"intuitive"), NFR-04 (security), non-`standard_user` accounts (locked_out_user, problem_user, etc.), and cross-browser/mobile matrices are explicitly excluded from this plan, consistent with the RA report's QA Coverage Recommendations and flagged Open Questions.


## Test Scenarios

### 1. Smoke / Happy Path

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-SMOKE-01: Complete full checkout with a single item

**File:** `tests/saucedemo-checkout/smoke.spec.js`

**Steps:**
  1. Navigate to https://www.saucedemo.com and log in with username 'standard_user' and password 'secret_sauce'.
    - expect: User is redirected to /inventory.html
    - expect: Product grid with 6 items is visible
  2. Click 'Add to cart' for 'Sauce Labs Backpack'.
    - expect: Cart badge shows '1'
    - expect: Button changes to 'Remove'
  3. Click the cart icon to open the cart page.
    - expect: Cart page (/cart.html) shows 'Sauce Labs Backpack', its description, price $29.99, and quantity 1
  4. Click the 'Checkout' button.
    - expect: User is redirected to /checkout-step-one.html
    - expect: Page heading reads 'Checkout: Your Information'
    - expect: First Name, Last Name, and Zip/Postal Code fields are visible
  5. Enter First Name 'John', Last Name 'Doe', Zip '12345', then click 'Continue'.
    - expect: User is redirected to /checkout-step-two.html
    - expect: Page heading reads 'Checkout: Overview'
  6. Review the overview page contents.
    - expect: Item 'Sauce Labs Backpack' qty 1 price $29.99 is listed
    - expect: 'Payment Information: SauceCard #31337' is shown
    - expect: 'Shipping Information: Free Pony Express Delivery!' is shown
    - expect: Item total: $29.99, Tax: $2.40, Total: $32.39
  7. Click 'Finish'.
    - expect: User is redirected to /checkout-complete.html
    - expect: Heading 'Thank you for your order!' is visible
    - expect: Dispatch confirmation text and 'Back Home' button are visible
    - expect: Cart badge is empty (no count shown)
  8. Click 'Back Home'.
    - expect: User is redirected to /inventory.html
    - expect: Cart remains empty

#### 1.2. TC-SMOKE-02: Complete checkout with multiple items

**File:** `tests/saucedemo-checkout/smoke.spec.js`

**Steps:**
  1. Log in as standard_user and add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to the cart from the inventory page.
    - expect: Cart badge shows '2'
  2. Open the cart page and click 'Checkout'.
    - expect: Both items are listed on the cart page with correct name, description, price, and qty=1 each
    - expect: User reaches /checkout-step-one.html
  3. Enter valid First Name, Last Name, and Zip, then click 'Continue'.
    - expect: User is redirected to /checkout-step-two.html
    - expect: Both items are listed in the order summary
  4. Verify the price breakdown.
    - expect: Item total: $39.98
    - expect: Tax: $3.20
    - expect: Total: $43.18
  5. Click 'Finish'.
    - expect: Order confirmation page is shown with success message
    - expect: Cart badge is empty

#### 1.3. TC-SMOKE-03: Checkout flow is fully blocked without authentication

**File:** `tests/saucedemo-checkout/smoke.spec.js`

**Steps:**
  1. Without logging in, navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    - expect: User is redirected to the login page (/)
    - expect: An error alert reads: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."

### 2. Cart Review (AC1, FR-01–FR-03)

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-CART-01: Cart page displays complete details for every item

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user, add 'Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt', and 'Sauce Labs Onesie' to the cart, then open the cart page.
    - expect: Each of the 3 items shows its name, full description text, unit price, and quantity (1) in the QTY/Description table

#### 2.2. TC-CART-02 [DISCREPANCY]: Cart page does not display a total price

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user, add two items to the cart, and open the cart page.
    - expect: Only each item's individual unit price is shown; the cart page contains no subtotal, item-total, or grand-total element
    - expect: This documents a gap against FR-02, which requires the cart page to display a total price calculation; the total only appears later on the Overview page

#### 2.3. TC-CART-03: 'Continue Shopping' returns to products page without changing cart

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user, add one item to the cart, open the cart page, then click 'Continue Shopping'.
    - expect: User is redirected to /inventory.html
    - expect: Cart badge still shows '1' (cart contents unchanged)

#### 2.4. TC-CART-04: Removing an item from the cart page updates the list and badge

**File:** `tests/saucedemo-checkout/cart-review.spec.js`

**Steps:**
  1. Log in as standard_user, add two items to the cart, open the cart page, then click 'Remove' next to one item.
    - expect: The removed item disappears from the cart list
    - expect: Cart badge count decrements from '2' to '1'
  2. Click 'Remove' on the remaining item.
    - expect: Cart list is empty
    - expect: Cart icon shows 'Cart, empty' with no numeric badge

### 3. Checkout Information Entry & Validation (AC2, AC5, BR1)

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-CHK-01: 'Checkout' button on cart page redirects to Checkout Information page

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Log in as standard_user, add an item to the cart, open the cart page, and click 'Checkout'.
    - expect: User is redirected to /checkout-step-one.html with heading 'Checkout: Your Information' and an empty First Name, Last Name, and Zip/Postal Code form

#### 3.2. TC-CHK-02: Submitting with all fields empty shows First Name required error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Reach the Checkout Information page with an item in the cart. Leave all fields empty and click 'Continue'.
    - expect: User remains on /checkout-step-one.html
    - expect: An error alert reads 'Error: First Name is required'
    - expect: No other field error is shown simultaneously

#### 3.3. TC-CHK-03: Submitting with only First Name filled shows Last Name required error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the Checkout Information page, enter First Name 'John' only, leave Last Name and Zip empty, click 'Continue'.
    - expect: User remains on /checkout-step-one.html
    - expect: Error alert reads 'Error: Last Name is required'

#### 3.4. TC-CHK-04: Submitting with First and Last Name filled shows Postal Code required error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the Checkout Information page, enter First Name 'John' and Last Name 'Doe', leave Zip empty, click 'Continue'.
    - expect: User remains on /checkout-step-one.html
    - expect: Error alert reads 'Error: Postal Code is required'

#### 3.5. TC-CHK-05: Error alert can be dismissed

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. Trigger a required-field error (e.g. submit with all fields empty), then click the 'Dismiss error' (X) icon on the alert.
    - expect: The error alert is removed from the page
    - expect: Form fields remain as previously entered

#### 3.6. TC-CHK-06 [DISCREPANCY]: Special characters in Zip/Postal Code are accepted without validation error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the Checkout Information page, enter First Name 'John', Last Name 'Doe', and Zip '!@#$%^&*()', then click 'Continue'.
    - expect: No validation error is shown for the special characters
    - expect: User is redirected to /checkout-step-two.html — this contradicts AC5, which expects an 'appropriate validation error' for special characters; documented as a functional gap, not assumed as a pass

#### 3.7. TC-CHK-07 [DISCREPANCY]: Special characters and emoji in First/Last Name are accepted without validation error

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the Checkout Information page, enter First Name '@@@###', Last Name '😀🚀🔥', and a valid Zip, then click 'Continue'.
    - expect: No validation error is shown
    - expect: User is redirected to /checkout-step-two.html, and the overview page does not display these name fields anywhere for further verification — document as a gap against AC5

#### 3.8. TC-CHK-08 [BOUNDARY]: Excessively long field values are accepted with no visible length limit

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the Checkout Information page, enter a 300-character string into First Name, Last Name, and Zip/Postal Code, then click 'Continue'.
    - expect: No client-side length-limit error is shown
    - expect: User is redirected to /checkout-step-two.html — document actual behavior since no length limit is specified anywhere in the requirement document

#### 3.9. TC-CHK-09: Valid data in all fields proceeds to the Overview page

**File:** `tests/saucedemo-checkout/checkout-info-validation.spec.js`

**Steps:**
  1. On the Checkout Information page, enter First Name 'Jane', Last Name 'Smith', Zip '90210', then click 'Continue'.
    - expect: User is redirected to /checkout-step-two.html with heading 'Checkout: Overview'

### 4. Order Overview (AC3, FR-07–FR-09)

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-OVW-01: Overview page item summary matches cart contents

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Log in, add 'Sauce Labs Fleece Jacket' and 'Sauce Labs Onesie' to the cart, complete valid checkout information, and reach the Overview page.
    - expect: Both items are listed with correct name, description, price, and quantity, matching what was shown on the cart page

#### 4.2. TC-OVW-02: Overview page shows static payment and shipping information

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Reach the Overview page with any item in the cart.
    - expect: 'Payment Information:' section shows 'SauceCard #31337'
    - expect: 'Shipping Information:' section shows 'Free Pony Express Delivery!'

#### 4.3. TC-OVW-03 [BOUNDARY]: Tax and total calculations are correct for 1 item vs. multiple items

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Complete checkout information with only 'Sauce Labs Bike Light' ($9.99) in the cart and reach the Overview page.
    - expect: Item total: $9.99, Tax: $0.80, Total: $10.79 (8% tax rate)
  2. Repeat with 3 items in the cart totaling a known sum (e.g. Backpack $29.99 + Bike Light $9.99 + Bolt T-Shirt $15.99 = $55.97) and reach the Overview page.
    - expect: Item total: $55.97, Tax: $4.48, Total: $60.45 — verifying the calculation scales correctly with more items

#### 4.4. TC-OVW-04: Overview page provides Cancel and Finish options

**File:** `tests/saucedemo-checkout/order-overview.spec.js`

**Steps:**
  1. Reach the Overview page with an item in the cart.
    - expect: Both a 'Cancel' button and a 'Finish' button are visible and enabled

### 5. Order Completion (AC4, FR-10, FR-14, BR4)

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-COMP-01: Finish redirects to a confirmation page with a success message

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. Complete the full checkout flow through the Overview page, then click 'Finish'.
    - expect: User is redirected to /checkout-complete.html
    - expect: A 'Pony Express' image, heading 'Thank you for your order!', and dispatch confirmation text are displayed

#### 5.2. TC-COMP-02: 'Back Home' returns to the Products page

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. From the order confirmation page, click 'Back Home'.
    - expect: User is redirected to /inventory.html
    - expect: The products grid is displayed

#### 5.3. TC-COMP-03: Cart is empty immediately after order completion

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. Complete a checkout with 2 items in the cart through to the confirmation page.
    - expect: The cart icon shows 'Cart, empty' with no numeric badge on the confirmation page itself, before even clicking 'Back Home'
  2. Navigate to /cart.html directly.
    - expect: Cart page shows no items, confirming BR4/FR-14

#### 5.4. TC-COMP-04 [UNDOCUMENTED FEATURE]: 'Generate PDF order' button is present and does not error

**File:** `tests/saucedemo-checkout/order-completion.spec.js`

**Steps:**
  1. On the order confirmation page, locate and click 'Generate PDF order'.
    - expect: The action completes without a JavaScript error or broken navigation
    - expect: Note: this button is not described anywhere in the requirement document; flagged for stakeholder awareness rather than treated as in/out of scope automatically

### 6. Business Rule Enforcement (BR2, BR3, BR5)

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-BR-01: Direct access to Checkout Information page while logged out is blocked

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Without logging in (fresh/cleared session), navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    - expect: User is redirected to the login page
    - expect: Error alert: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."

#### 6.2. TC-BR-02: Direct access to Cart page while logged out is blocked

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Without logging in, navigate directly to https://www.saucedemo.com/cart.html.
    - expect: User is redirected to the login page
    - expect: Error alert: "Epic sadface: You can only access '/cart.html' when you are logged in."

#### 6.3. TC-BR-03 [DISCREPANCY]: Checkout with an empty cart is not blocked by the application

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Log in as standard_user with an empty cart, open the cart page.
    - expect: 'Checkout' button is present and enabled despite the cart being empty
  2. Click 'Checkout', fill in valid First Name/Last Name/Zip, click 'Continue'.
    - expect: User reaches the Overview page showing 'Item total: $0', 'Tax: $0.00', 'Total: $0.00' with no items listed — no blocking message is shown, contradicting BR3/FR-13
  3. Click 'Finish'.
    - expect: Order confirmation page is shown as if a normal order succeeded — document this actual behavior for stakeholder review rather than asserting it as either a pass or a defect without confirmation

#### 6.4. TC-BR-04: Cancel on Checkout Information page returns to the Cart page

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Reach the Checkout Information page with an item in the cart, then click 'Cancel'.
    - expect: User is redirected to /cart.html
    - expect: The item added earlier is still present in the cart

#### 6.5. TC-BR-05 [DISCREPANCY]: Cancel on the Overview page returns to Products, not Cart

**File:** `tests/saucedemo-checkout/business-rules.spec.js`

**Steps:**
  1. Reach the Checkout Overview page (step two) with an item in the cart, then click 'Cancel'.
    - expect: User is redirected to /inventory.html (Products page), NOT to /cart.html — this contradicts the literal wording of BR5 ('cancel at any step and return to cart'); document as a finding for stakeholder clarification
    - expect: The item remains in the cart (verified by navigating to /cart.html afterward)

### 7. Navigation & Session Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-NAV-01: Browser back button from Overview clears entered form data

**File:** `tests/saucedemo-checkout/navigation.spec.js`

**Steps:**
  1. Reach the Overview page after entering valid checkout information (item in cart).
    - expect: Overview page is displayed correctly
  2. Click the browser's Back button.
    - expect: User lands back on /checkout-step-one.html
    - expect: First Name, Last Name, and Zip fields are all empty (previously entered data is not restored)
    - expect: Cart badge still shows the correct item count

#### 7.2. TC-NAV-02: Page refresh mid-checkout clears form data but preserves cart

**File:** `tests/saucedemo-checkout/navigation.spec.js`

**Steps:**
  1. On the Checkout Information page, enter First Name and Last Name (leave Zip blank), then refresh the page.
    - expect: Page reloads at /checkout-step-one.html
    - expect: First Name and Last Name fields are now empty
    - expect: Cart badge count is unchanged from before the refresh

#### 7.3. TC-NAV-03: Direct URL navigation to Checkout Information page works when logged in with items in cart

**File:** `tests/saucedemo-checkout/navigation.spec.js`

**Steps:**
  1. Log in as standard_user, add an item to the cart via the inventory page, then navigate directly to https://www.saucedemo.com/checkout-step-one.html (bypassing the cart page's Checkout button).
    - expect: The Checkout Information form loads successfully without requiring the user to visit /cart.html first

#### 7.4. TC-NAV-04: Logout blocks subsequent access to checkout pages

**File:** `tests/saucedemo-checkout/navigation.spec.js`

**Steps:**
  1. Log in as standard_user, open the hamburger menu, and click 'Logout'.
    - expect: User is redirected to the login page (/)
  2. Attempt to navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    - expect: User is redirected back to the login page with the 'You can only access ... when you are logged in' error, confirming the session was fully terminated

### 8. UI Validation / Boundary

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-UI-01: Cart badge accurately reflects add/remove actions across pages

**File:** `tests/saucedemo-checkout/ui-validation.spec.js`

**Steps:**
  1. From the inventory page, add 3 different items one at a time, checking the cart badge after each.
    - expect: Badge increments 1 → 2 → 3 correctly after each add
  2. Open the cart page and remove 1 item.
    - expect: Badge updates to '2' immediately, consistent between the header icon and the cart page

#### 8.2. TC-UI-02 [BOUNDARY]: Single item vs. multiple items checkout totals scale correctly

**File:** `tests/saucedemo-checkout/ui-validation.spec.js`

**Steps:**
  1. Complete checkout information with exactly 1 item in the cart and reach the Overview page.
    - expect: Item total equals that single item's price; Tax = 8% of item total (rounded to 2 decimals); Total = item total + tax
  2. Repeat with all 6 available items added to the cart and reach the Overview page.
    - expect: Item total equals the sum of all 6 item prices; Tax and Total are calculated consistently using the same 8% rate

#### 8.3. TC-UI-03 [EDGE CASE]: Rapid double-click on 'Finish' does not produce a broken or duplicate state

**File:** `tests/saucedemo-checkout/ui-validation.spec.js`

**Steps:**
  1. Reach the Overview page with a valid cart and checkout information, then double-click the 'Finish' button as fast as possible.
    - expect: User lands on a single, well-formed /checkout-complete.html page with no duplicate confirmation banners, console errors, or broken layout
    - expect: Record the actual observed behavior — the requirement document defines no explicit idempotency rule for this action, so this test documents current behavior for stakeholder awareness rather than asserting a specific pass/fail expectation
