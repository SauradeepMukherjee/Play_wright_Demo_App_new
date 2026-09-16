# qTest Upload Preparation Report — SCRUM-101

## Status: Payload prepared. NOT uploaded.

This report documents a **payload preparation step only**. No network call to qTest has been made, no qTest
test-case IDs exist yet, and nothing has been pushed to any qTest instance. This agent (`qtest-upload-agent`)
has no HTTP tool and never attempts one — that is by design.

---

## Source

- `reports/SCRUM-101/generated-testcases.md`
- Checkpoint verified: `checkpoints["manual-test-cases"].status` = `APPROVED` in
  `qa-workflow-dashboard/status.json` (approved 2026-09-16T12:10:40.692Z).

## What was done

The `qtest-upload` skill was invoked (via the `Skill` tool) to reshape all **31 approved manual test cases**
(TC-001 through TC-031) from `reports/SCRUM-101/generated-testcases.md` into qTest's test-case payload shape.
This is a pure reshape:

- Test case title → `name`
- Description/objective → `description`
- Preconditions → `precondition`
- Source Priority → a `Priority` property, mapped to qTest's supported values (`High` / `Medium` / `Low`). The
  source document's `Critical` priority values (TC-001, TC-002, TC-018, TC-020, TC-021, TC-022) were mapped to
  `High`, since qTest's payload schema in this skill only supports High/Medium/Low — no content was invented,
  only the label was normalized to the closest available bucket.
- Each numbered test step's Action/Expected Result → `test_steps[].description` / `expected_result`
- For the 7 confirmed-defect test cases that use an Expected-vs-Observed split in the source
  (TC-005, TC-011, TC-012, TC-013, TC-022, TC-024, TC-026), both the "Expected Result (Per Requirement)" and
  "Observed Result (Live Application)" text plus the recorded Step Status were preserved verbatim and combined
  into the single `expected_result` field (labeled `Expected (Per Requirement): ... | Observed (Live
  Application): ... | Step Status: ...`), since qTest's step schema has only one expected-result field. No
  wording was altered or invented.
- Every mapped entry carries a `sourceTestCaseId` field holding the original `TC-xxx` id from
  `generated-testcases.md`, preserving full traceability back to the source.

No test steps, expected results, or requirement content were added, removed, or rewritten beyond this
structural reshape.

## Output

- **31 of 31** manual test cases mapped successfully.
- Payload written to: `reports/SCRUM-101/qtest-upload-payload.json` (JSON array, 31 objects).

## What has NOT happened

- Nothing has been sent to qTest. No qTest project, module, or test-case ID has been created or referenced.
- This repo has no qTest credentials configured (`config/qtest.config.json` does not exist here — only the
  gitignored template `config/qtest.config.example.json` is present).

## Next step (not performed by this agent)

A live push requires a separate, explicit step run by the orchestrator or a human, with real credentials:

```
node scripts/qtest-upload.js reports/SCRUM-101/qtest-upload-payload.json
```

This script needs either:

- `config/qtest.config.json` (copy `config/qtest.config.example.json` and fill in real values), or
- the environment variables `QTEST_BASE_URL`, `QTEST_API_TOKEN`, `QTEST_PROJECT_ID`

Neither of these exists in this repository as of this run, and this agent has no access to and makes no
assumption about them. Until that script is run successfully against a real qTest instance, the 31 test cases
above exist only in this repo's `qtest-upload-payload.json` — they are not present in qTest.
