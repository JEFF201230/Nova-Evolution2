import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  BUSINESS_CERTIFICATION_AUTHORITY,
  BusinessCertificationAuthority,
  BusinessCertificationError,
  BusinessCertificationJournal,
  BusinessCertificationJournalError,
  BusinessCertificationQueries,
  type BusinessCertificationProvenance,
  type EvidenceIdentityReader,
} from "./index.js";
import { project } from "./business-certification-authority.js";

const EVIDENCE: EvidenceIdentityReader = {
  resolveEvidenceIdentity: (evidenceId) => ({ status: "FOUND", evidenceId }),
};

const PROVENANCE: BusinessCertificationProvenance = Object.freeze({
  actor: "business-reviewer-1",
  authority: "NOVA_BUSINESS_REVIEW_BOARD",
  causationIdentity: "assessment-2026-09-17",
});

async function fixture(run: (path: string) => Promise<void> | void): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "nova-business-certification-"));
  await run(join(directory, "certifications.jsonl"));
}

function authority(
  path: string,
  identities: string[],
  evidenceIdentities: EvidenceIdentityReader = EVIDENCE,
  times = ["2026-09-17T08:00:00.000Z", "2026-09-17T09:00:00.000Z", "2026-09-17T10:00:00.000Z"],
): BusinessCertificationAuthority {
  let identityIndex = 0;
  let timeIndex = 0;
  return new BusinessCertificationAuthority({
    journal: new BusinessCertificationJournal(path),
    evidenceIdentities,
    idGenerator: { nextCertificationId: () => identities[identityIndex++] ?? "unexpected-id" },
    clock: { now: () => new Date(times[timeIndex++] ?? "2026-09-17T11:00:00.000Z") },
  });
}

function decision(commandId: string, evidenceId = "evidence-1", value: "CERTIFIED" | "REJECTED" = "CERTIFIED") {
  return {
    commandId,
    evidenceId,
    criteriaReference: "criteria/business-value/v1",
    decision: value,
    provenance: PROVENANCE,
  } as const;
}

function transition(commandId: string, certificationId: string) {
  return { commandId, certificationId, provenance: PROVENANCE } as const;
}

function expectDomainCode(code: BusinessCertificationError["code"], operation: () => unknown): void {
  assert.throws(operation, (error: unknown) => error instanceof BusinessCertificationError && error.code === code);
}

test("authority construction and every query are read-only and create no default certification", async () => {
  await fixture(async (path) => {
    const directory = join(path, "..");
    const owner = authority(path, ["unused"]);
    const queries = new BusinessCertificationQueries(new BusinessCertificationJournal(path));
    assert.deepEqual(await readdir(directory), []);
    assert.deepEqual(queries.resolveReference({ authority: "ARBITRARY_AUTHORITY", reference: "anything" }), {
      status: "UNRECOGNIZED_AUTHORITY",
    });
    assert.deepEqual(queries.resolveReference({ authority: BUSINESS_CERTIFICATION_AUTHORITY, reference: "missing" }), {
      status: "NOT_FOUND",
    });
    assert.deepEqual(await readdir(directory), []);
    assert.equal(owner.authority, BUSINESS_CERTIFICATION_AUTHORITY);
  });
});

test("authority recognition is exact, case-sensitive and never inferred from arbitrary text", async () => {
  await fixture(async (path) => {
    const queries = new BusinessCertificationQueries(new BusinessCertificationJournal(path));
    assert.deepEqual(queries.resolveReference({
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      reference: "unknown-owner-issued-id",
    }), { status: "NOT_FOUND" });
    for (const authorityValue of [
      "business_certification_authority",
      ` ${BUSINESS_CERTIFICATION_AUTHORITY}`,
      `${BUSINESS_CERTIFICATION_AUTHORITY} `,
      `${BUSINESS_CERTIFICATION_AUTHORITY}_PREFIX_MATCH`,
      `contains-${BUSINESS_CERTIFICATION_AUTHORITY}-substring`,
      "SOME_NON_EMPTY_AUTHORITY",
    ]) {
      assert.deepEqual(queries.resolveReference({ authority: authorityValue, reference: "unknown-owner-issued-id" }), {
        status: "UNRECOGNIZED_AUTHORITY",
      });
    }
    assert.deepEqual(await readdir(join(path, "..")), []);
  });
});

test("only the authority allocates an opaque identity after exact Evidence verification", async () => {
  await fixture(async (path) => {
    const lookedUp: string[] = [];
    const owner = authority(path, ["opaque-owner-issued-id"], {
      resolveEvidenceIdentity(evidenceId) {
        lookedUp.push(evidenceId);
        return { status: "FOUND", evidenceId };
      },
    });
    const snapshot = owner.recordDecision(decision("record-1"));
    assert.deepEqual(lookedUp, ["evidence-1"]);
    assert.deepEqual(snapshot, {
      certificationId: "opaque-owner-issued-id",
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      subject: { kind: "BUSINESS_EVIDENCE", evidenceId: "evidence-1" },
      criteriaReference: "criteria/business-value/v1",
      decision: "CERTIFIED",
      currentState: "CERTIFIED",
      decidedAt: "2026-09-17T08:00:00.000Z",
      provenance: PROVENANCE,
    });
    const result = new BusinessCertificationQueries(new BusinessCertificationJournal(path)).resolveReference({
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      reference: "opaque-owner-issued-id",
    });
    assert.deepEqual(result, { status: "FOUND", snapshot });
  });
});

test("Evidence absence, unavailability, exceptions and inconsistent identities fail closed without an append", async () => {
  await fixture(async (path) => {
    const cases: Array<[EvidenceIdentityReader, BusinessCertificationError["code"]]> = [
      [{ resolveEvidenceIdentity: () => ({ status: "NOT_FOUND" }) }, "EVIDENCE_NOT_FOUND"],
      [{ resolveEvidenceIdentity: () => ({ status: "UNAVAILABLE" }) }, "EVIDENCE_AUTHORITY_UNAVAILABLE"],
      [{ resolveEvidenceIdentity: () => { throw new Error("offline"); } }, "EVIDENCE_AUTHORITY_UNAVAILABLE"],
      [{ resolveEvidenceIdentity: () => ({ status: "FOUND", evidenceId: "another-evidence" }) }, "EVIDENCE_RESPONSE_INCONSISTENT"],
    ];
    for (let index = 0; index < cases.length; index += 1) {
      const [reader, code] = cases[index]!;
      expectDomainCode(code, () => authority(path, [`id-${index}`], reader).recordDecision(decision(`failed-${index}`)));
      assert.deepEqual(await readdir(join(path, "..")), []);
    }
  });
});

test("decision recording uses only the read-only Evidence identity operation", async () => {
  await fixture(async (path) => {
    let reads = 0;
    let writes = 0;
    const evidencePort = {
      resolveEvidenceIdentity(evidenceId: string) {
        reads += 1;
        return { status: "FOUND" as const, evidenceId };
      },
      writeEvidence() {
        writes += 1;
      },
    };
    authority(path, ["read-boundary-id"], evidencePort).recordDecision(decision("read-boundary-command"));
    assert.equal(reads, 1);
    assert.equal(writes, 0);
  });
});

test("commands and provenance reject structurally unadmitted fields without mutation", async () => {
  await fixture(async (path) => {
    const owner = authority(path, ["must-not-be-issued"]);
    assert.throws(() => owner.recordDecision({
      ...decision("extra-command-field"),
      copiedEvidencePayload: { forbidden: true },
    } as never), TypeError);
    assert.throws(() => owner.recordDecision({
      ...decision("extra-provenance-field"),
      provenance: { ...PROVENANCE, officialStatus: "CERTIFIED" },
    } as never), TypeError);
    assert.deepEqual(await readdir(join(path, "..")), []);
  });
});

test("restart recovery preserves identity and exact replay is idempotent before consulting Evidence", async () => {
  await fixture(async (path) => {
    const command = decision("durable-record");
    const first = authority(path, ["durable-id"]).recordDecision(command);
    const before = await readFile(path, "utf8");
    const unavailable: EvidenceIdentityReader = { resolveEvidenceIdentity: () => ({ status: "UNAVAILABLE" }) };
    const recovered = authority(path, ["must-not-be-used"], unavailable).recordDecision(command);
    assert.deepEqual(recovered, first);
    assert.equal(await readFile(path, "utf8"), before);
    expectDomainCode("COMMAND_ID_CONFLICT", () => authority(path, ["unused"], unavailable).recordDecision({
      ...command,
      criteriaReference: "criteria/divergent/v2",
    }));
    assert.equal(await readFile(path, "utf8"), before);
  });
});

test("CERTIFIED, REJECTED, WITHDRAWN and INVALIDATED resolve as current owner state", async () => {
  await fixture(async (path) => {
    const owner = authority(path, ["certified-id", "rejected-id"]);
    owner.recordDecision(decision("record-certified", "evidence-certified", "CERTIFIED"));
    owner.recordDecision(decision("record-rejected", "evidence-rejected", "REJECTED"));
    const queries = new BusinessCertificationQueries(new BusinessCertificationJournal(path));
    const resolve = (reference: string) => queries.resolveReference({ authority: BUSINESS_CERTIFICATION_AUTHORITY, reference });
    assert.equal(resolve("certified-id").status === "FOUND" && resolve("certified-id").snapshot.currentState, "CERTIFIED");
    assert.equal(resolve("rejected-id").status === "FOUND" && resolve("rejected-id").snapshot.currentState, "REJECTED");
    owner.withdraw(transition("withdraw-certified", "certified-id"));
    owner.invalidate(transition("invalidate-rejected", "rejected-id"));
    const withdrawn = resolve("certified-id");
    const invalidated = resolve("rejected-id");
    assert.equal(withdrawn.status === "FOUND" && withdrawn.snapshot.currentState, "WITHDRAWN");
    assert.equal(invalidated.status === "FOUND" && invalidated.snapshot.currentState, "INVALIDATED");
    assert.equal(withdrawn.status === "FOUND" && withdrawn.snapshot.decision, "CERTIFIED");
    assert.equal(invalidated.status === "FOUND" && invalidated.snapshot.decision, "REJECTED");
  });
});

test("a CERTIFIED decision may be invalidated while its original decision remains immutable", async () => {
  await fixture(async (path) => {
    const owner = authority(path, ["certified-invalidated-id"]);
    const original = owner.recordDecision(decision("certified-before-invalidation"));
    const invalidated = owner.invalidate(transition("invalidate-certified", original.certificationId));
    assert.equal(invalidated.decision, "CERTIFIED");
    assert.equal(invalidated.currentState, "INVALIDATED");
    const events = new BusinessCertificationJournal(path).read((journalEvents) => journalEvents);
    assert.deepEqual(events.map((event) => event.type), ["DECISION_RECORDED", "STATE_CHANGED"]);
  });
});

test("lifecycle idempotency rejects divergent reuse and survives restart", async () => {
  await fixture(async (path) => {
    const firstOwner = authority(path, ["lifecycle-id"]);
    firstOwner.recordDecision(decision("lifecycle-record"));
    const command = transition("lifecycle-withdraw", "lifecycle-id");
    const first = firstOwner.withdraw(command);
    const before = await readFile(path, "utf8");
    const recoveredOwner = authority(path, ["unused-after-restart"]);
    assert.deepEqual(recoveredOwner.withdraw(command), first);
    assert.equal(await readFile(path, "utf8"), before);
    expectDomainCode("COMMAND_ID_CONFLICT", () => recoveredOwner.invalidate({
      ...command,
      certificationId: "different-certification-id",
    }));
    assert.equal(await readFile(path, "utf8"), before);
  });
});

test("terminal transitions fail without mutation and rejected records cannot be withdrawn", async () => {
  await fixture(async (path) => {
    const owner = authority(path, ["terminal-id", "rejected-id"]);
    owner.recordDecision(decision("terminal-record"));
    owner.withdraw(transition("terminal-withdraw", "terminal-id"));
    const afterTerminal = await readFile(path, "utf8");
    expectDomainCode("STATE_TRANSITION_REJECTED", () => owner.invalidate(transition("terminal-invalidate", "terminal-id")));
    assert.equal(await readFile(path, "utf8"), afterTerminal);
    owner.recordDecision(decision("rejected-record", "evidence-2", "REJECTED"));
    const afterRejected = await readFile(path, "utf8");
    expectDomainCode("STATE_TRANSITION_REJECTED", () => owner.withdraw(transition("rejected-withdraw", "rejected-id")));
    assert.equal(await readFile(path, "utf8"), afterRejected);
  });
});

test("supersession creates a new identity, preserves both histories and requires the same subject", async () => {
  await fixture(async (path) => {
    const owner = authority(path, ["original-id", "replacement-id", "wrong-subject-id"]);
    owner.recordDecision(decision("original", "same-evidence", "REJECTED"));
    owner.invalidate(transition("invalidate-original", "original-id"));
    const replacement = owner.recordDecision({
      ...decision("replacement", "same-evidence", "CERTIFIED"),
      supersedesCertificationId: "original-id",
    });
    assert.equal(replacement.supersedesCertificationId, "original-id");
    const projection = new BusinessCertificationJournal(path).read((events) => project(events));
    assert.deepEqual(projection.records.get("original-id")?.history().map((event) => event.type), [
      "DECISION_RECORDED", "STATE_CHANGED",
    ]);
    assert.deepEqual(projection.records.get("replacement-id")?.history().map((event) => event.type), ["DECISION_RECORDED"]);
    const before = await readFile(path, "utf8");
    expectDomainCode("SUPERSESSION_SUBJECT_MISMATCH", () => owner.recordDecision({
      ...decision("wrong-subject", "different-evidence"),
      supersedesCertificationId: "original-id",
    }));
    assert.equal(await readFile(path, "utf8"), before);
  });
});

test("restart reconstructs the identical lifecycle and supersession projection", async () => {
  await fixture(async (path) => {
    const owner = authority(path, ["recovery-original", "recovery-successor"]);
    owner.recordDecision(decision("recovery-record", "recovery-evidence", "REJECTED"));
    owner.invalidate(transition("recovery-invalidate", "recovery-original"));
    const expected = owner.recordDecision({
      ...decision("recovery-successor-record", "recovery-evidence", "CERTIFIED"),
      supersedesCertificationId: "recovery-original",
    });
    const recoveredQueries = new BusinessCertificationQueries(new BusinessCertificationJournal(path));
    assert.deepEqual(recoveredQueries.resolveReference({
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      reference: "recovery-successor",
    }), { status: "FOUND", snapshot: expected });
    const projection = new BusinessCertificationJournal(path).read((events) => project(events));
    assert.equal(projection.records.get("recovery-original")?.currentState, "INVALIDATED");
    assert.equal(projection.records.get("recovery-successor")?.currentState, "CERTIFIED");
  });
});

test("recognized missing identity and unrecognized authority remain distinct even if persistence is unavailable", async () => {
  await fixture(async (path) => {
    await writeFile(path, "not a valid durable journal\n", "utf8");
    const queries = new BusinessCertificationQueries(new BusinessCertificationJournal(path));
    assert.deepEqual(queries.resolveReference({ authority: "OTHER", reference: "missing" }), {
      status: "UNRECOGNIZED_AUTHORITY",
    });
    assert.deepEqual(queries.resolveReference({ authority: BUSINESS_CERTIFICATION_AUTHORITY, reference: "missing" }), {
      status: "AUTHORITY_UNAVAILABLE",
    });
    assert.throws(
      () => authority(path, ["never"]),
      (error: unknown) => error instanceof BusinessCertificationJournalError
        && error.code === "BUSINESS_CERTIFICATION_JOURNAL_CORRUPT",
    );
  });
});

test("hash-valid but semantically incoherent recovery data fails closed", async () => {
  await fixture(async (path) => {
    authority(path, ["integrity-id"]).recordDecision(decision("integrity-record"));
    const line = JSON.parse((await readFile(path, "utf8")).trim()) as {
      format: string; sequence: number; previousHash: string;
      event: { authority: string }; hash: string;
    };
    line.event.authority = "FORGED_AUTHORITY";
    line.hash = createHash("sha256").update(JSON.stringify(canonicalize({
      format: line.format, sequence: line.sequence, previousHash: line.previousHash, event: line.event,
    }))).digest("hex");
    await writeFile(path, `${JSON.stringify(line)}\n`, "utf8");
    assert.deepEqual(new BusinessCertificationQueries(new BusinessCertificationJournal(path)).resolveReference({
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      reference: "integrity-id",
    }), { status: "AUTHORITY_UNAVAILABLE" });
  });
});

test("hash-valid journal data with a forged idempotency fingerprint fails closed", async () => {
  await fixture(async (path) => {
    authority(path, ["fingerprint-id"]).recordDecision(decision("fingerprint-record"));
    const line = JSON.parse((await readFile(path, "utf8")).trim()) as {
      format: string; sequence: number; previousHash: string;
      event: { commandFingerprint: string }; hash: string;
    };
    line.event.commandFingerprint = "forged-command-fingerprint";
    line.hash = createHash("sha256").update(JSON.stringify(canonicalize({
      format: line.format, sequence: line.sequence, previousHash: line.previousHash, event: line.event,
    }))).digest("hex");
    await writeFile(path, `${JSON.stringify(line)}\n`, "utf8");
    assert.deepEqual(new BusinessCertificationQueries(new BusinessCertificationJournal(path)).resolveReference({
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      reference: "fingerprint-id",
    }), { status: "AUTHORITY_UNAVAILABLE" });
    assert.throws(() => authority(path, ["never-issued"]), (error: unknown) => (
      error instanceof BusinessCertificationError
        && error.code === "BUSINESS_CERTIFICATION_RECOVERY_FAILED"
    ));
  });
});

test("failed durable append exposes no certification and the next valid command can proceed", async () => {
  await fixture(async (path) => {
    class FailingJournal extends BusinessCertificationJournal {
      protected override appendDurably(_line: string): void {
        throw new BusinessCertificationJournalError(
          "BUSINESS_CERTIFICATION_JOURNAL_WRITE_FAILED", "injected failure",
        );
      }
    }
    const failed = new BusinessCertificationAuthority({
      journal: new FailingJournal(path),
      evidenceIdentities: EVIDENCE,
      idGenerator: { nextCertificationId: () => "failed-id" },
      clock: { now: () => new Date("2026-09-17T08:00:00.000Z") },
    });
    assert.throws(() => failed.recordDecision(decision("failed-write")), BusinessCertificationJournalError);
    assert.deepEqual(new BusinessCertificationQueries(new BusinessCertificationJournal(path)).resolveReference({
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      reference: "failed-id",
    }), { status: "NOT_FOUND" });
    assert.equal(authority(path, ["valid-id"]).recordDecision(decision("valid-write")).certificationId, "valid-id");
  });
});

test("FOUND reads append nothing and leave journal bytes and metadata unchanged", async () => {
  await fixture(async (path) => {
    authority(path, ["read-only-id"]).recordDecision(decision("read-only-record"));
    const beforeBytes = await readFile(path, "utf8");
    const beforeStat = await stat(path);
    const queries = new BusinessCertificationQueries(new BusinessCertificationJournal(path));
    for (let count = 0; count < 5; count += 1) {
      assert.equal(queries.resolveReference({
        authority: BUSINESS_CERTIFICATION_AUTHORITY,
        reference: "read-only-id",
      }).status, "FOUND");
    }
    const afterStat = await stat(path);
    assert.equal(await readFile(path, "utf8"), beforeBytes);
    assert.equal(afterStat.mtimeMs, beforeStat.mtimeMs);
    assert.deepEqual(await readdir(join(path, "..")), ["certifications.jsonl"]);
  });
});

test("identity collision and unknown lifecycle identity fail before an append", async () => {
  await fixture(async (path) => {
    const owner = authority(path, ["same-id", "same-id"]);
    owner.recordDecision(decision("first", "evidence-1"));
    const before = await readFile(path, "utf8");
    expectDomainCode("CERTIFICATION_ID_COLLISION", () => owner.recordDecision(decision("second", "evidence-2")));
    expectDomainCode("CERTIFICATION_NOT_FOUND", () => owner.invalidate(transition("missing", "absent-id")));
    assert.equal(await readFile(path, "utf8"), before);
  });
});

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}
