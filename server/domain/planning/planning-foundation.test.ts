import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
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
} from "./index.js";

const at = (day: number): Date => new Date(`2026-09-${String(day).padStart(2, "0")}T09:00:00.000Z`);

function provenance(day = 1): PlanningProvenance {
  return PlanningProvenance.of(
    "NOVA_PLANNING_BUSINESS",
    "APPROVED_PLAN_PROPOSAL",
    `business-plan-${day}`,
    at(day),
  );
}

function instant(day: number, meaning: string): BusinessInstant {
  return BusinessInstant.of(at(day), meaning, provenance(day), "BUSINESS_DECISION");
}

function period(startDay: number, endDay: number, meaning: string): BusinessPeriod {
  return BusinessPeriod.of({
    start: instant(startDay, `${meaning} start`),
    end: instant(endDay, `${meaning} end`),
    startBoundary: "INCLUSIVE",
    endBoundary: "EXCLUSIVE",
    meaning,
    provenance: provenance(startDay),
  });
}

function revision(
  version: number,
  causality = `business-plan-${version}`,
  day = version,
): PlanningRevision {
  const discovery = Phase.of(PhaseId.of("discovery"), "Clarify the business outcome.");
  const delivery = Phase.of(PhaseId.of("delivery"), "Deliver the accepted outcome.");
  const approval = Milestone.of(MilestoneId.of("approval"), "The outcome is accepted.");
  return PlanningRevision.of({
    version: PlanningVersion.of(version),
    applicability: period(1, 20, `version ${version} applicability`),
    phases: [discovery, delivery],
    milestones: [approval],
    dependencies: [
      Dependency.from(discovery.reference, delivery.reference),
      Dependency.from(delivery.reference, approval.reference),
    ],
    schedule: Schedule.of([
      { element: discovery.reference, time: period(2, 5, "discovery window") },
      { element: delivery.reference, time: period(6, 12, "delivery window") },
      { element: approval.reference, time: instant(13, "business approval target") },
    ]),
    priorities: [
      Priority.of(delivery.reference, "delivery-sequence", "business-critical", provenance(1)),
    ],
    constraints: [
      Constraint.of(
        ConstraintId.of("approval-window"),
        "Approval must occur inside the agreed business window.",
        "SIGNED_STATEMENT_OF_WORK",
        "approval milestone",
        period(10, 15, "constraint effect"),
        provenance(1),
      ),
    ],
    provenance: PlanningProvenance.of(
      "NOVA_PLANNING_BUSINESS",
      "APPROVED_PLAN_PROPOSAL",
      causality,
      at(day),
    ),
  });
}

const FOUNDATION_AUTHORITY = PlanningAuthority.create("NOVA_PLANNING_BUSINESS", {
  workExists: () => true,
  objectiveAvailable: () => true,
});

function establishPlanning(
  workReference: WorkReference,
  acceptedRevision: PlanningRevision,
): Planning {
  return FOUNDATION_AUTHORITY.establishPlanning(null, {
    kind: "ESTABLISH_PLANNING",
    workReference,
    causality: CausalityId.of(acceptedRevision.provenance.businessCause),
    provenance: acceptedRevision.provenance,
    expectedVersion: null,
    proposal: acceptedRevision,
  }).aggregate;
}

function revisePlanning(current: Planning, acceptedRevision: PlanningRevision): Planning {
  const currentVersion = current.currentVersion;
  assert.ok(currentVersion !== null);
  return FOUNDATION_AUTHORITY.revisePlanning(current, {
    kind: "REVISE_PLANNING",
    workReference: current.workReference,
    causality: CausalityId.of(acceptedRevision.provenance.businessCause),
    provenance: acceptedRevision.provenance,
    expectedVersion: currentVersion.version,
    proposal: acceptedRevision,
    reason: "Foundation aggregate construction through PlanningAuthority.",
  }).aggregate;
}

function withdrawPlanning(current: Planning, causality: string, day: number): Planning {
  const currentVersion = current.currentVersion;
  assert.ok(currentVersion !== null);
  const acceptedProvenance = PlanningProvenance.of(
    "NOVA_PLANNING_BUSINESS",
    "APPROVED_PLAN_PROPOSAL",
    causality,
    at(day),
  );
  return FOUNDATION_AUTHORITY.withdrawPlanning(current, {
    kind: "WITHDRAW_PLANNING",
    workReference: current.workReference,
    causality: CausalityId.of(causality),
    provenance: acceptedProvenance,
    expectedVersion: currentVersion.version,
    reason: "Foundation withdrawn-state construction through PlanningAuthority.",
  }).aggregate;
}

function expectCode(code: PlanningDomainError["code"], action: () => unknown): void {
  assert.throws(action, (error: unknown) => {
    assert.ok(error instanceof PlanningDomainError);
    assert.equal(error.code, code);
    return true;
  });
}

test("WorkReference is the canonical and sole Planning root identity", () => {
  const firstReference = WorkReference.of("project-alpha", "work-alpha");
  const sameReference = WorkReference.of("project-alpha", "work-alpha");
  const first = establishPlanning(firstReference, revision(1));
  const sameWork = establishPlanning(sameReference, revision(1));

  assert.ok(firstReference.equals(sameReference));
  assert.equal(firstReference.key, "project-alpha/work-alpha");
  assert.ok(first.hasSameIdentity(sameWork));
  assert.deepEqual(Object.keys(first).sort(), [
    "currentIndex",
    "immutableRevisions",
    "immutableWithdrawalCausalities",
    "workReference",
  ]);
  expectCode("WORK_REFERENCE_NOT_FOUND", () => WorkReference.of(" project-alpha", "work-alpha"));
  expectCode("WORK_REFERENCE_NOT_FOUND", () => WorkReference.of("project-alpha", ""));
});

test("Planning structurally permits zero or one current immutable version", () => {
  const reference = WorkReference.of("project-current", "work-current");
  const withdrawn = withdrawPlanning(
    revisePlanning(establishPlanning(reference, revision(1)), revision(2)),
    "foundation-withdraw",
    3,
  );
  const current = revisePlanning(establishPlanning(reference, revision(1)), revision(2));

  assert.equal(withdrawn.currentVersion, null);
  assert.deepEqual(withdrawn.historicalVersions.map((item) => item.version.value), [1, 2]);
  assert.equal(current.currentVersion?.version.value, 2);
  assert.deepEqual(current.historicalVersions.map((item) => item.version.value), [1]);
});

test("version history is strictly ordered, contiguous and non-destructive", () => {
  const reference = WorkReference.of("project-history", "work-history");
  const first = revision(1);
  const second = revision(2);
  const established = establishPlanning(reference, first);
  const planning = revisePlanning(established, second);

  assert.ok(Object.isFrozen(planning));
  assert.ok(Object.isFrozen(planning.versions));
  assert.ok(Object.isFrozen(first));
  assert.ok(Object.isFrozen(first.phases));
  assert.throws(() => (first.phases as Phase[]).push(Phase.of(PhaseId.of("late"), "Late mutation.")), TypeError);
  assert.deepEqual(planning.versions.map((item) => item.version.value), [1, 2]);
  expectCode("PLANNING_VERSION_CONFLICT", () =>
    revisePlanning(established, revision(1, "repeated-version", 2)));
  expectCode("PLANNING_VERSION_CONFLICT", () =>
    revisePlanning(established, revision(3, "non-contiguous-version", 3)));
  expectCode("PLANNING_VERSION_CONFLICT", () => PlanningVersion.of(0));
});

test("Phase is a Planning entity and never a Work Lifecycle state", () => {
  const phase = Phase.of(PhaseId.of("analysis"), "Analyze the stated business need.");
  assert.equal(phase.purpose, "Analyze the stated business need.");
  assert.equal(phase.reference.kind, "PHASE");
  assert.equal("lifecycle" in phase, false);
  assert.equal("status" in phase, false);
});

test("Milestone is a duration-free business point", () => {
  const milestone = Milestone.of(MilestoneId.of("sign-off"), "Sign-off is obtained.");
  assert.equal(milestone.reference.kind, "MILESTONE");
  assert.equal("duration" in milestone, false);
  assert.equal("start" in milestone, false);
  assert.equal("end" in milestone, false);
});

test("typed references must resolve inside the complete version", () => {
  const phase = Phase.of(PhaseId.of("known"), "Known phase.");
  const missing = PlanningElementReference.milestone(MilestoneId.of("missing"));
  expectCode("PLANNING_ELEMENT_NOT_FOUND", () => PlanningRevision.of({
    version: PlanningVersion.of(1),
    applicability: period(1, 5, "applicability"),
    phases: [phase],
    milestones: [],
    dependencies: [],
    schedule: Schedule.of([{ element: missing, time: instant(2, "missing target") }]),
    priorities: [],
    constraints: [],
    provenance: provenance(),
  }));
  expectCode("PLANNING_ELEMENT_DUPLICATE", () => PlanningRevision.of({
    version: PlanningVersion.of(1),
    applicability: period(1, 5, "applicability"),
    phases: [phase, Phase.of(PhaseId.of("known"), "Duplicate phase.")],
    milestones: [],
    dependencies: [],
    schedule: Schedule.of([]),
    priorities: [],
    constraints: [],
    provenance: provenance(),
  }));
});

test("Dependency is oriented, rejects self-reference and validates an acyclic global graph", () => {
  const first = Phase.of(PhaseId.of("first"), "First phase.");
  const second = Phase.of(PhaseId.of("second"), "Second phase.");
  const endpoint = Milestone.of(MilestoneId.of("endpoint"), "Endpoint reached.");
  const oriented = Dependency.from(first.reference, second.reference);
  assert.equal(oriented.prerequisite.key, "PHASE:first");
  assert.equal(oriented.dependent.key, "PHASE:second");
  expectCode("INVALID_DEPENDENCY", () => Dependency.from(first.reference, first.reference));
  expectCode("DEPENDENCY_CYCLE", () => PlanningRevision.of({
    version: PlanningVersion.of(1),
    applicability: period(1, 8, "cycle applicability"),
    phases: [first, second],
    milestones: [endpoint],
    dependencies: [
      Dependency.from(first.reference, second.reference),
      Dependency.from(second.reference, endpoint.reference),
      Dependency.from(endpoint.reference, first.reference),
    ],
    schedule: Schedule.of([]),
    priorities: [],
    constraints: [],
    provenance: provenance(),
  }));
});

test("complete revisions reject duplicate Dependency business identities", () => {
  const first = Phase.of(PhaseId.of("first"), "First phase.");
  const second = Phase.of(PhaseId.of("second"), "Second phase.");
  const dependency = Dependency.from(first.reference, second.reference);
  expectCode("PLANNING_ELEMENT_DUPLICATE", () => PlanningRevision.of({
    version: PlanningVersion.of(1),
    applicability: period(1, 8, "duplicate dependency applicability"),
    phases: [first, second],
    milestones: [],
    dependencies: [dependency, dependency],
    schedule: Schedule.of([]),
    priorities: [],
    constraints: [],
    provenance: provenance(),
  }));
});

test("Schedule accepts only explicitly qualified business time", () => {
  const phase = Phase.of(PhaseId.of("scheduled"), "Scheduled business phase.");
  const scheduled = Schedule.of([{ element: phase.reference, time: instant(3, "contractual start") }]);
  assert.equal(scheduled.entries[0]?.time instanceof BusinessInstant, true);
  expectCode("INVALID_BUSINESS_TIME", () =>
    BusinessInstant.of(new Date(Number.NaN), "invalid", provenance(), "BUSINESS_DECISION"));
  expectCode("INVALID_BUSINESS_TIME", () => BusinessPeriod.of({
    start: instant(5, "late start"),
    end: instant(4, "early end"),
    startBoundary: "INCLUSIVE",
    endBoundary: "EXCLUSIVE",
    meaning: "invalid order",
    provenance: provenance(),
  }));
  expectCode("INVALID_BUSINESS_TIME", () => BusinessPeriod.of({
    start: null,
    end: instant(4, "bounded end"),
    startBoundary: "INCLUSIVE",
    endBoundary: "EXCLUSIVE",
    meaning: "implicit missing bound",
    provenance: provenance(),
  }));
  expectCode("TECHNICAL_PLANNING_SOURCE_FORBIDDEN", () => BusinessInstant.of(
    at(3),
    "runtime updatedAt",
    provenance(),
    "TECHNICAL_TIMESTAMP" as "BUSINESS_DECISION",
  ));
});

test("Priority has no implicit qualification or comparison scope", () => {
  const target = PlanningElementReference.phase(PhaseId.of("priority-target"));
  expectCode("PRIORITY_SCOPE_REQUIRED", () => Priority.of(target, "", "critical", provenance()));
  expectCode("PRIORITY_SCOPE_REQUIRED", () => Priority.of(target, "release", "", provenance()));
  const explicit = Priority.of(target, "release", "business-critical", provenance());
  assert.equal(explicit.qualification, "business-critical");
  assert.equal("default" in explicit, false);
});

test("complete revisions reject duplicate Priority business identities", () => {
  const phase = Phase.of(PhaseId.of("priority-target"), "Priority target phase.");
  const first = Priority.of(phase.reference, "release", "business-critical", provenance());
  const duplicate = Priority.of(phase.reference, "release", "business-high", provenance());
  expectCode("PLANNING_ELEMENT_DUPLICATE", () => PlanningRevision.of({
    version: PlanningVersion.of(1),
    applicability: period(1, 8, "duplicate priority applicability"),
    phases: [phase],
    milestones: [],
    dependencies: [],
    schedule: Schedule.of([]),
    priorities: [first, duplicate],
    constraints: [],
    provenance: provenance(),
  }));
});

test("Constraint requires source, scope and an explicit effect period", () => {
  const effect = period(3, 7, "constraint effect");
  expectCode("CONSTRAINT_QUALIFICATION_REQUIRED", () => Constraint.of(
    ConstraintId.of("constraint"), "Condition.", "", "release", effect, provenance(),
  ));
  expectCode("CONSTRAINT_QUALIFICATION_REQUIRED", () => Constraint.of(
    ConstraintId.of("constraint"), "Condition.", "contract", "", effect, provenance(),
  ));
  const qualified = Constraint.of(
    ConstraintId.of("constraint"), "Condition.", "contract", "release", effect, provenance(),
  );
  assert.equal(qualified.effectPeriod.meaning, "constraint effect");
});

test("Planning provenance and causality identifiers are explicit and immutable", () => {
  expectCode("PLANNING_PROVENANCE_REQUIRED", () =>
    PlanningProvenance.of("", "source", "cause", at(1)));
  expectCode("PLANNING_PROVENANCE_REQUIRED", () =>
    PlanningProvenance.of("authority", "", "cause", at(1)));
  const cause = CausalityId.of("planning-intention-001");
  assert.equal(cause.value, "planning-intention-001");
  assert.ok(Object.isFrozen(cause));
  expectCode("PLANNING_CAUSALITY_CONFLICT", () => CausalityId.of(""));
  expectCode("PLANNING_PROVENANCE_REQUIRED", () => PlanningRevision.of({
    version: PlanningVersion.of(1),
    applicability: period(1, 4, "missing provenance applicability"),
    phases: [],
    milestones: [],
    dependencies: [],
    schedule: Schedule.of([]),
    priorities: [],
    constraints: [],
    provenance: undefined as unknown as PlanningProvenance,
  }));
});

test("the complete Foundation model enforces all global invariants atomically", () => {
  const complete = revision(1);
  const planning = establishPlanning(
    WorkReference.of("project-complete", "work-complete"),
    complete,
  );
  assert.equal(planning.currentVersion?.version, complete.version);
  assert.equal(complete.phases.length, 2);
  assert.equal(complete.milestones.length, 1);
  assert.equal(complete.dependencies.length, 2);
  assert.equal(complete.schedule.entries.length, 3);
  assert.equal(complete.priorities.length, 1);
  assert.equal(complete.constraints.length, 1);
  assert.ok(complete.provenance.authority.length > 0);
});

test("Foundation primitives contain no operations, persistence, integration or Timeline source", async () => {
  const directory = new URL("./", import.meta.url);
  const files = [
    "planning.aggregate.ts",
    "planning.entities.ts",
    "planning.errors.ts",
    "planning.value-objects.ts",
  ];
  const directoryFiles = await readdir(directory);
  assert.ok(files.every((file) => directoryFiles.includes(file)));
  const source = (await Promise.all(files.map((file) => readFile(new URL(file, directory), "utf8")))).join("\n");
  for (const forbidden of [
    /EstablishPlanning|RevisePlanning|WithdrawPlanning/u,
    /PlanningEstablished|PlanningRevised|PlanningWithdrawn|MilestoneReached/u,
    /Repository|Persistence|Migration|Sqlite|Database/u,
    /GetCurrentPlanning|GetPlanningTimeline/u,
    /server\/runtime|server\/nova-bff|domain\/people/u,
    /class\s+Timeline/u,
  ]) {
    assert.doesNotMatch(source, forbidden);
  }
});
