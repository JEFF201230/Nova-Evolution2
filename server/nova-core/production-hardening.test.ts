import assert from "node:assert/strict";
import test from "node:test";
import {
  access,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import {
  HumanApprovalWorkflow,
  type HumanApprovalDecisionInput,
} from "./human-approval-workflow.js";
import {
  IntegrationRuntimeRepository,
  type IntegrationPersistedRecord,
} from "./integration-runtime-repository.js";
import {
  MissionEvidenceCertifier,
} from "./mission-evidence-certifier.js";
import {
  MissionLog,
} from "./mission-log.js";
import {
  MissionMetrics,
} from "./mission-metrics.js";
import type {
  MissionProgressModel,
} from "./mission-progress.js";
import type {
  MissionTimelineModel,
} from "./mission-timeline.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";
import {
  ProgramRuntimeOrchestrator,
  type ProgramRuntimeSession,
} from "./program-runtime-orchestrator.js";
import type {
  RuntimeExecutionGateDecision,
} from "./runtime-execution-gate.js";

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

async function repository(prefix = "nova-lot-i-"): Promise<{
  readonly directory: string;
  readonly filePath: string;
  readonly value: IntegrationRuntimeRepository;
}> {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  temporaryDirectories.push(directory);
  const filePath = join(directory, "runtime.json");
  return {
    directory,
    filePath,
    value: new IntegrationRuntimeRepository(filePath, {
      attestationKey: TEST_ATTESTATION_KEY,
      featureFlag: { enabled: true },
    }),
  };
}

function metadata(missionId = "SUPER_WAVE_LOT_I"): {
  readonly authority: AuthorityResolutionDecision;
  readonly trace: NovaOrchestrationPipelineTrace;
  readonly gate: RuntimeExecutionGateDecision;
} {
  const authority: AuthorityResolutionDecision = {
    missionId,
    authorityDomain: "PROGRAM_GOVERNANCE",
    authoritativeSources: [],
    supportingSources: [],
    rejectedSources: [],
    rejectionReasons: [],
    unresolvedAuthorityConflicts: [],
    resolutionStatus: "RESOLVED",
  };
  const trace: NovaOrchestrationPipelineTrace = {
    missionId,
    authoritativeSourceIds: [],
    supportingSourceIds: [],
    rejectedSourceIds: [],
    knowledgeSourceIds: [],
    knowledgeSourcePaths: [],
    dependencyIds: [],
    requiredArtifactIds: [],
    missingArtifactIds: [],
  };
  return {
    authority,
    trace,
    gate: {
      executionAllowed: true,
      validationStatus: "VALID",
      blockingReasons: [],
      authorityDecision: authority,
      resolutionStatus: "RESOLVED",
      missingArtifacts: [],
      pipelineTrace: trace,
    },
  };
}

function persistedRecord(
  recordId: string,
  overrides: Partial<IntegrationPersistedRecord> = {},
): IntegrationPersistedRecord {
  return {
    schemaVersion: 1,
    recordId,
    kind: "SESSION",
    missionId: "SUPER_WAVE_LOT_I",
    runId: "RUN-I-001",
    source: "PROGRAM_TEST",
    occurredAt: "2026-07-29T01:00:00.000Z",
    payload: { state: "READY" },
    ...overrides,
  };
}

function initialized(
  maxRetries = 1,
): {
  readonly orchestrator: ProgramRuntimeOrchestrator;
  readonly session: ProgramRuntimeSession;
  readonly gate: RuntimeExecutionGateDecision;
} {
  const orchestrator = new ProgramRuntimeOrchestrator({
    enabled: true,
  });
  const gate = metadata().gate;
  const session = orchestrator.initialize({
    missionId: "SUPER_WAVE_LOT_I",
    runId: "RUN-I-001",
    source: "PROGRAM_TEST",
    maxRetries,
    gateDecision: gate,
    eventId: "HARDENING-EVENT-1",
    occurredAt: "2026-07-29T01:01:01.000Z",
  });
  assert.ok(session);
  return { orchestrator, session, gate };
}

function transition(
  orchestrator: ProgramRuntimeOrchestrator,
  session: ProgramRuntimeSession,
  state: Parameters<
    ProgramRuntimeOrchestrator["transition"]
  >[1]["targetState"],
  sequence: number,
  extras: Partial<
    Parameters<ProgramRuntimeOrchestrator["transition"]>[1]
  > = {},
): ProgramRuntimeSession {
  const next = orchestrator.transition(session, {
    targetState: state,
    source: "PROGRAM_TEST",
    eventId: `HARDENING-EVENT-${sequence}`,
    occurredAt: `2026-07-29T01:01:${String(sequence).padStart(2, "0")}.000Z`,
    message: `Transition to ${state}.`,
    ...extras,
  });
  assert.ok(next);
  return next;
}

function running(): {
  readonly orchestrator: ProgramRuntimeOrchestrator;
  readonly session: ProgramRuntimeSession;
  readonly gate: RuntimeExecutionGateDecision;
} {
  const values = initialized();
  let session = transition(
    values.orchestrator,
    values.session,
    "ASSIGNED",
    2,
  );
  session = transition(values.orchestrator, session, "LOCKED", 3);
  session = transition(values.orchestrator, session, "RUNNING", 4, {
    gateDecision: values.gate,
  });
  return { ...values, session };
}

function humanValidation(): {
  readonly orchestrator: ProgramRuntimeOrchestrator;
  readonly session: ProgramRuntimeSession;
} {
  const values = running();
  let session = transition(
    values.orchestrator,
    values.session,
    "SUBMITTED",
    5,
  );
  session = transition(
    values.orchestrator,
    session,
    "TECHNICAL_VALIDATION",
    6,
  );
  session = transition(
    values.orchestrator,
    session,
    "DOCUMENTARY_VALIDATION",
    7,
  );
  session = transition(
    values.orchestrator,
    session,
    "HUMAN_VALIDATION",
    8,
  );
  return { orchestrator: values.orchestrator, session };
}

test("LOT I serializes the same mission launched simultaneously", async () => {
  const store = (await repository()).value;
  const input = persistedRecord("CONCURRENT-SAME");
  const [first, second] = await Promise.all([
    store.append(input),
    store.append(input),
  ]);
  assert.deepEqual(first, second);
  assert.equal((await store.readAll()).length, 1);
});

test("LOT I preserves different missions written simultaneously", async () => {
  const store = (await repository()).value;
  await Promise.all([
    store.append(persistedRecord("CONCURRENT-A")),
    store.append(
      persistedRecord("CONCURRENT-B", {
        missionId: "SUPER_WAVE_LOT_I_B",
      }),
    ),
  ]);
  assert.equal((await store.readAll()).length, 2);
});

test("LOT I rejects identifier collisions", async () => {
  const store = (await repository()).value;
  await store.append(persistedRecord("COLLISION"));
  await assert.rejects(
    () =>
      store.append(
        persistedRecord("COLLISION", {
          payload: { state: "FAILED" },
        }),
      ),
    /IPR-003/,
  );
});

test("LOT I gives cancellation precedence over retry", () => {
  const values = running();
  const failed = transition(
    values.orchestrator,
    values.session,
    "FAILED",
    5,
  );
  const cancelled = transition(
    values.orchestrator,
    failed,
    "CANCELLED",
    6,
  );
  assert.throws(
    () =>
      transition(
        values.orchestrator,
        cancelled,
        "ASSIGNED",
        7,
        { recoveryAuthorized: true },
      ),
    /PRO-005|PRO-002/,
  );
});

test("LOT I combines timeout with controlled recovery", () => {
  const values = running();
  const timedOut = transition(
    values.orchestrator,
    values.session,
    "TIMEOUT",
    5,
  );
  const recovered = transition(
    values.orchestrator,
    timedOut,
    "ASSIGNED",
    6,
    { recoveryAuthorized: true },
  );
  assert.equal(recovered.attempt, 2);
  assert.equal(recovered.timeoutObserved, true);
});

test("LOT I supports successive restarts", async () => {
  const values = await repository();
  await values.value.append(persistedRecord("RESTART-1"));
  for (let count = 0; count < 3; count += 1) {
    const restarted = new IntegrationRuntimeRepository(values.filePath, {
      attestationKey: TEST_ATTESTATION_KEY,
      featureFlag: { enabled: true },
    });
    assert.equal((await restarted.recover()).records.length, 1);
  }
});

test("LOT I measures a 100-event local journal without data loss", async () => {
  const store = (await repository()).value;
  const started = performance.now();
  for (let index = 0; index < 100; index += 1) {
    await store.append(
      persistedRecord(`VOLUME-${index}`, {
        occurredAt: new Date(
          Date.UTC(2026, 6, 29, 1, 2, index),
        ).toISOString(),
      }),
    );
  }
  const durationMs = performance.now() - started;
  assert.equal((await store.readAll()).length, 100);
  assert.ok(Number.isFinite(durationMs));
  console.log(
    `PERF journal scenario=append volume=100 durationMs=${durationMs.toFixed(2)} result=PASS limit=local-IO-dependent`,
  );
});

test("LOT I measures a 200-item evidence bundle deterministically", () => {
  const values = metadata();
  const certifier = new MissionEvidenceCertifier(null, {
    enabled: true,
  });
  const evidence = Array.from({ length: 200 }, (_, index) => ({
    evidenceId: `EVIDENCE-${index}`,
    evidenceType: `TYPE-${index}`,
    source: "HARDENING_TEST",
    occurredAt: new Date(
      Date.UTC(2026, 6, 29, 1, 3, index),
    ).toISOString(),
    status: "PASS" as const,
    payload: { index },
  }));
  const started = performance.now();
  const bundle = certifier.build({
    missionId: "SUPER_WAVE_LOT_I",
    runId: "RUN-I-001",
    source: "PROGRAM_TEST",
    authorityDecision: values.authority,
    validationStatus: "VALID",
    pipelineTrace: values.trace,
    missingArtifacts: [],
    requiredEvidenceTypes: evidence.map(
      (item) => item.evidenceType,
    ),
    evidence,
  });
  const durationMs = performance.now() - started;
  assert.equal(bundle?.evidence.length, 200);
  assert.equal(bundle?.certification.decision, "GO");
  console.log(
    `PERF evidence scenario=bundle volume=200 durationMs=${durationMs.toFixed(2)} result=PASS limit=memory-dependent`,
  );
});

test("LOT I rejects empty external input", async () => {
  const store = (await repository()).value;
  await assert.rejects(
    () =>
      store.append({
        ...persistedRecord(""),
        missionId: "",
      }),
    /IPR-001/,
  );
});

test("LOT I rejects malformed non-serializable input", async () => {
  const store = (await repository()).value;
  const cyclic: { self?: unknown } = {};
  cyclic.self = cyclic;
  await assert.rejects(
    () =>
      store.append(
        persistedRecord("CYCLIC", {
          payload: cyclic,
        }),
      ),
    /RRA-004/,
  );
});

test("LOT I rejects an unknown orchestration state", () => {
  const values = initialized();
  assert.throws(
    () =>
      transition(
        values.orchestrator,
        values.session,
        "UNKNOWN" as Parameters<
          ProgramRuntimeOrchestrator["transition"]
        >[1]["targetState"],
        2,
      ),
    /PRO-002/,
  );
});

test("LOT I rejects an unknown persistence version", async () => {
  const values = await repository();
  await writeFile(
    values.filePath,
    JSON.stringify({ dataSchemaVersion: 999 }),
    "utf8",
  );
  await assert.rejects(() => values.value.readAll(), /IPR-005/);
});

test("LOT I ignores corruption in an interrupted temp write", async () => {
  const values = await repository();
  await values.value.append(persistedRecord("VALID"));
  await writeFile(
    `${values.filePath}.write.tmp`,
    "{\"partial\":",
    "utf8",
  );
  assert.equal((await values.value.readAll()).length, 1);
});

test("LOT I surfaces observability consistency errors", () => {
  const timeline = {
    missionId: "MISSION-A",
    events: [],
    firstOccurredAt: null,
    lastOccurredAt: null,
    authorityDecision: null,
    validationStatus: null,
    resolutionStatus: null,
    pipelineTrace: null,
    missingArtifacts: [],
  } as MissionTimelineModel;
  const progress = {
    missionId: "MISSION-B",
    completed: null,
    total: null,
    percentage: null,
    progressStatus: "UNAVAILABLE",
    authorityDecision: null,
    validationStatus: null,
    resolutionStatus: null,
    pipelineTrace: null,
    missingArtifacts: timeline.missingArtifacts,
  } as MissionProgressModel;
  assert.throws(
    () =>
      new MissionMetrics({ enabled: true }).produce({
        timeline,
        progress,
      }),
    /MMET-002/,
  );
});

test("LOT I surfaces persistence validation errors", async () => {
  const store = (await repository()).value;
  await assert.rejects(
    () =>
      store.append(
        persistedRecord("INVALID-DATE", {
          occurredAt: "invalid",
        }),
      ),
    /IPR-001/,
  );
});

test("LOT I blocks certification when evidence cannot be evaluated", () => {
  const values = metadata();
  const bundle = new MissionEvidenceCertifier(null, {
    enabled: true,
  }).build({
    missionId: "SUPER_WAVE_LOT_I",
    runId: "RUN-I-001",
    source: "PROGRAM_TEST",
    authorityDecision: values.authority,
    validationStatus: "VALID",
    pipelineTrace: values.trace,
    missingArtifacts: [],
    requiredEvidenceTypes: ["UNAVAILABLE"],
    evidence: [],
  });
  assert.equal(bundle?.certification.decision, "BLOCKED");
});

test("LOT I rejects absent approval identity", async () => {
  const values = await repository();
  const orchestrator = new ProgramRuntimeOrchestrator({
    enabled: true,
  });
  const certifier = new MissionEvidenceCertifier(values.value, {
    enabled: true,
  });
  const workflow = new HumanApprovalWorkflow(
    values.value,
    certifier,
    orchestrator,
    { enabled: true },
  );
  await assert.rejects(
    () =>
      workflow.decide({
        identity: null,
      } as HumanApprovalDecisionInput),
    /HAW-002/,
  );
});

test("LOT I prevents direct approval bypass", () => {
  const values = humanValidation();
  assert.throws(
    () =>
      transition(
        values.orchestrator,
        values.session,
        "ACCEPTED",
        9,
      ),
    /PRO-008/,
  );
});

test("LOT I rejects simulated secrets before observable logging", () => {
  const values = initialized();
  assert.throws(
    () =>
      transition(
        values.orchestrator,
        values.session,
        "ASSIGNED",
        2,
        { message: "token=SIMULATED_SECRET_VALUE" },
      ),
    /PRO-009/,
  );
});

test("LOT I logs contain no rejected simulated secret", () => {
  const values = initialized();
  assert.throws(
    () =>
      transition(
        values.orchestrator,
        values.session,
        "ASSIGNED",
        2,
        { message: "password=SIMULATED_SECRET_VALUE" },
      ),
    /PRO-009/,
  );
  const timeline = {
    missionId: values.session.missionId,
    events: values.session.events,
    firstOccurredAt: values.session.events[0]!.occurredAt,
    lastOccurredAt: values.session.events[0]!.occurredAt,
    authorityDecision: values.session.authorityDecision,
    validationStatus: values.session.validationStatus,
    resolutionStatus: values.session.resolutionStatus,
    pipelineTrace: values.session.pipelineTrace,
    missingArtifacts: values.session.missingArtifacts,
  } satisfies MissionTimelineModel;
  const log = new MissionLog({ enabled: true }).normalize(timeline);
  assert.doesNotMatch(
    JSON.stringify(log),
    /SIMULATED_SECRET_VALUE/,
  );
});

test("LOT I repeats the same deterministic scenario", () => {
  const first = initialized().session;
  const second = initialized().session;
  assert.deepEqual(first, second);
});

test("LOT I cleans isolated temporary files", async () => {
  const values = await repository("nova-lot-i-cleanup-");
  await values.value.append(persistedRecord("CLEANUP"));
  await rm(values.directory, { recursive: true, force: true });
  const index = temporaryDirectories.indexOf(values.directory);
  if (index >= 0) temporaryDirectories.splice(index, 1);
  await assert.rejects(() => access(values.directory));
});

test("LOT I leaves no logical lock after terminal state", () => {
  const values = running();
  const cancelled = transition(
    values.orchestrator,
    values.session,
    "CANCELLED",
    5,
  );
  assert.equal(cancelled.state, "CANCELLED");
  assert.equal("lockId" in cancelled, false);
});

test("LOT I detects authoritative file alteration", async () => {
  const values = await repository();
  await values.value.append(persistedRecord("ALTERATION"));
  const envelope = JSON.parse(
    await readFile(values.filePath, "utf8"),
  );
  envelope.journal.events[0].payload.integrationRecord.payload.state =
    "FAILED";
  await writeFile(
    values.filePath,
    `${JSON.stringify(envelope, null, 2)}\n`,
    "utf8",
  );
  await assert.rejects(() => values.value.readAll());
});
