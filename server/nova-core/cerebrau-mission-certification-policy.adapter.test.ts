import assert from "node:assert/strict";
import {
  access,
  mkdtemp,
  readFile,
  readdir,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  CerebrauMissionCertificationPolicyAdapter,
  CerebrauMissionCertificationPolicyAdapterError,
  type CerebrauMissionCertificationPolicyInput,
} from "./cerebrau-mission-certification-policy.adapter.js";
import {
  runCommand,
  type NovaCoreCommandRunner,
} from "./nova-core.execution.js";

const INPUT: CerebrauMissionCertificationPolicyInput = Object.freeze({
  ExecutionMode: "IMPLEMENTATION",
  OfficialStatus: "SUCCESS",
  AuthorityDecision: "ACCEPTED",
  FinalMissionState: "COMPLETED",
  ExitCode: 0,
  OfficialReport: { report: "preserved" },
  Evidence: { evidence: "preserved" },
  Tests: [{ Required: true, Passed: true }],
  Regressions: "NONE",
  ContractCriteriaSatisfied: true,
});

const DECISION = Object.freeze({
  Decision: "CERTIFIED",
  ReasonCode: "MISSION_OUTCOME_CERTIFIED",
  RetryAllowed: false,
  RegistryTransition: "CERTIFIED",
  InvokeCompleteDomainLot: true,
  PreserveEvidence: true,
});

test("adapter delegates the exact policy input and removes only its temporary directory", async () => {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "nova-certification-adapter-test-"),
  );
  let observedInputPath = "";
  const runner: NovaCoreCommandRunner = async (
    command,
    args,
    workingDirectory,
    options,
  ) => {
    assert.equal(command, "test-powershell");
    assert.equal(workingDirectory, "C:\\repository");
    assert.deepEqual(args.slice(0, 6), [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      "C:\\policy-wrapper.ps1",
    ]);
    assert.equal(args[6], "-InputPath");
    observedInputPath = args[7]!;
    assert.deepEqual(
      JSON.parse(await readFile(observedInputPath, "utf8")),
      INPUT,
    );
    assert.equal(options?.maxStdoutBytes, 100_000);
    assert.equal(options?.maxStderrBytes, 100_000);
    return {
      exitCode: 0,
      stdout: JSON.stringify(DECISION),
      stderr: "",
    };
  };

  try {
    const adapter = new CerebrauMissionCertificationPolicyAdapter({
      repositoryRoot: "C:\\repository",
      commandRunner: runner,
      powershellCommand: "test-powershell",
      scriptPath: "C:\\policy-wrapper.ps1",
      temporaryRoot,
    });

    const result = await adapter.resolve(INPUT);

    assert.deepEqual(result, DECISION);
    assert.equal(Object.isFrozen(result), true);
    await assert.rejects(access(observedInputPath));
    assert.deepEqual(await readdir(temporaryRoot), []);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("adapter rejects malformed policy decisions and still cleans its temporary directory", async () => {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "nova-certification-adapter-invalid-test-"),
  );
  const adapter = new CerebrauMissionCertificationPolicyAdapter({
    repositoryRoot: process.cwd(),
    commandRunner: async () => ({
      exitCode: 0,
      stdout: JSON.stringify({
        ...DECISION,
        PreserveEvidence: false,
      }),
      stderr: "",
    }),
    temporaryRoot,
  });

  try {
    await assert.rejects(
      adapter.resolve(INPUT),
      (error: unknown) =>
        error instanceof CerebrauMissionCertificationPolicyAdapterError &&
        error.code === "CMCPA-003",
    );
    assert.deepEqual(await readdir(temporaryRoot), []);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("adapter reports policy process failures without accepting stdout", async () => {
  const adapter = new CerebrauMissionCertificationPolicyAdapter({
    repositoryRoot: process.cwd(),
    commandRunner: async () => ({
      exitCode: 1,
      stdout: JSON.stringify(DECISION),
      stderr: "POLICY_FAILED",
    }),
  });

  await assert.rejects(
    adapter.resolve(INPUT),
    (error: unknown) =>
      error instanceof CerebrauMissionCertificationPolicyAdapterError &&
      error.code === "CMCPA-002" &&
      error.details === "POLICY_FAILED\n" + JSON.stringify(DECISION),
  );
});

test(
  "real wrapper delegates to the pure CEREBRAU policy without changing PEOPLE certification",
  { skip: process.platform !== "win32" },
  async () => {
    const repositoryRoot = process.cwd();
    const registryPath = join(
      repositoryRoot,
      "Docs",
      "12_CERTIFICATION",
      "certification-registry.json",
    );
    const certificationPath = join(
      repositoryRoot,
      "Docs",
      "12_CERTIFICATION",
      "PEOPLE",
      "P3-PEOPLE-001D.certification.json",
    );
    const registryBefore = await readFile(registryPath, "utf8");
    const certificationBefore = await readFile(certificationPath, "utf8");
    const adapter = new CerebrauMissionCertificationPolicyAdapter({
      repositoryRoot,
      commandRunner: runCommand,
      powershellCommand: "powershell.exe",
    });

    const decision = await adapter.resolve({
      ...INPUT,
      ExecutionMode: "INVALID_MODE",
      OfficialReport: null,
      Evidence: null,
      Tests: null,
      Regressions: null,
      ContractCriteriaSatisfied: false,
    });

    assert.deepEqual(decision, {
      Decision: "EXECUTION_FAILED",
      ReasonCode: "OUTCOME_CONTRACT_INVALID",
      RetryAllowed: true,
      RegistryTransition: "KEEP_CURRENT",
      InvokeCompleteDomainLot: false,
      PreserveEvidence: true,
    });
    assert.equal(await readFile(registryPath, "utf8"), registryBefore);
    assert.equal(
      await readFile(certificationPath, "utf8"),
      certificationBefore,
    );
  },
);
