import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import {
  parseWorkPlanResponse,
  runtimeWorkPlanPath,
} from "../../contracts/work-plan.contract.js";
import type { WorkPlanningReadResult } from "../domain/work/index.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import type { NovaCoreService } from "./nova-core.service.js";

const PROJECT_ID = "NOVA";
const WORK_ID = "MISSION-PLAN-001";

test("Core HTTP exposes the existing Work Planning read with exact identity and states", async (context) => {
  let exists = true;
  let planning = result("PLANNING_AVAILABLE");
  const calls: Array<{ projectId: string; workId: string }> = [];
  const core = {
    getMission(projectId: string, workId: string) {
      return exists && projectId === PROJECT_ID && workId === WORK_ID ? {} : null;
    },
    getWorkPlanning(projectId: string, workId: string) {
      calls.push({ projectId, workId });
      return planning;
    },
  } as unknown as NovaCoreService;
  const server = createNovaCoreHttpServer(core);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(() => server.close());
  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}${runtimeWorkPlanPath(PROJECT_ID, WORK_ID)}`;

  const available = await fetch(url);
  assert.equal(available.status, 200);
  assert.deepEqual(parseWorkPlanResponse(await available.json()), {
    plan: {
      workIdentity: { projectId: PROJECT_ID, workId: WORK_ID },
      state: "AVAILABLE",
      phase: { current: 2, total: 3, phaseId: "review" },
      dueAt: "2026-10-31T17:00:00.000Z",
      dependencies: [{ prerequisite: "draft", dependent: "review" }],
    },
  });
  assert.deepEqual(calls, [{ projectId: PROJECT_ID, workId: WORK_ID }]);

  for (const [domainState, transportState] of [
    ["PLANNING_ABSENT", "ABSENT"],
    ["PLANNING_WITHDRAWN", "WITHDRAWN"],
    ["PLANNING_UNAVAILABLE", "UNAVAILABLE"],
  ] as const) {
    planning = result(domainState);
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.deepEqual(parseWorkPlanResponse(await response.json()).plan, {
      workIdentity: { projectId: PROJECT_ID, workId: WORK_ID },
      state: transportState,
    });
  }

  exists = false;
  const callsBeforeMissing = calls.length;
  const missing = await fetch(url);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json() as { error: { code: string } }).error.code, "WORK_NOT_FOUND");
  assert.equal(calls.length, callsBeforeMissing);
});

function result(status: WorkPlanningReadResult["status"]): WorkPlanningReadResult {
  const identity = { projectId: PROJECT_ID, workId: WORK_ID, sourceDomain: "PLANNING" as const };
  if (status === "PLANNING_AVAILABLE") {
    return {
      ...identity,
      status,
      planningVersion: 4,
      revision: 5,
      applicability: {} as never,
      phase: { current: 2, total: 3, phaseId: "review" },
      dueAt: "2026-10-31T17:00:00.000Z",
      dependencies: [{ prerequisite: "draft", dependent: "review" }],
      provenance: {} as never,
    };
  }
  if (status === "PLANNING_WITHDRAWN") {
    return { ...identity, status, latestVersion: 4, revision: 5, provenance: {} as never };
  }
  if (status === "PLANNING_UNAVAILABLE") {
    return { ...identity, status, reason: "PLANNING_READ_UNAVAILABLE" };
  }
  return { ...identity, status };
}
