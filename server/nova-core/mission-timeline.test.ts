import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionEvent,
} from "./mission-event-publisher.js";
import {
  MissionTimeline,
  type MissionTimelineBuildInput,
} from "./mission-timeline.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";

const MISSION_ID = "NOVA_CORE_TIMELINE_LOT_C";

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
  missingArtifactIds: [],
};

function createEvent(sequence: number): MissionEvent {
  return {
    eventId: `EVENT-${sequence}`,
    missionId: MISSION_ID,
    sequence,
    occurredAt: `2026-07-28T16:00:0${sequence}.000Z`,
    type: "MISSION_UPDATED",
    level: "INFO",
    message: `Event ${sequence}`,
    payload: null,
    authorityDecision: AUTHORITY,
    validationStatus: sequence === 1 ? "INVALID" : "VALID",
    resolutionStatus: sequence === 1 ? "PARTIAL" : "RESOLVED",
    pipelineTrace: TRACE,
    missingArtifacts: sequence === 1 ? ["LATEST-GATE"] : [],
  };
}

test("MissionTimeline constructs a linked chronology", () => {
  const events = [createEvent(1), createEvent(2)];
  const timeline = new MissionTimeline({ enabled: true }).build({
    missionId: MISSION_ID,
    events,
  });

  assert.ok(timeline);
  assert.deepEqual(timeline.events, events);
  assert.equal(timeline.firstOccurredAt, events[0].occurredAt);
  assert.equal(timeline.lastOccurredAt, events[1].occurredAt);
});

test("MissionTimeline exposes the latest certified state", () => {
  const timeline = new MissionTimeline({ enabled: true }).build({
    missionId: MISSION_ID,
    events: [createEvent(1), createEvent(2)],
  });

  assert.ok(timeline);
  assert.equal(timeline.authorityDecision, AUTHORITY);
  assert.equal(timeline.pipelineTrace, TRACE);
  assert.equal(timeline.validationStatus, "VALID");
  assert.equal(timeline.resolutionStatus, "RESOLVED");
  assert.deepEqual(timeline.missingArtifacts, []);
});

test("MissionTimeline rejects events from another mission", () => {
  assert.throws(
    () =>
      new MissionTimeline({ enabled: true }).build({
        missionId: MISSION_ID,
        events: [
          {
            ...createEvent(1),
            missionId: "OTHER-MISSION",
          },
        ],
      }),
    /MTL-002/,
  );
});

test("MissionTimeline rejects unordered events", () => {
  assert.throws(
    () =>
      new MissionTimeline({ enabled: true }).build({
        missionId: MISSION_ID,
        events: [createEvent(2), createEvent(1)],
      }),
    /MTL-002/,
  );
});

test("MissionTimeline rejects traceability reference changes", () => {
  assert.throws(
    () =>
      new MissionTimeline({ enabled: true }).build({
        missionId: MISSION_ID,
        events: [
          createEvent(1),
          {
            ...createEvent(2),
            pipelineTrace: { ...TRACE },
          },
        ],
      }),
    /MTL-003/,
  );
});

test("MissionTimeline supports an empty mission timeline", () => {
  const timeline = new MissionTimeline({ enabled: true }).build({
    missionId: MISSION_ID,
    events: [],
  });

  assert.ok(timeline);
  assert.deepEqual(timeline.events, []);
  assert.equal(timeline.firstOccurredAt, null);
  assert.equal(timeline.lastOccurredAt, null);
  assert.equal(timeline.authorityDecision, null);
  assert.equal(timeline.pipelineTrace, null);
});

test("MissionTimeline returns deterministic immutable data", () => {
  const builder = new MissionTimeline({ enabled: true });
  const input = {
    missionId: MISSION_ID,
    events: [createEvent(1), createEvent(2)],
  };
  const first = builder.build(input);
  const second = builder.build(input);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.events), true);
});

test("MissionTimeline is inert when Feature Flag is OFF", () => {
  const unreadableInput = {};
  Object.defineProperty(unreadableInput, "events", {
    get() {
      throw new Error("Feature Flag OFF must not inspect timeline.");
    },
  });

  const timeline = new MissionTimeline().build(
    unreadableInput as MissionTimelineBuildInput,
  );

  assert.equal(timeline, null);
});
