import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { PlanningAuthority } from "./planning-authority.js";
import type { PlanningAuthorityResult } from "./planning-authority.js";
import type { PlanningDomainEvent } from "./planning-authority.events.js";
import type { Planning, PlanningRevision } from "./planning.aggregate.js";
import {
  canonicalJson,
  deserializeProvenance,
  deserializeRevision,
  serializeEventPayload,
  serializeRevision,
  type SerializedPlanningRevision,
} from "./planning-persistence-codec.js";
import { PlanningPersistenceSchema } from "./planning-persistence-migrations.js";
import type {
  PendingPlanningChange,
  PersistedPlanning,
  PlanningCommandEnvelope,
  PlanningCommitResult,
  PlanningHistoryEvent,
  PlanningHistorySlice,
  PlanningRepository,
} from "./planning-persistence-ports.js";
import {
  CausalityId,
  PlanningVersion,
  WorkReference,
  type PlanningProvenance,
} from "./planning.value-objects.js";

export type PlanningPersistenceErrorCode =
  | "CONCURRENT_PLANNING_CHANGE"
  | "PLANNING_IDEMPOTENCY_CONFLICT"
  | "PLANNING_HISTORY_CORRUPTED"
  | "PLANNING_PERSISTENCE_UNAVAILABLE"
  | "PLANNING_PERSISTENCE_CONSTRAINT_VIOLATION";

export class PlanningPersistenceError extends Error {
  constructor(readonly code: PlanningPersistenceErrorCode, message: string) {
    super(`${code}: ${message}`);
    this.name = "PlanningPersistenceError";
  }
}

export class PlanningPersistenceConflictError extends PlanningPersistenceError {
  constructor(readonly expectedRevision: number, readonly actualRevision: number) {
    super(
      "CONCURRENT_PLANNING_CHANGE",
      `Expected stream revision ${expectedRevision}, actual revision ${actualRevision}.`,
    );
    this.name = "PlanningPersistenceConflictError";
  }
}

export class PlanningIdempotencyConflictError extends PlanningPersistenceError {
  constructor() {
    super(
      "PLANNING_IDEMPOTENCY_CONFLICT",
      "The causation is already bound to a different Planning persistence intention.",
    );
    this.name = "PlanningIdempotencyConflictError";
  }
}

export class PlanningHistoryCorruptedError extends PlanningPersistenceError {
  constructor(message: string) {
    super("PLANNING_HISTORY_CORRUPTED", message);
    this.name = "PlanningHistoryCorruptedError";
  }
}

export interface PlanningSQLiteOptions {
  readonly now?: () => Date;
  /** Test seam proving rollback if interruption occurs after state/history writes. */
  readonly beforeReceipt?: () => void;
}

type RootRow = Readonly<{
  revision: number;
  current_version: number | null;
  created_at_epoch_ms: number;
  updated_at_epoch_ms: number;
}>;

type EventRow = Readonly<{
  event_id: string;
  stream_sequence: number;
  aggregate_revision: number;
  event_ordinal: number;
  planning_version: number;
  event_type: PlanningDomainEvent["name"];
  payload_json: string;
  causation_id: string;
  correlation_id: string;
  authority: string;
  source: string;
  effective_at_epoch_ms: number;
  recorded_at_epoch_ms: number;
}>;

type ReceiptRow = Readonly<{
  command_type: string;
  fingerprint_version: number;
  request_fingerprint: string;
  committed_revision: number;
  first_event_sequence: number;
  event_count: number;
  result_json: string;
  committed_at_epoch_ms: number;
}>;

type IntegrityReceiptRow = ReceiptRow & Readonly<{
  project_identity: string;
  work_identity: string;
  causation_id: string;
  expected_revision: number;
}>;

export class PlanningSQLiteRepository implements PlanningRepository {
  private readonly now: () => Date;
  private readonly beforeReceipt?: () => void;

  constructor(private readonly database: DatabaseSync, options: PlanningSQLiteOptions = {}) {
    this.now = options.now ?? (() => new Date());
    this.beforeReceipt = options.beforeReceipt;
    new PlanningPersistenceSchema(database, { now: this.now }).migrate();
    this.assertCanonicalIntegrity();
  }

  load(workReference: WorkReference): PersistedPlanning | null {
    const root = this.root(workReference);
    if (root === null) return null;
    const replayed = this.rehydrate(workReference);
    if (replayed === null || replayed.revision !== root.revision
      || (replayed.aggregate.currentVersion?.version.value ?? null) !== root.current_version) {
      throw corrupted("Current Planning head diverges from immutable history.");
    }
    return replayed;
  }

  readVersions(workReference: WorkReference): readonly PlanningRevision[] {
    return Object.freeze(this.versionRows(workReference).map((row) => {
      const revision = deserializeRevision(
        parseJson<SerializedPlanningRevision>(row.state_json, "Planning version"),
      );
      if (revision.version.value !== row.planning_version
        || revision.provenance.authority !== row.authority
        || revision.provenance.source !== row.source
        || revision.provenance.businessCause !== row.causation_id
        || revision.provenance.effectiveAt.getTime() !== row.effective_at_epoch_ms) {
        throw corrupted("Planning version metadata diverges from its immutable state.");
      }
      return revision;
    }));
  }

  readHistory(
    workReference: WorkReference,
    afterSequence = 0,
    limit = 100,
  ): PlanningHistorySlice {
    if (!Number.isSafeInteger(afterSequence) || afterSequence < 0
      || !Number.isSafeInteger(limit) || limit <= 0 || limit > 1000) {
      throw corrupted("History bounds must be canonical positive integers.");
    }
    const rows = this.database.prepare(
      `SELECT event_id, stream_sequence, aggregate_revision, event_ordinal, planning_version,
              event_type, payload_json, causation_id, correlation_id, authority, source,
              effective_at_epoch_ms, recorded_at_epoch_ms
         FROM planning_event
        WHERE project_identity = ? AND work_identity = ? AND stream_sequence > ?
        ORDER BY stream_sequence LIMIT ?`,
    ).all(
      workReference.projectIdentity,
      workReference.workIdentity,
      afterSequence,
      limit + 1,
    ) as EventRow[];
    const hasMore = rows.length > limit;
    const selected = rows.slice(0, limit).map(toHistoryEvent);
    const root = this.root(workReference);
    return Object.freeze({
      events: Object.freeze(selected),
      fromSequence: selected[0]?.streamSequence ?? afterSequence,
      toSequence: selected.at(-1)?.streamSequence ?? afterSequence,
      lastRevision: root?.revision ?? 0,
      hasMore,
    });
  }

  rehydrate(workReference: WorkReference, atRevision?: number): PersistedPlanning | null {
    const root = this.root(workReference);
    if (root === null) return null;
    const revision = atRevision ?? root.revision;
    if (!Number.isSafeInteger(revision) || revision <= 0 || revision > root.revision) {
      throw corrupted("Requested Planning stream revision is outside canonical history.");
    }
    const revisions = new Map(this.readVersions(workReference)
      .map((value) => [value.version.value, value] as const));
    const rows = this.eventRows(workReference).filter((row) => row.aggregate_revision <= revision);
    if (rows.length === 0) throw corrupted("A Planning root has no event history.");
    rows.forEach((row, index) => {
      if (row.stream_sequence !== index + 1) throw corrupted("Planning event sequence has a gap.");
      if (row.event_ordinal < 1) throw corrupted("Planning event ordinal is invalid.");
    });
    const revisionNumbers = [...new Set(rows.map((row) => row.aggregate_revision))];
    revisionNumbers.forEach((value, index) => {
      if (value !== index + 1) throw corrupted("Planning stream revisions are not contiguous.");
      const group = rows.filter((row) => row.aggregate_revision === value);
      if (group.some((row, ordinal) => row.event_ordinal !== ordinal + 1)) {
        throw corrupted("Planning event ordinals are not contiguous.");
      }
      if (group.filter(isRootEvent).length !== 1) {
        throw corrupted("Each Planning stream revision must contain one root fact.");
      }
    });
    let aggregate: Planning | null = null;
    for (const row of rows.filter(isRootEvent)) {
      const provenance = provenanceFromRow(row);
      const authority = PlanningAuthority.create(provenance.authority, {
        workExists: () => true,
        objectiveAvailable: () => true,
      });
      const causality = CausalityId.of(row.causation_id);
      const proposal = revisions.get(row.planning_version);
      const latest: PlanningVersion | null = aggregate === null
        ? null
        : aggregate.versions.at(-1)?.version ?? null;
      const payload = parseJson<Record<string, unknown>>(row.payload_json, "Planning event");
      let accepted: PlanningAuthorityResult;
      if (row.event_type === "PlanningEstablished") {
        if (proposal === undefined) throw corrupted("Establishment references a missing version.");
        accepted = authority.establishPlanning(aggregate, {
          kind: "ESTABLISH_PLANNING", workReference, causality, provenance,
          expectedVersion: latest, proposal,
        });
      } else if (row.event_type === "PlanningRevised") {
        if (proposal === undefined || typeof payload.reason !== "string") {
          throw corrupted("Revision event lacks its immutable proposal or reason.");
        }
        accepted = authority.revisePlanning(aggregate, {
          kind: "REVISE_PLANNING", workReference, causality, provenance,
          expectedVersion: PlanningVersion.of(row.planning_version - 1), proposal,
          reason: payload.reason,
        });
      } else {
        if (typeof payload.reason !== "string") throw corrupted("Withdrawal reason is absent.");
        accepted = authority.withdrawPlanning(aggregate, {
          kind: "WITHDRAW_PLANNING", workReference, causality, provenance,
          expectedVersion: PlanningVersion.of(row.planning_version), reason: payload.reason,
        });
      }
      assertStoredEventsEqualAccepted(
        rows.filter((candidate) => candidate.aggregate_revision === row.aggregate_revision),
        accepted.events,
      );
      aggregate = accepted.aggregate;
    }
    if (aggregate === null) throw corrupted("Planning history has no authoritative root event.");
    const finalRows = rows.filter((row) => row.aggregate_revision === revision);
    if (finalRows.length === 0) throw corrupted("Planning history has a stream revision gap.");
    if (revision === root.revision && aggregate.versions.length !== revisions.size) {
      throw corrupted("Immutable Planning versions and authoritative event history diverge.");
    }
    return Object.freeze({
      aggregate,
      revision,
      lastEventSequence: rows.at(-1)?.stream_sequence ?? 0,
    });
  }

  commit(
    expectedRevision: number,
    change: PendingPlanningChange,
    envelope: PlanningCommandEnvelope,
  ): PlanningCommitResult {
    validateEnvelope(envelope);
    validateChange(change, envelope);
    const reference = change.aggregate.workReference;
    this.database.exec("BEGIN IMMEDIATE;");
    try {
      const receipt = this.receipt(reference, envelope.causationId);
      if (receipt !== null) {
        if (!sameReceipt(receipt, envelope)) throw new PlanningIdempotencyConflictError();
        const replayed = this.rehydrate(reference, receipt.committed_revision);
        if (replayed === null) throw corrupted("Receipt references an absent Planning result.");
        this.database.exec("COMMIT;");
        return Object.freeze({
          ...replayed,
          status: "REPLAYED" as const,
          eventIds: Object.freeze(this.eventIdsForRevision(reference, receipt.committed_revision)),
          committedAt: new Date(receipt.committed_at_epoch_ms),
        });
      }

      const root = this.root(reference);
      const actualRevision = root?.revision ?? 0;
      if (actualRevision !== expectedRevision) {
        throw new PlanningPersistenceConflictError(expectedRevision, actualRevision);
      }
      const previous = root === null ? null : this.rehydrate(reference);
      assertChangeExtendsCanonical(previous, change);
      const committedAt = this.now();
      const committedRevision = actualRevision + 1;
      const firstSequence = (previous?.lastEventSequence ?? 0) + 1;
      const currentVersion = change.aggregate.currentVersion?.version.value ?? null;
      if (root === null) {
        this.database.prepare(
          `INSERT INTO planning_root(
            project_identity, work_identity, revision, current_version,
            created_at_epoch_ms, updated_at_epoch_ms
          ) VALUES (?, ?, ?, ?, ?, ?)`,
        ).run(reference.projectIdentity, reference.workIdentity, committedRevision,
          currentVersion, committedAt.getTime(), committedAt.getTime());
      } else {
        const updated = this.database.prepare(
          `UPDATE planning_root SET revision = ?, current_version = ?, updated_at_epoch_ms = ?
            WHERE project_identity = ? AND work_identity = ? AND revision = ?`,
        ).run(committedRevision, currentVersion, committedAt.getTime(),
          reference.projectIdentity, reference.workIdentity, expectedRevision);
        if (Number(updated.changes) !== 1) {
          throw new PlanningPersistenceConflictError(expectedRevision, actualRevision);
        }
      }

      const previousVersionCount = previous?.aggregate.versions.length ?? 0;
      for (const version of change.aggregate.versions.slice(previousVersionCount)) {
        const state = serializeRevision(version);
        this.database.prepare(
          `INSERT INTO planning_version(
            project_identity, work_identity, planning_version, state_schema_version, state_json,
            authority, source, causation_id, effective_at_epoch_ms, recorded_at_epoch_ms
          ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
        ).run(reference.projectIdentity, reference.workIdentity, version.version.value,
          canonicalJson(state), version.provenance.authority, version.provenance.source,
          version.provenance.businessCause, version.provenance.effectiveAt.getTime(),
          committedAt.getTime());
      }

      const eventIds: string[] = [];
      change.events.forEach((event, index) => {
        const ordinal = index + 1;
        const eventId = createHash("sha256").update(
          `${reference.key}:${committedRevision}:${ordinal}:${envelope.causationId}`,
        ).digest("hex");
        eventIds.push(eventId);
        this.database.prepare(
          `INSERT INTO planning_event(
            event_id, project_identity, work_identity, stream_sequence, aggregate_revision,
            event_ordinal, planning_version, event_type, event_schema_version, payload_json,
            causation_id, correlation_id, authority, source, effective_at_epoch_ms,
            recorded_at_epoch_ms
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
        ).run(eventId, reference.projectIdentity, reference.workIdentity,
          firstSequence + index, committedRevision, ordinal, event.version.value, event.name,
          canonicalJson(serializeEventPayload(event)), envelope.causationId,
          envelope.correlationId, event.provenance.authority, event.provenance.source,
          event.provenance.effectiveAt.getTime(), committedAt.getTime());
      });

      this.beforeReceipt?.();
      const result = {
        revision: committedRevision,
        currentVersion,
        versionCount: change.aggregate.versions.length,
        eventIds,
      };
      this.database.prepare(
        `INSERT INTO planning_command_receipt(
          project_identity, work_identity, causation_id, correlation_id, command_type,
          fingerprint_algorithm, fingerprint_version, request_fingerprint, expected_revision,
          committed_revision, first_event_sequence, event_count, result_schema_version,
          result_json, committed_at_epoch_ms
        ) VALUES (?, ?, ?, ?, ?, 'SHA-256', ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      ).run(reference.projectIdentity, reference.workIdentity, envelope.causationId,
        envelope.correlationId, envelope.commandType, envelope.fingerprintVersion,
        envelope.requestFingerprint, expectedRevision, committedRevision, firstSequence,
        change.events.length, canonicalJson(result), committedAt.getTime());
      this.database.exec("COMMIT;");
      return Object.freeze({
        aggregate: change.aggregate,
        revision: committedRevision,
        lastEventSequence: firstSequence + change.events.length - 1,
        status: "APPLIED" as const,
        eventIds: Object.freeze(eventIds),
        committedAt: new Date(committedAt.getTime()),
      });
    } catch (error) {
      try { this.database.exec("ROLLBACK;"); } catch { /* preserve primary failure */ }
      throw translatePersistenceError(error);
    }
  }

  private assertCanonicalIntegrity(): void {
    const roots = this.database.prepare(
      "SELECT project_identity, work_identity FROM planning_root ORDER BY project_identity, work_identity",
    ).all() as Array<{ project_identity: string; work_identity: string }>;
    for (const row of roots) this.load(WorkReference.of(row.project_identity, row.work_identity));

    const orphan = this.database.prepare(
      `SELECT 1 FROM planning_event event
        LEFT JOIN planning_command_receipt receipt
          ON receipt.project_identity = event.project_identity
         AND receipt.work_identity = event.work_identity
         AND receipt.causation_id = event.causation_id
       WHERE receipt.causation_id IS NULL
          OR receipt.committed_revision <> event.aggregate_revision
          OR receipt.first_event_sequence <> (
            SELECT MIN(first_event.stream_sequence) FROM planning_event first_event
             WHERE first_event.project_identity = event.project_identity
               AND first_event.work_identity = event.work_identity
               AND first_event.aggregate_revision = event.aggregate_revision
          )
          OR receipt.event_count <> (
            SELECT COUNT(*) FROM planning_event grouped
             WHERE grouped.project_identity = event.project_identity
               AND grouped.work_identity = event.work_identity
               AND grouped.aggregate_revision = event.aggregate_revision
          ) LIMIT 1`,
    ).get();
    if (orphan !== undefined) throw corrupted("Event and receipt history are inconsistent.");

    const receipts = this.database.prepare(
      `SELECT project_identity, work_identity, causation_id, command_type, fingerprint_version,
              request_fingerprint, expected_revision, committed_revision,
              first_event_sequence, event_count, result_json, committed_at_epoch_ms
         FROM planning_command_receipt
        ORDER BY project_identity, work_identity, committed_revision`,
    ).all() as IntegrityReceiptRow[];
    for (const receipt of receipts) this.assertReceiptIntegrity(receipt);
  }

  private assertReceiptIntegrity(receipt: IntegrityReceiptRow): void {
    const reference = WorkReference.of(receipt.project_identity, receipt.work_identity);
    const events = this.eventRows(reference).filter(
      (event) => event.aggregate_revision === receipt.committed_revision,
    );
    const replayed = this.rehydrate(reference, receipt.committed_revision);
    const root = events.find(isRootEvent);
    const expectedType = root?.event_type === "PlanningEstablished"
      ? "ESTABLISH_PLANNING"
      : root?.event_type === "PlanningRevised" ? "REVISE_PLANNING"
      : root?.event_type === "PlanningWithdrawn" ? "WITHDRAW_PLANNING" : null;
    const eventIds = events.map((event) => event.event_id);
    const expectedResult = canonicalJson({
      revision: receipt.committed_revision,
      currentVersion: replayed?.aggregate.currentVersion?.version.value ?? null,
      versionCount: replayed?.aggregate.versions.length ?? 0,
      eventIds,
    });
    if (replayed === null || expectedType !== receipt.command_type
      || receipt.expected_revision !== receipt.committed_revision - 1
      || receipt.first_event_sequence !== events[0]?.stream_sequence
      || receipt.event_count !== events.length
      || events.some((event) => event.causation_id !== receipt.causation_id)
      || receipt.result_json !== expectedResult) {
      throw corrupted("Planning receipt does not prove its exact committed result.");
    }
  }

  private root(reference: WorkReference): RootRow | null {
    return (this.database.prepare(
      `SELECT revision, current_version, created_at_epoch_ms, updated_at_epoch_ms
         FROM planning_root WHERE project_identity = ? AND work_identity = ?`,
    ).get(reference.projectIdentity, reference.workIdentity) as RootRow | undefined) ?? null;
  }

  private versionRows(reference: WorkReference): Array<{
    planning_version: number;
    state_json: string;
    authority: string;
    source: string;
    causation_id: string;
    effective_at_epoch_ms: number;
  }> {
    return this.database.prepare(
      `SELECT planning_version, state_json, authority, source, causation_id,
              effective_at_epoch_ms FROM planning_version
        WHERE project_identity = ? AND work_identity = ? ORDER BY planning_version`,
    ).all(reference.projectIdentity, reference.workIdentity) as ReturnType<
      PlanningSQLiteRepository["versionRows"]
    >;
  }

  private eventRows(reference: WorkReference): EventRow[] {
    return this.database.prepare(
      `SELECT event_id, stream_sequence, aggregate_revision, event_ordinal, planning_version,
              event_type, payload_json, causation_id, correlation_id, authority, source,
              effective_at_epoch_ms, recorded_at_epoch_ms
         FROM planning_event WHERE project_identity = ? AND work_identity = ?
        ORDER BY stream_sequence`,
    ).all(reference.projectIdentity, reference.workIdentity) as EventRow[];
  }

  private receipt(reference: WorkReference, causationId: string): ReceiptRow | null {
    return (this.database.prepare(
      `SELECT command_type, fingerprint_version, request_fingerprint, committed_revision,
              first_event_sequence, event_count, result_json, committed_at_epoch_ms
         FROM planning_command_receipt
        WHERE project_identity = ? AND work_identity = ? AND causation_id = ?`,
    ).get(reference.projectIdentity, reference.workIdentity, causationId) as ReceiptRow | undefined)
      ?? null;
  }

  private eventIdsForRevision(reference: WorkReference, revision: number): string[] {
    return (this.database.prepare(
      `SELECT event_id FROM planning_event
        WHERE project_identity = ? AND work_identity = ? AND aggregate_revision = ?
        ORDER BY event_ordinal`,
    ).all(reference.projectIdentity, reference.workIdentity, revision) as Array<{
      event_id: string;
    }>).map((row) => row.event_id);
  }
}

export function createPlanningRequestFingerprint(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
}

function validateEnvelope(envelope: PlanningCommandEnvelope): void {
  if (envelope.causationId.length === 0 || envelope.correlationId.length === 0
    || !/^[0-9a-f]{64}$/u.test(envelope.requestFingerprint)
    || !Number.isSafeInteger(envelope.fingerprintVersion) || envelope.fingerprintVersion <= 0
    || envelope.provenance.businessCause !== envelope.causationId) {
    throw new PlanningIdempotencyConflictError();
  }
}

function validateChange(change: PendingPlanningChange, envelope: PlanningCommandEnvelope): void {
  if (change.events.length === 0) throw corrupted("A persisted change must contain events.");
  const rootEvents = change.events.filter((event) => isRootEventType(event.name));
  if (rootEvents.length !== 1) throw corrupted("A commit must contain exactly one root Planning fact.");
  const expectedRoot: PlanningDomainEvent["name"] = envelope.commandType === "ESTABLISH_PLANNING"
    ? "PlanningEstablished"
    : envelope.commandType === "REVISE_PLANNING" ? "PlanningRevised" : "PlanningWithdrawn";
  if (rootEvents[0]?.name !== expectedRoot) throw corrupted("Command and root event differ.");
  for (const event of change.events) {
    if (!event.workReference.equals(change.aggregate.workReference)
      || event.causality.value !== envelope.causationId
      || !event.provenance.equals(envelope.provenance)) {
      throw corrupted("Event identity, causality or provenance differs from its envelope.");
    }
  }
}

function assertChangeExtendsCanonical(
  previous: PersistedPlanning | null,
  change: PendingPlanningChange,
): void {
  const before = previous?.aggregate.versions ?? [];
  const after = change.aggregate.versions;
  if (after.length < before.length || after.length > before.length + 1) {
    throw corrupted("A commit must preserve history and append at most one Planning version.");
  }
  for (let index = 0; index < before.length; index += 1) {
    if (canonicalJson(serializeRevision(before[index]!))
      !== canonicalJson(serializeRevision(after[index]!))) {
      throw corrupted("An accepted Planning version was rewritten.");
    }
  }
  const root = change.events.find((event) => isRootEventType(event.name))!;
  if (root.name === "PlanningWithdrawn") {
    if (after.length !== before.length || change.aggregate.currentVersion !== null) {
      throw corrupted("Withdrawal must preserve all versions and clear only applicability.");
    }
  } else if (after.length !== before.length + 1 || change.aggregate.currentVersion === null) {
    throw corrupted("Establishment or revision must append exactly one current version.");
  }
}

function sameReceipt(row: ReceiptRow, envelope: PlanningCommandEnvelope): boolean {
  return row.command_type === envelope.commandType
    && row.fingerprint_version === envelope.fingerprintVersion
    && row.request_fingerprint === envelope.requestFingerprint;
}

function isRootEvent(row: EventRow): boolean {
  return isRootEventType(row.event_type);
}

function isRootEventType(name: PlanningDomainEvent["name"]): boolean {
  return name === "PlanningEstablished" || name === "PlanningRevised" || name === "PlanningWithdrawn";
}

function provenanceFromRow(row: EventRow): PlanningProvenance {
  return deserializeProvenance({
    authority: row.authority,
    source: row.source,
    businessCause: row.causation_id,
    effectiveAtEpochMs: row.effective_at_epoch_ms,
  });
}

function toHistoryEvent(row: EventRow): PlanningHistoryEvent {
  return Object.freeze({
    eventId: row.event_id,
    streamSequence: row.stream_sequence,
    aggregateRevision: row.aggregate_revision,
    eventOrdinal: row.event_ordinal,
    eventType: row.event_type,
    payload: parseJson(row.payload_json, "Planning event"),
    causationId: row.causation_id,
    correlationId: row.correlation_id,
    provenance: provenanceFromRow(row),
    recordedAt: new Date(row.recorded_at_epoch_ms),
  });
}

function assertStoredEventsEqualAccepted(
  rows: readonly EventRow[],
  accepted: readonly PlanningDomainEvent[],
): void {
  if (rows.length !== accepted.length) {
    throw corrupted("Stored Planning event count differs from the accepted business facts.");
  }
  rows.forEach((row, index) => {
    const event = accepted[index];
    if (event === undefined || row.event_type !== event.name
      || row.planning_version !== event.version.value
      || row.causation_id !== event.causality.value
      || row.authority !== event.provenance.authority
      || row.source !== event.provenance.source
      || row.effective_at_epoch_ms !== event.provenance.effectiveAt.getTime()
      || row.payload_json !== canonicalJson(serializeEventPayload(event))) {
      throw corrupted("Stored Planning facts diverge from deterministic Authority replay.");
    }
  });
}

function parseJson<T = unknown>(value: string, label: string): T {
  try { return JSON.parse(value) as T; }
  catch { throw corrupted(`${label} JSON is invalid.`); }
}

function corrupted(message: string): PlanningHistoryCorruptedError {
  return new PlanningHistoryCorruptedError(message);
}

function translatePersistenceError(error: unknown): unknown {
  if (error instanceof PlanningPersistenceError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (/database is (?:locked|busy)|SQLITE_BUSY/iu.test(message)) {
    return new PlanningPersistenceError(
      "PLANNING_PERSISTENCE_UNAVAILABLE",
      "The Planning database remained locked beyond its timeout.",
    );
  }
  if (/constraint failed|FOREIGN KEY|PLANNING_/u.test(message)) {
    return new PlanningPersistenceError(
      "PLANNING_PERSISTENCE_CONSTRAINT_VIOLATION",
      "A durable Planning constraint was violated.",
    );
  }
  return error;
}
