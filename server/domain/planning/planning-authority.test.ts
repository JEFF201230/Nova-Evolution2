import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import {
  BusinessInstant,
  BusinessPeriod,
  CausalityId,
  Constraint,
  ConstraintId,
  Dependency,
  Milestone,
  MilestoneId,
  Phase,
  PhaseId,
  Planning,
  PlanningAuthority,
  PlanningDomainError,
  PlanningElementReference,
  PlanningProvenance,
  PlanningRevision,
  PlanningVersion,
  Priority,
  Schedule,
  WorkReference,
  type EstablishPlanningCommand,
  type PlanningAuthorityResult,
  type RevisePlanningCommand,
  type WithdrawPlanningCommand,
} from "./index.js";

const WORK = WorkReference.of("project-planning", "work-planning");
const at = (day: number): Date =>
  new Date(`2026-10-${String(day).padStart(2, "0")}T09:00:00.000Z`);

function provenance(causality: string, day: number): PlanningProvenance {
  return PlanningProvenance.of(
    "NOVA_PLANNING_BUSINESS",
    "APPROVED_PLAN_PROPOSAL",
    causality,
    at(day),
  );
}

function instant(
  day: number,
  meaning: string,
  acceptedProvenance: PlanningProvenance,
): BusinessInstant {
  return BusinessInstant.of(
    at(day),
    meaning,
    acceptedProvenance,
    "BUSINESS_DECISION",
  );
}

function period(
  start: number,
  end: number,
  meaning: string,
  acceptedProvenance: PlanningProvenance,
): BusinessPeriod {
  return BusinessPeriod.of({
    start: instant(start, `${meaning} start`, acceptedProvenance),
    end: instant(end, `${meaning} end`, acceptedProvenance),
    startBoundary: "INCLUSIVE",
    endBoundary: "EXCLUSIVE",
    meaning,
    provenance: acceptedProvenance,
  });
}

function proposal(
  version: number,
  causality: string,
  day = version,
  variant: "INITIAL" | "REVISED" = "INITIAL",
): PlanningRevision {
  const acceptedProvenance = provenance(causality, day);
  const discovery = Phase.of(
    PhaseId.of("discovery"),
    variant === "INITIAL" ? "Clarify the business outcome." : "Clarify the revised outcome.",
  );
  const delivery = Phase.of(PhaseId.of("delivery"), "Deliver the accepted outcome.");
  const approval = Milestone.of(MilestoneId.of("approval"), "The outcome is accepted.");
  const launch = Milestone.of(MilestoneId.of("launch"), "The accepted outcome is launched.");
  const phases = variant === "INITIAL" ? [discovery, delivery] : [discovery];
  const milestones = variant === "INITIAL" ? [approval] : [approval, launch];
  const dependencies = variant === "INITIAL"
    ? [
      Dependency.from(discovery.reference, delivery.reference),
      Dependency.from(delivery.reference, approval.reference),
    ]
    : [Dependency.from(discovery.reference, approval.reference)];
  const schedule = Schedule.of(variant === "INITIAL"
    ? [
      { element: discovery.reference, time: period(2, 5, "discovery", acceptedProvenance) },
      { element: delivery.reference, time: period(6, 12, "delivery", acceptedProvenance) },
      { element: approval.reference, time: instant(13, "approval target", acceptedProvenance) },
    ]
    : [
      { element: discovery.reference, time: period(2, 6, "revised discovery", acceptedProvenance) },
      { element: approval.reference, time: instant(10, "revised approval", acceptedProvenance) },
      { element: launch.reference, time: instant(12, "launch target", acceptedProvenance) },
    ]);
  return PlanningRevision.of({
    version: PlanningVersion.of(version),
    applicability: period(1, 20, `version ${version} applicability`, acceptedProvenance),
    phases,
    milestones,
    dependencies,
    schedule,
    priorities: [
      Priority.of(discovery.reference, "delivery-sequence", variant, acceptedProvenance),
    ],
    constraints: [
      Constraint.of(
        ConstraintId.of("approval-window"),
        variant === "INITIAL" ? "Approval is required." : "Revised approval is required.",
        "SIGNED_STATEMENT_OF_WORK",
        "approval milestone",
        period(8, 15, "constraint effect", acceptedProvenance),
        acceptedProvenance,
      ),
    ],
    provenance: acceptedProvenance,
  });
}

function authority(options: { work?: boolean; objective?: boolean } = {}): PlanningAuthority {
  return PlanningAuthority.create("NOVA_PLANNING_BUSINESS", {
    workExists: () => options.work ?? true,
    objectiveAvailable: () => options.objective ?? true,
  });
}

function establishCommand(
  acceptedProposal = proposal(1, "establish-001", 1),
): EstablishPlanningCommand {
  return {
    kind: "ESTABLISH_PLANNING",
    workReference: WORK,
    causality: CausalityId.of(acceptedProposal.provenance.businessCause),
    provenance: acceptedProposal.provenance,
    expectedVersion: null,
    proposal: acceptedProposal,
  };
}

function reviseCommand(
  acceptedProposal = proposal(2, "revise-001", 2, "REVISED"),
): RevisePlanningCommand {
  return {
    kind: "REVISE_PLANNING",
    workReference: WORK,
    causality: CausalityId.of(acceptedProposal.provenance.businessCause),
    provenance: acceptedProposal.provenance,
    expectedVersion: PlanningVersion.of(1),
    proposal: acceptedProposal,
    reason: "Accepted business replanning.",
  };
}

function withdrawCommand(): WithdrawPlanningCommand {
  const acceptedProvenance = provenance("withdraw-001", 3);
  return {
    kind: "WITHDRAW_PLANNING",
    workReference: WORK,
    causality: CausalityId.of("withdraw-001"),
    provenance: acceptedProvenance,
    expectedVersion: PlanningVersion.of(2),
    reason: "The plan is no longer applicable.",
  };
}

function expectCode(
  code: PlanningDomainError["code"],
  action: () => unknown,
): void {
  assert.throws(action, (error: unknown) => {
    assert.ok(error instanceof PlanningDomainError);
    assert.equal(error.code, code);
    return true;
  });
}

function expectRejectedWithoutEffect(
  code: PlanningDomainError["code"],
  current: Planning,
  action: () => PlanningAuthorityResult,
): void {
  const versions = current.versions;
  const currentVersion = current.currentVersion;
  const withdrawalCausalities = current.withdrawalCausalities;
  let accepted: PlanningAuthorityResult | undefined;
  expectCode(code, () => {
    accepted = action();
  });
  assert.equal(accepted, undefined);
  assert.equal(current.versions, versions);
  assert.equal(current.currentVersion, currentVersion);
  assert.equal(current.withdrawalCausalities, withdrawalCausalities);
}

function expectEstablishmentRejected(
  code: PlanningDomainError["code"],
  command: EstablishPlanningCommand,
): void {
  let accepted: PlanningAuthorityResult | undefined;
  expectCode(code, () => {
    accepted = authority().establishPlanning(null, command);
  });
  assert.equal(accepted, undefined);
  assert.deepEqual(accepted?.events ?? [], []);
}

function forgedProposal(
  base: PlanningRevision,
  changes: Partial<Record<keyof PlanningRevision, unknown>>,
): PlanningRevision {
  return { ...base, ...changes } as unknown as PlanningRevision;
}

function established(): PlanningAuthorityResult {
  return authority().establishPlanning(null, establishCommand());
}

test("EstablishPlanning accepts one complete plan and emits root then granular facts", () => {
  const command = establishCommand();
  const accepted = authority().establishPlanning(null, command);

  assert.equal(accepted.aggregate.workReference, WORK);
  assert.equal(accepted.aggregate.currentVersion?.version.value, 1);
  assert.deepEqual(accepted.events.map((event) => event.name), [
    "PlanningEstablished",
    "PhaseAdded",
    "PhaseAdded",
    "MilestoneScheduled",
    "DependencyDeclared",
    "DependencyDeclared",
    "ConstraintDeclared",
    "ScheduleChanged",
    "PriorityChanged",
  ]);
  assert.ok(accepted.events.every((event) => event.causality === command.causality));
  assert.ok(accepted.events.every((event) => event.provenance === command.provenance));
  assert.ok(accepted.events.every((event) => event.version.value === 1));
  assert.ok(Object.isFrozen(accepted.events));
  const dependencyFacts = accepted.events.filter((event) => event.name === "DependencyDeclared");
  assert.equal(new Set(dependencyFacts.map((event) =>
    `${event.dependency.prerequisite.key}->${event.dependency.dependent.key}`
  )).size, dependencyFacts.length);
});

test("EstablishPlanning rejects duplicate Dependency and Priority identities with zero accepted result", () => {
  const producer = authority();
  const dependencyBase = proposal(1, "duplicate-dependency", 1);
  const dependency = dependencyBase.dependencies[0];
  assert.ok(dependency !== undefined);
  const duplicateDependency = {
    ...dependencyBase,
    dependencies: [dependency, dependency],
  } as unknown as PlanningRevision;
  let dependencyResult: PlanningAuthorityResult | undefined;
  expectCode("PLANNING_ELEMENT_DUPLICATE", () => {
    dependencyResult = producer.establishPlanning(null, establishCommand(duplicateDependency));
  });
  assert.equal(dependencyResult, undefined);

  const priorityBase = proposal(1, "duplicate-priority", 1);
  const priority = priorityBase.priorities[0];
  assert.ok(priority !== undefined);
  const duplicatePriority = {
    ...priorityBase,
    priorities: [priority, priority],
  } as unknown as PlanningRevision;
  let priorityResult: PlanningAuthorityResult | undefined;
  expectCode("PLANNING_ELEMENT_DUPLICATE", () => {
    priorityResult = producer.establishPlanning(null, establishCommand(duplicatePriority));
  });
  assert.equal(priorityResult, undefined);
});

test("EstablishPlanning rejects runtime-forged WorkReference identities before admission can approve them", () => {
  const acceptedProposal = proposal(1, "invalid-work-reference", 1);
  for (const [label, projectIdentity, workIdentity] of [
    ["empty project identity", "", "work-planning"],
    ["empty work identity", "project-planning", ""],
    ["both identities empty", "", ""],
  ] as const) {
    const invalidReference = Reflect.construct(
      WorkReference,
      [projectIdentity, workIdentity],
    ) as WorkReference;
    assert.equal(invalidReference instanceof WorkReference, true, label);
    expectEstablishmentRejected("WORK_REFERENCE_NOT_FOUND", {
      ...establishCommand(acceptedProposal),
      workReference: invalidReference,
    });
  }
});

test("EstablishPlanning revalidates intrinsic Phase, Milestone and Dependency semantics", () => {
  const phaseBase = proposal(1, "invalid-phase-purpose", 1);
  const validPhase = phaseBase.phases[0];
  assert.ok(validPhase !== undefined);
  const emptyPurpose = Reflect.construct(Phase, [validPhase.id, ""]) as Phase;
  expectEstablishmentRejected(
    "PLANNING_ELEMENT_NOT_FOUND",
    establishCommand(forgedProposal(phaseBase, { phases: [emptyPurpose] })),
  );

  const phaseIdBase = proposal(1, "invalid-phase-id", 1);
  const emptyPhaseId = Reflect.construct(PhaseId, [""]) as PhaseId;
  const invalidPhaseId = Reflect.construct(Phase, [emptyPhaseId, "Purpose."]) as Phase;
  expectEstablishmentRejected(
    "PLANNING_ELEMENT_NOT_FOUND",
    establishCommand(forgedProposal(phaseIdBase, { phases: [invalidPhaseId] })),
  );

  const milestoneBase = proposal(1, "invalid-milestone", 1);
  const emptyMilestoneId = Reflect.construct(MilestoneId, [""]) as MilestoneId;
  const invalidMilestone = Reflect.construct(Milestone, [emptyMilestoneId, ""]) as Milestone;
  expectEstablishmentRejected(
    "PLANNING_ELEMENT_NOT_FOUND",
    establishCommand(forgedProposal(milestoneBase, { milestones: [invalidMilestone] })),
  );

  const dependencyBase = proposal(1, "invalid-dependency", 1);
  const dependencyTarget = dependencyBase.phases[0]?.reference;
  assert.ok(dependencyTarget !== undefined);
  const invalidDependency = Reflect.construct(
    Dependency,
    [dependencyTarget, dependencyTarget],
  ) as Dependency;
  expectEstablishmentRejected(
    "INVALID_DEPENDENCY",
    establishCommand(forgedProposal(dependencyBase, { dependencies: [invalidDependency] })),
  );
});

test("EstablishPlanning rejects unqualified and technical Schedule time with zero accepted effect", () => {
  const structuralBase = proposal(1, "invalid-schedule-structural", 1);
  const target = structuralBase.phases[0]?.reference;
  assert.ok(target !== undefined);
  const structuralSchedule = Reflect.construct(Schedule, [[{
    element: target,
    time: {
      value: at(2),
      meaning: "unqualified structural time",
      provenance: structuralBase.provenance,
      origin: "BUSINESS_DECISION",
    },
  }]]) as Schedule;
  expectEstablishmentRejected(
    "INVALID_BUSINESS_TIME",
    establishCommand(forgedProposal(structuralBase, { schedule: structuralSchedule })),
  );

  const technicalBase = proposal(1, "invalid-schedule-technical", 1);
  const technicalTarget = technicalBase.phases[0]?.reference;
  assert.ok(technicalTarget !== undefined);
  const technicalInstant = Reflect.construct(BusinessInstant, [
    at(2).getTime(),
    "runtime updatedAt",
    technicalBase.provenance,
    "TECHNICAL_TIMESTAMP",
  ]) as BusinessInstant;
  const technicalSchedule = Reflect.construct(Schedule, [[{
    element: technicalTarget,
    time: technicalInstant,
  }]]) as Schedule;
  expectEstablishmentRejected(
    "TECHNICAL_PLANNING_SOURCE_FORBIDDEN",
    establishCommand(forgedProposal(technicalBase, { schedule: technicalSchedule })),
  );
});

test("EstablishPlanning revalidates Priority and Constraint qualification from observable values", () => {
  for (const [label, scope, qualification] of [
    ["empty priority scope", "", "critical"],
    ["empty priority qualification", "release", ""],
  ] as const) {
    const base = proposal(1, `invalid-${label.replaceAll(" ", "-")}`, 1);
    const target = base.phases[0]?.reference;
    assert.ok(target !== undefined);
    const invalid = Reflect.construct(Priority, [
      target,
      scope,
      qualification,
      base.provenance,
    ]) as Priority;
    expectEstablishmentRejected(
      "PRIORITY_SCOPE_REQUIRED",
      establishCommand(forgedProposal(base, { priorities: [invalid] })),
    );
  }

  for (const [label, condition, source, scope] of [
    ["empty constraint condition", "", "contract", "release"],
    ["empty constraint source", "Condition.", "", "release"],
    ["empty constraint scope", "Condition.", "contract", ""],
  ] as const) {
    const base = proposal(1, `invalid-${label.replaceAll(" ", "-")}`, 1);
    const valid = base.constraints[0];
    assert.ok(valid !== undefined);
    const invalid = Reflect.construct(Constraint, [
      valid.id,
      condition,
      source,
      scope,
      valid.effectPeriod,
      base.provenance,
    ]) as Constraint;
    expectEstablishmentRejected(
      "CONSTRAINT_QUALIFICATION_REQUIRED",
      establishCommand(forgedProposal(base, { constraints: [invalid] })),
    );
  }
});

test("EstablishPlanning revalidates applicability bounds and every nested business instant", () => {
  const reversedBase = proposal(1, "invalid-reversed-applicability", 1);
  const reversed = Reflect.construct(BusinessPeriod, [
    instant(8, "late start", reversedBase.provenance),
    instant(4, "early end", reversedBase.provenance),
    "INCLUSIVE",
    "EXCLUSIVE",
    "reversed applicability",
    reversedBase.provenance,
  ]) as BusinessPeriod;
  expectEstablishmentRejected(
    "INVALID_BUSINESS_TIME",
    establishCommand(forgedProposal(reversedBase, { applicability: reversed })),
  );

  const technicalBase = proposal(1, "invalid-applicability-time", 1);
  const technicalStart = Reflect.construct(BusinessInstant, [
    at(1).getTime(),
    "technical start",
    technicalBase.provenance,
    "TECHNICAL_TIMESTAMP",
  ]) as BusinessInstant;
  const invalidTime = Reflect.construct(BusinessPeriod, [
    technicalStart,
    instant(4, "business end", technicalBase.provenance),
    "INCLUSIVE",
    "EXCLUSIVE",
    "invalid applicability time",
    technicalBase.provenance,
  ]) as BusinessPeriod;
  expectEstablishmentRejected(
    "TECHNICAL_PLANNING_SOURCE_FORBIDDEN",
    establishCommand(forgedProposal(technicalBase, { applicability: invalidTime })),
  );
});

test("EstablishPlanning revalidates complete provenance and rejects plain structural nested values", () => {
  const emptySourceBase = proposal(1, "invalid-provenance-source", 1);
  const emptySource = Reflect.construct(PlanningProvenance, [
    "NOVA_PLANNING_BUSINESS",
    "",
    emptySourceBase.provenance.businessCause,
    at(1).getTime(),
  ]) as PlanningProvenance;
  expectEstablishmentRejected("PLANNING_PROVENANCE_REQUIRED", {
    ...establishCommand(emptySourceBase),
    provenance: emptySource,
    proposal: forgedProposal(emptySourceBase, { provenance: emptySource }),
  });

  const invalidTimeBase = proposal(1, "invalid-provenance-time", 1);
  const invalidTime = Reflect.construct(PlanningProvenance, [
    "NOVA_PLANNING_BUSINESS",
    "APPROVED_PLAN_PROPOSAL",
    invalidTimeBase.provenance.businessCause,
    Number.NaN,
  ]) as PlanningProvenance;
  expectEstablishmentRejected("INVALID_BUSINESS_TIME", {
    ...establishCommand(invalidTimeBase),
    provenance: invalidTime,
    proposal: forgedProposal(invalidTimeBase, { provenance: invalidTime }),
  });

  const structuralPriorityBase = proposal(1, "plain-structural-priority", 1);
  const structuralPriority = {
    element: structuralPriorityBase.phases[0]?.reference,
    scope: "",
    qualification: "",
    provenance: structuralPriorityBase.provenance,
  } as unknown as Priority;
  expectEstablishmentRejected(
    "PRIORITY_SCOPE_REQUIRED",
    establishCommand(forgedProposal(structuralPriorityBase, { priorities: [structuralPriority] })),
  );

  const structuralScheduleBase = proposal(1, "plain-structural-schedule", 1);
  const structuralSchedule = {
    entries: [{
      element: structuralScheduleBase.phases[0]?.reference,
      time: { value: at(2), meaning: "plain time" },
    }],
  } as unknown as Schedule;
  expectEstablishmentRejected(
    "INVALID_BUSINESS_TIME",
    establishCommand(forgedProposal(structuralScheduleBase, { schedule: structuralSchedule })),
  );
});

test("EstablishPlanning enforces Work, Objective, authority, version and current-plan preconditions", () => {
  const command = establishCommand();
  expectCode("WORK_REFERENCE_NOT_FOUND", () => authority({ work: false }).establishPlanning(null, command));
  expectCode("OBJECTIVE_UNAVAILABLE", () => authority({ objective: false }).establishPlanning(null, command));
  expectCode("PLANNING_CAUSALITY_CONFLICT", () => authority().establishPlanning(null, {
    ...command,
    causality: CausalityId.of("different-command-causality"),
  }));
  expectCode("PLANNING_PROVENANCE_REQUIRED", () =>
    PlanningAuthority.create("FOREIGN_AUTHORITY", {
      workExists: () => true,
      objectiveAvailable: () => true,
    }).establishPlanning(null, command));
  const wrongFirst = proposal(2, "wrong-first", 1);
  expectCode("PLANNING_VERSION_CONFLICT", () =>
    authority().establishPlanning(null, establishCommand(wrongFirst)));
  const first = established();
  expectCode("PLANNING_ALREADY_CURRENT", () =>
    authority().establishPlanning(first.aggregate, establishCommand(proposal(2, "another", 2))));
});

test("PlanningAuthority invokes admission for accepted Establish and Revise paths", () => {
  let workChecks = 0;
  let objectiveChecks = 0;
  const producer = PlanningAuthority.create("NOVA_PLANNING_BUSINESS", {
    workExists: () => {
      workChecks += 1;
      return true;
    },
    objectiveAvailable: () => {
      objectiveChecks += 1;
      return true;
    },
  });
  const established = producer.establishPlanning(null, establishCommand());
  const revised = producer.revisePlanning(established.aggregate, reviseCommand());
  producer.withdrawPlanning(revised.aggregate, withdrawCommand());

  assert.equal(workChecks, 3);
  assert.equal(objectiveChecks, 2);
});

test("EstablishPlanning fails closed for unverifiable replay and every changed business input", () => {
  const producer = authority();
  const command = establishCommand();
  const first = producer.establishPlanning(null, command);

  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", first.aggregate, () =>
    producer.establishPlanning(first.aggregate, command));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", first.aggregate, () =>
    producer.establishPlanning(first.aggregate, {
      ...command,
      expectedVersion: PlanningVersion.of(99),
    }));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", first.aggregate, () =>
    producer.establishPlanning(first.aggregate, {
      ...command,
      causality: CausalityId.of("changed-establish-causality"),
    }));

  const changedProvenance = PlanningProvenance.of(
    "NOVA_PLANNING_BUSINESS",
    "ALTERNATE_APPROVED_SOURCE",
    command.causality.value,
    at(1),
  );
  const changedProvenanceProposal = PlanningRevision.of({
    ...command.proposal,
    provenance: changedProvenance,
  });
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", first.aggregate, () =>
    producer.establishPlanning(first.aggregate, {
      ...command,
      provenance: changedProvenance,
      proposal: changedProvenanceProposal,
    }));

  const changedBusinessCause = establishCommand(proposal(1, "changed-business-cause", 1));
  expectRejectedWithoutEffect("PLANNING_ALREADY_CURRENT", first.aggregate, () =>
    producer.establishPlanning(first.aggregate, changedBusinessCause));

  const changedProposal = establishCommand(proposal(1, "establish-001", 1, "REVISED"));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", first.aggregate, () =>
    producer.establishPlanning(first.aggregate, changedProposal));
});

test("RevisePlanning atomically preserves history and emits the exact ordered business diff", () => {
  const producer = authority();
  const first = producer.establishPlanning(null, establishCommand());
  const command = reviseCommand();
  const revised = producer.revisePlanning(first.aggregate, command);

  assert.equal(revised.aggregate.currentVersion?.version.value, 2);
  assert.deepEqual(revised.aggregate.versions.map((value) => value.version.value), [1, 2]);
  assert.equal(revised.aggregate.versions[0], first.aggregate.versions[0]);
  assert.deepEqual(revised.events.map((event) => event.name), [
    "PlanningRevised",
    "DependencyRemoved",
    "DependencyRemoved",
    "PhaseChanged",
    "MilestoneScheduled",
    "DependencyDeclared",
    "ConstraintReleased",
    "ConstraintDeclared",
    "ScheduleChanged",
    "PriorityChanged",
    "PhaseRemoved",
  ]);
  const removedDependency = revised.events.findIndex((event) => event.name === "DependencyRemoved");
  const removedPhase = revised.events.findIndex((event) => event.name === "PhaseRemoved");
  assert.ok(removedDependency > 0 && removedDependency < removedPhase);
  assert.equal(revised.events.some((event) => event.name === ("MilestoneReached" as never)), false);
});

test("RevisePlanning enforces presence, current version, expected revision and causality", () => {
  const producer = authority();
  const command = reviseCommand();
  expectCode("PLANNING_NOT_FOUND", () => producer.revisePlanning(null, command));

  const first = producer.establishPlanning(null, establishCommand());
  const withdrawn = producer.withdrawPlanning(first.aggregate, {
    ...withdrawCommand(),
    expectedVersion: PlanningVersion.of(1),
  });
  expectCode("PLANNING_NOT_CURRENT", () => producer.revisePlanning(withdrawn.aggregate, command));
  expectCode("PLANNING_VERSION_CONFLICT", () => producer.revisePlanning(first.aggregate, {
    ...command,
    expectedVersion: PlanningVersion.of(2),
  }));
  expectCode("PLANNING_CAUSALITY_CONFLICT", () => producer.revisePlanning(
    first.aggregate,
    reviseCommand(proposal(2, "establish-001", 1, "REVISED")),
  ));
});

test("RevisePlanning validates the full proposal before returning any mutation or event", () => {
  const producer = authority();
  const first = producer.establishPlanning(null, establishCommand());
  const acceptedProvenance = provenance("invalid-global", 2);
  const missing = PlanningElementReference.milestone(MilestoneId.of("missing"));
  const invalid = {
    ...proposal(2, "invalid-global", 2),
    schedule: Schedule.of([{ element: missing, time: instant(3, "missing", acceptedProvenance) }]),
    provenance: acceptedProvenance,
  } as unknown as PlanningRevision;
  const command = reviseCommand(invalid);

  expectCode("PLANNING_ELEMENT_NOT_FOUND", () => producer.revisePlanning(first.aggregate, command));
  assert.equal(first.aggregate.currentVersion?.version.value, 1);
  assert.equal(first.aggregate.versions.length, 1);
});

test("RevisePlanning fails closed for unverifiable replay and every changed business input", () => {
  const producer = authority();
  const first = producer.establishPlanning(null, establishCommand());
  const command = reviseCommand();
  const revised = producer.revisePlanning(first.aggregate, command);

  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", revised.aggregate, () =>
    producer.revisePlanning(revised.aggregate, command));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", revised.aggregate, () =>
    producer.revisePlanning(revised.aggregate, {
      ...command,
      expectedVersion: PlanningVersion.of(99),
    }));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", revised.aggregate, () =>
    producer.revisePlanning(revised.aggregate, {
      ...command,
      reason: "A different accepted replanning reason.",
    }));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", revised.aggregate, () =>
    producer.revisePlanning(revised.aggregate, {
      ...command,
      causality: CausalityId.of("changed-revise-causality"),
    }));

  const changedProvenance = PlanningProvenance.of(
    "NOVA_PLANNING_BUSINESS",
    "ALTERNATE_APPROVED_SOURCE",
    command.causality.value,
    at(2),
  );
  const changedProvenanceProposal = PlanningRevision.of({
    ...command.proposal,
    provenance: changedProvenance,
  });
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", revised.aggregate, () =>
    producer.revisePlanning(revised.aggregate, {
      ...command,
      provenance: changedProvenance,
      proposal: changedProvenanceProposal,
    }));

  const changedBusinessCause = reviseCommand(proposal(2, "changed-revise-cause", 2, "REVISED"));
  expectRejectedWithoutEffect("PLANNING_VERSION_CONFLICT", revised.aggregate, () =>
    producer.revisePlanning(revised.aggregate, changedBusinessCause));

  const changedProposal = reviseCommand(proposal(3, "revise-001", 2, "INITIAL"));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", revised.aggregate, () =>
    producer.revisePlanning(revised.aggregate, changedProposal));
});

test("WithdrawPlanning emits once, preserves history and fails closed when replay cannot be proven", () => {
  const producer = authority();
  const first = producer.establishPlanning(null, establishCommand());
  const revised = producer.revisePlanning(first.aggregate, reviseCommand());
  const command = withdrawCommand();
  const withdrawn = producer.withdrawPlanning(revised.aggregate, command);

  assert.equal(withdrawn.aggregate.currentVersion, null);
  assert.deepEqual(withdrawn.aggregate.versions.map((value) => value.version.value), [1, 2]);
  assert.equal(withdrawn.aggregate.versions[0], revised.aggregate.versions[0]);
  assert.equal(withdrawn.aggregate.versions[1], revised.aggregate.versions[1]);
  assert.deepEqual(withdrawn.events.map((event) => event.name), ["PlanningWithdrawn"]);
  assert.equal(withdrawn.events[0]?.causality, command.causality);
  assert.equal(withdrawn.events[0]?.provenance, command.provenance);
  assert.equal(withdrawn.aggregate.hasConsumedCausality(command.causality), true);
  assert.deepEqual(withdrawn.aggregate.withdrawalCausalities.map((value) => value.value), ["withdraw-001"]);
  assert.ok(Object.isFrozen(withdrawn.aggregate.withdrawalCausalities));

  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", withdrawn.aggregate, () =>
    producer.withdrawPlanning(withdrawn.aggregate, command));
  expectRejectedWithoutEffect("PLANNING_NOT_CURRENT", withdrawn.aggregate, () => producer.withdrawPlanning(withdrawn.aggregate, {
    ...command,
    causality: CausalityId.of("withdraw-altered-causality"),
    provenance: provenance("withdraw-altered-causality", 4),
  }));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", withdrawn.aggregate, () => producer.withdrawPlanning(withdrawn.aggregate, {
    ...command,
    provenance: provenance("withdraw-001", 4),
  }));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", withdrawn.aggregate, () => producer.withdrawPlanning(withdrawn.aggregate, {
    ...command,
    reason: "A different canonical withdrawal reason.",
  }));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", withdrawn.aggregate, () => producer.withdrawPlanning(withdrawn.aggregate, {
    ...command,
    causality: CausalityId.of("revise-001"),
    provenance: provenance("revise-001", 2),
  }));

  const reusedForEstablish = establishCommand(proposal(3, "withdraw-001", 3));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", withdrawn.aggregate, () =>
    producer.establishPlanning(withdrawn.aggregate, {
      ...reusedForEstablish,
      expectedVersion: PlanningVersion.of(2),
    }));
  const reusedForRevise = reviseCommand(proposal(3, "withdraw-001", 3, "REVISED"));
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", withdrawn.aggregate, () =>
    producer.revisePlanning(withdrawn.aggregate, {
      ...reusedForRevise,
      expectedVersion: PlanningVersion.of(2),
    }));

  const reestablish = establishCommand(proposal(3, "reestablish-001", 4));
  const reestablished = producer.establishPlanning(withdrawn.aggregate, {
    ...reestablish,
    expectedVersion: PlanningVersion.of(2),
  });
  assert.equal(reestablished.aggregate.currentVersion?.version.value, 3);
  assert.deepEqual(reestablished.aggregate.versions.map((value) => value.version.value), [1, 2, 3]);
  assert.equal(reestablished.aggregate.hasConsumedCausality(command.causality), true);
  const reusedForLaterRevision = reviseCommand(
    proposal(4, "withdraw-001", 5, "REVISED"),
  );
  expectRejectedWithoutEffect("PLANNING_CAUSALITY_CONFLICT", reestablished.aggregate, () =>
    producer.revisePlanning(reestablished.aggregate, {
      ...reusedForLaterRevision,
      expectedVersion: PlanningVersion.of(3),
    }));
  assert.deepEqual(withdrawn.events.map((event) => event.name), ["PlanningWithdrawn"]);
  assert.equal(withdrawn.aggregate.currentVersion, null);
});

test("WithdrawPlanning enforces history, current applicability, version and explicit reason with zero effect", () => {
  const producer = authority();
  const command = withdrawCommand();
  expectCode("PLANNING_NOT_FOUND", () => producer.withdrawPlanning(null, command));
  const first = producer.establishPlanning(null, establishCommand());
  expectCode("PLANNING_VERSION_CONFLICT", () => producer.withdrawPlanning(first.aggregate, command));
  expectCode("PLANNING_PROVENANCE_REQUIRED", () => producer.withdrawPlanning(first.aggregate, {
    ...command,
    expectedVersion: PlanningVersion.of(1),
    reason: "",
  }));
  assert.equal(first.aggregate.currentVersion?.version.value, 1);
  assert.equal(first.aggregate.versions.length, 1);
});

test("PlanningAuthority remains the only aggregate producer and has no persistence dependency", async () => {
  const directProposal = proposal(1, "direct-construction", 1);
  expectCode("PLANNING_VERSION_CONFLICT", () => Planning.of(
    { scope: "PLANNING_AUTHORITY" } as never,
    WORK,
    [directProposal],
    directProposal.version,
  ));

  const directory = new URL("./", import.meta.url);
  const indexSource = await readFile(new URL("index.ts", directory), "utf8");
  assert.doesNotMatch(indexSource, /planningFoundationAccess|planningAuthorityAccess/u);

  const files = await readdir(directory);
  assert.equal(files.includes("planning-foundation-access.ts"), false);
  assert.equal(files.includes("planning-authority.guard.ts"), false);
  assert.deepEqual(files.filter((file) => /planning-authority\.ts$/u.test(file)), ["planning-authority.ts"]);
  const authorityFiles = files.filter((file) =>
    file.startsWith("planning-authority") && !file.endsWith(".test.ts")
  );
  const authoritySource = (await Promise.all(authorityFiles.map((file) =>
    readFile(new URL(file, directory), "utf8")
  ))).join("\n");
  assert.doesNotMatch(authoritySource, /repository|persistence|migration|query|timeline|sqlite|database/iu);

  const productionFiles = files.filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));
  const source = (await Promise.all(productionFiles.map((file) =>
    readFile(new URL(file, directory), "utf8")
  ))).join("\n");
  assert.doesNotMatch(source, /function\s+planning(?:Foundation|Authority)Access/u);
  const authorityModule = await import("./planning-authority.js");
  assert.equal("AUTHORITY_ACCESS" in authorityModule, false);
  assert.equal("planningFoundationAccess" in authorityModule, false);
  assert.equal("planningAuthorityAccess" in authorityModule, false);
  assert.doesNotMatch(source, /server\/runtime|server\/nova-bff|domain\/people|express|fetch\(/u);
  assert.doesNotMatch(await readFile(new URL("planning-authority.events.ts", directory), "utf8"), /MilestoneReached/u);
  assert.doesNotMatch(await readFile(new URL("planning-authority.commands.ts", directory), "utf8"), /RecordMilestoneReached/u);
});

test("runtime constructors reject direct and structurally forged aggregate production", async () => {
  const validRevision = proposal(1, "runtime-constructor", 1);
  const revisionDefinition = {
    version: validRevision.version,
    applicability: validRevision.applicability,
    phases: validRevision.phases,
    milestones: validRevision.milestones,
    dependencies: validRevision.dependencies,
    schedule: validRevision.schedule,
    priorities: validRevision.priorities,
    constraints: validRevision.constraints,
    provenance: validRevision.provenance,
  };

  let directRevision: PlanningRevision | undefined;
  expectCode("PLANNING_VERSION_CONFLICT", () => {
    directRevision = Reflect.construct(PlanningRevision, [revisionDefinition]) as PlanningRevision;
  });
  assert.equal(directRevision, undefined);
  expectCode("PLANNING_VERSION_CONFLICT", () => Reflect.construct(PlanningRevision, [
    Object.freeze({ scope: "PLANNING_REVISION_CONSTRUCTION" }),
    revisionDefinition,
  ]));

  let directPlanning: Planning | undefined;
  expectCode("PLANNING_VERSION_CONFLICT", () => {
    directPlanning = Reflect.construct(Planning, [WORK, [validRevision], 0]) as Planning;
  });
  assert.equal(directPlanning, undefined);
  expectCode("PLANNING_VERSION_CONFLICT", () => Reflect.construct(Planning, [
    Object.freeze({ scope: "PLANNING_AGGREGATE_CONSTRUCTION" }),
    WORK,
    [validRevision],
    0,
    [],
  ]));

  const nonContiguous = proposal(3, "runtime-gap", 3);
  expectCode("PLANNING_VERSION_CONFLICT", () => Reflect.construct(Planning, [
    WORK,
    [validRevision, nonContiguous],
    1,
  ]));
  expectCode("PLANNING_VERSION_CONFLICT", () => Reflect.construct(Planning, [
    WORK,
    [validRevision, nonContiguous],
    0,
  ]));

  const aggregateModule = await import("./planning.aggregate.js");
  assert.deepEqual(Object.keys(aggregateModule).sort(), ["Planning", "PlanningRevision"]);
  const aggregateSource = await readFile(new URL("planning.aggregate.ts", new URL("./", import.meta.url)), "utf8");
  assert.doesNotMatch(aggregateSource, /export\s+(?:const|function)\s+\w*CONSTRUCTION/iu);
});
