import type { BusinessPerson } from "./business-person.aggregate.js";
import type {
  HistorySlice,
  PeopleHistoryEvent,
  PeoplePersistencePorts,
  PersistedAggregate,
} from "./people-persistence-ports.js";
import type { WorkAssignment } from "./work-assignment.entity.js";
import {
  AssignmentPeriod,
  AssignmentStatus,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "./people.value-objects.js";
import type { WorkPeople } from "./work-people.aggregate.js";

const OWNER = BusinessRole.of("OWNER");
const CONTRIBUTOR = BusinessRole.of("CONTRIBUTOR");
const REVIEWER = BusinessRole.of("REVIEWER");
const APPROVER = BusinessRole.of("APPROVER");

export type PeopleQueryQualification = Readonly<{
  aggregateRevision: number;
  lastEventSequence: number;
  provenance: PeopleProvenance;
}>;

export type TemporalPeopleQueryQualification = PeopleQueryQualification & Readonly<{
  qualifiedAt: Date;
}>;

export type AggregateAbsent = Readonly<{
  status: "AGGREGATE_ABSENT";
}>;

export type AggregatePresent<Aggregate> = Readonly<{
  status: "PRESENT";
  aggregate: Aggregate;
  qualification: PeopleQueryQualification;
}>;

export type QualifiedAssignments = Readonly<{
  status: "QUALIFIED";
  assignments: readonly WorkAssignment[];
  qualification: TemporalPeopleQueryQualification;
}>;

export type QualifiedOwner = Readonly<{
  status: "QUALIFIED";
  assignment: WorkAssignment | null;
  qualification: TemporalPeopleQueryQualification;
}>;

export type PersonAssignmentFilter = Readonly<{
  status?: AssignmentStatus;
  overlapping?: AssignmentPeriod;
}>;

export type PersonAssignmentResult = Readonly<{
  workReference: WorkReference;
  assignment: WorkAssignment;
  qualification: PeopleQueryQualification;
}>;

export type QualifiedPersonAssignments = Readonly<{
  status: "QUALIFIED";
  person: BusinessPerson;
  personQualification: PeopleQueryQualification;
  assignments: readonly PersonAssignmentResult[];
}>;

export type AssignmentHistoryPage = Readonly<{
  status: "QUALIFIED";
  workReference: WorkReference;
  assignment: WorkAssignment;
  events: readonly PeopleHistoryEvent[];
  fromSequence: number;
  toSequence: number;
  lastRevision: number;
  hasMore: boolean;
  qualification: PeopleQueryQualification;
}>;

/**
 * Internal, read-only PEOPLE boundary. Every result is loaded from a certified
 * persistence port and qualified with the owning aggregate head.
 */
export class PeopleQueryService {
  constructor(private readonly persistence: PeoplePersistencePorts) {}

  GetBusinessPerson(
    personId: BusinessPersonId,
  ): AggregatePresent<BusinessPerson> | AggregateAbsent {
    const persisted = this.persistence.businessPersons.load(personId.value);
    if (persisted === null) return absent();
    return present(persisted, persisted.aggregate.recognitionProvenance);
  }

  GetWorkPeople(
    workReference: WorkReference,
  ): AggregatePresent<WorkPeople> | AggregateAbsent {
    const persisted = this.persistence.workPeople.load(workReference);
    if (persisted === null) return absent();
    return present(persisted, persisted.aggregate.provenance);
  }

  GetWorkOwner(
    workReference: WorkReference,
    qualifiedAt: Date,
  ): QualifiedOwner | AggregateAbsent {
    const persisted = this.persistence.workPeople.load(workReference);
    if (persisted === null) return absent();
    const instant = validInstant(qualifiedAt);
    const owners = persisted.aggregate.assignments.filter((assignment) =>
      assignment.hasRoleAt(OWNER, instant)
    );
    if (owners.length > 1) {
      throw new Error("The authoritative WorkPeople head violates Owner uniqueness.");
    }
    return Object.freeze({
      status: "QUALIFIED",
      assignment: owners[0] ?? null,
      qualification: temporalQualification(persisted, instant),
    });
  }

  GetWorkParticipants(
    workReference: WorkReference,
    qualifiedAt: Date,
  ): QualifiedAssignments | AggregateAbsent {
    return selectAssignments(
      this.persistence.workPeople.load(workReference),
      qualifiedAt,
      (assignment, instant) => assignment.isParticipantAt(instant),
    );
  }

  GetWorkContributors(
    workReference: WorkReference,
    qualifiedAt: Date,
  ): QualifiedAssignments | AggregateAbsent {
    return selectAssignments(
      this.persistence.workPeople.load(workReference),
      qualifiedAt,
      (assignment, instant) => assignment.hasRoleAt(CONTRIBUTOR, instant),
    );
  }

  GetWorkReviewers(
    workReference: WorkReference,
    qualifiedAt: Date,
  ): QualifiedAssignments | AggregateAbsent {
    return selectAssignments(
      this.persistence.workPeople.load(workReference),
      qualifiedAt,
      (assignment, instant) => assignment.hasRoleAt(REVIEWER, instant),
    );
  }

  GetWorkApprovers(
    workReference: WorkReference,
    qualifiedAt: Date,
  ): QualifiedAssignments | AggregateAbsent {
    return selectAssignments(
      this.persistence.workPeople.load(workReference),
      qualifiedAt,
      (assignment, instant) => assignment.hasRoleAt(APPROVER, instant),
    );
  }

  GetPersonAssignments(
    personId: BusinessPersonId,
    filter: PersonAssignmentFilter = {},
  ): QualifiedPersonAssignments | AggregateAbsent {
    const person = this.persistence.businessPersons.load(personId.value);
    if (person === null) return absent();
    const assignments = this.persistence.workPeople.loadByPerson(personId.value)
      .flatMap((persisted) => persisted.aggregate.assignments
        .filter((assignment) => assignment.personId.equals(personId))
        .filter((assignment) => filter.status === undefined || assignment.status.equals(filter.status))
        .filter((assignment) => filter.overlapping === undefined || assignment.period.overlaps(filter.overlapping))
        .map((assignment): PersonAssignmentResult => Object.freeze({
          workReference: persisted.aggregate.workReference,
          assignment,
          qualification: qualification(persisted, persisted.aggregate.provenance),
        })));
    return Object.freeze({
      status: "QUALIFIED",
      person: person.aggregate,
      personQualification: qualification(person, person.aggregate.recognitionProvenance),
      assignments: Object.freeze(assignments),
    });
  }

  GetAssignmentHistory(
    assignmentId: WorkAssignmentId,
    afterSequence = 0,
    limit = 1000,
  ): AssignmentHistoryPage | AggregateAbsent {
    assertHistoryBounds(afterSequence, limit);
    const persisted = this.persistence.workPeople.loadByAssignment(assignmentId.value);
    if (persisted === null) return absent();
    const assignment = persisted.aggregate.assignments.find((candidate) =>
      candidate.id.equals(assignmentId)
    );
    if (assignment === undefined) {
      throw new Error("The authoritative assignment lookup and WorkPeople head diverge.");
    }

    const causalities = new Set([
      ...assignment.provenanceTrail.map((item) => item.businessCause),
      ...assignment.roleAssignments.flatMap((role) =>
        role.provenanceTrail.map((item) => item.businessCause)
      ),
    ]);
    const remaining = readCompleteHistory(this.persistence, persisted.aggregate.workReference)
      .filter((event) => event.streamSequence <= persisted.lastEventSequence)
      .filter((event) => causalities.has(event.causationId))
      .filter((event) => event.streamSequence > afterSequence);
    const events = Object.freeze(remaining.slice(0, limit));
    return Object.freeze({
      status: "QUALIFIED",
      workReference: persisted.aggregate.workReference,
      assignment,
      events,
      fromSequence: events[0]?.streamSequence ?? afterSequence,
      toSequence: events.at(-1)?.streamSequence ?? afterSequence,
      lastRevision: events.at(-1)?.aggregateRevision ?? 0,
      hasMore: remaining.length > limit,
      qualification: qualification(persisted, persisted.aggregate.provenance),
    });
  }
}

function absent(): AggregateAbsent {
  return Object.freeze({ status: "AGGREGATE_ABSENT" });
}

function present<Aggregate>(
  persisted: PersistedAggregate<Aggregate>,
  provenance: PeopleProvenance,
): AggregatePresent<Aggregate> {
  return Object.freeze({
    status: "PRESENT",
    aggregate: persisted.aggregate,
    qualification: qualification(persisted, provenance),
  });
}

function qualification<Aggregate>(
  persisted: PersistedAggregate<Aggregate>,
  provenance: PeopleProvenance,
): PeopleQueryQualification {
  return Object.freeze({
    aggregateRevision: persisted.revision,
    lastEventSequence: persisted.lastEventSequence,
    provenance,
  });
}

function temporalQualification(
  persisted: PersistedAggregate<WorkPeople>,
  instant: Date,
): TemporalPeopleQueryQualification {
  return Object.freeze({
    ...qualification(persisted, persisted.aggregate.provenance),
    qualifiedAt: new Date(instant.getTime()),
  });
}

function selectAssignments(
  persisted: PersistedAggregate<WorkPeople> | null,
  qualifiedAt: Date,
  predicate: (assignment: WorkAssignment, instant: Date) => boolean,
): QualifiedAssignments | AggregateAbsent {
  if (persisted === null) return absent();
  const instant = validInstant(qualifiedAt);
  return Object.freeze({
    status: "QUALIFIED",
    assignments: Object.freeze(
      persisted.aggregate.assignments.filter((assignment) => predicate(assignment, instant)),
    ),
    qualification: temporalQualification(persisted, instant),
  });
}

function validInstant(value: Date): Date {
  const epochMs = value.getTime();
  if (!Number.isFinite(epochMs)) throw new RangeError("qualifiedAt must be a valid Date.");
  return new Date(epochMs);
}

function assertHistoryBounds(afterSequence: number, limit: number): void {
  if (!Number.isSafeInteger(afterSequence) || afterSequence < 0
    || !Number.isSafeInteger(limit) || limit < 1) {
    throw new RangeError("PEOPLE assignment history bounds are invalid.");
  }
}

function readCompleteHistory(
  persistence: PeoplePersistencePorts,
  workReference: WorkReference,
): readonly PeopleHistoryEvent[] {
  const events: PeopleHistoryEvent[] = [];
  let afterSequence = 0;
  do {
    const page: HistorySlice = persistence.workPeople.readHistory(
      workReference,
      afterSequence,
      1000,
    );
    events.push(...page.events);
    if (!page.hasMore) return events;
    if (page.toSequence <= afterSequence) {
      throw new Error("The authoritative PEOPLE history pagination did not advance.");
    }
    afterSequence = page.toSequence;
  } while (true);
}
