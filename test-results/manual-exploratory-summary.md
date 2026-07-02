# Manual Exploratory Testing Summary

## Execution Overview
Exploratory validation was performed against the live SauceDemo application using browser-based checks aligned to the checkout workflow defined in SCRUM-101.

## Execution Results
| Scenario | Result | Notes |
| --- | --- | --- |
| Login and inventory access | Pass | Login completed successfully with the standard user credentials. |
| Add item to cart and open cart | Pass | The selected item was added and visible in the cart. |
| Start checkout from cart | Pass | The checkout flow started correctly from the cart page. |
| Missing required field validation | Pass | The form blocked progress and displayed validation feedback when required fields were omitted. |
| Continue shopping from cart | Pass | The user returned to the inventory page successfully. |
| Checkout overview and finish | Pass | The overview page displayed totals and the completion page rendered after finish. |

## Findings
- The current build behaved as expected for the core happy path and core validation scenarios.
- No functional defects were identified during the exploratory pass.
- The only observed gap is that the current automation suite does not yet cover the invalid-data special-character case from the plan.

## Evidence
Screenshot artifacts are stored in the screenshots folder for the main checkout stages:
- 01-login.png
- 02-inventory.png
- 03-cart.png
- 04-checkout-info.png
- 05-checkout-overview.png
- 06-checkout-complete.png
