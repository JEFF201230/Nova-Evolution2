import assert from "node:assert/strict";
import test from "node:test";
import {
  createSchedulerComponents,
  createSchedulerEvidence,
  verifyScheduler,
} from "./scheduler.js";
import type {
  SchedulerComponent,
} from "./scheduler.js";
import {
  verifyPortfolioManagement,
} from "../portfolio/portfolio-management.js";

const COMPONENTS: readonly SchedulerComponent[] = Object.freeze([
  Object.freeze({
    id: "master-plan-synchronization",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/PROGRAM_008_CLOSURE_REPORT.md",
  }),
  Object.freeze({
    id: "scheduler-stop-condition",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/PROGRAM_008_GOVERNANCE.md",
  }),
  Object.freeze({
    id: "next-program-dispatch",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/P8-MO-001-SCHEDULER.md",
  }),
  Object.freeze({
    id: "dependency-ready-selector",
    ready: true,
    evidenceReference: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
  }),
  Object.freeze({
    id: "program-sequence-queue",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/PROGRAM_008_ROADMAP.md",
  }),
]);

test("Scheduler verifies PROGRAM-008 readiness from Portfolio Management", () => {
  const result = verifyScheduler();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.portfolioManagementPassed, true);
  assert.equal(result.evidence.readyComponentCount, 5);
  assert.equal(Object.isFrozen(result.evidence.components), true);
});

test("Scheduler preserves deterministic component ordering", () => {
  const components = createSchedulerComponents(COMPONENTS);

  assert.deepEqual(
    components.map((component) => component.id),
    [
      "program-sequence-queue",
      "dependency-ready-selector",
      "next-program-dispatch",
      "scheduler-stop-condition",
      "master-plan-synchronization",
    ],
  );
});

test("Scheduler reports not ready when Portfolio Management is degraded", () => {
  const portfolioManagement = verifyPortfolioManagement();
  const degradedPortfolioManagement = Object.freeze({
    passed: false,
    evidence: portfolioManagement.evidence,
  });
  const evidence = createSchedulerEvidence(degradedPortfolioManagement, COMPONENTS);

  assert.equal(evidence.ready, false);
  assert.equal(evidence.portfolioManagementPassed, false);
});

test("Scheduler validates component inputs", () => {
  assert.throws(
    () =>
      createSchedulerComponents([
        {
          id: "unknown" as never,
          ready: true,
          evidenceReference: "UNKNOWN",
        },
      ]),
    /^Error: PSCH-002:/,
  );
  assert.throws(
    () =>
      createSchedulerComponents([
        {
          id: "program-sequence-queue",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/PROGRAM_008_ROADMAP.md",
        },
        {
          id: "program-sequence-queue",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/PROGRAM_008_ROADMAP.md",
        },
      ]),
    /^Error: PSCH-003:/,
  );
  assert.throws(
    () =>
      createSchedulerComponents([
        {
          id: "program-sequence-queue",
          ready: true,
          evidenceReference: "",
        },
      ]),
    /^Error: PSCH-004:/,
  );
});
