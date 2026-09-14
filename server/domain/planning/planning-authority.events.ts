import type { PlanningRevision } from "./planning.aggregate.js";
import type {
  Constraint,
  Dependency,
  Milestone,
  Phase,
  Priority,
  Schedule,
} from "./planning.entities.js";
import type {
  BusinessPeriod,
  CausalityId,
  PlanningElementReference,
  PlanningProvenance,
  PlanningVersion,
  WorkReference,
} from "./planning.value-objects.js";

type PlanningEventBase = Readonly<{
  workReference: WorkReference;
  version: PlanningVersion;
  causality: CausalityId;
  provenance: PlanningProvenance;
}>;

export type PlanningEstablished = PlanningEventBase & Readonly<{
  name: "PlanningEstablished";
  applicability: BusinessPeriod;
}>;

export type PlanningRevised = PlanningEventBase & Readonly<{
  name: "PlanningRevised";
  previousVersion: PlanningVersion;
  reason: string;
}>;

export type PlanningWithdrawn = PlanningEventBase & Readonly<{
  name: "PlanningWithdrawn";
  effectiveAt: Date;
  reason: string;
}>;

export type PhaseAdded = PlanningEventBase & Readonly<{
  name: "PhaseAdded";
  phase: Phase;
}>;

export type PhaseChanged = PlanningEventBase & Readonly<{
  name: "PhaseChanged";
  previous: Phase;
  current: Phase;
}>;

export type PhaseRemoved = PlanningEventBase & Readonly<{
  name: "PhaseRemoved";
  phase: Phase;
  effectiveAt: Date;
}>;

export type MilestoneScheduled = PlanningEventBase & Readonly<{
  name: "MilestoneScheduled";
  milestone: Milestone;
}>;

export type MilestoneChanged = PlanningEventBase & Readonly<{
  name: "MilestoneChanged";
  previous: Milestone;
  current: Milestone;
}>;

export type MilestoneRemoved = PlanningEventBase & Readonly<{
  name: "MilestoneRemoved";
  milestone: Milestone;
  effectiveAt: Date;
}>;

export type DependencyDeclared = PlanningEventBase & Readonly<{
  name: "DependencyDeclared";
  dependency: Dependency;
}>;

export type DependencyRemoved = PlanningEventBase & Readonly<{
  name: "DependencyRemoved";
  dependency: Dependency;
}>;

export type ConstraintDeclared = PlanningEventBase & Readonly<{
  name: "ConstraintDeclared";
  constraint: Constraint;
}>;

export type ConstraintReleased = PlanningEventBase & Readonly<{
  name: "ConstraintReleased";
  constraint: Constraint;
  effectiveAt: Date;
}>;

export type ScheduleChanged = PlanningEventBase & Readonly<{
  name: "ScheduleChanged";
  previous: Schedule | null;
  current: Schedule;
}>;

export type PriorityChanged = PlanningEventBase & Readonly<{
  name: "PriorityChanged";
  element: PlanningElementReference;
  scope: string;
  previous: Priority | null;
  current: Priority | null;
}>;

export type PlanningDomainEvent =
  | PlanningEstablished
  | PlanningRevised
  | PlanningWithdrawn
  | PhaseAdded
  | PhaseChanged
  | PhaseRemoved
  | MilestoneScheduled
  | MilestoneChanged
  | MilestoneRemoved
  | DependencyDeclared
  | DependencyRemoved
  | ConstraintDeclared
  | ConstraintReleased
  | ScheduleChanged
  | PriorityChanged;

export type PlanningRevisionEventSource = Readonly<{
  previous: PlanningRevision | null;
  current: PlanningRevision;
}>;
