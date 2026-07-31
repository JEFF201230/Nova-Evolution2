import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  RUNTIME_ACTIVE_WORK_PATH,
  type HomeActiveWorkResponse,
} from "../../contracts/home-active-work.contract.js";
import type {
  MissionDefinition,
  RuntimeMission,
  RuntimeObservabilityEvent,
} from "../runtime/orchestrator/orchestrator-runtime.types.js";
import { HomeActiveWorkQuery } from "./home-active-work.query.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import { NovaCoreService } from "./nova-core.service.js";

const PROJECT_ID = "NOVA";
const ACTIVE_MISSION_ID = "HOME-001-ACTIVE";
const COMPLETED_MISSION_ID = "HOME-001-COMPLETED";
const TIMESTAMP = "2026-07-30T12:00:00.000Z";
const TEST_ATTESTATION_KEY = "home-active-work-attestation-key-001";

function definition(
  missionId = ACTIVE_MISSION_ID,
): MissionDefinition {
  return {
    projectId: PROJECT_ID,
    missionId,
    missionType: "WORK",
    objective: `Goal for ${missionId}`,
    authority: "PROGRAM_DIRECTOR",
    scope: {
      allowed: ["server/runtime/work"],
      forbidden: ["apps/nova-web"],
    },
    deliverables: ["HOME Active Work"],
    stopCriteria: ["The read-only chain is available."],
    authorizedReferences: ["NOVA_WORK_CAPABILITY_ARCHITECTURE.md"],
    createdAt: TIMESTAMP,
  };
}

function mission(
  missionId: string,
  state: RuntimeMission["state"],
): RuntimeMission {
  return {
    ...definition(missionId),
    state,
    assignedAgentId: null,
    lockId: null,
    runId: null,
    contextId: null,
    reportId: null,
    updatedAt: TIMESTAMP,
  };
}

function observation(
  missionId: string,
  progression: number,
): RuntimeObservabilityEvent {
  return {
    observabilityEventId: `OBS-${missionId}`,
    runtimeEventId: `EVENT-${missionId}`,
    sequence: progression + 1,
    timestamp: TIMESTAMP,
    projectId: PROJECT_ID,
    missionId,
    runId: null,
    correlationId: `CORR-${missionId}`,
    phase: progression === 90 ? "COMPLETED" : "RUNNING",
    progression,
    durationMs: 0,
    message: missionId,
    level: "INFO",
  };
}

test("HOME Active Work query returns only WCF-001 non-terminal aggregates", () => {
  const missions = [
    mission(ACTIVE_MISSION_ID, "RUNNING"),
    mission(COMPLETED_MISSION_ID, "CERTIFIED"),
  ];
  const observations = [
    observation(ACTIVE_MISSION_ID, 50),
    observation(COMPLETED_MISSION_ID, 90),
  ];
  const query = new HomeActiveWorkQuery({
    listMissions: () => structuredClone(missions),
    getMission: (_projectId, missionId) =>
      structuredClone(
        missions.find((candidate) => candidate.missionId === missionId),
      ),
    getObservabilityEvents: (_projectId, missionId) =>
      structuredClone(
        observations.filter((event) => event.missionId === missionId),
      ),
  });

  const response = query.list();

  assert.equal(response.works.length, 1);
  assert.deepEqual(response.works[0], {
    workIdentity: {
      workId: ACTIVE_MISSION_ID,
      projectId: PROJECT_ID,
    },
    mission: {
      projectId: PROJECT_ID,
      missionId: ACTIVE_MISSION_ID,
    },
    goal: `Goal for ${ACTIVE_MISSION_ID}`,
    lifecycle: "ACTIVE",
    progress: 50,
    updatedAt: TIMESTAMP,
    provenance: {
      identity: {
        sourceDomain: "MISSIONS",
        producer: "ORCHESTRATOR_RUNTIME",
        sourceId: `${PROJECT_ID}/${ACTIVE_MISSION_ID}`,
        observedAt: TIMESTAMP,
      },
      lifecycle: {
        sourceDomain: "WORK",
        producer: "WCF-001-LIFECYCLE-001",
        sourceId: `${PROJECT_ID}/${ACTIVE_MISSION_ID}/ACTIVE`,
        observedAt: TIMESTAMP,
      },
      progress: {
        sourceDomain: "MONITORING",
        producer: "ORCHESTRATOR_OBSERVABILITY",
        sourceId: `OBS-${ACTIVE_MISSION_ID}`,
        observedAt: TIMESTAMP,
        sequence: 51,
        correlationId: `CORR-${ACTIVE_MISSION_ID}`,
        runId: null,
      },
    },
  });
});

test("NOVA Core exposes the minimal HOME Active Work Runtime endpoint", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "nova-home-active-work-"));
  const core = await NovaCoreService.open(
    join(directory, "runtime.json"),
    undefined,
    { journalAttestationKey: TEST_ATTESTATION_KEY },
  );
  await core.createMission(definition());
  const server = createNovaCoreHttpServer(core);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(() => server.close());
  const address = server.address() as AddressInfo;

  const response = await fetch(
    `http://127.0.0.1:${address.port}${RUNTIME_ACTIVE_WORK_PATH}`,
  );
  const body = await response.json() as HomeActiveWorkResponse;

  assert.equal(response.status, 200);
  assert.equal(body.works.length, 1);
  assert.equal(body.works[0]?.workIdentity.workId, ACTIVE_MISSION_ID);
  assert.equal(body.works[0]?.mission.missionId, ACTIVE_MISSION_ID);
  assert.equal(body.works[0]?.lifecycle, "READY");
  assert.equal(body.works[0]?.progress, 0);
  assert.equal(
    body.works[0]?.provenance.progress.sourceDomain,
    "MONITORING",
  );
  assert.deepEqual(
    Object.keys(body.works[0] ?? {}).sort(),
    [
      "goal",
      "lifecycle",
      "mission",
      "progress",
      "provenance",
      "updatedAt",
      "workIdentity",
    ],
  );
});
