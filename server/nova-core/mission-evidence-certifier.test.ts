import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import {
  IntegrationRuntimeRepository,
} from "./integration-runtime-repository.js";
import {
  MissionEvidenceCertifier,
  type MissionEvidenceCertificationInput,
} from "./mission-evidence-certifier.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";

const MISSION_ID = "SUPER_WAVE_LOT_D";
const RUN_ID = "RUN-D-001";
const TEST_ATTESTATION_KEY =
  "local-test-attestation-key-32-characters-minimum";
const temporaryDirectories: string[] = [];

test.after(async () => {
  await Promise.all(
    temporaryDirectories.map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

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

function input(
  overrides: Partial<MissionEvidenceCertificationInput> = {},
): MissionEvidenceCertificationInput {
  return {
    missionId: MISSION_ID,
    runId: RUN_ID,
    source: "PROGRAM_TEST",
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    pipelineTrace: TRACE,
    missingArtifacts: [],
    requiredEvidenceTypes: ["TESTS", "TYPECHECK"],
    evidence: [
      {
        evidenceId: "EVIDENCE-2",
        evidenceType: "TYPECHECK",
        source: "TSC",
        occurredAt: "2026-07-28T22:00:01.000Z",
        status: "PASS",
        payload: { exitCode: 0 },
      },
      {
        evidenceId: "EVIDENCE-1",
        evidenceType: "TESTS",
        source: "NODE_TEST",
        occurredAt: "2026-07-28T22:00:00.000Z",
        status: "PASS",
        payload: { passed: 304 },
      },
    ],
    ...overrides,
  };
}

function certifier(): MissionEvidenceCertifier {
  return new MissionEvidenceCertifier(null, { enabled: true });
}

async function persistentCertifier(): Promise<{
  readonly certifier: MissionEvidenceCertifier;
  readonly repository: IntegrationRuntimeRepository;
}> {
  const directory = await mkdtemp(join(tmpdir(), "nova-lot-d-"));
  temporaryDirectories.push(directory);
  const repository = new IntegrationRuntimeRepository(
    join(directory, "runtime.json"),
    {
      attestationKey: TEST_ATTESTATION_KEY,
      featureFlag: { enabled: true },
    },
  );
  return {
    certifier: new MissionEvidenceCertifier(repository, {
      enabled: true,
    }),
    repository,
  };
}

test("LOT D builds a complete evidence bundle", () => {
  const bundle = certifier().build(input());
  assert.ok(bundle);
  assert.equal(bundle.missionId, MISSION_ID);
  assert.equal(bundle.runId, RUN_ID);
  assert.equal(bundle.evidence.length, 2);
});

test("LOT D blocks when required evidence is absent", () => {
  const bundle = certifier().build(
    input({ evidence: input().evidence.slice(0, 1) }),
  );
  assert.ok(bundle);
  assert.equal(bundle.certification.decision, "BLOCKED");
  assert.match(bundle.certification.justification[0] ?? "", /MISSING/);
});

test("LOT D rejects malformed evidence", () => {
  assert.throws(
    () =>
      certifier().build(
        input({
          evidence: [
            {
              ...input().evidence[0]!,
              occurredAt: "invalid",
            },
          ],
        }),
      ),
    /MEC-002/,
  );
});

test("LOT D orders evidence deterministically", () => {
  const bundle = certifier().build(input());
  assert.ok(bundle);
  assert.deepEqual(
    bundle.evidence.map((evidence) => evidence.evidenceId),
    ["EVIDENCE-1", "EVIDENCE-2"],
  );
});

test("LOT D produces stable fingerprints", () => {
  const first = certifier().build(input());
  const second = certifier().build(input());
  assert.equal(first?.bundleFingerprint, second?.bundleFingerprint);
});

test("LOT D detects evidence alteration", () => {
  const service = certifier();
  const bundle = service.build(input());
  assert.ok(bundle);
  const altered = {
    ...bundle,
    evidence: [
      {
        ...bundle.evidence[0]!,
        payload: { exitCode: 1 },
      },
      ...bundle.evidence.slice(1),
    ],
  };

  assert.equal(service.verify(altered), false);
});

test("LOT D persists and reloads evidence through LOT F", async () => {
  const { certifier: service, repository } =
    await persistentCertifier();
  const bundle = service.build(input());
  assert.ok(bundle);
  await service.persist(bundle, {
    evidenceRecordId: "EVIDENCE-RECORD-1",
    certificationRecordId: "CERTIFICATION-RECORD-1",
    occurredAt: "2026-07-28T22:00:02.000Z",
  });

  assert.equal((await repository.readAll()).length, 2);
  assert.equal(
    (await repository.readLatest(
      "CERTIFICATION",
      MISSION_ID,
      RUN_ID,
    ))?.payload &&
      (
        await repository.readLatest(
          "CERTIFICATION",
          MISSION_ID,
          RUN_ID,
        )
      )?.kind,
    "CERTIFICATION",
  );
});

test("LOT D produces NO_GO for missing artifacts", () => {
  const bundle = certifier().build(
    input({ missingArtifacts: ["REQUIRED-REPORT"] }),
  );
  assert.ok(bundle);
  assert.equal(bundle.certification.decision, "NO_GO");
});

test("LOT D propagates authority and validation metadata", () => {
  const bundle = certifier().build(input());
  assert.ok(bundle);
  assert.equal(bundle.authorityDecision, AUTHORITY);
  assert.equal(bundle.pipelineTrace, TRACE);
  assert.equal(bundle.validationStatus, "VALID");
});

test("LOT D emits GO only for complete valid evidence", () => {
  const bundle = certifier().build(input());
  assert.ok(bundle);
  assert.equal(bundle.certification.decision, "GO");
  assert.deepEqual(bundle.certification.justification, [
    "ALL_REQUIRED_EVIDENCE_VALID",
  ]);
});

test("LOT D emits NO_GO for evaluable evidence failure", () => {
  const failedEvidence = input().evidence.map((evidence, index) =>
    index === 0 ? { ...evidence, status: "FAIL" as const } : evidence,
  );
  const bundle = certifier().build(input({ evidence: failedEvidence }));
  assert.ok(bundle);
  assert.equal(bundle.certification.decision, "NO_GO");
});

test("LOT D emits BLOCKED for unavailable evidence", () => {
  const unavailable = input().evidence.map((evidence, index) =>
    index === 0
      ? { ...evidence, status: "UNAVAILABLE" as const }
      : evidence,
  );
  const bundle = certifier().build(input({ evidence: unavailable }));
  assert.ok(bundle);
  assert.equal(bundle.certification.decision, "BLOCKED");
});

test("LOT D creates a deterministic separated report", () => {
  const bundle = certifier().build(input());
  assert.ok(bundle);
  assert.deepEqual(bundle.report.controls, [
    "AUTHORITY_CHECKED",
    "VALIDATION_CHECKED",
    "REQUIRED_EVIDENCE_CHECKED",
    "FINGERPRINTS_CHECKED",
  ]);
  assert.equal(bundle.report.decision, "GO");
});

test("LOT D refuses certification without a run", () => {
  assert.throws(
    () => certifier().build(input({ runId: "" })),
    /MEC-001/,
  );
});

test("LOT D refuses persistence after proof modification", async () => {
  const { certifier: service } = await persistentCertifier();
  const bundle = service.build(input());
  assert.ok(bundle);
  const altered = {
    ...bundle,
    missingArtifacts: ["ALTERED"],
  };

  await assert.rejects(
    () =>
      service.persist(altered, {
        evidenceRecordId: "EVIDENCE-RECORD-1",
        certificationRecordId: "CERTIFICATION-RECORD-1",
        occurredAt: "2026-07-28T22:00:02.000Z",
      }),
    /MEC-004/,
  );
});

test("LOT D binds the decision to the bundle fingerprint", () => {
  const bundle = certifier().build(input());
  assert.ok(bundle);
  assert.equal(
    bundle.certification.bundleFingerprint,
    bundle.bundleFingerprint,
  );
  assert.equal(certifier().verify(bundle), true);
});

test("LOT D rejects duplicate evidence identifiers", () => {
  const duplicate = input().evidence[0]!;
  assert.throws(
    () =>
      certifier().build(
        input({ evidence: [duplicate, { ...duplicate }] }),
      ),
    /MEC-002/,
  );
});

test("LOT D remains inactive while its Feature Flag is OFF", () => {
  const unreadable = {};
  Object.defineProperty(unreadable, "missionId", {
    get() {
      throw new Error("OFF must not inspect evidence.");
    },
  });
  assert.equal(
    new MissionEvidenceCertifier().build(
      unreadable as MissionEvidenceCertificationInput,
    ),
    null,
  );
});
