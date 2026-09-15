# qTest Upload Preparation Report — SCRUM-101

## Status: Payload prepared only — NO live upload has occurred

This agent has **not** pushed anything to qTest. This report and the accompanying payload file are a
**preparation step only**. No network call was made, no qTest test-case IDs were created, and no qTest
instance was contacted.

---

## Source Validation

- Source manual test cases: `reports/SCRUM-101/generated-testcases.md`
- Checkpoint verified: `checkpoints["manual-test-cases"].status` in `qa-workflow-dashboard/status.json` is
  `APPROVED` (decision recorded at 2026-09-15T15:14:30.390Z, source: dashboard).

## Mapping Summary

- Total manual test cases mapped: **34** (MTC-001 through MTC-034)
- Skill invoked: `qtest-upload` (via the `Skill` tool)
- Each source test case was reshaped 1:1 into a qTest test-case payload object containing `name`,
  `description`, `precondition`, a `Priority` property (mapped from the source Priority field), an ordered
  `test_steps` array (`description` / `expected_result` pairs taken verbatim from the source's Action /
  Expected Result table), and a `sourceTestCaseId` field carrying the original `MTC-xxx` identifier for
  traceability back to `generated-testcases.md`.
- No test steps, expected results, or priorities were invented, reworded, or omitted — this is a structural
  reshape, not a rewrite. Discrepancy-flagged test cases (MTC-003, MTC-006, MTC-013, MTC-014, MTC-022,
  MTC-027) retain their full "Expected (Per Requirement)" vs. "Observed (Live Application)" wording unchanged.

## Output

- `reports/SCRUM-101/qtest-upload-payload.json` — the mapped payload array (34 entries), ready to be handed
  to the live upload script.

## What Happens Next (Not Performed By This Agent)

This agent has no HTTP tool and does not read or write qTest credentials. To actually push these 34 test
cases into qTest, someone with real credentials must run:

```
node scripts/qtest-upload.js reports/SCRUM-101/qtest-upload-payload.json
```

That script requires either:

- `config/qtest.config.json` (copied from `config/qtest.config.example.json` and filled in with real values), or
- the `QTEST_BASE_URL`, `QTEST_API_TOKEN`, and `QTEST_PROJECT_ID` environment variables.

Neither of these exists in this repository at the time of this report, and this agent has no access to them
and makes no assumption that they exist. Until that script is run successfully against a real qTest instance,
none of these 34 test cases exist in qTest, and no qTest test-case IDs have been assigned or claimed anywhere
in this pipeline.
