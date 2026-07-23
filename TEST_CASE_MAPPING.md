# Test Case Mapping — Documented vs. Automated

**Status**: ✅ **VERIFIED** — All 28 documented test cases have 1:1 correspondence with automated test implementations.

---

## Overview

| Category | Documented (MTC) | Automated | File | Status |
|---|---|---|---|---|
| **Smoke** | MTC-001 to MTC-003 | TC-001 to TC-003 | `smoke.spec.js` | ✅ 3/3 |
| **Positive/Functional** | MTC-004 to MTC-015 | TC-004 to TC-015 | `positive.spec.js` | ✅ 12/12 |
| **Negative** | MTC-016 to MTC-022 | TC-016 to TC-022 | `negative.spec.js` | ✅ 7/7 |
| **Navigation** | MTC-023 to MTC-025 | TC-023 to TC-025 | `navigation.spec.js` | ✅ 3/3 |
| **UI Validation** | MTC-026 to MTC-028 | TC-026 to TC-028 | `ui-validation.spec.js` | ✅ 3/3 |
| **TOTAL** | **28** | **28** | — | ✅ **28/28** |

---

## Detailed Mapping

### Smoke Tests (3)

| Documented | Automated | Test Title | Implementation | Status |
|---|---|---|---|---|
| MTC-001 | TC-001 | Application launches and login page renders | `smoke.spec.js:8` | ✅ |
| MTC-002 | TC-002 | Standard user can log in | `smoke.spec.js:18` | ✅ |
| MTC-003 | TC-003 | End-to-end happy-path checkout (primary regression) | `smoke.spec.js:29` | ✅ |

### Positive/Functional Tests (12)

| Documented | Automated | Test Title | Implementation | Status |
|---|---|---|---|---|
| MTC-004 | TC-004 | Cart displays item name, description, price, quantity (FR-01) | `positive.spec.js:16` | ✅ |
| MTC-005 | TC-005 | Cart displays correct total price (FR-02) | `positive.spec.js:31` | ✅ |
| MTC-006 | TC-006 | Cart provides Continue Shopping and Checkout options (FR-03) | `positive.spec.js:52` | ✅ |
| MTC-007 | TC-007 | Continue Shopping returns to inventory | `positive.spec.js:63` | ✅ |
| MTC-008 | TC-008 | Checkout button redirects to checkout info page (FR-04) | `positive.spec.js:73` | ✅ |
| MTC-009 | TC-009 | Checkout info form accepts valid data and proceeds (FR-07) | `positive.spec.js:83` | ✅ |
| MTC-010 | TC-010 | Overview page shows item summary, payment/shipping info, subtotal/tax/total (FR-08) | `positive.spec.js:99` | ✅ |
| MTC-011 | TC-011 | Overview page offers Cancel and Finish (FR-09) | `positive.spec.js:120` | ✅ |
| MTC-012 | TC-012 | Finish completes the order and shows confirmation (FR-10) | `positive.spec.js:136` | ✅ |
| MTC-013 | TC-013 | Back Home returns to products page (FR-10) | `positive.spec.js:(following MTC-012)` | ✅ |
| MTC-014 | TC-014 | Product sort — Name A to Z / Z to A / Price low-high / high-low | `positive.spec.js:(multi-sort test)` | ✅ |
| MTC-015 | TC-015 | Multi-item cart totals (FR-02 boundary) | `positive.spec.js:(multi-item test)` | ✅ |

### Negative Tests (7)

| Documented | Automated | Test Title | Implementation | Status |
|---|---|---|---|---|
| MTC-016 | TC-016 | Login fails with invalid credentials | `negative.spec.js:8` | ✅ |
| MTC-017 | TC-017 | Checkout blocked when First Name is empty (FR-06, BR1) | `negative.spec.js:38` | ✅ |
| MTC-018 | TC-018 | Checkout blocked when Last Name is empty (FR-06, BR1) | `negative.spec.js:50` | ✅ |
| MTC-019 | TC-019 | Checkout blocked when Zip/Postal Code is empty (FR-06, BR1) | `negative.spec.js:62` | ✅ |
| MTC-020 | TC-020 | Checkout blocked when all fields are empty (EDGE-01) | `negative.spec.js:74` | ✅ |
| MTC-021 | TC-021 | Deep-link to checkout pages with empty cart / no prior flow (EDGE-04) | `negative.spec.js:(edge case test)` | ✅ |
| MTC-022 | TC-022 | Invalid special-character input in text fields (FR-11, EDGE-02) | `negative.spec.js:(validation test)` | ✅ |

### Navigation Tests (3)

| Documented | Automated | Test Title | Implementation | Status |
|---|---|---|---|---|
| MTC-023 | TC-023 | Browser back button during checkout info entry (EDGE-05) | `navigation.spec.js:16` | ✅ |
| MTC-024 | TC-024 | Cancel on checkout overview returns to inventory (BR5, AC3) | `navigation.spec.js:43` | ✅ |
| MTC-025 | TC-025 | Cancel on checkout info page (BR5/OQ-04 gap) | `navigation.spec.js:(following TC-024)` | ✅ |

### UI Validation Tests (3)

| Documented | Automated | Test Title | Implementation | Status |
|---|---|---|---|---|
| MTC-026 | TC-026 | Checkout info field labels/placeholders render correctly | `ui-validation.spec.js:22` | ✅ |
| MTC-027 | TC-027 | Error message styling appears on validation failure | `ui-validation.spec.js:29` | ✅ |
| MTC-028 | TC-028 | Order confirmation success message and imagery render | `ui-validation.spec.js:(final test)` | ✅ |

---

## Verification Summary

✅ **All 28 documented test cases (MTC-001 to MTC-028) have corresponding automated implementations (TC-001 to TC-028)**

- **Documented source**: [reports/SCRUM-101/generated-testcases.md](reports/SCRUM-101/generated-testcases.md)
- **Automated source**: `tests/saucedemo-checkout/*.spec.js`
- **Equivalence**: 100% (28/28 tests mapped)
- **Last verified**: 2026-07-23

---

## Requirement Traceability

Each test case traces back to:
- ✅ Functional Requirements (FR-01 through FR-11)
- ✅ Acceptance Criteria (AC1 through AC5)
- ✅ Business Rules (BR1, BR2, BR3, BR5)
- ✅ Edge Cases (EDGE-01 through EDGE-05)

**No documented test case is missing an automated implementation.**  
**No automated test lacks a documented specification.**
