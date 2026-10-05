import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { parseWorkPeopleResponse, runtimeWorkPeoplePath } from "../../contracts/work-people.contract.js";
import type { WorkPeopleReadResult } from "../runtime/work/work-people.types.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import type { NovaCoreService } from "./nova-core.service.js";

const PROJECT_ID = "NOVA";
const WORK_ID = "WORK-PEOPLE-001";
const qualification = {
  sourceDomain: "PEOPLE" as const,
  aggregateRevision: 2,
  lastEventSequence: 4,
  qualifiedAt: "2026-10-03T10:00:00.000Z",
  provenance: { authority: "PEOPLE", businessCause: "assignment", effectiveAt: "2026-10-02T10:00:00.000Z" },
};

test("Core HTTP exposes the authoritative Work People read and preserves all source states", async (context) => {
  let exists = true;
  let people: WorkPeopleReadResult = {
    projectId: PROJECT_ID, workId: WORK_ID, status: "PARTICIPANTS_AVAILABLE",
    participants: [{ businessPersonId: "person-1", workAssignmentId: "assignment-1" }], qualification,
  };
  const calls: Array<{ projectId: string; workId: string }> = [];
  const core = {
    getMission(projectId: string, workId: string) { return exists && projectId === PROJECT_ID && workId === WORK_ID ? {} : null; },
    getWorkPeople(projectId: string, workId: string) { calls.push({ projectId, workId }); return people; },
  } as unknown as NovaCoreService;
  const server = createNovaCoreHttpServer(core);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(() => server.close());
  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}${runtimeWorkPeoplePath(PROJECT_ID, WORK_ID)}`;

  const available = await fetch(url);
  assert.equal(available.status, 200);
  assert.deepEqual(parseWorkPeopleResponse(await available.json()).people, {
    workIdentity: { projectId: PROJECT_ID, workId: WORK_ID }, state: "AVAILABLE",
    participants: [{ businessPersonId: "person-1", workAssignmentId: "assignment-1" }], qualification,
  });
  assert.deepEqual(calls, [{ projectId: PROJECT_ID, workId: WORK_ID }]);

  people = { projectId: PROJECT_ID, workId: WORK_ID, status: "NO_ACTIVE_PARTICIPANTS", participants: [], qualification };
  assert.equal(parseWorkPeopleResponse(await (await fetch(url)).json()).people.state, "EMPTY");
  people = { projectId: PROJECT_ID, workId: WORK_ID, status: "WORK_PEOPLE_ABSENT", sourceDomain: "PEOPLE" };
  assert.equal(parseWorkPeopleResponse(await (await fetch(url)).json()).people.state, "ABSENT");
  people = { projectId: PROJECT_ID, workId: WORK_ID, status: "PEOPLE_UNAVAILABLE", sourceDomain: "PEOPLE", reason: "PEOPLE_READ_UNAVAILABLE" };
  assert.equal(parseWorkPeopleResponse(await (await fetch(url)).json()).people.state, "UNAVAILABLE");

  exists = false;
  const before = calls.length;
  const missing = await fetch(url);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json() as { error: { code: string } }).error.code, "WORK_NOT_FOUND");
  assert.equal(calls.length, before);
});
