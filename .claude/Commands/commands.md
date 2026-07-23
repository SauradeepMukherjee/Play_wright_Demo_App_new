Read and apply the project instructions from CLAUDE.md before starting.

Read and understand the provided Requirement Document (BRD, FRD, User Story, Epic, Feature Specification, PDF, DOCX, or Markdown).

Invoke the Requirement Analysis Agent (.claude/agents/requirement-analysis-agent.md) to analyze the Requirement Document and generate a structured Requirement Analysis Report.

Pause and present the generated Requirement Analysis Report for user review and approval before proceeding.

After approval, invoke the Playwright Test Planner agent (.claude/agents/playwright-test-planner.md) to analyze the approved Requirement Analysis Report, explore the target application, and produce a structured test plan.

Pause and present the generated test plan for user review and approval before proceeding.

After approval, invoke the Test Case Generator Agent (.claude/agents/testcase-generator-agent.md) to generate comprehensive manual test cases from the approved Requirement Analysis Report and Structured Test Plan.

Pause and present the generated manual test cases for user review and approval before proceeding.

After approval, invoke the Playwright Test Generator agent (.claude/agents/playwright-test-generator.md) to generate the Playwright automation suite from the approved test plan.

Once the test suite has been generated, invoke the Playwright Test Healer agent (.claude/agents/playwright-test-healer.md) to execute the tests, diagnose failures, repair unstable tests where possible, and re-run the suite until it passes or a test is marked as test.fixme().

Generate the execution reports and provide a concise summary of:
- Requirement Analysis Report
- Structured Test Plan
- Generated Manual Test Cases
- Generated Test Scripts
- Test Execution Results
- Self-Healing Actions Performed
- Final Execution Status
- Report Locations

Follow the principle of "One Agent, One Responsibility."

Do not perform responsibilities that belong to agents that have not yet been implemented.

Input:
$ARGUMENTS
