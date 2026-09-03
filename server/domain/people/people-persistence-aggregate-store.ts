import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { BusinessPerson } from "./business-person.aggregate.js";
import type { PeopleDomainEvent } from "./people-authority.events.js";
import { PeopleDomainError } from "./people.errors.js";
import {
  canonicalJson,
  assertPeopleHistoryIntegrity,
  deserializeBusinessPerson,
  deserializeWorkPeople,
  PeopleHistoryCorruptedError,
  readAllPeopleHistory,
  readPeopleHistory,
  rehydrateBusinessPersonFromHistory,
  rehydrateWorkPeopleFromHistory,
  serializeBusinessPerson,
  serializeDomainEvent,
  serializeProvenance,
  serializeWorkPeople,
  type SerializedBusinessPersonState,
  type SerializedProvenance,
  type SerializedWorkPeopleState,
} from "./people-persistence-history.js";
import type {
  BusinessPersonRepository,
  CommandEnvelope,
  CommitResult,
  HistorySlice,
  PendingChange,
  PeopleAggregateType,
  PeoplePersistencePorts,
  PersistedAggregate,
  WorkPeopleRepository,
} from "./people-persistence-ports.js";
import {
  initializePeopleSQLite,
  PeopleIdempotencyConflictError,
  PeoplePersistenceConflictError,
  PeoplePersistenceError,
  PeopleSQLiteTransactionManager,
  type PeopleSQLiteOptions,
} from "./people-persistence-sqlite-adapter.js";
import { WorkReference } from "./people.value-objects.js";
import { WorkPeople } from "./work-people.aggregate.js";

type Target = Readonly<{
  aggregateType: PeopleAggregateType;
  businessPersonId?: string;
  projectIdentity?: string;
  workIdentity?: string;
}>;

type StoredCommitResult = Readonly<{
  state: SerializedBusinessPersonState | SerializedWorkPeopleState;
  revision: number;
  lastEventSequence: number;
  eventIds: readonly string[];
  committedAtEpochMs: number;
}>;

type ReceiptRow = Readonly<{
  causation_id: string;
  target_type: PeopleAggregateType;
  business_person_id: string | null;
  project_identity: string | null;
  work_identity: string | null;
  command_type: string;
  fingerprint_version: number;
  request_fingerprint: string;
  committed_revision: number;
  first_event_sequence: number;
  event_count: number;
  result_json: string;
  committed_at_epoch_ms: number;
}>;

export class PeopleAggregatePersistenceStore implements PeoplePersistencePorts {
  readonly businessPersons: BusinessPersonRepository;
  readonly workPeople: WorkPeopleRepository;
  private readonly transaction: PeopleSQLiteTransactionManager;
  private readonly now: () => Date;
  private readonly beforeReceipt?: () => void;

  constructor(private readonly database: DatabaseSync, options: PeopleSQLiteOptions = {}) {
    this.now = options.now ?? (() => new Date());
    this.beforeReceipt = options.beforeReceipt;
    initializePeopleSQLite(database, this.now);
    this.transaction = new PeopleSQLiteTransactionManager(database);
    const businessPersons: BusinessPersonRepository = {
      load: (personId: string) => this.loadBusinessPerson(personId),
      commit: (expectedRevision: number, change: PendingChange<BusinessPerson>, envelope: CommandEnvelope) => this.commitBusinessPerson(expectedRevision, change, envelope),
      readHistory: (personId: string, afterSequence?: number, limit?: number) => readPeopleHistory(
        this.database,
        { aggregateType: "BUSINESS_PERSON", businessPersonId: personId },
        afterSequence,
        limit,
      ),
      rehydrate: (personId: string, atRevision?: number) => this.rehydrateBusinessPerson(personId, atRevision),
    };
    this.businessPersons = Object.freeze(businessPersons);
    const workPeople: WorkPeopleRepository = {
      load: (reference: WorkReference) => this.loadWorkPeople(reference),
      loadByPerson: (personId: string) => this.loadWorkPeopleByPerson(personId),
      loadByAssignment: (assignmentId: string) => this.loadWorkPeopleByAssignment(assignmentId),
      commit: (expectedRevision: number, change: PendingChange<WorkPeople>, envelope: CommandEnvelope) => this.commitWorkPeople(expectedRevision, change, envelope),
      readHistory: (reference: WorkReference, afterSequence?: number, limit?: number) => readPeopleHistory(
        this.database,
        workTarget(reference),
        afterSequence,
        limit,
      ),
      rehydrate: (reference: WorkReference, atRevision?: number) => this.rehydrateWorkPeople(reference, atRevision),
    };
    this.workPeople = Object.freeze(workPeople);
    this.assertCurrentStateIntegrity();
  }

  private assertCurrentStateIntegrity(): void {
    assertPeopleHistoryIntegrity(this.database);
    const people = this.database.prepare(
      "SELECT business_person_id FROM people_business_person ORDER BY business_person_id",
    ).all() as Array<{ business_person_id: string }>;
    for (const person of people) this.loadBusinessPerson(person.business_person_id);

    const works = this.database.prepare(
      "SELECT project_identity, work_identity FROM people_work_people ORDER BY project_identity, work_identity",
    ).all() as Array<{ project_identity: string; work_identity: string }>;
    for (const work of works) {
      this.loadWorkPeople(WorkReference.of(work.project_identity, work.work_identity));
    }

    const orphanStream = this.database.prepare(
      `SELECT 1
         FROM people_event event
         LEFT JOIN people_business_person person
           ON event.aggregate_type = 'BUSINESS_PERSON'
          AND person.business_person_id = event.business_person_id
         LEFT JOIN people_work_people work
           ON event.aggregate_type = 'WORK_PEOPLE'
          AND work.project_identity = event.project_identity
          AND work.work_identity = event.work_identity
        WHERE (event.aggregate_type = 'BUSINESS_PERSON' AND person.business_person_id IS NULL)
           OR (event.aggregate_type = 'WORK_PEOPLE' AND work.project_identity IS NULL)
        LIMIT 1`,
    ).get();
    if (orphanStream !== undefined) throw corrupted("An event stream has no current aggregate head.");
  }

  private loadBusinessPerson(personId: string): PersistedAggregate<BusinessPerson> | null {
    const row = this.database.prepare(
      `SELECT business_person_id, revision, recognition_authority, recognition_causation_id,
              recognized_at_epoch_ms, state_schema_version
         FROM people_business_person WHERE business_person_id = ?`,
    ).get(personId) as Record<string, unknown> | undefined;
    if (row === undefined) return null;
    if (Number(row.state_schema_version) !== 1) throw corrupted("Unsupported BusinessPerson state version.");
    const current = deserializeBusinessPerson({
      businessPersonId: String(row.business_person_id),
      recognitionProvenance: {
        authority: String(row.recognition_authority),
        businessCause: String(row.recognition_causation_id),
        effectiveAtEpochMs: Number(row.recognized_at_epoch_ms),
      },
    });
    const replayed = this.rehydrateBusinessPerson(personId);
    if (replayed === null || replayed.revision !== Number(row.revision)
      || canonicalJson(serializeBusinessPerson(replayed.aggregate)) !== canonicalJson(serializeBusinessPerson(current))) {
      throw corrupted("BusinessPerson current state diverges from its history.");
    }
    return { aggregate: current, revision: Number(row.revision), lastEventSequence: replayed.lastEventSequence };
  }

  private loadWorkPeople(reference: WorkReference): PersistedAggregate<WorkPeople> | null {
    const row = this.database.prepare(
      `SELECT revision, latest_provenance_json, state_schema_version
         FROM people_work_people WHERE project_identity = ? AND work_identity = ?`,
    ).get(reference.projectIdentity, reference.workIdentity) as Record<string, unknown> | undefined;
    if (row === undefined) return null;
    if (Number(row.state_schema_version) !== 1) throw corrupted("Unsupported WorkPeople state version.");
    const assignments = (this.database.prepare(
      `SELECT work_assignment_id, business_person_id, status, effective_from_epoch_ms,
              effective_to_epoch_ms, provenance_trail_json
         FROM people_work_assignment
        WHERE project_identity = ? AND work_identity = ? ORDER BY work_assignment_id`,
    ).all(reference.projectIdentity, reference.workIdentity) as Record<string, unknown>[]).map((assignment) => {
      const assignmentId = String(assignment.work_assignment_id);
      const roles = (this.database.prepare(
        `SELECT business_role, provenance_trail_json FROM people_role_assignment
          WHERE work_assignment_id = ? ORDER BY business_role`,
      ).all(assignmentId) as Record<string, unknown>[]).map((role) => ({
        businessRole: String(role.business_role),
        periods: (this.database.prepare(
          `SELECT effective_from_epoch_ms, effective_to_epoch_ms FROM people_role_period
            WHERE work_assignment_id = ? AND business_role = ? ORDER BY period_ordinal`,
        ).all(assignmentId, String(role.business_role)) as Record<string, unknown>[]).map((period) => ({
          effectiveFromEpochMs: Number(period.effective_from_epoch_ms),
          effectiveToEpochMs: period.effective_to_epoch_ms === null ? null : Number(period.effective_to_epoch_ms),
        })),
        provenanceTrail: parseProvenanceTrail(role.provenance_trail_json),
      }));
      return {
        workAssignmentId: assignmentId,
        businessPersonId: String(assignment.business_person_id),
        period: {
          effectiveFromEpochMs: Number(assignment.effective_from_epoch_ms),
          effectiveToEpochMs: assignment.effective_to_epoch_ms === null ? null : Number(assignment.effective_to_epoch_ms),
        },
        status: String(assignment.status),
        roles,
        provenanceTrail: parseProvenanceTrail(assignment.provenance_trail_json),
      };
    });
    const currentState: SerializedWorkPeopleState = {
      projectIdentity: reference.projectIdentity,
      workIdentity: reference.workIdentity,
      assignments,
      provenance: parseProvenance(row.latest_provenance_json),
    };
    const current = deserializeWorkPeople(currentState);
    const replayed = this.rehydrateWorkPeople(reference);
    if (replayed === null || replayed.revision !== Number(row.revision)
      || canonicalJson(serializeWorkPeople(replayed.aggregate)) !== canonicalJson(serializeWorkPeople(current))) {
      throw corrupted("WorkPeople current state diverges from its history.");
    }
    return { aggregate: current, revision: Number(row.revision), lastEventSequence: replayed.lastEventSequence };
  }

  private loadWorkPeopleByPerson(personId: string): readonly PersistedAggregate<WorkPeople>[] {
    const references = this.database.prepare(
      `SELECT DISTINCT project_identity, work_identity
         FROM people_work_assignment
        WHERE business_person_id = ?
        ORDER BY project_identity, work_identity`,
    ).all(personId) as Array<{ project_identity: string; work_identity: string }>;
    return Object.freeze(references.map((reference) => {
      const aggregate = this.loadWorkPeople(
        WorkReference.of(reference.project_identity, reference.work_identity),
      );
      if (aggregate === null) throw corrupted("A person lookup referenced a missing WorkPeople head.");
      return aggregate;
    }));
  }

  private loadWorkPeopleByAssignment(assignmentId: string): PersistedAggregate<WorkPeople> | null {
    const reference = this.database.prepare(
      `SELECT project_identity, work_identity
         FROM people_work_assignment
        WHERE work_assignment_id = ?`,
    ).get(assignmentId) as { project_identity: string; work_identity: string } | undefined;
    if (reference === undefined) return null;
    const aggregate = this.loadWorkPeople(
      WorkReference.of(reference.project_identity, reference.work_identity),
    );
    if (aggregate === null) throw corrupted("An assignment lookup referenced a missing WorkPeople head.");
    return aggregate;
  }

  private rehydrateBusinessPerson(personId: string, atRevision?: number): PersistedAggregate<BusinessPerson> | null {
    const events = readAllPeopleHistory(
      this.database,
      { aggregateType: "BUSINESS_PERSON", businessPersonId: personId },
      atRevision,
    );
    return rehydrateBusinessPersonFromHistory(events);
  }

  private rehydrateWorkPeople(reference: WorkReference, atRevision?: number): PersistedAggregate<WorkPeople> | null {
    const events = readAllPeopleHistory(this.database, workTarget(reference), atRevision);
    return rehydrateWorkPeopleFromHistory(events);
  }

  private commitBusinessPerson(
    expectedRevision: number,
    change: PendingChange<BusinessPerson>,
    envelope: CommandEnvelope,
  ): CommitResult<BusinessPerson> {
    const target: Target = { aggregateType: "BUSINESS_PERSON", businessPersonId: change.aggregate.id.value };
    return this.commit(
      target,
      expectedRevision,
      change,
      envelope,
      serializeBusinessPerson(change.aggregate),
      deserializeBusinessPerson,
      (nextRevision, committedAt) => {
        if (expectedRevision !== 0) throw new PeoplePersistenceConflictError(expectedRevision, 1);
        this.database.prepare(
          `INSERT INTO people_business_person(
             business_person_id, revision, recognition_authority, recognition_causation_id,
             recognized_at_epoch_ms, state_schema_version, created_at_epoch_ms, updated_at_epoch_ms
           ) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
        ).run(
          change.aggregate.id.value,
          nextRevision,
          change.aggregate.recognitionProvenance.authority,
          change.aggregate.recognitionProvenance.businessCause,
          change.aggregate.recognitionProvenance.effectiveAt.getTime(),
          committedAt,
          committedAt,
        );
      },
    );
  }

  private commitWorkPeople(
    expectedRevision: number,
    change: PendingChange<WorkPeople>,
    envelope: CommandEnvelope,
  ): CommitResult<WorkPeople> {
    const reference = change.aggregate.workReference;
    const target = workTarget(reference);
    return this.commit(
      target,
      expectedRevision,
      change,
      envelope,
      serializeWorkPeople(change.aggregate),
      deserializeWorkPeople,
      (nextRevision, committedAt) => this.persistWorkPeopleState(
        change.aggregate,
        expectedRevision,
        nextRevision,
        envelope.causationId,
        committedAt,
      ),
    );
  }

  private commit<Aggregate, State extends SerializedBusinessPersonState | SerializedWorkPeopleState>(
    target: Target,
    expectedRevision: number,
    change: PendingChange<Aggregate>,
    envelope: CommandEnvelope,
    state: State,
    deserialize: (value: State) => Aggregate,
    persistState: (nextRevision: number, committedAt: number) => void,
  ): CommitResult<Aggregate> {
    return this.transaction.run(() => {
      const receipt = this.findReceipt(envelope.causationId);
      if (receipt !== undefined) return this.replayReceipt(target, envelope, receipt, deserialize);
      validateCommit(target, expectedRevision, change.events, envelope);
      const actualRevision = this.currentRevision(target);
      if (actualRevision > 0) {
        if (target.aggregateType === "BUSINESS_PERSON") this.loadBusinessPerson(target.businessPersonId!);
        else this.loadWorkPeople(WorkReference.of(target.projectIdentity!, target.workIdentity!));
      }
      if (actualRevision !== expectedRevision) throw new PeoplePersistenceConflictError(expectedRevision, actualRevision);
      const nextRevision = expectedRevision + 1;
      const previousSequence = this.lastSequence(target);
      const committedAt = this.now().getTime();
      if (!Number.isFinite(committedAt)) throw new TypeError("PEOPLE commit time is invalid.");
      persistState(nextRevision, committedAt);
      const eventIds = change.events.map((_, index) => eventId(envelope.causationId, index + 1));
      change.events.forEach((event, index) => this.insertEvent(
        target,
        event,
        eventIds[index]!,
        previousSequence + index + 1,
        nextRevision,
        index + 1,
        envelope,
        committedAt,
      ));
      const storedResult: StoredCommitResult = {
        state,
        revision: nextRevision,
        lastEventSequence: previousSequence + change.events.length,
        eventIds,
        committedAtEpochMs: committedAt,
      };
      this.beforeReceipt?.();
      this.insertReceipt(target, envelope, storedResult, previousSequence + 1, change.events.length);
      this.assertCommittedShape(target, nextRevision, previousSequence + 1, change.events.length, envelope.causationId);
      return {
        aggregate: deserialize(state),
        revision: nextRevision,
        lastEventSequence: storedResult.lastEventSequence,
        status: "APPLIED",
        eventIds: Object.freeze([...eventIds]),
        committedAt: new Date(committedAt),
      };
    });
  }

  private persistWorkPeopleState(
    aggregate: WorkPeople,
    expectedRevision: number,
    nextRevision: number,
    causationId: string,
    committedAt: number,
  ): void {
    const state = serializeWorkPeople(aggregate);
    if (expectedRevision === 0) {
      this.database.prepare(
        `INSERT INTO people_work_people(project_identity, work_identity, revision, latest_provenance_json,
          state_schema_version, created_at_epoch_ms, updated_at_epoch_ms) VALUES (?, ?, ?, ?, 1, ?, ?)`,
      ).run(state.projectIdentity, state.workIdentity, nextRevision, canonicalJson(state.provenance), committedAt, committedAt);
    } else {
      const result = this.database.prepare(
        `UPDATE people_work_people SET revision = ?, latest_provenance_json = ?, updated_at_epoch_ms = ?
          WHERE project_identity = ? AND work_identity = ? AND revision = ?`,
      ).run(nextRevision, canonicalJson(state.provenance), committedAt, state.projectIdentity, state.workIdentity, expectedRevision);
      if (Number(result.changes) !== 1) throw new PeoplePersistenceConflictError(expectedRevision, this.currentRevision(workTarget(aggregate.workReference)));
    }
    this.syncWorkChildren(state, causationId);
  }

  private syncWorkChildren(state: SerializedWorkPeopleState, causationId: string): void {
    const existingAssignments = this.database.prepare(
      `SELECT work_assignment_id, business_person_id, status, effective_from_epoch_ms,
              effective_to_epoch_ms, provenance_trail_json
         FROM people_work_assignment WHERE project_identity = ? AND work_identity = ?`,
    ).all(state.projectIdentity, state.workIdentity) as Record<string, unknown>[];
    const candidates = new Map(state.assignments.map((item) => [item.workAssignmentId, item]));
    for (const existing of existingAssignments) {
      const candidate = candidates.get(String(existing.work_assignment_id));
      if (candidate === undefined) throw corrupted("A WorkAssignment disappeared from current state.");
      assertImmutable(String(existing.business_person_id), candidate.businessPersonId, "WorkAssignment person");
      assertImmutable(Number(existing.effective_from_epoch_ms), candidate.period.effectiveFromEpochMs, "WorkAssignment start");
      assertAppendOnlyEnd(existing.effective_to_epoch_ms, candidate.period.effectiveToEpochMs, "WorkAssignment period");
      assertStatusTransition(String(existing.status), candidate.status);
      assertTrailPrefix(parseProvenanceTrail(existing.provenance_trail_json), candidate.provenanceTrail);
    }
    this.closeExistingRolePeriods(state, causationId);
    for (const assignment of state.assignments) {
      const exists = existingAssignments.some((row) => String(row.work_assignment_id) === assignment.workAssignmentId);
      if (!exists) {
        const person = this.database.prepare(
          "SELECT 1 FROM people_business_person WHERE business_person_id = ?",
        ).get(assignment.businessPersonId);
        if (person === undefined) throw new PeopleDomainError("BUSINESS_PERSON_NOT_FOUND", `${assignment.businessPersonId} is not durable in PEOPLE.`);
        this.database.prepare(
          `INSERT INTO people_work_assignment(work_assignment_id, project_identity, work_identity,
             business_person_id, status, effective_from_epoch_ms, effective_to_epoch_ms, provenance_trail_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
      } else {
        this.database.prepare(
          `UPDATE people_work_assignment SET status = ?, effective_to_epoch_ms = ?, provenance_trail_json = ?
            WHERE work_assignment_id = ?`,
        ).run(assignment.status, assignment.period.effectiveToEpochMs, canonicalJson(assignment.provenanceTrail), assignment.workAssignmentId);
      }
    }
    this.upsertRolesAndPeriods(state, causationId);
  }

  private closeExistingRolePeriods(state: SerializedWorkPeopleState, causationId: string): void {
    for (const assignment of state.assignments) {
      for (const role of assignment.roles) {
        const existingPeriods = this.database.prepare(
          `SELECT period_ordinal, effective_from_epoch_ms, effective_to_epoch_ms
             FROM people_role_period WHERE work_assignment_id = ? AND business_role = ? ORDER BY period_ordinal`,
        ).all(assignment.workAssignmentId, role.businessRole) as Record<string, unknown>[];
        if (existingPeriods.length > role.periods.length) throw corrupted("A RoleAssignment period disappeared.");
        existingPeriods.forEach((existing, index) => {
          const candidate = role.periods[index];
          if (candidate === undefined) throw corrupted("A RoleAssignment period disappeared.");
          assertImmutable(Number(existing.effective_from_epoch_ms), candidate.effectiveFromEpochMs, "Role period start");
          assertAppendOnlyEnd(existing.effective_to_epoch_ms, candidate.effectiveToEpochMs, "Role period");
          if (existing.effective_to_epoch_ms === null && candidate.effectiveToEpochMs !== null) {
            const closeCause = causeAt(role.provenanceTrail, candidate.effectiveToEpochMs);
            if (closeCause !== causationId) throw corrupted("A role period closure is not caused by the current command.");
            this.database.prepare(
              `UPDATE people_role_period SET effective_to_epoch_ms = ?, closed_by_causation_id = ?
                WHERE work_assignment_id = ? AND business_role = ? AND period_ordinal = ? AND effective_to_epoch_ms IS NULL`,
            ).run(candidate.effectiveToEpochMs, causationId, assignment.workAssignmentId, role.businessRole, index + 1);
          }
        });
      }
    }
  }

  private upsertRolesAndPeriods(state: SerializedWorkPeopleState, causationId: string): void {
    for (const assignment of state.assignments) {
      const existingRoles = this.database.prepare(
        "SELECT business_role, provenance_trail_json FROM people_role_assignment WHERE work_assignment_id = ?",
      ).all(assignment.workAssignmentId) as Record<string, unknown>[];
      for (const existing of existingRoles) {
        const candidate = assignment.roles.find((role) => role.businessRole === String(existing.business_role));
        if (candidate === undefined) throw corrupted("A RoleAssignment disappeared from current state.");
        assertTrailPrefix(parseProvenanceTrail(existing.provenance_trail_json), candidate.provenanceTrail);
      }
      for (const role of assignment.roles) {
        const exists = existingRoles.some((item) => String(item.business_role) === role.businessRole);
        if (exists) {
          this.database.prepare(
            "UPDATE people_role_assignment SET provenance_trail_json = ? WHERE work_assignment_id = ? AND business_role = ?",
          ).run(canonicalJson(role.provenanceTrail), assignment.workAssignmentId, role.businessRole);
        } else {
          this.database.prepare(
            "INSERT INTO people_role_assignment(work_assignment_id, business_role, provenance_trail_json) VALUES (?, ?, ?)",
          ).run(assignment.workAssignmentId, role.businessRole, canonicalJson(role.provenanceTrail));
        }
        const existingCount = Number((this.database.prepare(
          "SELECT COUNT(*) AS count FROM people_role_period WHERE work_assignment_id = ? AND business_role = ?",
        ).get(assignment.workAssignmentId, role.businessRole) as { count: number }).count);
        for (let index = existingCount; index < role.periods.length; index += 1) {
          const period = role.periods[index]!;
          const openedBy = causeAt(role.provenanceTrail, period.effectiveFromEpochMs);
          if (openedBy !== causationId) throw corrupted("A new role period is not caused by the current command.");
          const closedBy = period.effectiveToEpochMs === null ? null : causeAt(role.provenanceTrail, period.effectiveToEpochMs);
          this.database.prepare(
            `INSERT INTO people_role_period(work_assignment_id, business_role, period_ordinal,
               project_identity, work_identity, effective_from_epoch_ms, effective_to_epoch_ms,
               opened_by_causation_id, closed_by_causation_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            assignment.workAssignmentId,
            role.businessRole,
            index + 1,
            state.projectIdentity,
            state.workIdentity,
            period.effectiveFromEpochMs,
            period.effectiveToEpochMs,
            openedBy,
            closedBy,
          );
        }
      }
    }
  }

  private insertEvent(
    target: Target,
    event: PeopleDomainEvent,
    id: string,
    sequence: number,
    revision: number,
    ordinal: number,
    envelope: CommandEnvelope,
    committedAt: number,
  ): void {
    this.database.prepare(
      `INSERT INTO people_event(event_id, aggregate_type, business_person_id, project_identity,
         work_identity, stream_sequence, aggregate_revision, event_ordinal, event_type,
         event_schema_version, payload_json, causation_id, correlation_id, authority,
         effective_at_epoch_ms, recorded_at_epoch_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      target.aggregateType,
      target.businessPersonId ?? null,
      target.projectIdentity ?? null,
      target.workIdentity ?? null,
      sequence,
      revision,
      ordinal,
      event.name,
      canonicalJson(serializeDomainEvent(event)),
      envelope.causationId,
      envelope.correlationId,
      envelope.provenance.authority,
      envelope.provenance.effectiveAt.getTime(),
      committedAt,
    );
  }

  private insertReceipt(
    target: Target,
    envelope: CommandEnvelope,
    result: StoredCommitResult,
    firstSequence: number,
    eventCount: number,
  ): void {
    this.database.prepare(
      `INSERT INTO people_command_receipt(causation_id, correlation_id, target_type,
         business_person_id, project_identity, work_identity, command_type, fingerprint_algorithm,
         fingerprint_version, request_fingerprint, authority, effective_at_epoch_ms,
         committed_revision, first_event_sequence, event_count, result_schema_version,
         result_json, committed_at_epoch_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'SHA-256', ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    ).run(
      envelope.causationId,
      envelope.correlationId,
      target.aggregateType,
      target.businessPersonId ?? null,
      target.projectIdentity ?? null,
      target.workIdentity ?? null,
      envelope.commandType,
      envelope.fingerprintVersion,
      envelope.requestFingerprint,
      envelope.provenance.authority,
      envelope.provenance.effectiveAt.getTime(),
      result.revision,
      firstSequence,
      eventCount,
      canonicalJson(result),
      result.committedAtEpochMs,
    );
  }

  private findReceipt(causationId: string): ReceiptRow | undefined {
    return this.database.prepare(
      `SELECT causation_id, target_type, business_person_id, project_identity, work_identity,
              command_type, fingerprint_version, request_fingerprint, committed_revision,
              first_event_sequence, event_count, result_json, committed_at_epoch_ms
         FROM people_command_receipt WHERE causation_id = ?`,
    ).get(causationId) as ReceiptRow | undefined;
  }

  private replayReceipt<Aggregate, State extends SerializedBusinessPersonState | SerializedWorkPeopleState>(
    target: Target,
    envelope: CommandEnvelope,
    receipt: ReceiptRow,
    deserialize: (value: State) => Aggregate,
  ): CommitResult<Aggregate> {
    if (!sameTarget(target, receipt) || receipt.command_type !== envelope.commandType
      || receipt.fingerprint_version !== envelope.fingerprintVersion
      || receipt.request_fingerprint !== envelope.requestFingerprint) {
      throw new PeopleIdempotencyConflictError();
    }
    this.assertCommittedShape(
      target,
      receipt.committed_revision,
      receipt.first_event_sequence,
      receipt.event_count,
      envelope.causationId,
      true,
    );
    const result = JSON.parse(receipt.result_json) as StoredCommitResult;
    if (result.revision !== receipt.committed_revision || result.eventIds.length !== receipt.event_count
      || result.committedAtEpochMs !== receipt.committed_at_epoch_ms) {
      throw corrupted("The idempotency receipt result is inconsistent.");
    }
    return {
      aggregate: deserialize(result.state as State),
      revision: result.revision,
      lastEventSequence: result.lastEventSequence,
      status: "REPLAYED",
      eventIds: Object.freeze([...result.eventIds]),
      committedAt: new Date(result.committedAtEpochMs),
    };
  }

  private assertCommittedShape(
    target: Target,
    revision: number,
    firstSequence: number,
    eventCount: number,
    causationId: string,
    allowNewerHead = false,
  ): void {
    const rows = this.database.prepare(
      `SELECT stream_sequence, aggregate_revision, event_ordinal FROM people_event
        WHERE causation_id = ? ORDER BY stream_sequence`,
    ).all(causationId) as Record<string, unknown>[];
    if (rows.length !== eventCount || rows.some((row, index) =>
      Number(row.stream_sequence) !== firstSequence + index
      || Number(row.aggregate_revision) !== revision
      || Number(row.event_ordinal) !== index + 1)) {
      throw corrupted("Receipt event bounds are inconsistent.");
    }
    const head = this.currentRevision(target);
    if (allowNewerHead ? head < revision : head !== revision) throw corrupted("Receipt does not point to a valid aggregate head.");
    if (this.lastEventRevision(target) !== head) throw corrupted("Aggregate head and event history revision diverge.");
  }

  private currentRevision(target: Target): number {
    const row = target.aggregateType === "BUSINESS_PERSON"
      ? this.database.prepare("SELECT revision FROM people_business_person WHERE business_person_id = ?").get(target.businessPersonId!)
      : this.database.prepare("SELECT revision FROM people_work_people WHERE project_identity = ? AND work_identity = ?")
        .get(target.projectIdentity!, target.workIdentity!);
    return row === undefined ? 0 : Number((row as { revision: number }).revision);
  }

  private lastSequence(target: Target): number {
    const row = target.aggregateType === "BUSINESS_PERSON"
      ? this.database.prepare("SELECT MAX(stream_sequence) AS sequence FROM people_event WHERE aggregate_type = 'BUSINESS_PERSON' AND business_person_id = ?").get(target.businessPersonId!)
      : this.database.prepare("SELECT MAX(stream_sequence) AS sequence FROM people_event WHERE aggregate_type = 'WORK_PEOPLE' AND project_identity = ? AND work_identity = ?")
        .get(target.projectIdentity!, target.workIdentity!);
    return Number((row as { sequence: number | null }).sequence ?? 0);
  }

  private lastEventRevision(target: Target): number {
    const row = target.aggregateType === "BUSINESS_PERSON"
      ? this.database.prepare("SELECT MAX(aggregate_revision) AS revision FROM people_event WHERE aggregate_type = 'BUSINESS_PERSON' AND business_person_id = ?").get(target.businessPersonId!)
      : this.database.prepare("SELECT MAX(aggregate_revision) AS revision FROM people_event WHERE aggregate_type = 'WORK_PEOPLE' AND project_identity = ? AND work_identity = ?")
        .get(target.projectIdentity!, target.workIdentity!);
    return Number((row as { revision: number | null }).revision ?? 0);
  }
}

export function createPeopleSQLitePersistence(
  database: DatabaseSync,
  options: PeopleSQLiteOptions = {},
): PeoplePersistencePorts {
  return new PeopleAggregatePersistenceStore(database, options);
}

export function createPeopleRequestFingerprint(value: unknown): string {
  return createHash("sha256").update(canonicalJson({ fingerprintVersion: 1, value }), "utf8").digest("hex");
}

function validateCommit(
  target: Target,
  expectedRevision: number,
  events: readonly PeopleDomainEvent[],
  envelope: CommandEnvelope,
): void {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new RangeError("expectedRevision must be a non-negative integer.");
  if (events.length === 0) throw new PeoplePersistenceError("DOMAIN_CONSTRAINT_VIOLATION", "A committed revision requires at least one event.");
  if (!/^[0-9a-f]{64}$/.test(envelope.requestFingerprint) || !Number.isSafeInteger(envelope.fingerprintVersion) || envelope.fingerprintVersion < 1) {
    throw new PeoplePersistenceError("DOMAIN_CONSTRAINT_VIOLATION", "The command fingerprint is invalid.");
  }
  for (const event of events) {
    if (event.aggregate !== target.aggregateType || event.causality !== envelope.causationId
      || !event.provenance.equals(envelope.provenance)) {
      throw new PeoplePersistenceError("DOMAIN_CONSTRAINT_VIOLATION", "Event target, causality or provenance differs from its command envelope.");
    }
  }
  if (target.aggregateType === "BUSINESS_PERSON") {
    if (events.length !== 1 || events[0]?.name !== "BUSINESS_IDENTITY_RECOGNIZED"
      || events[0].personId.value !== target.businessPersonId) {
      throw new PeoplePersistenceError("DOMAIN_CONSTRAINT_VIOLATION", "BusinessPerson creation requires its recognition event.");
    }
  } else {
    assertEventOrder(events);
  }
}

function assertEventOrder(events: readonly PeopleDomainEvent[]): void {
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index]!;
    if (event.name === "PARTICIPANT_ADDED") {
      const earlier = events.slice(0, index).some((candidate) =>
        (candidate.name === "PEOPLE_ASSIGNED" || candidate.name === "ASSIGNMENT_RESUMED")
        && "assignmentId" in candidate && candidate.assignmentId.equals(event.assignmentId));
      if (!earlier) throw new PeoplePersistenceError("DOMAIN_CONSTRAINT_VIOLATION", "ParticipantAdded lacks its preceding causal event.");
    }
    if (event.name === "PEOPLE_REMOVED") {
      const laterForAssignment = events.slice(index + 1).some((candidate) =>
        "assignmentId" in candidate && candidate.assignmentId.equals(event.assignmentId));
      if (laterForAssignment) throw new PeoplePersistenceError("DOMAIN_CONSTRAINT_VIOLATION", "An event follows PeopleRemoved for the same WorkAssignment.");
    }
  }
}

function workTarget(reference: WorkReference): Target {
  return {
    aggregateType: "WORK_PEOPLE",
    projectIdentity: reference.projectIdentity,
    workIdentity: reference.workIdentity,
  };
}

function sameTarget(target: Target, receipt: ReceiptRow): boolean {
  return target.aggregateType === receipt.target_type
    && (target.businessPersonId ?? null) === receipt.business_person_id
    && (target.projectIdentity ?? null) === receipt.project_identity
    && (target.workIdentity ?? null) === receipt.work_identity;
}

function eventId(causationId: string, ordinal: number): string {
  return `people-event-${createHash("sha256").update(`${causationId}:${ordinal}`).digest("hex")}`;
}

function parseProvenance(value: unknown): SerializedProvenance {
  const parsed = JSON.parse(String(value)) as SerializedProvenance;
  if (typeof parsed.authority !== "string" || typeof parsed.businessCause !== "string"
    || !Number.isFinite(parsed.effectiveAtEpochMs)) throw corrupted("Invalid persisted provenance.");
  return parsed;
}

function parseProvenanceTrail(value: unknown): SerializedProvenance[] {
  const parsed = JSON.parse(String(value)) as unknown;
  if (!Array.isArray(parsed)) throw corrupted("Invalid persisted provenance trail.");
  return parsed.map((item) => parseProvenance(JSON.stringify(item)));
}

function causeAt(trail: readonly SerializedProvenance[], at: number): string {
  const provenance = trail.find((item) => item.effectiveAtEpochMs === at);
  if (provenance === undefined) throw corrupted("A period boundary has no provenance.");
  return provenance.businessCause;
}

function assertTrailPrefix(previous: readonly SerializedProvenance[], next: readonly SerializedProvenance[]): void {
  if (previous.length > next.length || previous.some((item, index) => canonicalJson(item) !== canonicalJson(next[index]))) {
    throw corrupted("A provenance trail was rewritten.");
  }
}

function assertImmutable(previous: string | number, next: string | number, field: string): void {
  if (previous !== next) throw corrupted(`${field} was rewritten.`);
}

function assertAppendOnlyEnd(previous: unknown, next: number | null, field: string): void {
  const prior = previous === null ? null : Number(previous);
  if (prior !== null && prior !== next) throw corrupted(`${field} was reopened or rewritten.`);
}

function assertStatusTransition(previous: string, next: string): void {
  const allowed = previous === next
    || (previous === "ACTIVE" && (next === "SUSPENDED" || next === "ENDED"))
    || (previous === "SUSPENDED" && (next === "ACTIVE" || next === "ENDED"));
  if (!allowed) throw corrupted("A WorkAssignment status transition is invalid.");
}

function corrupted(message: string): PeopleHistoryCorruptedError {
  return new PeopleHistoryCorruptedError(message);
}
