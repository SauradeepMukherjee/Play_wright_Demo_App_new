# SCRUM-101 Checkout Test Report

## Execution Metadata
- Execution Identifier: 2026-09-16_18-35-25
- Execution Start Time: 2026-09-16T13:05:25.420Z
- Execution End Time: 2026-09-16T13:08:32.857Z
- Total Execution Duration: 3m 7s
- Historical Mode: Enabled

## Execution Summary
- Documented Test Cases: 20
- Automated Scenarios: 29
- Browser Executions: 87
- Passed: 87
- Failed/Timed Out/Interrupted: 0
- Skipped: 0
- Pass Rate: 100%

## Browser-wise Results
| Browser | Total | Passed | Failed | Skipped | Pass Rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| chromium | 29 | 29 | 0 | 0 | 100% |
| firefox | 29 | 29 | 0 | 0 | 100% |
| webkit | 29 | 29 | 0 | 0 | 100% |

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
| Unauthenticated direct access to checkout is blocked and redirected to login | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| DISCREPANCY: Checking out with an empty cart is not blocked and can be completed with a $0.00 total | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| Logged-in session persists across checkout steps for a valid multi-step flow | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| Attempting to check out again immediately after order completion (empty cart) reproduces the same empty-cart defect | saucedemo-checkout\business-rules.spec.js | chromium, firefox, webkit |
| Cart page displays full item details for each product | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| Cart page offers Continue Shopping and Checkout options | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| DISCREPANCY: Cart page does not display a total/subtotal price | saucedemo-checkout\cart-review.spec.js | chromium, firefox, webkit |
| Submitting an entirely empty form shows First Name required error first | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| Leaving only Last Name empty shows Last Name required error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| Leaving only Zip/Postal Code empty shows Postal Code required error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| Valid First Name, Last Name, and Zip proceed to Overview page | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| Error alert can be dismissed via its close control | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| DISCREPANCY: Special characters in Zip/Postal Code are accepted without a format validation error | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| DISCREPANCY: Whitespace-only First Name is accepted as valid | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| DISCREPANCY: Oversized name input and special-character Last Name are both accepted | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| Numeric 5-digit Zip/Postal Code is accepted (happy-path boundary) | saucedemo-checkout\checkout-info-validation.spec.js | chromium, firefox, webkit |
| Cancel from Checkout Information page returns to Cart page with items preserved | saucedemo-checkout\navigation.spec.js | chromium, firefox, webkit |
| DISCREPANCY: Cancel from Checkout Overview page returns to Products page, not the Cart page | saucedemo-checkout\navigation.spec.js | chromium, firefox, webkit |
| Browser back button after order confirmation shows a stale Overview page whose Finish button is still clickable | saucedemo-checkout\navigation.spec.js | chromium, firefox, webkit |
| Full checkout flow renders and completes at a mobile viewport (375x667) | saucedemo-checkout\non-functional-exploratory.spec.js | chromium, firefox, webkit |
| All checkout-flow validation and success messages are captured for content review | saucedemo-checkout\non-functional-exploratory.spec.js | chromium, firefox, webkit |
| Finish redirects to confirmation page with success message | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| Back Home button returns to the Products page | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| Cart is cleared after order confirmation | saucedemo-checkout\order-completion.spec.js | chromium, firefox, webkit |
| Overview page lists all cart items with correct details | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| Overview page displays Payment and Shipping information sections | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| Overview page provides Cancel and Finish controls | saucedemo-checkout\order-overview.spec.js | chromium, firefox, webkit |
| Complete checkout with a single item | saucedemo-checkout\smoke.spec.js | chromium, firefox, webkit |
| Complete checkout with multiple items and verify price arithmetic | saucedemo-checkout\smoke.spec.js | chromium, firefox, webkit |

## Generated Artifacts
- PDF: test-results/execution-report.pdf
- HTML: test-results/execution-report.html
- Excel: test-results/test-cases.xlsx
- JSON: test-results/execution-report-data.json
- JUnit: test-results/results.xml
