import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  BUSINESS_CERTIFICATION_AUTHORITY,
  BusinessCertificationAuthority,
  BusinessCertificationJournal,
  BusinessCertificationQueries,
  type BusinessCertificationSnapshot,
} from "../business-certification/index.js";
import {
  EvidenceAuthority,
  EvidenceDomainError,
  EvidenceId,
  sourceKey,
  type AdmissibleSourceReference,
  type BusinessCertificationReferenceQueries,
  type EvidenceDomainEvent,
  type EvidenceErrorCode,
  type EvidenceRepositoryJournal,
} from "./index.js";

const NOW = new Date("2026-09-17T12:00:00.000Z");
const PROVENANCE = Object.freeze({
  actor: "business-certifier",
  authority: "NOVA_BUSINESS_REVIEW_BOARD",
  causationIdentity: "rt12-proof",
});

class MemoryEvidenceJournal implements EvidenceRepositoryJournal {
  readonly events: EvidenceDomainEvent[] = [];
  read(): readonly EvidenceDomainEvent[] { return Object.freeze([...this.events]); }
  append(events: readonly EvidenceDomainEvent[]): void { this.events.push(...events); }
}

function source(suffix: string): AdmissibleSourceReference {
  return Object.freeze({
    authority: "ACTIONS_AUTHORITY",
    kind: "ACTIONS_ACTION_RESULT_RECORDED",
    projectIdentity: "NOVA",
    workIdentity: "RT12",
    actionId: `action-${suffix}`,
    actionsRevision: 1,
    resultId: `result-${suffix}`,
  });
}

function evidenceAuthority(
  journal: EvidenceRepositoryJournal,
  certificationQueries?: BusinessCertificationReferenceQueries,
): EvidenceAuthority {
  return new EvidenceAuthority(
    { resolve: (value) => Object.freeze({ source: value, occurredAt: new Date("2026-09-17T11:00:00.000Z") }) },
    journal,
    () => NOW,
    certificationQueries,
  );
}

function register(authority: EvidenceAuthority, value: AdmissibleSourceReference, suffix: string) {
  return authority.register({ source: value, actor: "evidence-owner", idempotencyIdentity: `register-${suffix}` });
}

function attach(authority: EvidenceAuthority, evidenceId: EvidenceId, reference: string, suffix: string) {
  return authority.attachCertification({
    evidenceId,
    actor: "evidence-owner",
    at: NOW,
    idempotencyIdentity: `attach-${suffix}`,
    reference: { authority: BUSINESS_CERTIFICATION_AUTHORITY, reference },
  });
}

function expectCode(code: EvidenceErrorCode, operation: () => unknown): void {
  assert.throws(operation, (error: unknown) => error instanceof EvidenceDomainError && error.code === code);
}

function owner(path: string, identities: readonly string[], existingEvidenceIds: ReadonlySet<string>) {
  let index = 0;
  return new BusinessCertificationAuthority({
    journal: new BusinessCertificationJournal(path),
    evidenceIdentities: {
      resolveEvidenceIdentity: (evidenceId) => existingEvidenceIds.has(evidenceId)
        ? Object.freeze({ status: "FOUND" as const, evidenceId })
        : Object.freeze({ status: "NOT_FOUND" as const }),
    },
    idGenerator: { nextCertificationId: () => identities[index++] ?? "unexpected-certification-id" },
    clock: { now: () => new Date("2026-09-17T11:30:00.000Z") },
  });
}

function decide(authority: BusinessCertificationAuthority, commandId: string, evidenceId: string) {
  return authority.recordDecision({
    commandId,
    evidenceId,
    criteriaReference: "criteria/business-evidence/v1",
    decision: "CERTIFIED",
    provenance: PROVENANCE,
  });
}

function coherentSnapshot(evidenceId: string, certificationId = "cert-valid"): BusinessCertificationSnapshot {
  return Object.freeze({
    certificationId: certificationId as BusinessCertificationSnapshot["certificationId"],
    authority: BUSINESS_CERTIFICATION_AUTHORITY,
    subject: Object.freeze({ kind: "BUSINESS_EVIDENCE", evidenceId: evidenceId as never }),
    criteriaReference: "criteria/business-evidence/v1",
    decision: "CERTIFIED",
    currentState: "CERTIFIED",
    decidedAt: "2026-09-17T11:30:00.000Z",
    provenance: PROVENANCE,
  });
}

test("RT-12 rejects arbitrary, case-variant, padded, prefixed and suffixed authorities before owner lookup", () => {
  const journal = new MemoryEvidenceJournal();
  let lookups = 0;
  const authority = evidenceAuthority(journal, {
    resolveReference: () => { lookups += 1; return Object.freeze({ status: "NOT_FOUND" }); },
  });
  const record = register(authority, source("authority"), "authority");
  const values = [
    "ARBITRARY_NON_EMPTY_AUTHORITY",
    "business_certification_authority",
    ` ${BUSINESS_CERTIFICATION_AUTHORITY}`,
    `${BUSINESS_CERTIFICATION_AUTHORITY} `,
    `prefix-${BUSINESS_CERTIFICATION_AUTHORITY}`,
    `${BUSINESS_CERTIFICATION_AUTHORITY}-suffix`,
  ];
  for (const [index, value] of values.entries()) {
    expectCode("EVIDENCE_CERTIFICATION_UNRECOGNIZED_AUTHORITY", () => authority.attachCertification({
      evidenceId: record.evidenceId,
      actor: "evidence-owner",
      at: NOW,
      idempotencyIdentity: `bad-authority-${index}`,
      reference: { authority: value, reference: "arbitrary-id" },
    }));
  }
  assert.equal(lookups, 0);
  assert.equal(journal.events.length, 1);
});

test("RT-12 accepts only an owner-issued FOUND certification for the exact Evidence and copies no certification state", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-rt12-valid-"));
  const path = join(directory, "business-certifications.jsonl");
  try {
    const journal = new MemoryEvidenceJournal();
    const value = source("valid");
    const evidenceId = EvidenceId.fromSourceKey(sourceKey(value));
    const certificationOwner = owner(path, ["owner-issued-certification"], new Set([evidenceId.value]));
    const issued = decide(certificationOwner, "issue-valid", evidenceId.value);
    const queries = new BusinessCertificationQueries(new BusinessCertificationJournal(path));
    const certificationBefore = await readFile(path, "utf8");
    const authority = evidenceAuthority(journal, queries);

    const admitted = authority.register({
      source: value,
      actor: "evidence-owner",
      idempotencyIdentity: "register-valid",
      certificationReference: { authority: BUSINESS_CERTIFICATION_AUTHORITY, reference: issued.certificationId },
    });
    const replay = authority.register({
      source: value,
      actor: "evidence-owner",
      idempotencyIdentity: "register-valid",
      certificationReference: { authority: BUSINESS_CERTIFICATION_AUTHORITY, reference: issued.certificationId },
    });

    assert.equal(replay.evidenceId.value, admitted.evidenceId.value);
    assert.deepEqual(admitted.certificationReference, {
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      reference: "owner-issued-certification",
    });
    assert.equal(journal.events.length, 1);
    assert.equal(await readFile(path, "utf8"), certificationBefore);
    const serializedEvidence = JSON.stringify(journal.events);
    for (const forbidden of ["currentState", "criteriaReference", "decidedAt", "NOVA_BUSINESS_REVIEW_BOARD"]) {
      assert.equal(serializedEvidence.includes(forbidden), false);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("RT-12 rejects arbitrary and absent CertificationIds with no Evidence write", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-rt12-not-found-"));
  const path = join(directory, "business-certifications.jsonl");
  try {
    const journal = new MemoryEvidenceJournal();
    const authority = evidenceAuthority(journal, new BusinessCertificationQueries(new BusinessCertificationJournal(path)));
    const record = register(authority, source("not-found"), "not-found");
    for (const [index, reference] of ["arbitrary-id-shaped-text", "owner-issued-but-absent"].entries()) {
      expectCode("EVIDENCE_CERTIFICATION_NOT_FOUND", () => attach(authority, record.evidenceId, reference, `not-found-${index}`));
    }
    assert.equal(journal.events.length, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("RT-12 rejects a certification issued for another Evidence", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-rt12-subject-"));
  const path = join(directory, "business-certifications.jsonl");
  try {
    const journal = new MemoryEvidenceJournal();
    const targetSource = source("target");
    const otherSource = source("other");
    const targetId = EvidenceId.fromSourceKey(sourceKey(targetSource));
    const otherId = EvidenceId.fromSourceKey(sourceKey(otherSource));
    const certificationOwner = owner(path, ["cert-other"], new Set([targetId.value, otherId.value]));
    decide(certificationOwner, "issue-other", otherId.value);
    const authority = evidenceAuthority(journal, new BusinessCertificationQueries(new BusinessCertificationJournal(path)));
    const target = register(authority, targetSource, "target");

    expectCode("EVIDENCE_CERTIFICATION_SUBJECT_MISMATCH", () => attach(authority, target.evidenceId, "cert-other", "other-subject"));
    assert.equal(journal.events.length, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("RT-12 rejects WITHDRAWN and INVALIDATED certifications", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-rt12-terminal-"));
  const path = join(directory, "business-certifications.jsonl");
  try {
    const journal = new MemoryEvidenceJournal();
    const value = source("terminal");
    const evidenceId = EvidenceId.fromSourceKey(sourceKey(value));
    const certificationOwner = owner(path, ["cert-withdrawn", "cert-invalidated"], new Set([evidenceId.value]));
    decide(certificationOwner, "issue-withdrawn", evidenceId.value);
    certificationOwner.withdraw({ commandId: "withdraw", certificationId: "cert-withdrawn", provenance: PROVENANCE });
    decide(certificationOwner, "issue-invalidated", evidenceId.value);
    certificationOwner.invalidate({ commandId: "invalidate", certificationId: "cert-invalidated", provenance: PROVENANCE });
    const authority = evidenceAuthority(journal, new BusinessCertificationQueries(new BusinessCertificationJournal(path)));
    const record = register(authority, value, "terminal");

    expectCode("EVIDENCE_CERTIFICATION_STATE_NOT_ADMISSIBLE", () => attach(authority, record.evidenceId, "cert-withdrawn", "withdrawn"));
    expectCode("EVIDENCE_CERTIFICATION_STATE_NOT_ADMISSIBLE", () => attach(authority, record.evidenceId, "cert-invalidated", "invalidated"));
    assert.equal(journal.events.length, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("RT-12 treats absent, throwing and explicitly unavailable authorities as unavailable with no append", () => {
  const cases: Array<BusinessCertificationReferenceQueries | undefined> = [
    undefined,
    { resolveReference: () => { throw new Error("offline"); } },
    { resolveReference: () => Object.freeze({ status: "AUTHORITY_UNAVAILABLE" }) },
  ];
  for (const [index, queries] of cases.entries()) {
    const journal = new MemoryEvidenceJournal();
    const authority = evidenceAuthority(journal, queries);
    const record = register(authority, source(`unavailable-${index}`), `unavailable-${index}`);
    expectCode("EVIDENCE_CERTIFICATION_AUTHORITY_UNAVAILABLE", () => attach(authority, record.evidenceId, "cert-id", `unavailable-${index}`));
    assert.equal(journal.events.length, 1);
  }
});

test("RT-12 rejects malformed FOUND responses, wrong subject kind and inconsistent identities", () => {
  const cases: Array<Readonly<{ resolution: unknown; code: EvidenceErrorCode }>> = [
    { resolution: { status: "FOUND", snapshot: { certificationId: "cert-valid" } }, code: "EVIDENCE_CERTIFICATION_RESOLUTION_INCONSISTENT" },
    { resolution: { status: "FOUND", snapshot: { ...coherentSnapshot("evidence-placeholder"), authority: "OTHER" } }, code: "EVIDENCE_CERTIFICATION_RESOLUTION_INCONSISTENT" },
    { resolution: { status: "FOUND", snapshot: { ...coherentSnapshot("evidence-placeholder"), certificationId: "different-id" } }, code: "EVIDENCE_CERTIFICATION_RESOLUTION_INCONSISTENT" },
    { resolution: { status: "FOUND", snapshot: { ...coherentSnapshot("evidence-placeholder"), subject: { kind: "WORK", evidenceId: "evidence-placeholder" } } }, code: "EVIDENCE_CERTIFICATION_SUBJECT_MISMATCH" },
    { resolution: { status: "SURPRISING_SUCCESS" }, code: "EVIDENCE_CERTIFICATION_RESOLUTION_INCONSISTENT" },
  ];
  for (const [index, testCase] of cases.entries()) {
    const journal = new MemoryEvidenceJournal();
    const value = source(`inconsistent-${index}`);
    const expectedId = EvidenceId.fromSourceKey(sourceKey(value));
    const adjusted = index === 3
      ? { status: "FOUND", snapshot: { ...coherentSnapshot(expectedId.value), subject: { kind: "WORK", evidenceId: expectedId.value } } }
      : testCase.resolution;
    const authority = evidenceAuthority(journal, { resolveReference: () => adjusted as never });
    const record = register(authority, value, `inconsistent-${index}`);
    expectCode(testCase.code, () => attach(authority, record.evidenceId, "cert-valid", `inconsistent-${index}`));
    assert.equal(journal.events.length, 1);
  }
});

test("RT-12 read resolution is deterministic and never appends to either owner", () => {
  const journal = new MemoryEvidenceJournal();
  const value = source("deterministic");
  const expectedId = EvidenceId.fromSourceKey(sourceKey(value));
  let calls = 0;
  const queries: BusinessCertificationReferenceQueries = {
    resolveReference: () => {
      calls += 1;
      return Object.freeze({ status: "FOUND", snapshot: coherentSnapshot(expectedId.value) });
    },
  };
  const authority = evidenceAuthority(journal, queries);
  const record = register(authority, value, "deterministic");
  const first = attach(authority, record.evidenceId, "cert-valid", "deterministic");
  const beforeReplay = journal.events.length;
  const replay = attach(authority, record.evidenceId, "cert-valid", "deterministic");

  assert.deepEqual(replay.certificationReference, first.certificationReference);
  assert.equal(journal.events.length, beforeReplay);
  assert.equal(calls, 1);
});
