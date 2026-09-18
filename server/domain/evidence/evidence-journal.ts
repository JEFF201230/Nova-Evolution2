import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { EvidenceDomainError } from "./errors.js";
import type { EvidenceDomainEvent } from "./evidence-model.js";

const FORMAT = "NOVA_BUSINESS_EVIDENCE_JOURNAL_V1";
const ZERO_HASH = "0".repeat(64);
type StoredEvent = Readonly<{ sequence: number; previousHash: string; event: EvidenceDomainEvent; hash: string }>;
type JournalDocument = Readonly<{
  format: typeof FORMAT;
  count: number;
  headHash: string;
  entries: readonly StoredEvent[];
}>;

export interface EvidenceRepositoryJournal {
  read(): readonly EvidenceDomainEvent[];
  append(events: readonly EvidenceDomainEvent[]): void;
}

/** Sole production Business Evidence persistence. It stores Authority events and produces no Evidence. */
export class FileEvidenceRepositoryJournal implements EvidenceRepositoryJournal {
  private readonly lockPath: string;
  constructor(private readonly canonicalPath: string) {
    if (!canonicalPath || canonicalPath.trim() !== canonicalPath) throw corrupt("Canonical path must be explicit.");
    this.lockPath = `${canonicalPath}.lock`;
  }

  read(): readonly EvidenceDomainEvent[] { return this.load().map((entry) => entry.event); }

  append(events: readonly EvidenceDomainEvent[]): void {
    if (events.length === 0) return;
    mkdirSync(dirname(this.canonicalPath), { recursive: true });
    let lock: number | undefined;
    try {
      lock = openSync(this.lockPath, "wx");
      const stored = [...this.load()];
      let previousHash = stored.at(-1)?.hash ?? ZERO_HASH;
      for (const event of events) {
        const body = { sequence: stored.length + 1, previousHash, event };
        const entry = Object.freeze({ ...body, hash: digest(body) });
        stored.push(entry);
        previousHash = entry.hash;
      }
      this.replace(Object.freeze({ format: FORMAT, count: stored.length, headHash: previousHash, entries: stored }));
    } catch (error) {
      if (error instanceof EvidenceDomainError) throw error;
      throw new EvidenceDomainError("EVIDENCE_JOURNAL_UNAVAILABLE", "The authoritative journal is busy or unavailable.", { cause: error });
    } finally {
      if (lock !== undefined) { closeSync(lock); unlinkSync(this.lockPath); }
    }
  }

  private load(): readonly StoredEvent[] {
    if (!existsSync(this.canonicalPath)) return Object.freeze([]);
    let value: unknown;
    try { value = JSON.parse(readFileSync(this.canonicalPath, "utf8")); }
    catch (error) { throw corrupt("Journal is unavailable or invalid JSON.", error); }
    if (!isRecord(value) || value.format !== FORMAT || !Number.isSafeInteger(value.count)
      || typeof value.headHash !== "string" || !Array.isArray(value.entries)) throw corrupt("Journal format is invalid.");
    const result: StoredEvent[] = [];
    let previousHash = ZERO_HASH;
    for (let index = 0; index < value.entries.length; index += 1) {
      const raw = value.entries[index];
      if (!isRecord(raw) || raw.sequence !== index + 1 || raw.previousHash !== previousHash || !isRecord(raw.event)) {
        throw corrupt("Journal sequence or hash linkage is invalid.");
      }
      const body = { sequence: raw.sequence, previousHash: raw.previousHash, event: raw.event };
      if (raw.hash !== digest(body)) throw corrupt("Journal integrity check failed.");
      const entry = Object.freeze({ ...body, hash: String(raw.hash) }) as StoredEvent;
      result.push(entry);
      previousHash = entry.hash;
    }
    if (value.count !== result.length || value.headHash !== previousHash) throw corrupt("Journal tail integrity is invalid.");
    return Object.freeze(result);
  }

  private replace(document: JournalDocument): void {
    mkdirSync(dirname(this.canonicalPath), { recursive: true });
    const temporary = `${this.canonicalPath}.next-${process.pid}-${Date.now()}`;
    let fd: number | undefined;
    try {
      fd = openSync(temporary, "wx");
      writeFileSync(fd, `${JSON.stringify(document)}\n`, "utf8");
      fsyncSync(fd); closeSync(fd); fd = undefined;
      renameSync(temporary, this.canonicalPath);
    } catch (error) {
      if (fd !== undefined) closeSync(fd);
      if (existsSync(temporary)) unlinkSync(temporary);
      throw new EvidenceDomainError("EVIDENCE_JOURNAL_UNAVAILABLE", "Durable append failed.", { cause: error });
    }
  }
}

function digest(value: unknown): string { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function corrupt(message: string, cause?: unknown): EvidenceDomainError {
  return new EvidenceDomainError("EVIDENCE_JOURNAL_CORRUPT", message, { cause });
}
