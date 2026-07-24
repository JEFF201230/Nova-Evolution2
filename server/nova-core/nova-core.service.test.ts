import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { MissionDefinition } from "../runtime/orchestrator/orchestrator-runtime.js";
import { NovaCoreService } from "./nova-core.service.js";

function mission(overrides: Partial<MissionDefinition> = {}): MissionDefinition {
  return {
    projectId: "CEREBRAU",
    missionId: "NOVA-MVP-001",
    missionType: "DEVELOPMENT",
    objective: "Assembler le premier parcours durable de NOVA Core.",
    authority: "HUMAN_OWNER",
    scope: {
      allowed: ["server/nova-core"],
      forbidden: ["secrets", "production"],
    },
    deliverables: ["Service NOVA Core", "Tests de fonctionnement"],
    stopCriteria: ["La mission conserve son état après un redémarrage."],
    authorizedReferences: ["RAPPORT_AUDIT_NOVA_ORCHESTRATOR_2026-07-24"],
    priority: 10,
    ...overrides,
  };
}

test("NOVA Core conserve une mission et ses preuves après un redémarrage", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-core-service-"));
  const dataFile = join(directory, "runtime.json");
  let core = await NovaCoreService.open(dataFile);

  const created = await core.createMission(mission());
  assert.equal(created.created, true);
  assert.equal(created.mission.state, "READY");

  const locked = await core.assignAndLock("CEREBRAU", "NOVA-MVP-001");
  assert.equal(locked.state, "LOCKED");

  const report = await core.submitEvidence("CEREBRAU", "NOVA-MVP-001", {
    reportId: "REPORT-NOVA-MVP-001",
    deliverables: ["Service NOVA Core", "Tests de fonctionnement"],
    filesChanged: ["server/nova-core/nova-core.service.ts"],
    checks: ["test de persistance"],
    blockers: [],
    errors: [],
    scopeConfirmed: true,
  });
  assert.equal(report.reportId, "REPORT-NOVA-MVP-001");
  assert.equal(core.getMission("CEREBRAU", "NOVA-MVP-001")?.state, "SUBMITTED");

  core = await NovaCoreService.open(dataFile);
  assert.equal(core.getMission("CEREBRAU", "NOVA-MVP-001")?.state, "SUBMITTED");
  assert.equal(core.getReport("CEREBRAU", "NOVA-MVP-001")?.checks[0], "test de persistance");

  const awaitingHuman = await core.acceptTechnicalValidation("CEREBRAU", "NOVA-MVP-001");
  assert.equal(awaitingHuman.state, "HUMAN_VALIDATION");

  const accepted = await core.approveMission("CEREBRAU", "NOVA-MVP-001");
  assert.equal(accepted.state, "ACCEPTED");

  core = await NovaCoreService.open(dataFile);
  assert.equal(core.getMission("CEREBRAU", "NOVA-MVP-001")?.state, "ACCEPTED");
  assert.deepEqual(
    core.getEvents("CEREBRAU", "NOVA-MVP-001").map((event) => event.eventName),
    [
      "MissionCreated",
      "MissionAccepted",
      "AgentAssigned",
      "LockGranted",
      "AgentStarted",
      "ReportSubmitted",
      "TechnicalValidationStarted",
      "TechnicalValidationAccepted",
      "FinalValidationAccepted",
      "LockReleased",
    ],
  );
});

test("NOVA Core refuse la validation quand un problème reste ouvert", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-core-blocker-"));
  const core = await NovaCoreService.open(join(directory, "runtime.json"));

  await core.createMission(mission({ missionId: "NOVA-MVP-BLOCKED" }));
  await core.submitEvidence("CEREBRAU", "NOVA-MVP-BLOCKED", {
    deliverables: ["Service incomplet"],
    filesChanged: [],
    checks: ["test partiel"],
    blockers: ["Connexion CEREBRAU absente"],
    errors: [],
    scopeConfirmed: true,
  });

  await assert.rejects(
    () => core.acceptTechnicalValidation("CEREBRAU", "NOVA-MVP-BLOCKED"),
    /bloquée tant que des problèmes ou erreurs restent ouverts/,
  );
  assert.equal(core.getMission("CEREBRAU", "NOVA-MVP-BLOCKED")?.state, "SUBMITTED");
});
