# Project Vision

## What this project is today

An agent-driven QA automation pipeline that takes a single user story
([SCRUM-101](user_stories/SCRUM-101-ecommerce-checkout.md), the SauceDemo checkout flow) all the way from
requirements to a committed, multi-browser, self-healing Playwright suite with generated reports. The lifecycle
is defined in [Prompt_E2E.md](Prompt_E2E.md) and executed by three specialized agents
([planner](.github/agents/playwright-test-planner.agent.md), [generator](.github/agents/playwright-test-generator.agent.md),
[healer](.github/agents/playwright-test-healer.agent.md)) talking to the app through MCP servers, orchestrated
by a primary agent (currently GitHub Copilot).

It currently proves the model on exactly one target application and one user story.

## The problem this is meant to solve

Manual QA lifecycles are slow and disconnected: requirements live in one doc, test plans in another, automation
scripts drift from both, and reports are assembled by hand after the fact. Traceability from "acceptance
criterion" to "test case" to "pass/fail result" is usually lost. Hand-written selectors rot the moment the UI
changes, and nobody re-derives the test plan when that happens.

The bet this project is making: if requirement-reading, planning, generation, execution, and healing are each
handled by a narrow, tool-scoped agent with a live browser instead of static assumptions, the resulting suite
stays truthful to the real application, and the human's job shifts from writing/fixing selectors to reviewing
plans and outcomes.

## Vision

Grow this from a single-app proof of concept into a reusable **agentic QA framework**: given any user story
and any target application's URL/credentials, the same pipeline — plan, explore, generate, execute, heal,
document, ship — should run with no code changes to the agents themselves, only configuration and input
documents changing.

Concretely, "done" looks like:

- Dropping a new user story file into `user_stories/` and pointing the framework at a target app is enough to
  produce a reviewed test plan, a generated suite, an execution report, and a traceability matrix — without
  hand-editing selectors or report scripts per project.
- Every test case is traceable back to the acceptance criterion that produced it and forward to its latest
  execution result.
- Failing tests are triaged automatically (healed, or explicitly flagged with a reason) before a human ever
  looks at a red run.
- Reporting is a byproduct of structured execution data, not a manually maintained script per format.

## Guiding principles

1. **One agent, one responsibility.** The planner never writes test code, the generator never invents scenarios,
   the healer never expands scope — each stays inside the boundary already established by the existing agent
   definitions. New capabilities get new agents, not fatter existing ones.
2. **MCP is the integration boundary.** Agents reach the browser, the test runner, and the repository only
   through MCP servers (`playwright-test`, `playwright`, `github`). Anything an agent needs to do should be
   expressible as an MCP tool call, not a one-off script it shells out to.
3. **Live truth over assumptions.** Plans and tests are derived from actually driving a real browser session,
   not guessed from static markup. This is why the generator replays each step live instead of templating code.
4. **Structured data first, formatted reports second.** JSON execution results are the source of truth
   ([test-results/raw-results/](test-results/raw-results/)); Markdown, HTML, PDF, and charts are all views
   derived from that data, not independently maintained artifacts.
5. **Human checkpoints stay human.** Test plan review and go/no-go release recommendations remain explicit
   deliverables a person signs off on — the goal is removing toil, not removing judgment.
6. **Config over hardcoding.** Target URL, credentials, and environment are the main things standing between
   this project and being app-agnostic; they should become inputs, not constants baked into spec files.

## Explicit non-goals (for now)

- Non-Playwright automation frameworks (Selenium, Cypress, etc.).
- Native mobile app testing.
- Load, performance, or security testing.
- Fully autonomous release decisions — recommendations are generated, not acted on, without a human.

## Success looks like

- Time from "new user story" to "reviewable test plan" shrinks to a single orchestrated run.
- The percentage of acceptance criteria with at least one traced, automated test case is visible and trends
  toward 100%.
- Healing resolves the majority of selector/timing failures without human intervention; the remainder are
  clearly flagged with `test.fixme()` and a reason, never silently green.
- Adding a second target application requires new config and a new user story, not new agent code.
