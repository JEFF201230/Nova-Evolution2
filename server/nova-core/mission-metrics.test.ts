import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionEvent,
} from "./mission-event-publisher.js";
import {
  MissionMetrics,
  type MissionMetricsInput,
} from "./mission-metrics.js";
import {
  MissionProgress,
  type MissionProgressModel,
} from "./mission-progress.js";
import {
  MissionTimeline,
  type MissionTimelineModel,
} from "./mission-timeline.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";

const MISSION_ID = "NOVA_CORE_METRICS_LOT_C";

const AUTHORITY: AuthorityResolutionDecision = {
  missionId: MISSION_ID,
  authorityDomain: "PROGRAM_GOVERNANCE",
  authoritativeSources: [],
  supportingSources: [],
  rejectedSources: [],
  rejectionReasons: [],
  unresolvedAuthorityConflicts: [],
  resolutionStatus: "RESOLVED",
};

const TRACE: NovaOrchestrationPipelineTrace = {
  missionId: MISSION_ID,
  authoritativeSourceIds: [],
  supportingSourceIds: [],
  rejectedSourceIds: [],
  knowledgeSourceIds: [],
  knowledgeSourcePaths: [],
  dependencyIds: [],
  requiredArtifactIds: [],
  missingArtifactIds: ["ARTIFACT-1", "ARTIFACT-2"],
};

function createEvent(
  sequence: number,
  type: string,
  progress?: { readonly completed: number; readonly total: number },
): MissionEvent {
  return {
    eventId: `EVENT-${sequence}`,
    missionId: MISSION_ID,
    sequence,
    occurredAt: `2026-07-28T18:00:0${sequence}.000Z`,
    type,
    level: "INFO",
    message: `Metric event ${sequence}`,
    payload: null,
    progress,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    resolutionStatus: "PARTIAL",
    pipelineTrace: TRACE,
    missingArtifacts: ["ARTIFACT-1", "ARTIFACT-2"],
  };
}

function createInput(
  events: readonly MissionEvent[],
): MissionMetricsInput {
  const timeline = new MissionTimeline({ enabled: true }).build({
    missionId: MISSION_ID,
    events,
  });
  assert.ok(timeline);

  const progress = new MissionProgress({ enabled: true }).calculate(
    timeline,
  );
  assert.ok(progress);

  return { timeline, progress };
}

test("MissionMetrics aggregates event counts", () => {
  const metrics = new MissionMetrics({ enabled: true }).produce(
    createInput([
      createEvent(1, "MISSION_STARTED"),
      createEvent(2, "MISSION_UPDATED"),
      createEvent(3, "MISSION_UPDATED"),
    ]),
  );

  assert.ok(metrics);
  assert.equal(metrics.eventCount, 3);
  assert.deepEqual(metrics.eventTypeCounts, {
    MISSION_STARTED: 1,
    MISSION_UPDATED: 2,
  });
});

test("MissionMetrics calculates timeline duration", () => {
  const metrics = new MissionMetrics({ enabled: true }).produce(
    createInput([
      createEvent(1, "MISSION_STARTED"),
      createEvent(3, "MISSION_UPDATED"),
    ]),
  );

  assert.ok(metrics);
  assert.equal(metrics.durationMs, 2_000);
  assert.equal(metrics.firstOccurredAt, "2026-07-28T18:00:01.000Z");
  assert.equal(metrics.lastOccurredAt, "2026-07-28T18:00:03.000Z");
});

test("MissionMetrics propagates calculated progress", () => {
  const metrics = new MissionMetrics({ enabled: true }).produce(
    createInput([
      createEvent(1, "MISSION_UPDATED", {
        completed: 2,
        total: 5,
      }),
    ]),
  );

  assert.ok(metrics);
  assert.equal(metrics.completed, 2);
  assert.equal(metrics.total, 5);
  assert.equal(metrics.percentage, 40);
  assert.equal(metrics.progressStatus, "IN_PROGRESS");
});

test("MissionMetrics preserves metadata and missing artifacts", () => {
  const input = createInput([
    createEvent(1, "MISSION_UPDATED"),
  ]);
  const metrics = new MissionMetrics({ enabled: true }).produce(input);

  assert.ok(metrics);
  assert.equal(metrics.authorityDecision, AUTHORITY);
  assert.equal(metrics.pipelineTrace, TRACE);
  assert.equal(
    metrics.missingArtifacts,
    input.timeline.missingArtifacts,
  );
  assert.equal(metrics.missingArtifactCount, 2);
  assert.equal(metrics.validationStatus, "VALID");
  assert.equal(metrics.resolutionStatus, "PARTIAL");
});

test("MissionMetrics supports an empty timeline", () => {
  const metrics = new MissionMetrics({ enabled: true }).produce(
    createInput([]),
  );

  assert.ok(metrics);
  assert.equal(metrics.eventCount, 0);
  assert.deepEqual(metrics.eventTypeCounts, {});
  assert.equal(metrics.durationMs, null);
  assert.equal(metrics.progressStatus, "UNAVAILABLE");
});

test("MissionMetrics rejects mission mismatches", () => {
  const input = createInput([
    createEvent(1, "MISSION_UPDATED"),
  ]);
  const mismatchedProgress: MissionProgressModel = {
    ...input.progress,
    missionId: "OTHER-MISSION",
  };

  assert.throws(
    () =>
      new MissionMetrics({ enabled: true }).produce({
        timeline: input.timeline,
        progress: mismatchedProgress,
      }),
    /MMET-002/,
  );
});

test("MissionMetrics rejects changed traceability references", () => {
  const input = createInput([
    createEvent(1, "MISSION_UPDATED"),
  ]);
  const changedProgress: MissionProgressModel = {
    ...input.progress,
    pipelineTrace: { ...TRACE },
  };

  assert.throws(
    () =>
      new MissionMetrics({ enabled: true }).produce({
        timeline: input.timeline,
        progress: changedProgress,
      }),
    /MMET-002/,
  );
});

test("MissionMetrics returns deterministic immutable metrics", () => {
  const input = createInput([
    createEvent(1, "Z_EVENT"),
    createEvent(2, "A_EVENT"),
  ]);
  const producer = new MissionMetrics({ enabled: true });
  const first = producer.produce(input);
  const second = producer.produce(input);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.deepEqual(Object.keys(first.eventTypeCounts), [
    "A_EVENT",
    "Z_EVENT",
  ]);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.eventTypeCounts), true);
});

test("MissionMetrics is inert when Feature Flag is OFF", () => {
  const unreadableInput = {};
  Object.defineProperty(unreadableInput, "timeline", {
    get() {
      throw new Error("Feature Flag OFF must not inspect metrics.");
    },
  });

  const metrics = new MissionMetrics().produce(
    unreadableInput as MissionMetricsInput,
  );

  assert.equal(metrics, null);
});
