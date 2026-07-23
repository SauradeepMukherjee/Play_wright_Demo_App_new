---
name: run-qa-pipeline
description: Run the full user-story-to-shipped-suite QA workflow for this repo (requirement read, test plan, exploratory pass, automation, healing, reporting, git delivery), pausing at the test plan checkpoint and auto-pushing to GitHub at the end. Use when asked to "run the QA pipeline", "process a user story end to end", or "do the full Prompt_E2E workflow".
---

Execute the 7-step workflow defined in [Prompt_E2E.md](../../../Prompt_E2E.md), acting as the primary orchestrator
described there. Follow it sequentially — do not skip a step — but insert two human checkpoints that the fixed
prompt script doesn't itself enforce (per [PROJECT_VISION.md](../../../PROJECT_VISION.md) guiding principle 5,
"human checkpoints stay human"):

1. **Read the user story** — default to `user_stories/SCRUM-101-ecommerce-checkout.md` unless the user names a different file. Extract requirements, acceptance criteria, business rules, target URL/credentials, and constraints as described in Prompt_E2E.md Step 1.

2. **Generate the test plan** — dispatch the `playwright-test-planner` subagent (`.claude/agents/playwright-test-planner.md`) to explore the live target app and produce `specs/<target>-test-plan.md` per Step 2's structure (positive, negative, functional, smoke, edge case, navigation, UI validation cases; minimum 20 well-structured cases).

   **CHECKPOINT — stop and show the plan to the user before continuing.** Do not proceed to automation until the plan is reviewed. This mirrors Vision principle 5 and the blueprint's Test Case Reviewer gate — it is the cheapest place to catch a wrong assumption, before any code is written.

3. **Exploratory pass** — if not already covered by the planner's own live exploration in step 2, skip this as a separate step; the planner subagent already drives a real browser. Do not re-explore manually unless the user asks for additional manual evidence collection.

4. **Generate automation** — dispatch the `playwright-test-generator` subagent (`.claude/agents/playwright-test-generator.md`) against the approved plan, writing specs under `tests/<target>/`.

5. **Execute and heal** — run `npm run test:e2e`. For any failures, dispatch the `playwright-test-healer` subagent (`.claude/agents/playwright-test-healer.md`), which runs/debugs/fixes/re-runs until green or marks `test.fixme()` with a reason. Re-run `npm run test:e2e` after healing to confirm the final state.

6. **Generate reports** — run the `generate-qa-report` skill (or invoke it directly: `npm run report:pdf` and `npm run report:excel`), then summarize the HTML dashboard already produced under `test-results/` by the custom reporter during the test run.

7. **Git delivery** — stage and commit the generated artifacts using the commit message template in Prompt_E2E.md Step 7, then run `git push` automatically. No approval checkpoint gates this push — the user has pre-authorized it for this workflow specifically so the pipeline can run end-to-end unattended. Before pushing, print the list of staged files and the exact commit message being used, so the push is visible rather than silent. This auto-push applies only to the full `run-qa-pipeline` run; standalone use of the `generate-qa-report` skill does not push on its own.

At the end, report: files added/modified, final pass/fail counts, what was healed vs. left as `test.fixme()`, the commit SHA, and confirmation that the push completed (or the error, if it failed).
