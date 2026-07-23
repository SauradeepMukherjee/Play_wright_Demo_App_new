# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

This repository is an AI-driven QA automation platform built around a specialized multi-agent workflow. Its objective is to automate the complete QA lifecycle — from a requirement document to a fully tested, self-healed Playwright automation suite with execution reports.

---

# Current Workflow

```
Requirement Document
(BRD / FRD / User Story / Epic / Feature Specification)
        │
        ▼
Requirement Analysis Agent
        │
        ▼
Requirement Analysis Report
        │
        ▼
Playwright Test Planner Agent
        │
        ▼
Structured Test Plan
        │
        ▼
Test Case Generator Agent
        │
        ▼
Manual Test Cases
(Markdown + Excel)
        │
        ▼
Playwright Test Generator Agent
        │
        ▼
Playwright Test Suite
        │
        ▼
Playwright Test Healer Agent
        │
        ▼
Stable, Passing Tests
        │
        ▼
Execution & Reports
```

The Requirement Analysis Agent executes first and produces a structured Requirement Analysis Report.

The Playwright Test Planner consumes the approved Requirement Analysis Report to generate a structured Test Plan.

The Test Case Generator Agent consumes both the approved Requirement Analysis Report and the approved Structured Test Plan to generate execution-ready manual test cases.

The Playwright Test Generator consumes the approved Structured Test Plan to generate the Playwright automation suite.

The Playwright Test Healer executes, diagnoses, repairs, and stabilizes the generated Playwright tests.

---

# Current Agent Responsibilities

Each agent has a single responsibility.

Never perform work that belongs to another agent.

---

## 1. Requirement Analysis Agent

**Location**

```
.claude/agents/requirement-analysis-agent.md
```

Responsibilities

- Analyze requirement documents.
- Extract functional requirements.
- Extract non-functional requirements.
- Extract business rules.
- Extract acceptance criteria.
- Identify actors.
- Identify dependencies.
- Identify assumptions.
- Identify risks.
- Produce a Requirement Analysis Report.

Does NOT:

- Generate test plans.
- Generate test cases.
- Generate automation.
- Execute tests.
- Invent missing requirements.

---

## 2. Playwright Test Planner Agent

**Location**

```
.claude/agents/playwright-test-planner.md
```

Responsibilities

- Explore the application using Playwright MCP.
- Analyze the Requirement Analysis Report.
- Produce a structured Test Plan.
- Identify user flows.
- Define test scenarios.

Does NOT:

- Generate manual test cases.
- Generate Playwright code.
- Execute tests.

---

## 3. Test Case Generator Agent

**Location**

```
.claude/agents/testcase-generator-agent.md
```

Responsibilities

- Read the approved Requirement Analysis Report.
- Read the approved Structured Test Plan.
- Invoke the Test Case Generation Skill.
- Produce comprehensive manual test cases.
- Generate Markdown output.
- Generate Excel output.

Does NOT:

- Explore the application.
- Generate Playwright automation.
- Execute tests.
- Modify requirements.

---

## 4. Playwright Test Generator Agent

**Location**

```
.claude/agents/playwright-test-generator.md
```

Responsibilities

- Consume the approved Structured Test Plan.
- Replay scenarios against the application.
- Generate Playwright automation.

Does NOT:

- Modify requirements.
- Generate manual test cases.
- Execute tests.

---

## 5. Playwright Test Healer Agent

**Location**

```
.claude/agents/playwright-test-healer.md
```

Responsibilities

- Execute Playwright tests.
- Diagnose failures.
- Repair unstable tests.
- Re-run the suite.
- Mark unfixable tests using `test.fixme()`.

Does NOT:

- Generate requirements.
- Generate test plans.
- Generate manual test cases.

---

# Skills

Located under:

```
.claude/skills/
```

---

## Requirement Analysis

Responsible for:

- Validating requirement documents.
- Extracting requirements.
- Producing:
  - requirement-analysis-report.md
  - requirement-analysis-report.json

---

## Test Case Generation

Responsible for:

- Reading:
  - Requirement Analysis Report
  - Structured Test Plan
- Generating:
  - Manual Test Cases
  - Markdown output
  - Excel output

Supporting files:

```
SKILL.md
testcase-generation.md
output-generation.md
```

---

## run-qa-pipeline

Responsible for orchestrating the complete QA workflow.

Execution sequence:

1. Requirement Analysis Agent
2. Playwright Test Planner Agent
3. Test Case Generator Agent
4. Playwright Test Generator Agent
5. Playwright Test Healer Agent

The workflow pauses for user approval after:

- Requirement Analysis Report
- Structured Test Plan
- Manual Test Cases

before continuing to the next stage.

---

## generate-qa-report

Generates QA execution reports from Playwright execution results.

---

# Design Principles

The project follows these principles:

- One Agent, One Responsibility
- One Skill, One Capability
- Human approval at key workflow checkpoints
- No overlapping responsibilities between agents
- Maintain full traceability from Requirement → Test Plan → Test Case → Automation → Execution

---

# Scope

The repository currently implements a modular, multi-agent QA workflow.

Future enhancements should extend the existing workflow rather than duplicate responsibilities already owned by an agent or skill.