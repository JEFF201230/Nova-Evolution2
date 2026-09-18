import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { BUSINESS_CERTIFICATION_AUTHORITY } from "../business-certification/index.js";
import {
  EvidenceAuthority,
  EvidenceCertificationResolver,
  EvidenceId,
  EvidenceInternalQueries,
  sourceKey,
  type AdmissibleSourceReference,
  type EvidenceDomainEvent,
  type EvidenceRepositoryJournal,
} from "../evidence/index.js";
import {
  FileWorkEvidenceLinkJournal,
  WorkEvidenceLinkError,
  WorkEvidenceLinks,
  WorkEvidenceQuery,
  type LinkWorkEvidence,
  type WorkEvidenceLinkEvent,
  type WorkEvidenceLinkJournal,
  type WorkEvidenceReference,
} from "./index.js";

const WORK = Object.freeze({ projectId: "NOVA", workId: "WORK-EVIDENCE-001" });
const OTHER_WORK = Object.freeze({ projectId: "NOVA", workId: "WORK-EVIDENCE-002" });
const LINK_PROVENANCE = Object.freeze({ source: "WORK_ASSOCIATION_DECISION", actor: "work-owner", causalityId: "cause-link" });

class MemoryEvidenceJournal implements EvidenceRepositoryJournal {
  readonly events: EvidenceDomainEvent[] = [];
  read(): readonly EvidenceDomainEvent[] { return Object.freeze([...this.events]); }
  append(events: readonly EvidenceDomainEvent[]): void { this.events.push(...events); }
}

class MemoryLinkJournal implements WorkEvidenceLinkJournal {
  readonly events: WorkEvidenceLinkEvent[] = [];
  read(): readonly WorkEvidenceLinkEvent[] { return Object.freeze([...this.events]); }
  append(events: readonly WorkEvidenceLinkEvent[]): void { this.events.push(...events); }
}

function evidenceBoundary() {
  const journal = new MemoryEvidenceJournal();
  const authority = new EvidenceAuthority({
    resolve: () => Object.freeze({ occurredAt: new Date("2026-09-15T08:00:00.000Z"), ownerProvidedFingerprint: "owner-fingerprint" }),
  }, journal, () => new Date("2026-09-15T09:00:00.000Z"), {
    resolveReference: (reference) => {
      const suffix = reference.reference.replace(/^certificate-/, "");
      const subjectSource: AdmissibleSourceReference = Object.freeze({
        authority: "ACTIONS_AUTHORITY",
        kind: "ACTIONS_ACTION_RESULT_RECORDED",
        projectIdentity: "NOVA",
        workIdentity: "SOURCE-WORK",
        actionId: `action-${suffix}`,
        actionsRevision: 1,
        resultId: `result-${suffix}`,
      });
      return Object.freeze({
        status: "FOUND",
        snapshot: Object.freeze({
          certificationId: reference.reference as never,
          authority: BUSINESS_CERTIFICATION_AUTHORITY,
          subject: Object.freeze({ kind: "BUSINESS_EVIDENCE", evidenceId: EvidenceId.fromSourceKey(sourceKey(subjectSource)).value as never }),
          criteriaReference: "criteria/work-evidence-test/v1",
          decision: "CERTIFIED",
          currentState: "CERTIFIED",
          decidedAt: "2026-09-15T08:30:00.000Z",
          provenance: Object.freeze({ actor: "certifier", authority: "BUSINESS_REVIEW", causationIdentity: "work-evidence-test" }),
        }),
      });
    },
  });
  return { journal, authority, queries: new EvidenceInternalQueries(authority) };
}

function register(authority: EvidenceAuthority, suffix: string, certified = false) {
  const source: AdmissibleSourceReference = Object.freeze({
    authority: "ACTIONS_AUTHORITY",
    kind: "ACTIONS_ACTION_RESULT_RECORDED",
    projectIdentity: "NOVA",
    workIdentity: "SOURCE-WORK",
    actionId: `action-${suffix}`,
    actionsRevision: 1,
    resultId: `result-${suffix}`,
  });
  return authority.register({
    source,
    actor: "evidence-owner",
    idempotencyIdentity: `register-${suffix}`,
    ...(certified ? { certificationReference: { authority: BUSINESS_CERTIFICATION_AUTHORITY, reference: `certificate-${suffix}` } } : {}),
  });
}

function linkCommand(work: WorkEvidenceReference, evidenceId: EvidenceId, suffix = evidenceId.value): LinkWorkEvidence {
  return Object.freeze({
    work,
    evidenceId,
    provenance: LINK_PROVENANCE,
    linkedAt: new Date("2026-09-15T10:00:00.000Z"),
    idempotencyIdentity: `link-${work.workId}-${suffix}`,
  });
}

test("association identity is the unique (projectId, workId, EvidenceId) tuple and duplicate creation is idempotent", () => {
  const journal = new MemoryLinkJournal();
  const links = new WorkEvidenceLinks(journal);
  const evidenceId = EvidenceId.of("evidence-unique");

  const first = links.link(linkCommand(WORK, evidenceId, "first"));
  const duplicate = links.link({ ...linkCommand(WORK, evidenceId, "second"), provenance: { ...LINK_PROVENANCE, causalityId: "ignored-duplicate" } });

  assert.deepEqual(duplicate, first);
  assert.equal(journal.events.length, 1);
  assert.deepEqual(Object.keys(first), ["projectId", "workId", "evidenceId", "provenance", "linkedAt"]);
  assert.throws(
    () => links.link({ ...linkCommand(OTHER_WORK, evidenceId, "other"), idempotencyIdentity: "link-WORK-EVIDENCE-001-first" }),
    (error: unknown) => error instanceof WorkEvidenceLinkError && error.code === "WORK_EVIDENCE_LINK_CONFLICT",
  );
});

test("unlink removes only the Work association and never deletes or mutates Evidence", () => {
  const evidence = evidenceBoundary();
  const record = register(evidence.authority, "unlink");
  const links = new WorkEvidenceLinks(new MemoryLinkJournal());
  links.link(linkCommand(WORK, record.evidenceId));
  const before = evidence.journal.events.length;

  assert.equal(links.unlink({
    work: WORK,
    evidenceId: record.evidenceId,
    provenance: { ...LINK_PROVENANCE, causalityId: "cause-unlink" },
    unlinkedAt: new Date("2026-09-15T11:00:00.000Z"),
    idempotencyIdentity: "unlink-once",
  }), true);
  assert.equal(links.listByWork(WORK).length, 0);
  assert.equal(evidence.queries.byEvidenceId(record.evidenceId).state, "FOUND");
  assert.equal(evidence.journal.events.length, before);
});

test("zero linked Evidence is AVAILABLE_EMPTY only while the Evidence authority is available", () => {
  const evidence = evidenceBoundary();
  const links = new WorkEvidenceLinks(new MemoryLinkJournal());
  const empty = new WorkEvidenceQuery(links, evidence.queries).get(WORK);
  const unavailable = new WorkEvidenceQuery(links, {
    byEvidenceId: () => ({ state: "AUTHORITY_UNAVAILABLE", cause: new Error("offline") }),
    byOrderedEvidenceIds: () => { throw new Error("must not be called"); },
  }).get(WORK);

  assert.deepEqual(empty, { ...WORK, status: "AVAILABLE_EMPTY", sourceDomain: "EVIDENCE", evidences: [] });
  assert.deepEqual(unavailable, { ...WORK, status: "UNAVAILABLE", sourceDomain: "EVIDENCE", reason: "EVIDENCE_AUTHORITY_UNAVAILABLE" });
});

test("one and many associations resolve canonical Evidence transiently without a Work copy", () => {
  const evidence = evidenceBoundary();
  const alpha = register(evidence.authority, "alpha");
  const beta = register(evidence.authority, "beta");
  const links = new WorkEvidenceLinks(new MemoryLinkJournal());
  links.link(linkCommand(WORK, beta.evidenceId));
  let result = new WorkEvidenceQuery(links, evidence.queries).get(WORK);
  assert.equal(result.status, "AVAILABLE");
  assert.equal(result.status === "AVAILABLE" ? result.evidences.length : 0, 1);

  links.link(linkCommand(WORK, alpha.evidenceId));
  const canonicalById = new Map<string, ReturnType<EvidenceInternalQueries["byEvidenceId"]>>();
  result = new WorkEvidenceQuery(links, {
    byEvidenceId: evidence.queries.byEvidenceId.bind(evidence.queries),
    byOrderedEvidenceIds: (ids) => ids.map((id) => {
      const canonical = evidence.queries.byEvidenceId(id);
      canonicalById.set(id.value, canonical);
      return canonical;
    }),
  }).get(WORK);
  assert.equal(result.status, "AVAILABLE");
  if (result.status === "AVAILABLE") {
    assert.deepEqual(result.evidences.map((item) => item.evidenceId), [alpha.evidenceId.value, beta.evidenceId.value].sort());
    const byId = new Map(result.evidences.map((item) => [item.evidenceId, item]));
    const alphaItem = byId.get(alpha.evidenceId.value);
    const betaItem = byId.get(beta.evidenceId.value);
    const canonicalAlpha = canonicalById.get(alpha.evidenceId.value);
    const canonicalBeta = canonicalById.get(beta.evidenceId.value);
    assert.strictEqual(alphaItem?.state === "EVIDENCE_FOUND" ? alphaItem.evidence : undefined, canonicalAlpha?.state === "FOUND" ? canonicalAlpha.evidence : undefined);
    assert.strictEqual(betaItem?.state === "EVIDENCE_FOUND" ? betaItem.evidence : undefined, canonicalBeta?.state === "FOUND" ? canonicalBeta.evidence : undefined);
  }
});

test("many-to-many links are allowed while each tuple remains unique", () => {
  const evidence = evidenceBoundary();
  const shared = register(evidence.authority, "shared");
  const second = register(evidence.authority, "second");
  const links = new WorkEvidenceLinks(new MemoryLinkJournal());
  links.link(linkCommand(WORK, shared.evidenceId));
  links.link(linkCommand(WORK, second.evidenceId));
  links.link(linkCommand(OTHER_WORK, shared.evidenceId));

  assert.deepEqual(links.listByWork(WORK).map((link) => link.evidenceId), [second.evidenceId.value, shared.evidenceId.value].sort());
  assert.deepEqual(links.listByWork(OTHER_WORK).map((link) => link.evidenceId), [shared.evidenceId.value]);
});

test("unknown Evidence remains distinct from Evidence authority unavailability", () => {
  const evidence = evidenceBoundary();
  const unknown = EvidenceId.of("evidence-does-not-exist");
  const links = new WorkEvidenceLinks(new MemoryLinkJournal());
  links.link(linkCommand(WORK, unknown));

  const result = new WorkEvidenceQuery(links, evidence.queries).get(WORK);
  assert.equal(result.status, "AVAILABLE");
  if (result.status === "AVAILABLE") assert.deepEqual(result.evidences[0], {
    state: "EVIDENCE_UNKNOWN",
    link: links.listByWork(WORK)[0],
    evidenceId: unknown.value,
  });

  const unavailable = new WorkEvidenceQuery(links, {
    byEvidenceId: evidence.queries.byEvidenceId.bind(evidence.queries),
    byOrderedEvidenceIds: () => [{ state: "AUTHORITY_UNAVAILABLE", cause: new Error("offline") }],
  }).get(WORK);
  assert.equal(unavailable.status, "UNAVAILABLE");
});

test("withdrawn and invalidated lifecycle is interpreted live from Evidence", () => {
  const evidence = evidenceBoundary();
  const withdrawn = register(evidence.authority, "withdrawn");
  const invalidated = register(evidence.authority, "invalidated");
  const links = new WorkEvidenceLinks(new MemoryLinkJournal());
  links.link(linkCommand(WORK, withdrawn.evidenceId));
  links.link(linkCommand(WORK, invalidated.evidenceId));
  evidence.authority.withdraw({ evidenceId: withdrawn.evidenceId, actor: "evidence-owner", at: new Date("2026-09-15T12:00:00.000Z"), reason: "withdrawn by owner", idempotencyIdentity: "withdraw-owner" });
  evidence.authority.invalidate({ evidenceId: invalidated.evidenceId, actor: "evidence-owner", at: new Date("2026-09-15T12:01:00.000Z"), reason: "invalidated by owner", idempotencyIdentity: "invalidate-owner" });

  const result = new WorkEvidenceQuery(links, evidence.queries).get(WORK);
  assert.equal(result.status, "AVAILABLE");
  if (result.status === "AVAILABLE") {
    const states = Object.fromEntries(result.evidences.map((item) => [item.evidenceId, item.state === "EVIDENCE_FOUND" ? item.lifecycle : item.state]));
    assert.equal(states[withdrawn.evidenceId.value], "WITHDRAWN");
    assert.equal(states[invalidated.evidenceId.value], "INVALIDATED");
  }
});

test("Certification is resolved by its owner and owner unavailability remains explicit", () => {
  const evidence = evidenceBoundary();
  const certified = register(evidence.authority, "certified", true);
  const links = new WorkEvidenceLinks(new MemoryLinkJournal());
  links.link(linkCommand(WORK, certified.evidenceId));
  const owner = new EvidenceCertificationResolver({ resolve: (reference) => Object.freeze({ reference: reference.reference, status: "VALID" }) });

  const resolved = new WorkEvidenceQuery(links, evidence.queries, owner).get(WORK, { includeCertification: true });
  const unavailable = new WorkEvidenceQuery(links, evidence.queries).get(WORK, { includeCertification: true });
  assert.equal(resolved.status === "AVAILABLE" && resolved.evidences[0]?.state === "EVIDENCE_FOUND" ? resolved.evidences[0].certification?.state : undefined, "RESOLVED");
  assert.equal(unavailable.status === "AVAILABLE" && unavailable.evidences[0]?.state === "EVIDENCE_FOUND" ? unavailable.evidences[0].certification?.state : undefined, "AUTHORITY_UNAVAILABLE");
});

test("durable recovery preserves link identity/provenance and stores no Evidence payload or competing truth", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-work-evidence-"));
  const path = join(directory, "work-evidence-links.json");
  try {
    const evidence = evidenceBoundary();
    const record = register(evidence.authority, "durable", true);
    const writer = new WorkEvidenceLinks(new FileWorkEvidenceLinkJournal(path));
    const expected = writer.link(linkCommand(WORK, record.evidenceId));
    const persisted = await readFile(path, "utf8");
    const recovered = new WorkEvidenceLinks(new FileWorkEvidenceLinkJournal(path));

    assert.deepEqual(recovered.listByWork(WORK), [expected]);
    for (const forbidden of ["lifecycle", "certificationReference", "history", "ownerProvidedFingerprint", "resultId", "actionsRevision"]) {
      assert.equal(persisted.includes(forbidden), false);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("Work Evidence query is read-only over both link and Evidence persistence", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-work-evidence-readonly-"));
  const path = join(directory, "work-evidence-links.json");
  try {
    const evidence = evidenceBoundary();
    const record = register(evidence.authority, "readonly");
    const links = new WorkEvidenceLinks(new FileWorkEvidenceLinkJournal(path));
    links.link(linkCommand(WORK, record.evidenceId));
    const linkBefore = await readFile(path, "utf8");
    const evidenceBefore = JSON.stringify(evidence.journal.events);
    const query = new WorkEvidenceQuery(links, evidence.queries);

    const first = query.get(WORK);
    const second = query.get(WORK);

    assert.deepEqual(second, first);
    assert.equal(await readFile(path, "utf8"), linkBefore);
    assert.equal(JSON.stringify(evidence.journal.events), evidenceBefore);
    assert.deepEqual(Object.keys(query), ["links", "evidence", "certification"]);
    assert.equal("authority" in query, false);
    assert.equal("commands" in query, false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
