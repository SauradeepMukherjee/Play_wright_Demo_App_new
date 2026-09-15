# SCRUM-101 Checkout Test Report

## Execution Metadata
- Execution Identifier: 2026-09-15_23-18-31
- Execution Start Time: 2026-09-15T17:48:31.356Z
- Execution End Time: 2026-09-15T17:52:59.118Z
- Total Execution Duration: 4m 28s
- Historical Mode: Enabled

## Execution Summary
- Documented Test Cases: 20
- Automated Scenarios: 30
- Browser Executions: 90
- Passed: 90
- Failed/Timed Out/Interrupted: 0
- Skipped: 0
- Pass Rate: 100%

## Browser-wise Results
| Browser | Total | Passed | Failed | Skipped | Pass Rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| chromium | 30 | 30 | 0 | 0 | 100% |
| firefox | 30 | 30 | 0 | 0 | 100% |
| webkit | 30 | 30 | 0 | 0 | 100% |

## Defect Summary
| Defect | Test Case | Browser | Status | Failure Detail |
| --- | --- | --- | --- | --- |
| n/a | n/a | n/a | n/a | No defects detected in this execution. |

## Coverage Summary
| AC | Area | Executed | Status |
| --- | --- | ---: | --- |
| AC1 | Cart Review | 0/5 | Not executed |
| AC2 | Checkout Information Entry | 0/8 | Not executed |
| AC3 | Order Overview | 0/5 | Not executed |
| AC4 | Order Completion | 0/3 | Not executed |
| AC5 | Error Handling | 0/5 | Not executed |

## Unmapped Automated Scenarios
| Scenario | File | Browsers |
| --- | --- | --- |
| TC-30 BR1 — all three checkout information fields are individually mandatory (combined verification) | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| TC-01 Happy path — cart displays single item with full details | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-02 Happy path — cart displays multiple items with correct per-item quantities | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-03 Discrepancy check — cart page does not display a total price (FR-02 gap) | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-04 'Continue Shopping' returns to Products page and preserves cart contents | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-05 'Checkout' button navigates to the checkout information page when the cart has items | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-06 Edge case — Checkout button is clickable with an empty cart (BR3 not enforced) | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-07 Removing an item from the cart updates the badge and cart contents | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-08 Happy path — valid checkout information proceeds to Overview | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-09 Validation — empty First Name shows field-specific required error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-10 Validation — empty Last Name (First Name filled) shows field-specific required error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-11 Validation — empty Postal Code (First & Last filled) shows field-specific required error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-12 Edge case (EDGE-01) — submitting with all three fields empty only surfaces the first field's error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-13 Discrepancy check (EDGE-02) — whitespace-only values bypass required-field validation | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-14 Discrepancy check (AC5/FR-11) — special characters are accepted without validation error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-15 Boundary — very long input in First Name field is accepted without truncation error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-16 Edge case (EDGE-03) — non-numeric/alphanumeric Zip/Postal Code is accepted | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-17 BR5 on checkout information page — Cancel returns user to the Cart page | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-18 Error banner can be dismissed via its close (X) control | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-19 BR2 — direct URL navigation to the checkout information page while logged out redirects to Login | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-27 Edge case (EDGE-04) — direct URL navigation to checkout information page with an empty cart while logged in | saucedemo-checkout\navigation.spec.js | chromium, firefox, webkit |
| TC-28 Edge case (EDGE-05, Technical Notes) — browser Back button from Overview clears entered checkout info but preserves cart | saucedemo-checkout\navigation.spec.js | chromium, firefox, webkit |
| TC-24 Happy path — confirmation page shows success message and Back Home button | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| TC-25 'Back Home' button returns the user to the Products page | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| TC-26 BR4 — cart is cleared after order confirmation | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| TC-20 Happy path — Overview page shows item summary, payment info, and shipping info | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| TC-21 Happy path — Overview page calculates item total, tax, and grand total correctly for a multi-item cart | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| TC-22 Discrepancy check (BR5) — Cancel on the Overview page redirects to Products, not Cart | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| TC-23 Happy path — Finish button on the Overview page completes the order | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| TC-29 Full end-to-end happy-path regression: Cart -> Checkout Info -> Overview -> Confirmation (AC1 through AC4 chained) | saucedemo-checkout\smoke.spec.js | chromium, firefox, webkit |

## Generated Artifacts
- PDF: test-results/execution-report.pdf
- HTML: test-results/execution-report.html
- Excel: test-results/test-cases.xlsx
- JSON: test-results/execution-report-data.json
- JUnit: test-results/results.xml
