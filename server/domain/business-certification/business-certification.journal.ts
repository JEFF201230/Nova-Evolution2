import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type { BusinessCertificationEvent } from "./business-certification.events.js";
import {
  BUSINESS_CERTIFICATION_AUTHORITY,
  assertOpaqueIdentity,
  freezeProvenance,
  type BusinessCertificationDecision,
  type BusinessCertificationState,
  type CertificationId,
  type EvidenceId,
} from "./business-certification.types.js";

const FORMAT = "NOVA_BUSINESS_CERTIFICATION_EVENT_V1";
const ZERO_HASH = "0".repeat(64);

export type JournalTransaction<T> = Readonly<{ value: T; append?: BusinessCertificationEvent }>;

export class BusinessCertificationJournalError extends Error {
  constructor(
    readonly code: "BUSINESS_CERTIFICATION_JOURNAL_BUSY" | "BUSINESS_CERTIFICATION_JOURNAL_CORRUPT" | "BUSINESS_CERTIFICATION_JOURNAL_WRITE_FAILED",
    message: string,
    options?: ErrorOptions,
  ) {
    super(`${code}: ${message}`, options);
    this.name = "BusinessCertificationJournalError";
  }
}

/** The authoritative store. Each durable line is immutable and linked to its predecessor. */
export class BusinessCertificationJournal {
  readonly #path: string;
  readonly #lockPath: string;

  constructor(canonicalPath: string) {
    if (typeof canonicalPath !== "string" || canonicalPath.length === 0 || canonicalPath.trim() !== canonicalPath) {
      throw corrupt("Canonical journal path must be explicit.");
    }
    this.#path = canonicalPath;
    this.#lockPath = `${canonicalPath}.lock`;
  }

  /** Pure read: it neither creates directories nor acquires a filesystem lock. */
  read<T>(reader: (events: readonly BusinessCertificationEvent[]) => T): T {
    return reader(this.#load().events);
  }

  transact<T>(operation: (events: readonly BusinessCertificationEvent[]) => JournalTransaction<T>): T {
    return this.#withWriteLock(() => {
      const loaded = this.#load();
      const result = operation(loaded.events);
      if (result.append === undefined) return result.value;
      const body = {
        format: FORMAT,
        sequence: loaded.count + 1,
        previousHash: loaded.lastHash,
        event: canonicalize(result.append),
      };
      const stored = { ...body, hash: digest(body) };
      this.appendDurably(`${JSON.stringify(stored)}\n`);
      return result.value;
    });
  }

  protected appendDurably(line: string): void {
    let descriptor: number | undefined;
    try {
      descriptor = openSync(this.#path, "a");
      writeFileSync(descriptor, line, "utf8");
      fsyncSync(descriptor);
      closeSync(descriptor);
      descriptor = undefined;
    } catch (error) {
      if (descriptor !== undefined) closeSync(descriptor);
      throw new BusinessCertificationJournalError(
        "BUSINESS_CERTIFICATION_JOURNAL_WRITE_FAILED",
        "The append-only fact was not durably committed.",
        { cause: error },
      );
    }
  }

  #load(): Readonly<{ events: readonly BusinessCertificationEvent[]; count: number; lastHash: string }> {
    if (!existsSync(this.#path)) return Object.freeze({ events: Object.freeze([]), count: 0, lastHash: ZERO_HASH });
    let content: string;
    try {
      content = readFileSync(this.#path, "utf8");
    } catch (error) {
      throw corrupt("Canonical journal is unavailable.", error);
    }
    if (content.length === 0) return Object.freeze({ events: Object.freeze([]), count: 0, lastHash: ZERO_HASH });
    if (!content.endsWith("\n")) throw corrupt("Canonical journal contains a torn final append.");
    const lines = content.slice(0, -1).split("\n");
    const events: BusinessCertificationEvent[] = [];
    let previousHash = ZERO_HASH;
    for (let index = 0; index < lines.length; index += 1) {
      let candidate: unknown;
      try { candidate = JSON.parse(lines[index]!); } catch (error) { throw corrupt(`Entry ${index + 1} is not JSON.`, error); }
      const stored = exactRecord(candidate, ["format", "sequence", "previousHash", "event", "hash"], `entry ${index + 1}`);
      if (stored.format !== FORMAT || stored.sequence !== index + 1 || stored.previousHash !== previousHash) {
        throw corrupt(`Entry ${index + 1} breaks the format, sequence or hash chain.`);
      }
      const body = { format: stored.format, sequence: stored.sequence, previousHash: stored.previousHash, event: stored.event };
      if (typeof stored.hash !== "string" || stored.hash !== digest(body)) {
        throw corrupt(`Entry ${index + 1} failed its integrity check.`);
      }
      events.push(decodeEvent(stored.event));
      previousHash = stored.hash;
    }
    return Object.freeze({ events: Object.freeze(events), count: events.length, lastHash: previousHash });
  }

  #withWriteLock<T>(operation: () => T): T {
    mkdirSync(dirname(this.#path), { recursive: true });
    const deadline = Date.now() + 5_000;
    let descriptor: number | undefined;
    while (descriptor === undefined) {
      try {
        descriptor = openSync(this.#lockPath, "wx");
        writeFileSync(descriptor, String(process.pid), "utf8");
        fsyncSync(descriptor);
      } catch (error) {
        if (!isAlreadyExists(error)) throw new BusinessCertificationJournalError(
          "BUSINESS_CERTIFICATION_JOURNAL_WRITE_FAILED", "Could not acquire the journal lock.", { cause: error },
        );
        this.#removeAbandonedLock();
        if (Date.now() >= deadline) throw new BusinessCertificationJournalError(
          "BUSINESS_CERTIFICATION_JOURNAL_BUSY", "The journal is locked by a live writer.",
        );
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
      }
    }
    try { return operation(); }
    finally {
      closeSync(descriptor);
      try { unlinkSync(this.#lockPath); } catch (error) { if (!isMissing(error)) throw error; }
    }
  }

  #removeAbandonedLock(): void {
    try {
      const owner = Number(readFileSync(this.#lockPath, "utf8"));
      if (Number.isSafeInteger(owner) && owner > 0) {
        try { process.kill(owner, 0); return; } catch { /* stale owner */ }
      }
      unlinkSync(this.#lockPath);
    } catch (error) {
      if (!isMissing(error)) throw error;
    }
  }
}

function decodeEvent(value: unknown): BusinessCertificationEvent {
  const base = record(value, "event");
  if (base.type === "DECISION_RECORDED") {
    const source = exactRecord(value, [
      "type", "commandId", "commandFingerprint", "certificationId", "authority", "subject",
      "criteriaReference", "decision", "decidedAt", "provenance", "supersedesCertificationId",
    ], "decision event", ["supersedesCertificationId"]);
    opaque(source.commandId, "commandId"); opaque(source.commandFingerprint, "commandFingerprint");
    opaque(source.certificationId, "certificationId"); opaque(source.criteriaReference, "criteriaReference");
    if (source.authority !== BUSINESS_CERTIFICATION_AUTHORITY) throw corrupt("Decision authority is inconsistent.");
    const subject = exactRecord(source.subject, ["kind", "evidenceId"], "subject");
    if (subject.kind !== "BUSINESS_EVIDENCE") throw corrupt("Decision subject kind is not admitted.");
    opaque(subject.evidenceId, "evidenceId");
    const decision = decisionValue(source.decision);
    const decidedAt = timestamp(source.decidedAt, "decidedAt");
    const provenance = provenanceValue(source.provenance);
    if (source.supersedesCertificationId !== undefined) opaque(source.supersedesCertificationId, "supersedesCertificationId");
    return Object.freeze({
      type: "DECISION_RECORDED", commandId: source.commandId as string,
      commandFingerprint: source.commandFingerprint as string, certificationId: source.certificationId as CertificationId,
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      subject: Object.freeze({ kind: "BUSINESS_EVIDENCE", evidenceId: subject.evidenceId as EvidenceId }),
      criteriaReference: source.criteriaReference as string, decision, decidedAt, provenance,
      ...(source.supersedesCertificationId === undefined ? {} : { supersedesCertificationId: source.supersedesCertificationId as CertificationId }),
    });
  }
  if (base.type === "STATE_CHANGED") {
    const source = exactRecord(value, [
      "type", "commandId", "commandFingerprint", "certificationId", "from", "to", "occurredAt", "provenance",
    ], "state event");
    opaque(source.commandId, "commandId"); opaque(source.commandFingerprint, "commandFingerprint");
    opaque(source.certificationId, "certificationId");
    const from = stateValue(source.from);
    if (source.to !== "WITHDRAWN" && source.to !== "INVALIDATED") throw corrupt("Target state is invalid.");
    return Object.freeze({
      type: "STATE_CHANGED", commandId: source.commandId as string,
      commandFingerprint: source.commandFingerprint as string, certificationId: source.certificationId as CertificationId,
      from, to: source.to, occurredAt: timestamp(source.occurredAt, "occurredAt"),
      provenance: provenanceValue(source.provenance),
    });
  }
  throw corrupt("Journal contains an unknown event type.");
}

function provenanceValue(value: unknown) {
  const source = exactRecord(value, ["actor", "authority", "causationIdentity"], "provenance");
  opaque(source.actor, "actor"); opaque(source.authority, "authority"); opaque(source.causationIdentity, "causationIdentity");
  return freezeProvenance({ actor: source.actor as string, authority: source.authority as string, causationIdentity: source.causationIdentity as string });
}

function decisionValue(value: unknown): BusinessCertificationDecision {
  if (value !== "CERTIFIED" && value !== "REJECTED") throw corrupt("Decision is invalid.");
  return value;
}

function stateValue(value: unknown): BusinessCertificationState {
  if (value !== "CERTIFIED" && value !== "REJECTED" && value !== "WITHDRAWN" && value !== "INVALIDATED") {
    throw corrupt("State is invalid.");
  }
  return value;
}

function timestamp(value: unknown, label: string): string {
  if (typeof value !== "string" || new Date(value).toISOString() !== value) throw corrupt(`${label} is not canonical UTC.`);
  return value;
}

function opaque(value: unknown, label: string): void {
  try { assertOpaqueIdentity(value, label); } catch (error) { throw corrupt(`${label} is invalid.`, error); }
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw corrupt(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function exactRecord(
  value: unknown,
  admitted: readonly string[],
  label: string,
  optional: readonly string[] = [],
): Record<string, unknown> {
  const source = record(value, label);
  const keys = Object.keys(source);
  if (keys.some((key) => !admitted.includes(key)) || admitted.some((key) => !optional.includes(key) && !(key in source))) {
    throw corrupt(`${label} has an inconsistent structure.`);
  }
  return source;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function corrupt(message: string, cause?: unknown): BusinessCertificationJournalError {
  return new BusinessCertificationJournalError(
    "BUSINESS_CERTIFICATION_JOURNAL_CORRUPT", message, cause === undefined ? undefined : { cause },
  );
}

function isAlreadyExists(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "EEXIST";
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
