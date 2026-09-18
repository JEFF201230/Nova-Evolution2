import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { ConfidenceDomainError } from "./confidence.errors.js";
import type { ConfidenceLifecycleEvent } from "./confidence.types.js";

const FORMAT = "NOVA_CONFIDENCE_JOURNAL_V1";
const ZERO_HASH = "0".repeat(64);
type StoredEvent = Readonly<{ sequence: number; previousHash: string; event: ConfidenceLifecycleEvent; hash: string }>;
type JournalDocument = Readonly<{ format: typeof FORMAT; count: number; headHash: string; entries: readonly StoredEvent[] }>;

export interface ConfidenceJournal {
  read(): readonly ConfidenceLifecycleEvent[];
  append(events: readonly ConfidenceLifecycleEvent[]): void;
}

export class MemoryConfidenceJournal implements ConfidenceJournal {
  private events: ConfidenceLifecycleEvent[] = [];
  read(): readonly ConfidenceLifecycleEvent[] { return Object.freeze(this.events.map(cloneEvent)); }
  append(events: readonly ConfidenceLifecycleEvent[]): void { this.events.push(...events.map(cloneEvent)); }
}

export class FileConfidenceJournal implements ConfidenceJournal {
  private readonly lockPath: string;
  constructor(private readonly canonicalPath: string) {
    if (typeof canonicalPath !== "string" || canonicalPath.length === 0 || canonicalPath.trim() !== canonicalPath) throw corrupt("Journal path must be explicit.");
    this.lockPath = `${canonicalPath}.lock`;
  }
  read(): readonly ConfidenceLifecycleEvent[] {
    if (!existsSync(this.canonicalPath)) return Object.freeze([]);
    let document: JournalDocument;
    try { document = JSON.parse(readFileSync(this.canonicalPath, "utf8")) as JournalDocument; }
    catch (cause) { throw corrupt("Confidence journal is not valid JSON.", cause); }
    verify(document);
    return Object.freeze(document.entries.map((entry) => cloneEvent(entry.event)));
  }
  append(events: readonly ConfidenceLifecycleEvent[]): void {
    if (events.length === 0) return;
    mkdirSync(dirname(this.canonicalPath), { recursive: true });
    let lock: number;
    try { lock = openSync(this.lockPath, "wx"); }
    catch (cause) { throw corrupt("Confidence journal is locked.", cause); }
    const temporary = `${this.canonicalPath}.tmp`;
    try {
      const entries: StoredEvent[] = [];
      let previousHash = ZERO_HASH;
      for (const event of [...this.read(), ...events]) {
        const sequence = entries.length + 1;
        const frozen = cloneEvent(event);
        const hash = createHash("sha256").update(JSON.stringify({ sequence, previousHash, event: frozen })).digest("hex");
        entries.push(Object.freeze({ sequence, previousHash, event: frozen, hash }));
        previousHash = hash;
      }
      const document: JournalDocument = Object.freeze({ format: FORMAT, count: entries.length, headHash: previousHash, entries: Object.freeze(entries) });
      const handle = openSync(temporary, "w");
      try { writeFileSync(handle, JSON.stringify(document), "utf8"); fsyncSync(handle); } finally { closeSync(handle); }
      renameSync(temporary, this.canonicalPath);
    } finally {
      try { unlinkSync(temporary); } catch { /* renamed or absent */ }
      closeSync(lock!);
      try { unlinkSync(this.lockPath); } catch { /* best effort */ }
    }
  }
}

function verify(document: JournalDocument): void {
  if (document?.format !== FORMAT || !Array.isArray(document.entries) || document.count !== document.entries.length) throw corrupt("Invalid Confidence journal envelope.");
  let previousHash = ZERO_HASH;
  document.entries.forEach((entry, index) => {
    const hash = createHash("sha256").update(JSON.stringify({ sequence: entry.sequence, previousHash, event: entry.event })).digest("hex");
    if (entry.sequence !== index + 1 || entry.previousHash !== previousHash || entry.hash !== hash) throw corrupt("Confidence journal hash chain is invalid.");
    previousHash = hash;
  });
  if (document.headHash !== previousHash) throw corrupt("Confidence journal head is invalid.");
}
function cloneEvent(event: ConfidenceLifecycleEvent): ConfidenceLifecycleEvent { return JSON.parse(JSON.stringify(event)) as ConfidenceLifecycleEvent; }
function corrupt(message: string, cause?: unknown): ConfidenceDomainError { return new ConfidenceDomainError("CONFIDENCE_JOURNAL_CORRUPT", message, cause === undefined ? undefined : { cause }); }
