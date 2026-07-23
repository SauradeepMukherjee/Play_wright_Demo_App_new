# Structured Test Plan — SauceDemo Checkout Flow (SCRUM-101)

| Field | Value |
|---|---|
| Application Under Test | https://www.saucedemo.com |
| Test Credentials | `standard_user` / `secret_sauce` |
| Source | `reports/SCRUM-101/requirement-analysis-report.md` (approved) |
| Live Exploration | Performed against production saucedemo.com, 2026-07-23 |
| Plan Version | 1.0 |

---

## 1. Confirmed Application Structure (from live exploration)

| Page | URL | Key `data-test` selectors |
|---|---|---|
| Login | `/` | `username`, `password`, `login-button`, `error` (on failure) |
| Inventory | `/inventory.html` | `add-to-cart-<slug>` / `remove-<slug>` per product, `shopping-cart-link`, `shopping-cart-badge`, `product-sort-container` (Name A–Z, Name Z–A, Price low–high, Price high–low) |
| Cart | `/cart.html` | `cart-list`, `cart-quantity-label`, `cart-desc-label`, `continue-shopping`, `checkout` |
| Checkout Info | `/checkout-step-one.html` | `firstName`, `lastName`, `postalCode`, `cancel`, `continue`, `.error-message-container` |
| Checkout Overview | `/checkout-step-two.html` | `cart-list`, `payment-info-value`, `shipping-info-value`, `subtotal-label`, `tax-label`, `total-label`, `cancel`, `finish` |
| Order Confirmation | `/checkout-complete.html` | `complete-header`, `complete-text`, `back-to-products` |

Note: `checkout-step-one.html`, `checkout-step-two.html`, and `checkout-complete.html` are directly reachable by URL even with an empty cart / without re-navigating through the flow — confirms EDGE-04 is reproducible and must be covered (TC-021).

There is no payment-method-selection UI anywhere in the app (only a static `payment-info-value` display) — confirms RISK-04/OQ-05: no test case should assert an interactive payment-method step.

---

## 2. Test Scenarios

### Smoke

| ID | Title | Objective | Preconditions | Test Data | Steps | Expected Result (per step) | Priority | Type | Automation Feasibility |
|---|---|---|---|---|---|---|---|---|---|
| TC-001 | Application launches and login page renders | Verify the app is reachable and the login form is present | None | — | 1. Navigate to `https://www.saucedemo.com` | 1. Page loads; title "Swag Labs"; `username`, `password`, `login-button` visible | Critical | Smoke | High |
| TC-002 | Standard user can log in | Verify baseline authentication works | Login page loaded | `standard_user`/`secret_sauce` | 1. Enter credentials 2. Click Login | 1. Fields populated 2. Redirected to `/inventory.html`, product grid visible | Critical | Smoke | High |
| TC-003 | End-to-end happy-path checkout (primary regression) | Chain AC1→AC4 in one pass | Logged in | 1 item in cart, valid info: John/Doe/12345 | 1. Add item to cart 2. Go to cart 3. Click Checkout 4. Fill valid info, Continue 5. Review overview, click Finish | 1. Cart badge = 1 2. Item listed with name/desc/price/qty 3. Redirected to checkout-step-one 4. Redirected to checkout-step-two showing item, payment/shipping info, subtotal/tax/total 5. Redirected to checkout-complete showing success message and Back Home button | Critical | Smoke / Functional | High |

### Positive (Functional)

| ID | Title | Objective | Preconditions | Test Data | Steps | Expected Result | Priority | Type | Automation Feasibility |
|---|---|---|---|---|---|---|---|---|---|
| TC-004 | Cart displays item name, description, price, quantity (FR-01) | Verify cart line-item detail | Logged in, 1+ items added | Sauce Labs Backpack | 1. Add item 2. Open cart | Cart lists name, description, price, and quantity=1 for the item | High | Functional/Positive | High |
| TC-005 | Cart displays correct total price (FR-02) | Verify price aggregation surfaces correctly on overview (cart page itself has no total; total appears on step-two) | Logged in, 2+ items added | Backpack $29.99 + Bike Light $9.99 | 1. Add both items 2. Checkout through to step-two | Subtotal = $39.98, tax and total computed and displayed | High | Positive/Functional | Medium |
| TC-006 | Cart provides Continue Shopping and Checkout options (FR-03) | Verify both navigation options exist | Logged in, cart has 1 item | — | 1. Open cart | Both `continue-shopping` and `checkout` buttons visible and enabled | Medium | Functional | High |
| TC-007 | Continue Shopping returns to inventory | Verify navigation back to products | Logged in, on cart page | — | 1. Click Continue Shopping | Redirected to `/inventory.html` | Medium | Navigation/Functional | High |
| TC-008 | Checkout button redirects to checkout info page (FR-04) | Verify cart→checkout transition | Logged in, cart has 1+ item | — | 1. Click Checkout on cart page | Redirected to `/checkout-step-one.html` | High | Functional | High |
| TC-009 | Checkout info form accepts valid data and proceeds (FR-07) | Verify valid submission advances flow | On checkout-step-one, cart non-empty | First=Jane, Last=Doe, Zip=94107 | 1. Fill all 3 fields 2. Click Continue | Redirected to `/checkout-step-two.html` | Critical | Functional/Positive | High |
| TC-010 | Overview page shows item summary, payment/shipping info, subtotal/tax/total (FR-08) | Verify all required summary elements render | On checkout-step-two with valid info submitted | — | 1. Reach overview page | `cart-list`, `payment-info-value`, `shipping-info-value`, `subtotal-label`, `tax-label`, `total-label` all present and populated | High | Functional/Positive | High |
| TC-011 | Overview page offers Cancel and Finish (FR-09) | Verify both controls present | On checkout-step-two | — | 1. Reach overview page | `cancel` and `finish` buttons visible and enabled | Medium | Functional | High |
| TC-012 | Finish completes the order and shows confirmation (FR-10) | Verify order completion | On checkout-step-two | — | 1. Click Finish | Redirected to `/checkout-complete.html`; `complete-header`/`complete-text` show a success message; `back-to-products` button visible | Critical | Functional/Positive | High |
| TC-013 | Back Home returns to products page (FR-10) | Verify post-order navigation | On checkout-complete page | — | 1. Click Back Home | Redirected to `/inventory.html` | Medium | Navigation | High |
| TC-014 | Product sort — Name A to Z / Z to A / Price low-high / high-low | Verify sorting functionality | Logged in, on inventory page | — | 1. Select each of the 4 sort options in turn | Product order updates to match the selected sort criterion each time | Medium | Functional | High |
| TC-015 | Multi-item cart totals (FR-02 boundary) | Verify totals scale with 3+ distinct items | Logged in | 3 distinct products | 1. Add 3 items 2. Proceed to overview | Cart/overview list all 3 items; subtotal = sum of unit prices; tax and total computed correctly | Medium | Positive/Edge | Medium |

### Negative

| ID | Title | Objective | Preconditions | Test Data | Steps | Expected Result | Priority | Type | Automation Feasibility |
|---|---|---|---|---|---|---|---|---|---|
| TC-016 | Login fails with invalid credentials | Verify auth rejects bad credentials | Login page loaded | `standard_user` / `wrong_password` | 1. Enter invalid credentials 2. Click Login | Login rejected; `[data-test="error"]` shows an error message; user remains on login page | Critical | Negative | High |
| TC-017 | Checkout blocked when First Name is empty (FR-06, BR1) | Verify mandatory-field validation per field | On checkout-step-one | Last=Doe, Zip=94107, First=(empty) | 1. Leave First Name empty, fill rest 2. Click Continue | Error message displayed identifying First Name as required; user remains on checkout-step-one | High | Negative | High |
| TC-018 | Checkout blocked when Last Name is empty (FR-06, BR1) | Same as above for Last Name | On checkout-step-one | First=Jane, Zip=94107, Last=(empty) | 1. Leave Last Name empty, fill rest 2. Click Continue | Error message identifies Last Name as required; blocked | High | Negative | High |
| TC-019 | Checkout blocked when Zip/Postal Code is empty (FR-06, BR1) | Same as above for Zip | On checkout-step-one | First=Jane, Last=Doe, Zip=(empty) | 1. Leave Zip empty, fill rest 2. Click Continue | Error message identifies Zip/Postal Code as required; blocked | High | Negative | High |
| TC-020 | Checkout blocked when all fields are empty (EDGE-01) | Verify combined empty-field submission | On checkout-step-one | All fields empty | 1. Click Continue without entering anything | Error message shown (for the first required field per app logic); user remains on checkout-step-one | Medium | Negative/Edge | High |
| TC-021 | Deep-link to checkout pages with empty cart / no prior flow (EDGE-04) | Verify direct URL access behavior | Logged in, cart empty | — | 1. Navigate directly to `/checkout-step-one.html`, then `/checkout-step-two.html`, then `/checkout-complete.html` | Confirmed via exploration: all three pages render without redirect even with an empty cart — document actual (unguarded) behavior as a finding, since BR3 ("cart cannot be empty at checkout") is not enforced anywhere in the UI | Medium | Negative/Edge | High |
| TC-022 | Invalid special-character input in text fields (FR-11, EDGE-02) | Verify validation on malformed input | On checkout-step-one | First=`!!!###`, Last=`Doe`, Zip=`94107` | 1. Enter special characters in First Name 2. Fill rest 3. Click Continue | Actual observed app behavior must be captured during automation (SauceDemo's real validation only checks presence, not character class) — record actual vs. AC5's stated expectation as a defect/gap if no such validation exists | Medium | Negative/Edge | Medium |

### Navigation

| ID | Title | Objective | Preconditions | Test Data | Steps | Expected Result | Priority | Type | Automation Feasibility |
|---|---|---|---|---|---|---|---|---|---|
| TC-023 | Browser back button during checkout info entry (EDGE-05) | Verify back-button behavior mid-flow | On checkout-step-two after valid submission | — | 1. Click browser Back | Returns to `/checkout-step-one.html`; document whether previously entered values persist (actual behavior to confirm during automation) | Medium | Navigation/Edge | Medium |
| TC-024 | Cancel on checkout overview returns to inventory (BR5, AC3) | Verify Cancel exits checkout | On checkout-step-two | — | 1. Click Cancel | Redirected to `/inventory.html` (SauceDemo's actual Cancel target — confirm during automation, since AC3 does not specify destination) | Medium | Navigation/Functional | High |
| TC-025 | Cancel on checkout info page (BR5/OQ-04 gap) | Verify whether Cancel exists and works on checkout-step-one, since BR5 only explicitly covers the overview page per RISK-03 | On checkout-step-one | — | 1. Click `cancel` button | `cancel` button is present (confirmed during exploration) and navigates back to `/cart.html` — treat as closing the OQ-04 gap once confirmed by automation | Medium | Navigation/Functional | High |

### UI Validation

| ID | Title | Objective | Preconditions | Test Data | Steps | Expected Result | Priority | Type | Automation Feasibility |
|---|---|---|---|---|---|---|---|---|---|
| TC-026 | Checkout info field labels/placeholders render correctly | Verify placeholder text for each field | On checkout-step-one | — | 1. Inspect each input | Placeholders read "First Name", "Last Name", "Zip/Postal Code" respectively | Low | UI Validation | High |
| TC-027 | Error message styling appears on validation failure | Verify error is visually distinct and dismissible | On checkout-step-one, trigger TC-017 | — | 1. Trigger empty-field error 2. Inspect error container | `.error-message-container` is populated and visible; input(s) show `input_error` styling | Medium | UI Validation | High |
| TC-028 | Order confirmation success message and imagery render | Verify confirmation page visual completeness | On checkout-complete page | — | 1. Reach confirmation page | `complete-header` shows a success heading (e.g. "Thank you for your order!"), `complete-text` shows supporting copy, and the Back Home button is clearly visible | Low | UI Validation | High |

---

## 3. Non-Functional / Cross-Cutting Notes (not automated as standalone cases)

- **NFR-01 (cross-browser)**: TC-001 through TC-028 should each run against Chromium, Firefox, and WebKit per `playwright.config.js` projects — not separate test cases, but a execution-matrix concern for the automation suite.
- **NFR-02 (mobile responsiveness)**: no specific breakpoints were provided (OQ-07); flagged as out of scope for automated assertions until clarified, consistent with the Requirement Analysis Report's recommendation.
- **NFR-04 (security)**: no concrete, testable security requirement exists (RISK-01/OQ-06); no security test case is included by design.
- **Payment method selection**: confirmed absent from the live application (RISK-04/OQ-05) — no test case asserts its presence.
- **BR4 (cart clears after order confirmation)**: not covered by any AC; recommend adding TC-029 (`back-to-products` → inventory shows cart badge cleared) once product owner confirms this is in scope (OQ-03).

---

## 4. Coverage Summary

- Total test cases: 28 (minimum 20 met)
- Smoke: 3 | Positive/Functional: 12 | Negative: 7 | Navigation: 3 | UI Validation: 3
- All 11 FRs and all 5 ACs have at least one covering test case; BR1, BR5 covered; BR2 covered via TC-002/TC-016; BR3/BR4 gaps explicitly flagged per Requirement Analysis Report rather than silently assumed.
