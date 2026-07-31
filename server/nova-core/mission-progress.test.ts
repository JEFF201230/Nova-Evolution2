import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionEvent,
} from "./mission-event-publisher.js";
import {
  MissionProgress,
} from "./mission-progress.js";
import {
  MissionTimeline,
  type MissionTimelineModel,
} from "./mission-timeline.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";

const MISSION_ID = "NOVA_CORE_PROGRESS_LOT_C";

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
  missingArtifactIds: ["ARTIFACT-1"],
};

function createEvent(
  sequence: number,
  progress?: { readonly completed: number; readonly total: number },
): MissionEvent {
  return {
    eventId: `EVENT-${sequence}`,
    missionId: MISSION_ID,
    sequence,
    occurredAt: `2026-07-28T17:00:0${sequence}.000Z`,
    type: "MISSION_PROGRESS",
    level: "INFO",
    message: `Progress ${sequence}`,
    payload: null,
    progress,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    resolutionStatus: "PARTIAL",
    pipelineTrace: TRACE,
    missingArtifacts: ["ARTIFACT-1"],
  };
}

function createTimeline(
  events: readonly MissionEvent[],
): MissionTimelineModel {
  const timeline = new MissionTimeline({ enabled: true }).build({
    missionId: MISSION_ID,
    events,
  });

  assert.ok(timeline);
  return timeline;
}

test("MissionProgress calculates the latest percentage", () => {
  const progress = new MissionProgress({ enabled: true }).calculate(
    createTimeline([createEvent(1, { completed: 1, total: 2 })]),
  );

  assert.ok(progress);
  assert.equal(progress.completed, 1);
  assert.equal(progress.total, 2);
  assert.equal(progress.percentage, 50);
  assert.equal(progress.progressStatus, "IN_PROGRESS");
});

test("MissionProgress uses the latest available snapshot", () => {
  const progress = new MissionProgress({ enabled: true }).calculate(
    createTimeline([
      createEvent(1, { completed: 1, total: 4 }),
      createEvent(2),
      createEvent(3, { completed: 3, total: 4 }),
    ]),
  );

  assert.ok(progress);
  assert.equal(progress.completed, 3);
  assert.equal(progress.percentage, 75);
});

test("MissionProgress identifies completion", () => {
  const progress = new MissionProgress({ enabled: true }).calculate(
    createTimeline([createEvent(1, { completed: 3, total: 3 })]),
  );

  assert.ok(progress);
  assert.equal(progress.percentage, 100);
  assert.equal(progress.progressStatus, "COMPLETE");
});

test("MissionProgress reports unavailable progress without snapshots", () => {
  const progress = new MissionProgress({ enabled: true }).calculate(
    createTimeline([createEvent(1)]),
  );

  assert.ok(progress);
  assert.equal(progress.completed, null);
  assert.equal(progress.total, null);
  assert.equal(progress.percentage, null);
  assert.equal(progress.progressStatus, "UNAVAILABLE");
});

test("MissionProgress preserves certified metadata references", () => {
  const timeline = createTimeline([
    createEvent(1, { completed: 1, total: 2 }),
  ]);
  const progress = new MissionProgress({ enabled: true }).calculate(
    timeline,
  );

  assert.ok(progress);
  assert.equal(progress.authorityDecision, AUTHORITY);
  assert.equal(progress.pipelineTrace, TRACE);
  assert.equal(progress.missingArtifacts, timeline.missingArtifacts);
  assert.equal(progress.validationStatus, "VALID");
  assert.equal(progress.resolutionStatus, "PARTIAL");
});

test("MissionProgress rejects an invalid progress snapshot", () => {
  const invalidEvent = {
    ...createEvent(1),
    progress: { completed: 2, total: 1 },
  } as MissionEvent;

  assert.throws(
    () =>
      new MissionProgress({ enabled: true }).calculate(
        createTimeline([invalidEvent]),
      ),
    /MPRO-002/,
  );
});

test("MissionProgress returns deterministic immutable data", () => {
  const timeline = createTimeline([
    createEvent(1, { completed: 1, total: 3 }),
  ]);
  const calculator = new MissionProgress({ enabled: true });
  const first = calculator.calculate(timeline);
  const second = calculator.calculate(timeline);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
});

test("MissionProgress is inert when Feature Flag is OFF", () => {
  const unreadableTimeline = {};
  Object.defineProperty(unreadableTimeline, "events", {
    get() {
      throw new Error("Feature Flag OFF must not inspect progress.");
    },
  });

  const progress = new MissionProgress().calculate(
    unreadableTimeline as MissionTimelineModel,
  );

  assert.equal(progress, null);
});
