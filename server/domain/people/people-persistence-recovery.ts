import { existsSync, unlinkSync } from "node:fs";
import { backup, DatabaseSync } from "node:sqlite";
import { PeopleAggregatePersistenceStore } from "./people-persistence-aggregate-store.js";
import {
  assertPeopleHistoryIntegrity,
  canonicalJson,
  readAllPeopleHistory,
  rehydrateBusinessPersonFromHistory,
  rehydrateWorkPeopleFromHistory,
  serializeBusinessPerson,
  serializeWorkPeople,
  type SerializedProvenance,
} from "./people-persistence-history.js";
import {
  verifyPeopleSQLiteIntegrity,
} from "./people-persistence-migrations.js";
import { PEOPLE_PERSISTENCE_MIGRATIONS, PeoplePersistenceSchema } from "./people-persistence-schema.js";

export class PeopleRecoveryError extends Error {
  readonly code = "PEOPLE_RECOVERY_FAILED";

  constructor(message: string) {
    super(`PEOPLE_RECOVERY_FAILED: ${message}`);
    this.name = "PeopleRecoveryError";
  }
}

export async function backupPeopleDatabase(
  source: DatabaseSync,
  destinationPath: string,
): Promise<number> {
  assertNewDestination(destinationPath);
  new PeopleAggregatePersistenceStore(source);
  try {
    const pages = await backup(source, destinationPath);
    verifyRecoveredDatabase(destinationPath);
    return pages;
  } catch (error) {
    removeCreatedDatabase(destinationPath);
    throw error;
  }
}

export async function restorePeopleDatabase(
  backupPath: string,
  destinationPath: string,
): Promise<number> {
  if (!existsSync(backupPath)) throw new PeopleRecoveryError("The backup does not exist.");
  assertNewDestination(destinationPath);
  const source = new DatabaseSync(backupPath);
  try {
    return await backupPeopleDatabase(source, destinationPath);
  } finally {
    source.close();
  }
}

export function rebuildPeopleDatabaseFromHistory(
  source: DatabaseSync,
  destinationPath: string,
): void {
  assertNewDestination(destinationPath);
  verifyPeopleSQLiteIntegrity(source, PEOPLE_PERSISTENCE_MIGRATIONS);
  assertPeopleHistoryIntegrity(source);

  const destination = new DatabaseSync(destinationPath);
  try {
    new PeoplePersistenceSchema(destination).migrate();
    destination.exec("BEGIN IMMEDIATE;");
    try {
      copyReceipts(source, destination);
      copyEvents(source, destination);
      rebuildBusinessPersons(source, destination);
      rebuildWorkPeople(source, destination);
      destination.exec("COMMIT;");
    } catch (error) {
      try {
        destination.exec("ROLLBACK;");
      } catch {
        // Preserve the recovery failure.
      }
      throw error;
    }
    new PeopleAggregatePersistenceStore(destination);
  } catch (error) {
    destination.close();
    removeCreatedDatabase(destinationPath);
    throw error;
  }
  destination.close();
}

function copyReceipts(source: DatabaseSync, destination: DatabaseSync): void {
  const columns = [
    "causation_id", "correlation_id", "target_type", "business_person_id", "project_identity",
    "work_identity", "command_type", "fingerprint_algorithm", "fingerprint_version",
    "request_fingerprint", "authority", "effective_at_epoch_ms", "committed_revision",
    "first_event_sequence", "event_count", "result_schema_version", "result_json",
    "committed_at_epoch_ms",
  ] as const;
  copyRows(source, destination, "people_command_receipt", columns);
}

function copyEvents(source: DatabaseSync, destination: DatabaseSync): void {
  const columns = [
    "event_id", "aggregate_type", "business_person_id", "project_identity", "work_identity",
    "stream_sequence", "aggregate_revision", "event_ordinal", "event_type",
    "event_schema_version", "payload_json", "causation_id", "correlation_id", "authority",
    "effective_at_epoch_ms", "recorded_at_epoch_ms",
  ] as const;
  copyRows(source, destination, "people_event", columns);
}

function copyRows(
  source: DatabaseSync,
  destination: DatabaseSync,
  table: string,
  columns: readonly string[],
): void {
  const select = source.prepare(`SELECT ${columns.join(", ")} FROM ${table} ORDER BY rowid`);
  const insert = destination.prepare(
    `INSERT INTO ${table}(${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
  );
  for (const row of select.all() as Record<string, unknown>[]) {
    insert.run(...columns.map((column) => row[column] as string | number | null));
  }
}

function rebuildBusinessPersons(source: DatabaseSync, destination: DatabaseSync): void {
  const ids = source.prepare(
    "SELECT DISTINCT business_person_id FROM people_event WHERE aggregate_type = 'BUSINESS_PERSON' ORDER BY business_person_id",
  ).all() as Array<{ business_person_id: string }>;
  const insert = destination.prepare(
    `INSERT INTO people_business_person(
       business_person_id, revision, recognition_authority, recognition_causation_id,
       recognized_at_epoch_ms, state_schema_version, created_at_epoch_ms, updated_at_epoch_ms
     ) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
  );
  for (const { business_person_id: personId } of ids) {
    const events = readAllPeopleHistory(source, { aggregateType: "BUSINESS_PERSON", businessPersonId: personId });
    const replayed = rehydrateBusinessPersonFromHistory(events);
    if (replayed === null) throw new PeopleRecoveryError(`BusinessPerson ${personId} has no history.`);
    const state = serializeBusinessPerson(replayed.aggregate);
    insert.run(
      state.businessPersonId,
      replayed.revision,
      state.recognitionProvenance.authority,
      state.recognitionProvenance.businessCause,
      state.recognitionProvenance.effectiveAtEpochMs,
      events[0]!.recordedAt.getTime(),
      events.at(-1)!.recordedAt.getTime(),
    );
  }
}

function rebuildWorkPeople(source: DatabaseSync, destination: DatabaseSync): void {
  const targets = source.prepare(
    `SELECT DISTINCT project_identity, work_identity FROM people_event
      WHERE aggregate_type = 'WORK_PEOPLE' ORDER BY project_identity, work_identity`,
  ).all() as Array<{ project_identity: string; work_identity: string }>;
  for (const target of targets) {
    const events = readAllPeopleHistory(source, {
      aggregateType: "WORK_PEOPLE",
      projectIdentity: target.project_identity,
      workIdentity: target.work_identity,
    });
    const replayed = rehydrateWorkPeopleFromHistory(events);
    if (replayed === null) {
      throw new PeopleRecoveryError(`WorkPeople ${target.project_identity}/${target.work_identity} has no history.`);
    }
    const state = serializeWorkPeople(replayed.aggregate);
    destination.prepare(
      `INSERT INTO people_work_people(
         project_identity, work_identity, revision, latest_provenance_json,
         state_schema_version, created_at_epoch_ms, updated_at_epoch_ms
       ) VALUES (?, ?, ?, ?, 1, ?, ?)`,
    ).run(
      state.projectIdentity,
      state.workIdentity,
      replayed.revision,
      canonicalJson(state.provenance),
      events[0]!.recordedAt.getTime(),
      events.at(-1)!.recordedAt.getTime(),
    );
    for (const assignment of state.assignments) {
      destination.prepare(
        `INSERT INTO people_work_assignment(
           work_assignment_id, project_identity, work_identity, business_person_id, status,
           effective_from_epoch_ms, effective_to_epoch_ms, provenance_trail_json
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        assignment.workAssignmentId,
        state.projectIdentity,
        state.workIdentity,
        assignment.businessPersonId,
        assignment.status,
        assignment.period.effectiveFromEpochMs,
        assignment.period.effectiveToEpochMs,
        canonicalJson(assignment.provenanceTrail),
      );
      for (const role of assignment.roles) {
        destination.prepare(
          `INSERT INTO people_role_assignment(
             work_assignment_id, business_role, provenance_trail_json
           ) VALUES (?, ?, ?)`,
        ).run(assignment.workAssignmentId, role.businessRole, canonicalJson(role.provenanceTrail));
        role.periods.forEach((period, index) => {
          destination.prepare(
            `INSERT INTO people_role_period(
               work_assignment_id, business_role, period_ordinal, project_identity, work_identity,
               effective_from_epoch_ms, effective_to_epoch_ms, opened_by_causation_id,
               closed_by_causation_id
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            assignment.workAssignmentId,
            role.businessRole,
            index + 1,
            state.projectIdentity,
            state.workIdentity,
            period.effectiveFromEpochMs,
            period.effectiveToEpochMs,
            causeAt(role.provenanceTrail, period.effectiveFromEpochMs),
            period.effectiveToEpochMs === null ? null : causeAt(role.provenanceTrail, period.effectiveToEpochMs),
          );
        });
      }
    }
  }
}

function causeAt(trail: readonly SerializedProvenance[], at: number): string {
  const provenance = trail.find((item) => item.effectiveAtEpochMs === at);
  if (provenance === undefined) throw new PeopleRecoveryError(`No provenance exists for period boundary ${at}.`);
  return provenance.businessCause;
}

function verifyRecoveredDatabase(path: string): void {
  const database = new DatabaseSync(path);
  try {
    new PeopleAggregatePersistenceStore(database);
  } finally {
    database.close();
  }
}

function assertNewDestination(path: string): void {
  if (path.length === 0) throw new PeopleRecoveryError("The destination path is empty.");
  if (existsSync(path) || existsSync(`${path}-wal`) || existsSync(`${path}-shm`)) {
    throw new PeopleRecoveryError("Recovery destinations must be new and must not overwrite an existing database.");
  }
}

function removeCreatedDatabase(path: string): void {
  for (const candidate of [path, `${path}-wal`, `${path}-shm`]) {
    if (existsSync(candidate)) unlinkSync(candidate);
  }
}
