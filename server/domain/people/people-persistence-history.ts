import type { DatabaseSync } from "node:sqlite";
import { BusinessPerson } from "./business-person.aggregate.js";
import type { PeopleDomainEvent } from "./people-authority.events.js";
import { peopleFoundationAccess } from "./people-foundation-access.js";
import type {
  HistorySlice,
  PeopleAggregateType,
  PeopleHistoryEvent,
  PersistedAggregate,
} from "./people-persistence-ports.js";
import {
  AssignmentPeriod,
  AssignmentStatus,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "./people.value-objects.js";
import { RoleAssignment } from "./role-assignment.entity.js";
import { WorkAssignment } from "./work-assignment.entity.js";
import { WorkPeople } from "./work-people.aggregate.js";

const ACCESS = peopleFoundationAccess();

export type SerializedProvenance = Readonly<{
  authority: string;
  businessCause: string;
  effectiveAtEpochMs: number;
}>;

type SerializedPeriod = Readonly<{
  effectiveFromEpochMs: number;
  effectiveToEpochMs: number | null;
}>;

export type SerializedBusinessPersonState = Readonly<{
  businessPersonId: string;
  recognitionProvenance: SerializedProvenance;
}>;

type SerializedRoleAssignment = Readonly<{
  businessRole: string;
  periods: readonly SerializedPeriod[];
  provenanceTrail: readonly SerializedProvenance[];
}>;

type SerializedWorkAssignment = Readonly<{
  workAssignmentId: string;
  businessPersonId: string;
  period: SerializedPeriod;
  status: string;
  roles: readonly SerializedRoleAssignment[];
  provenanceTrail: readonly SerializedProvenance[];
}>;

export type SerializedWorkPeopleState = Readonly<{
  projectIdentity: string;
  workIdentity: string;
  assignments: readonly SerializedWorkAssignment[];
  provenance: SerializedProvenance;
}>;

type EventTarget = Readonly<{
  aggregateType: PeopleAggregateType;
  businessPersonId?: string;
  projectIdentity?: string;
  workIdentity?: string;
}>;

export class PeopleHistoryCorruptedError extends Error {
  readonly code = "HISTORY_CORRUPTED";

  constructor(message: string) {
    super(`HISTORY_CORRUPTED: ${message}`);
    this.name = "PeopleHistoryCorruptedError";
  }
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}

export function serializeProvenance(value: PeopleProvenance): SerializedProvenance {
  return {
    authority: value.authority,
    businessCause: value.businessCause,
    effectiveAtEpochMs: value.effectiveAt.getTime(),
  };
}

export function deserializeProvenance(value: SerializedProvenance): PeopleProvenance {
  return PeopleProvenance.of(value.authority, value.businessCause, new Date(value.effectiveAtEpochMs));
}

export function serializeBusinessPerson(aggregate: BusinessPerson): SerializedBusinessPersonState {
  return {
    businessPersonId: aggregate.id.value,
    recognitionProvenance: serializeProvenance(aggregate.recognitionProvenance),
  };
}

export function deserializeBusinessPerson(state: SerializedBusinessPersonState): BusinessPerson {
  return BusinessPerson.recognize(
    ACCESS,
    BusinessPersonId.of(state.businessPersonId),
    deserializeProvenance(state.recognitionProvenance),
  );
}

export function serializeWorkPeople(aggregate: WorkPeople): SerializedWorkPeopleState {
  return {
    projectIdentity: aggregate.workReference.projectIdentity,
    workIdentity: aggregate.workReference.workIdentity,
    assignments: [...aggregate.assignments]
      .sort((left, right) => left.id.value.localeCompare(right.id.value))
      .map((assignment) => ({
        workAssignmentId: assignment.id.value,
        businessPersonId: assignment.personId.value,
        period: serializePeriod(assignment.period),
        status: assignment.status.name,
        roles: [...assignment.roleAssignments]
          .sort((left, right) => left.role.name.localeCompare(right.role.name))
          .map((role) => ({
            businessRole: role.role.name,
            periods: role.periods.map(serializePeriod),
            provenanceTrail: role.provenanceTrail.map(serializeProvenance),
          })),
        provenanceTrail: assignment.provenanceTrail.map(serializeProvenance),
      })),
    provenance: serializeProvenance(aggregate.provenance),
  };
}

export function deserializeWorkPeople(state: SerializedWorkPeopleState): WorkPeople {
  const assignments = state.assignments.map((assignment) => {
    const id = WorkAssignmentId.of(assignment.workAssignmentId);
    const roles = assignment.roles.map((role) => RoleAssignment.create(
      ACCESS,
      id,
      BusinessRole.of(role.businessRole),
      role.periods.map(deserializePeriod),
      role.provenanceTrail.map(deserializeProvenance),
    ));
    return WorkAssignment.create(
      ACCESS,
      id,
      BusinessPersonId.of(assignment.businessPersonId),
      deserializePeriod(assignment.period),
      AssignmentStatus.of(assignment.status),
      roles,
      assignment.provenanceTrail.map(deserializeProvenance),
    );
  });
  return WorkPeople.establish(
    ACCESS,
    WorkReference.of(state.projectIdentity, state.workIdentity),
    assignments,
    deserializeProvenance(state.provenance),
  );
}

export function serializeDomainEvent(event: PeopleDomainEvent): unknown {
  return canonicalValue(event);
}

export function readPeopleHistory(
  database: DatabaseSync,
  target: EventTarget,
  afterSequence = 0,
  limit = 1000,
): HistorySlice {
  if (!Number.isSafeInteger(afterSequence) || afterSequence < 0 || !Number.isSafeInteger(limit) || limit < 1) {
    throw new RangeError("PEOPLE history bounds are invalid.");
  }
  const remaining = readAllPeopleHistory(database, target).filter((event) => event.streamSequence > afterSequence);
  const hasMore = remaining.length > limit;
  const events = remaining.slice(0, limit);
  return {
    events,
    fromSequence: events[0]?.streamSequence ?? afterSequence,
    toSequence: events.at(-1)?.streamSequence ?? afterSequence,
    lastRevision: events.at(-1)?.aggregateRevision ?? 0,
    hasMore,
  };
}

export function readAllPeopleHistory(
  database: DatabaseSync,
  target: EventTarget,
  atRevision?: number,
): readonly PeopleHistoryEvent[] {
  const where = target.aggregateType === "BUSINESS_PERSON"
    ? "aggregate_type = 'BUSINESS_PERSON' AND business_person_id = ?"
    : "aggregate_type = 'WORK_PEOPLE' AND project_identity = ? AND work_identity = ?";
  const keys: string[] = target.aggregateType === "BUSINESS_PERSON"
    ? [target.businessPersonId!]
    : [target.projectIdentity!, target.workIdentity!];
  const revisionFilter = atRevision === undefined ? "" : " AND aggregate_revision <= ?";
  const parameters: Array<string | number> = atRevision === undefined ? keys : [...keys, atRevision];
  const events = (database.prepare(
    `SELECT event_id, aggregate_type, stream_sequence, aggregate_revision, event_ordinal,
            event_type, event_schema_version, payload_json, causation_id, correlation_id,
            authority, effective_at_epoch_ms, recorded_at_epoch_ms
       FROM people_event
      WHERE ${where}${revisionFilter}
      ORDER BY stream_sequence`,
  ).all(...parameters) as Record<string, unknown>[]).map(mapHistoryRow);
  validateHistory(events, atRevision);
  return events;
}

export function assertPeopleHistoryIntegrity(database: DatabaseSync): void {
  const targets = database.prepare(
    `SELECT aggregate_type, business_person_id, project_identity, work_identity
       FROM people_event
      GROUP BY aggregate_type, business_person_id, project_identity, work_identity
      ORDER BY aggregate_type, business_person_id, project_identity, work_identity`,
  ).all() as Array<{
    aggregate_type: PeopleAggregateType;
    business_person_id: string | null;
    project_identity: string | null;
    work_identity: string | null;
  }>;

  for (const row of targets) {
    const target: EventTarget = row.aggregate_type === "BUSINESS_PERSON"
      ? { aggregateType: "BUSINESS_PERSON", businessPersonId: requiredStoredString(row.business_person_id, "business_person_id") }
      : {
          aggregateType: "WORK_PEOPLE",
          projectIdentity: requiredStoredString(row.project_identity, "project_identity"),
          workIdentity: requiredStoredString(row.work_identity, "work_identity"),
        };
    const events = readAllPeopleHistory(database, target);
    if (target.aggregateType === "BUSINESS_PERSON") {
      const replayed = rehydrateBusinessPersonFromHistory(events);
      if (replayed === null || replayed.aggregate.id.value !== target.businessPersonId) {
        throw new PeopleHistoryCorruptedError("BusinessPerson event target and payload diverge.");
      }
    } else {
      const replayed = rehydrateWorkPeopleFromHistory(events);
      if (replayed === null
        || replayed.aggregate.workReference.projectIdentity !== target.projectIdentity
        || replayed.aggregate.workReference.workIdentity !== target.workIdentity) {
        throw new PeopleHistoryCorruptedError("WorkPeople event target and payload diverge.");
      }
    }
  }

  const receipts = database.prepare(
    `SELECT causation_id, correlation_id, target_type, business_person_id, project_identity,
            work_identity, authority, effective_at_epoch_ms, committed_revision,
            first_event_sequence, event_count, result_json, committed_at_epoch_ms
       FROM people_command_receipt ORDER BY causation_id`,
  ).all() as Record<string, unknown>[];
  for (const receipt of receipts) assertReceiptIntegrity(database, receipt);
}

export function rehydrateBusinessPersonFromHistory(
  events: readonly PeopleHistoryEvent[],
): PersistedAggregate<BusinessPerson> | null {
  if (events.length === 0) return null;
  let state: SerializedBusinessPersonState | null = null;
  for (const event of events) {
    const payload = asRecord(event.payload);
    if (event.eventType !== "BUSINESS_IDENTITY_RECOGNIZED" || state !== null) {
      throw new PeopleHistoryCorruptedError("BusinessPerson contains an impossible event stream.");
    }
    state = {
      businessPersonId: stringField(payload, "personId"),
      recognitionProvenance: provenanceField(payload),
    };
  }
  if (state === null) return null;
  return {
    aggregate: deserializeBusinessPerson(state),
    revision: events.at(-1)!.aggregateRevision,
    lastEventSequence: events.at(-1)!.streamSequence,
  };
}

export function rehydrateWorkPeopleFromHistory(
  events: readonly PeopleHistoryEvent[],
): PersistedAggregate<WorkPeople> | null {
  if (events.length === 0) return null;
  let state: MutableWorkState | null = null;
  for (const event of events) {
    const payload = asRecord(event.payload);
    const provenance = provenanceField(payload);
    if (state === null) {
      const reference = recordField(payload, "workReference");
      state = {
        projectIdentity: stringField(reference, "projectIdentity"),
        workIdentity: stringField(reference, "workIdentity"),
        assignments: [],
        provenance,
      };
    }
    applyWorkEvent(state, event.eventType, payload, provenance);
    state.provenance = provenance;
  }
  const finalState = state as MutableWorkState;
  const serialized: SerializedWorkPeopleState = {
    projectIdentity: finalState.projectIdentity,
    workIdentity: finalState.workIdentity,
    provenance: finalState.provenance,
    assignments: [...finalState.assignments].sort((left, right) => left.workAssignmentId.localeCompare(right.workAssignmentId)),
  };
  return {
    aggregate: deserializeWorkPeople(serialized),
    revision: events.at(-1)!.aggregateRevision,
    lastEventSequence: events.at(-1)!.streamSequence,
  };
}

function applyWorkEvent(
  state: MutableWorkState,
  eventType: string,
  payload: Record<string, unknown>,
  provenance: SerializedProvenance,
): void {
  const at = numberField(provenance, "effectiveAtEpochMs");
  if (eventType === "PEOPLE_ASSIGNED") {
    const assignmentId = stringField(payload, "assignmentId");
    if (state.assignments.some((item) => item.workAssignmentId === assignmentId)) {
      throw new PeopleHistoryCorruptedError("A WorkAssignmentId was created twice.");
    }
    const period = periodField(payload, "period");
    const personId = stringField(payload, "personId");
    const roles = arrayField(payload, "roles").map((role) => ({
      businessRole: String(role),
      periods: [period],
      provenanceTrail: [provenance],
    }));
    state.assignments.push({
      workAssignmentId: assignmentId,
      businessPersonId: personId,
      period,
      status: "ACTIVE",
      roles,
      provenanceTrail: [provenance],
    });
    return;
  }
  if (eventType === "ROLE_GRANTED" || eventType === "APPROVER_ASSIGNED" || eventType === "OBSERVER_ADDED") {
    const role = eventType === "APPROVER_ASSIGNED" ? "APPROVER"
      : eventType === "OBSERVER_ADDED" ? "OBSERVER" : stringField(payload, "role");
    grantRole(requireAssignmentState(state, stringField(payload, "assignmentId")), role, periodField(payload, "period"), provenance);
    return;
  }
  if (eventType === "ROLE_REVOKED") {
    const assignment = requireAssignmentState(state, stringField(payload, "assignmentId"));
    closeRoleState(assignment, stringField(payload, "role"), at, provenance);
    appendUniqueProvenance(assignment.provenanceTrail, provenance);
    return;
  }
  if (eventType === "OWNER_CHANGED") {
    const previousOwnerId = nullableStringField(payload, "previousOwnerId");
    const nextOwnerId = nullableStringField(payload, "nextOwnerId");
    if (previousOwnerId !== null) {
      const previous = state.assignments.find((item) => item.businessPersonId === previousOwnerId && item.status !== "ENDED");
      if (previous !== undefined) {
        closeRoleState(previous, "OWNER", at, provenance, true);
        appendUniqueProvenance(previous.provenanceTrail, provenance);
      }
    }
    if (nextOwnerId !== null) {
      const next = state.assignments.find((item) => item.businessPersonId === nextOwnerId && item.status !== "ENDED");
      if (next !== undefined) {
        grantRole(next, "OWNER", { effectiveFromEpochMs: at, effectiveToEpochMs: next.period.effectiveToEpochMs }, provenance, true);
      }
    }
    return;
  }
  if (eventType === "ASSIGNMENT_SUSPENDED") {
    const assignment = requireAssignmentState(state, stringField(payload, "assignmentId"));
    for (const role of assignment.roles) closeRoleState(assignment, role.businessRole, at, provenance, true);
    assignment.status = "SUSPENDED";
    appendUniqueProvenance(assignment.provenanceTrail, provenance);
    return;
  }
  if (eventType === "ASSIGNMENT_RESUMED") {
    const assignment = requireAssignmentState(state, stringField(payload, "assignmentId"));
    for (const role of assignment.roles) {
      grantRole(assignment, role.businessRole, { effectiveFromEpochMs: at, effectiveToEpochMs: assignment.period.effectiveToEpochMs }, provenance, true);
    }
    assignment.status = "ACTIVE";
    appendUniqueProvenance(assignment.provenanceTrail, provenance);
    return;
  }
  if (eventType === "PEOPLE_REMOVED") {
    const assignment = requireAssignmentState(state, stringField(payload, "assignmentId"));
    for (const role of assignment.roles) closeRoleState(assignment, role.businessRole, at, provenance, true);
    assignment.period = { ...assignment.period, effectiveToEpochMs: at };
    assignment.status = "ENDED";
    appendUniqueProvenance(assignment.provenanceTrail, provenance);
    return;
  }
  if (eventType === "ROLE_CHANGED") {
    const assignment = requireAssignmentState(state, stringField(payload, "assignmentId"));
    const previous = arrayField(payload, "previousRoles").map(String);
    const next = arrayField(payload, "nextRoles").map(String);
    for (const role of previous.filter((role) => !next.includes(role))) closeRoleState(assignment, role, at, provenance, true);
    for (const role of next.filter((role) => !previous.includes(role))) {
      grantRole(assignment, role, { effectiveFromEpochMs: at, effectiveToEpochMs: assignment.period.effectiveToEpochMs }, provenance, true);
    }
    return;
  }
  if (eventType === "PARTICIPANT_ADDED" || eventType === "PARTICIPANT_REMOVED") return;
  throw new PeopleHistoryCorruptedError(`Unknown PEOPLE event type ${eventType}.`);
}

type MutableRoleState = {
  businessRole: string;
  periods: SerializedPeriod[];
  provenanceTrail: SerializedProvenance[];
};

type MutableAssignmentState = {
  workAssignmentId: string;
  businessPersonId: string;
  period: SerializedPeriod;
  status: string;
  roles: MutableRoleState[];
  provenanceTrail: SerializedProvenance[];
};

type MutableWorkState = {
  projectIdentity: string;
  workIdentity: string;
  assignments: MutableAssignmentState[];
  provenance: SerializedProvenance;
};

function grantRole(
  assignment: MutableAssignmentState,
  roleName: string,
  period: SerializedPeriod,
  provenance: SerializedProvenance,
  allowExisting = false,
): void {
  let role = assignment.roles.find((item) => item.businessRole === roleName);
  if (role === undefined) {
    role = { businessRole: roleName, periods: [], provenanceTrail: [] };
    assignment.roles.push(role);
  }
  const alreadyEffective = role.periods.some((candidate) => periodContains(candidate, period.effectiveFromEpochMs));
  if (alreadyEffective) {
    if (allowExisting) return;
    throw new PeopleHistoryCorruptedError(`${roleName} was granted twice.`);
  }
  role.periods.push(period);
  appendUniqueProvenance(role.provenanceTrail, provenance);
  appendUniqueProvenance(assignment.provenanceTrail, provenance);
}

function closeRoleState(
  assignment: MutableAssignmentState,
  roleName: string,
  at: number,
  provenance: SerializedProvenance,
  allowAlreadyClosed = false,
): void {
  const role = assignment.roles.find((item) => item.businessRole === roleName);
  const period = role?.periods.find((item) => periodContains(item, at));
  if (role === undefined || period === undefined) {
    if (allowAlreadyClosed) return;
    throw new PeopleHistoryCorruptedError(`${roleName} was revoked while inactive.`);
  }
  const index = role.periods.indexOf(period);
  role.periods[index] = { ...period, effectiveToEpochMs: at };
  appendUniqueProvenance(role.provenanceTrail, provenance);
}

function requireAssignmentState(state: MutableWorkState, id: string): MutableAssignmentState {
  const assignment = state.assignments.find((item) => item.workAssignmentId === id);
  if (assignment === undefined) throw new PeopleHistoryCorruptedError(`Missing WorkAssignment ${id}.`);
  return assignment;
}

function validateHistory(events: readonly PeopleHistoryEvent[], atRevision?: number): void {
  let sequence = 0;
  let revision = 0;
  let ordinal = 0;
  let causation = "";
  for (const event of events) {
    if (event.eventSchemaVersion !== 1 || event.streamSequence !== sequence + 1) {
      throw new PeopleHistoryCorruptedError("Event version or stream sequence is invalid.");
    }
    if (event.aggregateRevision === revision) {
      if (event.eventOrdinal !== ordinal + 1 || event.causationId !== causation) {
        throw new PeopleHistoryCorruptedError("Event ordinal or causal group is invalid.");
      }
    } else {
      if (event.aggregateRevision !== revision + 1 || event.eventOrdinal !== 1) {
        throw new PeopleHistoryCorruptedError("Aggregate revisions are not contiguous.");
      }
      revision = event.aggregateRevision;
      causation = event.causationId;
      ordinal = 0;
    }
    sequence = event.streamSequence;
    ordinal = event.eventOrdinal;
  }
  if (atRevision !== undefined && events.length > 0 && revision !== atRevision) {
    throw new PeopleHistoryCorruptedError(`Revision ${atRevision} is incomplete or absent.`);
  }
}

function mapHistoryRow(row: Record<string, unknown>): PeopleHistoryEvent {
  return {
    eventId: String(row.event_id),
    aggregateType: row.aggregate_type as PeopleAggregateType,
    streamSequence: Number(row.stream_sequence),
    aggregateRevision: Number(row.aggregate_revision),
    eventOrdinal: Number(row.event_ordinal),
    eventType: String(row.event_type),
    eventSchemaVersion: Number(row.event_schema_version),
    payload: parseStoredJson(row.payload_json, "event payload"),
    causationId: String(row.causation_id),
    correlationId: String(row.correlation_id),
    authority: String(row.authority),
    effectiveAt: new Date(Number(row.effective_at_epoch_ms)),
    recordedAt: new Date(Number(row.recorded_at_epoch_ms)),
  };
}

function assertReceiptIntegrity(database: DatabaseSync, receipt: Record<string, unknown>): void {
  const causationId = requiredStoredString(receipt.causation_id, "causation_id");
  const events = database.prepare(
    `SELECT event_id, aggregate_type, business_person_id, project_identity, work_identity,
            stream_sequence, aggregate_revision, correlation_id, authority, effective_at_epoch_ms
       FROM people_event WHERE causation_id = ? ORDER BY stream_sequence`,
  ).all(causationId) as Record<string, unknown>[];
  const eventCount = Number(receipt.event_count);
  const firstSequence = Number(receipt.first_event_sequence);
  const committedRevision = Number(receipt.committed_revision);
  if (events.length !== eventCount || events.some((event, index) =>
    Number(event.stream_sequence) !== firstSequence + index
    || Number(event.aggregate_revision) !== committedRevision
    || event.aggregate_type !== receipt.target_type
    || (event.business_person_id ?? null) !== (receipt.business_person_id ?? null)
    || (event.project_identity ?? null) !== (receipt.project_identity ?? null)
    || (event.work_identity ?? null) !== (receipt.work_identity ?? null)
    || event.correlation_id !== receipt.correlation_id
    || event.authority !== receipt.authority
    || Number(event.effective_at_epoch_ms) !== Number(receipt.effective_at_epoch_ms))) {
    throw new PeopleHistoryCorruptedError(`Receipt ${causationId} does not match its event group.`);
  }

  const result = asRecord(parseStoredJson(receipt.result_json, "receipt result"));
  const eventIds = result.eventIds;
  if (Number(result.revision) !== committedRevision
    || Number(result.lastEventSequence) !== firstSequence + eventCount - 1
    || Number(result.committedAtEpochMs) !== Number(receipt.committed_at_epoch_ms)
    || !Array.isArray(eventIds)
    || eventIds.length !== events.length
    || eventIds.some((id, index) => id !== events[index]!.event_id)) {
    throw new PeopleHistoryCorruptedError(`Receipt ${causationId} result is inconsistent.`);
  }
}

function parseStoredJson(value: unknown, label: string): unknown {
  try {
    return JSON.parse(String(value));
  } catch {
    throw new PeopleHistoryCorruptedError(`Invalid ${label} JSON.`);
  }
}

function requiredStoredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new PeopleHistoryCorruptedError(`Missing stored ${field}.`);
  }
  return value;
}

function canonicalValue(value: unknown): unknown {
  if (value instanceof Date) return value.getTime();
  if (value instanceof BusinessPersonId || value instanceof WorkAssignmentId) return value.value;
  if (value instanceof BusinessRole) return value.name;
  if (value instanceof WorkReference) return { projectIdentity: value.projectIdentity, workIdentity: value.workIdentity };
  if (value instanceof AssignmentPeriod) return serializePeriod(value);
  if (value instanceof PeopleProvenance) return serializeProvenance(value);
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalValue(item)]),
    );
  }
  return value;
}

function serializePeriod(period: AssignmentPeriod): SerializedPeriod {
  return {
    effectiveFromEpochMs: period.effectiveFrom.getTime(),
    effectiveToEpochMs: period.effectiveUntil?.getTime() ?? null,
  };
}

function deserializePeriod(period: SerializedPeriod): AssignmentPeriod {
  return AssignmentPeriod.between(
    new Date(period.effectiveFromEpochMs),
    period.effectiveToEpochMs === null ? null : new Date(period.effectiveToEpochMs),
  );
}

function periodContains(period: SerializedPeriod, at: number): boolean {
  return period.effectiveFromEpochMs <= at && (period.effectiveToEpochMs === null || at < period.effectiveToEpochMs);
}

function appendUniqueProvenance(trail: SerializedProvenance[], provenance: SerializedProvenance): void {
  if (!trail.some((item) => canonicalJson(item) === canonicalJson(provenance))) trail.push(provenance);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new PeopleHistoryCorruptedError("Event payload is not an object.");
  }
  return value as Record<string, unknown>;
}

function recordField(value: Record<string, unknown>, key: string): Record<string, unknown> {
  return asRecord(value[key]);
}

function arrayField(value: Record<string, unknown>, key: string): unknown[] {
  const field = value[key];
  if (!Array.isArray(field)) throw new PeopleHistoryCorruptedError(`Missing array field ${key}.`);
  return field;
}

function stringField(value: Record<string, unknown>, key: string): string {
  const field = value[key];
  if (typeof field !== "string" || field.length === 0) throw new PeopleHistoryCorruptedError(`Missing string field ${key}.`);
  return field;
}

function nullableStringField(value: Record<string, unknown>, key: string): string | null {
  const field = value[key];
  if (field === null) return null;
  if (typeof field !== "string" || field.length === 0) throw new PeopleHistoryCorruptedError(`Invalid field ${key}.`);
  return field;
}

function numberField(value: Record<string, unknown>, key: string): number {
  const field = value[key];
  if (typeof field !== "number" || !Number.isFinite(field)) throw new PeopleHistoryCorruptedError(`Missing number field ${key}.`);
  return field;
}

function provenanceField(payload: Record<string, unknown>): SerializedProvenance {
  const value = recordField(payload, "provenance");
  return {
    authority: stringField(value, "authority"),
    businessCause: stringField(value, "businessCause"),
    effectiveAtEpochMs: numberField(value, "effectiveAtEpochMs"),
  };
}

function periodField(payload: Record<string, unknown>, key: string): SerializedPeriod {
  const value = recordField(payload, key);
  const until = value.effectiveToEpochMs;
  if (until !== null && (typeof until !== "number" || !Number.isFinite(until))) {
    throw new PeopleHistoryCorruptedError(`Invalid period field ${key}.`);
  }
  return {
    effectiveFromEpochMs: numberField(value, "effectiveFromEpochMs"),
    effectiveToEpochMs: until as number | null,
  };
}
