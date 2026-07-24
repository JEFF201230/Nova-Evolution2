export type GovernanceDecisionSubject =
  | "program-lifecycle"
  | "mission-order-governance"
  | "campaign-governance"
  | "approval-workflow"
  | "closure-certification";

export type GovernanceDecisionValue =
  | "GO"
  | "REWORK"
  | "STOP"
  | "ESCALATE";

export interface GovernanceDecisionRecord {
  readonly id: string;
  readonly subject: GovernanceDecisionSubject;
  readonly decision: GovernanceDecisionValue;
  readonly rationaleReference: string;
}

export interface GovernanceDecisionWorkflowEvidence {
  readonly records: readonly GovernanceDecisionRecord[];
  readonly subjectCount: number;
  readonly requiredSubjectCount: number;
  readonly goSubjectCount: number;
  readonly ready: boolean;
}

const GOVERNANCE_DECISION_SUBJECTS: readonly GovernanceDecisionSubject[] =
  Object.freeze([
    "program-lifecycle",
    "mission-order-governance",
    "campaign-governance",
    "approval-workflow",
    "closure-certification",
  ]);

const GOVERNANCE_DECISION_VALUES: readonly GovernanceDecisionValue[] =
  Object.freeze([
    "GO",
    "REWORK",
    "STOP",
    "ESCALATE",
  ]);

export function createGovernanceDecisionRecord(
  id: string,
  subject: GovernanceDecisionSubject,
  decision: GovernanceDecisionValue,
  rationaleReference: string,
): GovernanceDecisionRecord {
  assertNormalizedReferenceValue(id, "PGOV-DEC-004");
  assertGovernanceDecisionSubject(subject);
  assertGovernanceDecisionValue(decision);
  assertNormalizedReferenceValue(rationaleReference, "PGOV-DEC-005");

  return Object.freeze({
    id,
    subject,
    decision,
    rationaleReference,
  });
}

export function verifyGovernanceDecisionWorkflow(
  records: readonly GovernanceDecisionRecord[],
): GovernanceDecisionWorkflowEvidence {
  assertGovernanceDecisionRecords(records);

  const orderedRecords = GOVERNANCE_DECISION_SUBJECTS
    .filter((subject) => records.some((record) => record.subject === subject))
    .map((subject) => {
      const record = records.find((candidate) => candidate.subject === subject);

      if (record === undefined) {
        throw new Error(
          "PGOV-DEC-006: Decision Workflow could not preserve deterministic subject ordering.",
        );
      }

      return createGovernanceDecisionRecord(
        record.id,
        record.subject,
        record.decision,
        record.rationaleReference,
      );
    });
  const goSubjectCount = orderedRecords
    .filter((record) => record.decision === "GO")
    .length;
  const requiredSubjectCount = GOVERNANCE_DECISION_SUBJECTS.length;
  const ready =
    orderedRecords.length === requiredSubjectCount &&
    goSubjectCount === requiredSubjectCount;

  return Object.freeze({
    records: Object.freeze(orderedRecords),
    subjectCount: orderedRecords.length,
    requiredSubjectCount,
    goSubjectCount,
    ready,
  });
}

function assertGovernanceDecisionRecords(
  records: readonly GovernanceDecisionRecord[],
): void {
  const seen = new Set<string>();

  for (const record of records) {
    createGovernanceDecisionRecord(
      record.id,
      record.subject,
      record.decision,
      record.rationaleReference,
    );

    if (seen.has(record.subject)) {
      throw new Error(
        "PGOV-DEC-003: Decision Workflow rejects duplicate decision subjects.",
      );
    }

    seen.add(record.subject);
  }
}

function assertGovernanceDecisionSubject(
  value: string,
): asserts value is GovernanceDecisionSubject {
  if (!GOVERNANCE_DECISION_SUBJECTS.includes(value as GovernanceDecisionSubject)) {
    throw new Error(
      "PGOV-DEC-001: Decision Workflow rejects unknown decision subjects.",
    );
  }
}

function assertGovernanceDecisionValue(
  value: string,
): asserts value is GovernanceDecisionValue {
  if (!GOVERNANCE_DECISION_VALUES.includes(value as GovernanceDecisionValue)) {
    throw new Error(
      "PGOV-DEC-002: Decision Workflow rejects unknown decision values.",
    );
  }
}

function assertNormalizedReferenceValue(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Decision Workflow rejects empty or non-normalized reference values.`,
    );
  }
}
