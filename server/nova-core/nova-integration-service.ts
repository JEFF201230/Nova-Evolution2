import type {
  MissionState,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import {
  canonicalStateOf,
  type CanonicalMissionState,
} from "../runtime/orchestrator/canonical-state.js";
import {
  CodexExecutionAdapter,
  type CodexExecutionPreparation,
} from "./codex-execution-adapter.js";
import {
  CodexRequestBuilder,
} from "./codex-request-builder.js";
import {
  CodexResponseParser,
  type CodexResponseInput,
  type ParsedCodexResponse,
} from "./codex-response-parser.js";
import {
  HumanApprovalWorkflow,
  type HumanApprovalDecision,
  type HumanApprovalDecisionValue,
  type LocalIdentityContext,
} from "./human-approval-workflow.js";
import {
  IntegrationRuntimeRepository,
  type IntegrationPersistedRecord,
} from "./integration-runtime-repository.js";
import {
  MissionEvidenceCertifier,
  type MissionEvidenceBundle,
  type MissionEvidenceStatus,
} from "./mission-evidence-certifier.js";
import {
  MissionLog,
  type MissionLogModel,
} from "./mission-log.js";
import {
  MissionMetrics,
  type MissionMetricsModel,
} from "./mission-metrics.js";
import {
  MissionTimeline,
  type MissionTimelineModel,
} from "./mission-timeline.js";
import {
  ProgramRuntimeOrchestrator,
  type ProgramRuntimeSession,
} from "./program-runtime-orchestrator.js";
import {
  PromptAssembler,
} from "./prompt-assembler.js";
import {
  RuntimeExecutorAdapter,
  type RuntimeExecutorPayload,
} from "./runtime-executor-adapter.js";
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionGateDecision,
} from "./runtime-execution-gate.js";
import {
  RuntimeResponseAdapter,
} from "./runtime-response-adapter.js";
import {
  RuntimeResultNormalizer,
  type NormalizedRuntimeResult,
} from "./runtime-result-normalizer.js";
import {
  canonicalJson,
  sha256,
} from "./run-binding.js";

export type NovaIntegrationSimulation =
  | "SUCCESS"
  | "INVALID_CODEX"
  | "CANCELLED"
  | "TIMEOUT"
  | "RECOVERY"
  | "PROOF_TAMPERED";

export interface NovaIntegrationInput {
  readonly missionId: string;
  readonly runId: string;
  readonly source: string;
  readonly maxRetries: number;
  readonly gateDecision: RuntimeExecutionGateDecision;
  readonly contract: RuntimeExecutionContract | null;
  readonly simulation: NovaIntegrationSimulation;
  readonly timestamps: readonly string[];
  readonly codexResponse: CodexResponseInput | null;
  readonly approval:
    | {
        readonly requestId: string;
        readonly decisionId: string;
        readonly requestedBy: string;
        readonly requiredRole: string;
        readonly identity: LocalIdentityContext;
        readonly decision: HumanApprovalDecisionValue;
        readonly justification?: string | null;
      }
    | null;
}

export interface NovaIntegrationResult {
  readonly missionId: string;
  readonly runId: string;
  readonly finalState: MissionState;
  readonly canonicalFinalState: CanonicalMissionState;
  readonly blocked: boolean;
  readonly session: ProgramRuntimeSession;
  readonly runtimePayload: RuntimeExecutorPayload | null;
  readonly codexPreparation: CodexExecutionPreparation | null;
  readonly codexResult: ParsedCodexResponse | null;
  readonly normalizedResult: NormalizedRuntimeResult | null;
  readonly timeline: MissionTimelineModel;
  readonly metrics: MissionMetricsModel;
  readonly log: MissionLogModel;
  readonly evidenceBundle: MissionEvidenceBundle;
  readonly humanDecision: HumanApprovalDecision | null;
  readonly persistedRecordCount: number;
  readonly processingCount: number;
}

export interface NovaIntegrationServiceFeatureFlag {
  readonly enabled: boolean;
}

export class NovaIntegrationError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "NovaIntegrationError";
  }
}

export class NovaIntegrationService {
  readonly enabled: boolean;
  private readonly inflight = new Map<
    string,
    {
      readonly fingerprint: string;
      readonly result: Promise<NovaIntegrationResult>;
    }
  >();
  private processingCount = 0;

  private readonly runtimeAdapter = new RuntimeExecutorAdapter({
    enabled: true,
  });
  private readonly promptAssembler = new PromptAssembler({
    enabled: true,
  });
  private readonly codexRequestBuilder = new CodexRequestBuilder({
    enabled: true,
  });
  private readonly codexAdapter = new CodexExecutionAdapter({
    enabled: true,
  });
  private readonly codexParser = new CodexResponseParser({
    enabled: true,
  });
  private readonly runtimeResponseAdapter = new RuntimeResponseAdapter({
    enabled: true,
  });
  private readonly resultNormalizer = new RuntimeResultNormalizer({
    enabled: true,
  });
  private readonly timelineBuilder = new MissionTimeline({
    enabled: true,
  });
  private readonly metricsBuilder = new MissionMetrics({
    enabled: true,
  });
  private readonly logBuilder = new MissionLog({ enabled: true });

  constructor(
    private readonly repository: IntegrationRuntimeRepository,
    private readonly orchestrator: ProgramRuntimeOrchestrator,
    private readonly certifier: MissionEvidenceCertifier,
    private readonly approvalWorkflow: HumanApprovalWorkflow,
    featureFlag: NovaIntegrationServiceFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  run(input: NovaIntegrationInput): Promise<NovaIntegrationResult | null> {
    if (!this.enabled) {
      return Promise.resolve(null);
    }
    assertInput(input);
    const key = `${input.source}:${input.missionId}:${input.runId}`;
    const fingerprint = sha256(canonicalJson(input));
    const existing = this.inflight.get(key);
    if (existing !== undefined) {
      if (existing.fingerprint !== fingerprint) {
        throw new NovaIntegrationError(
          "NIS-002",
          "A conflicting invocation already exists for this run.",
        );
      }
      return existing.result;
    }

    const result = this.execute(input);
    this.inflight.set(key, { fingerprint, result });
    return result;
  }

  private async execute(
    input: NovaIntegrationInput,
  ): Promise<NovaIntegrationResult> {
    this.processingCount += 1;
    let cursor = 0;
    const nextEvent = (
      targetState: MissionState,
      message: string,
    ) => ({
      targetState,
      source: input.source,
      eventId: `EVENT:${input.runId}:${cursor + 2}`,
      occurredAt: input.timestamps[++cursor]!,
      message,
    });

    let session = this.orchestrator.initialize({
      missionId: input.missionId,
      runId: input.runId,
      source: input.source,
      maxRetries: input.maxRetries,
      gateDecision: input.gateDecision,
      eventId: `EVENT:${input.runId}:1`,
      occurredAt: input.timestamps[0]!,
    });
    if (session === null) {
      throw new NovaIntegrationError(
        "NIS-003",
        "ProgramRuntimeOrchestrator is inactive.",
      );
    }

    if (!input.gateDecision.executionAllowed || input.contract === null) {
      session = requireSession(
        this.orchestrator.transition(
          session,
          nextEvent(
            "WAITING_INPUT",
            "Mission blocked by the execution gate.",
          ),
        ),
      );
      const bundle = requireBundle(
        this.certifier.build({
          missionId: input.missionId,
          runId: input.runId,
          source: input.source,
          authorityDecision: input.gateDecision.authorityDecision,
          validationStatus: input.gateDecision.validationStatus,
          pipelineTrace: input.gateDecision.pipelineTrace!,
          missingArtifacts: input.gateDecision.missingArtifacts,
          requiredEvidenceTypes: [],
          evidence: [],
        }),
      );
      return await this.finish({
        input,
        session,
        runtimePayload: null,
        codexPreparation: null,
        codexResult: null,
        normalizedResult: null,
        bundle,
        humanDecision: null,
        cursor,
      });
    }

    assertContractConsistency(input);
    session = requireSession(
      this.orchestrator.transition(
        session,
        nextEvent("ASSIGNED", "Mission assigned."),
      ),
    );
    session = requireSession(
      this.orchestrator.transition(
        session,
        nextEvent("LOCKED", "Logical execution lock prepared."),
      ),
    );
    session = requireSession(
      this.orchestrator.transition(session, {
        ...nextEvent("RUNNING", "Simulated execution started."),
        gateDecision: input.gateDecision,
      }),
    );

    if (input.simulation === "CANCELLED") {
      session = requireSession(
        this.orchestrator.transition(
          session,
          nextEvent("CANCELLED", "Simulated execution cancelled."),
        ),
      );
      const bundle = this.terminalBundle(input, "FAIL", "CANCELLED");
      return await this.finish({
        input,
        session,
        runtimePayload: null,
        codexPreparation: null,
        codexResult: null,
        normalizedResult: null,
        bundle,
        humanDecision: null,
        cursor,
      });
    }

    if (input.simulation === "TIMEOUT") {
      session = requireSession(
        this.orchestrator.transition(
          session,
          nextEvent("TIMEOUT", "Simulated execution timed out."),
        ),
      );
      const bundle = this.terminalBundle(input, "FAIL", "TIMEOUT");
      return await this.finish({
        input,
        session,
        runtimePayload: null,
        codexPreparation: null,
        codexResult: null,
        normalizedResult: null,
        bundle,
        humanDecision: null,
        cursor,
      });
    }

    if (input.simulation === "RECOVERY") {
      session = requireSession(
        this.orchestrator.transition(
          session,
          nextEvent("FAILED", "Simulated interruption recorded."),
        ),
      );
      session = requireSession(
        this.orchestrator.transition(session, {
          ...nextEvent("ASSIGNED", "Controlled recovery authorized."),
          recoveryAuthorized: true,
        }),
      );
      session = requireSession(
        this.orchestrator.transition(
          session,
          nextEvent("LOCKED", "Recovery lock prepared."),
        ),
      );
      session = requireSession(
        this.orchestrator.transition(session, {
          ...nextEvent("RUNNING", "Recovered simulation started."),
          gateDecision: input.gateDecision,
        }),
      );
    }

    const adapted = this.runAdapters(input);
    if (
      input.simulation === "INVALID_CODEX" ||
      adapted.codexResult.codexStatus !== "COMPLETED" ||
      adapted.codexResult.error !== null
    ) {
      session = requireSession(
        this.orchestrator.transition(
          session,
          nextEvent("FAILED", "Simulated Codex response rejected."),
        ),
      );
      const bundle = this.resultBundle(
        input,
        adapted,
        "FAIL",
      );
      return await this.finish({
        input,
        session,
        ...adapted,
        bundle,
        humanDecision: null,
        cursor,
      });
    }

    session = requireSession(
      this.orchestrator.transition(
        session,
        nextEvent("SUBMITTED", "Simulated result submitted."),
      ),
    );
    session = requireSession(
      this.orchestrator.transition(
        session,
        nextEvent(
          "TECHNICAL_VALIDATION",
          "Technical validation started.",
        ),
      ),
    );
    session = requireSession(
      this.orchestrator.transition(
        session,
        nextEvent(
          "DOCUMENTARY_VALIDATION",
          "Documentary validation completed.",
        ),
      ),
    );

    const evidenceStatus: MissionEvidenceStatus =
      input.simulation === "PROOF_TAMPERED" ? "FAIL" : "PASS";
    const bundle = this.resultBundle(
      input,
      adapted,
      evidenceStatus,
    );
    await this.certifier.persist(bundle, {
      evidenceRecordId: `EVIDENCE:${input.runId}`,
      certificationRecordId: `CERTIFICATION:${input.runId}`,
      occurredAt: input.timestamps[++cursor]!,
    });

    if (bundle.certification.decision !== "GO") {
      session = requireSession(
        this.orchestrator.transition(
          session,
          nextEvent("FAILED", "Technical certification is not GO."),
        ),
      );
      return await this.finish({
        input,
        session,
        ...adapted,
        bundle,
        humanDecision: null,
        cursor,
      });
    }

    session = requireSession(
      this.orchestrator.transition(
        session,
        nextEvent(
          "HUMAN_VALIDATION",
          "Mission is waiting for human approval.",
        ),
      ),
    );
    let humanDecision: HumanApprovalDecision | null = null;
    if (input.approval !== null) {
      const request = this.approvalWorkflow.createRequest({
        requestId: input.approval.requestId,
        requestedBy: input.approval.requestedBy,
        requiredRole: input.approval.requiredRole,
        requestedAt: input.timestamps[++cursor]!,
        evidenceBundle: bundle,
      });
      if (request === null) {
        throw new NovaIntegrationError(
          "NIS-003",
          "HumanApprovalWorkflow is inactive.",
        );
      }
      humanDecision = await this.approvalWorkflow.decide({
        decisionId: input.approval.decisionId,
        request,
        identity: input.approval.identity,
        decision: input.approval.decision,
        justification: input.approval.justification,
        decidedAt: input.timestamps[++cursor]!,
        evidenceBundle: bundle,
      });
      if (humanDecision === null) {
        throw new NovaIntegrationError(
          "NIS-003",
          "HumanApprovalWorkflow returned no decision.",
        );
      }
      session = requireSession(
        this.approvalWorkflow.applyDecision(
          session,
          humanDecision,
          {
            eventId: `EVENT:${input.runId}:${cursor + 2}`,
            occurredAt: input.timestamps[++cursor]!,
            source: input.approval.identity.subjectId,
          },
        ),
      );
    }

    return await this.finish({
      input,
      session,
      ...adapted,
      bundle,
      humanDecision,
      cursor,
    });
  }

  private runAdapters(input: NovaIntegrationInput): {
    readonly runtimePayload: RuntimeExecutorPayload;
    readonly codexPreparation: CodexExecutionPreparation;
    readonly codexResult: ParsedCodexResponse;
    readonly normalizedResult: NormalizedRuntimeResult;
  } {
    const contract = input.contract!;
    const runtimePayload = this.runtimeAdapter.adapt(contract);
    const prompt = this.promptAssembler.assemble(contract);
    if (runtimePayload === null || prompt === null) {
      throw new NovaIntegrationError(
        "NIS-003",
        "A certified adapter is inactive.",
      );
    }
    const codexRequest = this.codexRequestBuilder.build({
      contract,
      prompt,
    });
    if (codexRequest === null) {
      throw new NovaIntegrationError(
        "NIS-003",
        "CodexRequestBuilder is inactive.",
      );
    }
    const codexPreparation = this.codexAdapter.prepare(codexRequest);
    if (codexPreparation === null || input.codexResponse === null) {
      throw new NovaIntegrationError(
        "NIS-004",
        "A simulated Codex response and preparation are required.",
      );
    }
    const codexResult = this.codexParser.parse({
      executionPreparation: codexPreparation,
      codexResponse: input.codexResponse,
    });
    if (codexResult === null) {
      throw new NovaIntegrationError(
        "NIS-003",
        "CodexResponseParser is inactive.",
      );
    }
    const adaptedRuntime = this.runtimeResponseAdapter.adapt({
      executorPayload: runtimePayload,
      runtimeResponse: {
        responseId: `RUNTIME:${codexResult.responseId}`,
        requestId: runtimePayload.requestId,
        receivedAt: codexResult.receivedAt,
        status: codexResult.codexStatus,
        data: codexResult.content,
        error: codexResult.error,
        runtimeMetadata: {
          simulation: true,
          codexResponseId: codexResult.responseId,
        },
      },
    });
    if (adaptedRuntime === null) {
      throw new NovaIntegrationError(
        "NIS-003",
        "RuntimeResponseAdapter is inactive.",
      );
    }
    const normalizedResult =
      this.resultNormalizer.normalize(adaptedRuntime);
    if (normalizedResult === null) {
      throw new NovaIntegrationError(
        "NIS-003",
        "RuntimeResultNormalizer is inactive.",
      );
    }
    return {
      runtimePayload,
      codexPreparation,
      codexResult,
      normalizedResult,
    };
  }

  private resultBundle(
    input: NovaIntegrationInput,
    adapted: {
      readonly codexResult: ParsedCodexResponse;
      readonly normalizedResult: NormalizedRuntimeResult;
    },
    status: MissionEvidenceStatus,
  ): MissionEvidenceBundle {
    return requireBundle(
      this.certifier.build({
        missionId: input.missionId,
        runId: input.runId,
        source: input.source,
        authorityDecision: input.gateDecision.authorityDecision,
        validationStatus: input.gateDecision.validationStatus,
        pipelineTrace: input.gateDecision.pipelineTrace!,
        missingArtifacts: input.gateDecision.missingArtifacts,
        requiredEvidenceTypes: ["CODEX_RESPONSE", "RUNTIME_RESULT"],
        evidence: [
          {
            evidenceId: `CODEX:${adapted.codexResult.responseId}`,
            evidenceType: "CODEX_RESPONSE",
            source: "CODEX_SIMULATION",
            occurredAt: adapted.codexResult.receivedAt,
            status,
            payload: {
              responseId: adapted.codexResult.responseId,
              status: adapted.codexResult.codexStatus,
              error: adapted.codexResult.error,
            },
          },
          {
            evidenceId: `RUNTIME:${adapted.normalizedResult.responseId}`,
            evidenceType: "RUNTIME_RESULT",
            source: "RUNTIME_SIMULATION",
            occurredAt: adapted.normalizedResult.receivedAt,
            status,
            payload: {
              responseId: adapted.normalizedResult.responseId,
              status: adapted.normalizedResult.runtimeStatus,
              error: adapted.normalizedResult.error,
            },
          },
        ],
      }),
    );
  }

  private terminalBundle(
    input: NovaIntegrationInput,
    status: MissionEvidenceStatus,
    terminalReason: string,
  ): MissionEvidenceBundle {
    return requireBundle(
      this.certifier.build({
        missionId: input.missionId,
        runId: input.runId,
        source: input.source,
        authorityDecision: input.gateDecision.authorityDecision,
        validationStatus: input.gateDecision.validationStatus,
        pipelineTrace: input.gateDecision.pipelineTrace!,
        missingArtifacts: input.gateDecision.missingArtifacts,
        requiredEvidenceTypes: ["TERMINAL_RESULT"],
        evidence: [
          {
            evidenceId: `TERMINAL:${input.runId}`,
            evidenceType: "TERMINAL_RESULT",
            source: "PROGRAM_ORCHESTRATOR",
            occurredAt: input.timestamps[4]!,
            status,
            payload: { terminalReason },
          },
        ],
      }),
    );
  }

  private async finish(input: {
    readonly input: NovaIntegrationInput;
    readonly session: ProgramRuntimeSession;
    readonly runtimePayload: RuntimeExecutorPayload | null;
    readonly codexPreparation: CodexExecutionPreparation | null;
    readonly codexResult: ParsedCodexResponse | null;
    readonly normalizedResult: NormalizedRuntimeResult | null;
    readonly bundle: MissionEvidenceBundle;
    readonly humanDecision: HumanApprovalDecision | null;
    readonly cursor: number;
  }): Promise<NovaIntegrationResult> {
    const timeline = this.timelineBuilder.build({
      missionId: input.input.missionId,
      events: input.session.events,
    });
    if (timeline === null) {
      throw new NovaIntegrationError("NIS-003", "Timeline is inactive.");
    }
    const metrics = this.metricsBuilder.produce({
      timeline,
      progress: input.session.progress,
    });
    const log = this.logBuilder.normalize(timeline);
    if (metrics === null || log === null) {
      throw new NovaIntegrationError(
        "NIS-003",
        "Observability is inactive.",
      );
    }

    const records: IntegrationPersistedRecord[] = [
      {
        schemaVersion: 1,
        recordId: `SESSION:${input.input.runId}:${input.session.state}`,
        kind: "SESSION",
        missionId: input.input.missionId,
        runId: input.input.runId,
        source: input.input.source,
        occurredAt: input.input.timestamps[input.cursor + 1]!,
        payload: input.session,
      },
      {
        schemaVersion: 1,
        recordId: `LOG:${input.input.runId}:${input.session.state}`,
        kind: "LOG",
        missionId: input.input.missionId,
        runId: input.input.runId,
        source: input.input.source,
        occurredAt: input.input.timestamps[input.cursor + 1]!,
        payload: log,
      },
    ];
    for (const record of records) {
      const persisted = await this.repository.append(record);
      if (persisted === null) {
        throw new NovaIntegrationError(
          "NIS-003",
          "Integration persistence is inactive.",
        );
      }
    }

    const persistedRecordCount = (await this.repository.readAll()).length;
    return Object.freeze({
      missionId: input.input.missionId,
      runId: input.input.runId,
      finalState: input.session.state,
      canonicalFinalState: canonicalStateOf(input.session.state),
      blocked: input.session.state === "WAITING_INPUT",
      session: input.session,
      runtimePayload: input.runtimePayload,
      codexPreparation: input.codexPreparation,
      codexResult: input.codexResult,
      normalizedResult: input.normalizedResult,
      timeline,
      metrics,
      log,
      evidenceBundle: input.bundle,
      humanDecision: input.humanDecision,
      persistedRecordCount,
      processingCount: this.processingCount,
    });
  }
}

function assertInput(input: NovaIntegrationInput): void {
  if (
    !isToken(input.missionId) ||
    !isToken(input.runId) ||
    !isToken(input.source) ||
    !Number.isInteger(input.maxRetries) ||
    input.maxRetries < 0 ||
    !Array.isArray(input.timestamps) ||
    input.timestamps.length < 20 ||
    !input.timestamps.every(isCanonicalTimestamp) ||
    input.gateDecision.pipelineTrace?.missionId !== input.missionId
  ) {
    throw new NovaIntegrationError(
      "NIS-001",
      "Invalid deterministic integration input.",
    );
  }
}

function assertContractConsistency(input: NovaIntegrationInput): void {
  if (
    input.contract?.missionBrief.missionId !== input.missionId ||
    input.contract.pipelineTrace !== input.gateDecision.pipelineTrace ||
    input.contract.authorityDecision !==
      input.gateDecision.authorityDecision ||
    input.contract.validationStatus !==
      input.gateDecision.validationStatus
  ) {
    throw new NovaIntegrationError(
      "NIS-005",
      "Execution contract and gate decision are inconsistent.",
    );
  }
}

function requireSession(
  session: ProgramRuntimeSession | null,
): ProgramRuntimeSession {
  if (session === null) {
    throw new NovaIntegrationError(
      "NIS-003",
      "ProgramRuntimeOrchestrator returned no session.",
    );
  }
  return session;
}

function requireBundle(
  bundle: MissionEvidenceBundle | null,
): MissionEvidenceBundle {
  if (bundle === null) {
    throw new NovaIntegrationError(
      "NIS-003",
      "MissionEvidenceCertifier returned no bundle.",
    );
  }
  return bundle;
}

function isToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  ) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}
