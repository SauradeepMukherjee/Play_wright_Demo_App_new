# SCRUM-101 Checkout Test Report

## Execution Metadata
- Execution Identifier: 2026-09-15_16-11-47
- Execution Start Time: 2026-09-15T10:41:47.232Z
- Execution End Time: 2026-09-15T10:44:00.026Z
- Total Execution Duration: 2m 13s
- Historical Mode: Enabled

## Execution Summary
- Documented Test Cases: 20
- Automated Scenarios: 36
- Browser Executions: 108
- Passed: 108
- Failed/Timed Out/Interrupted: 0
- Skipped: 0
- Pass Rate: 100%

## Browser-wise Results
| Browser | Total | Passed | Failed | Skipped | Pass Rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| chromium | 36 | 36 | 0 | 0 | 100% |
| firefox | 36 | 36 | 0 | 0 | 100% |
| webkit | 36 | 36 | 0 | 0 | 100% |

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
| TC-BR-01: Direct access to Checkout Information page while logged out is blocked | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| TC-BR-02: Direct access to Cart page while logged out is blocked | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| TC-BR-03 [DISCREPANCY]: Checkout with an empty cart is not blocked by the application | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| TC-BR-04: Cancel on Checkout Information page returns to the Cart page | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| TC-BR-05 [DISCREPANCY]: Cancel on the Overview page returns to Products, not Cart | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| TC-CART-01: Cart page displays complete details for every item | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-CART-02 [DISCREPANCY]: Cart page does not display a total price | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-CART-03: 'Continue Shopping' returns to products page without changing cart | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-CART-04: Removing an item from the cart page updates the list and badge | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| TC-CHK-01: 'Checkout' button on cart page redirects to Checkout Information page | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-CHK-02: Submitting with all fields empty shows First Name required error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-CHK-03: Submitting with only First Name filled shows Last Name required error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-CHK-04: Submitting with First and Last Name filled shows Postal Code required error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-CHK-05: Error alert can be dismissed | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-CHK-06 [DISCREPANCY]: Special characters in Zip/Postal Code are accepted without validation error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-CHK-07 [DISCREPANCY]: Special characters and emoji in First/Last Name are accepted without validation error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-CHK-08 [BOUNDARY]: Excessively long field values are accepted with no visible length limit | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-CHK-09: Valid data in all fields proceeds to the Overview page | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| TC-NAV-01: Browser back button from Overview clears entered form data | saucedemo-checkout\navigation.spec.js | chromium, firefox, webkit |
| TC-NAV-02: Page refresh mid-checkout clears form data but preserves cart | saucedemo-checkout\navigation.spec.js | chromium, firefox, webkit |
| TC-NAV-03: Direct URL navigation to Checkout Information page works when logged in with items in cart | saucedemo-checkout\navigation.spec.js | chromium, firefox, webkit |
| TC-NAV-04: Logout blocks subsequent access to checkout pages | saucedemo-checkout\navigation.spec.js | chromium, firefox, webkit |
| TC-COMP-01: Finish redirects to a confirmation page with a success message | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| TC-COMP-02: 'Back Home' returns to the Products page | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| TC-COMP-03: Cart is empty immediately after order completion | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| TC-COMP-04 [UNDOCUMENTED FEATURE]: 'Generate PDF order' button is present and does not error | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| TC-OVW-01: Overview page item summary matches cart contents | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| TC-OVW-02: Overview page shows static payment and shipping information | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| TC-OVW-03 [BOUNDARY]: Tax and total calculations are correct for 1 item vs. multiple items | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| TC-OVW-04: Overview page provides Cancel and Finish options | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| TC-SMOKE-01: Complete full checkout with a single item | saucedemo-checkout\smoke.spec.js | chromium, firefox, webkit |
| TC-SMOKE-02: Complete checkout with multiple items | saucedemo-checkout\smoke.spec.js | chromium, firefox, webkit |
| TC-SMOKE-03: Checkout flow is fully blocked without authentication | saucedemo-checkout\smoke.spec.js | chromium, firefox, webkit |
| TC-UI-01: Cart badge accurately reflects add/remove actions across pages | saucedemo-checkout\ui-validation.spec.js | chromium, firefox, webkit |
| TC-UI-02 [BOUNDARY]: Single item vs multiple items checkout totals scale correctly | saucedemo-checkout\ui-validation.spec.js | chromium, firefox, webkit |
| TC-UI-03 [EDGE CASE]: Rapid double-click on 'Finish' does not produce a broken or duplicate state | saucedemo-checkout\ui-validation.spec.js | chromium, firefox, webkit |

## Generated Artifacts
- PDF: test-results/execution-report.pdf
- HTML: test-results/execution-report.html
- Excel: test-results/test-cases.xlsx
- JSON: test-results/execution-report-data.json
- JUnit: test-results/results.xml
