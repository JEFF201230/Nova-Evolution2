import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { EvidenceId, type BusinessEvidenceRecord } from "../evidence/index.js";
import { WorkCoreFailure, type WorkCoreAggregate, type WorkDecisions, type WorkDeliverables } from "../../runtime/work/work-core.js";
import type { WorkPeopleReadResult } from "../../runtime/work/work-people.types.js";
import {
  WorkAuthorizedStateComposer,
  type WorkAuthorizedStateReadSources,
} from "./work-authorized-state.composer.js";
import type { WorkActionsReadResult } from "./work-actions.types.js";
import type { WorkEvidenceReadResult } from "./work-evidence.types.js";
import type { WorkPlanningReadResult } from "./work-planning.types.js";

const WORK = Object.freeze({ projectId: "NOVA", workId: "WORK-001" });
const OBSERVED_AT = "2026-09-16T10:15:30.000Z";
const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);

const core: WorkCoreAggregate = Object.freeze({
  schemaVersion: "1.0.0",
  identity: Object.freeze({
    ...WORK,
    objective: "Compose authoritative Work reads.",
    mission: Object.freeze({ projectId: WORK.projectId, missionId: WORK.workId }),
    provenance: Object.freeze({
      sourceDomain: "MISSIONS",
      producer: "ORCHESTRATOR_RUNTIME",
      sourceId: "mission-source",
      observedAt: "2026-09-15T08:00:00.000Z",
    }),
  }),
  lifecycle: Object.freeze({
    current: "ACTIVE",
    observedAt: "2026-09-15T09:00:00.000Z",
    provenance: Object.freeze({
      sourceDomain: "MISSIONS",
      producer: "ORCHESTRATOR_RUNTIME",
      sourceId: "mission-source",
      observedAt: "2026-09-15T09:00:00.000Z",
    }),
  }),
  progression: Object.freeze({
    percentage: 50,
    observedAt: "2026-09-15T09:30:00.000Z",
    provenance: Object.freeze({
      sourceDomain: "MONITORING",
      producer: "ORCHESTRATOR_OBSERVABILITY",
      sourceId: "observation-7",
      observedAt: "2026-09-15T09:30:00.000Z",
      sequence: 7,
      correlationId: "correlation-7",
      runId: "run-1",
    }),
  }),
  timestamps: Object.freeze({
    createdAt: "2026-09-15T08:00:00.000Z",
    updatedAt: "2026-09-15T09:30:00.000Z",
  }),
});

const deliverables: WorkDeliverables = Object.freeze({
  ...WORK,
  missionId: WORK.workId,
  deliverables: Object.freeze([
    Object.freeze({ path: "z/report.md", size: 20, sha256: HASH_B, modifiedAt: "2026-09-15T11:00:00.000Z", runId: "run-1" }),
    Object.freeze({ path: "a/result.json", size: 10, sha256: HASH_A, modifiedAt: "2026-09-15T10:00:00.000Z", runId: "run-1" }),
  ]),
  provenance: Object.freeze({
    sourceDomain: "MISSIONS",
    producer: "ORCHESTRATOR_RUNTIME",
    sourceId: "report-1",
    observedAt: "2026-09-15T11:00:00.000Z",
    missionId: WORK.workId,
    reportId: "report-1",
    runId: "run-1",
    evidenceSource: "MissionReport.deliverableEvidence",
  }),
});

function decision(decisionId: string, value: "APPROVED" | "REJECTED", decidedAt: string) {
  return Object.freeze({
    decisionId,
    request: Object.freeze({
      requestId: `request-${decisionId}`,
      missionId: WORK.workId,
      runId: "run-1",
      requestedBy: "requester",
      requiredRole: "APPROVER",
      requestedAt: "2026-09-15T09:00:00.000Z",
      bundleFingerprint: `bundle-${decisionId}`,
      technicalDecision: "GO" as const,
    }),
    identity: Object.freeze({
      subjectId: "approver",
      roles: Object.freeze(["APPROVER"]),
      identityContextStatus: "IDENTITY_CONTEXT_VALIDATED" as const,
      productionAuthenticationStatus: "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH" as const,
    }),
    decision: value,
    justification: value === "APPROVED" ? null : "Authoritative disagreement.",
    decidedAt,
    bundleFingerprint: `bundle-${decisionId}`,
  });
}

const decisions: WorkDecisions = Object.freeze({
  ...WORK,
  decisions: Object.freeze([
    decision("decision-z", "REJECTED", "2026-09-15T13:00:00.000Z"),
    decision("decision-a", "APPROVED", "2026-09-15T12:00:00.000Z"),
  ]),
  provenance: Object.freeze({
    sourceDomain: "MISSIONS",
    producer: "HUMAN_APPROVAL_WORKFLOW",
    sourceId: "approval-history-1",
    observedAt: "2026-09-15T13:00:00.000Z",
    missionId: WORK.workId,
    runId: "run-1",
    historySource: "HumanApprovalWorkflow.history",
    persistenceSource: "IntegrationPersistedRecord",
    recordKind: "HUMAN_APPROVAL",
    workBindingSource: "WCF-001",
  }),
});

const people: WorkPeopleReadResult = Object.freeze({
  ...WORK,
  status: "PARTICIPANTS_AVAILABLE",
  participants: Object.freeze([
    Object.freeze({ businessPersonId: "person-z", workAssignmentId: "assignment-z" }),
    Object.freeze({ businessPersonId: "person-a", workAssignmentId: "assignment-a" }),
  ]),
  qualification: Object.freeze({
    sourceDomain: "PEOPLE",
    aggregateRevision: 3,
    lastEventSequence: 8,
    qualifiedAt: OBSERVED_AT,
    provenance: Object.freeze({
      authority: "PEOPLE_AUTHORITY",
      businessCause: "assignment-observed",
      effectiveAt: "2026-09-15T07:00:00.000Z",
    }),
  }),
});

const planning: WorkPlanningReadResult = Object.freeze({
  ...WORK,
  status: "PLANNING_WITHDRAWN",
  sourceDomain: "PLANNING",
  latestVersion: 4,
  revision: 5,
  provenance: Object.freeze({ authority: "PLANNING_AUTHORITY" }),
}) as unknown as WorkPlanningReadResult;

const actions: WorkActionsReadResult = Object.freeze({
  ...WORK,
  status: "ACTIONS_AVAILABLE",
  sourceDomain: "ACTIONS",
  actions: Object.freeze([
    Object.freeze({ actionId: "action-z", status: "COMPLETED", revision: 2, graphRevision: 1 }),
    Object.freeze({ actionId: "action-a", status: "PROPOSED", revision: 1, graphRevision: 0 }),
  ] as const),
});

function evidenceRecord(evidenceId: string, lifecycle: "WITHDRAWN" | "INVALIDATED"): BusinessEvidenceRecord {
  const id = EvidenceId.of(evidenceId);
  return Object.freeze({
    evidenceId: id,
    source: Object.freeze({
      authority: "ACTIONS_AUTHORITY",
      kind: "ACTIONS_ACTION_RESULT_RECORDED",
      projectIdentity: WORK.projectId,
      workIdentity: WORK.workId,
      actionId: `action-${evidenceId}`,
      actionsRevision: 1,
      resultId: `result-${evidenceId}`,
    }),
    provenance: Object.freeze({
      producer: "EVIDENCE_AUTHORITY",
      sourceAuthority: "ACTIONS_AUTHORITY",
      actor: "evidence-owner",
      occurredAt: "2026-09-14T10:00:00.000Z",
      registeredAt: "2026-09-14T10:01:00.000Z",
    }),
    lifecycle,
    certificationReference: Object.freeze({ authority: "CERTIFICATION", reference: `cert-${evidenceId}` }),
    history: Object.freeze([]),
  });
}

const invalidEvidence = evidenceRecord("evidence-z", "INVALIDATED");
const withdrawnEvidence = evidenceRecord("evidence-a", "WITHDRAWN");
const evidence: WorkEvidenceReadResult<{ certificationId: string }> = Object.freeze({
  ...WORK,
  status: "AVAILABLE",
  sourceDomain: "EVIDENCE",
  evidences: Object.freeze([
    Object.freeze({
      state: "EVIDENCE_FOUND",
      evidenceId: invalidEvidence.evidenceId.value,
      lifecycle: invalidEvidence.lifecycle,
      evidence: invalidEvidence,
      link: Object.freeze({ ...WORK, evidenceId: invalidEvidence.evidenceId.value, linkedAt: "2026-09-15T08:00:00.000Z", provenance: Object.freeze({ source: "WORK", actor: "owner", causalityId: "link-z" }) }),
      certification: Object.freeze({ state: "RESOLVED", value: Object.freeze({ certificationId: "cert-z" }) }),
    }),
    Object.freeze({
      state: "EVIDENCE_FOUND",
      evidenceId: withdrawnEvidence.evidenceId.value,
      lifecycle: withdrawnEvidence.lifecycle,
      evidence: withdrawnEvidence,
      link: Object.freeze({ ...WORK, evidenceId: withdrawnEvidence.evidenceId.value, linkedAt: "2026-09-15T07:00:00.000Z", provenance: Object.freeze({ source: "WORK", actor: "owner", causalityId: "link-a" }) }),
      certification: Object.freeze({ state: "AUTHORITY_UNAVAILABLE" }),
    }),
  ] as const),
});

type Certification = { certificationId: string };

function sources(
  overrides: Partial<WorkAuthorizedStateReadSources<Certification>> = {},
): WorkAuthorizedStateReadSources<Certification> {
  return {
    workCore: { load: () => core },
    deliverables: { get: () => deliverables },
    decisions: { get: async () => decisions },
    people: { get: () => people },
    planning: { get: () => planning },
    actions: { get: () => actions },
    evidence: { get: () => evidence },
    ...overrides,
  };
}

test("composes the seven authoritative reads for one canonical WorkReference with one observation instant", async () => {
  let clockReads = 0;
  let qualifiedAt: Date | undefined;
  let certificationRequested = false;
  const composer = new WorkAuthorizedStateComposer(sources({
    people: { get: (_work, at) => { qualifiedAt = at; return people; } },
    evidence: { get: (_work, options) => { certificationRequested = options?.includeCertification === true; return evidence; } },
  }), { now: () => { clockReads += 1; return new Date(OBSERVED_AT); } });

  const result = await composer.compose(WORK);

  assert.deepEqual(result.workReference, WORK);
  assert.equal(result.compositionObservedAt, OBSERVED_AT);
  assert.equal(clockReads, 1);
  assert.equal(qualifiedAt?.toISOString(), OBSERVED_AT);
  assert.equal(certificationRequested, true);
  assert.deepEqual(Object.keys(result), [
    "workReference", "compositionObservedAt", "workCore", "deliverables",
    "decisions", "people", "planning", "actions", "evidence",
  ]);
  for (const contribution of Object.values(result).slice(2)) {
    assert.equal((contribution as { availability: string }).availability, "AVAILABLE");
  }
});

test("equivalent reads are deterministic and every collection has stable identifier ordering", async () => {
  const composer = new WorkAuthorizedStateComposer(sources(), { now: () => new Date(OBSERVED_AT) });
  const first = await composer.compose(WORK);
  const second = await composer.compose(WORK);

  assert.deepEqual(first, second);
  assert.deepEqual(first.deliverables.availability === "AVAILABLE" ? first.deliverables.value.deliverables.map((item) => item.path) : [], ["a/result.json", "z/report.md"]);
  assert.deepEqual(first.decisions.availability === "AVAILABLE" ? first.decisions.value.decisions.map((item) => item.decisionId) : [], ["decision-a", "decision-z"]);
  assert.deepEqual(first.people.availability === "AVAILABLE" && first.people.value.status === "PARTICIPANTS_AVAILABLE" ? first.people.value.participants.map((item) => item.businessPersonId) : [], ["person-a", "person-z"]);
  assert.deepEqual(first.actions.availability === "AVAILABLE" && first.actions.value.status === "ACTIONS_AVAILABLE" ? first.actions.value.actions.map((item) => item.actionId) : [], ["action-a", "action-z"]);
  assert.deepEqual(first.evidence.availability === "AVAILABLE" && first.evidence.value.status === "AVAILABLE" ? first.evidence.value.evidences.map((item) => item.evidenceId) : [], ["evidence-a", "evidence-z"]);
  assert.deepEqual(deliverables.deliverables.map((item) => item.path), ["z/report.md", "a/result.json"]);
  assert.deepEqual(actions.status === "ACTIONS_AVAILABLE" ? actions.actions.map((item) => item.actionId) : [], ["action-z", "action-a"]);
});

test("stable ordering is ordinal and independent of the host locale", async () => {
  const localeSensitiveActions: WorkActionsReadResult = Object.freeze({
    ...WORK,
    status: "ACTIONS_AVAILABLE",
    sourceDomain: "ACTIONS",
    actions: Object.freeze([
      Object.freeze({ actionId: "action-a", status: "PROPOSED", revision: 1, graphRevision: 0 }),
      Object.freeze({ actionId: "action-Z", status: "COMPLETED", revision: 2, graphRevision: 1 }),
    ] as const),
  });
  const result = await new WorkAuthorizedStateComposer(sources({
    actions: { get: () => localeSensitiveActions },
  }), { now: () => new Date(OBSERVED_AT) }).compose(WORK);

  assert.deepEqual(
    result.actions.availability === "AVAILABLE"
      && result.actions.value.status === "ACTIONS_AVAILABLE"
      ? result.actions.value.actions.map((item) => item.actionId)
      : [],
    ["action-Z", "action-a"],
  );
});

test("preserves available-empty, optional absence, unavailable, and not-found as distinct states", async () => {
  const absentPeople: WorkPeopleReadResult = Object.freeze({ ...WORK, status: "WORK_PEOPLE_ABSENT", sourceDomain: "PEOPLE" });
  const absentPlanning: WorkPlanningReadResult = Object.freeze({ ...WORK, status: "PLANNING_ABSENT", sourceDomain: "PLANNING" });
  const emptyActions: WorkActionsReadResult = Object.freeze({ ...WORK, status: "ACTIONS_AVAILABLE_EMPTY", sourceDomain: "ACTIONS", actions: Object.freeze([] as []) });
  const unavailableEvidence: WorkEvidenceReadResult<Certification> = Object.freeze({ ...WORK, status: "UNAVAILABLE", sourceDomain: "EVIDENCE", reason: "EVIDENCE_AUTHORITY_UNAVAILABLE" });
  const emptyDeliverables = Object.freeze({ ...deliverables, deliverables: Object.freeze([]) });
  const emptyDecisions = Object.freeze({ ...decisions, decisions: Object.freeze([]) });
  const result = await new WorkAuthorizedStateComposer(sources({
    deliverables: { get: () => emptyDeliverables },
    decisions: { get: async () => emptyDecisions },
    people: { get: () => absentPeople },
    planning: { get: () => absentPlanning },
    actions: { get: () => emptyActions },
    evidence: { get: () => unavailableEvidence },
  }), { now: () => new Date(OBSERVED_AT) }).compose(WORK);

  assert.equal(result.deliverables.availability, "AVAILABLE_EMPTY");
  assert.equal(result.decisions.availability, "AVAILABLE_EMPTY");
  assert.equal(result.people.availability, "AVAILABLE_EMPTY");
  assert.equal(result.planning.availability, "AVAILABLE_EMPTY");
  assert.equal(result.actions.availability, "AVAILABLE_EMPTY");
  assert.equal(result.evidence.availability, "UNAVAILABLE");
  assert.notEqual(result.actions.availability, result.evidence.availability);
  assert.equal(result.people.availability === "AVAILABLE_EMPTY" ? result.people.value.status : "", "WORK_PEOPLE_ABSENT");
});

test("qualifies a missing Work without inventing empty Work-owned contributions", async () => {
  const missing = (): never => { throw new WorkCoreFailure("WCF-ERR-001", "missing"); };
  const result = await new WorkAuthorizedStateComposer(sources({
    workCore: { load: missing },
    deliverables: { get: missing },
    decisions: { get: async () => missing() },
  }), { now: () => new Date(OBSERVED_AT) }).compose(WORK);

  assert.deepEqual(result.workCore, { availability: "NOT_FOUND", reason: "WORK_NOT_FOUND" });
  assert.deepEqual(result.deliverables, { availability: "NOT_FOUND", reason: "WORK_DELIVERABLES_NOT_FOUND" });
  assert.deepEqual(result.decisions, { availability: "NOT_FOUND", reason: "WORK_DECISIONS_NOT_FOUND" });
});

test("keeps withdrawn and invalid Evidence, certification states, provenance, and source dates observable", async () => {
  const result = await new WorkAuthorizedStateComposer(sources(), { now: () => new Date(OBSERVED_AT) }).compose(WORK);
  assert.equal(result.evidence.availability, "AVAILABLE");
  if (result.evidence.availability !== "AVAILABLE" || result.evidence.value.status !== "AVAILABLE") return;
  const [withdrawn, invalid] = result.evidence.value.evidences;
  assert.equal(withdrawn.state, "EVIDENCE_FOUND");
  assert.equal(invalid.state, "EVIDENCE_FOUND");
  if (withdrawn.state !== "EVIDENCE_FOUND" || invalid.state !== "EVIDENCE_FOUND") return;
  assert.equal(withdrawn.lifecycle, "WITHDRAWN");
  assert.equal(invalid.lifecycle, "INVALIDATED");
  assert.strictEqual(withdrawn.evidence.provenance, withdrawnEvidence.provenance);
  assert.equal(withdrawn.evidence.provenance.occurredAt, "2026-09-14T10:00:00.000Z");
  assert.equal(withdrawn.certification?.state, "AUTHORITY_UNAVAILABLE");
  assert.equal(invalid.certification?.state, "RESOLVED");
});

test("preserves contradictory authoritative decisions instead of selecting a winner", async () => {
  const result = await new WorkAuthorizedStateComposer(sources(), { now: () => new Date(OBSERVED_AT) }).compose(WORK);
  assert.equal(result.decisions.availability, "AVAILABLE");
  if (result.decisions.availability !== "AVAILABLE") return;
  assert.deepEqual(result.decisions.value.decisions.map((item) => item.decision).sort(), ["APPROVED", "REJECTED"]);
  assert.strictEqual(result.decisions.value.provenance, decisions.provenance);
  assert.equal(result.workCore.availability === "AVAILABLE" ? result.workCore.value.identity.provenance.observedAt : null, "2026-09-15T08:00:00.000Z");
});

test("reads do not mutate contributors or invoke any writer", async () => {
  let writes = 0;
  const mutableSentinel = { reads: 0 };
  const readSources = sources({
    workCore: { load: () => { mutableSentinel.reads += 1; return core; } },
  }) as WorkAuthorizedStateReadSources<Certification> & { write?: () => void };
  readSources.write = () => { writes += 1; };
  const before = JSON.stringify({ deliverables, decisions, people, actions, evidence });

  const composer = new WorkAuthorizedStateComposer(readSources, { now: () => new Date(OBSERVED_AT) });
  await composer.compose(WORK);

  assert.equal(mutableSentinel.reads, 1);
  assert.equal(writes, 0);
  assert.equal(JSON.stringify({ deliverables, decisions, people, actions, evidence }), before);
  assert.deepEqual(Object.keys(composer).sort(), ["clock", "sources"]);
});

test("a failed producer remains unavailable and does not become an invented empty collection", async () => {
  const fail = (): never => { throw new Error("producer unavailable"); };
  const result = await new WorkAuthorizedStateComposer(sources({
    people: { get: fail },
    planning: { get: fail },
    actions: { get: fail },
    evidence: { get: fail },
  }), { now: () => new Date(OBSERVED_AT) }).compose(WORK);

  assert.equal(result.people.availability, "UNAVAILABLE");
  assert.equal(result.planning.availability, "UNAVAILABLE");
  assert.equal(result.actions.availability, "UNAVAILABLE");
  assert.equal(result.evidence.availability, "UNAVAILABLE");
  for (const contribution of [result.people, result.planning, result.actions, result.evidence]) {
    assert.equal("value" in contribution, false);
  }
});

test("rejects a non-canonical WorkReference before reading any producer", async () => {
  let reads = 0;
  const failIfRead = (): never => { reads += 1; throw new Error("must not read"); };
  const composer = new WorkAuthorizedStateComposer(sources({
    workCore: { load: failIfRead },
  }), { now: () => new Date(OBSERVED_AT) });
  await assert.rejects(() => composer.compose({ projectId: " NOVA", workId: WORK.workId }), TypeError);
  assert.equal(reads, 0);
});

test("production composer contains no persistence, CEREBRAU, Intelligence, synthesis, or confidence dependency", () => {
  const implementation = readFileSync(new URL("./work-authorized-state.composer.ts", import.meta.url), "utf8");
  const imports = implementation.split("\n").filter((line) => line.startsWith("import") || line.startsWith("} from"));
  assert.equal(/cerebrau/i.test(imports.join("\n")), false);
  assert.equal(/repository|journal|persistence|writeFile|createWriteStream/.test(imports.join("\n")), false);
  assert.equal(/intelligence|recommendation|synthesis|confidence/i.test(imports.join("\n")), false);
});
