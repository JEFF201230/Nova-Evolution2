import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { workPeoplePath, type WorkPeopleResponse } from "../../contracts/work-people.contract.js";
import type { BusinessPerson } from "../domain/people/business-person.aggregate.js";
import { PeopleAuthority } from "../domain/people/people-authority.js";
import { PeopleCommandService } from "../domain/people/people-command-service.js";
import { PeopleAggregatePersistenceStore } from "../domain/people/people-persistence-aggregate-store.js";
import {
  AssignmentPeriod, BusinessPersonId, BusinessRole, PeopleProvenance,
  WorkAssignmentId, WorkReference,
} from "../domain/people/people.value-objects.js";
import { sessionCookiePair, startTestBff, TEST_PASSWORD, testBffConfig } from "../nova-bff/bff.test-support.js";
import { HttpWorkPeopleGateway } from "../nova-bff/work-people.gateway.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import { NovaCoreService } from "./nova-core.service.js";

const PROJECT_ID = "NOVA";
const WORK_ID = "WORK-PEOPLE-E2E";

test("PEOPLE persistence reaches authenticated Work People UI transport without a fixture", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "work-people-e2e-"));
  const peoplePath = join(directory, "people.sqlite");
  establishPeople(peoplePath);
  const core = await NovaCoreService.open(join(directory, "runtime.json"), undefined, {
    journalAttestationKey: "work-people-e2e-attestation-key-001",
    peopleDatabasePath: peoplePath,
  });
  await core.createMission({
    projectId: PROJECT_ID, missionId: WORK_ID, missionType: "WORK",
    objective: "Expose authoritative PEOPLE participants through the real Work People path.", authority: "PROGRAM_DIRECTOR",
    scope: { allowed: ["server/nova-core", "server/nova-bff", "apps/nova-web"], forbidden: [] },
    deliverables: ["Work People read"], stopCriteria: ["No fixture fallback"], authorizedReferences: [],
  });

  const coreServer = createNovaCoreHttpServer(core);
  coreServer.listen(0, "127.0.0.1");
  await once(coreServer, "listening");
  context.after(() => coreServer.close());
  const coreOrigin = `http://127.0.0.1:${(coreServer.address() as AddressInfo).port}`;
  const bff = await startTestBff(testBffConfig({ runtimeOrigin: coreOrigin }), {
    workPeopleGateway: new HttpWorkPeopleGateway(coreOrigin),
  });
  context.after(() => bff.close());
  const cookie = await authenticatedCookie(bff.baseUrl);

  const response = await fetch(`${bff.baseUrl}${workPeoplePath(WORK_ID)}`, {
    headers: { Cookie: cookie, "X-Correlation-ID": "corr-work-people-e2e" },
  });
  const body = await response.json() as WorkPeopleResponse;
  assert.equal(response.status, 200);
  assert.deepEqual(body.people.workIdentity, { projectId: PROJECT_ID, workId: WORK_ID });
  assert.equal(body.people.state, "AVAILABLE");
  if (body.people.state === "AVAILABLE") {
    assert.deepEqual(body.people.participants, [{ businessPersonId: "business-person-e2e", workAssignmentId: "work-assignment-e2e" }]);
    assert.equal(body.people.qualification.sourceDomain, "PEOPLE");
  }
});

function establishPeople(path: string): void {
  const database = new DatabaseSync(path);
  try {
    const store = new PeopleAggregatePersistenceStore(database);
    const commands = new PeopleCommandService(PeopleAuthority.establish("WORK-PEOPLE-E2E"), store);
    const created = commands.execute({
      kind: "CREATE_BUSINESS_PERSON",
      personId: BusinessPersonId.of("business-person-e2e"),
      provenance: PeopleProvenance.of("WORK-PEOPLE-E2E", "recognize-person", new Date("2026-08-01T09:00:00.000Z")),
    }, { expectedRevision: 0, correlationId: "corr-create-person" });
    commands.execute({
      kind: "ASSIGN_PERSON_TO_WORK",
      person: created.aggregate as BusinessPerson,
      workReference: WorkReference.of(PROJECT_ID, WORK_ID),
      assignmentId: WorkAssignmentId.of("work-assignment-e2e"),
      roles: [BusinessRole.of("CONTRIBUTOR")],
      period: AssignmentPeriod.startingAt(new Date("2026-08-02T09:00:00.000Z")),
      provenance: PeopleProvenance.of("WORK-PEOPLE-E2E", "assign-person", new Date("2026-08-02T09:00:00.000Z")),
    }, { expectedRevision: 0, correlationId: "corr-assign-person", workReference: WorkReference.of(PROJECT_ID, WORK_ID) });
  } finally {
    database.close();
  }
}

async function authenticatedCookie(baseUrl: string): Promise<string> {
  const anonymous = await fetch(`${baseUrl}/session`);
  const anonymousCookie = sessionCookiePair(anonymous.headers.get("set-cookie") ?? "");
  const login = await fetch(`${baseUrl}/session/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: anonymousCookie, Origin: "https://bff.test", "X-CSRF-Token": anonymous.headers.get("x-csrf-token") ?? "" },
    body: JSON.stringify({ username: "active.operator", password: TEST_PASSWORD }),
  });
  assert.equal(login.status, 200);
  return sessionCookiePair(login.headers.get("set-cookie") ?? "");
}
