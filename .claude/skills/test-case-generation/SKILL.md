---
name: test-case-generation
description: Generate comprehensive manual test cases from the Requirement Analysis Report and Structured Test Plan.
---

# Test Case Generation

## Purpose

The Test Case Generation skill is responsible for transforming the Requirement Analysis Report and Structured Test Plan into complete, execution-ready manual test cases.

This skill acts as the orchestration layer for all test case generation activities.

---

# When to Use

Use this skill after:

- Requirement Analysis Report has been generated.
- Structured Test Plan has been generated.

---

# Inputs

- requirement-analysis-report.md
- structured-test-plan.md

---

# Workflow

Execute the following workflow sequentially.

## Step 1 – Validate Inputs

Verify that:

- Requirement Analysis Report exists.
- Structured Test Plan exists.

If any required input is missing, stop execution and report the issue.

---

## Step 2 – Generate Test Cases

Invoke:

**testcase-generation.md**

Responsibilities:

- Analyze Requirements
- Analyze Planned Scenarios
- Generate Manual Test Cases
- Generate Test Steps
- Generate Expected Results
- Assign Priority
- Assign Severity
- Maintain Requirement Traceability

---

## Step 3 – Generate Deliverables

Invoke:

**output-format.md**

Generate:

- generated-testcases.md
- generated-testcases.xlsx

---

## Supporting Skills

| Skill | Responsibility |
|--------|----------------|
| testcase-generation.md | Generate manual test cases |
| output-format.md | Generate Markdown and Excel outputs |

---

## Rules

Always:

- Follow documented requirements.
- Maintain requirement traceability.
- Maintain scenario traceability.
- Generate reusable test cases.

Never:

- Invent functionality.
- Generate duplicate test cases.
- Skip documented scenarios.

---

## Deliverables

- generated-testcases.md
- generated-testcases.xlsx

---

## Success Criteria

Execution is successful when:

- Every requirement has corresponding test cases.
- Every planned scenario is covered.
- Markdown and Excel outputs are generated successfully.