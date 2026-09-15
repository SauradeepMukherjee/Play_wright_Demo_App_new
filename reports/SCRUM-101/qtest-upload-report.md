# qTest Upload Preparation Report — SCRUM-101

## Status: PAYLOAD PREPARED ONLY — NO LIVE UPLOAD HAS OCCURRED

This report documents a **payload-preparation step only**. Nothing has been pushed to qTest. No qTest test-case
IDs exist yet for any of these test cases. This agent has no HTTP tool and never attempted a network call.

## Source

- Input: `reports/SCRUM-101/generated-testcases.md`
- Checkpoint gate: `checkpoints["manual-test-cases"].status` in `qa-workflow-dashboard/status.json` = `APPROVED`
  (approved via dashboard action on 2026-09-15T09:42:46.000Z), confirmed before any mapping work began.

## What was done

The `qtest-upload` skill was invoked to reshape each of the **36 approved manual test cases**
(TC-SCRUM101-001 through TC-SCRUM101-036) into qTest's test-case payload shape:

- `name` — the test case title
- `description` — the source Description field, unchanged
- `precondition` — the source Preconditions field, unchanged
- `properties` — a single `Priority` field, mapped from the source Priority value
- `test_steps` — one `{ description, expected_result }` object per source step row, text preserved verbatim,
  including the combined "Expected (per requirement) / Observed (live behavior)" wording on the five
  discrepancy test cases (TC-SCRUM101-005, -013, -014, -027, -029)
- `sourceTestCaseId` — the originating `TC-SCRUM101-xxx` id, for traceability back to `generated-testcases.md`

**All 36 test cases were mapped. No content was invented, dropped, or reworded.**

## Priority-mapping note

The source document uses four priority levels: Critical, High, Medium, Low. qTest's payload `Priority` field
(per the skill's spec) only accepts `High | Medium | Low`. To conform to that target schema, all 7 test cases
marked **Critical** in the source (TC-SCRUM101-001, -002, -003, -021, -023, -025, -026) were mapped to **High**
in the payload. This is a schema-conformance decision, not a content change — the original Critical priority
remains visible in `reports/SCRUM-101/generated-testcases.md` as the source of record.

## Output files

- `reports/SCRUM-101/qtest-upload-payload.json` — the mapped payload array (36 entries)
- `reports/SCRUM-101/qtest-upload-report.md` — this report

## What has NOT happened

- No network call to qTest was made.
- No qTest test-case IDs were created or assigned.
- No credentials were read, requested, or assumed to exist.

## Next step for a live push (not performed by this agent)

To actually create these test cases in qTest, someone with real credentials must run:

```
node scripts/qtest-upload.js reports/SCRUM-101/qtest-upload-payload.json
```

This requires either:

- `config/qtest.config.json` populated with real values (copied from `config/qtest.config.example.json`), or
- the environment variables `QTEST_BASE_URL`, `QTEST_API_TOKEN`, and `QTEST_PROJECT_ID` set with real values.

Neither of these exists in this repository as of this writing, and this agent has no access to them and makes
no assumption that they exist. Until that script is run successfully against a real qTest instance, these 36
test cases exist only in this repo's payload file — not in qTest.
