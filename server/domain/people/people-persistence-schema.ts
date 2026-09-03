import type { DatabaseSync } from "node:sqlite";
import {
  migrationChecksum,
  readPeopleSchemaVersion,
  runPeopleMigrations,
  type PeopleMigrationRunnerOptions,
  type PeopleSchemaMigration,
} from "./people-persistence-migrations.js";

export const PEOPLE_PERSISTENCE_SCHEMA_VERSION = 1;
const MIGRATION_NAME = "people-canonical-v1";

const CREATE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS people_schema_migration (
  version INTEGER PRIMARY KEY CHECK (version > 0),
  name TEXT NOT NULL UNIQUE CHECK (length(name) > 0),
  checksum_sha256 TEXT NOT NULL CHECK (length(checksum_sha256) = 64),
  applied_at_epoch_ms INTEGER NOT NULL,
  application_version TEXT NOT NULL CHECK (length(application_version) > 0)
) STRICT;

CREATE TABLE IF NOT EXISTS people_business_person (
  business_person_id TEXT PRIMARY KEY CHECK (length(business_person_id) > 0),
  revision INTEGER NOT NULL CHECK (revision >= 1),
  recognition_authority TEXT NOT NULL CHECK (length(recognition_authority) > 0),
  recognition_causation_id TEXT NOT NULL CHECK (length(recognition_causation_id) > 0),
  recognized_at_epoch_ms INTEGER NOT NULL,
  state_schema_version INTEGER NOT NULL CHECK (state_schema_version = 1),
  created_at_epoch_ms INTEGER NOT NULL,
  updated_at_epoch_ms INTEGER NOT NULL,
  FOREIGN KEY (recognition_causation_id) REFERENCES people_command_receipt(causation_id)
    DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE IF NOT EXISTS people_work_people (
  project_identity TEXT NOT NULL CHECK (length(project_identity) > 0),
  work_identity TEXT NOT NULL CHECK (length(work_identity) > 0),
  revision INTEGER NOT NULL CHECK (revision >= 1),
  latest_provenance_json TEXT NOT NULL CHECK (json_valid(latest_provenance_json)),
  state_schema_version INTEGER NOT NULL CHECK (state_schema_version = 1),
  created_at_epoch_ms INTEGER NOT NULL,
  updated_at_epoch_ms INTEGER NOT NULL,
  PRIMARY KEY (project_identity, work_identity)
) STRICT;

CREATE TABLE IF NOT EXISTS people_work_assignment (
  work_assignment_id TEXT PRIMARY KEY CHECK (length(work_assignment_id) > 0),
  project_identity TEXT NOT NULL,
  work_identity TEXT NOT NULL,
  business_person_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ENDED')),
  effective_from_epoch_ms INTEGER NOT NULL,
  effective_to_epoch_ms INTEGER CHECK (
    effective_to_epoch_ms IS NULL OR effective_to_epoch_ms > effective_from_epoch_ms
  ),
  provenance_trail_json TEXT NOT NULL CHECK (json_valid(provenance_trail_json) AND json_array_length(provenance_trail_json) > 0),
  FOREIGN KEY (project_identity, work_identity)
    REFERENCES people_work_people(project_identity, work_identity),
  FOREIGN KEY (business_person_id) REFERENCES people_business_person(business_person_id),
  UNIQUE (work_assignment_id, project_identity, work_identity)
) STRICT;

CREATE TABLE IF NOT EXISTS people_role_assignment (
  work_assignment_id TEXT NOT NULL,
  business_role TEXT NOT NULL CHECK (business_role IN ('OWNER', 'CONTRIBUTOR', 'REVIEWER', 'APPROVER', 'OBSERVER', 'REQUESTER', 'SPONSOR')),
  provenance_trail_json TEXT NOT NULL CHECK (json_valid(provenance_trail_json) AND json_array_length(provenance_trail_json) > 0),
  PRIMARY KEY (work_assignment_id, business_role),
  FOREIGN KEY (work_assignment_id) REFERENCES people_work_assignment(work_assignment_id)
) STRICT;

CREATE TABLE IF NOT EXISTS people_role_period (
  work_assignment_id TEXT NOT NULL,
  business_role TEXT NOT NULL,
  period_ordinal INTEGER NOT NULL CHECK (period_ordinal >= 1),
  project_identity TEXT NOT NULL,
  work_identity TEXT NOT NULL,
  effective_from_epoch_ms INTEGER NOT NULL,
  effective_to_epoch_ms INTEGER CHECK (
    effective_to_epoch_ms IS NULL OR effective_to_epoch_ms > effective_from_epoch_ms
  ),
  opened_by_causation_id TEXT NOT NULL,
  closed_by_causation_id TEXT,
  PRIMARY KEY (work_assignment_id, business_role, period_ordinal),
  FOREIGN KEY (work_assignment_id, business_role)
    REFERENCES people_role_assignment(work_assignment_id, business_role),
  FOREIGN KEY (work_assignment_id, project_identity, work_identity)
    REFERENCES people_work_assignment(work_assignment_id, project_identity, work_identity),
  FOREIGN KEY (opened_by_causation_id) REFERENCES people_command_receipt(causation_id)
    DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (closed_by_causation_id) REFERENCES people_command_receipt(causation_id)
    DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE IF NOT EXISTS people_event (
  event_id TEXT PRIMARY KEY CHECK (length(event_id) > 0),
  aggregate_type TEXT NOT NULL CHECK (aggregate_type IN ('BUSINESS_PERSON', 'WORK_PEOPLE')),
  business_person_id TEXT,
  project_identity TEXT,
  work_identity TEXT,
  stream_sequence INTEGER NOT NULL CHECK (stream_sequence >= 1),
  aggregate_revision INTEGER NOT NULL CHECK (aggregate_revision >= 1),
  event_ordinal INTEGER NOT NULL CHECK (event_ordinal >= 1),
  event_type TEXT NOT NULL CHECK (length(event_type) > 0),
  event_schema_version INTEGER NOT NULL CHECK (event_schema_version = 1),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  causation_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL CHECK (length(correlation_id) > 0),
  authority TEXT NOT NULL CHECK (length(authority) > 0),
  effective_at_epoch_ms INTEGER NOT NULL,
  recorded_at_epoch_ms INTEGER NOT NULL,
  CHECK (
    (aggregate_type = 'BUSINESS_PERSON' AND business_person_id IS NOT NULL AND project_identity IS NULL AND work_identity IS NULL)
    OR
    (aggregate_type = 'WORK_PEOPLE' AND business_person_id IS NULL AND project_identity IS NOT NULL AND work_identity IS NOT NULL)
  ),
  FOREIGN KEY (causation_id) REFERENCES people_command_receipt(causation_id)
    DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE IF NOT EXISTS people_command_receipt (
  causation_id TEXT PRIMARY KEY CHECK (length(causation_id) > 0),
  correlation_id TEXT NOT NULL CHECK (length(correlation_id) > 0),
  target_type TEXT NOT NULL CHECK (target_type IN ('BUSINESS_PERSON', 'WORK_PEOPLE')),
  business_person_id TEXT,
  project_identity TEXT,
  work_identity TEXT,
  command_type TEXT NOT NULL CHECK (length(command_type) > 0),
  fingerprint_algorithm TEXT NOT NULL CHECK (fingerprint_algorithm = 'SHA-256'),
  fingerprint_version INTEGER NOT NULL CHECK (fingerprint_version >= 1),
  request_fingerprint TEXT NOT NULL CHECK (
    length(request_fingerprint) = 64 AND request_fingerprint NOT GLOB '*[^0-9a-f]*'
  ),
  authority TEXT NOT NULL CHECK (length(authority) > 0),
  effective_at_epoch_ms INTEGER NOT NULL,
  committed_revision INTEGER NOT NULL CHECK (committed_revision >= 1),
  first_event_sequence INTEGER NOT NULL CHECK (first_event_sequence >= 1),
  event_count INTEGER NOT NULL CHECK (event_count >= 1),
  result_schema_version INTEGER NOT NULL CHECK (result_schema_version = 1),
  result_json TEXT NOT NULL CHECK (json_valid(result_json)),
  committed_at_epoch_ms INTEGER NOT NULL,
  CHECK (
    (target_type = 'BUSINESS_PERSON' AND business_person_id IS NOT NULL AND project_identity IS NULL AND work_identity IS NULL)
    OR
    (target_type = 'WORK_PEOPLE' AND business_person_id IS NULL AND project_identity IS NOT NULL AND work_identity IS NOT NULL)
  )
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_people_current_assignment
  ON people_work_assignment(project_identity, work_identity, business_person_id)
  WHERE status IN ('ACTIVE', 'SUSPENDED');
CREATE UNIQUE INDEX IF NOT EXISTS uq_people_open_role_period
  ON people_role_period(work_assignment_id, business_role)
  WHERE effective_to_epoch_ms IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_people_active_owner
  ON people_role_period(project_identity, work_identity)
  WHERE business_role = 'OWNER' AND effective_to_epoch_ms IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_people_event_business_person_sequence
  ON people_event(business_person_id, stream_sequence)
  WHERE aggregate_type = 'BUSINESS_PERSON';
CREATE UNIQUE INDEX IF NOT EXISTS uq_people_event_work_sequence
  ON people_event(project_identity, work_identity, stream_sequence)
  WHERE aggregate_type = 'WORK_PEOPLE';
CREATE UNIQUE INDEX IF NOT EXISTS uq_people_event_business_person_revision_ordinal
  ON people_event(business_person_id, aggregate_revision, event_ordinal)
  WHERE aggregate_type = 'BUSINESS_PERSON';
CREATE UNIQUE INDEX IF NOT EXISTS uq_people_event_work_revision_ordinal
  ON people_event(project_identity, work_identity, aggregate_revision, event_ordinal)
  WHERE aggregate_type = 'WORK_PEOPLE';

CREATE TRIGGER IF NOT EXISTS people_assignment_no_overlap_insert
BEFORE INSERT ON people_work_assignment
WHEN EXISTS (
  SELECT 1 FROM people_work_assignment existing
  WHERE existing.project_identity = NEW.project_identity
    AND existing.work_identity = NEW.work_identity
    AND existing.business_person_id = NEW.business_person_id
    AND existing.effective_from_epoch_ms < COALESCE(NEW.effective_to_epoch_ms, 9223372036854775807)
    AND NEW.effective_from_epoch_ms < COALESCE(existing.effective_to_epoch_ms, 9223372036854775807)
)
BEGIN SELECT RAISE(ABORT, 'PEOPLE_ASSIGNMENT_OVERLAP'); END;

CREATE TRIGGER IF NOT EXISTS people_assignment_no_overlap_update
BEFORE UPDATE OF effective_from_epoch_ms, effective_to_epoch_ms ON people_work_assignment
WHEN EXISTS (
  SELECT 1 FROM people_work_assignment existing
  WHERE existing.work_assignment_id <> NEW.work_assignment_id
    AND existing.project_identity = NEW.project_identity
    AND existing.work_identity = NEW.work_identity
    AND existing.business_person_id = NEW.business_person_id
    AND existing.effective_from_epoch_ms < COALESCE(NEW.effective_to_epoch_ms, 9223372036854775807)
    AND NEW.effective_from_epoch_ms < COALESCE(existing.effective_to_epoch_ms, 9223372036854775807)
)
BEGIN SELECT RAISE(ABORT, 'PEOPLE_ASSIGNMENT_OVERLAP'); END;

CREATE TRIGGER IF NOT EXISTS people_role_period_valid_insert
BEFORE INSERT ON people_role_period
WHEN NOT EXISTS (
  SELECT 1 FROM people_work_assignment assignment
  WHERE assignment.work_assignment_id = NEW.work_assignment_id
    AND assignment.project_identity = NEW.project_identity
    AND assignment.work_identity = NEW.work_identity
    AND assignment.effective_from_epoch_ms <= NEW.effective_from_epoch_ms
    AND (assignment.effective_to_epoch_ms IS NULL OR (
      NEW.effective_to_epoch_ms IS NOT NULL AND assignment.effective_to_epoch_ms >= NEW.effective_to_epoch_ms
    ))
    AND (NEW.effective_to_epoch_ms IS NOT NULL OR assignment.status = 'ACTIVE')
)
BEGIN SELECT RAISE(ABORT, 'PEOPLE_ROLE_PERIOD_OUTSIDE_ASSIGNMENT'); END;

CREATE TRIGGER IF NOT EXISTS people_role_period_no_overlap_insert
BEFORE INSERT ON people_role_period
WHEN EXISTS (
  SELECT 1 FROM people_role_period existing
  WHERE existing.work_assignment_id = NEW.work_assignment_id
    AND existing.business_role = NEW.business_role
    AND existing.effective_from_epoch_ms < COALESCE(NEW.effective_to_epoch_ms, 9223372036854775807)
    AND NEW.effective_from_epoch_ms < COALESCE(existing.effective_to_epoch_ms, 9223372036854775807)
)
BEGIN SELECT RAISE(ABORT, 'PEOPLE_ROLE_PERIOD_OVERLAP'); END;

CREATE TRIGGER IF NOT EXISTS people_role_period_valid_update
BEFORE UPDATE ON people_role_period
WHEN OLD.work_assignment_id <> NEW.work_assignment_id
  OR OLD.business_role <> NEW.business_role
  OR OLD.period_ordinal <> NEW.period_ordinal
  OR OLD.project_identity <> NEW.project_identity
  OR OLD.work_identity <> NEW.work_identity
  OR OLD.effective_from_epoch_ms <> NEW.effective_from_epoch_ms
  OR OLD.opened_by_causation_id <> NEW.opened_by_causation_id
  OR OLD.effective_to_epoch_ms IS NOT NULL
  OR NEW.effective_to_epoch_ms IS NULL
  OR NEW.closed_by_causation_id IS NULL
  OR NOT EXISTS (
    SELECT 1 FROM people_work_assignment assignment
    WHERE assignment.work_assignment_id = NEW.work_assignment_id
      AND assignment.effective_from_epoch_ms <= NEW.effective_from_epoch_ms
      AND (assignment.effective_to_epoch_ms IS NULL OR assignment.effective_to_epoch_ms >= NEW.effective_to_epoch_ms)
  )
BEGIN SELECT RAISE(ABORT, 'PEOPLE_ROLE_PERIOD_IMMUTABLE'); END;

CREATE TRIGGER IF NOT EXISTS people_role_period_no_overlap_update
BEFORE UPDATE OF effective_to_epoch_ms ON people_role_period
WHEN EXISTS (
  SELECT 1 FROM people_role_period existing
  WHERE existing.work_assignment_id = NEW.work_assignment_id
    AND existing.business_role = NEW.business_role
    AND existing.period_ordinal <> NEW.period_ordinal
    AND existing.effective_from_epoch_ms < COALESCE(NEW.effective_to_epoch_ms, 9223372036854775807)
    AND NEW.effective_from_epoch_ms < COALESCE(existing.effective_to_epoch_ms, 9223372036854775807)
)
BEGIN SELECT RAISE(ABORT, 'PEOPLE_ROLE_PERIOD_OVERLAP'); END;

CREATE TRIGGER IF NOT EXISTS people_work_people_monotone_revision
BEFORE UPDATE ON people_work_people
WHEN NEW.project_identity <> OLD.project_identity
  OR NEW.work_identity <> OLD.work_identity
  OR NEW.state_schema_version <> OLD.state_schema_version
  OR NEW.created_at_epoch_ms <> OLD.created_at_epoch_ms
  OR NEW.revision <> OLD.revision + 1
BEGIN SELECT RAISE(ABORT, 'PEOPLE_REVISION_NOT_MONOTONE'); END;

CREATE TRIGGER IF NOT EXISTS people_work_assignment_append_only_update
BEFORE UPDATE ON people_work_assignment
WHEN NEW.work_assignment_id <> OLD.work_assignment_id
  OR NEW.project_identity <> OLD.project_identity
  OR NEW.work_identity <> OLD.work_identity
  OR NEW.business_person_id <> OLD.business_person_id
  OR NEW.effective_from_epoch_ms <> OLD.effective_from_epoch_ms
  OR (OLD.effective_to_epoch_ms IS NOT NULL AND NEW.effective_to_epoch_ms IS NOT OLD.effective_to_epoch_ms)
  OR (OLD.status = 'ENDED' AND NEW.status <> 'ENDED')
  OR (OLD.status = 'ACTIVE' AND NEW.status NOT IN ('ACTIVE', 'SUSPENDED', 'ENDED'))
  OR (OLD.status = 'SUSPENDED' AND NEW.status NOT IN ('ACTIVE', 'SUSPENDED', 'ENDED'))
  OR (NEW.status <> 'ACTIVE' AND EXISTS (
    SELECT 1 FROM people_role_period role_period
    WHERE role_period.work_assignment_id = NEW.work_assignment_id
      AND role_period.effective_to_epoch_ms IS NULL
  ))
  OR (NEW.effective_to_epoch_ms IS NOT NULL AND EXISTS (
    SELECT 1 FROM people_role_period role_period
    WHERE role_period.work_assignment_id = NEW.work_assignment_id
      AND (role_period.effective_to_epoch_ms IS NULL OR role_period.effective_to_epoch_ms > NEW.effective_to_epoch_ms)
  ))
BEGIN SELECT RAISE(ABORT, 'PEOPLE_ASSIGNMENT_IMMUTABLE'); END;

CREATE TRIGGER IF NOT EXISTS people_event_no_update
BEFORE UPDATE ON people_event BEGIN SELECT RAISE(ABORT, 'PEOPLE_EVENT_APPEND_ONLY'); END;
CREATE TRIGGER IF NOT EXISTS people_event_no_delete
BEFORE DELETE ON people_event BEGIN SELECT RAISE(ABORT, 'PEOPLE_EVENT_APPEND_ONLY'); END;
CREATE TRIGGER IF NOT EXISTS people_receipt_no_update
BEFORE UPDATE ON people_command_receipt BEGIN SELECT RAISE(ABORT, 'PEOPLE_RECEIPT_IMMUTABLE'); END;
CREATE TRIGGER IF NOT EXISTS people_receipt_no_delete
BEFORE DELETE ON people_command_receipt BEGIN SELECT RAISE(ABORT, 'PEOPLE_RECEIPT_IMMUTABLE'); END;
CREATE TRIGGER IF NOT EXISTS people_business_person_no_update
BEFORE UPDATE ON people_business_person BEGIN SELECT RAISE(ABORT, 'PEOPLE_BUSINESS_PERSON_IMMUTABLE'); END;
CREATE TRIGGER IF NOT EXISTS people_business_person_no_delete
BEFORE DELETE ON people_business_person BEGIN SELECT RAISE(ABORT, 'PEOPLE_NO_PHYSICAL_DELETE'); END;
CREATE TRIGGER IF NOT EXISTS people_work_people_no_delete
BEFORE DELETE ON people_work_people BEGIN SELECT RAISE(ABORT, 'PEOPLE_NO_PHYSICAL_DELETE'); END;
CREATE TRIGGER IF NOT EXISTS people_work_assignment_no_delete
BEFORE DELETE ON people_work_assignment BEGIN SELECT RAISE(ABORT, 'PEOPLE_NO_PHYSICAL_DELETE'); END;
CREATE TRIGGER IF NOT EXISTS people_role_assignment_no_delete
BEFORE DELETE ON people_role_assignment BEGIN SELECT RAISE(ABORT, 'PEOPLE_NO_PHYSICAL_DELETE'); END;
CREATE TRIGGER IF NOT EXISTS people_role_period_no_delete
BEFORE DELETE ON people_role_period BEGIN SELECT RAISE(ABORT, 'PEOPLE_NO_PHYSICAL_DELETE'); END;
CREATE TRIGGER IF NOT EXISTS people_schema_migration_no_update
BEFORE UPDATE ON people_schema_migration BEGIN SELECT RAISE(ABORT, 'PEOPLE_MIGRATION_IMMUTABLE'); END;
CREATE TRIGGER IF NOT EXISTS people_schema_migration_no_delete
BEFORE DELETE ON people_schema_migration BEGIN SELECT RAISE(ABORT, 'PEOPLE_MIGRATION_IMMUTABLE'); END;
`;

export interface PeoplePersistenceSchemaOptions extends PeopleMigrationRunnerOptions {}

export const PEOPLE_PERSISTENCE_MIGRATIONS: readonly PeopleSchemaMigration[] = Object.freeze([
  Object.freeze({
    version: PEOPLE_PERSISTENCE_SCHEMA_VERSION,
    name: MIGRATION_NAME,
    sql: CREATE_SCHEMA_SQL,
    checksumSha256: migrationChecksum(CREATE_SCHEMA_SQL),
    verify: (database: DatabaseSync): void => {
      const expected: Readonly<Record<string, readonly string[]>> = {
        table: [
          "people_business_person", "people_command_receipt", "people_event",
          "people_role_assignment", "people_role_period", "people_schema_migration",
          "people_work_assignment", "people_work_people",
        ],
        index: [
          "uq_people_active_owner", "uq_people_current_assignment",
          "uq_people_event_business_person_revision_ordinal",
          "uq_people_event_business_person_sequence", "uq_people_event_work_revision_ordinal",
          "uq_people_event_work_sequence", "uq_people_open_role_period",
        ],
        trigger: [
          "people_assignment_no_overlap_insert", "people_assignment_no_overlap_update",
          "people_business_person_no_delete", "people_business_person_no_update",
          "people_event_no_delete", "people_event_no_update",
          "people_receipt_no_delete", "people_receipt_no_update",
          "people_role_assignment_no_delete", "people_role_period_no_delete",
          "people_role_period_no_overlap_insert", "people_role_period_no_overlap_update",
          "people_role_period_valid_insert", "people_role_period_valid_update",
          "people_schema_migration_no_delete", "people_schema_migration_no_update",
          "people_work_assignment_append_only_update", "people_work_assignment_no_delete",
          "people_work_people_monotone_revision", "people_work_people_no_delete",
        ],
      };
      const actual = database.prepare(
        "SELECT type, name FROM sqlite_master WHERE name LIKE 'people_%' OR name LIKE 'uq_people_%'",
      ).all() as Array<{ type: string; name: string }>;
      for (const [type, names] of Object.entries(expected)) {
        const present = new Set(actual.filter((item) => item.type === type).map((item) => item.name));
        if (names.some((name) => !present.has(name))) {
          throw new Error(`SCHEMA_VERSION_UNSUPPORTED: PEOPLE canonical ${type}s are incomplete.`);
        }
      }
    },
  }),
]);

export class PeoplePersistenceSchema {
  constructor(
    private readonly database: DatabaseSync,
    private readonly options: PeoplePersistenceSchemaOptions = {},
  ) {}

  migrate(): number {
    return runPeopleMigrations(this.database, PEOPLE_PERSISTENCE_MIGRATIONS, this.options);
  }

  version(): number {
    return readPeopleSchemaVersion(this.database);
  }
}
