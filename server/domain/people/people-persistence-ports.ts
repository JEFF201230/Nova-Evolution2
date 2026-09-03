import type { BusinessPerson } from "./business-person.aggregate.js";
import type { PeopleDomainEvent } from "./people-authority.events.js";
import type { PeopleProvenance, WorkReference } from "./people.value-objects.js";
import type { WorkPeople } from "./work-people.aggregate.js";

export type PeopleAggregateType = "BUSINESS_PERSON" | "WORK_PEOPLE";
export type ExpectedRevision = number;

export interface CommandEnvelope {
  readonly commandType: string;
  readonly causationId: string;
  readonly correlationId: string;
  readonly requestFingerprint: string;
  readonly fingerprintVersion: number;
  readonly provenance: PeopleProvenance;
  readonly occurredAt: Date;
}

export interface PendingChange<Aggregate> {
  readonly aggregate: Aggregate;
  readonly events: readonly PeopleDomainEvent[];
}

export interface PersistedAggregate<Aggregate> {
  readonly aggregate: Aggregate;
  readonly revision: number;
  readonly lastEventSequence: number;
}

export interface CommitResult<Aggregate> extends PersistedAggregate<Aggregate> {
  readonly status: "APPLIED" | "REPLAYED";
  readonly eventIds: readonly string[];
  readonly committedAt: Date;
}

export interface PeopleHistoryEvent {
  readonly eventId: string;
  readonly aggregateType: PeopleAggregateType;
  readonly streamSequence: number;
  readonly aggregateRevision: number;
  readonly eventOrdinal: number;
  readonly eventType: string;
  readonly eventSchemaVersion: number;
  readonly payload: unknown;
  readonly causationId: string;
  readonly correlationId: string;
  readonly authority: string;
  readonly effectiveAt: Date;
  readonly recordedAt: Date;
}

export interface HistorySlice {
  readonly events: readonly PeopleHistoryEvent[];
  readonly fromSequence: number;
  readonly toSequence: number;
  readonly lastRevision: number;
  readonly hasMore: boolean;
}

export interface BusinessPersonRepository {
  load(personId: string): PersistedAggregate<BusinessPerson> | null;
  commit(
    expectedRevision: ExpectedRevision,
    change: PendingChange<BusinessPerson>,
    envelope: CommandEnvelope,
  ): CommitResult<BusinessPerson>;
  readHistory(personId: string, afterSequence?: number, limit?: number): HistorySlice;
  rehydrate(personId: string, atRevision?: number): PersistedAggregate<BusinessPerson> | null;
}

export interface WorkPeopleRepository {
  load(workReference: WorkReference): PersistedAggregate<WorkPeople> | null;
  loadByPerson(personId: string): readonly PersistedAggregate<WorkPeople>[];
  loadByAssignment(assignmentId: string): PersistedAggregate<WorkPeople> | null;
  commit(
    expectedRevision: ExpectedRevision,
    change: PendingChange<WorkPeople>,
    envelope: CommandEnvelope,
  ): CommitResult<WorkPeople>;
  readHistory(workReference: WorkReference, afterSequence?: number, limit?: number): HistorySlice;
  rehydrate(workReference: WorkReference, atRevision?: number): PersistedAggregate<WorkPeople> | null;
}

export interface PeoplePersistencePorts {
  readonly businessPersons: BusinessPersonRepository;
  readonly workPeople: WorkPeopleRepository;
}
