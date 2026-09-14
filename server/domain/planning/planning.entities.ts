import { PlanningDomainError } from "./planning.errors.js";
import {
  BusinessInstant,
  BusinessPeriod,
  ConstraintId,
  MilestoneId,
  PhaseId,
  PlanningElementReference,
  PlanningProvenance,
  assertBusinessInstant,
  assertBusinessPeriod,
  assertConstraintId,
  assertMilestoneId,
  assertPhaseId,
  assertPlanningElementReference,
  assertPlanningProvenance,
  assertText,
} from "./planning.value-objects.js";

export class Phase {
  private constructor(
    readonly id: PhaseId,
    readonly purpose: string,
  ) {
    Object.freeze(this);
  }

  static of(id: PhaseId, purpose: string): Phase {
    validatePhaseValues(id, purpose);
    return new Phase(id, purpose);
  }

  get reference(): PlanningElementReference {
    return PlanningElementReference.phase(this.id);
  }
}

export class Milestone {
  private constructor(
    readonly id: MilestoneId,
    readonly plannedOutcome: string,
  ) {
    Object.freeze(this);
  }

  static of(id: MilestoneId, plannedOutcome: string): Milestone {
    validateMilestoneValues(id, plannedOutcome);
    return new Milestone(id, plannedOutcome);
  }

  get reference(): PlanningElementReference {
    return PlanningElementReference.milestone(this.id);
  }
}

export class Dependency {
  private constructor(
    readonly prerequisite: PlanningElementReference,
    readonly dependent: PlanningElementReference,
  ) {
    Object.freeze(this);
  }

  static from(
    prerequisite: PlanningElementReference,
    dependent: PlanningElementReference,
  ): Dependency {
    validateDependencyValues(prerequisite, dependent);
    return new Dependency(prerequisite, dependent);
  }
}

export type ScheduleEntry = Readonly<{
  element: PlanningElementReference;
  time: BusinessInstant | BusinessPeriod;
}>;

export class Schedule {
  private constructor(readonly entries: readonly ScheduleEntry[]) {
    Object.freeze(this);
  }

  static of(entries: readonly ScheduleEntry[]): Schedule {
    assertScheduleEntries(entries);
    return new Schedule(Object.freeze(entries.map((entry) => Object.freeze({ ...entry }))));
  }
}

export class Priority {
  private constructor(
    readonly element: PlanningElementReference,
    readonly scope: string,
    readonly qualification: string,
    readonly provenance: PlanningProvenance,
  ) {
    Object.freeze(this);
  }

  static of(
    element: PlanningElementReference,
    scope: string,
    qualification: string,
    provenance: PlanningProvenance,
  ): Priority {
    validatePriorityValues(element, scope, qualification, provenance);
    return new Priority(element, scope, qualification, provenance);
  }
}

export class Constraint {
  private constructor(
    readonly id: ConstraintId,
    readonly condition: string,
    readonly source: string,
    readonly scope: string,
    readonly effectPeriod: BusinessPeriod,
    readonly provenance: PlanningProvenance,
  ) {
    Object.freeze(this);
  }

  static of(
    id: ConstraintId,
    condition: string,
    source: string,
    scope: string,
    effectPeriod: BusinessPeriod,
    provenance: PlanningProvenance,
  ): Constraint {
    validateConstraintValues(id, condition, source, scope, effectPeriod, provenance);
    return new Constraint(id, condition, source, scope, effectPeriod, provenance);
  }
}

export function assertPhase(value: unknown): asserts value is Phase {
  if (!(value instanceof Phase)) {
    throw new PlanningDomainError("PLANNING_ELEMENT_NOT_FOUND", "Phase must be explicit.");
  }
  validatePhaseValues(value.id, value.purpose);
}

export function assertMilestone(value: unknown): asserts value is Milestone {
  if (!(value instanceof Milestone)) {
    throw new PlanningDomainError("PLANNING_ELEMENT_NOT_FOUND", "Milestone must be explicit.");
  }
  validateMilestoneValues(value.id, value.plannedOutcome);
}

export function assertDependency(value: unknown): asserts value is Dependency {
  if (!(value instanceof Dependency)) {
    throw new PlanningDomainError("INVALID_DEPENDENCY", "Dependency must be explicit.");
  }
  validateDependencyValues(value.prerequisite, value.dependent);
}

export function assertSchedule(value: unknown): asserts value is Schedule {
  if (!(value instanceof Schedule)) {
    throw new PlanningDomainError(
      "INVALID_BUSINESS_TIME",
      "Schedule must contain explicitly qualified business time.",
    );
  }
  assertScheduleEntries(value.entries);
  if (!Object.isFrozen(value.entries)
    || value.entries.some((entry) => !Object.isFrozen(entry))) {
    throw new PlanningDomainError(
      "INVALID_BUSINESS_TIME",
      "Accepted Schedule entries must be immutable Foundation values.",
    );
  }
}

export function assertPriority(value: unknown): asserts value is Priority {
  if (!(value instanceof Priority)) {
    throw new PlanningDomainError(
      "PRIORITY_SCOPE_REQUIRED",
      "Priority must be explicitly qualified.",
    );
  }
  validatePriorityValues(value.element, value.scope, value.qualification, value.provenance);
}

export function assertConstraint(value: unknown): asserts value is Constraint {
  if (!(value instanceof Constraint)) {
    throw new PlanningDomainError(
      "CONSTRAINT_QUALIFICATION_REQUIRED",
      "Constraint must be explicitly qualified.",
    );
  }
  validateConstraintValues(
    value.id,
    value.condition,
    value.source,
    value.scope,
    value.effectPeriod,
    value.provenance,
  );
}

function validatePhaseValues(id: unknown, purpose: unknown): void {
  assertPhaseId(id);
  assertEntityText(purpose, "Phase purpose");
}

function validateMilestoneValues(id: unknown, plannedOutcome: unknown): void {
  assertMilestoneId(id);
  assertEntityText(plannedOutcome, "Milestone planned outcome");
}

function validateDependencyValues(prerequisite: unknown, dependent: unknown): void {
  assertPlanningElementReference(prerequisite);
  assertPlanningElementReference(dependent);
  if (prerequisite.equals(dependent)) {
    throw new PlanningDomainError(
      "INVALID_DEPENDENCY",
      "A Planning element cannot depend on itself.",
    );
  }
}

function validatePriorityValues(
  element: unknown,
  scope: unknown,
  qualification: unknown,
  provenance: unknown,
): void {
  assertPlanningElementReference(element);
  assertText(scope, "Priority scope", "PRIORITY_SCOPE_REQUIRED");
  assertText(qualification, "Priority qualification", "PRIORITY_SCOPE_REQUIRED");
  assertPlanningProvenance(provenance);
}

function validateConstraintValues(
  id: unknown,
  condition: unknown,
  source: unknown,
  scope: unknown,
  effectPeriod: unknown,
  provenance: unknown,
): void {
  assertConstraintId(id);
  assertText(condition, "Constraint condition", "CONSTRAINT_QUALIFICATION_REQUIRED");
  assertText(source, "Constraint source", "CONSTRAINT_QUALIFICATION_REQUIRED");
  assertText(scope, "Constraint scope", "CONSTRAINT_QUALIFICATION_REQUIRED");
  assertBusinessPeriod(effectPeriod);
  assertPlanningProvenance(provenance);
}

function assertScheduleEntries(value: unknown): asserts value is readonly ScheduleEntry[] {
  if (!Array.isArray(value)) {
    throw new PlanningDomainError(
      "INVALID_BUSINESS_TIME",
      "Schedule entries must be an explicit collection.",
    );
  }
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      throw new PlanningDomainError(
        "INVALID_BUSINESS_TIME",
        "Each Schedule entry must reference an element and carry qualified business time.",
      );
    }
    const candidate = entry as { element?: unknown; time?: unknown };
    assertPlanningElementReference(candidate.element);
    if (candidate.time instanceof BusinessInstant) {
      assertBusinessInstant(candidate.time);
    } else if (candidate.time instanceof BusinessPeriod) {
      assertBusinessPeriod(candidate.time);
    } else {
      throw new PlanningDomainError(
        "INVALID_BUSINESS_TIME",
        "Each Schedule entry must reference an element and carry qualified business time.",
      );
    }
  }
}

function assertEntityText(value: unknown, field: string): void {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) {
    throw new PlanningDomainError(
      "PLANNING_ELEMENT_NOT_FOUND",
      `${field} must be explicit and canonical.`,
    );
  }
}
