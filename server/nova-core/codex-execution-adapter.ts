import {
  spawn,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";
import type {
  CodexRequest,
} from "./codex-request-builder.js";
import {
  ExecutionSession,
  type ExecutionSessionStatus,
} from "./execution-session.js";
import {
  DurableExecutionSessionStore,
  type DurableExecutionSessionPort,
  type DurableExecutionSecurityIdentity,
  type DurableExecutionWorkspaceIdentity,
} from "./durable-execution-session.js";
import {
  ExecutionSessionPersistence,
  snapshotFailure,
  type ExecutionSessionPersistencePort,
  type PersistedExecutionOutcome,
} from "./execution-session-persistence.js";
import {
  GitProvenanceCertifier,
  GitProvenanceError,
  type GitProvenance,
  type GitProvenancePort,
} from "./git-provenance.js";
import type {
  ExecutionIntegrityLease,
} from "./execution-integrity-registry.js";
import type {
  RuntimeMission,
} from "./mission-package-runtime-mapper.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import type {
  PromptPackage,
} from "./prompt-optimizer.js";
import {
  isPromptIsolationEnvelope,
  serializeIsolatedPrompt,
} from "./prompt-isolation.js";
import {
  canonicalJson,
} from "./run-binding.js";
import {
  ProductionAuthenticator,
  type ProductionAuthenticationAssertion,
  type ProductionAuthenticationDecision,
  type ProductionAuthenticationPort,
} from "./production-authentication.js";
import type {
  RuntimeExecutionContext,
} from "./runtime-execution-request.js";
import {
  WorkspaceSecurityError,
  WorkspaceSecurityValidator,
  type ValidatedWorkspace,
  type WorkspaceSecurityPort,
  type WorkspaceSecurityRequest,
} from "./workspace-security.js";

export interface CodexExecutionPreparation {
  readonly codexRequest: CodexRequest;
  readonly requestId: string;
  readonly requestedAt: string;
  readonly promptContent: string;
  readonly executionContext: RuntimeExecutionContext;
  readonly authorityDecision: CodexRequest["authorityDecision"];
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
}

export interface CodexCliRawResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
  readonly events: readonly unknown[];
}

export interface CodexRealExecutionRequest {
  readonly executionSessionId: string;
  readonly promptPackageId: string;
  readonly promptPackage: PromptPackage;
  readonly runtimeMission: RuntimeMission;
  readonly workingDirectory: string;
  readonly workspaceSecurity: Omit<
    WorkspaceSecurityRequest,
    "workingDirectory"
  >;
  readonly timeoutMs: number;
  readonly authentication: ProductionAuthenticationAssertion;
  readonly signal?: AbortSignal;
}

export interface CodexTransportRequest {
  readonly prompt: string;
  readonly workingDirectory: string;
  readonly timeoutMs: number;
  readonly signal?: AbortSignal;
}

export interface CodexExecutionTransport {
  execute(request: CodexTransportRequest): Promise<CodexCliRawResult>;
}

export interface CodexExecutionClock {
  now(): Date;
  monotonicNow(): number;
}

export interface CodexExecutionAdapterDependencies {
  readonly transport?: CodexExecutionTransport;
  readonly clock?: CodexExecutionClock;
  readonly productionAuthenticator?: ProductionAuthenticationPort;
  readonly workspaceSecurity?: WorkspaceSecurityPort;
  readonly gitProvenance?: GitProvenancePort;
  readonly sessionPersistence?: ExecutionSessionPersistencePort;
  readonly durableSessionStore?: DurableExecutionSessionPort;
}

export interface AuthorizedExecutionContext {
  readonly authentication: ProductionAuthenticationDecision;
  readonly workspace: ValidatedWorkspace;
  readonly gitProvenance: GitProvenance;
}

export interface ReservedExecutionControl {
  readonly lease: ExecutionIntegrityLease;
  readonly requestFingerprint: string;
}

export class SecureReplayError extends Error {
  readonly code = "SECURE_REPLAY_ERROR";

  constructor(readonly reason: string) {
    super(`Secure completed replay rejected: ${reason}.`);
    this.name = "SecureReplayError";
  }
}

export interface CodexExecutionAdapterFeatureFlag {
  readonly enabled: boolean;
}

export class CodexCliExecutionError extends Error {
  constructor(
    readonly code:
      | "CODEX_CONNECTION_ERROR"
      | "CODEX_AUTHENTICATION_ERROR"
      | "CODEX_EXECUTION_ERROR",
    message: string,
    readonly rawResult: CodexCliRawResult,
  ) {
    super(message);
    this.name = "CodexCliExecutionError";
  }
}

export class CodexExecutionTimeoutError extends Error {
  readonly code = "CODEX_TIMEOUT";

  constructor(readonly timeoutMs: number) {
    super(`Codex execution timed out after ${timeoutMs} ms.`);
    this.name = "CodexExecutionTimeoutError";
  }
}

export class CodexExecutionCancelledError extends Error {
  readonly code = "CODEX_CANCELLED";

  constructor() {
    super("Codex execution was cancelled.");
    this.name = "CodexExecutionCancelledError";
  }
}

export class CodexExecutionInterruptedError extends Error {
  readonly code = "CODEX_INTERRUPTED";

  constructor(readonly signal: NodeJS.Signals | null) {
    super(`Codex execution was interrupted${signal === null ? "." : ` by ${signal}.`}`);
    this.name = "CodexExecutionInterruptedError";
  }
}

export class CodexExecutionAdapter {
  readonly enabled: boolean;
  readonly productionExecution = true;

  private readonly transport: CodexExecutionTransport;
  private readonly clock: CodexExecutionClock;
  private readonly productionAuthenticator: ProductionAuthenticationPort;
  private readonly workspaceSecurity: WorkspaceSecurityPort;
  private readonly gitProvenance: GitProvenancePort;
  private readonly sessionPersistence: ExecutionSessionPersistencePort;
  private readonly durableSessionStore: DurableExecutionSessionPort;

  constructor(
    featureFlag: CodexExecutionAdapterFeatureFlag = { enabled: false },
    dependencies: CodexExecutionAdapterDependencies = {},
  ) {
    this.enabled = featureFlag.enabled === true;
    this.transport = dependencies.transport ?? new CodexCliTransport();
    this.clock = dependencies.clock ?? SYSTEM_CLOCK;
    this.productionAuthenticator =
      dependencies.productionAuthenticator ??
      new ProductionAuthenticator();
    this.workspaceSecurity =
      dependencies.workspaceSecurity ??
      new WorkspaceSecurityValidator({ enabled: true });
    this.gitProvenance =
      dependencies.gitProvenance ??
      new GitProvenanceCertifier({ enabled: true });
    this.sessionPersistence =
      dependencies.sessionPersistence ??
      new ExecutionSessionPersistence(null, { enabled: true });
    this.durableSessionStore =
      dependencies.durableSessionStore ??
      new DurableExecutionSessionStore(null, { enabled: true });
  }

  prepare(
    request: CodexRequest,
  ): CodexExecutionPreparation | null {
    if (!this.enabled) {
      return null;
    }

    assertRequest(request);

    return Object.freeze({
      codexRequest: request,
      requestId: request.codexRequestId,
      requestedAt: request.requestedAt,
      promptContent: request.promptContent,
      executionContext: request.executionContext,
      authorityDecision: request.authorityDecision,
      validationStatus: request.validationStatus,
      pipelineTrace: request.pipelineTrace,
      missingArtifacts: request.missingArtifacts,
    });
  }

  async execute(
    _request: CodexRealExecutionRequest,
  ): Promise<ExecutionSession | null> {
    if (!this.enabled) {
      return null;
    }
    throw new Error(
      "CEA-007: Direct execution is forbidden; use IntegrationPipeline.",
    );
  }

  async authorize(
    request: CodexRealExecutionRequest,
  ): Promise<AuthorizedExecutionContext | null> {
    if (!this.enabled) {
      return null;
    }
    const authentication = await this.authenticate(request);
    if (authentication === null) {
      throw new Error("CEA-008: Authentication returned no decision.");
    }
    const workspace = await this.validateWorkspace(request);
    if (workspace === null) {
      throw new WorkspaceSecurityError("CONFIGURATION_MISSING");
    }
    assertRealExecutionRequest(request);
    const gitProvenance = await this.certifyGitProvenance(
      request,
      workspace,
    );
    if (gitProvenance === null) {
      throw new GitProvenanceError("CERTIFIER_INACTIVE");
    }
    return Object.freeze({
      authentication,
      workspace,
      gitProvenance,
    });
  }

  async executeReserved(
    request: CodexRealExecutionRequest,
    authorization: AuthorizedExecutionContext,
    control: ReservedExecutionControl,
  ): Promise<ExecutionSession | null> {
    if (!this.enabled) {
      return null;
    }
    assertRealExecutionRequest(request);
    assertReservedControl(request, authorization, control);
    if (
      this.sessionPersistence.isReady?.() !== true ||
      this.durableSessionStore.isReady?.() !== true
    ) {
      throw new Error(
        "CEA-006: Durable and terminal ExecutionSession persistence must be ready.",
      );
    }
    const startedAt = this.clock.now().toISOString();
    const startedTick = this.clock.monotonicNow();
    const securityContext = securityContextFor(
      authorization,
      control.requestFingerprint,
    );
    const prepared = await this.durableSessionStore.prepare({
      missionId: request.promptPackage.missionId,
      executionSessionId: request.executionSessionId,
      promptPackageId: request.promptPackageId,
      runtimeMissionId: request.runtimeMission.missionId,
      operatorIdentity: securityContext.operatorIdentity,
      workspaceIdentity: securityContext.workspaceIdentity,
      gitProvenance: authorization.gitProvenance,
      requestFingerprint: control.requestFingerprint,
      occurredAt: startedAt,
    });
    if (prepared === null) {
      throw new Error(
        "CEA-009: PRE_TRANSPORT checkpoint was not persisted.",
      );
    }
    await this.requireCheckpoint(
      request.executionSessionId,
      "TRANSPORT_STARTED",
      startedAt,
    );
    let rawCodexResult: CodexCliRawResult;
    try {
      rawCodexResult = await this.transport.execute({
        prompt: serializeIsolatedPrompt(
          request.promptPackage.isolatedPrompt,
        ),
        workingDirectory: request.workingDirectory,
        timeoutMs: request.timeoutMs,
        signal: request.signal,
      });
    } catch (error) {
      const status = statusForFailure(error);
      const completedAt = this.clock.now().toISOString();
      await this.requireCheckpoint(
        request.executionSessionId,
        checkpointForFailure(error),
        completedAt,
        snapshotFailure(error),
      );
      const session = this.createTerminalSession(
        request,
        authorization.gitProvenance,
        securityContext,
        startedAt,
        startedTick,
        completedAt,
        status,
        snapshotFailure(error),
      );
      await this.persistRequired(
        session,
        outcomeForFailure(error),
        error,
      );
      throw error;
    }
    const completedAt = this.clock.now().toISOString();
    await this.requireCheckpoint(
      request.executionSessionId,
      "RESULT_RECEIVED",
      completedAt,
      rawCodexResult,
    );
    const session = this.createTerminalSession(
      request,
      authorization.gitProvenance,
      securityContext,
      startedAt,
      startedTick,
      completedAt,
      "COMPLETED",
      rawCodexResult,
    );
    await this.persistRequired(session, "SUCCESS");
    return session;
  }

  async authenticate(
    request: CodexRealExecutionRequest,
  ): Promise<ProductionAuthenticationDecision | null> {
    if (!this.enabled) {
      return null;
    }

    return this.productionAuthenticator.authenticate(
      request.authentication,
    );
  }

  async validateWorkspace(
    request: CodexRealExecutionRequest,
  ): Promise<ValidatedWorkspace | null> {
    if (!this.enabled) {
      return null;
    }

    const validated = await this.workspaceSecurity.validate({
      ...request.workspaceSecurity,
      workingDirectory: request.workingDirectory,
    });
    if (validated === null) {
      throw new WorkspaceSecurityError("CONFIGURATION_MISSING");
    }
    return validated;
  }

  async certifyGitProvenance(
    request: CodexRealExecutionRequest,
    validatedWorkspace?: ValidatedWorkspace,
  ): Promise<GitProvenance | null> {
    if (!this.enabled) {
      return null;
    }
    const workspace =
      validatedWorkspace ?? await this.validateWorkspace(request);
    if (workspace === null) {
      throw new GitProvenanceError("WORKSPACE_UNAVAILABLE");
    }
    return this.gitProvenance.certify(workspace, {
      allowedUntrackedPaths:
        request.promptPackage.isolatedPrompt.projectContext.allowedFiles,
      excludedPaths: Object.freeze([]),
    });
  }

  async validateSecureReplay<TResult extends {
    readonly promptPackage: PromptPackage;
    readonly runtimeMission: RuntimeMission;
    readonly executionSession: ExecutionSession | null;
  }>(
    request: CodexRealExecutionRequest,
    result: TResult,
    authorization: AuthorizedExecutionContext,
    requestFingerprint: string,
  ): Promise<TResult> {
    if (!this.enabled) {
      throw new SecureReplayError("ADAPTER_INACTIVE");
    }
    const session = result.executionSession;
    const expectedSecurity = securityContextFor(
      authorization,
      requestFingerprint,
    );
    if (
      session === null ||
      session.status !== "COMPLETED" ||
      session.missionId !== request.promptPackage.missionId ||
      session.executionSessionId !== request.executionSessionId ||
      session.promptPackageId !== request.promptPackageId ||
      session.runtimeMissionId !== request.runtimeMission.missionId ||
      session.gitProvenance === null ||
      session.gitProvenance.provenanceSha256 !==
        authorization.gitProvenance.provenanceSha256 ||
      session.securityContext === null ||
      canonicalJson(session.securityContext) !==
        canonicalJson(expectedSecurity) ||
      result.promptPackage.missionId !== request.promptPackage.missionId ||
      result.runtimeMission.missionId !== request.runtimeMission.missionId
    ) {
      throw new SecureReplayError("SECURITY_CONTEXT_CHANGED");
    }
    const durable = await this.durableSessionStore.reconstruct(
      session.missionId,
      session.executionSessionId,
    );
    if (
      durable === null ||
      durable.status !== "CERTIFIED" ||
      durable.requestFingerprint !== requestFingerprint ||
      canonicalJson(durable.operatorIdentity) !==
        canonicalJson(expectedSecurity.operatorIdentity) ||
      canonicalJson(durable.workspaceIdentity) !==
        canonicalJson(expectedSecurity.workspaceIdentity)
    ) {
      throw new SecureReplayError(
        "PERSISTED_IDENTITY_OR_CERTIFICATION_INVALID",
      );
    }
    return result;
  }

  async persistRuntimeFailure(
    session: ExecutionSession,
    failure: unknown,
  ): Promise<void> {
    if (!this.enabled) {
      return;
    }
    const completedAt = this.clock.now().toISOString();
    const runtimeFailureSession = new ExecutionSession({
      executionSessionId: session.executionSessionId,
      missionId: session.missionId,
      promptPackageId: session.promptPackageId,
      runtimeMissionId: session.runtimeMissionId,
      startedAt: session.startedAt,
      completedAt,
      durationMs: Math.max(
        session.durationMs,
        Date.parse(completedAt) - Date.parse(session.startedAt),
      ),
      status: "RUNTIME_ERROR",
      rawCodexResult: Object.freeze({
        codexResult: session.rawCodexResult,
        runtimeFailure: snapshotFailure(failure),
      }),
      gitProvenance: session.gitProvenance,
      securityContext: session.securityContext,
    });
    await this.requireCheckpoint(
      session.executionSessionId,
      "FAILED",
      completedAt,
      snapshotFailure(failure),
    );
    await this.persistRequired(
      runtimeFailureSession,
      "FAILED",
      failure,
    );
  }

  private createTerminalSession(
    request: CodexRealExecutionRequest,
    gitProvenance: GitProvenance,
    securityContext: NonNullable<ExecutionSession["securityContext"]>,
    startedAt: string,
    startedTick: number,
    completedAt: string,
    status: ExecutionSessionStatus,
    rawCodexResult: unknown,
  ): ExecutionSession {
    const durationMs = Math.max(
      0,
      Math.round(this.clock.monotonicNow() - startedTick),
    );
    return new ExecutionSession({
      executionSessionId: request.executionSessionId,
      missionId: request.promptPackage.missionId,
      promptPackageId: request.promptPackageId,
      runtimeMissionId: request.runtimeMission.missionId,
      startedAt,
      completedAt,
      durationMs,
      status,
      rawCodexResult,
      gitProvenance,
      securityContext,
    });
  }

  private async persistRequired(
    session: ExecutionSession,
    outcome: PersistedExecutionOutcome,
    failure?: unknown,
  ): Promise<void> {
    const persisted = await this.sessionPersistence.persist(
      session,
      outcome,
      failure,
    );
    if (persisted === null) {
      throw new Error(
        "CEA-006: ExecutionSession persistence is required.",
      );
    }
  }

  private async requireCheckpoint(
    executionSessionId: string,
    status: Parameters<DurableExecutionSessionPort["checkpoint"]>[1],
    occurredAt: string,
    checkpointData: unknown = null,
  ): Promise<void> {
    const checkpoint = await this.durableSessionStore.checkpoint(
      executionSessionId,
      status,
      occurredAt,
      checkpointData,
    );
    if (checkpoint === null) {
      throw new Error(
        "CEA-009: Durable checkpoint was not persisted.",
      );
    }
  }
}

export class CodexCliTransport implements CodexExecutionTransport {
  execute(request: CodexTransportRequest): Promise<CodexCliRawResult> {
    assertTransportRequest(request);

    return new Promise((resolve, reject) => {
      const child = spawnCodex(request.workingDirectory);
      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];
      let settled = false;
      let timedOut = false;

      const finish = (
        action: () => void,
      ): void => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        request.signal?.removeEventListener("abort", abort);
        action();
      };
      const abort = (): void => {
        const reason = request.signal?.reason;
        child.kill();
        finish(() =>
          reject(
            reason instanceof Error
              ? reason
              : new CodexExecutionCancelledError(),
          ),
        );
      };
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill();
      }, request.timeoutMs);

      child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
      child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
      child.on("error", (error) => finish(() => reject(error)));
      child.on("close", (exitCode, signal) => {
        const rawResult = createRawResult(stdout, stderr, exitCode ?? -1);
        if (timedOut) {
          finish(() =>
            reject(new CodexExecutionTimeoutError(request.timeoutMs)),
          );
          return;
        }
        if (signal !== null) {
          finish(() =>
            reject(new CodexExecutionInterruptedError(signal)),
          );
          return;
        }
        if (exitCode !== 0) {
          finish(() =>
            reject(
              new CodexCliExecutionError(
                classifyCliFailure(rawResult.stderr),
                rawResult.stderr || "Codex execution failed.",
                rawResult,
              ),
            ),
          );
          return;
        }
        finish(() => resolve(rawResult));
      });

      request.signal?.addEventListener("abort", abort, { once: true });
      if (request.signal?.aborted === true) {
        abort();
        return;
      }

      child.stdin.end(request.prompt, "utf8");
    });
  }
}

const SYSTEM_CLOCK: CodexExecutionClock = Object.freeze({
  now: () => new Date(),
  monotonicNow: () => performance.now(),
});

function spawnCodex(
  workingDirectory: string,
): ChildProcessWithoutNullStreams {
  const codexArguments = [
    "exec",
    "--sandbox",
    "read-only",
    "--ephemeral",
    "--ignore-user-config",
    "--strict-config",
    "-c",
    'approval_policy="never"',
    "--json",
    "-",
  ];

  if (process.platform === "win32") {
    return spawn(
      process.env.ComSpec ?? "cmd.exe",
      ["/d", "/s", "/c", "codex.cmd", ...codexArguments],
      {
        cwd: workingDirectory,
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
  }

  return spawn("codex", codexArguments, {
    cwd: workingDirectory,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function createRawResult(
  stdoutChunks: readonly Buffer[],
  stderrChunks: readonly Buffer[],
  exitCode: number,
): CodexCliRawResult {
  const stdout = Buffer.concat(stdoutChunks).toString("utf8");
  const stderr = Buffer.concat(stderrChunks).toString("utf8");
  const events = stdout
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => {
      try {
        return JSON.parse(line) as unknown;
      } catch {
        return line;
      }
    });

  return Object.freeze({
    stdout,
    stderr,
    exitCode,
    events: Object.freeze(events),
  });
}

function classifyCliFailure(
  stderr: string,
): CodexCliExecutionError["code"] {
  if (/auth|login|unauthori[sz]ed|forbidden|401|403/i.test(stderr)) {
    return "CODEX_AUTHENTICATION_ERROR";
  }
  if (/connect|connection|network|dns|socket|timed out/i.test(stderr)) {
    return "CODEX_CONNECTION_ERROR";
  }
  return "CODEX_EXECUTION_ERROR";
}

function assertRealExecutionRequest(
  request: CodexRealExecutionRequest,
): void {
  if (
    !isRecord(request) ||
    !isToken(request.executionSessionId) ||
    !isToken(request.promptPackageId) ||
    !isRecord(request.promptPackage) ||
    !isRecord(request.runtimeMission) ||
    request.promptPackage.validationStatus !== "VALID" ||
    request.runtimeMission.validationStatus !== "VALID" ||
    request.promptPackage.missionId !== request.runtimeMission.missionId ||
    request.promptPackage.prompt !== request.runtimeMission.prompt ||
    request.promptPackage.optimization !== request.runtimeMission.optimization ||
    request.promptPackage.isolatedPrompt !==
      request.runtimeMission.isolatedPrompt ||
    request.promptPackage.certificationContext !==
      request.runtimeMission.certificationContext ||
    !isPromptIsolationEnvelope(
      request.promptPackage.isolatedPrompt,
      request.promptPackage.prompt,
    )
  ) {
    throw new Error(
      "CEA-003: Codex execution requires a coherent VALID package and RuntimeMission.",
    );
  }

  if (
    typeof request.workingDirectory !== "string" ||
    request.workingDirectory.length === 0 ||
    request.workingDirectory !== request.workingDirectory.trim() ||
    !Number.isSafeInteger(request.timeoutMs) ||
    request.timeoutMs <= 0
  ) {
    throw new Error(
      "CEA-004: Codex execution requires a working directory and positive timeout.",
    );
  }
}

function statusForFailure(error: unknown): ExecutionSessionStatus {
  const code = errorCode(error);
  if (code === "CODEX_TIMEOUT") {
    return "TIMEOUT";
  }
  if (code === "CODEX_CANCELLED" || code === "ABORT_ERR") {
    return "CANCELLED";
  }
  if (code === "CODEX_INTERRUPTED") {
    return "INTERRUPTED";
  }
  if (code === "CODEX_AUTHENTICATION_ERROR") {
    return "AUTHENTICATION_ERROR";
  }
  if (code === "CODEX_CONNECTION_ERROR") {
    return "CONNECTION_ERROR";
  }
  if (code === "RUNTIME_ERROR") {
    return "RUNTIME_ERROR";
  }
  return "FAILED";
}

function outcomeForFailure(error: unknown): PersistedExecutionOutcome {
  const status = statusForFailure(error);
  if (status === "TIMEOUT") {
    return "TIMEOUT";
  }
  if (status === "CANCELLED" || status === "INTERRUPTED") {
    return "CANCELLED";
  }
  return "FAILED";
}

function checkpointForFailure(
  error: unknown,
): "FAILED" | "CANCELLED" | "TIMEOUT" | "INTERRUPTED" {
  const status = statusForFailure(error);
  if (status === "TIMEOUT") {
    return "TIMEOUT";
  }
  if (status === "CANCELLED") {
    return "CANCELLED";
  }
  if (status === "INTERRUPTED") {
    return "INTERRUPTED";
  }
  return "FAILED";
}

function securityContextFor(
  authorization: AuthorizedExecutionContext,
  requestFingerprint: string,
): NonNullable<ExecutionSession["securityContext"]> {
  const operatorIdentity: DurableExecutionSecurityIdentity =
    Object.freeze({
      operatorId: authorization.authentication.operatorId,
      environmentId: authorization.authentication.environmentId,
      runtimeId: authorization.authentication.runtimeId,
      codexTransportId:
        authorization.authentication.codexTransportId,
      authorization: authorization.authentication.authorization,
    });
  const workspaceIdentity: DurableExecutionWorkspaceIdentity =
    Object.freeze({
      workspaceId: authorization.workspace.workspaceId,
      repositoryId: authorization.workspace.repositoryId,
      canonicalRoot: authorization.workspace.canonicalRoot,
      sandboxRoot: authorization.workspace.sandboxRoot,
    });
  return Object.freeze({
    operatorIdentity,
    workspaceIdentity,
    requestFingerprint,
  });
}

function assertReservedControl(
  request: CodexRealExecutionRequest,
  authorization: AuthorizedExecutionContext,
  control: ReservedExecutionControl,
): void {
  if (
    !isRecord(authorization) ||
    !isRecord(authorization.authentication) ||
    authorization.authentication.authorization !== "EXECUTE" ||
    !isRecord(authorization.workspace) ||
    !isRecord(authorization.gitProvenance) ||
    !isRecord(control) ||
    !isRecord(control.lease) ||
    !/^[a-f0-9]{64}$/.test(control.requestFingerprint) ||
    control.lease.correlation.missionId !==
      request.promptPackage.missionId ||
    control.lease.correlation.executionSessionId !==
      request.executionSessionId ||
    control.lease.correlation.promptPackageId !==
      request.promptPackageId ||
    control.lease.correlation.runtimeMissionId !==
      request.runtimeMission.missionId
  ) {
    throw new Error(
      "CEA-010: Execution requires a matching integrity reservation.",
    );
  }
}

function errorCode(error: unknown): string | null {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  )
    ? error.code
    : null;
}

function assertTransportRequest(request: CodexTransportRequest): void {
  if (
    !isRecord(request) ||
    typeof request.prompt !== "string" ||
    request.prompt.trim().length === 0 ||
    typeof request.workingDirectory !== "string" ||
    request.workingDirectory.length === 0 ||
    !Number.isSafeInteger(request.timeoutMs) ||
    request.timeoutMs <= 0
  ) {
    throw new Error(
      "CEA-005: CodexCliTransport requires a valid execution request.",
    );
  }
}

function assertRequest(request: CodexRequest): void {
  if (
    !isRecord(request) ||
    !isRecord(request.prompt) ||
    !isRecord(request.executionContext) ||
    !isRecord(request.authorityDecision) ||
    !isRecord(request.pipelineTrace)
  ) {
    throw new Error(
      "CEA-001: CodexExecutionAdapter requires a CodexRequest.",
    );
  }

  if (
    request.validationStatus !== "VALID" ||
    request.promptContent !== request.prompt.content ||
    request.prompt.missionBrief !== request.missionBrief ||
    request.prompt.authorityDecision !== request.authorityDecision ||
    request.prompt.pipelineTrace !== request.pipelineTrace ||
    request.requestMetadata.requestId !== request.codexRequestId ||
    request.requestMetadata.requestedAt !== request.requestedAt
  ) {
    throw new Error(
      "CEA-002: CodexRequest metadata is inconsistent.",
    );
  }
}

function isToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
