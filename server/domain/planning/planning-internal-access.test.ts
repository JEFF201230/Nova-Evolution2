import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  BusinessInstant,
  BusinessPeriod,
  CausalityId,
  Milestone,
  MilestoneId,
  Phase,
  PhaseId,
  PlanningAuthority,
  PlanningCommands,
  PlanningIdempotencyConflictError,
  PlanningPersistenceError,
  PlanningProvenance,
  PlanningQueries,
  PlanningRevision,
  PlanningSQLiteRepository,
  PlanningVersion,
  Schedule,
  WorkReference,
  type PlanningRepository,
} from "./index.js";

const WORK = WorkReference.of("internal-planning-project", "internal-planning-work");

function at(day: number): Date {
  return new Date(`2026-12-${String(day).padStart(2, "0")}T09:00:00.000Z`);
}

function provenance(cause: string, day: number): PlanningProvenance {
  return PlanningProvenance.of(
    "INTERNAL_PLANNING_AUTHORITY", "SIGNED_PLANNING_DECISION", cause, at(day),
  );
}

function instant(day: number, meaning: string, source: PlanningProvenance): BusinessInstant {
  return BusinessInstant.of(at(day), meaning, source, "BUSINESS_DECISION");
}

function period(source: PlanningProvenance): BusinessPeriod {
  return BusinessPeriod.of({
    start: instant(1, "Applicability start", source),
    end: instant(28, "Applicability end", source),
    startBoundary: "INCLUSIVE",
    endBoundary: "EXCLUSIVE",
    meaning: "Planning applicability",
    provenance: source,
  });
}

function proposal(version: number, cause: string, emptySchedule = false): PlanningRevision {
  const source = provenance(cause, version);
  const phase = Phase.of(PhaseId.of("implementation"), `Implementation version ${version}.`);
  const milestone = Milestone.of(MilestoneId.of("review"), `Review version ${version}.`);
  return PlanningRevision.of({
    version: PlanningVersion.of(version),
    applicability: period(source),
    phases: [phase],
    milestones: [milestone],
    dependencies: [],
    schedule: Schedule.of(emptySchedule ? [] : [
      { element: phase.reference, time: instant(20, "Implementation target", source) },
      { element: milestone.reference, time: instant(10, "Review target", source) },
    ]),
    priorities: [],
    constraints: [],
    provenance: source,
  });
}

function boundary(database = new DatabaseSync(":memory:")) {
  let admissionCalls = 0;
  const authority = PlanningAuthority.create("INTERNAL_PLANNING_AUTHORITY", {
    workExists: () => { admissionCalls += 1; return true; },
    objectiveAvailable: () => true,
  });
  const repository = new PlanningSQLiteRepository(database, {
    now: () => new Date("2026-12-30T09:00:00.000Z"),
  });
  return {
    database,
    repository,
    commands: new PlanningCommands(authority, repository),
    queries: new PlanningQueries(repository),
    admissionCalls: () => admissionCalls,
  };
}

function establishRequest(cause = "establish-internal", emptySchedule = false) {
  const accepted = proposal(1, cause, emptySchedule);
  return {
    command: {
      kind: "ESTABLISH_PLANNING" as const,
      workReference: WORK,
      causality: CausalityId.of(cause),
      provenance: accepted.provenance,
      expectedVersion: null,
      proposal: accepted,
    },
    expectedRevision: 0,
    correlationId: "internal-correlation",
  };
}

test("internal Establish/Revise/Withdraw commands traverse Authority then canonical persistence", () => {
  const access = boundary();
  const established = access.commands.establishPlanning(establishRequest());
  const revisedProposal = proposal(2, "revise-internal");
  const revised = access.commands.revisePlanning({
    command: {
      kind: "REVISE_PLANNING", workReference: WORK,
      causality: CausalityId.of("revise-internal"), provenance: revisedProposal.provenance,
      expectedVersion: PlanningVersion.of(1), proposal: revisedProposal,
      reason: "The signed plan was revised.",
    },
    expectedRevision: established.revision,
    correlationId: "internal-correlation",
  });
  const withdrawnSource = provenance("withdraw-internal", 3);
  const withdrawn = access.commands.withdrawPlanning({
    command: {
      kind: "WITHDRAW_PLANNING", workReference: WORK,
      causality: CausalityId.of("withdraw-internal"), provenance: withdrawnSource,
      expectedVersion: PlanningVersion.of(2), reason: "The signed plan was withdrawn.",
    },
    expectedRevision: revised.revision,
    correlationId: "internal-correlation",
  });

  assert.equal(access.admissionCalls(), 3);
  assert.equal(withdrawn.revision, 3);
  assert.equal(access.repository.load(WORK)?.aggregate.currentVersion, null);
  assert.deepEqual(access.repository.readHistory(WORK).events
    .filter((event) => event.eventOrdinal === 1).map((event) => event.eventType),
  ["PlanningEstablished", "PlanningRevised", "PlanningWithdrawn"]);
  access.database.close();
});

test("internal command retry uses the durable receipt and changed intent fails closed", () => {
  const access = boundary();
  const request = establishRequest("idempotent-internal");
  const applied = access.commands.establishPlanning(request);
  const replayed = access.commands.establishPlanning(request);
  assert.equal(applied.status, "APPLIED");
  assert.equal(replayed.status, "REPLAYED");
  assert.equal(replayed.revision, applied.revision);

  const changed = establishRequest("idempotent-internal");
  const changedProposal = PlanningRevision.of({
    ...changed.command.proposal,
    phases: [Phase.of(PhaseId.of("implementation"), "Changed intent.")],
  });
  assert.throws(() => access.commands.establishPlanning({
    ...changed,
    command: { ...changed.command, proposal: changedProposal },
  }), PlanningIdempotencyConflictError);
  assert.equal(access.repository.load(WORK)?.revision, 1);
  access.database.close();
});

test("Authority rejection through the internal command path has zero persistence effect", () => {
  const database = new DatabaseSync(":memory:");
  const repository = new PlanningSQLiteRepository(database);
  const rejectingAuthority = PlanningAuthority.create("INTERNAL_PLANNING_AUTHORITY", {
    workExists: () => false,
    objectiveAvailable: () => true,
  });
  const commands = new PlanningCommands(rejectingAuthority, repository);
  assert.throws(() => commands.establishPlanning(establishRequest()), /authoritative Work/);
  assert.equal(repository.load(WORK), null);
  assert.equal((database.prepare("SELECT COUNT(*) count FROM planning_event").get() as { count: number }).count, 0);
  database.close();
});

test("GetCurrentPlanning qualifies ABSENT, CURRENT and WITHDRAWN without defaults", () => {
  const access = boundary();
  assert.deepEqual(access.queries.getCurrentPlanning(WORK), { status: "ABSENT" });
  const applied = access.commands.establishPlanning(establishRequest());
  const current = access.queries.getCurrentPlanning(WORK);
  assert.equal(current.status, "CURRENT");
  if (current.status === "CURRENT") {
    assert.equal(current.planning.version.value, 1);
    assert.equal(current.provenance.businessCause, "establish-internal");
  }
  const source = provenance("withdraw-current-query", 2);
  access.commands.withdrawPlanning({
    command: {
      kind: "WITHDRAW_PLANNING", workReference: WORK,
      causality: CausalityId.of("withdraw-current-query"), provenance: source,
      expectedVersion: PlanningVersion.of(1), reason: "No plan currently applies.",
    },
    expectedRevision: applied.revision,
    correlationId: "internal-correlation",
  });
  const withdrawn = access.queries.getCurrentPlanning(WORK);
  assert.equal(withdrawn.status, "WITHDRAWN");
  if (withdrawn.status === "WITHDRAWN") assert.equal(withdrawn.latestVersion.value, 1);
  access.database.close();
});

test("GetPlanningVersion returns immutable canonical versions and VERSION_ABSENT", () => {
  const access = boundary();
  access.commands.establishPlanning(establishRequest());
  const present = access.queries.getPlanningVersion(WORK, PlanningVersion.of(1));
  assert.equal(present.status, "PRESENT");
  if (present.status === "PRESENT") {
    assert.ok(Object.isFrozen(present.planning));
    assert.equal(present.provenance.source, "SIGNED_PLANNING_DECISION");
  }
  assert.deepEqual(access.queries.getPlanningVersion(WORK, PlanningVersion.of(2)), {
    status: "VERSION_ABSENT", requestedVersion: 2,
  });
  access.database.close();
});

test("GetPlanningHistory exposes ordered canonical events, causalities and applicability", () => {
  const access = boundary();
  access.commands.establishPlanning(establishRequest());
  const history = access.queries.getPlanningHistory(WORK);
  assert.equal(history.status, "PRESENT");
  if (history.status === "PRESENT") {
    assert.equal(history.applicability, "CURRENT");
    assert.deepEqual(history.events.map((event) => event.streamSequence),
      history.events.map((_, index) => index + 1));
    assert.ok(history.events.every((event) =>
      event.causationId === "establish-internal"
      && event.provenance.businessCause === event.causationId));
    assert.ok(Object.isFrozen(history.events));
  }
  access.database.close();
});

test("GetPlanningTimeline derives deterministic temporal order only from canonical Schedule", () => {
  const access = boundary();
  access.commands.establishPlanning(establishRequest());
  const timeline = access.queries.getPlanningTimeline(WORK, PlanningVersion.of(1));
  assert.equal(timeline.status, "PRESENT");
  if (timeline.status === "PRESENT") {
    assert.equal(timeline.sourceVersion.value, 1);
    assert.deepEqual(timeline.entries.map((entry) => entry.elementId), ["review", "implementation"]);
    assert.ok(timeline.entries.every((entry) =>
      entry.provenance.businessCause === "establish-internal"));
    assert.ok(Object.isFrozen(timeline.entries));
  }
  assert.deepEqual(access.queries.getPlanningTimeline(WORK, PlanningVersion.of(2)), {
    status: "VERSION_ABSENT", requestedVersion: 2,
  });
  access.database.close();
});

test("GetPlanningSchedule preserves explicit empty Schedule separately from Planning absence", () => {
  const access = boundary();
  assert.deepEqual(access.queries.getPlanningSchedule(WORK, PlanningVersion.of(1)), {
    status: "ABSENT",
  });
  access.commands.establishPlanning(establishRequest("empty-schedule", true));
  const schedule = access.queries.getPlanningSchedule(WORK, PlanningVersion.of(1));
  assert.equal(schedule.status, "PRESENT");
  if (schedule.status === "PRESENT") {
    assert.deepEqual(schedule.entries, []);
    assert.equal(schedule.provenance.businessCause, "empty-schedule");
  }
  access.database.close();
});

test("all five Queries qualify canonical source unavailability and never hide corruption", () => {
  const unavailable = new PlanningPersistenceError(
    "PLANNING_PERSISTENCE_UNAVAILABLE", "Canonical source unavailable.",
  );
  const unavailableRepository: PlanningRepository = {
    load: () => { throw unavailable; },
    commit: () => { throw unavailable; },
    readHistory: () => { throw unavailable; },
    rehydrate: () => { throw unavailable; },
    readVersions: () => { throw unavailable; },
  };
  const queries = new PlanningQueries(unavailableRepository);
  const version = PlanningVersion.of(1);
  assert.equal(queries.getCurrentPlanning(WORK).status, "UNAVAILABLE");
  assert.equal(queries.getPlanningVersion(WORK, version).status, "UNAVAILABLE");
  assert.equal(queries.getPlanningHistory(WORK).status, "UNAVAILABLE");
  assert.equal(queries.getPlanningTimeline(WORK, version).status, "UNAVAILABLE");
  assert.equal(queries.getPlanningSchedule(WORK, version).status, "UNAVAILABLE");

  const corruptedRepository = { ...unavailableRepository, load: () => { throw new Error("CORRUPTED"); } };
  assert.throws(() => new PlanningQueries(corruptedRepository).getCurrentPlanning(WORK), /CORRUPTED/);
});

test("all five Queries are read-only against the canonical durable source", () => {
  const access = boundary();
  access.commands.establishPlanning(establishRequest());
  const before = access.repository.readHistory(WORK).events.length;
  const version = PlanningVersion.of(1);
  access.queries.getCurrentPlanning(WORK);
  access.queries.getPlanningVersion(WORK, version);
  access.queries.getPlanningHistory(WORK);
  access.queries.getPlanningTimeline(WORK, version);
  access.queries.getPlanningSchedule(WORK, version);
  assert.equal(access.repository.readHistory(WORK).events.length, before);
  assert.equal((access.database.prepare("SELECT COUNT(*) count FROM planning_command_receipt")
    .get() as { count: number }).count, 1);
  access.database.close();
});
