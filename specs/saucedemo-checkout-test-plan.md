# SauceDemo Checkout Test Plan

## Overview
This plan covers the ecommerce checkout workflow for the SauceDemo application as described in SCRUM-101.

## Business Objective
Validate that a logged-in customer can complete the checkout flow from product selection through order confirmation.

## Scope
### Included
- Login
- Product selection and cart review
- Checkout information entry
- Checkout overview
- Order completion
- Navigation and basic validation

### Excluded
- Payment gateway integration
- Account management
- Inventory administration

## Environment
- Application URL: https://www.saucedemo.com
- Username: standard_user
- Password: secret_sauce
- Browsers: Chromium, Firefox, WebKit

## Test Scenarios

### Happy Path
1. TC-001 Successful login and product purchase
   - Objective: Verify a user can log in, add a product to cart, complete checkout, and confirm the order.
   - Preconditions: User is on the login page.
   - Test Data: standard_user / secret_sauce
   - Steps:
     1. Open SauceDemo login page.
     2. Enter valid credentials.
     3. Add a product to the cart.
     4. Open the cart.
     5. Click Checkout.
     6. Enter valid first name, last name, and postal code.
     7. Click Continue.
     8. Click Finish.
   - Expected Results: User reaches the checkout complete page and sees a confirmation message.
   - Priority: High
   - Automation Feasibility: High

### Negative Scenarios
2. TC-002 Missing required checkout fields
   - Objective: Verify validation when required fields are empty.
   - Preconditions: User is on checkout information page with a cart item.
   - Steps:
     1. Leave first name empty.
     2. Click Continue.
   - Expected Results: Error message is shown and the user cannot proceed.
   - Priority: High
   - Automation Feasibility: High

3. TC-003 Invalid checkout data handling
   - Objective: Ensure invalid data does not allow progression.
   - Preconditions: User is on checkout information page.
   - Steps:
     1. Enter special characters in the form fields.
     2. Click Continue.
   - Expected Results: The form should display validation feedback or reject invalid data.
   - Priority: Medium
   - Automation Feasibility: Medium

### Navigation and UI
4. TC-004 Cart and back navigation
   - Objective: Confirm that users can cancel checkout and return to the cart.
   - Preconditions: User has items in cart.
   - Steps:
     1. Start checkout.
     2. Click Cancel.
   - Expected Results: User returns to the cart page.
   - Priority: Medium
   - Automation Feasibility: High

5. TC-005 Empty cart checkout prevention
   - Objective: Verify the user cannot proceed to checkout with no items in the cart.
   - Preconditions: User is logged in and cart is empty.
   - Expected Results: Checkout action is disabled or unavailable.
   - Priority: Medium
   - Automation Feasibility: High

6. TC-006 Partial fill validation
   - Objective: Verify validation when one required field is omitted.
   - Preconditions: User is on the checkout information page with an item in cart.
   - Expected Results: The specific missing field error is displayed.
   - Priority: High
   - Automation Feasibility: High

7. TC-007 Continue shopping from cart
   - Objective: Ensure the user can return to the inventory page from the cart.
   - Preconditions: User has one item in the cart.
   - Expected Results: The inventory page is displayed.
   - Priority: Medium
   - Automation Feasibility: High

8. TC-008 Checkout overview validation
   - Objective: Confirm the overview page shows payment, shipping, and totals before finishing.
   - Preconditions: User has entered valid personal information.
   - Expected Results: Overview page displays expected summary sections.
   - Priority: High
   - Automation Feasibility: High

## Notes
- Tests should use accessible selectors where possible.
- Screenshots should be captured on failure.
- Tests should run on Chromium, Firefox, and WebKit.
