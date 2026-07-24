import assert from "node:assert/strict";
import test from "node:test";
import {
  createRuntimeScheduleEvidence,
  verifyRuntimeScheduler,
} from "./runtime-scheduler.js";
import type {
  RuntimeScheduleItem,
} from "./runtime-scheduler.js";

const SCHEDULE_ITEMS: readonly RuntimeScheduleItem[] = Object.freeze([
  Object.freeze({
    id: "runtime-state-manager",
    order: 2,
    ready: true,
  }),
  Object.freeze({
    id: "runtime-context-manager",
    order: 1,
    ready: true,
  }),
  Object.freeze({
    id: "runtime-scheduler",
    order: 2,
    ready: true,
  }),
]);

test("Runtime Scheduler produces deterministic ordered readiness evidence", () => {
  const result = verifyRuntimeScheduler(SCHEDULE_ITEMS);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.itemCount, 3);
  assert.equal(result.evidence.readyItemCount, 3);
  assert.deepEqual(result.evidence.orderedItemIds, [
    "runtime-context-manager",
    "runtime-scheduler",
    "runtime-state-manager",
  ]);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.orderedItemIds), true);
});

test("Runtime Scheduler remains deterministic for identical work items", () => {
  const first = createRuntimeScheduleEvidence(SCHEDULE_ITEMS);
  const second = createRuntimeScheduleEvidence(SCHEDULE_ITEMS);

  assert.deepEqual(first, second);
});

test("Runtime Scheduler reports not ready when an internal work item is not ready", () => {
  const result = verifyRuntimeScheduler([
    {
      id: "runtime-context-manager",
      order: 0,
      ready: false,
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.readyItemCount, 0);
});

test("Runtime Scheduler rejects empty or non-normalized work item ids", () => {
  assert.throws(
    () =>
      verifyRuntimeScheduler([
        {
          id: " runtime-context-manager ",
          order: 0,
          ready: true,
        },
      ]),
    /^Error: RSCHED-001:/,
  );
});

test("Runtime Scheduler rejects invalid work item ordering", () => {
  assert.throws(
    () =>
      verifyRuntimeScheduler([
        {
          id: "runtime-context-manager",
          order: -1,
          ready: true,
        },
      ]),
    /^Error: RSCHED-002:/,
  );
});

test("Runtime Scheduler rejects duplicate work item ids", () => {
  assert.throws(
    () =>
      verifyRuntimeScheduler([
        {
          id: "runtime-context-manager",
          order: 0,
          ready: true,
        },
        {
          id: "runtime-context-manager",
          order: 1,
          ready: true,
        },
      ]),
    /^Error: RSCHED-003:/,
  );
});
