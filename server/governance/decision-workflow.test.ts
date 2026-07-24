import assert from "node:assert/strict";
import test from "node:test";
import {
  createGovernanceDecisionRecord,
  verifyGovernanceDecisionWorkflow,
} from "./decision-workflow.js";

test("Decision Workflow verifies every PROGRAM-006 decision subject", () => {
  const evidence = verifyGovernanceDecisionWorkflow([
    createGovernanceDecisionRecord(
      "CERTIFICATION",
      "closure-certification",
      "GO",
      "PROGRAM_006_CERTIFICATION_REPORT.md",
    ),
    createGovernanceDecisionRecord(
      "CAMPAIGN",
      "campaign-governance",
      "GO",
      "CAMPAIGN_001_VERIFICATION_REPORT.md",
    ),
    createGovernanceDecisionRecord(
      "APPROVAL",
      "approval-workflow",
      "GO",
      "PROGRAM_006_CERTIFICATION_REPORT.md",
    ),
    createGovernanceDecisionRecord(
      "MISSION",
      "mission-order-governance",
      "GO",
      "P6-MO-001_VERIFICATION_REPORT.md",
    ),
    createGovernanceDecisionRecord(
      "LIFECYCLE",
      "program-lifecycle",
      "GO",
      "PROGRAM_006_VERIFICATION_REPORT.md",
    ),
  ]);

  assert.equal(evidence.ready, true);
  assert.equal(evidence.subjectCount, 5);
  assert.equal(evidence.goSubjectCount, 5);
  assert.deepEqual(
    evidence.records.map((record) => record.subject),
    [
      "program-lifecycle",
      "mission-order-governance",
      "campaign-governance",
      "approval-workflow",
      "closure-certification",
    ],
  );
  assert.equal(Object.isFrozen(evidence), true);
  assert.equal(Object.isFrozen(evidence.records), true);
});

test("Decision Workflow reports not ready when a subject is in rework", () => {
  const evidence = verifyGovernanceDecisionWorkflow([
    createGovernanceDecisionRecord(
      "LIFECYCLE",
      "program-lifecycle",
      "REWORK",
      "PROGRAM_006_VERIFICATION_REPORT.md",
    ),
  ]);

  assert.equal(evidence.ready, false);
  assert.equal(evidence.goSubjectCount, 0);
});

test("Decision Workflow rejects duplicate and unknown subjects", () => {
  assert.throws(
    () =>
      verifyGovernanceDecisionWorkflow([
        createGovernanceDecisionRecord(
          "A",
          "program-lifecycle",
          "GO",
          "PROGRAM_006_VERIFICATION_REPORT.md",
        ),
        createGovernanceDecisionRecord(
          "B",
          "program-lifecycle",
          "GO",
          "PROGRAM_006_VERIFICATION_REPORT.md",
        ),
      ]),
    /^Error: PGOV-DEC-003:/,
  );
  assert.throws(
    () =>
      createGovernanceDecisionRecord(
        "UNKNOWN",
        "unknown-subject" as never,
        "GO",
        "PROGRAM_006_VERIFICATION_REPORT.md",
      ),
    /^Error: PGOV-DEC-001:/,
  );
});

test("Decision Workflow rejects unknown decisions and non-normalized references", () => {
  assert.throws(
    () =>
      createGovernanceDecisionRecord(
        "LIFECYCLE",
        "program-lifecycle",
        "APPROVED" as never,
        "PROGRAM_006_VERIFICATION_REPORT.md",
      ),
    /^Error: PGOV-DEC-002:/,
  );
  assert.throws(
    () =>
      createGovernanceDecisionRecord(
        "LIFECYCLE",
        "program-lifecycle",
        "GO",
        " PROGRAM_006_VERIFICATION_REPORT.md",
      ),
    /^Error: PGOV-DEC-005:/,
  );
});
