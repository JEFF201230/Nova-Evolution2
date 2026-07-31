import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionEvent,
} from "./mission-event-publisher.js";
import {
  MissionLog,
} from "./mission-log.js";
import {
  MissionTimeline,
  type MissionTimelineModel,
} from "./mission-timeline.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";

const MISSION_ID = "NOVA_CORE_LOG_LOT_C";

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

function createEvent(sequence: number): MissionEvent {
  return Object.freeze({
    eventId: `EVENT-${sequence}`,
    missionId: MISSION_ID,
    sequence,
    occurredAt: `2026-07-28T19:00:0${sequence}.000Z`,
    type: "MISSION_LOGGED",
    level: sequence === 1 ? "WARN" : "INFO",
    message: `Log entry ${sequence}`,
    payload: Object.freeze({ source: `component-${sequence}` }),
    progress: Object.freeze({ completed: sequence, total: 2 }),
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    resolutionStatus: "PARTIAL",
    pipelineTrace: TRACE,
    missingArtifacts: Object.freeze(["ARTIFACT-1"]),
  });
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

test("MissionLog centralizes entries in timeline order", () => {
  const events = [createEvent(1), createEvent(2)];
  const log = new MissionLog({ enabled: true }).normalize(
    createTimeline(events),
  );

  assert.ok(log);
  assert.deepEqual(log.entries, events);
  assert.deepEqual(
    log.entries.map((entry) => entry.sequence),
    [1, 2],
  );
});

test("MissionLog preserves business content without modification", () => {
  const event = createEvent(1);
  const log = new MissionLog({ enabled: true }).normalize(
    createTimeline([event]),
  );

  assert.ok(log);
  assert.equal(log.entries[0], event);
  assert.equal(log.entries[0]?.payload, event.payload);
  assert.equal(log.entries[0]?.message, "Log entry 1");
  assert.equal(log.entries[0]?.progress, event.progress);
});

test("MissionLog preserves certified metadata references", () => {
  const timeline = createTimeline([createEvent(1)]);
  const log = new MissionLog({ enabled: true }).normalize(timeline);

  assert.ok(log);
  assert.equal(log.authorityDecision, AUTHORITY);
  assert.equal(log.pipelineTrace, TRACE);
  assert.equal(log.validationStatus, "VALID");
  assert.equal(log.resolutionStatus, "PARTIAL");
  assert.equal(log.missingArtifacts, timeline.missingArtifacts);
});

test("MissionLog conserves missing artifacts on every trace", () => {
  const log = new MissionLog({ enabled: true }).normalize(
    createTimeline([createEvent(1), createEvent(2)]),
  );

  assert.ok(log);
  assert.deepEqual(log.missingArtifacts, ["ARTIFACT-1"]);
  assert.deepEqual(log.entries[0]?.missingArtifacts, ["ARTIFACT-1"]);
  assert.deepEqual(log.entries[1]?.missingArtifacts, ["ARTIFACT-1"]);
});

test("MissionLog supports an empty timeline", () => {
  const log = new MissionLog({ enabled: true }).normalize(
    createTimeline([]),
  );

  assert.ok(log);
  assert.deepEqual(log.entries, []);
  assert.equal(log.authorityDecision, null);
  assert.equal(log.pipelineTrace, null);
});

test("MissionLog rejects an event from another mission", () => {
  const event = {
    ...createEvent(1),
    missionId: "OTHER-MISSION",
  };
  const invalidTimeline = {
    ...createTimeline([]),
    events: [event],
  } as MissionTimelineModel;

  assert.throws(
    () =>
      new MissionLog({ enabled: true }).normalize(invalidTimeline),
    /MLOG-002/,
  );
});

test("MissionLog returns deterministic immutable data", () => {
  const timeline = createTimeline([createEvent(1)]);
  const logger = new MissionLog({ enabled: true });
  const first = logger.normalize(timeline);
  const second = logger.normalize(timeline);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.entries), true);
});

test("MissionLog is inert when Feature Flag is OFF", () => {
  const unreadableTimeline = {};
  Object.defineProperty(unreadableTimeline, "events", {
    get() {
      throw new Error("Feature Flag OFF must not inspect logs.");
    },
  });

  const log = new MissionLog().normalize(
    unreadableTimeline as MissionTimelineModel,
  );

  assert.equal(log, null);
});
