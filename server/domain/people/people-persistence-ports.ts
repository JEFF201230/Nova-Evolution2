export type PeopleAggregateType = "BUSINESS_PERSON" | "WORK_PEOPLE";

export interface PeopleAggregateSnapshot {
  readonly aggregateType: PeopleAggregateType;
  readonly aggregateId: string;
  readonly revision: number;
  readonly payload: unknown;
}

export interface PeoplePersistenceContext {
  readonly causationId: string;
  readonly correlationId: string;
  readonly requestHash: string;
  readonly occurredAt: string;
}

export interface PeopleStoredSnapshot {
  readonly snapshot: PeopleAggregateSnapshot;
  readonly updatedAt: string;
}

export interface PeopleTransaction {
  run<T>(operation: () => T): T;
}

export interface PeopleAggregateRepository {
  load(
    aggregateType: PeopleAggregateType,
    aggregateId: string,
  ): PeopleStoredSnapshot | null;
  save(
    expectedRevision: number,
    snapshot: PeopleAggregateSnapshot,
    context: PeoplePersistenceContext,
  ): PeopleStoredSnapshot;
}

export interface PeoplePersistencePorts {
  readonly transaction: PeopleTransaction;
  readonly aggregates: PeopleAggregateRepository;
}

