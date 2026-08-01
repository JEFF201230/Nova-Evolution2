import type { DatabaseSync } from "node:sqlite";
import {
  PEOPLE_PERSISTENCE_SCHEMA_VERSION,
  PeoplePersistenceSchema,
} from "./people-persistence-schema.js";
import type {
  PeopleAggregateRepository,
  PeopleAggregateSnapshot,
  PeopleAggregateType,
  PeoplePersistenceContext,
  PeoplePersistencePorts,
  PeopleStoredSnapshot,
  PeopleTransaction,
} from "./people-persistence-ports.js";

export class PeoplePersistenceConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PeoplePersistenceConflictError";
  }
}

export class PeopleIdempotencyConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PeopleIdempotencyConflictError";
  }
}

export class PeoplePersistenceTransactionManager implements PeopleTransaction {
  constructor(private readonly database: DatabaseSync) {}

  run<T>(operation: () => T): T {
    this.database.exec("BEGIN IMMEDIATE;");
    try {
      const result = operation();
      this.database.exec("COMMIT;");
      return result;
    } catch (error) {
      this.database.exec("ROLLBACK;");
      throw error;
    }
  }
}

export class PeopleSQLiteAggregateRepository implements PeopleAggregateRepository {
  constructor(
    private readonly database: DatabaseSync,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  load(
    aggregateType: PeopleAggregateType,
    aggregateId: string,
  ): PeopleStoredSnapshot | null {
    if (aggregateType === "BUSINESS_PERSON") {
      const row = this.database.prepare(
        "SELECT business_person_id AS aggregate_id, revision, status, recognized_at, provenance_json, updated_at FROM people_business_person WHERE business_person_id = ?",
      ).get(aggregateId) as Record<string, unknown> | undefined;
      if (!row) return null;
      return {
        snapshot: {
          aggregateType,
          aggregateId: String(row.aggregate_id),
          revision: Number(row.revision),
          payload: {
            status: row.status,
            recognizedAt: row.recognized_at,
            provenance: JSON.parse(String(row.provenance_json)),
          },
        },
        updatedAt: String(row.updated_at),
      };
    }
    const row = this.database.prepare(
      "SELECT work_reference AS aggregate_id, revision, lifecycle_status, provenance_json, updated_at FROM people_work_people WHERE work_reference = ?",
    ).get(aggregateId) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      snapshot: {
        aggregateType,
        aggregateId: String(row.aggregate_id),
        revision: Number(row.revision),
        payload: {
          lifecycleStatus: row.lifecycle_status,
          provenance: JSON.parse(String(row.provenance_json)),
        },
      },
      updatedAt: String(row.updated_at),
    };
  }

  save(
    expectedRevision: number,
    snapshot: PeopleAggregateSnapshot,
    context: PeoplePersistenceContext,
  ): PeopleStoredSnapshot {
    const prior = this.database.prepare(
      "SELECT aggregate_type, aggregate_id, request_hash, result_json FROM people_idempotency_key WHERE causation_id = ?",
    ).get(context.causationId) as Record<string, unknown> | undefined;
    if (prior) {
      if (String(prior.request_hash) !== context.requestHash) {
        throw new PeopleIdempotencyConflictError("Causation id was reused with a different request hash.");
      }
      const stored = this.load(
        prior.aggregate_type as PeopleAggregateType,
        String(prior.aggregate_id),
      );
      if (!stored) throw new PeopleIdempotencyConflictError("Idempotent result is missing its aggregate snapshot.");
      return stored;
    }
    const nextRevision = expectedRevision + 1;
    const timestamp = this.now();
    const provenanceJson = JSON.stringify(
      (snapshot.payload as { provenance?: unknown }).provenance ?? {},
    );
    if (snapshot.aggregateType === "BUSINESS_PERSON") {
      const result = this.database.prepare(
        `INSERT INTO people_business_person
          (business_person_id, status, recognized_at, provenance_json, revision, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(business_person_id) DO UPDATE SET
           status = excluded.status,
           recognized_at = excluded.recognized_at,
           provenance_json = excluded.provenance_json,
           revision = excluded.revision,
           updated_at = excluded.updated_at
         WHERE people_business_person.revision = ?`,
      ).run(
        snapshot.aggregateId,
        String((snapshot.payload as { status?: unknown }).status ?? "ACTIVE"),
        String((snapshot.payload as { recognizedAt?: unknown }).recognizedAt ?? timestamp),
        provenanceJson,
        nextRevision,
        timestamp,
        timestamp,
        expectedRevision,
      );
      if (Number(result.changes) === 0) {
        throw new PeoplePersistenceConflictError("Business Person revision conflict.");
      }
    } else {
      const result = this.database.prepare(
        `INSERT INTO people_work_people
          (work_reference, revision, lifecycle_status, provenance_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(work_reference) DO UPDATE SET
           revision = excluded.revision,
           lifecycle_status = excluded.lifecycle_status,
           provenance_json = excluded.provenance_json,
           updated_at = excluded.updated_at
         WHERE people_work_people.revision = ?`,
      ).run(
        snapshot.aggregateId,
        nextRevision,
        String((snapshot.payload as { lifecycleStatus?: unknown }).lifecycleStatus ?? "ACTIVE"),
        provenanceJson,
        timestamp,
        timestamp,
        expectedRevision,
      );
      if (Number(result.changes) === 0) {
        throw new PeoplePersistenceConflictError("Work People revision conflict.");
      }
    }
    this.database.prepare(
      `INSERT INTO people_idempotency_key
        (causation_id, aggregate_type, aggregate_id, request_hash, result_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      context.causationId,
      snapshot.aggregateType,
      snapshot.aggregateId,
      context.requestHash,
      JSON.stringify({ revision: nextRevision }),
      timestamp,
    );
    return {
      snapshot: { ...snapshot, revision: nextRevision },
      updatedAt: timestamp,
    };
  }
}

export function createPeopleSQLitePersistence(
  database: DatabaseSync,
  now?: () => string,
): PeoplePersistencePorts {
  const schema = new PeoplePersistenceSchema(database, { now });
  if (schema.migrate() !== PEOPLE_PERSISTENCE_SCHEMA_VERSION) {
    throw new Error("PEOPLE persistence schema version mismatch.");
  }
  return {
    transaction: new PeoplePersistenceTransactionManager(database),
    aggregates: new PeopleSQLiteAggregateRepository(database, now),
  };
}
