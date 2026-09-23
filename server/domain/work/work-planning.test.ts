import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  BusinessInstant,
  BusinessPeriod,
  CausalityId,
  Phase,
  PhaseId,
  PlanningAuthority,
  PlanningCommands,
  PlanningProvenance,
  PlanningQueries,
  PlanningRevision,
  PlanningSQLiteRepository,
  PlanningVersion,
  Schedule,
  WorkReference,
  type GetCurrentPlanningResult,
} from "../planning/index.js";
import {
  WorkPlanningQuery,
  type WorkPlanningReadSource,
} from "./index.js";

const WORK = Object.freeze({ projectId: "NOVA", workId: "WORK-PLANNING-001" });
const PLANNING_WORK = WorkReference.of(WORK.projectId, WORK.workId);

function at(day: number): Date {
  return new Date(`2026-09-${String(day).padStart(2, "0")}T09:00:00.000Z`);
}

function provenance(cause: string, day: number): PlanningProvenance {
  return PlanningProvenance.of(
    "PLANNING_AUTHORITY", "SIGNED_PLANNING_DECISION", cause, at(day),
  );
}

function revision(version: number, cause: string): PlanningRevision {
  const source = provenance(cause, version);
  const phase = Phase.of(PhaseId.of("delivery"), "Deliver the approved scope.");
  const start = BusinessInstant.of(
    at(10), "Approved delivery start", source, "BUSINESS_DECISION",
  );
  return PlanningRevision.of({
    version: PlanningVersion.of(version),
    applicability: BusinessPeriod.of({
      start,
      end: null,
      startBoundary: "INCLUSIVE",
      endBoundary: "UNBOUNDED",
      meaning: "Approved planning applicability",
      provenance: source,
    }),
    phases: [phase],
    milestones: [],
    dependencies: [],
    schedule: Schedule.of([{ element: phase.reference, time: start }]),
    priorities: [],
    constraints: [],
    provenance: source,
  });
}

function canonicalBoundary() {
  const database = new DatabaseSync(":memory:");
  const repository = new PlanningSQLiteRepository(database, { now: () => at(30) });
  const authority = PlanningAuthority.create("PLANNING_AUTHORITY", {
    workExists: (reference) => reference.equals(PLANNING_WORK),
    objectiveAvailable: () => true,
  });
  const commands = new PlanningCommands(authority, repository);
  const planning = revision(1, "establish-work-planning");
  const established = commands.establishPlanning({
    command: {
      kind: "ESTABLISH_PLANNING",
      workReference: PLANNING_WORK,
      causality: CausalityId.of("establish-work-planning"),
      provenance: planning.provenance,
      expectedVersion: null,
      proposal: planning,
    },
    expectedRevision: 0,
    correlationId: "work-planning-integration",
  });
  return Object.freeze({
    database,
    repository,
    commands,
    queries: new PlanningQueries(repository),
    planning,
    established,
  });
}

test("Work integration exposes exactly the four canonical Planning states", () => {
  const unavailable = new WorkPlanningQuery({
    getCurrentPlanning: () => ({ status: "UNAVAILABLE" }),
  }).get(WORK);
  const absent = new WorkPlanningQuery({
    getCurrentPlanning: () => ({ status: "ABSENT" }),
  }).get(WORK);
  const current = canonicalBoundary();
  try {
    const query = new WorkPlanningQuery(current.queries);
    const available = query.get(WORK);
    const withdrawalSource = provenance("withdraw-work-planning", 2);
    current.commands.withdrawPlanning({
      command: {
        kind: "WITHDRAW_PLANNING",
        workReference: PLANNING_WORK,
        causality: CausalityId.of("withdraw-work-planning"),
        provenance: withdrawalSource,
        expectedVersion: PlanningVersion.of(1),
        reason: "The approved Planning no longer applies.",
      },
      expectedRevision: current.established.revision,
      correlationId: "work-planning-integration",
    });
    const withdrawn = query.get(WORK);

    assert.deepEqual([
      unavailable.status,
      absent.status,
      withdrawn.status,
      available.status,
    ], [
      "PLANNING_UNAVAILABLE",
      "PLANNING_ABSENT",
      "PLANNING_WITHDRAWN",
      "PLANNING_AVAILABLE",
    ]);
  } finally {
    current.database.close();
  }
});

test("Work reads the certified canonical Planning source with the sole WorkReference", () => {
  const current = canonicalBoundary();
  try {
    let received: WorkReference | undefined;
    const source: WorkPlanningReadSource = {
      getCurrentPlanning: (reference) => {
        received = reference;
        return current.queries.getCurrentPlanning(reference);
      },
    };
    const result = new WorkPlanningQuery(source).get(WORK);

    assert.equal(received?.equals(PLANNING_WORK), true);
    assert.equal(result.status, "PLANNING_AVAILABLE");
    assert.deepEqual({ projectId: result.projectId, workId: result.workId }, WORK);
    assert.equal("planningId" in result, false);
    assert.equal("missionId" in result, false);
  } finally {
    current.database.close();
  }
});

test("Planning provenance and applicability are preserved from the canonical read", () => {
  const current = canonicalBoundary();
  try {
    let canonical: GetCurrentPlanningResult | undefined;
    const result = new WorkPlanningQuery({
      getCurrentPlanning: (reference) => {
        canonical = current.queries.getCurrentPlanning(reference);
        return canonical;
      },
    }).get(WORK);
    assert.ok(canonical);
    assert.equal(canonical.status, "CURRENT");
    assert.equal(result.status, "PLANNING_AVAILABLE");
    if (canonical.status === "CURRENT" && result.status === "PLANNING_AVAILABLE") {
      assert.strictEqual(result.provenance, canonical.provenance);
      assert.strictEqual(result.applicability, canonical.planning.applicability);
      assert.equal(result.planningVersion, canonical.planning.version.value);
      assert.equal(result.revision, canonical.revision);
    }
  } finally {
    current.database.close();
  }
});

test("an unavailable or inconsistent Planning read fails closed without synthetic data", () => {
  const mismatched = WorkReference.of("NOVA", "OTHER-WORK");
  const source: WorkPlanningReadSource = {
    getCurrentPlanning: () => ({
      status: "WITHDRAWN",
      workReference: mismatched,
      revision: 1,
      latestVersion: PlanningVersion.of(1),
      provenance: provenance("withdraw-other-work", 2),
    }),
  };
  const inconsistent = new WorkPlanningQuery(source).get(WORK);
  const thrown = new WorkPlanningQuery({
    getCurrentPlanning: () => { throw new Error("canonical source failure"); },
  }).get(WORK);

  assert.deepEqual(inconsistent, {
    ...WORK,
    status: "PLANNING_UNAVAILABLE",
    sourceDomain: "PLANNING",
    reason: "PLANNING_READ_INCONSISTENT",
  });
  assert.equal(thrown.status, "PLANNING_UNAVAILABLE");
  assert.equal("planningVersion" in inconsistent, false);
  assert.equal("provenance" in inconsistent, false);
});

test("Planning integration leaves Objective, Lifecycle and Progress unchanged", () => {
  const workTruths = Object.freeze({
    objective: Object.freeze({ label: "Canonical objective", source: "MISSIONS" }),
    lifecycle: Object.freeze({ current: "ACTIVE", source: "WORK" }),
    progression: Object.freeze({ percentage: 40, source: "MONITORING" }),
  });
  const before = JSON.stringify(workTruths);
  const result = new WorkPlanningQuery({
    getCurrentPlanning: () => ({ status: "ABSENT" }),
  }).get(WORK);

  assert.equal(result.status, "PLANNING_ABSENT");
  assert.equal(JSON.stringify(workTruths), before);
  assert.equal("objective" in result, false);
  assert.equal("lifecycle" in result, false);
  assert.equal("progression" in result, false);
});

test("Work owns no Planning aggregate, history, graph, command, store or persistence", () => {
  const current = canonicalBoundary();
  try {
    const historyBefore = current.repository.readHistory(PLANNING_WORK);
    const query = new WorkPlanningQuery(current.queries);
    const result = query.get(WORK);
    const historyAfter = current.repository.readHistory(PLANNING_WORK);

    assert.equal(result.status, "PLANNING_AVAILABLE");
    assert.deepEqual(Object.keys(query), ["planning", "clock"]);
    assert.deepEqual(historyAfter, historyBefore);
    for (const forbidden of [
      "phases", "milestones", "schedule", "priorities",
      "constraints", "history", "events", "commands", "store", "repository",
    ]) {
      assert.equal(forbidden in result, false);
    }
  } finally {
    current.database.close();
  }
});

test("Work Overview Planning projection does not promote a business start instant to a due date", () => {
  const current = canonicalBoundary();
  try {
    const result = new WorkPlanningQuery(current.queries, { now: () => at(20) }).get(WORK);
    assert.equal(result.status, "PLANNING_AVAILABLE");
    if (result.status === "PLANNING_AVAILABLE") {
      assert.deepEqual(result.phase, { current: 1, total: 1, phaseId: "delivery" });
      assert.equal(result.dueAt, null);
      assert.deepEqual(result.dependencies, []);
    }
  } finally { current.database.close(); }
});

test("unexpected structurally invalid provenance is unavailable rather than accepted", () => {
  const invalid = {
    status: "WITHDRAWN",
    workReference: PLANNING_WORK,
    revision: 1,
    latestVersion: PlanningVersion.of(1),
    provenance: {
      authority: "invented",
      source: "invented",
      businessCause: "invented",
      effectiveAt: at(2),
    },
  } as unknown as GetCurrentPlanningResult;
  const result = new WorkPlanningQuery({ getCurrentPlanning: () => invalid }).get(WORK);
  assert.equal(result.status, "PLANNING_UNAVAILABLE");
  if (result.status === "PLANNING_UNAVAILABLE") {
    assert.equal(result.reason, "PLANNING_READ_INCONSISTENT");
  }
});

test("a malformed Planning port result is explicitly unavailable and never throws", () => {
  const malformed = new WorkPlanningQuery({
    getCurrentPlanning: () => null as unknown as GetCurrentPlanningResult,
  }).get(WORK);
  assert.deepEqual(malformed, {
    ...WORK,
    status: "PLANNING_UNAVAILABLE",
    sourceDomain: "PLANNING",
    reason: "PLANNING_READ_INCONSISTENT",
  });
});
