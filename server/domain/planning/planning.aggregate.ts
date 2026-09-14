import { PlanningDomainError } from "./planning.errors.js";
import {
  assertPlanningAuthorityAccess,
  type PlanningAuthorityAccess,
} from "./planning-authority.js";
import {
  Constraint,
  Dependency,
  Milestone,
  Phase,
  Priority,
  Schedule,
  assertConstraint,
  assertDependency,
  assertMilestone,
  assertPhase,
  assertPriority,
  assertSchedule,
} from "./planning.entities.js";
import {
  BusinessPeriod,
  CausalityId,
  PlanningElementReference,
  PlanningProvenance,
  PlanningVersion,
  WorkReference,
  assertBusinessPeriod,
  assertCausalityId,
  assertPlanningElementReference,
  assertPlanningProvenance,
  assertPlanningVersion,
  assertWorkReference,
} from "./planning.value-objects.js";

const REVISION_CONSTRUCTION = Object.freeze({ scope: "PLANNING_REVISION_CONSTRUCTION" });
const AGGREGATE_CONSTRUCTION = Object.freeze({ scope: "PLANNING_AGGREGATE_CONSTRUCTION" });

export type PlanningRevisionDefinition = Readonly<{
  version: PlanningVersion;
  applicability: BusinessPeriod;
  phases: readonly Phase[];
  milestones: readonly Milestone[];
  dependencies: readonly Dependency[];
  schedule: Schedule;
  priorities: readonly Priority[];
  constraints: readonly Constraint[];
  provenance: PlanningProvenance;
}>;

export class PlanningRevision {
  readonly version: PlanningVersion;
  readonly applicability: BusinessPeriod;
  readonly phases: readonly Phase[];
  readonly milestones: readonly Milestone[];
  readonly dependencies: readonly Dependency[];
  readonly schedule: Schedule;
  readonly priorities: readonly Priority[];
  readonly constraints: readonly Constraint[];
  readonly provenance: PlanningProvenance;

  private constructor(
    construction: typeof REVISION_CONSTRUCTION,
    definition: PlanningRevisionDefinition,
  ) {
    assertConstructionAccess(construction, REVISION_CONSTRUCTION, "PlanningRevision");
    this.version = definition.version;
    this.applicability = definition.applicability;
    this.phases = Object.freeze([...definition.phases]);
    this.milestones = Object.freeze([...definition.milestones]);
    this.dependencies = Object.freeze([...definition.dependencies]);
    this.schedule = definition.schedule;
    this.priorities = Object.freeze([...definition.priorities]);
    this.constraints = Object.freeze([...definition.constraints]);
    this.provenance = definition.provenance;
    Object.freeze(this);
  }

  static of(definition: PlanningRevisionDefinition): PlanningRevision {
    validateRevision(definition);
    return new PlanningRevision(REVISION_CONSTRUCTION, definition);
  }
}

export class Planning {
  private readonly immutableRevisions: readonly PlanningRevision[];
  private readonly immutableWithdrawalCausalities: readonly CausalityId[];
  private readonly currentIndex: number | null;

  private constructor(
    construction: typeof AGGREGATE_CONSTRUCTION,
    readonly workReference: WorkReference,
    revisions: readonly PlanningRevision[],
    currentIndex: number | null,
    withdrawalCausalities: readonly CausalityId[],
  ) {
    assertConstructionAccess(construction, AGGREGATE_CONSTRUCTION, "Planning");
    this.immutableRevisions = Object.freeze([...revisions]);
    this.immutableWithdrawalCausalities = Object.freeze([...withdrawalCausalities]);
    this.currentIndex = currentIndex;
    Object.freeze(this);
  }

  static of(
    access: PlanningAuthorityAccess,
    workReference: WorkReference,
    revisions: readonly PlanningRevision[],
    currentVersion: PlanningVersion | null,
    withdrawalCausalities: readonly CausalityId[] = [],
  ): Planning {
    assertPlanningAuthorityAccess(access);
    assertWorkReference(workReference);
    if (revisions.length === 0) {
      throw new PlanningDomainError(
        "PLANNING_VERSION_CONFLICT",
        "A Planning aggregate exists only when at least one immutable version exists.",
      );
    }
    for (const revision of revisions) {
      if (!(revision instanceof PlanningRevision)) {
        throw new PlanningDomainError(
          "PLANNING_VERSION_CONFLICT",
          "Planning history must contain authorized immutable revisions.",
        );
      }
      validateRevision(revision);
    }
    for (let index = 1; index < revisions.length; index += 1) {
      const previous = revisions[index - 1];
      const current = revisions[index];
      if (previous === undefined || current === undefined
        || !current.version.immediatelyFollows(previous.version)) {
        throw new PlanningDomainError(
          "PLANNING_VERSION_CONFLICT",
          "Planning versions must be unique, contiguous and strictly ordered.",
        );
      }
    }

    let currentIndex: number | null = null;
    if (currentVersion !== null) {
      currentIndex = revisions.findIndex((revision) => revision.version.equals(currentVersion));
      if (currentIndex < 0 || currentIndex !== revisions.length - 1) {
        throw new PlanningDomainError(
          "PLANNING_VERSION_CONFLICT",
          "The sole current version must be the latest immutable Planning version.",
        );
      }
    }
    assertCausalitiesUnique(revisions, withdrawalCausalities);
    return new Planning(
      AGGREGATE_CONSTRUCTION,
      workReference,
      revisions,
      currentIndex,
      withdrawalCausalities,
    );
  }

  get versions(): readonly PlanningRevision[] {
    return this.immutableRevisions;
  }

  get currentVersion(): PlanningRevision | null {
    return this.currentIndex === null ? null : this.immutableRevisions[this.currentIndex] ?? null;
  }

  get historicalVersions(): readonly PlanningRevision[] {
    return this.currentIndex === null
      ? this.immutableRevisions
      : Object.freeze(this.immutableRevisions.filter((_, index) => index !== this.currentIndex));
  }

  get withdrawalCausalities(): readonly CausalityId[] {
    return this.immutableWithdrawalCausalities;
  }

  hasConsumedCausality(causality: CausalityId): boolean {
    return this.immutableRevisions.some((revision) =>
      revision.provenance.businessCause === causality.value
    ) || this.immutableWithdrawalCausalities.some((accepted) => accepted.equals(causality));
  }

  hasSameIdentity(other: Planning): boolean {
    return this.workReference.equals(other.workReference);
  }
}

function assertConstructionAccess(
  actual: object,
  expected: object,
  target: string,
): void {
  if (actual !== expected) {
    throw new PlanningDomainError(
      "PLANNING_VERSION_CONFLICT",
      `${target} can only be constructed through its authorized production path.`,
    );
  }
}

function assertCausalitiesUnique(
  revisions: readonly PlanningRevision[],
  withdrawalCausalities: readonly CausalityId[],
): void {
  const accepted = new Set<string>();
  for (const revision of revisions) {
    const causality = revision.provenance.businessCause;
    if (accepted.has(causality)) {
      throw new PlanningDomainError(
        "PLANNING_CAUSALITY_CONFLICT",
        "Accepted Planning mutation causalities must remain unique across aggregate history.",
      );
    }
    accepted.add(causality);
  }
  for (const causality of withdrawalCausalities) {
    assertCausalityId(causality);
    if (accepted.has(causality.value)) {
      throw new PlanningDomainError(
        "PLANNING_CAUSALITY_CONFLICT",
        "Accepted Planning mutation causalities must remain unique across aggregate history.",
      );
    }
    accepted.add(causality.value);
  }
}

function validateRevision(definition: PlanningRevisionDefinition): void {
  assertPlanningVersion(definition.version);
  assertBusinessPeriod(definition.applicability);
  assertPlanningProvenance(definition.provenance);
  assertArray(definition.phases, "Phase");
  assertArray(definition.milestones, "Milestone");
  assertArray(definition.dependencies, "Dependency");
  assertArray(definition.priorities, "Priority");
  assertArray(definition.constraints, "Constraint");
  for (const phase of definition.phases) {
    assertPhase(phase);
  }
  for (const milestone of definition.milestones) {
    assertMilestone(milestone);
  }
  for (const dependency of definition.dependencies) {
    assertDependency(dependency);
  }
  assertSchedule(definition.schedule);
  for (const priority of definition.priorities) {
    assertPriority(priority);
  }
  for (const constraint of definition.constraints) {
    assertConstraint(constraint);
  }
  const phaseKeys = definition.phases.map((phase) => phase.reference.key);
  const milestoneKeys = definition.milestones.map((milestone) => milestone.reference.key);
  const elementKeys = new Set<string>();
  assertUnique(phaseKeys, elementKeys, "Phase");
  assertUnique(milestoneKeys, elementKeys, "Milestone");

  const constraintKeys = new Set<string>();
  assertUnique(
    definition.constraints.map((constraint) => constraint.id.value),
    constraintKeys,
    "Constraint",
  );

  for (const dependency of definition.dependencies) {
    assertElementExists(dependency.prerequisite, elementKeys);
    assertElementExists(dependency.dependent, elementKeys);
  }
  assertUnique(
    definition.dependencies.map((dependency) =>
      `${dependency.prerequisite.key}->${dependency.dependent.key}`
    ),
    new Set<string>(),
    "Dependency",
  );
  assertAcyclic(definition.dependencies, elementKeys);

  for (const entry of definition.schedule.entries) {
    assertElementExists(entry.element, elementKeys);
  }
  for (const priority of definition.priorities) {
    assertElementExists(priority.element, elementKeys);
  }
  assertUnique(
    definition.priorities.map((priority) => `${priority.element.key}::${priority.scope}`),
    new Set<string>(),
    "Priority",
  );
}

function assertUnique(values: readonly string[], seen: Set<string>, label: string): void {
  for (const value of values) {
    if (seen.has(value)) {
      throw new PlanningDomainError(
        "PLANNING_ELEMENT_DUPLICATE",
        `${label} identity ${value} is duplicated in the Planning version.`,
      );
    }
    seen.add(value);
  }
}

function assertElementExists(
  reference: PlanningElementReference,
  elementKeys: ReadonlySet<string>,
): void {
  assertPlanningElementReference(reference);
  if (!elementKeys.has(reference.key)) {
    throw new PlanningDomainError(
      "PLANNING_ELEMENT_NOT_FOUND",
      `Planning element ${reference.key} does not exist in the version.`,
    );
  }
}

function assertArray(value: unknown, label: string): asserts value is readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new PlanningDomainError(
      "PLANNING_ELEMENT_NOT_FOUND",
      `${label} collection must be explicit in the complete Planning proposal.`,
    );
  }
}

function assertAcyclic(
  dependencies: readonly Dependency[],
  elementKeys: ReadonlySet<string>,
): void {
  const outgoing = new Map<string, string[]>();
  for (const key of elementKeys) {
    outgoing.set(key, []);
  }
  for (const dependency of dependencies) {
    outgoing.get(dependency.prerequisite.key)?.push(dependency.dependent.key);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (key: string): void => {
    if (visiting.has(key)) {
      throw new PlanningDomainError("DEPENDENCY_CYCLE", "The Planning dependency graph contains a cycle.");
    }
    if (visited.has(key)) {
      return;
    }
    visiting.add(key);
    for (const next of outgoing.get(key) ?? []) {
      visit(next);
    }
    visiting.delete(key);
    visited.add(key);
  };
  for (const key of elementKeys) {
    visit(key);
  }
}
