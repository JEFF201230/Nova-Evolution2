import type { DatabaseSync } from "node:sqlite";
import type { PeopleAggregateType } from "./people-persistence-ports.js";

export interface PeopleHistoryEvent {
  readonly eventId: string;
  readonly aggregateType: PeopleAggregateType;
  readonly aggregateId: string;
  readonly sequence: number;
  readonly eventType: string;
  readonly payload: unknown;
  readonly causationId: string;
  readonly correlationId: string;
  readonly revision: number;
  readonly occurredAt: string;
}

export interface PeopleAggregateSnapshotRecord {
  readonly aggregateType: PeopleAggregateType;
  readonly aggregateId: string;
  readonly revision: number;
  readonly payload: unknown;
  readonly capturedAt: string;
}

export class PeopleEventHistoryStore {
  constructor(
    private readonly database: DatabaseSync,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  append(event: PeopleHistoryEvent): void {
    const prior = this.database.prepare(
      "SELECT event_id, aggregate_type, aggregate_id, sequence, event_type, payload_json, causation_id, correlation_id, revision, occurred_at FROM people_event_history WHERE causation_id = ?",
    ).get(event.causationId) as Record<string, unknown> | undefined;
    if (prior) {
      if (
        String(prior.aggregate_id) !== event.aggregateId
        || String(prior.event_type) !== event.eventType
        || String(prior.payload_json) !== JSON.stringify(event.payload)
      ) {
        throw new Error("PEOPLE_HISTORY_CAUSATION_CONFLICT");
      }
      return;
    }
    const previous = this.database.prepare(
      "SELECT MAX(sequence) AS sequence FROM people_event_history WHERE aggregate_type = ? AND aggregate_id = ?",
    ).get(event.aggregateType, event.aggregateId) as { sequence?: number | null } | undefined;
    const expected = (previous?.sequence ?? 0) + 1;
    if (event.sequence !== expected) {
      throw new Error(`PEOPLE_HISTORY_SEQUENCE_CONFLICT:${expected}:${event.sequence}`);
    }
    this.database.prepare(
      `INSERT INTO people_event_history
        (event_id, aggregate_type, aggregate_id, sequence, event_type, payload_json, causation_id, correlation_id, revision, occurred_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      event.eventId,
      event.aggregateType,
      event.aggregateId,
      event.sequence,
      event.eventType,
      JSON.stringify(event.payload),
      event.causationId,
      event.correlationId,
      event.revision,
      event.occurredAt,
    );
  }

  read(aggregateType: PeopleAggregateType, aggregateId: string): readonly PeopleHistoryEvent[] {
    return this.database.prepare(
      `SELECT event_id, aggregate_type, aggregate_id, sequence, event_type, payload_json,
              causation_id, correlation_id, revision, occurred_at
         FROM people_event_history
        WHERE aggregate_type = ? AND aggregate_id = ?
        ORDER BY sequence`,
    ).all(aggregateType, aggregateId).map((row) => {
      const value = row as Record<string, unknown>;
      return {
        eventId: String(value.event_id),
        aggregateType: value.aggregate_type as PeopleAggregateType,
        aggregateId: String(value.aggregate_id),
        sequence: Number(value.sequence),
        eventType: String(value.event_type),
        payload: JSON.parse(String(value.payload_json)),
        causationId: String(value.causation_id),
        correlationId: String(value.correlation_id),
        revision: Number(value.revision),
        occurredAt: String(value.occurred_at),
      } satisfies PeopleHistoryEvent;
    });
  }

  saveSnapshot(snapshot: PeopleAggregateSnapshotRecord): void {
    this.database.prepare(
      `INSERT INTO people_aggregate_snapshot(aggregate_type, aggregate_id, revision, payload_json, captured_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(aggregate_type, aggregate_id) DO UPDATE SET
         revision = excluded.revision,
         payload_json = excluded.payload_json,
         captured_at = excluded.captured_at
       WHERE people_aggregate_snapshot.revision <= excluded.revision`,
    ).run(
      snapshot.aggregateType,
      snapshot.aggregateId,
      snapshot.revision,
      JSON.stringify(snapshot.payload),
      snapshot.capturedAt,
    );
  }

  loadSnapshot(aggregateType: PeopleAggregateType, aggregateId: string): PeopleAggregateSnapshotRecord | null {
    const row = this.database.prepare(
      "SELECT aggregate_type, aggregate_id, revision, payload_json, captured_at FROM people_aggregate_snapshot WHERE aggregate_type = ? AND aggregate_id = ?",
    ).get(aggregateType, aggregateId) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      aggregateType: row.aggregate_type as PeopleAggregateType,
      aggregateId: String(row.aggregate_id),
      revision: Number(row.revision),
      payload: JSON.parse(String(row.payload_json)),
      capturedAt: String(row.captured_at),
    };
  }

  recover<T>(
    aggregateType: PeopleAggregateType,
    aggregateId: string,
    initial: T,
    reducer: (state: T, event: PeopleHistoryEvent) => T,
  ): T {
    const snapshot = this.loadSnapshot(aggregateType, aggregateId);
    let state = (snapshot?.payload as T | undefined) ?? initial;
    const fromSequence = snapshot?.revision ?? 0;
    for (const event of this.read(aggregateType, aggregateId)) {
      if (event.sequence <= fromSequence) continue;
      state = reducer(state, event);
    }
    return state;
  }

  currentTime(): string {
    return this.now();
  }
}
