import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { IntelligenceDomainError } from "./intelligence.errors.js";
import type { IntelligenceLifecycleEvent } from "./intelligence.types.js";

const FORMAT = "NOVA_INTELLIGENCE_JOURNAL_V1";
const ZERO_HASH = "0".repeat(64);
type StoredEvent = Readonly<{ sequence: number; previousHash: string; event: IntelligenceLifecycleEvent; hash: string }>;
type JournalDocument = Readonly<{ format: typeof FORMAT; count: number; headHash: string; entries: readonly StoredEvent[] }>;

export interface IntelligenceJournal {
  read(): readonly IntelligenceLifecycleEvent[];
  append(events: readonly IntelligenceLifecycleEvent[]): void;
}

export class MemoryIntelligenceJournal implements IntelligenceJournal {
  private events: IntelligenceLifecycleEvent[] = [];
  read(): readonly IntelligenceLifecycleEvent[] { return Object.freeze([...this.events]); }
  append(events: readonly IntelligenceLifecycleEvent[]): void { this.events.push(...events.map(cloneEvent)); }
}

/** Sole production persistence for Intelligence results; no source-domain value is persisted. */
export class FileIntelligenceJournal implements IntelligenceJournal {
  private readonly lockPath: string;
  constructor(private readonly canonicalPath: string) {
    if (typeof canonicalPath !== "string" || canonicalPath.trim() !== canonicalPath || canonicalPath.length === 0) {
      throw corrupt("Journal path must be explicit.");
    }
    this.lockPath = `${canonicalPath}.lock`;
  }

  read(): readonly IntelligenceLifecycleEvent[] {
    if (!existsSync(this.canonicalPath)) return Object.freeze([]);
    const document = parseDocument(readFileSync(this.canonicalPath, "utf8"));
    verify(document);
    return Object.freeze(document.entries.map((entry) => cloneEvent(entry.event)));
  }

  append(events: readonly IntelligenceLifecycleEvent[]): void {
    if (events.length === 0) return;
    mkdirSync(dirname(this.canonicalPath), { recursive: true });
    let lock: number;
    try { lock = openSync(this.lockPath, "wx"); }
    catch (cause) { throw corrupt("Intelligence journal is locked.", cause); }
    const temporary = `${this.canonicalPath}.tmp`;
    try {
      const current = this.read();
      const entries: StoredEvent[] = [];
      let previousHash = ZERO_HASH;
      for (const event of [...current, ...events]) {
        const sequence = entries.length + 1;
        const frozen = cloneEvent(event);
        const hash = digest(sequence, previousHash, frozen);
        entries.push(Object.freeze({ sequence, previousHash, event: frozen, hash }));
        previousHash = hash;
      }
      const document: JournalDocument = Object.freeze({ format: FORMAT, count: entries.length, headHash: previousHash, entries: Object.freeze(entries) });
      const handle = openSync(temporary, "w");
      try { writeFileSync(handle, JSON.stringify(document), "utf8"); fsyncSync(handle); } finally { closeSync(handle); }
      renameSync(temporary, this.canonicalPath);
    } finally {
      try { unlinkSync(temporary); } catch { /* already renamed */ }
      closeSync(lock!);
      try { unlinkSync(this.lockPath); } catch { /* best effort after close */ }
    }
  }
}

function parseDocument(raw: string): JournalDocument {
  try { return JSON.parse(raw) as JournalDocument; }
  catch (cause) { throw corrupt("Intelligence journal is not valid JSON.", cause); }
}
function verify(document: JournalDocument): void {
  if (document?.format !== FORMAT || !Array.isArray(document.entries) || document.count !== document.entries.length) throw corrupt("Invalid journal envelope.");
  let previousHash = ZERO_HASH;
  document.entries.forEach((entry, index) => {
    if (entry.sequence !== index + 1 || entry.previousHash !== previousHash || entry.hash !== digest(entry.sequence, previousHash, entry.event)) throw corrupt("Journal hash chain is invalid.");
    previousHash = entry.hash;
  });
  if (document.headHash !== previousHash) throw corrupt("Journal head is invalid.");
}
function digest(sequence: number, previousHash: string, event: IntelligenceLifecycleEvent): string {
  return createHash("sha256").update(JSON.stringify({ sequence, previousHash, event })).digest("hex");
}
function cloneEvent(event: IntelligenceLifecycleEvent): IntelligenceLifecycleEvent {
  return JSON.parse(JSON.stringify(event)) as IntelligenceLifecycleEvent;
}
function corrupt(message: string, cause?: unknown): IntelligenceDomainError {
  return new IntelligenceDomainError("INTELLIGENCE_JOURNAL_CORRUPT", message, cause === undefined ? undefined : { cause });
}
