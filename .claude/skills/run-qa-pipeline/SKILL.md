---
name: run-qa-pipeline
description: Run the full user-story-to-shipped-suite QA workflow for this repo (requirement analysis, test plan, manual test cases, automation, healing, reporting, git delivery), pausing at three human checkpoints and auto-pushing to GitHub at the end. Use when asked to "run the QA pipeline" or "process a user story end to end".
---

Act as the primary orchestrator for the 5-agent QA pipeline described in [CLAUDE.md](../../../CLAUDE.md) —
that document is the current, authoritative flow (Requirement Analysis Agent → Playwright Test Planner →
Test Case Generator Agent → Playwright Test Generator → Playwright Test Healer).

## Human-in-the-Loop Checkpoint Protocol

This is the single, reusable checkpoint pattern used at all three approval points in this pipeline (Requirement
Analysis, Test Plan, Manual Test Cases — steps 1, 2, and 4 below). It's defined once here; each step just
invokes it with its own stage id, responsible agent, artifact, and original input — do not re-implement or
fork this logic per stage, and do not create a separate agent or skill for it. The orchestrator alone controls
progression; the agent dispatched at a stage remains responsible only for producing/regenerating that stage's
artifact.

**State:** a checkpoint puts the workflow into `WAITING_FOR_HUMAN`. The orchestrator never proceeds past this
state on its own — only an explicit human decision moves it forward. Silence, an ambiguous reply, or anything
that isn't exactly one of the three actions below must never be treated as approval; re-ask instead of guessing.

**Available actions**, presented to the human at every `WAITING_FOR_HUMAN` pause — `APPROVE`, `REJECT`, `RERUN`:

- **APPROVE** — record the approval, leave the current artifact unchanged, continue to the stage's next step.
  Never regenerate anything on APPROVE.
- **REJECT** — stop at the current stage. Capture the human's feedback text. Dispatch the *same* agent
  responsible for this stage again, with the stage's original input plus the human's feedback appended.
  Regenerate the artifact, return to `WAITING_FOR_HUMAN` for this same stage, and ask again. A REJECT must never
  advance to the next stage — only a later, explicit APPROVE can do that.
- **RERUN** — stop at the current stage. Dispatch the *same* agent again with the *same* original input,
  unchanged — no feedback text, which is what distinguishes it from REJECT. Regenerate the artifact, return to
  `WAITING_FOR_HUMAN` for this same stage, and ask again.

There is no maximum number of REJECT or RERUN cycles — repeat indefinitely until the human explicitly sends
APPROVE. Regeneration always routes back to the one agent that owns the stage, per CLAUDE.md's "One Agent, One
Responsibility" — never substitute a different agent to satisfy a REJECT or RERUN.

**State record (future-UI-ready).** At every `WAITING_FOR_HUMAN` pause and after every decision, update the
`checkpoints.<stage-id>` object in
[qa-workflow-dashboard/status.json](../../../qa-workflow-dashboard/status.json) — this repo's existing
dashboard status file (already served by [qa-workflow-dashboard/server.js](../../../qa-workflow-dashboard/server.js)
via `npm run dashboard`), reused here rather than inventing a new mechanism — with:

```json
{
  "stage": "Requirement Analysis",
  "status": "WAITING_FOR_HUMAN",
  "artifact": ["reports/<story>/requirement-analysis-report.md", "reports/<story>/requirement-analysis-report.json"],
  "available_actions": ["APPROVE", "REJECT", "RERUN"],
  "feedback": null,
  "decision_history": [
    { "action": "REJECT", "feedback": "missing NFRs", "at": "<ISO timestamp>" },
    { "action": "RERUN", "feedback": null, "at": "<ISO timestamp>" }
  ],
  "rerun_count": 1,
  "rejection_count": 1
}
```

`status` moves `WAITING_FOR_HUMAN` → `APPROVED` as the decision lands; `decision_history` only ever grows
(append, never overwrite, oldest first); `rerun_count`/`rejection_count` are running totals for that stage.
This is data-only — no UI is being built now, this just gives a future one (or this existing dashboard) real
state to render: current stage, current status, current artifact, available actions, human feedback, decision
history, and rerun/rejection counts.

Follow these 8 steps sequentially — do not skip a step, and do not perform work that belongs to another
agent's responsibility (per CLAUDE.md's "One Agent, One Responsibility" principle). Insert three human
checkpoints (per [PROJECT_VISION.md](../../../PROJECT_VISION.md) guiding principle 5, "human checkpoints
stay human", and CLAUDE.md's `run-qa-pipeline` section):

1. **Requirement analysis** — dispatch the `Requirement Analysis Agent` subagent (`.claude/agents/requirement-analysis-agent.md`), invoking the `requirement-analysis` skill, against the user story (default `user_stories/SCRUM-101-ecommerce-checkout.md` unless the user names a different file). Produces `requirement-analysis-report.md` and `requirement-analysis-report.json`.

   **CHECKPOINT** — apply the Human-in-the-Loop Checkpoint Protocol above:
   `stage-id: requirement-analysis`, agent = `Requirement Analysis Agent`, artifact = `requirement-analysis-report.md`
   / `.json`, original input = the user story. On APPROVE, continue to Step 2. Do not proceed to test planning
   until the human explicitly sends APPROVE for this stage.

2. **Generate the test plan** — dispatch the `playwright-test-planner` subagent (`.claude/agents/playwright-test-planner.md`) to analyze the approved Requirement Analysis Report and explore the live target app, producing `specs/<target>-test-plan.md` (positive, negative, functional, smoke, edge case, navigation, UI validation cases; minimum 20 well-structured cases).

   **CHECKPOINT** — apply the Human-in-the-Loop Checkpoint Protocol above: `stage-id: test-plan`, agent =
   `playwright-test-planner`, artifact = `specs/<target>-test-plan.md`, original input = the approved
   Requirement Analysis Report. On APPROVE, continue to Step 3. Do not proceed to test case generation until the
   human explicitly sends APPROVE for this stage — this is the cheapest place to catch a wrong assumption,
   before any test cases or code are written.

3. **Exploratory pass** — already covered by the planner's own live exploration in step 2; do not re-explore manually unless the user asks for additional manual evidence collection.

4. **Generate manual test cases** — dispatch the `testcase-generator-agent` subagent (`.claude/agents/testcase-generator-agent.md`), invoking the `test-case-generation` skill, against the approved Requirement Analysis Report and Structured Test Plan together. Produces `generated-testcases.md` and `generated-testcases.xlsx`.

   **CHECKPOINT** — apply the Human-in-the-Loop Checkpoint Protocol above: `stage-id: manual-test-cases`, agent
   = `testcase-generator-agent`, artifact = `generated-testcases.md` / `.xlsx`, original input = the approved
   Requirement Analysis Report and Structured Test Plan together. On APPROVE, continue to Step 5. Do not proceed
   to automation until the human explicitly sends APPROVE for this stage.

5. **Generate automation** — dispatch the `playwright-test-generator` subagent (`.claude/agents/playwright-test-generator.md`) against the approved test plan, writing specs under `tests/<target>/`.

6. **Execute and heal** — dispatch the `playwright-test-healer` subagent (`.claude/agents/playwright-test-healer.md`) against the newly generated specs. Test execution is the Healer's responsibility per CLAUDE.md, not the orchestrator's — do not run `npm run test:e2e` yourself first. The subagent runs the suite via its own `test_run`/`test_debug` MCP tools, debugs and fixes failures, re-runs until green, and marks any unfixable test with `test.fixme()` plus a reason. Have it report back the final pass/fail counts and what was healed vs. left as `test.fixme()` — use that for step 7's summary instead of re-running the suite yourself.

7. **Generate reports** — run the `generate-qa-report` skill (or invoke it directly: `npm run report:pdf` and `npm run report:excel`), then summarize the HTML dashboard already produced under `test-results/` by the custom reporter during the test run.

8. **Git delivery** — stage and commit the generated artifacts, then run `git push` automatically. No approval
   checkpoint gates this push — the user has pre-authorized it for this workflow specifically so the pipeline
   can run end-to-end unattended. Before pushing, print the list of staged files and the exact commit message
   being used, so the push is visible rather than silent. This auto-push applies only to the full
   `run-qa-pipeline` run; standalone use of the `generate-qa-report` skill does not push on its own.

   `git add` the requirement report, test plan, manual test cases, and spec files normally (they aren't
   gitignored). `/test-results/` **is** gitignored wholesale, though — a plain `git add test-results/` is a
   silent no-op there. Force-add only the shippable report deliverables, not the regenerable raw/per-run data:

   ```
   git add -f test-results/execution-report.html test-results/execution-report.pdf \
     test-results/<story>-checkout-test-report.md test-results/test-cases.xlsx
   ```

   Leave `test-results/raw-results/`, `test-results/history/`, `test-results/artifacts/` (screenshots/videos/
   traces), `results.json`, and `results.xml` out of the commit — those are disposable per-run data, not
   deliverables, and are gitignored on purpose.

   Use this repo's actual convention — Conventional Commits, `type(scope): summary`. Match recent history
   (`git log`), e.g. `feat(qa): automate <story-id> checkout suite via multi-agent QA pipeline` for a first
   full run, or `fix(qa): ...` / `chore(qa): ...` for a re-run that only heals or updates reports. Scope is
   `qa` (or `dashboard` for status/report-only changes).

At the end, report: files added/modified, final pass/fail counts, what was healed vs. left as `test.fixme()`,
each checkpoint's decision history (REJECT/RERUN counts, if any), the commit SHA, and confirmation that the
push completed (or the error, if it failed).
