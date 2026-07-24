export type GovernanceApprovalAuthority =
  | "program-board"
  | "program-delivery-squad"
  | "certification-cell";

export type GovernanceApprovalSubject =
  | "program-activation"
  | "mission-order-issue"
  | "campaign-open"
  | "program-closure";

export type GovernanceApprovalDecision =
  | "APPROVED"
  | "REJECTED"
  | "DEFERRED"
  | "ESCALATED";

export interface GovernanceApprovalRecord {
  readonly id: string;
  readonly authority: GovernanceApprovalAuthority;
  readonly subject: GovernanceApprovalSubject;
  readonly decision: GovernanceApprovalDecision;
  readonly evidenceReference: string;
}

export interface GovernanceApprovalWorkflowEvidence {
  readonly records: readonly GovernanceApprovalRecord[];
  readonly subjectCount: number;
  readonly requiredSubjectCount: number;
  readonly approvedSubjectCount: number;
  readonly ready: boolean;
}

const GOVERNANCE_APPROVAL_AUTHORITIES: readonly GovernanceApprovalAuthority[] =
  Object.freeze([
    "program-board",
    "program-delivery-squad",
    "certification-cell",
  ]);

const GOVERNANCE_APPROVAL_SUBJECTS: readonly GovernanceApprovalSubject[] =
  Object.freeze([
    "program-activation",
    "mission-order-issue",
    "campaign-open",
    "program-closure",
  ]);

const GOVERNANCE_APPROVAL_DECISIONS: readonly GovernanceApprovalDecision[] =
  Object.freeze([
    "APPROVED",
    "REJECTED",
    "DEFERRED",
    "ESCALATED",
  ]);

const GOVERNANCE_APPROVAL_SUBJECT_AUTHORITIES: Readonly<
  Record<GovernanceApprovalSubject, GovernanceApprovalAuthority>
> = Object.freeze({
  "program-activation": "program-board",
  "mission-order-issue": "program-board",
  "campaign-open": "program-delivery-squad",
  "program-closure": "program-board",
});

export function createGovernanceApprovalRecord(
  id: string,
  authority: GovernanceApprovalAuthority,
  subject: GovernanceApprovalSubject,
  decision: GovernanceApprovalDecision,
  evidenceReference: string,
): GovernanceApprovalRecord {
  assertNormalizedReferenceValue(id, "PGOV-APPR-006");
  assertGovernanceApprovalAuthority(authority);
  assertGovernanceApprovalSubject(subject);
  assertGovernanceApprovalDecision(decision);
  assertNormalizedReferenceValue(evidenceReference, "PGOV-APPR-007");

  return Object.freeze({
    id,
    authority,
    subject,
    decision,
    evidenceReference,
  });
}

export function verifyGovernanceApprovalWorkflow(
  records: readonly GovernanceApprovalRecord[],
): GovernanceApprovalWorkflowEvidence {
  assertGovernanceApprovalRecords(records);

  const orderedRecords = GOVERNANCE_APPROVAL_SUBJECTS
    .filter((subject) => records.some((record) => record.subject === subject))
    .map((subject) => {
      const record = records.find((candidate) => candidate.subject === subject);

      if (record === undefined) {
        throw new Error(
          "PGOV-APPR-005: Approval Workflow could not preserve deterministic subject ordering.",
        );
      }

      return createGovernanceApprovalRecord(
        record.id,
        record.authority,
        record.subject,
        record.decision,
        record.evidenceReference,
      );
    });
  const approvedSubjectCount = orderedRecords
    .filter((record) => record.decision === "APPROVED")
    .length;
  const requiredSubjectCount = GOVERNANCE_APPROVAL_SUBJECTS.length;
  const ready =
    orderedRecords.length === requiredSubjectCount &&
    approvedSubjectCount === requiredSubjectCount;

  return Object.freeze({
    records: Object.freeze(orderedRecords),
    subjectCount: orderedRecords.length,
    requiredSubjectCount,
    approvedSubjectCount,
    ready,
  });
}

function assertGovernanceApprovalRecords(
  records: readonly GovernanceApprovalRecord[],
): void {
  const seen = new Set<string>();

  for (const record of records) {
    createGovernanceApprovalRecord(
      record.id,
      record.authority,
      record.subject,
      record.decision,
      record.evidenceReference,
    );

    if (record.authority !== GOVERNANCE_APPROVAL_SUBJECT_AUTHORITIES[record.subject]) {
      throw new Error(
        "PGOV-APPR-004: Approval Workflow rejects approvals from an unauthorized authority.",
      );
    }

    if (seen.has(record.subject)) {
      throw new Error(
        "PGOV-APPR-003: Approval Workflow rejects duplicate approval subjects.",
      );
    }

    seen.add(record.subject);
  }
}

function assertGovernanceApprovalAuthority(
  value: string,
): asserts value is GovernanceApprovalAuthority {
  if (!GOVERNANCE_APPROVAL_AUTHORITIES.includes(value as GovernanceApprovalAuthority)) {
    throw new Error(
      "PGOV-APPR-001: Approval Workflow rejects unknown approval authorities.",
    );
  }
}

function assertGovernanceApprovalSubject(
  value: string,
): asserts value is GovernanceApprovalSubject {
  if (!GOVERNANCE_APPROVAL_SUBJECTS.includes(value as GovernanceApprovalSubject)) {
    throw new Error(
      "PGOV-APPR-002: Approval Workflow rejects unknown approval subjects.",
    );
  }
}

function assertGovernanceApprovalDecision(
  value: string,
): asserts value is GovernanceApprovalDecision {
  if (!GOVERNANCE_APPROVAL_DECISIONS.includes(value as GovernanceApprovalDecision)) {
    throw new Error(
      "PGOV-APPR-008: Approval Workflow rejects unknown approval decisions.",
    );
  }
}

function assertNormalizedReferenceValue(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Approval Workflow rejects empty or non-normalized reference values.`,
    );
  }
}
