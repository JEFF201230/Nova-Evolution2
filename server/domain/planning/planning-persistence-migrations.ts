import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export const PLANNING_PERSISTENCE_SCHEMA_VERSION = 1;

export type PlanningMigrationStage =
  | "before-sql"
  | "after-sql"
  | "after-verification"
  | "after-record";

export interface PlanningMigrationOptions {
  readonly now?: () => Date;
  readonly applicationVersion?: string;
  readonly faultInjector?: (stage: PlanningMigrationStage, version: number) => void;
}

export interface PlanningSchemaMigration {
  readonly version: number;
  readonly name: string;
  readonly sql: string;
  readonly checksumSha256: string;
  readonly verify: (database: DatabaseSync) => void;
}

export class PlanningSchemaMigrationError extends Error {
  readonly code = "PLANNING_SCHEMA_MIGRATION_FAILED";
  constructor(message: string) {
    super(`PLANNING_SCHEMA_MIGRATION_FAILED: ${message}`);
    this.name = "PlanningSchemaMigrationError";
  }
}

const CREATE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS planning_schema_migration (
  version INTEGER PRIMARY KEY CHECK (version > 0),
  name TEXT NOT NULL UNIQUE CHECK (length(name) > 0),
  checksum_sha256 TEXT NOT NULL CHECK (length(checksum_sha256) = 64),
  applied_at_epoch_ms INTEGER NOT NULL,
  application_version TEXT NOT NULL CHECK (length(application_version) > 0)
) STRICT;

CREATE TABLE IF NOT EXISTS planning_root (
  project_identity TEXT NOT NULL CHECK (length(project_identity) > 0),
  work_identity TEXT NOT NULL CHECK (length(work_identity) > 0),
  revision INTEGER NOT NULL CHECK (revision >= 1),
  current_version INTEGER CHECK (current_version IS NULL OR current_version > 0),
  created_at_epoch_ms INTEGER NOT NULL,
  updated_at_epoch_ms INTEGER NOT NULL,
  PRIMARY KEY (project_identity, work_identity)
) STRICT;

CREATE TABLE IF NOT EXISTS planning_version (
  project_identity TEXT NOT NULL,
  work_identity TEXT NOT NULL,
  planning_version INTEGER NOT NULL CHECK (planning_version > 0),
  state_schema_version INTEGER NOT NULL CHECK (state_schema_version = 1),
  state_json TEXT NOT NULL CHECK (json_valid(state_json)),
  authority TEXT NOT NULL CHECK (length(authority) > 0),
  source TEXT NOT NULL CHECK (length(source) > 0),
  causation_id TEXT NOT NULL CHECK (length(causation_id) > 0),
  effective_at_epoch_ms INTEGER NOT NULL,
  recorded_at_epoch_ms INTEGER NOT NULL,
  PRIMARY KEY (project_identity, work_identity, planning_version),
  UNIQUE (project_identity, work_identity, causation_id),
  FOREIGN KEY (project_identity, work_identity)
    REFERENCES planning_root(project_identity, work_identity) DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE IF NOT EXISTS planning_event (
  event_id TEXT PRIMARY KEY CHECK (length(event_id) = 64),
  project_identity TEXT NOT NULL,
  work_identity TEXT NOT NULL,
  stream_sequence INTEGER NOT NULL CHECK (stream_sequence >= 1),
  aggregate_revision INTEGER NOT NULL CHECK (aggregate_revision >= 1),
  event_ordinal INTEGER NOT NULL CHECK (event_ordinal >= 1),
  planning_version INTEGER NOT NULL CHECK (planning_version > 0),
  event_type TEXT NOT NULL CHECK (length(event_type) > 0),
  event_schema_version INTEGER NOT NULL CHECK (event_schema_version = 1),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  causation_id TEXT NOT NULL CHECK (length(causation_id) > 0),
  correlation_id TEXT NOT NULL CHECK (length(correlation_id) > 0),
  authority TEXT NOT NULL CHECK (length(authority) > 0),
  source TEXT NOT NULL CHECK (length(source) > 0),
  effective_at_epoch_ms INTEGER NOT NULL,
  recorded_at_epoch_ms INTEGER NOT NULL,
  UNIQUE (project_identity, work_identity, stream_sequence),
  UNIQUE (project_identity, work_identity, aggregate_revision, event_ordinal),
  FOREIGN KEY (project_identity, work_identity)
    REFERENCES planning_root(project_identity, work_identity) DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE IF NOT EXISTS planning_command_receipt (
  project_identity TEXT NOT NULL,
  work_identity TEXT NOT NULL,
  causation_id TEXT NOT NULL CHECK (length(causation_id) > 0),
  correlation_id TEXT NOT NULL CHECK (length(correlation_id) > 0),
  command_type TEXT NOT NULL CHECK (command_type IN (
    'ESTABLISH_PLANNING', 'REVISE_PLANNING', 'WITHDRAW_PLANNING'
  )),
  fingerprint_algorithm TEXT NOT NULL CHECK (fingerprint_algorithm = 'SHA-256'),
  fingerprint_version INTEGER NOT NULL CHECK (fingerprint_version >= 1),
  request_fingerprint TEXT NOT NULL CHECK (
    length(request_fingerprint) = 64 AND request_fingerprint NOT GLOB '*[^0-9a-f]*'
  ),
  expected_revision INTEGER NOT NULL CHECK (expected_revision >= 0),
  committed_revision INTEGER NOT NULL CHECK (committed_revision >= 1),
  first_event_sequence INTEGER NOT NULL CHECK (first_event_sequence >= 1),
  event_count INTEGER NOT NULL CHECK (event_count >= 1),
  result_schema_version INTEGER NOT NULL CHECK (result_schema_version = 1),
  result_json TEXT NOT NULL CHECK (json_valid(result_json)),
  committed_at_epoch_ms INTEGER NOT NULL,
  PRIMARY KEY (project_identity, work_identity, causation_id),
  FOREIGN KEY (project_identity, work_identity)
    REFERENCES planning_root(project_identity, work_identity) DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TRIGGER planning_root_monotone_revision
BEFORE UPDATE ON planning_root
WHEN NEW.project_identity <> OLD.project_identity
  OR NEW.work_identity <> OLD.work_identity
  OR NEW.created_at_epoch_ms <> OLD.created_at_epoch_ms
  OR NEW.revision <> OLD.revision + 1
BEGIN SELECT RAISE(ABORT, 'PLANNING_REVISION_NOT_MONOTONE'); END;

CREATE TRIGGER planning_root_no_delete
BEFORE DELETE ON planning_root BEGIN SELECT RAISE(ABORT, 'PLANNING_NO_PHYSICAL_DELETE'); END;
CREATE TRIGGER planning_version_no_update
BEFORE UPDATE ON planning_version BEGIN SELECT RAISE(ABORT, 'PLANNING_VERSION_APPEND_ONLY'); END;
CREATE TRIGGER planning_version_no_delete
BEFORE DELETE ON planning_version BEGIN SELECT RAISE(ABORT, 'PLANNING_VERSION_APPEND_ONLY'); END;
CREATE TRIGGER planning_event_no_update
BEFORE UPDATE ON planning_event BEGIN SELECT RAISE(ABORT, 'PLANNING_EVENT_APPEND_ONLY'); END;
CREATE TRIGGER planning_event_no_delete
BEFORE DELETE ON planning_event BEGIN SELECT RAISE(ABORT, 'PLANNING_EVENT_APPEND_ONLY'); END;
CREATE TRIGGER planning_receipt_no_update
BEFORE UPDATE ON planning_command_receipt BEGIN SELECT RAISE(ABORT, 'PLANNING_RECEIPT_IMMUTABLE'); END;
CREATE TRIGGER planning_receipt_no_delete
BEFORE DELETE ON planning_command_receipt BEGIN SELECT RAISE(ABORT, 'PLANNING_RECEIPT_IMMUTABLE'); END;
CREATE TRIGGER planning_migration_no_update
BEFORE UPDATE ON planning_schema_migration BEGIN SELECT RAISE(ABORT, 'PLANNING_MIGRATION_IMMUTABLE'); END;
CREATE TRIGGER planning_migration_no_delete
BEFORE DELETE ON planning_schema_migration BEGIN SELECT RAISE(ABORT, 'PLANNING_MIGRATION_IMMUTABLE'); END;
`;

const EXPECTED_OBJECTS = Object.freeze([
  "table:planning_command_receipt", "table:planning_event", "table:planning_root",
  "table:planning_schema_migration", "table:planning_version",
  "trigger:planning_event_no_delete", "trigger:planning_event_no_update",
  "trigger:planning_migration_no_delete", "trigger:planning_migration_no_update",
  "trigger:planning_receipt_no_delete", "trigger:planning_receipt_no_update",
  "trigger:planning_root_monotone_revision", "trigger:planning_root_no_delete",
  "trigger:planning_version_no_delete", "trigger:planning_version_no_update",
]);

export const PLANNING_PERSISTENCE_MIGRATIONS: readonly PlanningSchemaMigration[] = Object.freeze([
  Object.freeze({
    version: 1,
    name: "planning-canonical-v1",
    sql: CREATE_SCHEMA_SQL,
    checksumSha256: migrationChecksum(CREATE_SCHEMA_SQL),
    verify: (database: DatabaseSync): void => {
      const actual = planningObjects(database);
      if (JSON.stringify(actual) !== JSON.stringify(EXPECTED_OBJECTS)) {
        throw new PlanningSchemaMigrationError(
          `Canonical schema objects diverge: ${actual.join(", ")}.`,
        );
      }
    },
  }),
]);

export class PlanningPersistenceSchema {
  constructor(
    private readonly database: DatabaseSync,
    private readonly options: PlanningMigrationOptions = {},
  ) {}

  version(): number {
    return readPlanningSchemaVersion(this.database);
  }

  migrate(): number {
    return runPlanningMigrations(this.database, PLANNING_PERSISTENCE_MIGRATIONS, this.options);
  }
}

export function migrationChecksum(sql: string): string {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

export function runPlanningMigrations(
  database: DatabaseSync,
  migrations: readonly PlanningSchemaMigration[],
  options: PlanningMigrationOptions = {},
): number {
  configure(database);
  assertMigrationChain(migrations);
  const hasLedger = tableExists(database, "planning_schema_migration");
  if (!hasLedger) {
    const untracked = planningObjects(database);
    if (untracked.length > 0) {
      throw new PlanningSchemaMigrationError(
        `Untracked Planning schema objects were found: ${untracked.join(", ")}.`,
      );
    }
  } else {
    assertApplied(database, migrations);
  }
  let version = hasLedger ? readPlanningSchemaVersion(database) : 0;
  for (const migration of migrations) {
    if (migration.version <= version) continue;
    if (migration.version !== version + 1) {
      throw new PlanningSchemaMigrationError(`Migration ${version + 1} is missing.`);
    }
    database.exec("BEGIN IMMEDIATE;");
    try {
      options.faultInjector?.("before-sql", migration.version);
      database.exec(migration.sql);
      options.faultInjector?.("after-sql", migration.version);
      migration.verify(database);
      options.faultInjector?.("after-verification", migration.version);
      database.prepare(
        `INSERT INTO planning_schema_migration(
          version, name, checksum_sha256, applied_at_epoch_ms, application_version
        ) VALUES (?, ?, ?, ?, ?)`,
      ).run(
        migration.version,
        migration.name,
        migration.checksumSha256,
        (options.now ?? (() => new Date()))().getTime(),
        options.applicationVersion ?? "nova-planning-mvp",
      );
      options.faultInjector?.("after-record", migration.version);
      database.exec("COMMIT;");
      version = migration.version;
    } catch (error) {
      try { database.exec("ROLLBACK;"); } catch { /* preserve primary failure */ }
      throw error;
    }
  }
  verifyPlanningSQLiteIntegrity(database, migrations);
  return version;
}

export function verifyPlanningSQLiteIntegrity(
  database: DatabaseSync,
  migrations: readonly PlanningSchemaMigration[] = PLANNING_PERSISTENCE_MIGRATIONS,
): Readonly<{ schemaVersion: number; quickCheck: "ok"; foreignKeyViolations: 0 }> {
  assertMigrationChain(migrations);
  if (!tableExists(database, "planning_schema_migration")) {
    throw new PlanningSchemaMigrationError("The Planning migration ledger is absent.");
  }
  assertApplied(database, migrations);
  const version = readPlanningSchemaVersion(database);
  for (const migration of migrations) if (migration.version <= version) migration.verify(database);
  const rows = database.prepare("PRAGMA quick_check").all() as Record<string, unknown>[];
  if (rows.length !== 1 || String(Object.values(rows[0] ?? {})[0]) !== "ok") {
    throw new PlanningSchemaMigrationError("SQLite quick_check failed.");
  }
  const violations = database.prepare("PRAGMA foreign_key_check").all();
  if (violations.length > 0) {
    throw new PlanningSchemaMigrationError(
      `SQLite foreign_key_check found ${violations.length} violation(s).`,
    );
  }
  return { schemaVersion: version, quickCheck: "ok", foreignKeyViolations: 0 };
}

export function readPlanningSchemaVersion(database: DatabaseSync): number {
  if (!tableExists(database, "planning_schema_migration")) return 0;
  const row = database.prepare(
    "SELECT version FROM planning_schema_migration ORDER BY version DESC LIMIT 1",
  ).get() as { version: number } | undefined;
  return row?.version ?? 0;
}

function configure(database: DatabaseSync): void {
  database.exec("PRAGMA foreign_keys = ON; PRAGMA synchronous = FULL; PRAGMA busy_timeout = 5000;");
  database.exec("PRAGMA journal_mode = WAL;");
  const row = database.prepare("PRAGMA foreign_keys").get() as Record<string, unknown>;
  if (Number(Object.values(row)[0]) !== 1) {
    throw new PlanningSchemaMigrationError("SQLite foreign keys could not be enabled.");
  }
}

function assertMigrationChain(migrations: readonly PlanningSchemaMigration[]): void {
  if (migrations.length === 0) throw new PlanningSchemaMigrationError("Migration chain is empty.");
  migrations.forEach((migration, index) => {
    if (migration.version !== index + 1 || migration.name.length === 0
      || migration.checksumSha256 !== migrationChecksum(migration.sql)) {
      throw new PlanningSchemaMigrationError("Migration chain is non-contiguous or ambiguous.");
    }
  });
}

function assertApplied(
  database: DatabaseSync,
  migrations: readonly PlanningSchemaMigration[],
): void {
  let rows: Array<{ version: number; name: string; checksum_sha256: string }>;
  try {
    rows = database.prepare(
      "SELECT version, name, checksum_sha256 FROM planning_schema_migration ORDER BY version",
    ).all() as Array<{ version: number; name: string; checksum_sha256: string }>;
  } catch (error) {
    throw new PlanningSchemaMigrationError(`Migration ledger cannot be read: ${String(error)}.`);
  }
  if (rows.length === 0) throw new PlanningSchemaMigrationError("Migration ledger is empty.");
  rows.forEach((row, index) => {
    const expected = migrations[index];
    if (row.version !== index + 1 || expected === undefined
      || row.name !== expected.name || row.checksum_sha256 !== expected.checksumSha256) {
      throw new PlanningSchemaMigrationError(`Applied migration ${row.version} is ambiguous.`);
    }
  });
}

function tableExists(database: DatabaseSync, name: string): boolean {
  return database.prepare(
    "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
  ).get(name) !== undefined;
}

function planningObjects(database: DatabaseSync): string[] {
  return (database.prepare(
    `SELECT type, name FROM sqlite_master
      WHERE name LIKE 'planning_%' AND type IN ('table', 'trigger') ORDER BY type, name`,
  ).all() as Array<{ type: string; name: string }>).map((row) => `${row.type}:${row.name}`);
}

