import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  ActionId, ActionProvenance, ActionPurpose, ActionReference, ActionResult,
  ActionsAuthority, ActionsInternalAccess, ActionsInternalQueries, CommandId, ResultId, WorkReference,
  type QualifiedAction, type ActionsDomainEvent,
} from "../actions/index.js";
import { BUSINESS_CERTIFICATION_AUTHORITY } from "../business-certification/index.js";
import {
  ActionsResultRecordedSourceResolver, EvidenceAuthority, EvidenceCertificationResolver,
  EvidenceDomainError, EvidenceId, EvidenceInternalQueries, FileEvidenceRepositoryJournal,
  type AdmissibleSourceReference, type EvidenceErrorCode, type EvidenceRepositoryJournal,
} from "./index.js";

const instant = (minute: number): Date => new Date(`2026-09-15T10:${String(minute).padStart(2, "0")}:00.000Z`);
const admission = Object.freeze({ workExists: (_reference: WorkReference): boolean => true });

function actionsFixture(actionId = "action-source", resultId = "result-source") {
  const access = ActionsInternalAccess.inMemory(admission);
  const work = WorkReference.of("project-evidence", "work-evidence");
  const reference = ActionReference.of(work, ActionId.of(actionId));
  const provenance = ActionProvenance.of("NOVA_ACTIONS_BUSINESS", "EVIDENCE_TEST_BUSINESS_SOURCE", "real occurrence", instant(1), "AUTHORITATIVE_BUSINESS_SOURCE");
  access.commands.execute({ type: "ProposeAction", commandId: CommandId.of(`propose-${actionId}`), causalityId: `propose-${actionId}`,
    expectedRevision: 0, provenance, actionReference: reference,
    purpose: ActionPurpose.of("Produce the authoritative business result.", "CONTRIBUTES_TO_WORK_OBJECTIVE") });
  access.commands.execute({ type: "RecordResult", commandId: CommandId.of(`record-${actionId}`), causalityId: `record-${actionId}`,
    expectedRevision: 1, provenance, actionReference: reference,
    result: ActionResult.record(ResultId.of(resultId), `SENSITIVE ACTIONS PAYLOAD ${actionId}`, null, provenance) });
  const source: AdmissibleSourceReference = Object.freeze({ authority: "ACTIONS_AUTHORITY", kind: "ACTIONS_ACTION_RESULT_RECORDED",
    projectIdentity: work.projectIdentity, workIdentity: work.workIdentity, actionId, actionsRevision: 2, resultId });
  return { access, source };
}

class MemoryJournal implements EvidenceRepositoryJournal {
  private evidenceEvents: ReturnType<EvidenceRepositoryJournal["read"]> = [];
  read() { return this.evidenceEvents; }
  append(events: Parameters<EvidenceRepositoryJournal["append"]>[0]) { this.evidenceEvents = Object.freeze([...this.evidenceEvents, ...events]); }
}

function authorityFor(access: ActionsInternalAccess, journal: EvidenceRepositoryJournal = new MemoryJournal()) {
  return new EvidenceAuthority(new ActionsResultRecordedSourceResolver(access.queries), journal, () => instant(2));
}

function register(authority: EvidenceAuthority, source: AdmissibleSourceReference, key = `register-${source.actionId}`) {
  return authority.register({ source, actor: "evidence-operator", idempotencyIdentity: key });
}

function expectCode(code: EvidenceErrorCode, operation: () => unknown): void {
  assert.throws(operation, (error: unknown) => error instanceof EvidenceDomainError && error.code === code);
}

test("real ACTIONS ResultRecorded is resolved by its exact four-part occurrence identity without payload copy", () => {
  const fixture = actionsFixture();
  const record = register(authorityFor(fixture.access), fixture.source);
  assert.deepEqual(record.source, fixture.source);
  assert.notEqual(record.source, fixture.source);
  assert.equal(Object.isFrozen(record.source), true);
  assert.equal(record.provenance.occurredAt, instant(1).toISOString());
  assert.equal(record.provenance.registeredAt, instant(2).toISOString());
  assert.equal(record.lifecycle, "ACTIVE");
  assert.equal(JSON.stringify(record).includes("SENSITIVE ACTIONS PAYLOAD"), false);
  assert.deepEqual(Object.keys(record.source).sort(), ["actionId", "actionsRevision", "authority", "kind", "projectIdentity", "resultId", "workIdentity"]);
});

test("registration is permanently idempotent and divergent reuse conflicts without mutation", () => {
  const fixture = actionsFixture(); const journal = new MemoryJournal(); const authority = authorityFor(fixture.access, journal);
  const first = register(authority, fixture.source, "stable-key");
  const replay = register(authority, fixture.source, "stable-key");
  const sameOccurrenceReplay = register(authority, fixture.source, "another-key");
  assert.equal(replay.evidenceId.value, first.evidenceId.value);
  assert.equal(sameOccurrenceReplay.evidenceId.value, first.evidenceId.value);
  assert.equal(replay.history.length, 1);
  expectCode("EVIDENCE_REGISTRATION_CONFLICT", () => authority.register({ source: fixture.source, actor: "different-actor", idempotencyIdentity: "stable-key" }));
  assert.equal(journal.read().length, 1);
});

test("source allow-list denies every source kind other than ACTIONS_ACTION_RESULT_RECORDED", () => {
  const fixture = actionsFixture();
  expectCode("EVIDENCE_SOURCE_NOT_ALLOWED", () => register(authorityFor(fixture.access), { ...fixture.source, kind: "RUNTIME_EVIDENCE" } as unknown as AdmissibleSourceReference));
});

test("missing, ambiguous and unavailable ACTIONS history fail with distinct explicit codes", () => {
  const fixture = actionsFixture();
  expectCode("EVIDENCE_SOURCE_NOT_FOUND", () => register(authorityFor(ActionsInternalAccess.inMemory(admission)), fixture.source));
  const history = fixture.access.queries.getActionHistory(ActionReference.of(WorkReference.of(fixture.source.projectIdentity, fixture.source.workIdentity), ActionId.of(fixture.source.actionId)));
  assert.ok(history);
  const resolvedHistory = history;
  class AmbiguousQueries extends ActionsInternalQueries {
    constructor() { super(new ActionsAuthority(admission)); }
    override getActionHistory(): QualifiedAction<readonly ActionsDomainEvent[]> { return Object.freeze({ ...resolvedHistory, value: Object.freeze([...resolvedHistory.value, ...resolvedHistory.value.filter((event) => event.type === "ResultRecorded")]) }); }
  }
  class UnavailableQueries extends ActionsInternalQueries {
    constructor() { super(new ActionsAuthority(admission)); }
    override getActionHistory(): null { throw new Error("ACTIONS offline"); }
  }
  expectCode("EVIDENCE_SOURCE_AMBIGUOUS", () => register(new EvidenceAuthority(new ActionsResultRecordedSourceResolver(new AmbiguousQueries()), new MemoryJournal()), fixture.source));
  expectCode("EVIDENCE_SOURCE_AUTHORITY_UNAVAILABLE", () => register(new EvidenceAuthority(new ActionsResultRecordedSourceResolver(new UnavailableQueries()), new MemoryJournal()), fixture.source));
});

test("durable journal recovers stable identity, immutable reference and lifecycle after restart with no source payload", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-evidence-")); const path = join(directory, "business-evidence.json");
  try {
    const fixture = actionsFixture();
    const first = register(authorityFor(fixture.access, new FileEvidenceRepositoryJournal(path)), fixture.source);
    authorityFor(fixture.access, new FileEvidenceRepositoryJournal(path)).withdraw({ evidenceId: first.evidenceId, actor: "evidence-operator", at: instant(3), reason: "owner correction", idempotencyIdentity: "withdraw-1" });
    const recovered = authorityFor(fixture.access, new FileEvidenceRepositoryJournal(path)).readAll().get(first.evidenceId.value);
    assert.equal(recovered?.evidenceId.value, first.evidenceId.value);
    assert.deepEqual(recovered?.source, first.source);
    assert.equal(recovered?.lifecycle, "WITHDRAWN");
    assert.deepEqual(recovered?.history.map((event) => event.type), ["BusinessEvidenceRegistered", "BusinessEvidenceWithdrawn"]);
    const stored = await readFile(path, "utf8");
    assert.equal(stored.includes("SENSITIVE ACTIONS PAYLOAD"), false);
    assert.equal(stored.includes("outcome"), false);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("withdrawal, invalidation and supersession are durable terminal transitions", () => {
  const journal = new MemoryJournal();
  const a = actionsFixture("action-a", "result-a"), b = actionsFixture("action-b", "result-b"), c = actionsFixture("action-c", "result-c"), d = actionsFixture("action-d", "result-d");
  const authorities = [a, b, c, d].map((item) => authorityFor(item.access, journal));
  const records = authorities.map((authority, index) => register(authority, [a, b, c, d][index]!.source));
  authorities[0]!.withdraw({ evidenceId: records[0]!.evidenceId, actor: "owner", at: instant(3), reason: "withdrawn", idempotencyIdentity: "withdraw" });
  authorities[1]!.invalidate({ evidenceId: records[1]!.evidenceId, actor: "owner", at: instant(4), reason: "invalid", idempotencyIdentity: "invalidate" });
  authorities[2]!.supersede({ evidenceId: records[2]!.evidenceId, supersededBy: records[3]!.evidenceId, actor: "owner", at: instant(5), reason: "new occurrence", idempotencyIdentity: "supersede" });
  const recovered = authorityFor(a.access, journal).readAll();
  assert.deepEqual(records.slice(0, 3).map((record) => recovered.get(record.evidenceId.value)?.lifecycle), ["WITHDRAWN", "INVALIDATED", "SUPERSEDED"]);
  expectCode("EVIDENCE_TERMINAL", () => authorities[0]!.invalidate({ evidenceId: records[0]!.evidenceId, actor: "owner", at: instant(6), reason: "rewrite", idempotencyIdentity: "rewrite" }));
});

test("internal queries preserve order, are read-only, and distinguish absence, invalidity and unavailability", () => {
  const fixture = actionsFixture(); const journal = new MemoryJournal(); const authority = authorityFor(fixture.access, journal);
  const record = register(authority, fixture.source);
  authority.invalidate({ evidenceId: record.evidenceId, actor: "owner", at: instant(3), reason: "invalid", idempotencyIdentity: "invalid-query" });
  const queries = new EvidenceInternalQueries(authority); const absent = EvidenceId.of("evidence_absent");
  const before = journal.read().length; const result = queries.byOrderedEvidenceIds([absent, record.evidenceId]);
  assert.deepEqual(result.map((item) => item.state), ["ABSENT", "FOUND"]);
  assert.equal(result[1]?.state === "FOUND" && result[1].evidence.lifecycle, "INVALIDATED");
  assert.equal(journal.read().length, before);
  const unavailable = new EvidenceInternalQueries(authorityFor(fixture.access, { read() { throw new Error("offline"); }, append() {} }));
  assert.equal(unavailable.byEvidenceId(record.evidenceId).state, "AUTHORITY_UNAVAILABLE");
});

test("Certification is resolved live from its owner with absent/unavailable/resolved states and no status copy", () => {
  const fixture = actionsFixture();
  let expectedEvidenceId = "not-registered";
  const authority = new EvidenceAuthority(
    new ActionsResultRecordedSourceResolver(fixture.access.queries),
    new MemoryJournal(),
    () => instant(2),
    { resolveReference: (reference) => Object.freeze({
      status: "FOUND",
      snapshot: Object.freeze({
        certificationId: reference.reference as never,
        authority: BUSINESS_CERTIFICATION_AUTHORITY,
        subject: Object.freeze({ kind: "BUSINESS_EVIDENCE", evidenceId: expectedEvidenceId as never }),
        criteriaReference: "criteria/business-evidence/v1",
        decision: "CERTIFIED",
        currentState: "CERTIFIED",
        decidedAt: instant(2).toISOString(),
        provenance: Object.freeze({ actor: "certifier", authority: "BUSINESS_REVIEW", causationIdentity: "assessment-1" }),
      }),
    }) },
  );
  const absent = register(authority, fixture.source);
  expectedEvidenceId = absent.evidenceId.value;
  assert.equal(new EvidenceCertificationResolver().resolve(absent).state, "REFERENCE_ABSENT");
  const attached = authority.attachCertification({ evidenceId: absent.evidenceId, actor: "owner", at: instant(3), idempotencyIdentity: "attach-cert",
    reference: { authority: BUSINESS_CERTIFICATION_AUTHORITY, reference: "cert-42" } });
  assert.equal(new EvidenceCertificationResolver().resolve(attached).state, "AUTHORITY_UNAVAILABLE");
  const owner = { resolve: () => Object.freeze({ status: "CURRENT_OWNER_VALUE" }) };
  assert.deepEqual(new EvidenceCertificationResolver(owner).resolve(attached), { state: "RESOLVED", value: { status: "CURRENT_OWNER_VALUE" } });
  assert.equal(JSON.stringify(attached).includes("CURRENT_OWNER_VALUE"), false);
});

test("journal detects rewritten history and Evidence production remains isolated from Runtime and CEREBRAU", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-evidence-integrity-")); const path = join(directory, "business-evidence.json");
  try {
    const fixture = actionsFixture(); register(authorityFor(fixture.access, new FileEvidenceRepositoryJournal(path)), fixture.source);
    const raw = await readFile(path, "utf8"); await writeFile(path, raw.replace("evidence-operator", "rewritten-operator"), "utf8");
    expectCode("EVIDENCE_JOURNAL_CORRUPT", () => new FileEvidenceRepositoryJournal(path).read());
    const truncated = JSON.parse(raw) as { entries: unknown[] };
    truncated.entries.pop();
    await writeFile(path, JSON.stringify(truncated), "utf8");
    expectCode("EVIDENCE_JOURNAL_CORRUPT", () => new FileEvidenceRepositoryJournal(path).read());
    const implementation = await Promise.all(["evidence-authority.ts", "evidence-journal.ts", "actions-source-resolver.ts"].map((file) => readFile(join(import.meta.dirname, file), "utf8")));
    const productSource = implementation.join("\n");
    assert.equal((productSource.match(/export class EvidenceAuthority/g) ?? []).length, 1);
    assert.equal((productSource.match(/implements EvidenceRepositoryJournal/g) ?? []).length, 1);
    assert.equal(productSource.includes("IntegrationRuntimeRepository"), false);
    assert.equal(productSource.includes("MissionEvidenceCertifier"), false);
    assert.equal(productSource.toLowerCase().includes("cerebrau"), false);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
