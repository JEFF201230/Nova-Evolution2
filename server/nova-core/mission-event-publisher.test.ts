import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import {
  MissionEventPublisher,
  type MissionEventInput,
} from "./mission-event-publisher.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";

const MISSION_ID = "NOVA_CORE_OBSERVABILITY_LOT_C";

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

function createEvent(
  sequence: number,
  overrides: Partial<MissionEventInput> = {},
): MissionEventInput {
  return {
    eventId: `EVENT-${sequence}`,
    missionId: MISSION_ID,
    sequence,
    occurredAt: `2026-07-28T15:00:0${sequence}.000Z`,
    type: sequence === 1 ? "MISSION_STARTED" : "MISSION_UPDATED",
    level: "INFO",
    message: `Event ${sequence}`,
    payload: {
      sequence,
    },
    progress: {
      completed: sequence,
      total: 2,
    },
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    resolutionStatus: "RESOLVED",
    pipelineTrace: TRACE,
    missingArtifacts: [],
    ...overrides,
  };
}

test("MissionEventPublisher constructs ordered events", () => {
  const events = new MissionEventPublisher({ enabled: true }).publish([
    createEvent(2),
    createEvent(1),
  ]);

  assert.ok(events);
  assert.deepEqual(events.map((event) => event.sequence), [1, 2]);
  assert.deepEqual(events.map((event) => event.eventId), [
    "EVENT-1",
    "EVENT-2",
  ]);
});

test("MissionEventPublisher preserves event metadata and payload", () => {
  const input = createEvent(1);
  const events = new MissionEventPublisher({ enabled: true }).publish([
    input,
  ]);

  assert.ok(events);
  assert.equal(events[0].payload, input.payload);
  assert.equal(events[0].authorityDecision, AUTHORITY);
  assert.equal(events[0].pipelineTrace, TRACE);
  assert.equal(events[0].validationStatus, "VALID");
  assert.equal(events[0].resolutionStatus, "RESOLVED");
});

test("MissionEventPublisher preserves missing artifacts", () => {
  const events = new MissionEventPublisher({ enabled: true }).publish([
    createEvent(1, {
      missingArtifacts: ["LATEST-GATE"],
    }),
  ]);

  assert.ok(events);
  assert.deepEqual(events[0].missingArtifacts, ["LATEST-GATE"]);
});

test("MissionEventPublisher returns immutable events without mutating input", () => {
  const inputs = [createEvent(2), createEvent(1)];
  const before = structuredClone(inputs);
  const events = new MissionEventPublisher({ enabled: true }).publish(
    inputs,
  );

  assert.deepEqual(inputs, before);
  assert.ok(events);
  assert.equal(Object.isFrozen(events), true);
  assert.equal(Object.isFrozen(events[0]), true);
  assert.equal(Object.isFrozen(events[0].progress), true);
});

test("MissionEventPublisher rejects duplicate sequence metadata", () => {
  assert.throws(
    () =>
      new MissionEventPublisher({ enabled: true }).publish([
        createEvent(1),
        createEvent(1, {
          eventId: "EVENT-OTHER",
        }),
      ]),
    /MEP-003/,
  );
});

test("MissionEventPublisher rejects invalid progress and timestamps", () => {
  assert.throws(
    () =>
      new MissionEventPublisher({ enabled: true }).publish([
        createEvent(1, {
          progress: {
            completed: 3,
            total: 2,
          },
        }),
      ]),
    /MEP-002/,
  );
  assert.throws(
    () =>
      new MissionEventPublisher({ enabled: true }).publish([
        createEvent(1, {
          occurredAt: "2026-07-28",
        }),
      ]),
    /MEP-002/,
  );
});

test("MissionEventPublisher rejects non-serializable payloads", () => {
  const payload: Record<string, unknown> = {};
  payload.self = payload;

  assert.throws(
    () =>
      new MissionEventPublisher({ enabled: true }).publish([
        createEvent(1, { payload }),
      ]),
    /RRA-004/,
  );
});

test("MissionEventPublisher supports an empty event batch", () => {
  const events = new MissionEventPublisher({ enabled: true }).publish([]);

  assert.deepEqual(events, []);
  assert.equal(Object.isFrozen(events), true);
});

test("MissionEventPublisher is inert when Feature Flag is OFF", () => {
  const unreadableInputs = {};
  Object.defineProperty(unreadableInputs, "length", {
    get() {
      throw new Error("Feature Flag OFF must not inspect events.");
    },
  });

  const events = new MissionEventPublisher().publish(
    unreadableInputs as readonly MissionEventInput[],
  );

  assert.equal(events, null);
});
