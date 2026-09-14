import { existsSync, unlinkSync } from "node:fs";
import { backup, DatabaseSync } from "node:sqlite";
import {
  PLANNING_PERSISTENCE_MIGRATIONS,
  PlanningPersistenceSchema,
  verifyPlanningSQLiteIntegrity,
} from "./planning-persistence-migrations.js";
import { PlanningSQLiteRepository } from "./planning-persistence-sqlite-adapter.js";

export class PlanningRecoveryError extends Error {
  readonly code = "PLANNING_RECOVERY_FAILED";
  constructor(message: string) {
    super(`PLANNING_RECOVERY_FAILED: ${message}`);
    this.name = "PlanningRecoveryError";
  }
}

export async function backupPlanningDatabase(
  source: DatabaseSync,
  destinationPath: string,
): Promise<number> {
  assertNewDestination(destinationPath);
  new PlanningSQLiteRepository(source);
  try {
    const pages = await backup(source, destinationPath);
    verifyDatabase(destinationPath);
    return pages;
  } catch (error) {
    removeCreatedDatabase(destinationPath);
    throw error;
  }
}

export async function restorePlanningDatabase(
  backupPath: string,
  destinationPath: string,
): Promise<number> {
  if (!existsSync(backupPath)) throw new PlanningRecoveryError("The backup does not exist.");
  assertNewDestination(destinationPath);
  const source = new DatabaseSync(backupPath);
  try {
    return await backupPlanningDatabase(source, destinationPath);
  } finally {
    source.close();
  }
}

/** Rebuilds mutable heads exclusively from immutable Planning versions, events and receipts. */
export function rebuildPlanningDatabaseFromHistory(
  source: DatabaseSync,
  destinationPath: string,
): void {
  assertNewDestination(destinationPath);
  verifyPlanningSQLiteIntegrity(source, PLANNING_PERSISTENCE_MIGRATIONS);
  const destination = new DatabaseSync(destinationPath);
  try {
    new PlanningPersistenceSchema(destination).migrate();
    destination.exec("BEGIN IMMEDIATE;");
    try {
      rebuildRoots(source, destination);
      copyRows(source, destination, "planning_version", [
        "project_identity", "work_identity", "planning_version", "state_schema_version",
        "state_json", "authority", "source", "causation_id", "effective_at_epoch_ms",
        "recorded_at_epoch_ms",
      ]);
      copyRows(source, destination, "planning_event", [
        "event_id", "project_identity", "work_identity", "stream_sequence",
        "aggregate_revision", "event_ordinal", "planning_version", "event_type",
        "event_schema_version", "payload_json", "causation_id", "correlation_id",
        "authority", "source", "effective_at_epoch_ms", "recorded_at_epoch_ms",
      ]);
      copyRows(source, destination, "planning_command_receipt", [
        "project_identity", "work_identity", "causation_id", "correlation_id",
        "command_type", "fingerprint_algorithm", "fingerprint_version",
        "request_fingerprint", "expected_revision", "committed_revision",
        "first_event_sequence", "event_count", "result_schema_version", "result_json",
        "committed_at_epoch_ms",
      ]);
      destination.exec("COMMIT;");
    } catch (error) {
      try { destination.exec("ROLLBACK;"); } catch { /* preserve primary failure */ }
      throw error;
    }
    new PlanningSQLiteRepository(destination);
  } catch (error) {
    destination.close();
    removeCreatedDatabase(destinationPath);
    throw error;
  }
  destination.close();
}

function rebuildRoots(source: DatabaseSync, destination: DatabaseSync): void {
  const streams = source.prepare(
    `SELECT project_identity, work_identity,
            MIN(recorded_at_epoch_ms) AS created_at_epoch_ms,
            MAX(recorded_at_epoch_ms) AS updated_at_epoch_ms,
            MAX(aggregate_revision) AS revision
       FROM planning_event GROUP BY project_identity, work_identity
       ORDER BY project_identity, work_identity`,
  ).all() as Array<{
    project_identity: string;
    work_identity: string;
    created_at_epoch_ms: number;
    updated_at_epoch_ms: number;
    revision: number;
  }>;
  const insert = destination.prepare(
    `INSERT INTO planning_root(
      project_identity, work_identity, revision, current_version,
      created_at_epoch_ms, updated_at_epoch_ms
    ) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  for (const stream of streams) {
    const last = source.prepare(
      `SELECT event_type, planning_version FROM planning_event
        WHERE project_identity = ? AND work_identity = ?
          AND event_type IN ('PlanningEstablished', 'PlanningRevised', 'PlanningWithdrawn')
        ORDER BY stream_sequence DESC LIMIT 1`,
    ).get(stream.project_identity, stream.work_identity) as {
      event_type: string; planning_version: number;
    } | undefined;
    if (last === undefined) throw new PlanningRecoveryError("A stream has no root Planning fact.");
    insert.run(stream.project_identity, stream.work_identity, stream.revision,
      last.event_type === "PlanningWithdrawn" ? null : last.planning_version,
      stream.created_at_epoch_ms, stream.updated_at_epoch_ms);
  }
}

function copyRows(
  source: DatabaseSync,
  destination: DatabaseSync,
  table: string,
  columns: readonly string[],
): void {
  const rows = source.prepare(
    `SELECT ${columns.join(", ")} FROM ${table} ORDER BY rowid`,
  ).all() as Record<string, unknown>[];
  const insert = destination.prepare(
    `INSERT INTO ${table}(${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
  );
  for (const row of rows) {
    insert.run(...columns.map((column) => row[column] as string | number | null));
  }
}

function verifyDatabase(path: string): void {
  const database = new DatabaseSync(path);
  try { new PlanningSQLiteRepository(database); }
  finally { database.close(); }
}

function assertNewDestination(path: string): void {
  if (path.length === 0) throw new PlanningRecoveryError("The destination path is empty.");
  if (existsSync(path) || existsSync(`${path}-wal`) || existsSync(`${path}-shm`)) {
    throw new PlanningRecoveryError("Recovery never overwrites an existing database.");
  }
}

function removeCreatedDatabase(path: string): void {
  for (const candidate of [path, `${path}-wal`, `${path}-shm`]) {
    if (existsSync(candidate)) unlinkSync(candidate);
  }
}

