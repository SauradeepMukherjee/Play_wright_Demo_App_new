---
name: output-generation
description: Generate standardized Markdown and Excel outputs for manual test cases.
---

# Purpose

Generate final deliverables for the Test Case Generator.

The generated outputs should be human-readable, machine-readable, and ready for execution or import into test management tools.

---

# Inputs

Receive structured test case data from:

- testcase-generation.md

---

# Responsibilities

Generate:

- generated-testcases.md
- generated-testcases.xlsx

Both outputs must contain identical information.

---

# Markdown Output

Generate:

generated-testcases.md

Include:

- Test Case ID
- Test Case Name
- Requirement ID
- Scenario ID
- Description
- Preconditions
- Test Data
- Test Steps
- Expected Results
- Priority
- Severity

---

# Excel Output

Generate:

generated-testcases.xlsx

Worksheet:

TestCases

Columns:

- Test Case ID
- Test Case Name
- Requirement ID
- Scenario ID
- Priority
- Severity
- Status
- Test Step #
- Test Step Description
- Expected Result
- Actual Result
- Step Status
- Log Attachment
- Attachments
- Tags

---

# Formatting

Apply:

- Bold headers
- Freeze first row
- Auto-fit columns
- One row per test step
- Repeat test case metadata for each step

Default values:

Status = Draft

Actual Result = Blank

Step Status = Blank

Attachments = Blank

---

# Validation

Verify:

- Markdown and Excel contain identical information.
- All Requirement IDs are preserved.
- All Scenario IDs are preserved.
- Every generated test case contains at least one step.

---

# Deliverables

Generate:

- generated-testcases.md
- generated-testcases.xlsx