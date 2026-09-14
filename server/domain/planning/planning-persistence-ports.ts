import type { Planning, PlanningRevision } from "./planning.aggregate.js";
import type { PlanningDomainEvent } from "./planning-authority.events.js";
import type { PlanningProvenance, WorkReference } from "./planning.value-objects.js";

export type ExpectedPlanningRevision = number;

export interface PlanningCommandEnvelope {
  readonly commandType: "ESTABLISH_PLANNING" | "REVISE_PLANNING" | "WITHDRAW_PLANNING";
  readonly causationId: string;
  readonly correlationId: string;
  readonly requestFingerprint: string;
  readonly fingerprintVersion: number;
  readonly provenance: PlanningProvenance;
}

export interface PendingPlanningChange {
  readonly aggregate: Planning;
  readonly events: readonly PlanningDomainEvent[];
}

export interface PersistedPlanning {
  readonly aggregate: Planning;
  /** Monotone persistence-stream revision used for CAS; distinct from PlanningVersion. */
  readonly revision: number;
  readonly lastEventSequence: number;
}

export interface PlanningCommitResult extends PersistedPlanning {
  readonly status: "APPLIED" | "REPLAYED";
  readonly eventIds: readonly string[];
  readonly committedAt: Date;
}

export interface PlanningHistoryEvent {
  readonly eventId: string;
  readonly streamSequence: number;
  readonly aggregateRevision: number;
  readonly eventOrdinal: number;
  readonly eventType: PlanningDomainEvent["name"];
  readonly payload: unknown;
  readonly causationId: string;
  readonly correlationId: string;
  readonly provenance: PlanningProvenance;
  readonly recordedAt: Date;
}

export interface PlanningHistorySlice {
  readonly events: readonly PlanningHistoryEvent[];
  readonly fromSequence: number;
  readonly toSequence: number;
  readonly lastRevision: number;
  readonly hasMore: boolean;
}

export interface PlanningRepository {
  load(workReference: WorkReference): PersistedPlanning | null;
  commit(
    expectedRevision: ExpectedPlanningRevision,
    change: PendingPlanningChange,
    envelope: PlanningCommandEnvelope,
  ): PlanningCommitResult;
  readHistory(
    workReference: WorkReference,
    afterSequence?: number,
    limit?: number,
  ): PlanningHistorySlice;
  rehydrate(workReference: WorkReference, atRevision?: number): PersistedPlanning | null;
  readVersions(workReference: WorkReference): readonly PlanningRevision[];
}

