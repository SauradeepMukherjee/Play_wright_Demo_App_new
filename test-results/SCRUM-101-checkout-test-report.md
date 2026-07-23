# SCRUM-101 Checkout Test Report

## Execution Metadata
- Execution Identifier: 2026-07-23_18-40-31
- Execution Start Time: 2026-07-23T13:10:31.697Z
- Execution End Time: 2026-07-23T13:15:43.524Z
- Total Execution Duration: 5m 12s
- Historical Mode: Enabled

## Execution Summary
- Documented Test Cases: 20
- Automated Scenarios: 28
- Browser Executions: 84
- Passed: 84
- Failed/Timed Out/Interrupted: 0
- Skipped: 0
- Pass Rate: 100%

## Browser-wise Results
| Browser | Total | Passed | Failed | Skipped | Pass Rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| chromium | 28 | 28 | 0 | 0 | 100% |
| firefox | 28 | 28 | 0 | 0 | 100% |
| webkit | 28 | 28 | 0 | 0 | 100% |

## Defect Summary
| Defect | Test Case | Browser | Status | Failure Detail |
| --- | --- | --- | --- | --- |
| n/a | n/a | n/a | n/a | No defects detected in this execution. |

## Coverage Summary
| AC | Area | Executed | Status |
| --- | --- | ---: | --- |
| AC1 | Cart Review | 0/5 | Not executed |
| AC2 | Checkout Information Entry | 2/8 | Covered |
| AC3 | Order Overview | 2/5 | Covered |
| AC4 | Order Completion | 1/3 | Covered |
| AC5 | Error Handling | 0/5 | Not executed |

## Unmapped Automated Scenarios
| Scenario | File | Browsers |
| --- | --- | --- |
| Cart displays item name, description, price, quantity (FR-01) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Cart displays correct total price (FR-02) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Cart provides Continue Shopping and Checkout options (FR-03) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Continue Shopping returns to inventory | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Checkout button redirects to checkout info page (FR-04) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Checkout info form accepts valid data and proceeds (FR-07) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Overview page shows item summary, payment/shipping info, subtotal/tax/total (FR-08) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Overview page offers Cancel and Finish (FR-09) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Finish completes the order and shows confirmation (FR-10) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Back Home returns to products page (FR-10) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Product sort — Name A to Z / Z to A / Price low-high / high-low | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Multi-item cart totals (FR-02 boundary) | saucedemo-checkout/positive.spec.js | chromium, firefox, webkit |
| Application launches and login page renders | saucedemo-checkout/smoke.spec.js | chromium, firefox, webkit |
| Standard user can log in | saucedemo-checkout/smoke.spec.js | chromium, firefox, webkit |
| End-to-end happy-path checkout (primary regression) | saucedemo-checkout/smoke.spec.js | chromium, firefox, webkit |

## Generated Artifacts
- PDF: test-results/execution-report.pdf
- HTML: test-results/execution-report.html
- Excel: test-results/test-cases.xlsx
- JSON: test-results/execution-report-data.json
- JUnit: test-results/results.xml
