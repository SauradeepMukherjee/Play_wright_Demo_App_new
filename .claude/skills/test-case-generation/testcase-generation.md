---
name: testcase-generation
description: Generate comprehensive manual test cases from analyzed requirements and planned test scenarios.
---

# Purpose

Generate high-quality manual test cases using the Requirement Analysis Report and Structured Test Plan.

---

# Inputs

Receive:

- Requirement Analysis Report
- Structured Test Plan

---

# Responsibilities

Generate:

- Test Case Name
- Test Case Description
- Preconditions
- Test Data
- Test Steps
- Expected Results
- Priority
- Severity
- Requirement Mapping
- Scenario Mapping

---

# Workflow

## Step 1

Read the Requirement Analysis Report.

Understand:

- Functional Requirements
- Non-Functional Requirements
- Acceptance Criteria
- Business Rules

---

## Step 2

Read the Structured Test Plan.

Identify:

- Features
- User Flows
- Planned Test Scenarios

---

## Step 3

Generate Manual Test Cases.

Each test case should include:

- Unique Test Case ID
- Test Case Name
- Requirement ID
- Scenario ID
- Description
- Preconditions
- Test Data

---

## Step 4

Generate Test Steps.

Each step should contain:

- Step Number
- Action
- Expected Result

---

## Step 5

Assign Metadata.

Generate:

- Priority
- Severity
- Tags
- Requirement Traceability
- Scenario Traceability

---

# Rules

Always:

- Cover every requirement.
- Validate every acceptance criterion.
- Include positive scenarios.
- Include negative scenarios.
- Include boundary scenarios where applicable.

Never:

- Invent functionality.
- Modify business rules.
- Skip documented scenarios.

---

# Output

Return structured test case data to the Output Generation Skill.
