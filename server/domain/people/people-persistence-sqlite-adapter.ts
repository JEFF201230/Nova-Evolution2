import type { DatabaseSync } from "node:sqlite";
import { PeopleDomainError } from "./people.errors.js";
import { PeoplePersistenceSchema } from "./people-persistence-schema.js";

export type PeoplePersistenceErrorCode =
  | "CONCURRENT_PEOPLE_CHANGE"
  | "IDEMPOTENCY_CONFLICT"
  | "DOMAIN_CONSTRAINT_VIOLATION"
  | "PERSISTENCE_UNAVAILABLE"
  | "HISTORY_CORRUPTED"
  | "SCHEMA_VERSION_UNSUPPORTED";

export class PeoplePersistenceError extends Error {
  constructor(readonly code: PeoplePersistenceErrorCode, message: string) {
    super(`${code}: ${message}`);
    this.name = "PeoplePersistenceError";
  }
}

export class PeoplePersistenceConflictError extends PeoplePersistenceError {
  constructor(readonly expectedRevision: number, readonly actualRevision: number) {
    super(
      "CONCURRENT_PEOPLE_CHANGE",
      `Expected revision ${expectedRevision}, actual revision ${actualRevision}.`,
    );
    this.name = "PeoplePersistenceConflictError";
  }
}

export class PeopleIdempotencyConflictError extends PeoplePersistenceError {
  constructor(message = "The causation id is already bound to a different PEOPLE intention.") {
    super("IDEMPOTENCY_CONFLICT", message);
    this.name = "PeopleIdempotencyConflictError";
  }
}

export interface PeopleSQLiteOptions {
  readonly now?: () => Date;
  readonly beforeReceipt?: () => void;
}

export class PeopleSQLiteTransactionManager {
  constructor(private readonly database: DatabaseSync) {}

  run<T>(operation: () => T): T {
    this.database.exec("BEGIN IMMEDIATE;");
    try {
      const result = operation();
      this.database.exec("COMMIT;");
      return result;
    } catch (error) {
      try {
        this.database.exec("ROLLBACK;");
      } catch {
        // Preserve the primary failure.
      }
      throw translateSQLiteError(error);
    }
  }
}

export function initializePeopleSQLite(database: DatabaseSync, now?: () => Date): void {
  new PeoplePersistenceSchema(database, { now }).migrate();
}

export function translateSQLiteError(error: unknown): unknown {
  if (error instanceof PeoplePersistenceError || error instanceof PeopleDomainError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("people_role_period.project_identity, people_role_period.work_identity")) {
    return new PeopleDomainError("OWNER_ALREADY_DEFINED", "A Work can have at most one active Owner.");
  }
  if (message.includes("PEOPLE_ASSIGNMENT_OVERLAP") || message.includes("PEOPLE_ROLE_PERIOD_OVERLAP")
    || message.includes("PEOPLE_ROLE_PERIOD_OUTSIDE_ASSIGNMENT")
    || message.includes("people_work_assignment.project_identity, people_work_assignment.work_identity, people_work_assignment.business_person_id")) {
    return new PeopleDomainError("ASSIGNMENT_CONFLICT", "A durable PEOPLE assignment or role period constraint was violated.");
  }
  if (message.includes("database is locked") || message.includes("database is busy") || message.includes("SQLITE_BUSY")) {
    return new PeoplePersistenceError("PERSISTENCE_UNAVAILABLE", "The PEOPLE database remained locked beyond its timeout.");
  }
  if (message.includes("SCHEMA_VERSION_UNSUPPORTED")) {
    return new PeoplePersistenceError("SCHEMA_VERSION_UNSUPPORTED", "The PEOPLE schema version is unsupported.");
  }
  if (message.includes("constraint failed") || message.includes("FOREIGN KEY") || message.includes("PEOPLE_")) {
    return new PeoplePersistenceError("DOMAIN_CONSTRAINT_VIOLATION", "A durable PEOPLE constraint was violated.");
  }
  return error;
}
