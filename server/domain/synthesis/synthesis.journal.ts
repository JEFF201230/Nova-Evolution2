import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { SynthesisDomainError } from "./synthesis.errors.js";
import type { SynthesisLifecycleEvent } from "./synthesis.types.js";

const FORMAT = "NOVA_SYNTHESIS_JOURNAL_V1";
const ZERO_HASH = "0".repeat(64);
type StoredEvent = Readonly<{ sequence: number; previousHash: string; event: SynthesisLifecycleEvent; hash: string }>;
type JournalDocument = Readonly<{ format: typeof FORMAT; count: number; headHash: string; entries: readonly StoredEvent[] }>;

export interface SynthesisJournal {
  read(): readonly SynthesisLifecycleEvent[];
  append(events: readonly SynthesisLifecycleEvent[]): void;
}

export class MemorySynthesisJournal implements SynthesisJournal {
  private events: SynthesisLifecycleEvent[] = [];
  read(): readonly SynthesisLifecycleEvent[] { return Object.freeze(this.events.map(cloneEvent)); }
  append(events: readonly SynthesisLifecycleEvent[]): void { this.events.push(...events.map(cloneEvent)); }
}

export class FileSynthesisJournal implements SynthesisJournal {
  private readonly lockPath: string;
  constructor(private readonly canonicalPath: string) {
    if (typeof canonicalPath !== "string" || canonicalPath.length === 0 || canonicalPath.trim() !== canonicalPath) throw corrupt("Journal path must be explicit.");
    this.lockPath = `${canonicalPath}.lock`;
  }
  read(): readonly SynthesisLifecycleEvent[] {
    if (!existsSync(this.canonicalPath)) return Object.freeze([]);
    const document = parse(readFileSync(this.canonicalPath, "utf8"));
    verify(document);
    return Object.freeze(document.entries.map((entry) => cloneEvent(entry.event)));
  }
  append(events: readonly SynthesisLifecycleEvent[]): void {
    if (events.length === 0) return;
    mkdirSync(dirname(this.canonicalPath), { recursive: true });
    let lock: number;
    try { lock = openSync(this.lockPath, "wx"); } catch (cause) { throw corrupt("Synthesis journal is locked.", cause); }
    const temporary = `${this.canonicalPath}.tmp`;
    try {
      const entries: StoredEvent[] = [];
      let previousHash = ZERO_HASH;
      for (const event of [...this.read(), ...events]) {
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
      try { unlinkSync(this.lockPath); } catch { /* best effort */ }
    }
  }
}

function parse(raw: string): JournalDocument { try { return JSON.parse(raw) as JournalDocument; } catch (cause) { throw corrupt("Synthesis journal is not valid JSON.", cause); } }
function verify(document: JournalDocument): void {
  if (document?.format !== FORMAT || !Array.isArray(document.entries) || document.count !== document.entries.length) throw corrupt("Invalid journal envelope.");
  let previousHash = ZERO_HASH;
  document.entries.forEach((entry, index) => {
    if (entry.sequence !== index + 1 || entry.previousHash !== previousHash || entry.hash !== digest(entry.sequence, previousHash, entry.event)) throw corrupt("Journal hash chain is invalid.");
    previousHash = entry.hash;
  });
  if (document.headHash !== previousHash) throw corrupt("Journal head is invalid.");
}
function digest(sequence: number, previousHash: string, event: SynthesisLifecycleEvent): string { return createHash("sha256").update(JSON.stringify({ sequence, previousHash, event })).digest("hex"); }
function cloneEvent(event: SynthesisLifecycleEvent): SynthesisLifecycleEvent { return JSON.parse(JSON.stringify(event)) as SynthesisLifecycleEvent; }
function corrupt(message: string, cause?: unknown): SynthesisDomainError { return new SynthesisDomainError("SYNTHESIS_JOURNAL_CORRUPT", message, cause === undefined ? undefined : { cause }); }
