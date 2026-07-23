---
name: Requirement Analysis
description: Analyze software requirements and generate a structured Requirement Analysis Report for downstream QA agents.
---

# Requirement Analysis

## Purpose

The Requirement Analysis skill is responsible for understanding, validating, and organizing software requirements into a structured Requirement Analysis Report.

This skill serves as the foundation of the AI QA Engineering workflow by ensuring that all downstream agents work with complete, traceable, and validated requirements.

---

## When to Use

Use this skill when:

- A Business Requirement Document (BRD) is provided.
- A Functional Requirement Document (FRD) is provided.
- A User Story or Epic is available.
- Software requirements need to be analyzed before test planning.
- A structured Requirement Analysis Report is required.

---

## Inputs

The skill accepts one or more of the following:

- Business Requirement Document (BRD)
- Functional Requirement Document (FRD)
- User Story
- Epic
- Feature Specification
- PDF
- Word Document
- Markdown Document

---

## Workflow

Execute the following workflow sequentially.

### Step 1 – Validate Input

Verify that a valid requirement document is available.

If no valid requirement exists, stop execution and report the missing dependency.

---

### Step 2 – Analyze Requirements

Invoke:

**extract-requirements.md**

Responsibilities:

- Extract Functional Requirements
- Extract Non-Functional Requirements
- Identify Business Rules
- Extract Acceptance Criteria
- Identify Actors
- Detect Dependencies
- Identify Risks
- Detect Requirement Gaps
- Generate Requirement Traceability

---

### Step 3 – Generate Requirement Analysis Report

Generate:

- requirement-analysis-report.md
- requirement-analysis-report.json

Both outputs must contain identical information.

---

## Supporting Skills

| Skill | Responsibility |
|--------|----------------|
| extract-requirements.md | Analyze and structure software requirements |

---

## Deliverables

### Markdown Report

**requirement-analysis-report.md**

Purpose:

- Human-readable documentation
- QA Review
- Input for downstream agents

---

### JSON Report

**requirement-analysis-report.json**

Purpose:

- Machine-readable output
- AI agent integration
- Workflow orchestration

---

## Rules

Always:

- Follow documented requirements.
- Preserve business intent.
- Maintain requirement traceability.
- Identify ambiguities.
- Report missing information.

Never:

- Invent requirements.
- Invent business rules.
- Assume undocumented functionality.
- Modify acceptance criteria.

---

## Downstream Consumers

The generated Requirement Analysis Report will be consumed by:

- Playwright Test Planner Agent
- Test Case Generator Agent
- Future Reporting Agents

---

## Success Criteria

Execution is successful when:

- All requirements are analyzed.
- Functional Requirements are identified.
- Non-Functional Requirements are identified.
- Acceptance Criteria are extracted.
- Business Rules are documented.
- Requirement gaps are identified.
- Requirement traceability is maintained.
- Markdown and JSON reports are generated successfully.