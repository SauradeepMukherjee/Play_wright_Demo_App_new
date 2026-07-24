---
name: run-qa-pipeline
description: Run the full user-story-to-shipped-suite QA workflow for this repo (requirement analysis, test plan, manual test cases, automation, healing, reporting, git delivery), pausing at three human checkpoints and auto-pushing to GitHub at the end. Use when asked to "run the QA pipeline", "process a user story end to end", or "do the full Prompt_E2E workflow".
---

Act as the primary orchestrator for the 5-agent QA pipeline described in [CLAUDE.md](../../../CLAUDE.md) —
that document is the current, authoritative flow (Requirement Analysis Agent → Playwright Test Planner →
Test Case Generator Agent → Playwright Test Generator → Playwright Test Healer). [Prompt_E2E.md](../../../Prompt_E2E.md)
predates the Requirement Analysis and Test Case Generator agents and is only a source for supplementary
report-structure details (Phase 6 deliverables) where CLAUDE.md doesn't spell them out — do not follow its
older 7-phase numbering as the step sequence, and don't use its one-line Phase 7 commit message as-is (see
step 8 below for this repo's actual convention).

Follow these 8 steps sequentially — do not skip a step, and do not perform work that belongs to another
agent's responsibility (per CLAUDE.md's "One Agent, One Responsibility" principle). Insert three human
checkpoints (per [PROJECT_VISION.md](../../../PROJECT_VISION.md) guiding principle 5, "human checkpoints
stay human", and CLAUDE.md's `run-qa-pipeline` section):

1. **Requirement analysis** — dispatch the `Requirement Analysis Agent` subagent (`.claude/agents/requirement-analysis-agent.md`), invoking the `requirement-analysis` skill, against the user story (default `user_stories/SCRUM-101-ecommerce-checkout.md` unless the user names a different file). Produces `requirement-analysis-report.md` and `requirement-analysis-report.json`.

   **CHECKPOINT — stop and show the Requirement Analysis Report to the user before continuing.** Do not proceed to test planning until it's reviewed.

2. **Generate the test plan** — dispatch the `playwright-test-planner` subagent (`.claude/agents/playwright-test-planner.md`) to analyze the approved Requirement Analysis Report and explore the live target app, producing `specs/<target>-test-plan.md` (positive, negative, functional, smoke, edge case, navigation, UI validation cases; minimum 20 well-structured cases).

   **CHECKPOINT — stop and show the plan to the user before continuing.** Do not proceed until the plan is reviewed. This is the cheapest place to catch a wrong assumption, before any test cases or code are written.

3. **Exploratory pass** — already covered by the planner's own live exploration in step 2; do not re-explore manually unless the user asks for additional manual evidence collection.

4. **Generate manual test cases** — dispatch the `testcase-generator-agent` subagent (`.claude/agents/testcase-generator-agent.md`), invoking the `test-case-generation` skill, against the approved Requirement Analysis Report and Structured Test Plan together. Produces `generated-testcases.md` and `generated-testcases.xlsx`.

   **CHECKPOINT — stop and show the generated manual test cases to the user before continuing.** Do not proceed to automation until they're reviewed.

5. **Generate automation** — dispatch the `playwright-test-generator` subagent (`.claude/agents/playwright-test-generator.md`) against the approved test plan, writing specs under `tests/<target>/`.

6. **Execute and heal** — dispatch the `playwright-test-healer` subagent (`.claude/agents/playwright-test-healer.md`) against the newly generated specs. Test execution is the Healer's responsibility per CLAUDE.md, not the orchestrator's — do not run `npm run test:e2e` yourself first. The subagent runs the suite via its own `test_run`/`test_debug` MCP tools, debugs and fixes failures, re-runs until green, and marks any unfixable test with `test.fixme()` plus a reason. Have it report back the final pass/fail counts and what was healed vs. left as `test.fixme()` — use that for step 7's summary instead of re-running the suite yourself.

7. **Generate reports** — run the `generate-qa-report` skill (or invoke it directly: `npm run report:pdf` and `npm run report:excel`), then summarize the HTML dashboard already produced under `test-results/` by the custom reporter during the test run.

8. **Git delivery** — stage and commit the generated artifacts (requirement report, test plan, manual test cases, spec files, and everything under `test-results/`), then run `git push` automatically. No approval checkpoint gates this push — the user has pre-authorized it for this workflow specifically so the pipeline can run end-to-end unattended. Before pushing, print the list of staged files and the exact commit message being used, so the push is visible rather than silent. This auto-push applies only to the full `run-qa-pipeline` run; standalone use of the `generate-qa-report` skill does not push on its own.

   Use this repo's actual convention — Conventional Commits, `type(scope): summary` — not the generic
   one-liner in Prompt_E2E.md Phase 7. Match recent history (`git log`), e.g. `feat(qa): automate <story-id>
   checkout suite via multi-agent QA pipeline` for a first full run, or `fix(qa): ...` / `chore(qa): ...` for
   a re-run that only heals or updates reports. Scope is `qa` (or `dashboard` for status/report-only changes).

At the end, report: files added/modified, final pass/fail counts, what was healed vs. left as `test.fixme()`, the commit SHA, and confirmation that the push completed (or the error, if it failed).
