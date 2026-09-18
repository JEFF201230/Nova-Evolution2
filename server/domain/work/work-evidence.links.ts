import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { EvidenceId } from "../evidence/index.js";
import type {
  WorkEvidenceLink,
  WorkEvidenceLinkProvenance,
  WorkEvidenceReference,
} from "./work-evidence.types.js";

const FORMAT = "NOVA_WORK_EVIDENCE_LINK_JOURNAL_V1";
const ZERO_HASH = "0".repeat(64);

export class WorkEvidenceLinkError extends Error {
  constructor(readonly code: "WORK_EVIDENCE_LINK_CONFLICT" | "WORK_EVIDENCE_LINK_JOURNAL_UNAVAILABLE" | "WORK_EVIDENCE_LINK_JOURNAL_CORRUPT", message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WorkEvidenceLinkError";
  }
}

export type WorkEvidenceLinkEvent = Readonly<{
  type: "WORK_EVIDENCE_LINKED" | "WORK_EVIDENCE_UNLINKED";
  idempotencyIdentity: string;
  projectId: string;
  workId: string;
  evidenceId: string;
  at: string;
  provenance: WorkEvidenceLinkProvenance;
}>;

type StoredEvent = Readonly<{
  sequence: number;
  previousHash: string;
  event: WorkEvidenceLinkEvent;
  hash: string;
}>;

export interface WorkEvidenceLinkJournal {
  read(): readonly WorkEvidenceLinkEvent[];
  append(events: readonly WorkEvidenceLinkEvent[]): void;
}

/** Durable Work persistence containing association facts only, never Evidence data. */
export class FileWorkEvidenceLinkJournal implements WorkEvidenceLinkJournal {
  private readonly lockPath: string;

  constructor(private readonly canonicalPath: string) {
    if (!canonicalPath || canonicalPath.trim() !== canonicalPath) throw corrupt("Canonical path must be explicit.");
    this.lockPath = `${canonicalPath}.lock`;
  }

  read(): readonly WorkEvidenceLinkEvent[] {
    return Object.freeze(this.load().map((entry) => entry.event));
  }

  append(events: readonly WorkEvidenceLinkEvent[]): void {
    if (events.length === 0) return;
    mkdirSync(dirname(this.canonicalPath), { recursive: true });
    let lock: number | undefined;
    try {
      lock = openSync(this.lockPath, "wx");
      const stored = [...this.load()];
      // Revalidate semantics while holding the file lock so concurrent writers
      // cannot persist a duplicate active tuple or an impossible unlink.
      rebuild(Object.freeze([...stored.map((entry) => entry.event), ...events]));
      let previousHash = stored.at(-1)?.hash ?? ZERO_HASH;
      for (const event of events) {
        validateEvent(event);
        const body = { sequence: stored.length + 1, previousHash, event };
        const entry = Object.freeze({ ...body, hash: digest(body) });
        stored.push(entry);
        previousHash = entry.hash;
      }
      this.replace(Object.freeze({ format: FORMAT, count: stored.length, headHash: previousHash, entries: stored }));
    } catch (cause) {
      if (cause instanceof WorkEvidenceLinkError) throw cause;
      throw new WorkEvidenceLinkError("WORK_EVIDENCE_LINK_JOURNAL_UNAVAILABLE", "The Work Evidence link journal is busy or unavailable.", { cause });
    } finally {
      if (lock !== undefined) {
        closeSync(lock);
        if (existsSync(this.lockPath)) unlinkSync(this.lockPath);
      }
    }
  }

  private load(): readonly StoredEvent[] {
    if (!existsSync(this.canonicalPath)) return Object.freeze([]);
    let value: unknown;
    try { value = JSON.parse(readFileSync(this.canonicalPath, "utf8")); }
    catch (cause) { throw corrupt("Link journal is unavailable or invalid JSON.", cause); }
    if (!isRecord(value) || value.format !== FORMAT || !Number.isSafeInteger(value.count)
      || typeof value.headHash !== "string" || !Array.isArray(value.entries)) {
      throw corrupt("Link journal format is invalid.");
    }
    const result: StoredEvent[] = [];
    let previousHash = ZERO_HASH;
    for (let index = 0; index < value.entries.length; index += 1) {
      const raw = value.entries[index];
      if (!isRecord(raw) || raw.sequence !== index + 1 || raw.previousHash !== previousHash || !isRecord(raw.event)) {
        throw corrupt("Link journal sequence or hash linkage is invalid.");
      }
      validateEvent(raw.event);
      const body = { sequence: raw.sequence, previousHash: raw.previousHash, event: raw.event };
      if (raw.hash !== digest(body)) throw corrupt("Link journal integrity check failed.");
      const entry = Object.freeze({ ...body, hash: String(raw.hash) }) as StoredEvent;
      result.push(entry);
      previousHash = entry.hash;
    }
    if (value.count !== result.length || value.headHash !== previousHash) throw corrupt("Link journal tail integrity is invalid.");
    return Object.freeze(result);
  }

  private replace(document: unknown): void {
    const temporary = `${this.canonicalPath}.next-${process.pid}-${Date.now()}`;
    let fd: number | undefined;
    try {
      fd = openSync(temporary, "wx");
      writeFileSync(fd, `${JSON.stringify(document)}\n`, "utf8");
      fsyncSync(fd);
      closeSync(fd);
      fd = undefined;
      renameSync(temporary, this.canonicalPath);
    } catch (cause) {
      if (fd !== undefined) closeSync(fd);
      if (existsSync(temporary)) unlinkSync(temporary);
      throw new WorkEvidenceLinkError("WORK_EVIDENCE_LINK_JOURNAL_UNAVAILABLE", "Durable Work Evidence link append failed.", { cause });
    }
  }
}

export type LinkWorkEvidence = Readonly<{
  work: WorkEvidenceReference;
  evidenceId: EvidenceId;
  provenance: WorkEvidenceLinkProvenance;
  linkedAt: Date;
  idempotencyIdentity: string;
}>;

export type UnlinkWorkEvidence = Readonly<{
  work: WorkEvidenceReference;
  evidenceId: EvidenceId;
  provenance: WorkEvidenceLinkProvenance;
  unlinkedAt: Date;
  idempotencyIdentity: string;
}>;

/** Work-owned command/read service for link facts. It has no Evidence command capability. */
export class WorkEvidenceLinks {
  constructor(private readonly journal: WorkEvidenceLinkJournal) {}

  link(command: LinkWorkEvidence): WorkEvidenceLink {
    validateReference(command.work);
    validateProvenance(command.provenance);
    assertText(command.idempotencyIdentity, "idempotencyIdentity");
    const linkedAt = iso(command.linkedAt, "linkedAt");
    const events = this.journal.read();
    const replay = assertIdempotency(events, command.idempotencyIdentity, "WORK_EVIDENCE_LINKED", command.work, command.evidenceId.value);
    if (replay) {
      const original = events.find((event) => event.idempotencyIdentity === command.idempotencyIdentity)!;
      return freezeLink({
        projectId: original.projectId,
        workId: original.workId,
        evidenceId: original.evidenceId,
        provenance: original.provenance,
        linkedAt: original.at,
      });
    }
    const existing = rebuild(events).find((link) => sameIdentity(link, command.work, command.evidenceId.value));
    if (existing !== undefined) return existing;
    const event = freezeEvent({
      type: "WORK_EVIDENCE_LINKED",
      idempotencyIdentity: command.idempotencyIdentity,
      ...command.work,
      evidenceId: command.evidenceId.value,
      at: linkedAt,
      provenance: command.provenance,
    });
    this.journal.append(Object.freeze([event]));
    return requiredLink(rebuild(this.journal.read()), command.work, command.evidenceId.value);
  }

  unlink(command: UnlinkWorkEvidence): boolean {
    validateReference(command.work);
    validateProvenance(command.provenance);
    assertText(command.idempotencyIdentity, "idempotencyIdentity");
    const unlinkedAt = iso(command.unlinkedAt, "unlinkedAt");
    const events = this.journal.read();
    const replay = assertIdempotency(events, command.idempotencyIdentity, "WORK_EVIDENCE_UNLINKED", command.work, command.evidenceId.value);
    if (replay) return true;
    if (!rebuild(events).some((link) => sameIdentity(link, command.work, command.evidenceId.value))) return false;
    this.journal.append(Object.freeze([freezeEvent({
      type: "WORK_EVIDENCE_UNLINKED",
      idempotencyIdentity: command.idempotencyIdentity,
      ...command.work,
      evidenceId: command.evidenceId.value,
      at: unlinkedAt,
      provenance: command.provenance,
    })]));
    return true;
  }

  listByWork(work: WorkEvidenceReference): readonly WorkEvidenceLink[] {
    validateReference(work);
    return Object.freeze(rebuild(this.journal.read())
      .filter((link) => link.projectId === work.projectId && link.workId === work.workId)
      .sort((left, right) => left.evidenceId.localeCompare(right.evidenceId)));
  }
}

function rebuild(events: readonly WorkEvidenceLinkEvent[]): WorkEvidenceLink[] {
  const active = new Map<string, WorkEvidenceLink>();
  const idempotency = new Set<string>();
  for (const raw of events) {
    validateEvent(raw);
    if (idempotency.has(raw.idempotencyIdentity)) throw corrupt("Duplicate link idempotency identity.");
    idempotency.add(raw.idempotencyIdentity);
    const key = identityKey(raw.projectId, raw.workId, raw.evidenceId);
    if (raw.type === "WORK_EVIDENCE_LINKED") {
      if (active.has(key)) throw corrupt("Duplicate active Work/Evidence association.");
      active.set(key, freezeLink({ projectId: raw.projectId, workId: raw.workId, evidenceId: raw.evidenceId, provenance: raw.provenance, linkedAt: raw.at }));
    } else if (!active.delete(key)) {
      throw corrupt("Unlink targets no active Work/Evidence association.");
    }
  }
  return [...active.values()];
}

function assertIdempotency(events: readonly WorkEvidenceLinkEvent[], identity: string, type: WorkEvidenceLinkEvent["type"], work: WorkEvidenceReference, evidenceId: string): boolean {
  const replay = events.find((event) => event.idempotencyIdentity === identity);
  if (replay === undefined) return false;
  if (replay.type !== type || replay.projectId !== work.projectId || replay.workId !== work.workId || replay.evidenceId !== evidenceId) {
    throw new WorkEvidenceLinkError("WORK_EVIDENCE_LINK_CONFLICT", "Link idempotency identity was reused divergently.");
  }
  return true;
}

function requiredLink(links: readonly WorkEvidenceLink[], work: WorkEvidenceReference, evidenceId: string): WorkEvidenceLink {
  const result = links.find((link) => sameIdentity(link, work, evidenceId));
  if (result === undefined) throw corrupt("Persisted association could not be recovered.");
  return result;
}

function sameIdentity(link: WorkEvidenceLink, work: WorkEvidenceReference, evidenceId: string): boolean {
  return link.projectId === work.projectId && link.workId === work.workId && link.evidenceId === evidenceId;
}

function freezeLink(link: WorkEvidenceLink): WorkEvidenceLink {
  return Object.freeze({ ...link, provenance: Object.freeze({ ...link.provenance }) });
}

function freezeEvent(event: WorkEvidenceLinkEvent): WorkEvidenceLinkEvent {
  return Object.freeze({ ...event, provenance: Object.freeze({ ...event.provenance }) });
}

function validateEvent(value: unknown): asserts value is WorkEvidenceLinkEvent {
  if (!isRecord(value) || (value.type !== "WORK_EVIDENCE_LINKED" && value.type !== "WORK_EVIDENCE_UNLINKED")) throw corrupt("Link event type is invalid.");
  validateReference(value as unknown as WorkEvidenceReference);
  EvidenceId.of(value.evidenceId as string);
  assertText(value.idempotencyIdentity, "idempotencyIdentity");
  if (typeof value.at !== "string" || !Number.isFinite(Date.parse(value.at))) throw corrupt("Link event timestamp is invalid.");
  validateProvenance(value.provenance as WorkEvidenceLinkProvenance);
}

function validateReference(value: WorkEvidenceReference): void {
  assertText(value?.projectId, "projectId");
  assertText(value?.workId, "workId");
}

function validateProvenance(value: WorkEvidenceLinkProvenance): void {
  assertText(value?.source, "provenance.source");
  assertText(value?.actor, "provenance.actor");
  assertText(value?.causalityId, "provenance.causalityId");
}

function assertText(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    throw new WorkEvidenceLinkError("WORK_EVIDENCE_LINK_CONFLICT", `${name} must be explicit and canonical.`);
  }
}

function iso(value: Date, name: string): string {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) throw new WorkEvidenceLinkError("WORK_EVIDENCE_LINK_CONFLICT", `${name} must be valid.`);
  return value.toISOString();
}

function identityKey(projectId: string, workId: string, evidenceId: string): string {
  return JSON.stringify([projectId, workId, evidenceId]);
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function corrupt(message: string, cause?: unknown): WorkEvidenceLinkError {
  return new WorkEvidenceLinkError("WORK_EVIDENCE_LINK_JOURNAL_CORRUPT", message, { cause });
}
