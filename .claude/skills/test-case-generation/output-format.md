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

## CSV quoting (when the agent dispatching this skill has no code-execution tool)

Some agents invoking this skill (e.g. `testcase-generator-agent`, whose tools are Read/Write only) cannot run
ExcelJS directly and instead write `generated-testcases.xlsx` as CSV-shaped text for
`scripts/csv-to-xlsx.js` to convert afterward. When any field contains a double-quote character —
which happens often here, since expected-result text frequently quotes the application's own on-screen error
message (e.g. `Epic sadface: ...`) — escape it the **CSV way**: double it (`""`), never backslash-escape it
(`\"`). A backslash-escaped quote is not valid CSV and will fail to parse (`csv-to-xlsx.js` uses a strict
RFC 4180 parser). Example: a field containing the literal text `She said "hello"` must be written as
`"She said ""hello"""` in the CSV row, not `"She said \"hello\""`.

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