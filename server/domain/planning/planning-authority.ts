import {
  Planning,
  PlanningRevision,
  type PlanningRevisionDefinition,
} from "./planning.aggregate.js";
import type {
  EstablishPlanningCommand,
  RevisePlanningCommand,
  WithdrawPlanningCommand,
} from "./planning-authority.commands.js";
import type { PlanningDomainEvent } from "./planning-authority.events.js";
import { PlanningDomainError } from "./planning.errors.js";
import type {
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
  type CausalityId,
  type PlanningProvenance,
  type PlanningVersion,
  type WorkReference,
  assertCausalityId,
  assertPlanningProvenance,
  assertWorkReference,
} from "./planning.value-objects.js";

const AUTHORITY_ACCESS = Object.freeze({
  scope: "PLANNING_AUTHORITY",
});

export type PlanningAuthorityAccess = typeof AUTHORITY_ACCESS;

export function assertPlanningAuthorityAccess(
  access: PlanningAuthorityAccess,
): void {
  if (access !== AUTHORITY_ACCESS) {
    throw new PlanningDomainError(
      "PLANNING_VERSION_CONFLICT",
      "Planning aggregates can only be produced by PlanningAuthority.",
    );
  }
}

export interface PlanningAdmissionPolicy {
  workExists(workReference: WorkReference): boolean;
  objectiveAvailable(workReference: WorkReference): boolean;
}

export type PlanningAuthorityResult = Readonly<{
  aggregate: Planning;
  events: readonly PlanningDomainEvent[];
}>;

/** The sole internal business acceptance boundary for Planning mutations. */
export class PlanningAuthority {
  private constructor(
    readonly authority: string,
    private readonly admission: PlanningAdmissionPolicy,
  ) {
    if (authority.length === 0 || authority !== authority.trim()) {
      throw new PlanningDomainError(
        "PLANNING_PROVENANCE_REQUIRED",
        "PlanningAuthority requires a canonical business authority.",
      );
    }
    Object.freeze(this);
  }

  static create(
    authority: string,
    admission: PlanningAdmissionPolicy,
  ): PlanningAuthority {
    return new PlanningAuthority(authority, admission);
  }

  establishPlanning(
    current: Planning | null,
    command: EstablishPlanningCommand,
  ): PlanningAuthorityResult {
    this.assertCommon(command.workReference, command.causality, command.provenance, true);
    this.assertAggregateIdentity(current, command.workReference);
    const proposal = validateCompleteProposal(command.proposal, command.provenance);
    this.assertCausalityUnused(current, command.causality);

    if (current?.currentVersion !== null && current !== null) {
      throw new PlanningDomainError(
        "PLANNING_ALREADY_CURRENT",
        "A current Planning already exists for this Work.",
      );
    }

    const latest = latestVersion(current);
    assertExpectedVersion(latest, command.expectedVersion);
    assertNextVersion(latest, proposal.version);

    const aggregate = Planning.of(
      AUTHORITY_ACCESS,
      command.workReference,
      [...(current?.versions ?? []), proposal],
      proposal.version,
      current?.withdrawalCausalities ?? [],
    );
    return result(aggregate, establishmentEvents(command, proposal));
  }

  revisePlanning(
    current: Planning | null,
    command: RevisePlanningCommand,
  ): PlanningAuthorityResult {
    this.assertCommon(command.workReference, command.causality, command.provenance, true);
    assertReason(command.reason);
    this.assertAggregateIdentity(current, command.workReference);
    const proposal = validateCompleteProposal(command.proposal, command.provenance);
    this.assertCausalityUnused(current, command.causality);

    const planning = requirePlanning(current);
    const previous = requireCurrent(planning);
    assertExpectedVersion(previous.version, command.expectedVersion);
    assertNextVersion(previous.version, proposal.version);

    const aggregate = Planning.of(
      AUTHORITY_ACCESS,
      planning.workReference,
      [...planning.versions, proposal],
      proposal.version,
      planning.withdrawalCausalities,
    );
    return result(aggregate, revisionEvents(command, previous, proposal));
  }

  withdrawPlanning(
    current: Planning | null,
    command: WithdrawPlanningCommand,
  ): PlanningAuthorityResult {
    this.assertCommon(command.workReference, command.causality, command.provenance, false);
    assertReason(command.reason);
    this.assertAggregateIdentity(current, command.workReference);
    const planning = requirePlanning(current);
    this.assertCausalityUnused(planning, command.causality);
    if (planning.currentVersion === null) {
      throw new PlanningDomainError(
        "PLANNING_NOT_CURRENT",
        "No applicable Planning version can be withdrawn and no withdrawal replay receipt exists in 001C.",
      );
    }
    assertExpectedVersion(planning.currentVersion.version, command.expectedVersion);

    const aggregate = Planning.of(
      AUTHORITY_ACCESS,
      planning.workReference,
      planning.versions,
      null,
      [...planning.withdrawalCausalities, command.causality],
    );
    return result(aggregate, [domainEvent(command, planning.currentVersion.version, {
      name: "PlanningWithdrawn",
      effectiveAt: command.provenance.effectiveAt,
      reason: command.reason,
    })]);
  }

  private assertCommon(
    workReference: WorkReference,
    causality: CausalityId,
    provenance: PlanningProvenance,
    objectiveRequired: boolean,
  ): void {
    assertWorkReference(workReference);
    assertCausalityId(causality);
    assertPlanningProvenance(provenance);
    if (provenance.authority !== this.authority) {
      throw new PlanningDomainError(
        "PLANNING_PROVENANCE_REQUIRED",
        "Only this PlanningAuthority can accept the business provenance.",
      );
    }
    if (provenance.businessCause !== causality.value) {
      throw new PlanningDomainError(
        "PLANNING_CAUSALITY_CONFLICT",
        "Command causality must match its explicit provenance business cause.",
      );
    }
    if (!this.admission.workExists(workReference)) {
      throw new PlanningDomainError(
        "WORK_REFERENCE_NOT_FOUND",
        "WorkReference does not identify an authoritative Work.",
      );
    }
    if (objectiveRequired && !this.admission.objectiveAvailable(workReference)) {
      throw new PlanningDomainError(
        "OBJECTIVE_UNAVAILABLE",
        "The authoritative Objective is unavailable for Planning acceptance.",
      );
    }
  }

  private assertAggregateIdentity(
    current: Planning | null,
    workReference: WorkReference,
  ): void {
    if (current !== null && !current.workReference.equals(workReference)) {
      throw new PlanningDomainError(
        "WORK_REFERENCE_NOT_FOUND",
        "The command targets a different Work than the Planning aggregate.",
      );
    }
  }

  private assertCausalityUnused(
    current: Planning | null,
    causality: CausalityId,
  ): void {
    if (current?.hasConsumedCausality(causality) === true) {
      throw causalityConflict();
    }
  }
}

function validateCompleteProposal(
  proposal: PlanningRevision,
  provenance: PlanningProvenance,
): PlanningRevision {
  assertPlanningProvenance(provenance);
  assertPlanningProvenance(proposal?.provenance);
  if (!proposal.provenance.equals(provenance)) {
    throw new PlanningDomainError(
      "PLANNING_PROVENANCE_REQUIRED",
      "The complete proposal and command must carry identical provenance.",
    );
  }
  const definition: PlanningRevisionDefinition = {
    version: proposal.version,
    applicability: proposal.applicability,
    phases: proposal.phases,
    milestones: proposal.milestones,
    dependencies: proposal.dependencies,
    schedule: proposal.schedule,
    priorities: proposal.priorities,
    constraints: proposal.constraints,
    provenance: proposal.provenance,
  };
  return PlanningRevision.of(definition);
}

function establishmentEvents(
  command: EstablishPlanningCommand,
  current: PlanningRevision,
): readonly PlanningDomainEvent[] {
  const events: PlanningDomainEvent[] = [domainEvent(command, current.version, {
    name: "PlanningEstablished",
    applicability: current.applicability,
  })];
  for (const phase of current.phases) {
    events.push(domainEvent(command, current.version, { name: "PhaseAdded", phase }));
  }
  for (const milestone of current.milestones) {
    events.push(domainEvent(command, current.version, { name: "MilestoneScheduled", milestone }));
  }
  for (const dependency of current.dependencies) {
    events.push(domainEvent(command, current.version, { name: "DependencyDeclared", dependency }));
  }
  for (const constraint of current.constraints) {
    events.push(domainEvent(command, current.version, { name: "ConstraintDeclared", constraint }));
  }
  if (current.schedule.entries.length > 0) {
    events.push(domainEvent(command, current.version, {
      name: "ScheduleChanged",
      previous: null,
      current: current.schedule,
    }));
  }
  for (const priority of current.priorities) {
    events.push(priorityEvent(command, current.version, null, priority));
  }
  return Object.freeze(events);
}

function revisionEvents(
  command: RevisePlanningCommand,
  previous: PlanningRevision,
  current: PlanningRevision,
): readonly PlanningDomainEvent[] {
  const events: PlanningDomainEvent[] = [domainEvent(command, current.version, {
    name: "PlanningRevised",
    previousVersion: previous.version,
    reason: command.reason,
  })];

  const previousDependencies = keyed(previous.dependencies, dependencyKey);
  const currentDependencies = keyed(current.dependencies, dependencyKey);
  for (const [key, dependency] of previousDependencies) {
    if (!currentDependencies.has(key)) {
      events.push(domainEvent(command, current.version, { name: "DependencyRemoved", dependency }));
    }
  }

  diffEntities(previous.phases, current.phases, phaseKey, phaseEquals,
    (phase) => events.push(domainEvent(command, current.version, { name: "PhaseAdded", phase })),
    (before, after) => events.push(domainEvent(command, current.version, {
      name: "PhaseChanged", previous: before, current: after,
    })));
  diffEntities(previous.milestones, current.milestones, milestoneKey, milestoneEquals,
    (milestone) => events.push(domainEvent(command, current.version, { name: "MilestoneScheduled", milestone })),
    (before, after) => events.push(domainEvent(command, current.version, {
      name: "MilestoneChanged", previous: before, current: after,
    })));

  for (const [key, dependency] of currentDependencies) {
    if (!previousDependencies.has(key)) {
      events.push(domainEvent(command, current.version, { name: "DependencyDeclared", dependency }));
    }
  }

  const previousConstraints = keyed(previous.constraints, constraintKey);
  const currentConstraints = keyed(current.constraints, constraintKey);
  for (const [key, constraint] of previousConstraints) {
    const next = currentConstraints.get(key);
    if (next === undefined || !constraintEquals(constraint, next)) {
      events.push(domainEvent(command, current.version, {
        name: "ConstraintReleased",
        constraint,
        effectiveAt: command.provenance.effectiveAt,
      }));
    }
  }
  for (const [key, constraint] of currentConstraints) {
    const before = previousConstraints.get(key);
    if (before === undefined || !constraintEquals(before, constraint)) {
      events.push(domainEvent(command, current.version, { name: "ConstraintDeclared", constraint }));
    }
  }

  if (!scheduleEquals(previous.schedule, current.schedule)) {
    events.push(domainEvent(command, current.version, {
      name: "ScheduleChanged",
      previous: previous.schedule,
      current: current.schedule,
    }));
  }
  const previousPriorities = keyed(previous.priorities, priorityKey);
  const currentPriorities = keyed(current.priorities, priorityKey);
  for (const key of new Set([...previousPriorities.keys(), ...currentPriorities.keys()])) {
    const before = previousPriorities.get(key) ?? null;
    const after = currentPriorities.get(key) ?? null;
    if (before === null || after === null || !priorityEquals(before, after)) {
      events.push(priorityEvent(command, current.version, before, after));
    }
  }

  const currentPhaseKeys = new Set(current.phases.map(phaseKey));
  for (const phase of previous.phases) {
    if (!currentPhaseKeys.has(phaseKey(phase))) {
      events.push(domainEvent(command, current.version, {
        name: "PhaseRemoved", phase, effectiveAt: command.provenance.effectiveAt,
      }));
    }
  }
  const currentMilestoneKeys = new Set(current.milestones.map(milestoneKey));
  for (const milestone of previous.milestones) {
    if (!currentMilestoneKeys.has(milestoneKey(milestone))) {
      events.push(domainEvent(command, current.version, {
        name: "MilestoneRemoved", milestone, effectiveAt: command.provenance.effectiveAt,
      }));
    }
  }
  return Object.freeze(events);
}

function priorityEvent(
  command: EstablishPlanningCommand | RevisePlanningCommand,
  version: PlanningVersion,
  previous: Priority | null,
  current: Priority | null,
): PlanningDomainEvent {
  const value = current ?? previous;
  if (value === null) {
    throw new PlanningDomainError("PRIORITY_SCOPE_REQUIRED", "Priority change requires a value.");
  }
  return domainEvent(command, version, {
    name: "PriorityChanged",
    element: value.element,
    scope: value.scope,
    previous,
    current,
  });
}

function domainEvent(
  command: EstablishPlanningCommand | RevisePlanningCommand | WithdrawPlanningCommand,
  version: PlanningVersion,
  detail: PlanningEventDetail,
): PlanningDomainEvent {
  const value = {
    ...detail,
    workReference: command.workReference,
    version,
    causality: command.causality,
    provenance: command.provenance,
  } as PlanningDomainEvent;
  if ("effectiveAt" in value) {
    const epochMs = value.effectiveAt.getTime();
    Object.defineProperty(value, "effectiveAt", {
      enumerable: true,
      configurable: false,
      get: () => new Date(epochMs),
    });
  }
  return Object.freeze(value);
}

type PlanningEventDetail = PlanningDomainEvent extends infer Event
  ? Event extends PlanningDomainEvent
    ? Omit<Event, "workReference" | "version" | "causality" | "provenance">
    : never
  : never;

function diffEntities<T>(
  previous: readonly T[],
  current: readonly T[],
  keyOf: (value: T) => string,
  equals: (left: T, right: T) => boolean,
  added: (value: T) => void,
  changed: (before: T, after: T) => void,
): void {
  const before = keyed(previous, keyOf);
  for (const value of current) {
    const old = before.get(keyOf(value));
    if (old === undefined) {
      added(value);
    } else if (!equals(old, value)) {
      changed(old, value);
    }
  }
}

function keyed<T>(values: readonly T[], keyOf: (value: T) => string): Map<string, T> {
  return new Map(values.map((value) => [keyOf(value), value]));
}

function latestVersion(current: Planning | null): PlanningVersion | null {
  return current?.versions[current.versions.length - 1]?.version ?? null;
}

function requirePlanning(current: Planning | null): Planning {
  if (current === null) {
    throw new PlanningDomainError("PLANNING_NOT_FOUND", "No Planning history exists for this Work.");
  }
  return current;
}

function requireCurrent(current: Planning): PlanningRevision {
  if (current.currentVersion === null) {
    throw new PlanningDomainError("PLANNING_NOT_CURRENT", "No applicable Planning version exists.");
  }
  return current.currentVersion;
}

function assertExpectedVersion(
  canonical: PlanningVersion | null,
  expected: PlanningVersion | null,
): void {
  if ((canonical === null) !== (expected === null)
    || (canonical !== null && expected !== null && !canonical.equals(expected))) {
    throw new PlanningDomainError(
      "PLANNING_VERSION_CONFLICT",
      "Expected Planning version differs from the canonical revision.",
    );
  }
}

function assertNextVersion(previous: PlanningVersion | null, next: PlanningVersion): void {
  if ((previous === null && next.value !== 1)
    || (previous !== null && !next.immediatelyFollows(previous))) {
    throw new PlanningDomainError(
      "PLANNING_VERSION_CONFLICT",
      "The accepted Planning version must strictly and contiguously follow history.",
    );
  }
}

function assertReason(reason: string): void {
  if (reason.length === 0 || reason !== reason.trim()) {
    throw new PlanningDomainError(
      "PLANNING_PROVENANCE_REQUIRED",
      "Planning revision or withdrawal requires an explicit canonical reason.",
    );
  }
}

function causalityConflict(): PlanningDomainError {
  return new PlanningDomainError(
    "PLANNING_CAUSALITY_CONFLICT",
    "A Planning causality cannot be reused with different command content.",
  );
}

const phaseKey = (value: Phase): string => value.id.value;
const milestoneKey = (value: Milestone): string => value.id.value;
const constraintKey = (value: Constraint): string => value.id.value;
const dependencyKey = (value: Dependency): string =>
  `${value.prerequisite.key}->${value.dependent.key}`;
const priorityKey = (value: Priority): string => `${value.element.key}::${value.scope}`;
const phaseEquals = (left: Phase, right: Phase): boolean =>
  left.id.equals(right.id) && left.purpose === right.purpose;
const milestoneEquals = (left: Milestone, right: Milestone): boolean =>
  left.id.equals(right.id) && left.plannedOutcome === right.plannedOutcome;
const dependencyEquals = (left: Dependency, right: Dependency): boolean =>
  left.prerequisite.equals(right.prerequisite) && left.dependent.equals(right.dependent);
const priorityEquals = (left: Priority, right: Priority): boolean =>
  left.element.equals(right.element)
    && left.scope === right.scope
    && left.qualification === right.qualification
    && left.provenance.equals(right.provenance);
const constraintEquals = (left: Constraint, right: Constraint): boolean =>
  left.id.equals(right.id)
    && left.condition === right.condition
    && left.source === right.source
    && left.scope === right.scope
    && periodEquals(left.effectPeriod, right.effectPeriod)
    && left.provenance.equals(right.provenance);

function scheduleEquals(left: Schedule, right: Schedule): boolean {
  return arraysEqual(left.entries, right.entries, (first, second) =>
    first.element.equals(second.element) && businessTimeEquals(first.time, second.time));
}

function businessTimeEquals(
  left: BusinessInstant | BusinessPeriod,
  right: BusinessInstant | BusinessPeriod,
): boolean {
  if (left instanceof BusinessInstant && right instanceof BusinessInstant) {
    return left.equals(right);
  }
  return left instanceof BusinessPeriod
    && right instanceof BusinessPeriod
    && periodEquals(left, right);
}

function periodEquals(left: BusinessPeriod, right: BusinessPeriod): boolean {
  return instantOrNullEquals(left.start, right.start)
    && instantOrNullEquals(left.end, right.end)
    && left.startBoundary === right.startBoundary
    && left.endBoundary === right.endBoundary
    && left.meaning === right.meaning
    && left.provenance.equals(right.provenance);
}

function instantOrNullEquals(
  left: BusinessInstant | null,
  right: BusinessInstant | null,
): boolean {
  return left === null ? right === null : right !== null && left.equals(right);
}

function arraysEqual<T>(
  left: readonly T[],
  right: readonly T[],
  equals: (first: T, second: T) => boolean,
): boolean {
  return left.length === right.length
    && left.every((value, index) => {
      const other = right[index];
      return other !== undefined && equals(value, other);
    });
}

function result(
  aggregate: Planning,
  events: readonly PlanningDomainEvent[],
): PlanningAuthorityResult {
  return Object.freeze({ aggregate, events: Object.freeze([...events]) });
}
