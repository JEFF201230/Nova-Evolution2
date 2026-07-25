import { createHash } from "node:crypto";
import type { RuntimeEvent } from "../orchestrator/orchestrator-runtime.types.js";

export const JOURNAL_SCHEMA_VERSION = 1;

export interface JournalEvent<TPayload = unknown> {
  eventId: string;
  sequence: number;
  timestamp: string;
  projectId: string;
  missionId: string;
  runId: string | null;
  correlationId: string;
  eventType: string;
  payload: TPayload;
  previousHash: string | null;
  eventHash: string;
  schemaVersion: number;
}

export interface JournalEventInput<TPayload = unknown>
  extends Omit<JournalEvent<TPayload>, "sequence" | "timestamp" | "previousHash" | "eventHash" | "schemaVersion"> {
  /** Optional explicit sequence for imported/replayed streams. */
  sequence?: number;
  timestamp?: string;
}

export interface JournalIntegrityResult {
  valid: boolean;
  eventCount: number;
  firstError?: {
    index: number;
    code: "SEQUENCE_GAP" | "PREVIOUS_HASH_MISMATCH" | "EVENT_HASH_MISMATCH" | "SCHEMA_MISMATCH";
    message: string;
  };
}

export interface RuntimeJournalIntegrityResult extends JournalIntegrityResult {
  streamCount: number;
}

export type JournalReducer<TState, TPayload = unknown> = (
  state: TState,
  event: JournalEvent<TPayload>,
) => TState;

export interface JournalRunRecoveryInput {
  runId: string;
  status: "RUNNING" | "COMPLETED" | "FAILED" | "TIMEOUT" | "CANCELLED" | "UNKNOWN";
  processAlive: RecoverySignal;
  processTreeAlive: RecoverySignal;
  reportPresent: RecoverySignal;
  worktreeModified: RecoverySignal;
  lockPresent: RecoverySignal;
  journalValid: RecoverySignal;
  snapshotValid: RecoverySignal;
  artifactsValid: RecoverySignal;
}

export type RecoverySignal = boolean | "UNKNOWN";

export type RecoveryClassification =
  | "INSPECTION_UNKNOWN"
  | "JOURNAL_INVALID"
  | "SNAPSHOT_INVALID"
  | "ARTIFACTS_INVALID"
  | "INTERRUPTED_PROCESS_ACTIVE"
  | "INTERRUPTED_REPORT_PRESENT"
  | "INTERRUPTED_REPORT_ABSENT"
  | "WORKTREE_DRIFT"
  | "ORPHAN_LOCK"
  | "COMPLETED"
  | "FAILED"
  | "TIMEOUT"
  | "CANCELLED"
  | "UNKNOWN";

export interface JournalRunRecoveryResult extends JournalRunRecoveryInput {
  classification: RecoveryClassification;
  requiresReconciliation: boolean;
}

/**
 * Small append-only, hash-chained journal. It intentionally has no runtime
 * or CEREBRAU dependency; callers decide how/when to persist `events`.
 */
export class AppendOnlyJournal<TPayload = unknown> {
  private readonly events: JournalEvent<TPayload>[];

  constructor(initialEvents: readonly JournalEvent<TPayload>[] = []) {
    this.events = initialEvents.map((event) => ({ ...event }));
  }

  get size(): number {
    return this.events.length;
  }

  snapshot(): JournalEvent<TPayload>[] {
    return this.events.map((event) => ({ ...event }));
  }

  append(input: JournalEventInput<TPayload>): JournalEvent<TPayload> {
    const integrity = this.verifyIntegrity();
    if (!integrity.valid) {
      throw new Error(`Cannot append to invalid journal: ${integrity.firstError?.message ?? "integrity failure"}`);
    }
    const expectedSequence = this.events.length + 1;
    if (input.sequence !== undefined && input.sequence !== expectedSequence) {
      throw new Error(`Journal sequence must be ${expectedSequence}, received ${input.sequence}`);
    }

    const eventWithoutHash = {
      eventId: input.eventId,
      sequence: expectedSequence,
      timestamp: input.timestamp ?? new Date().toISOString(),
      projectId: input.projectId,
      missionId: input.missionId,
      runId: input.runId,
      correlationId: input.correlationId,
      eventType: input.eventType,
      payload: input.payload,
      previousHash: this.events.at(-1)?.eventHash ?? null,
      schemaVersion: JOURNAL_SCHEMA_VERSION,
    };

    const event: JournalEvent<TPayload> = {
      ...eventWithoutHash,
      eventHash: hashCanonical(eventWithoutHash),
    };
    this.events.push(event);
    return { ...event };
  }

  verifyIntegrity(): JournalIntegrityResult {
    let previousHash: string | null = null;
    for (let index = 0; index < this.events.length; index += 1) {
      const event = this.events[index];
      const expectedSequence = index + 1;
      if (event.schemaVersion !== JOURNAL_SCHEMA_VERSION) {
        return integrityError(index, "SCHEMA_MISMATCH", `Unsupported schema version ${event.schemaVersion}`);
      }
      if (event.sequence !== expectedSequence) {
        return integrityError(index, "SEQUENCE_GAP", `Expected sequence ${expectedSequence}, received ${event.sequence}`);
      }
      if (event.previousHash !== previousHash) {
        return integrityError(index, "PREVIOUS_HASH_MISMATCH", "previousHash does not match the preceding event");
      }
      const { eventHash, ...eventWithoutHash } = event;
      const expectedHash = hashCanonical(eventWithoutHash);
      if (eventHash !== expectedHash) {
        return integrityError(index, "EVENT_HASH_MISMATCH", "eventHash does not match event contents");
      }
      previousHash = eventHash;
    }
    return { valid: true, eventCount: this.events.length };
  }

  replay<TState>(initialState: TState, reducer: JournalReducer<TState, TPayload>): TState {
    const integrity = this.verifyIntegrity();
    if (!integrity.valid) throw new Error(`Cannot replay invalid journal: ${integrity.firstError?.message}`);
    return this.events.reduce(reducer, initialState);
  }
}

export function classifyRunRecovery(input: JournalRunRecoveryInput): JournalRunRecoveryResult {
  let classification: RecoveryClassification;
  if (Object.values(input).some((value) => value === "UNKNOWN")) classification = "INSPECTION_UNKNOWN";
  else if (input.journalValid === false) classification = "JOURNAL_INVALID";
  else if (input.snapshotValid === false) classification = "SNAPSHOT_INVALID";
  else if (input.artifactsValid === false) classification = "ARTIFACTS_INVALID";
  else if (input.status === "COMPLETED") classification = "COMPLETED";
  else if (input.status === "FAILED") classification = "FAILED";
  else if (input.status === "TIMEOUT") classification = "TIMEOUT";
  else if (input.status === "CANCELLED") classification = "CANCELLED";
  else if (input.worktreeModified === true) classification = "WORKTREE_DRIFT";
  else if (input.processAlive === true || input.processTreeAlive === true) classification = "INTERRUPTED_PROCESS_ACTIVE";
  else if (input.reportPresent === true) classification = "INTERRUPTED_REPORT_PRESENT";
  else if (input.lockPresent === true) classification = "ORPHAN_LOCK";
  else if (input.status === "RUNNING") classification = "INTERRUPTED_REPORT_ABSENT";
  else classification = "UNKNOWN";

  return {
    ...input,
    classification,
    requiresReconciliation: !["COMPLETED", "FAILED", "TIMEOUT", "CANCELLED"].includes(classification),
  };
}

export function sealRuntimeEvent(
  input: RuntimeEvent,
  previousHash: string | null,
): RuntimeEvent {
  const { eventHash: _eventHash, previousHash: _previousHash, schemaVersion: _schemaVersion, ...base } = input;
  const eventWithoutHash = {
    ...removeUndefined(base),
    previousHash,
    schemaVersion: JOURNAL_SCHEMA_VERSION,
  } as Omit<RuntimeEvent, "eventHash">;
  return {
    ...eventWithoutHash,
    eventHash: hashCanonical(eventWithoutHash),
  };
}

function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => removeUndefined(entry)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, removeUndefined(entry)]),
    ) as T;
  }
  return value;
}

export function sealRuntimeEventJournal(events: readonly RuntimeEvent[]): RuntimeEvent[] {
  const previousByStream = new Map<string, string | null>();
  return events.map((event) => {
    const stream = `${event.projectId}:${event.missionId}`;
    const sealed = sealRuntimeEvent(event, previousByStream.get(stream) ?? null);
    previousByStream.set(stream, sealed.eventHash!);
    return sealed;
  });
}

export function verifyRuntimeEventJournal(events: readonly RuntimeEvent[]): RuntimeJournalIntegrityResult {
  const previousByStream = new Map<string, string | null>();
  const sequenceByStream = new Map<string, number>();
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index]!;
    const stream = `${event.projectId}:${event.missionId}`;
    const expectedSequence = (sequenceByStream.get(stream) ?? 0) + 1;
    if (event.schemaVersion !== JOURNAL_SCHEMA_VERSION) {
      return { ...integrityError(index, "SCHEMA_MISMATCH", `Unsupported schema version ${String(event.schemaVersion)}`), streamCount: previousByStream.size };
    }
    if (event.sequence !== expectedSequence) {
      return { ...integrityError(index, "SEQUENCE_GAP", `Expected sequence ${expectedSequence}, received ${event.sequence}`), streamCount: previousByStream.size };
    }
    const expectedPrevious = previousByStream.get(stream) ?? null;
    if (event.previousHash !== expectedPrevious) {
      return { ...integrityError(index, "PREVIOUS_HASH_MISMATCH", "previousHash does not match the preceding event in its mission stream"), streamCount: previousByStream.size };
    }
    const { eventHash, ...eventWithoutHash } = event;
    if (!eventHash || eventHash !== hashCanonical(eventWithoutHash)) {
      return { ...integrityError(index, "EVENT_HASH_MISMATCH", "eventHash does not match event contents"), streamCount: previousByStream.size };
    }
    previousByStream.set(stream, eventHash);
    sequenceByStream.set(stream, event.sequence);
  }
  return { valid: true, eventCount: events.length, streamCount: previousByStream.size };
}

function hashCanonical(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(",")}}`;
}

function integrityError(
  index: number,
  code: "SEQUENCE_GAP" | "PREVIOUS_HASH_MISMATCH" | "EVENT_HASH_MISMATCH" | "SCHEMA_MISMATCH",
  message: string,
): JournalIntegrityResult {
  return { valid: false, eventCount: index, firstError: { index, code, message } };
}
