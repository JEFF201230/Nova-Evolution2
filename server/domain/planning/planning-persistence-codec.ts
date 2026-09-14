import {
  PlanningRevision,
  type PlanningRevisionDefinition,
} from "./planning.aggregate.js";
import type { PlanningDomainEvent } from "./planning-authority.events.js";
import {
  Constraint,
  Dependency,
  Milestone,
  Phase,
  Priority,
  Schedule,
} from "./planning.entities.js";
import {
  BusinessInstant,
  BusinessPeriod,
  ConstraintId,
  MilestoneId,
  PhaseId,
  PlanningElementReference,
  PlanningProvenance,
  PlanningVersion,
  type BusinessTimeOrigin,
  type PeriodBoundary,
} from "./planning.value-objects.js";

export type SerializedProvenance = Readonly<{
  authority: string;
  source: string;
  businessCause: string;
  effectiveAtEpochMs: number;
}>;

type SerializedReference = Readonly<{ kind: "PHASE" | "MILESTONE"; id: string }>;
type SerializedInstant = Readonly<{
  kind: "INSTANT";
  epochMs: number;
  meaning: string;
  provenance: SerializedProvenance;
  origin: BusinessTimeOrigin;
}>;
type SerializedPeriod = Readonly<{
  kind: "PERIOD";
  start: SerializedInstant | null;
  end: SerializedInstant | null;
  startBoundary: PeriodBoundary;
  endBoundary: PeriodBoundary;
  meaning: string;
  provenance: SerializedProvenance;
}>;

export type SerializedPlanningRevision = Readonly<{
  version: number;
  applicability: SerializedPeriod;
  phases: readonly Readonly<{ id: string; purpose: string }>[];
  milestones: readonly Readonly<{ id: string; plannedOutcome: string }>[];
  dependencies: readonly Readonly<{
    prerequisite: SerializedReference;
    dependent: SerializedReference;
  }>[];
  schedule: readonly Readonly<{
    element: SerializedReference;
    time: SerializedInstant | SerializedPeriod;
  }>[];
  priorities: readonly Readonly<{
    element: SerializedReference;
    scope: string;
    qualification: string;
    provenance: SerializedProvenance;
  }>[];
  constraints: readonly Readonly<{
    id: string;
    condition: string;
    source: string;
    scope: string;
    effectPeriod: SerializedPeriod;
    provenance: SerializedProvenance;
  }>[];
  provenance: SerializedProvenance;
}>;

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

export function serializeProvenance(value: PlanningProvenance): SerializedProvenance {
  return {
    authority: value.authority,
    source: value.source,
    businessCause: value.businessCause,
    effectiveAtEpochMs: value.effectiveAt.getTime(),
  };
}

export function deserializeProvenance(value: SerializedProvenance): PlanningProvenance {
  return PlanningProvenance.of(
    value.authority,
    value.source,
    value.businessCause,
    new Date(value.effectiveAtEpochMs),
  );
}

export function serializeRevision(value: PlanningRevision): SerializedPlanningRevision {
  return {
    version: value.version.value,
    applicability: serializePeriod(value.applicability),
    phases: value.phases.map((phase) => ({ id: phase.id.value, purpose: phase.purpose })),
    milestones: value.milestones.map((milestone) => ({
      id: milestone.id.value,
      plannedOutcome: milestone.plannedOutcome,
    })),
    dependencies: value.dependencies.map((dependency) => ({
      prerequisite: serializeReference(dependency.prerequisite),
      dependent: serializeReference(dependency.dependent),
    })),
    schedule: value.schedule.entries.map((entry) => ({
      element: serializeReference(entry.element),
      time: entry.time instanceof BusinessInstant
        ? serializeInstant(entry.time)
        : serializePeriod(entry.time),
    })),
    priorities: value.priorities.map((priority) => ({
      element: serializeReference(priority.element),
      scope: priority.scope,
      qualification: priority.qualification,
      provenance: serializeProvenance(priority.provenance),
    })),
    constraints: value.constraints.map((constraint) => ({
      id: constraint.id.value,
      condition: constraint.condition,
      source: constraint.source,
      scope: constraint.scope,
      effectPeriod: serializePeriod(constraint.effectPeriod),
      provenance: serializeProvenance(constraint.provenance),
    })),
    provenance: serializeProvenance(value.provenance),
  };
}

export function deserializeRevision(value: SerializedPlanningRevision): PlanningRevision {
  const definition: PlanningRevisionDefinition = {
    version: PlanningVersion.of(value.version),
    applicability: deserializePeriod(value.applicability),
    phases: value.phases.map((phase) => Phase.of(PhaseId.of(phase.id), phase.purpose)),
    milestones: value.milestones.map((milestone) =>
      Milestone.of(MilestoneId.of(milestone.id), milestone.plannedOutcome)),
    dependencies: value.dependencies.map((dependency) => Dependency.from(
      deserializeReference(dependency.prerequisite),
      deserializeReference(dependency.dependent),
    )),
    schedule: Schedule.of(value.schedule.map((entry) => ({
      element: deserializeReference(entry.element),
      time: entry.time.kind === "INSTANT"
        ? deserializeInstant(entry.time)
        : deserializePeriod(entry.time),
    }))),
    priorities: value.priorities.map((priority) => Priority.of(
      deserializeReference(priority.element),
      priority.scope,
      priority.qualification,
      deserializeProvenance(priority.provenance),
    )),
    constraints: value.constraints.map((constraint) => Constraint.of(
      ConstraintId.of(constraint.id),
      constraint.condition,
      constraint.source,
      constraint.scope,
      deserializePeriod(constraint.effectPeriod),
      deserializeProvenance(constraint.provenance),
    )),
    provenance: deserializeProvenance(value.provenance),
  };
  return PlanningRevision.of(definition);
}

export function serializeEventPayload(event: PlanningDomainEvent): unknown {
  const { workReference: _work, version: _version, causality: _cause,
    provenance: _provenance, name: _name, ...payload } = event;
  return encode(payload);
}

function serializeReference(value: PlanningElementReference): SerializedReference {
  return { kind: value.kind, id: value.id };
}

function deserializeReference(value: SerializedReference): PlanningElementReference {
  return value.kind === "PHASE"
    ? PlanningElementReference.phase(PhaseId.of(value.id))
    : PlanningElementReference.milestone(MilestoneId.of(value.id));
}

function serializeInstant(value: BusinessInstant): SerializedInstant {
  return {
    kind: "INSTANT",
    epochMs: value.value.getTime(),
    meaning: value.meaning,
    provenance: serializeProvenance(value.provenance),
    origin: value.origin,
  };
}

function deserializeInstant(value: SerializedInstant): BusinessInstant {
  return BusinessInstant.of(
    new Date(value.epochMs),
    value.meaning,
    deserializeProvenance(value.provenance),
    value.origin,
  );
}

function serializePeriod(value: BusinessPeriod): SerializedPeriod {
  return {
    kind: "PERIOD",
    start: value.start === null ? null : serializeInstant(value.start),
    end: value.end === null ? null : serializeInstant(value.end),
    startBoundary: value.startBoundary,
    endBoundary: value.endBoundary,
    meaning: value.meaning,
    provenance: serializeProvenance(value.provenance),
  };
}

function deserializePeriod(value: SerializedPeriod): BusinessPeriod {
  return BusinessPeriod.of({
    start: value.start === null ? null : deserializeInstant(value.start),
    end: value.end === null ? null : deserializeInstant(value.end),
    startBoundary: value.startBoundary,
    endBoundary: value.endBoundary,
    meaning: value.meaning,
    provenance: deserializeProvenance(value.provenance),
  });
}

function encode(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return { kind: "DATE", epochMs: value.getTime() };
  if (value instanceof PlanningProvenance) return serializeProvenance(value);
  if (value instanceof BusinessInstant) return serializeInstant(value);
  if (value instanceof BusinessPeriod) return serializePeriod(value);
  if (value instanceof PlanningElementReference) return serializeReference(value);
  if (value instanceof Phase) return { id: value.id.value, purpose: value.purpose };
  if (value instanceof Milestone) return { id: value.id.value, plannedOutcome: value.plannedOutcome };
  if (value instanceof Dependency) return {
    prerequisite: serializeReference(value.prerequisite),
    dependent: serializeReference(value.dependent),
  };
  if (value instanceof Schedule) return value.entries.map(encode);
  if (value instanceof Priority) return {
    element: serializeReference(value.element), scope: value.scope,
    qualification: value.qualification, provenance: serializeProvenance(value.provenance),
  };
  if (value instanceof Constraint) return {
    id: value.id.value, condition: value.condition, source: value.source, scope: value.scope,
    effectPeriod: serializePeriod(value.effectPeriod), provenance: serializeProvenance(value.provenance),
  };
  if (Array.isArray(value)) return value.map(encode);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)]));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, sortJson(item)]));
  }
  return value;
}

