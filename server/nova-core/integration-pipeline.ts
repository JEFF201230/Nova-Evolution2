import {
  createHash,
} from "node:crypto";
import type {
  PromptPackage,
} from "./prompt-optimizer.js";
import {
  CodexExecutionAdapter,
  SecureReplayError,
  type AuthorizedExecutionContext,
  CodexRealExecutionRequest,
} from "./codex-execution-adapter.js";
import {
  CertifiedIntegrationService,
} from "./certified-integration-service.js";
import type {
  ExecutionSession,
} from "./execution-session.js";
import type {
  GitProvenance,
} from "./git-provenance.js";
import type {
  ExecutionIntegrityLease,
  ExecutionIntegrityRegistryPort,
} from "./execution-integrity-registry.js";
import {
  isValidPromptPackage,
  MissionPackageRuntimeMapper,
  type RuntimeMission,
} from "./mission-package-runtime-mapper.js";

export interface IntegrationServiceResult {
  readonly missionId: string;
}

export interface IntegrationServicePort<
  TResult extends IntegrationServiceResult = IntegrationServiceResult,
> {
  readonly certificationMode?: "CERTIFIED_END_TO_END";
  run(
    mission: RuntimeMission,
    executionSession?: ExecutionSession | null,
  ): Promise<TResult | null> | TResult | null;
}

interface MissionPackageRuntimeMapperPort {
  map(promptPackage: PromptPackage): RuntimeMission | null;
}

interface CodexExecutionAdapterPort {
  readonly productionExecution?: boolean;
  validateWorkspace?(
    request: CodexRealExecutionRequest,
  ): ReturnType<CodexExecutionAdapter["validateWorkspace"]>;
  authenticate?(
    request: CodexRealExecutionRequest,
  ): ReturnType<CodexExecutionAdapter["authenticate"]>;
  certifyGitProvenance?(
    request: CodexRealExecutionRequest,
  ): Promise<GitProvenance | null>;
  persistRuntimeFailure?(
    session: ExecutionSession,
    failure: unknown,
  ): Promise<void>;
  authorize?(
    request: CodexRealExecutionRequest,
  ): ReturnType<CodexExecutionAdapter["authorize"]>;
  executeReserved?(
    request: CodexRealExecutionRequest,
    authorization: AuthorizedExecutionContext,
    control: Parameters<CodexExecutionAdapter["executeReserved"]>[2],
  ): ReturnType<CodexExecutionAdapter["executeReserved"]>;
  validateSecureReplay?<TReplay extends {
    readonly promptPackage: PromptPackage;
    readonly runtimeMission: RuntimeMission;
    readonly executionSession: ExecutionSession | null;
  }>(
    request: CodexRealExecutionRequest,
    result: TReplay,
    authorization: AuthorizedExecutionContext,
    requestFingerprint: string,
  ): Promise<TReplay>;
  execute(
    request: CodexRealExecutionRequest,
  ): ReturnType<CodexExecutionAdapter["execute"]>;
}

export type IntegrationPipelineExecutionOptions = Omit<
  CodexRealExecutionRequest,
  "promptPackage" | "runtimeMission"
> & {
  readonly idempotencyKey: string;
};

export interface IntegrationPipelineDependencies<
  TResult extends IntegrationServiceResult = IntegrationServiceResult,
> {
  readonly missionPackageRuntimeMapper?: MissionPackageRuntimeMapperPort;
  readonly codexExecutionAdapter?: CodexExecutionAdapterPort;
  readonly executionIntegrityRegistry?: ExecutionIntegrityRegistryPort<
    IntegrationPipelineResult<TResult>
  >;
  readonly integrationService: IntegrationServicePort<TResult>;
}

export interface IntegrationPipelineResult<
  TResult extends IntegrationServiceResult = IntegrationServiceResult,
> {
  readonly promptPackage: PromptPackage;
  readonly runtimeMission: RuntimeMission;
  readonly executionSession: ExecutionSession | null;
  readonly integrationResult: TResult;
}

export interface IntegrationPipelineFeatureFlag {
  readonly enabled: boolean;
}

export class IntegrationPipelineError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "IntegrationPipelineError";
  }
}

export class IntegrationPipeline<
  TResult extends IntegrationServiceResult = IntegrationServiceResult,
> {
  readonly enabled: boolean;

  private readonly mapper: MissionPackageRuntimeMapperPort;
  private readonly codexExecutionAdapter: CodexExecutionAdapterPort | null;
  private readonly executionIntegrityRegistry:
    ExecutionIntegrityRegistryPort<IntegrationPipelineResult<TResult>> | null;
  private readonly integrationService: IntegrationServicePort<TResult> | null;

  constructor(
    featureFlag: IntegrationPipelineFeatureFlag = { enabled: false },
    dependencies?: IntegrationPipelineDependencies<TResult>,
  ) {
    this.enabled = featureFlag.enabled === true;
    this.mapper =
      dependencies?.missionPackageRuntimeMapper ??
      new MissionPackageRuntimeMapper({ enabled: this.enabled });
    this.codexExecutionAdapter =
      dependencies?.codexExecutionAdapter ?? null;
    this.executionIntegrityRegistry =
      dependencies?.executionIntegrityRegistry ?? null;
    this.integrationService = dependencies?.integrationService ?? null;
  }

  async run(
    promptPackage: PromptPackage,
    executionOptions?: IntegrationPipelineExecutionOptions,
  ): Promise<IntegrationPipelineResult<TResult> | null> {
    if (!this.enabled) {
      return null;
    }

    if (!isValidPromptPackage(promptPackage)) {
      throw new IntegrationPipelineError(
        "IP-001",
        "Integration requires a VALID PromptPackage.",
      );
    }

    if (this.integrationService === null) {
      throw new IntegrationPipelineError(
        "IP-002",
        "IntegrationService is required when IntegrationPipeline is enabled.",
      );
    }
    const productionExecution =
      this.codexExecutionAdapter instanceof CodexExecutionAdapter;
    const runtimeMission = this.mapper.map(promptPackage);
    if (runtimeMission === null) {
      throw new IntegrationPipelineError(
        "IP-003",
        "MissionPackageRuntimeMapper returned no RuntimeMission.",
      );
    }

    if (this.codexExecutionAdapter !== null) {
      if (executionOptions === undefined) {
        throw new IntegrationPipelineError(
          "IP-006",
          "Real Codex execution requires explicit session options.",
        );
      }
      if (this.executionIntegrityRegistry === null) {
        throw new IntegrationPipelineError(
          "IP-009",
          "Real Codex execution requires an ExecutionIntegrityRegistry.",
        );
      }

      const {
        idempotencyKey,
        ...codexExecutionOptions
      } = executionOptions;
      const realExecutionRequest: CodexRealExecutionRequest = {
        ...codexExecutionOptions,
        promptPackage,
        runtimeMission,
      };
      const requestFingerprint = executionFingerprint(
        promptPackage,
        runtimeMission,
        executionOptions,
      );
      const completedCandidate =
        this.executionIntegrityRegistry.completedResult?.(
          idempotencyKey,
        ) ?? null;
      let authorization: AuthorizedExecutionContext | null = null;
      if (productionExecution) {
        if (
          this.codexExecutionAdapter.authorize === undefined ||
          this.codexExecutionAdapter.executeReserved === undefined ||
          this.codexExecutionAdapter.validateSecureReplay === undefined
        ) {
          throw new IntegrationPipelineError(
            "IP-018",
            "Production execution requires the secured adapter protocol.",
          );
        }
        try {
          authorization =
            await this.codexExecutionAdapter.authorize(
              realExecutionRequest,
            );
        } catch (error) {
          if (completedCandidate !== null) {
            throw new SecureReplayError(
              `SECURITY_REVALIDATION_FAILED:${errorCode(error)}`,
            );
          }
          throw error;
        }
        if (authorization === null) {
          throw new IntegrationPipelineError(
            "IP-019",
            "Production authorization returned no security context.",
          );
        }
        if (
          !(this.integrationService instanceof CertifiedIntegrationService)
        ) {
          throw new IntegrationPipelineError(
            "IP-014",
            "Real production execution requires a certified end-to-end IntegrationService.",
          );
        }
      }
      let reservation;
      try {
        reservation = this.executionIntegrityRegistry.reserve({
          idempotencyKey,
          fingerprint: requestFingerprint,
          correlation: {
            missionId: promptPackage.missionId,
            executionSessionId: executionOptions.executionSessionId,
            promptPackageId: executionOptions.promptPackageId,
            runtimeMissionId: runtimeMission.missionId,
          },
        });
      } catch (error) {
        if (productionExecution && completedCandidate !== null) {
          throw new SecureReplayError(
            `PERSISTED_EXECUTION_IDENTITY_MISMATCH:${errorCode(error)}`,
          );
        }
        throw error;
      }
      if (reservation.kind === "COMPLETED") {
        if (
          productionExecution &&
          authorization !== null &&
          this.codexExecutionAdapter.validateSecureReplay !== undefined
        ) {
          return this.codexExecutionAdapter.validateSecureReplay(
            realExecutionRequest,
            reservation.result,
            authorization,
            requestFingerprint,
          );
        }
        return reservation.result;
      }

      const lease = reservation.lease;
      this.executionIntegrityRegistry.markRunning(lease);
      try {
        let executionSession = reservation.executionSession;
        if (executionSession === null) {
          executionSession =
            productionExecution && authorization !== null
              ? await this.codexExecutionAdapter.executeReserved!(
                  realExecutionRequest,
                  authorization,
                  {
                    lease,
                    requestFingerprint,
                  },
                )
              : await this.codexExecutionAdapter.execute(
                  realExecutionRequest,
                );
          if (executionSession === null) {
            throw new IntegrationPipelineError(
              "IP-007",
              "CodexExecutionAdapter returned no ExecutionSession.",
            );
          }
          this.executionIntegrityRegistry.attachExecutionSession(
            lease,
            executionSession,
          );
        } else {
          if (
            this.codexExecutionAdapter.validateWorkspace ===
            undefined
          ) {
            throw new IntegrationPipelineError(
              "IP-012",
              "A resumed execution requires workspace revalidation.",
            );
          }
          const validatedWorkspace =
            await this.codexExecutionAdapter.validateWorkspace({
              ...codexExecutionOptions,
              promptPackage,
              runtimeMission,
            });
          if (validatedWorkspace === null) {
            throw new IntegrationPipelineError(
              "IP-013",
              "Workspace revalidation returned no decision.",
            );
          }
          if (productionExecution) {
            if (
              this.codexExecutionAdapter.certifyGitProvenance ===
              undefined
            ) {
              throw new IntegrationPipelineError(
                "IP-015",
                "A resumed execution requires Git provenance recertification.",
              );
            }
            const currentProvenance =
              await this.codexExecutionAdapter.certifyGitProvenance({
                ...codexExecutionOptions,
                promptPackage,
                runtimeMission,
              });
            if (
              currentProvenance === null ||
              executionSession.gitProvenance === null ||
              currentProvenance.provenanceSha256 !==
                executionSession.gitProvenance.provenanceSha256
            ) {
              throw new IntegrationPipelineError(
                "IP-016",
                "Git provenance changed before resumed integration.",
              );
            }
          }
          if (
            this.codexExecutionAdapter.authenticate === undefined
          ) {
            throw new IntegrationPipelineError(
              "IP-010",
              "A resumed execution requires production re-authentication.",
            );
          }
          const authenticationDecision =
            await this.codexExecutionAdapter.authenticate({
              ...codexExecutionOptions,
              promptPackage,
              runtimeMission,
            });
          if (authenticationDecision === null) {
            throw new IntegrationPipelineError(
              "IP-011",
              "Production re-authentication returned no decision.",
            );
          }
        }

        let result: IntegrationPipelineResult<TResult>;
        try {
          result = await this.integrate(
            promptPackage,
            runtimeMission,
            executionSession,
          );
        } catch (error) {
          if (
            this.codexExecutionAdapter.persistRuntimeFailure !==
            undefined
          ) {
            await this.codexExecutionAdapter.persistRuntimeFailure(
              executionSession,
              error,
            );
          }
          throw error;
        }
        this.executionIntegrityRegistry.complete(lease, result);
        return result;
      } catch (error) {
        this.releaseFailedReservation(lease, error);
        throw error;
      }
    } else if (executionOptions !== undefined) {
      throw new IntegrationPipelineError(
        "IP-008",
        "CodexExecutionAdapter is required for real execution.",
      );
    }

    return this.integrate(promptPackage, runtimeMission, null);
  }

  private async integrate(
    promptPackage: PromptPackage,
    runtimeMission: RuntimeMission,
    executionSession: ExecutionSession | null,
  ): Promise<IntegrationPipelineResult<TResult>> {
    const integrationResult = await this.integrationService!.run(
      runtimeMission,
      executionSession,
    );
    if (integrationResult === null) {
      throw new IntegrationPipelineError(
        "IP-004",
        "IntegrationService returned no result.",
      );
    }

    if (integrationResult.missionId !== runtimeMission.missionId) {
      throw new IntegrationPipelineError(
        "IP-005",
        "IntegrationService broke mission traceability.",
      );
    }
    if (
      this.codexExecutionAdapter instanceof CodexExecutionAdapter &&
      !isCertifiedIntegrationResult(integrationResult)
    ) {
      throw new IntegrationPipelineError(
        "IP-017",
        "Integration evidence or certification is missing or not GO.",
      );
    }

    return Object.freeze({
      promptPackage,
      runtimeMission,
      executionSession,
      integrationResult,
    });
  }

  private releaseFailedReservation(
    lease: ExecutionIntegrityLease,
    error: unknown,
  ): void {
    this.executionIntegrityRegistry!.release(
      lease,
      isCancellation(error) ? "CANCELLED" : "FAILED",
    );
  }
}

function executionFingerprint(
  promptPackage: PromptPackage,
  runtimeMission: RuntimeMission,
  options: IntegrationPipelineExecutionOptions,
): string {
  const canonicalExecution = JSON.stringify({
    missionId: promptPackage.missionId,
    executionSessionId: options.executionSessionId,
    promptPackageId: options.promptPackageId,
    runtimeMissionId: runtimeMission.missionId,
    prompt: promptPackage.prompt,
    validationStatus: promptPackage.validationStatus,
    optimization: {
      originalCharacters:
        promptPackage.optimization.originalCharacters,
      optimizedCharacters:
        promptPackage.optimization.optimizedCharacters,
      estimatedTokens: promptPackage.optimization.estimatedTokens,
    },
    isolatedPrompt: promptPackage.isolatedPrompt,
    certificationContext: promptPackage.certificationContext,
    workingDirectory: options.workingDirectory,
    timeoutMs: options.timeoutMs,
    securityIdentity: {
      operatorId: options.authentication.operatorId,
      environmentId: options.authentication.environmentId,
      runtimeId: options.authentication.runtimeId,
      codexTransportId: options.authentication.codexTransportId,
      authorization: options.authentication.authorization,
    },
    workspaceSecurity: options.workspaceSecurity,
  });

  return createHash("sha256")
    .update(canonicalExecution, "utf8")
    .digest("hex");
}

function isCertifiedIntegrationResult(
  value: IntegrationServiceResult,
): boolean {
  if (
    typeof value !== "object" ||
    value === null ||
    !("certification" in value) ||
    typeof value.certification !== "object" ||
    value.certification === null ||
    !("decision" in value.certification) ||
    value.certification.decision !== "GO" ||
    !("bundleFingerprint" in value.certification) ||
    typeof value.certification.bundleFingerprint !== "string" ||
    !/^[0-9a-f]{64}$/.test(value.certification.bundleFingerprint)
  ) {
    return false;
  }
  return (
    "evidenceBundle" in value &&
    typeof value.evidenceBundle === "object" &&
    value.evidenceBundle !== null &&
    "bundleFingerprint" in value.evidenceBundle &&
    value.evidenceBundle.bundleFingerprint ===
      value.certification.bundleFingerprint
  );
}

function isCancellation(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return false;
  }
  return (
    error.code === "CODEX_CANCELLED" ||
    error.code === "USER_CANCELLED" ||
    error.code === "ABORT_ERR"
  );
}

function errorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return "UNKNOWN";
}
