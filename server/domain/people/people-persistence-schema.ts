import { DatabaseSync } from "node:sqlite";

export const PEOPLE_PERSISTENCE_SCHEMA_VERSION = 1;

const CREATE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS people_schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS people_business_person (
  business_person_id TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  recognized_at TEXT NOT NULL,
  provenance_json TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS people_work_people (
  work_reference TEXT PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 0),
  lifecycle_status TEXT NOT NULL,
  provenance_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS people_work_assignment (
  work_assignment_id TEXT PRIMARY KEY NOT NULL,
  work_reference TEXT NOT NULL,
  business_person_id TEXT NOT NULL,
  status TEXT NOT NULL,
  effective_from TEXT NOT NULL,
  effective_to TEXT,
  provenance_json TEXT NOT NULL,
  FOREIGN KEY (work_reference) REFERENCES people_work_people(work_reference),
  FOREIGN KEY (business_person_id) REFERENCES people_business_person(business_person_id),
  UNIQUE (work_assignment_id)
);

CREATE TABLE IF NOT EXISTS people_role_assignment (
  role_assignment_id TEXT PRIMARY KEY NOT NULL,
  work_assignment_id TEXT NOT NULL,
  business_role TEXT NOT NULL,
  status TEXT NOT NULL,
  effective_from TEXT NOT NULL,
  effective_to TEXT,
  provenance_json TEXT NOT NULL,
  FOREIGN KEY (work_assignment_id) REFERENCES people_work_assignment(work_assignment_id),
  UNIQUE (work_assignment_id, business_role, effective_from)
);

CREATE TABLE IF NOT EXISTS people_event_history (
  event_id TEXT PRIMARY KEY NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  sequence INTEGER NOT NULL CHECK (sequence > 0),
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  causation_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 0),
  occurred_at TEXT NOT NULL,
  UNIQUE (aggregate_type, aggregate_id, sequence),
  UNIQUE (causation_id)
);

CREATE TABLE IF NOT EXISTS people_aggregate_snapshot (
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 0),
  payload_json TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  PRIMARY KEY (aggregate_type, aggregate_id)
);

CREATE TABLE IF NOT EXISTS people_idempotency_key (
  causation_id TEXT PRIMARY KEY NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_people_assignment_work
  ON people_work_assignment(work_reference);
CREATE INDEX IF NOT EXISTS idx_people_assignment_person
  ON people_work_assignment(business_person_id);
CREATE INDEX IF NOT EXISTS idx_people_role_assignment_assignment
  ON people_role_assignment(work_assignment_id);
CREATE INDEX IF NOT EXISTS idx_people_role_assignment_role
  ON people_role_assignment(business_role);
CREATE INDEX IF NOT EXISTS idx_people_event_history_stream
  ON people_event_history(aggregate_type, aggregate_id, sequence);
CREATE UNIQUE INDEX IF NOT EXISTS uq_people_active_owner
  ON people_role_assignment(work_assignment_id)
  WHERE business_role = 'OWNER' AND status = 'ACTIVE' AND effective_to IS NULL;
`;

const DROP_SCHEMA_SQL = `
DROP TABLE IF EXISTS people_idempotency_key;
DROP TABLE IF EXISTS people_event_history;
DROP TABLE IF EXISTS people_aggregate_snapshot;
DROP TABLE IF EXISTS people_role_assignment;
DROP TABLE IF EXISTS people_work_assignment;
DROP TABLE IF EXISTS people_work_people;
DROP TABLE IF EXISTS people_business_person;
DROP TABLE IF EXISTS people_schema_migrations;
`;

export interface PeoplePersistenceSchemaOptions {
  readonly now?: () => string;
}

export class PeoplePersistenceSchema {
  private readonly now: () => string;

  constructor(
    private readonly database: DatabaseSync,
    options: PeoplePersistenceSchemaOptions = {},
  ) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  migrate(): number {
    this.database.exec("PRAGMA foreign_keys = ON;");
    this.database.exec("BEGIN IMMEDIATE;");
    try {
      this.database.exec(CREATE_SCHEMA_SQL);
      const version = this.database
        .prepare("SELECT version FROM people_schema_migrations ORDER BY version DESC LIMIT 1")
        .get() as { version?: number } | undefined;
      if ((version?.version ?? 0) < PEOPLE_PERSISTENCE_SCHEMA_VERSION) {
        this.database
          .prepare("INSERT INTO people_schema_migrations(version, applied_at) VALUES (?, ?)")
          .run(PEOPLE_PERSISTENCE_SCHEMA_VERSION, this.now());
      }
      this.database.exec("COMMIT;");
      return PEOPLE_PERSISTENCE_SCHEMA_VERSION;
    } catch (error) {
      this.database.exec("ROLLBACK;");
      throw error;
    }
  }

  rollback(): void {
    this.database.exec("BEGIN IMMEDIATE;");
    try {
      this.database.exec(DROP_SCHEMA_SQL);
      this.database.exec("COMMIT;");
    } catch (error) {
      this.database.exec("ROLLBACK;");
      throw error;
    }
  }

  version(): number {
    const table = this.database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'people_schema_migrations'")
      .get();
    if (table === undefined) return 0;
    const row = this.database
      .prepare("SELECT version FROM people_schema_migrations ORDER BY version DESC LIMIT 1")
      .get() as { version?: number } | undefined;
    return row?.version ?? 0;
  }
}
