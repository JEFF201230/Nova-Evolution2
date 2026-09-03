import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export type PeopleMigrationStage =
  | "before-sql"
  | "after-sql"
  | "after-verification"
  | "after-record";

export type PeopleSchemaMigration = Readonly<{
  version: number;
  name: string;
  checksumSha256: string;
  sql: string;
  verify: (database: DatabaseSync) => void;
}>;

export interface PeopleMigrationRunnerOptions {
  readonly now?: () => Date;
  readonly applicationVersion?: string;
  readonly faultInjector?: (stage: PeopleMigrationStage, version: number) => void;
}

export type PeopleIntegrityReport = Readonly<{
  schemaVersion: number;
  quickCheck: "ok";
  integrityCheck: "ok";
  foreignKeyViolations: 0;
}>;

export class PeopleSchemaMigrationError extends Error {
  readonly code = "SCHEMA_VERSION_UNSUPPORTED";

  constructor(message: string) {
    super(`SCHEMA_VERSION_UNSUPPORTED: ${message}`);
    this.name = "PeopleSchemaMigrationError";
  }
}

export function migrationChecksum(sql: string): string {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

export function runPeopleMigrations(
  database: DatabaseSync,
  migrations: readonly PeopleSchemaMigration[],
  options: PeopleMigrationRunnerOptions = {},
): number {
  assertMigrationChain(migrations);
  configureConnection(database);
  assertCheck(database, "quick_check");
  assertNoForeignKeyViolation(database);

  const hasLedger = tableExists(database, "people_schema_migration");
  if (!hasLedger) {
    const existingObjects = peopleObjects(database);
    if (existingObjects.length > 0) {
      throw new PeopleSchemaMigrationError(
        `Untracked PEOPLE schema objects were found: ${existingObjects.join(", ")}.`,
      );
    }
  } else {
    assertAppliedMigrations(database, migrations);
  }

  let version = hasLedger ? readPeopleSchemaVersion(database) : 0;
  for (const migration of migrations) {
    if (migration.version <= version) continue;
    if (migration.version !== version + 1) {
      throw new PeopleSchemaMigrationError(`Migration ${version + 1} is missing.`);
    }
    applyMigration(database, migration, options);
    version = migration.version;
  }

  const report = verifyPeopleSQLiteIntegrity(database, migrations);
  return report.schemaVersion;
}

export function verifyPeopleSQLiteIntegrity(
  database: DatabaseSync,
  migrations: readonly PeopleSchemaMigration[],
): PeopleIntegrityReport {
  assertMigrationChain(migrations);
  if (!tableExists(database, "people_schema_migration")) {
    throw new PeopleSchemaMigrationError("The PEOPLE migration ledger is absent.");
  }
  assertAppliedMigrations(database, migrations);
  const version = readPeopleSchemaVersion(database);
  for (const migration of migrations) {
    if (migration.version <= version) migration.verify(database);
  }
  assertCheck(database, "quick_check");
  assertCheck(database, "integrity_check");
  assertNoForeignKeyViolation(database);
  return {
    schemaVersion: version,
    quickCheck: "ok",
    integrityCheck: "ok",
    foreignKeyViolations: 0,
  };
}

export function readPeopleSchemaVersion(database: DatabaseSync): number {
  if (!tableExists(database, "people_schema_migration")) return 0;
  const row = database.prepare(
    "SELECT version FROM people_schema_migration ORDER BY version DESC LIMIT 1",
  ).get() as { version: number } | undefined;
  return row?.version ?? 0;
}

function configureConnection(database: DatabaseSync): void {
  database.exec("PRAGMA foreign_keys = ON; PRAGMA synchronous = FULL; PRAGMA busy_timeout = 5000;");
  database.exec("PRAGMA journal_mode = WAL;");
  const foreignKeys = database.prepare("PRAGMA foreign_keys").get() as Record<string, unknown>;
  if (Number(Object.values(foreignKeys)[0]) !== 1) {
    throw new PeopleSchemaMigrationError("SQLite foreign keys could not be enabled.");
  }
}

function applyMigration(
  database: DatabaseSync,
  migration: PeopleSchemaMigration,
  options: PeopleMigrationRunnerOptions,
): void {
  database.exec("BEGIN IMMEDIATE;");
  try {
    options.faultInjector?.("before-sql", migration.version);
    database.exec(migration.sql);
    options.faultInjector?.("after-sql", migration.version);
    migration.verify(database);
    options.faultInjector?.("after-verification", migration.version);
    database.prepare(
      `INSERT INTO people_schema_migration(
         version, name, checksum_sha256, applied_at_epoch_ms, application_version
       ) VALUES (?, ?, ?, ?, ?)`,
    ).run(
      migration.version,
      migration.name,
      migration.checksumSha256,
      (options.now ?? (() => new Date()))().getTime(),
      options.applicationVersion ?? "people-mvp",
    );
    options.faultInjector?.("after-record", migration.version);
    database.exec("COMMIT;");
  } catch (error) {
    try {
      database.exec("ROLLBACK;");
    } catch {
      // Preserve the migration failure.
    }
    throw error;
  }
}

function assertMigrationChain(migrations: readonly PeopleSchemaMigration[]): void {
  if (migrations.length === 0) throw new PeopleSchemaMigrationError("The migration chain is empty.");
  for (let index = 0; index < migrations.length; index += 1) {
    const migration = migrations[index]!;
    if (migration.version !== index + 1 || migration.name.length === 0) {
      throw new PeopleSchemaMigrationError("The migration chain is not contiguous.");
    }
    if (migration.checksumSha256 !== migrationChecksum(migration.sql)) {
      throw new PeopleSchemaMigrationError(`Migration ${migration.version} has an invalid declared checksum.`);
    }
  }
}

function assertAppliedMigrations(
  database: DatabaseSync,
  migrations: readonly PeopleSchemaMigration[],
): void {
  let rows: Array<{ version: number; name: string; checksum_sha256: string }>;
  try {
    rows = database.prepare(
      "SELECT version, name, checksum_sha256 FROM people_schema_migration ORDER BY version",
    ).all() as Array<{ version: number; name: string; checksum_sha256: string }>;
  } catch (error) {
    throw new PeopleSchemaMigrationError(`The migration ledger cannot be read: ${errorMessage(error)}.`);
  }
  if (rows.length === 0) {
    throw new PeopleSchemaMigrationError("The migration ledger exists but contains no applied version.");
  }
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]!;
    const expected = migrations[index];
    if (row.version !== index + 1) {
      throw new PeopleSchemaMigrationError(`Applied migration versions are not contiguous at ${index + 1}.`);
    }
    if (expected === undefined) {
      throw new PeopleSchemaMigrationError(`Database schema version ${row.version} is newer than this binary.`);
    }
    if (row.name !== expected.name || row.checksum_sha256 !== expected.checksumSha256) {
      throw new PeopleSchemaMigrationError(`Migration ${row.version} name or checksum diverges.`);
    }
  }
}

function assertCheck(database: DatabaseSync, pragma: "quick_check" | "integrity_check"): void {
  const rows = database.prepare(`PRAGMA ${pragma}`).all() as Record<string, unknown>[];
  const messages = rows.map((row) => String(Object.values(row)[0]));
  if (messages.length !== 1 || messages[0] !== "ok") {
    throw new PeopleSchemaMigrationError(`SQLite ${pragma} failed: ${messages.join("; ") || "no result"}.`);
  }
}

function assertNoForeignKeyViolation(database: DatabaseSync): void {
  const violations = database.prepare("PRAGMA foreign_key_check").all();
  if (violations.length > 0) {
    throw new PeopleSchemaMigrationError(`SQLite foreign_key_check found ${violations.length} violation(s).`);
  }
}

function tableExists(database: DatabaseSync, name: string): boolean {
  return database.prepare(
    "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
  ).get(name) !== undefined;
}

function peopleObjects(database: DatabaseSync): string[] {
  return (database.prepare(
    "SELECT type, name FROM sqlite_master WHERE name LIKE 'people_%' ORDER BY type, name",
  ).all() as Array<{ type: string; name: string }>).map((row) => `${row.type}:${row.name}`);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
