import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  HOME_ACTIVE_WORK_PATH,
  type HomeActiveWorkResponse,
} from "../../contracts/home-active-work.contract.js";
import {
  sessionCookiePair,
  startTestBff,
  TEST_PASSWORD,
  testBffConfig,
} from "../nova-bff/bff.test-support.js";
import { HttpHomeActiveWorkGateway } from "../nova-bff/home-active-work.gateway.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import { NovaCoreService } from "./nova-core.service.js";

test("HOME read crosses BFF, Runtime HTTP and WCF-001 without a fixture", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "home-001-chain-"));
  const core = await NovaCoreService.open(
    join(directory, "runtime.json"),
    undefined,
    {
      journalAttestationKey:
        "home-001-chain-journal-attestation-key-0001",
    },
  );
  await core.createMission({
    projectId: "NOVA",
    missionId: "HOME-001-CHAIN",
    missionType: "WORK",
    objective: "Prove the canonical HOME Active Work chain.",
    authority: "PROGRAM_DIRECTOR",
    scope: {
      allowed: ["server/runtime/work"],
      forbidden: ["apps/nova-web"],
    },
    deliverables: ["Canonical read chain"],
    stopCriteria: ["The BFF returns WCF-001 data."],
    authorizedReferences: ["NOVA_WORK_CAPABILITY_ARCHITECTURE.md"],
  });
  const coreServer = createNovaCoreHttpServer(core);
  coreServer.listen(0, "127.0.0.1");
  await once(coreServer, "listening");
  context.after(() => coreServer.close());
  const coreAddress = coreServer.address() as AddressInfo;
  const coreOrigin = `http://127.0.0.1:${coreAddress.port}`;

  const bff = await startTestBff(
    testBffConfig({ runtimeOrigin: coreOrigin }),
    {
      homeActiveWorkGateway:
        new HttpHomeActiveWorkGateway(coreOrigin),
    },
  );
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);
  const response = await fetch(
    `${bff.baseUrl}${HOME_ACTIVE_WORK_PATH}`,
    { headers: { Cookie: proof.cookie } },
  );
  const body = await response.json() as HomeActiveWorkResponse;

  assert.equal(response.status, 200);
  assert.equal(body.works.length, 1);
  assert.deepEqual(body.works[0]?.workIdentity, {
    workId: "HOME-001-CHAIN",
    projectId: "NOVA",
  });
  assert.equal(
    body.works[0]?.goal,
    "Prove the canonical HOME Active Work chain.",
  );
  assert.equal(body.works[0]?.lifecycle, "READY");
  assert.equal(body.works[0]?.progress, 0);
  assert.equal(
    body.works[0]?.provenance.lifecycle.producer,
    "WCF-001-LIFECYCLE-001",
  );
});

interface SessionProof {
  readonly cookie: string;
  readonly csrf: string;
}

async function authenticatedProof(baseUrl: string): Promise<SessionProof> {
  const anonymous = await fetch(`${baseUrl}/session`);
  const anonymousProof = proofFromResponse(anonymous);
  const login = await fetch(`${baseUrl}/session/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: anonymousProof.cookie,
      Origin: "https://bff.test",
      "X-CSRF-Token": anonymousProof.csrf,
    },
    body: JSON.stringify({
      username: "active.operator",
      password: TEST_PASSWORD,
    }),
  });
  assert.equal(login.status, 200);
  return proofFromResponse(login);
}

function proofFromResponse(response: Response): SessionProof {
  return {
    cookie: sessionCookiePair(response.headers.get("set-cookie") ?? ""),
    csrf: response.headers.get("x-csrf-token") ?? "",
  };
}
