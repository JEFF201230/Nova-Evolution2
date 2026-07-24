import assert from "node:assert/strict";
import test from "node:test";
import {
  createResourceManagerComponents,
  createResourceManagerEvidence,
  verifyResourceManager,
} from "./resource-manager.js";
import type {
  ResourceManagerComponent,
} from "./resource-manager.js";
import {
  verifyScheduler,
} from "../scheduler/scheduler.js";

const COMPONENTS: readonly ResourceManagerComponent[] = Object.freeze([
  Object.freeze({
    id: "allocation-closure-ledger",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_CLOSURE_REPORT.md",
  }),
  Object.freeze({
    id: "scope-boundary-reservation",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_VERIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "certified-component-reuse",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_GOVERNANCE.md",
  }),
  Object.freeze({
    id: "mission-squad-assignment",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/P9-MO-001-RESOURCE-MANAGER.md",
  }),
  Object.freeze({
    id: "program-capacity-ledger",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_ROADMAP.md",
  }),
]);

test("Resource Manager verifies PROGRAM-009 readiness from Scheduler", () => {
  const result = verifyResourceManager();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.schedulerPassed, true);
  assert.equal(result.evidence.readyComponentCount, 5);
});

test("Resource Manager preserves deterministic component ordering", () => {
  const components = createResourceManagerComponents(COMPONENTS);

  assert.deepEqual(
    components.map((component) => component.id),
    [
      "program-capacity-ledger",
      "mission-squad-assignment",
      "certified-component-reuse",
      "scope-boundary-reservation",
      "allocation-closure-ledger",
    ],
  );
});

test("Resource Manager reports not ready when Scheduler is degraded", () => {
  const scheduler = verifyScheduler();
  const degradedScheduler = Object.freeze({
    passed: false,
    evidence: scheduler.evidence,
  });
  const evidence = createResourceManagerEvidence(degradedScheduler, COMPONENTS);

  assert.equal(evidence.ready, false);
  assert.equal(evidence.schedulerPassed, false);
});

test("Resource Manager validates component inputs", () => {
  assert.throws(
    () =>
      createResourceManagerComponents([
        {
          id: "unknown" as never,
          ready: true,
          evidenceReference: "UNKNOWN",
        },
      ]),
    /^Error: PRES-002:/,
  );
  assert.throws(
    () =>
      createResourceManagerComponents([
        {
          id: "program-capacity-ledger",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_ROADMAP.md",
        },
        {
          id: "program-capacity-ledger",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_ROADMAP.md",
        },
      ]),
    /^Error: PRES-003:/,
  );
  assert.throws(
    () =>
      createResourceManagerComponents([
        {
          id: "program-capacity-ledger",
          ready: true,
          evidenceReference: " ",
        },
      ]),
    /^Error: PRES-004:/,
  );
});
