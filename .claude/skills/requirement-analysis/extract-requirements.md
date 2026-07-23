---
name: extract-requirements
description: Extract and structure functional requirements, non-functional requirements, business rules, actors, dependencies, risks, and gaps from a requirement document.
---

# Purpose

Analyze a validated requirement document and extract every element needed to build the Requirement Analysis Report.

---

# Inputs

Receive the validated requirement document from Requirement Analysis SKILL.md Step 1:

- Business Requirement Document (BRD)
- Functional Requirement Document (FRD)
- User Story
- Epic
- Feature Specification
- PDF
- Word Document
- Markdown Document

---

# Responsibilities

Extract:

- Business Objective
- Functional Requirements
- Non-Functional Requirements
- Actors and User Roles
- Acceptance Criteria
- Business Rules
- Dependencies
- Assumptions
- Risks
- Edge Cases
- Requirement Gaps and Open Questions
- Requirement Traceability (map each extracted item back to its source location in the document)

---

# Workflow

## Step 1 – Identify Business Objective

Summarize the overall business goal the document is trying to achieve.

## Step 2 – Extract Functional Requirements

List every capability the system must provide, worded as discrete, testable statements.

## Step 3 – Extract Non-Functional Requirements

List performance, security, usability, reliability, and compliance constraints, where documented.

## Step 4 – Identify Actors

List every user role, persona, or external system the document describes as interacting with the feature.

## Step 5 – Extract Acceptance Criteria

List the conditions that define "done" for each requirement, preserving the document's original wording.

## Step 6 – Identify Business Rules

List documented rules, constraints, and validation logic that govern system behavior.

## Step 7 – Detect Dependencies

List other features, systems, or documents this requirement depends on.

## Step 8 – Identify Assumptions and Risks

List anything the document assumes to be true, and anything that threatens successful delivery.

## Step 9 – Detect Requirement Gaps

Flag ambiguous, missing, or conflicting requirements as Open Questions instead of resolving them by assumption.

## Step 10 – Generate Requirement Traceability

Produce a mapping table linking each extracted requirement/rule/criterion to its source section in the input document.

---

# Rules

Always:

- Preserve the document's original wording for acceptance criteria and business rules.
- Flag ambiguity as an Open Question rather than resolving it.
- Keep every extracted item traceable to its source.

Never:

- Invent requirements or business rules not present in the source document.
- Assume undocumented functionality.
- Silently drop a requirement gap instead of flagging it.

---

# Output

Return structured requirement data to Requirement Analysis SKILL.md Step 3 for report generation.
