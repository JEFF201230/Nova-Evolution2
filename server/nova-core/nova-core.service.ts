import { readFile, stat } from "node:fs/promises";
import { relative, resolve } from "node:path";
import {
  OrchestratorRuntimeService,
  RuntimeFailure,
  type MissionDefinition,
  type MissionReport,
  type RuntimeAgent,
  type RuntimeEvent,
  type RuntimeObservabilityEvent,
  type RuntimeRunRecord,
  type RuntimeMission,
  type RuntimeCertificationBinding,
  type RuntimeMissionCertificate,
  type RuntimeRecoveryAction,
  type RuntimeRecoveryResult,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import {
  NovaCoreExecutionEngine,
  NovaCoreExecutionError,
  type NovaCoreExecutionRequest,
} from "./nova-core.execution.js";
import { JsonRuntimeSnapshotStore } from "./nova-core.store.js";
import {
  issueMissionCertificate,
  verifyCertificationAttestation,
  verifyMissionCertificate,
  type AuthorizedCertificationAuthority,
} from "./mission-certification.js";
import { NovaCoreError, type EvidenceSubmission } from "./nova-core.types.js";
import { canonicalJson, fingerprintReport, sha256 } from "./run-binding.js";
import type {
  HomeActiveWorkResponse,
} from "../../contracts/home-active-work.contract.js";
import { HomeActiveWorkQuery } from "./home-active-work.query.js";

const DEFAULT_AGENTS: RuntimeAgent[] = [
  {
    agentId: "NOVA-DEVELOPER",
    missionTypes: ["*"],
    authorizedScopes: ["*"],
  },
];

export interface NovaCoreServiceOptions {
  journalAttestationKey?: string;
}

export interface NovaCoreProjectExecutionTarget {
  projectId: string;
  repositoryRoot: string;
  engine: NovaCoreExecutionEngine;
}

export class NovaCoreService {
  private mutationQueue: Promise<void> = Promise.resolve();
  private snapshotSaveQueue: Promise<void> = Promise.resolve();
  private mutationActive = false;
  private deferredSnapshotSave = false;

  private constructor(
    private readonly runtime: OrchestratorRuntimeService,
    private readonly store: JsonRuntimeSnapshotStore,
    private readonly defaultExecutionEngine: NovaCoreExecutionEngine | undefined,
    private readonly projectExecutionTargets: ReadonlyMap<string, NovaCoreProjectExecutionTarget>,
  ) {}

  static async open(
    filePath: string,
    executionConfiguration?: NovaCoreExecutionEngine | readonly NovaCoreProjectExecutionTarget[],
    options: NovaCoreServiceOptions = {},
  ): Promise<NovaCoreService> {
    const store = new JsonRuntimeSnapshotStore(filePath, {
      attestationKey: options.journalAttestationKey ?? process.env.NOVA_JOURNAL_ATTESTATION_KEY ?? "",
    });
    const snapshot = await store.load();
    const runtime = new OrchestratorRuntimeService(DEFAULT_AGENTS, snapshot ?? undefined);
    const configuredTargets = isProjectExecutionTargetList(executionConfiguration)
      ? validateProjectExecutionTargets(executionConfiguration)
      : new Map<string, NovaCoreProjectExecutionTarget>();
    const defaultExecutionEngine = isProjectExecutionTargetList(executionConfiguration)
      ? undefined
      : executionConfiguration;
    const service = new NovaCoreService(runtime, store, defaultExecutionEngine, configuredTargets);
    runtime.subscribeObservability(() => { service.requestSnapshotSave(); });
    for (const engine of uniqueExecutionEngines(defaultExecutionEngine, configuredTargets)) {
      engine.setOutputObserver((output) => {
        runtime.publishExecutionOutput(output.projectId, output.missionId, {
          code: "NOVA_CORE_PROCESS_OUTPUT",
          phase: "CODEX_EXECUTION",
          message: `${output.stream}: ${output.chunk}`,
          ...(output.stream === "stdout" ? { stdout: output.chunk } : { stderr: output.chunk }),
          runId: output.runId,
          correlationId: output.correlationId,
        });
      });
    }
    return service;
  }

  async createMission(definition: MissionDefinition): Promise<{ created: boolean; mission: RuntimeMission }> {
    if (this.projectExecutionTargets.size > 0 && !this.projectExecutionTargets.has(definition.projectId)) {
      throw new NovaCoreError(
        400,
        "PROJECT_TARGET_NOT_CONFIGURED",
        `Le projet cible ${definition.projectId} n'est pas configuré dans NOVA Core.`,
      );
    }
    return this.mutate(() => {
      const existing = this.runtime.getMission(definition.projectId, definition.missionId);
      if (existing) {
        if (!sameMissionDefinition(existing, definition)) {
          throw new NovaCoreError(
            409,
            "MISSION_CONFLICT",
            "Une mission porte déjà cet identifiant avec un contenu différent.",
          );
        }
        return { created: false, mission: existing };
      }

      const mission = this.runtime.createMission(definition);
      this.runtime.acceptMission(mission.projectId, mission.missionId);
      return { created: true, mission };
    });
  }

  async assignAndLock(projectId: string, missionId: string, agentId = "NOVA-DEVELOPER"): Promise<RuntimeMission> {
    return this.mutate(() => {
      let mission = this.requireMission(projectId, missionId);
      if (mission.state === "LOCKED") {
        return mission;
      }
      if (mission.state === "READY") {
        mission = this.runtime.assignMission(projectId, missionId, agentId);
      }
      if (mission.state === "ASSIGNED") {
        this.runtime.acquireLock(projectId, missionId);
        return this.requireMission(projectId, missionId);
      }
      throw stateError(mission, "READY, ASSIGNED ou LOCKED");
    });
  }

  async submitEvidence(
    projectId: string,
    missionId: string,
    evidence: EvidenceSubmission,
  ): Promise<MissionReport> {
    validateEvidence(evidence);
    return this.mutate(async () => {
      let mission = this.requireMission(projectId, missionId);
      if (mission.reportId) {
        const existingReport = this.runtime.getReport(projectId, missionId);
        if (existingReport) {
          return existingReport;
        }
      }

      if (mission.state === "READY") {
        mission = this.runtime.assignMission(projectId, missionId, "NOVA-DEVELOPER");
      }
      if (mission.state === "ASSIGNED") {
        this.runtime.acquireLock(projectId, missionId);
        mission = this.requireMission(projectId, missionId);
      }
      if (mission.state !== "LOCKED") {
        throw stateError(mission, "READY, ASSIGNED ou LOCKED");
      }

      const result = await this.runtime.executeMission(projectId, missionId, async (context, activeMission) => ({
        projectId,
        missionId,
        reportId: evidence.reportId ?? `REPORT-${missionId}-${Date.now()}`,
        agentId: activeMission.assignedAgentId ?? "NOVA-DEVELOPER",
        reportType: evidence.reportType ?? "EVIDENCE_REPORT",
        deliverables: evidence.deliverables,
        filesChanged: evidence.filesChanged,
        checks: evidence.checks,
        blockers: evidence.blockers ?? [],
        errors: evidence.errors ?? [],
        scopeConfirmed: evidence.scopeConfirmed,
      }));
      return result.report;
    });
  }

  async executeWithNovaCore(
    projectId: string,
    missionId: string,
    request: NovaCoreExecutionRequest = {},
  ): Promise<MissionReport> {
    const executionEngine = this.requireExecutionEngine(projectId);

    return this.mutate(async () => {
      let mission = this.requireMission(projectId, missionId);
      if (mission.reportId) {
        const existingReport = this.runtime.getReport(projectId, missionId);
        if (existingReport) {
          return existingReport;
        }
      }
      if (mission.state === "READY") {
        mission = this.runtime.assignMission(projectId, missionId, "NOVA-DEVELOPER");
      }
      if (mission.state === "ASSIGNED") {
        this.runtime.acquireLock(projectId, missionId);
        mission = this.requireMission(projectId, missionId);
      }
      if (mission.state !== "LOCKED") {
        throw stateError(mission, "READY, ASSIGNED ou LOCKED");
      }

      const result = await this.runtime.executeMission(
        projectId,
        missionId,
        (context, activeMission) => executionEngine.execute(context, activeMission, request),
      );
      return result.report;
    });
  }

  cancelExecution(projectId: string, missionId: string): { runId: string; cancellationRequested: true } {
    const executionEngine = this.requireExecutionEngine(projectId);
    const mission = this.requireMission(projectId, missionId);
    if (mission.state !== "RUNNING" || !mission.runId) {
      throw new NovaCoreError(409, "MISSION_NOT_RUNNING", "La mission n'a aucune exécution active à annuler.");
    }
    if (!executionEngine.cancel(mission.runId)) {
      throw new NovaCoreError(409, "EXECUTION_NOT_ACTIVE", "Le processus de la mission n'est plus actif.");
    }
    return { runId: mission.runId, cancellationRequested: true };
  }

  async acceptTechnicalValidation(projectId: string, missionId: string): Promise<RuntimeMission> {
    return this.mutate(() => {
      let mission = this.requireMission(projectId, missionId);
      if (mission.state === "HUMAN_VALIDATION") {
        return mission;
      }
      const report = this.runtime.getReport(projectId, missionId);
      if (!report) {
        throw new NovaCoreError(422, "MISSING_EVIDENCE", "Aucun rapport de preuve n’a été fourni.");
      }
      if (!report.scopeConfirmed || report.deliverables.length === 0 || report.checks.length === 0) {
        throw new NovaCoreError(
          422,
          "INSUFFICIENT_EVIDENCE",
          "Les livrables, les contrôles réalisés et la confirmation du périmètre sont obligatoires.",
        );
      }
      if (report.blockers.length > 0 || report.errors.length > 0) {
        throw new NovaCoreError(
          422,
          "UNRESOLVED_PROBLEMS",
          "La validation technique est bloquée tant que des problèmes ou erreurs restent ouverts.",
        );
      }
      if (mission.state === "SUBMITTED") {
        mission = this.runtime.startTechnicalValidation(projectId, missionId);
      }
      if (mission.state === "TECHNICAL_VALIDATION") {
        return this.runtime.acceptTechnicalValidation(projectId, missionId, "HUMAN_VALIDATION");
      }
      throw stateError(mission, "SUBMITTED, TECHNICAL_VALIDATION ou HUMAN_VALIDATION");
    });
  }

  async certifyMission(
    projectId: string,
    missionId: string,
    submission: { runId: string; reportFingerprint: string; attestation: string },
    authority: AuthorizedCertificationAuthority,
  ): Promise<RuntimeMissionCertificate> {
    return this.mutate(async () => {
      if (authority.authorizedToCertify !== true) {
        throw new NovaCoreError(403, "CERTIFICATION_FORBIDDEN", "Une autorisation explicite de certification est obligatoire.");
      }
      const mission = this.requireMission(projectId, missionId);
      const report = this.runtime.getReport(projectId, missionId);
      if (!report) {
        throw new NovaCoreError(422, "CERTIFICATION_REPORT_MISSING", "La certification exige un rapport d'exécution.");
      }
      const binding = certificationBinding(projectId, missionId, report);

      if (mission.state === "CERTIFIED" && report.certificate) {
        throw new NovaCoreError(409, "MISSION_ALREADY_CERTIFIED", "La mission possede deja un certificat.");
      }
      if (mission.state !== "HUMAN_VALIDATION") {
        throw stateError(mission, "HUMAN_VALIDATION");
      }
      if (submission.runId !== binding.runId) {
        throw new NovaCoreError(422, "CERTIFICATION_RUN_MISMATCH", "Le runId soumis ne correspond pas au rapport courant.");
      }
      if (!submission.reportFingerprint || submission.reportFingerprint !== binding.reportFingerprint) {
        throw new NovaCoreError(
          422,
          "CERTIFICATION_FINGERPRINT_MISMATCH",
          "Le ReportFingerprint soumis ne correspond pas au rapport courant.",
        );
      }
      if (!verifyCertificationAttestation(submission.attestation, authority.signingKey, {
        projectId,
        authorityId: authority.authorityId,
        missionId,
        runId: submission.runId,
        reportFingerprint: submission.reportFingerprint,
      })) {
        throw new NovaCoreError(
          403,
          "CERTIFICATION_ATTESTATION_INVALID",
          "L'attestation cryptographique de l'autorite est invalide.",
        );
      }
      if (!report.reportPath) {
        throw new NovaCoreError(422, "CERTIFICATION_REPORT_ARTIFACT_MISSING", "Le rapport courant n'est pas lie a un artefact verifiable.");
      }
      let reportArtifact: unknown;
      try {
        reportArtifact = JSON.parse(await readFile(report.reportPath, "utf8"));
      } catch {
        throw new NovaCoreError(422, "CERTIFICATION_REPORT_ARTIFACT_INVALID", "L'artefact du rapport courant est absent ou illisible.");
      }
      if (fingerprintReport(reportArtifact) !== binding.reportFingerprint) {
        throw new NovaCoreError(422, "CERTIFICATION_REPORT_DRIFT", "L'artefact du rapport a ete modifie depuis sa validation.");
      }
      await verifyRunArtifacts(report, binding);
      await this.store.verifyAuthority();
      const submittedEvent = [...this.runtime.getEvents(projectId, missionId)]
        .reverse()
        .find((event) => event.eventName === "ReportSubmitted" && event.runId === binding.runId);
      if (
        !submittedEvent ||
        submittedEvent.payload.reportFingerprint !== binding.reportFingerprint
      ) {
        throw new NovaCoreError(
          422,
          "CERTIFICATION_JOURNAL_BINDING_MISMATCH",
          "Le journal autoritatif ne lie pas le rapport au run et au fingerprint soumis.",
        );
      }
      await verifyDeliverableEvidence(report);

      const certificate = issueMissionCertificate({
        authorityId: authority.authorityId,
        authorityType: authority.authorityType,
        keyId: authority.keyId,
        decision: "CERTIFIED",
        missionId,
        runId: binding.runId,
        reportFingerprint: binding.reportFingerprint,
        decidedAt: new Date().toISOString(),
        correlationId: `CORR-${projectId}-${missionId}`,
        attestation: submission.attestation,
      }, binding, authority.signingKey);
      if (!verifyMissionCertificate(certificate, authority.signingKey, binding)) {
        throw new NovaCoreError(500, "CERTIFICATE_SELF_VERIFICATION_FAILED", "Le certificat émis n'est pas vérifiable.");
      }
      this.runtime.certifyMission(projectId, missionId, certificate);
      return certificate;
    });
  }

  async recoverMission(
    projectId: string,
    missionId: string,
    runId: string,
    action: RuntimeRecoveryAction,
  ): Promise<RuntimeRecoveryResult> {
    const executionEngine = this.executionEngineFor(projectId);
    const execution = executionEngine
      ? await executionEngine.inspectRecovery(runId)
      : {
          processAlive: "UNKNOWN" as const,
          processTreeAlive: "UNKNOWN" as const,
          reportPresent: "UNKNOWN" as const,
          worktreeModified: "UNKNOWN" as const,
          artifactsValid: "UNKNOWN" as const,
        };
    const integrity = await this.store.inspectIntegritySignals();
    return this.mutate(() => this.runtime.recoverMission(projectId, missionId, runId, action, {
      ...execution,
      ...integrity,
    }));
  }

  listMissions(projectId?: string): RuntimeMission[] {
    return structuredClone(this.runtime.listMissions(projectId));
  }

  listHomeActiveWork(): HomeActiveWorkResponse {
    return new HomeActiveWorkQuery(this.runtime).list();
  }

  listProjectTargets(): Array<{ projectId: string; repositoryRoot: string }> {
    return [...this.projectExecutionTargets.values()]
      .map(({ projectId, repositoryRoot }) => ({ projectId, repositoryRoot }))
      .sort((left, right) => left.projectId.localeCompare(right.projectId));
  }

  async inspectProjectTarget(projectId: string) {
    const target = this.projectExecutionTargets.get(projectId);
    if (!target) {
      throw new NovaCoreError(
        404,
        "PROJECT_TARGET_NOT_CONFIGURED",
        `Le projet cible ${projectId} n'est pas configuré dans NOVA Core.`,
      );
    }
    return target.engine.inspectRepository();
  }

  getMission(projectId: string, missionId: string): RuntimeMission | null {
    const mission = this.runtime.getMission(projectId, missionId);
    return mission ? structuredClone(mission) : null;
  }

  getReport(projectId: string, missionId: string): MissionReport | null {
    const report = this.runtime.getReport(projectId, missionId);
    return report ? structuredClone(report) : null;
  }

  getCertificate(projectId: string, missionId: string): RuntimeMissionCertificate | null {
    const certificate = this.runtime.getReport(projectId, missionId)?.certificate;
    return certificate ? structuredClone(certificate) : null;
  }

  getEvents(projectId: string, missionId: string): RuntimeEvent[] {
    return structuredClone(this.runtime.getEvents(projectId, missionId));
  }

  getObservabilityEvents(projectId: string, missionId: string): RuntimeObservabilityEvent[] {
    return structuredClone(this.runtime.getObservabilityEvents(projectId, missionId));
  }

  getIncompleteRuns(projectId?: string, missionId?: string): RuntimeRunRecord[] {
    return structuredClone(this.runtime.getIncompleteRuns(projectId, missionId));
  }

  subscribeObservability(projectId: string, missionId: string, listener: (event: RuntimeObservabilityEvent) => void): () => void {
    return this.runtime.subscribeObservability((event) => {
      if (event.projectId === projectId && event.missionId === missionId) listener(event);
    });
  }

  private requireMission(projectId: string, missionId: string): RuntimeMission {
    const mission = this.runtime.getMission(projectId, missionId);
    if (!mission) {
      throw new NovaCoreError(404, "MISSION_NOT_FOUND", "La mission demandée n’existe pas.");
    }
    return mission;
  }

  private executionEngineFor(projectId: string): NovaCoreExecutionEngine | undefined {
    return this.projectExecutionTargets.get(projectId)?.engine ?? this.defaultExecutionEngine;
  }

  private requireExecutionEngine(projectId: string): NovaCoreExecutionEngine {
    const engine = this.executionEngineFor(projectId);
    if (!engine) {
      throw new NovaCoreError(
        this.projectExecutionTargets.size > 0 ? 404 : 503,
        this.projectExecutionTargets.size > 0
          ? "PROJECT_TARGET_NOT_CONFIGURED"
          : "EXECUTION_ENGINE_UNAVAILABLE",
        this.projectExecutionTargets.size > 0
          ? `Le projet cible ${projectId} n'est pas configuré dans NOVA Core.`
          : "Le moteur d'exécution NOVA Core n'est pas configuré.",
      );
    }
    return engine;
  }

  private async mutate<T>(operation: () => T | Promise<T>): Promise<T> {
    const result = this.mutationQueue.then(async () => {
      const before = this.runtime.exportSnapshot();
      this.mutationActive = true;
      try {
        const value = await operation();
        await this.saveSnapshot();
        return structuredClone(value);
      } catch (error) {
        const afterFailure = this.runtime.exportSnapshot();
        if (!hasNewExecutionTerminal(before, afterFailure)) {
          this.runtime.restoreSnapshot(before);
        }
        await this.saveSnapshot();
        throw translateRuntimeError(error);
      } finally {
        this.mutationActive = false;
        if (this.deferredSnapshotSave) {
          this.deferredSnapshotSave = false;
          void this.saveSnapshot();
        }
      }
    });
    this.mutationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private saveSnapshot(): Promise<void> {
    const next = this.snapshotSaveQueue.then(() => this.store.save(this.runtime.exportSnapshot()));
    this.snapshotSaveQueue = next.catch(() => undefined);
    return next;
  }

  private requestSnapshotSave(): void {
    if (this.mutationActive) {
      this.deferredSnapshotSave = true;
      return;
    }
    void this.saveSnapshot();
  }
}

function validateProjectExecutionTargets(
  targets: readonly NovaCoreProjectExecutionTarget[],
): Map<string, NovaCoreProjectExecutionTarget> {
  const configured = new Map<string, NovaCoreProjectExecutionTarget>();
  for (const target of targets) {
    const projectId = target.projectId.trim();
    if (!projectId || configured.has(projectId)) {
      throw new NovaCoreError(
        500,
        "PROJECT_TARGET_CONFIGURATION_INVALID",
        `La configuration du projet cible ${projectId || "<vide>"} est invalide ou dupliquée.`,
      );
    }
    configured.set(projectId, {
      projectId,
      repositoryRoot: resolve(target.repositoryRoot),
      engine: target.engine,
    });
  }
  return configured;
}

function isProjectExecutionTargetList(
  value: NovaCoreExecutionEngine | readonly NovaCoreProjectExecutionTarget[] | undefined,
): value is readonly NovaCoreProjectExecutionTarget[] {
  return Array.isArray(value);
}

function uniqueExecutionEngines(
  defaultEngine: NovaCoreExecutionEngine | undefined,
  targets: ReadonlyMap<string, NovaCoreProjectExecutionTarget>,
): NovaCoreExecutionEngine[] {
  return [...new Set([
    ...(defaultEngine ? [defaultEngine] : []),
    ...[...targets.values()].map((target) => target.engine),
  ])];
}

function hasNewExecutionTerminal(before: ReturnType<OrchestratorRuntimeService["exportSnapshot"]>, after: ReturnType<OrchestratorRuntimeService["exportSnapshot"]>): boolean {
  const previousStates = new Map(before.missions.map((mission) => [`${mission.projectId}:${mission.missionId}`, mission.state]));
  return after.missions.some((mission) =>
    ["FAILED", "CANCELLED", "TIMEOUT"].includes(mission.state) &&
    previousStates.get(`${mission.projectId}:${mission.missionId}`) !== mission.state);
}

function validateEvidence(evidence: EvidenceSubmission): void {
  if (!Array.isArray(evidence.deliverables) || evidence.deliverables.length === 0) {
    throw new NovaCoreError(400, "INVALID_EVIDENCE", "Au moins un livrable est obligatoire.");
  }
  if (!Array.isArray(evidence.filesChanged) || !Array.isArray(evidence.checks)) {
    throw new NovaCoreError(400, "INVALID_EVIDENCE", "Les fichiers modifiés et les contrôles doivent être des listes.");
  }
  if (evidence.scopeConfirmed !== true) {
    throw new NovaCoreError(400, "INVALID_EVIDENCE", "Le respect du périmètre doit être confirmé.");
  }
}

function certificationBinding(
  projectId: string,
  missionId: string,
  report: MissionReport,
): RuntimeCertificationBinding {
  const values = {
    runId: report.runId,
    promptHash: report.promptHash,
    executionRequestHash: report.executionRequestHash,
    manifestHash: report.manifestHash,
    reportFingerprint: report.reportFingerprint,
    codexVersion: report.codexVersion,
    codexPath: report.codexPath,
    codexBinaryHash: report.codexBinaryHash,
  };
  const missing = Object.entries(values).filter(([, value]) => !value).map(([name]) => name);
  if (missing.length > 0) {
    throw new NovaCoreError(
      422,
      "CERTIFICATION_BINDING_INCOMPLETE",
      `La chaîne de preuve du rapport est incomplète : ${missing.join(", ")}.`,
    );
  }
  return {
    projectId,
    missionId,
    reportId: report.reportId,
    runId: values.runId!,
    promptHash: values.promptHash!,
    executionRequestHash: values.executionRequestHash!,
    manifestHash: values.manifestHash!,
    reportFingerprint: values.reportFingerprint!,
    codexVersion: values.codexVersion!,
    codexPath: values.codexPath!,
    codexBinaryHash: values.codexBinaryHash!,
  };
}

async function verifyDeliverableEvidence(report: MissionReport): Promise<void> {
  if (!report.repositoryRoot || !report.runId || !report.deliverableEvidence) {
    throw new NovaCoreError(422, "CERTIFICATION_DELIVERABLE_EVIDENCE_MISSING", "Les livrables ne sont pas lies a des preuves verifiables.");
  }
  for (const evidence of report.deliverableEvidence) {
    if (evidence.runId !== report.runId) {
      throw new NovaCoreError(422, "CERTIFICATION_DELIVERABLE_RUN_MISMATCH", `Le livrable ${evidence.path} appartient a un autre run.`);
    }
    const absolutePath = resolve(report.repositoryRoot, evidence.path);
    const repositoryRelative = relative(report.repositoryRoot, absolutePath).replaceAll("\\", "/");
    if (repositoryRelative === ".." || repositoryRelative.startsWith("../")) {
      throw new NovaCoreError(422, "CERTIFICATION_DELIVERABLE_OUTSIDE_REPOSITORY", `Le livrable ${evidence.path} sort du depot.`);
    }
    let currentFile: Uint8Array;
    let currentStat: Awaited<ReturnType<typeof stat>>;
    try {
      [currentFile, currentStat] = await Promise.all([readFile(absolutePath), stat(absolutePath)]);
    } catch {
      throw new NovaCoreError(422, "CERTIFICATION_DELIVERABLE_MISSING", `Le livrable ${evidence.path} est absent.`);
    }
    if (currentStat.size !== evidence.size || sha256(currentFile) !== evidence.sha256) {
      throw new NovaCoreError(422, "CERTIFICATION_DELIVERABLE_DRIFT", `Le livrable ${evidence.path} a ete modifie apres le run.`);
    }
  }
}

async function verifyRunArtifacts(
  report: MissionReport,
  binding: RuntimeCertificationBinding,
): Promise<void> {
  const paths = {
    prompt: report.promptPath,
    manifest: report.manifestPath,
    executionRequest: report.executionRequestPath,
    runBinding: report.runBindingPath,
  };
  const missing = Object.entries(paths).filter(([, value]) => !value).map(([name]) => name);
  if (missing.length > 0) {
    throw new NovaCoreError(
      422,
      "CERTIFICATION_RUN_ARTIFACT_MISSING",
      `Artefacts du run absents du binding : ${missing.join(", ")}.`,
    );
  }
  let prompt: string;
  let manifestText: string;
  let executionRequestText: string;
  let persistedBinding: Record<string, unknown>;
  try {
    [prompt, manifestText, executionRequestText, persistedBinding] = await Promise.all([
      readFile(paths.prompt!, "utf8"),
      readFile(paths.manifest!, "utf8"),
      readFile(paths.executionRequest!, "utf8"),
      readJsonArtifact(paths.runBinding!),
    ]);
    JSON.parse(manifestText);
    JSON.parse(executionRequestText);
  } catch {
    throw new NovaCoreError(
      422,
      "CERTIFICATION_RUN_ARTIFACT_UNREADABLE",
      "Un artefact immuable du run est absent, illisible ou invalide.",
    );
  }
  if (
    sha256(prompt) !== binding.promptHash ||
    sha256(manifestText) !== binding.manifestHash ||
    sha256(executionRequestText) !== binding.executionRequestHash
  ) {
    throw new NovaCoreError(
      422,
      "CERTIFICATION_RUN_ARTIFACT_DRIFT",
      "Prompt, manifest ou ExecutionRequest a ete modifie depuis le run.",
    );
  }
  const expectedPersistedBinding = {
    runId: binding.runId,
    projectId: binding.projectId,
    missionId: binding.missionId,
    promptHash: binding.promptHash,
    executionRequestHash: binding.executionRequestHash,
    manifestHash: binding.manifestHash,
    branch: report.branch,
    head: report.head,
    codexVersion: binding.codexVersion,
    codexPath: binding.codexPath,
    codexBinaryHash: binding.codexBinaryHash,
    codexConfigPolicy: report.codexConfigPolicy,
  };
  const definedExpected = Object.fromEntries(
    Object.entries(expectedPersistedBinding).filter(([, value]) => value !== undefined),
  );
  if (canonicalJson(persistedBinding) !== canonicalJson(definedExpected)) {
    throw new NovaCoreError(
      422,
      "CERTIFICATION_RUN_BINDING_DRIFT",
      "Le run-binding persiste ne correspond plus aux artefacts et au rapport.",
    );
  }
}

async function readJsonArtifact(path: string): Promise<Record<string, unknown>> {
  const value = JSON.parse(await readFile(path, "utf8")) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_JSON_ARTIFACT");
  return value as Record<string, unknown>;
}

function stateError(mission: RuntimeMission, expected: string): NovaCoreError {
  return new NovaCoreError(
    409,
    "INVALID_MISSION_STATE",
    `La mission est dans l’état ${mission.state}. État attendu : ${expected}.`,
  );
}

function translateRuntimeError(error: unknown): unknown {
  if (error instanceof NovaCoreError) {
    return error;
  }
  if (error instanceof RuntimeFailure) {
    return new NovaCoreError(409, error.runtimeError.code, error.runtimeError.message, undefined, error.runtimeError.diagnostics ?? []);
  }
  if (error instanceof NovaCoreExecutionError) {
    const status =
      error.code === "NOVA_CORE_EXECUTION_TIMEOUT" ? 504 :
      error.code === "NOVA_CORE_EXECUTION_CANCELLED" ? 409 :
      500;
    return new NovaCoreError(status, error.code, error.message, error.details, error.diagnostics);
  }
  return error;
}

function sameMissionDefinition(existing: RuntimeMission, incoming: MissionDefinition): boolean {
  return (
    existing.projectId === incoming.projectId &&
    existing.missionId === incoming.missionId &&
    existing.missionType === incoming.missionType &&
    existing.objective === incoming.objective &&
    existing.authority === incoming.authority &&
    JSON.stringify(existing.scope) === JSON.stringify(incoming.scope) &&
    JSON.stringify(existing.deliverables) === JSON.stringify(incoming.deliverables) &&
    JSON.stringify(existing.stopCriteria) === JSON.stringify(incoming.stopCriteria) &&
    JSON.stringify(existing.authorizedReferences) === JSON.stringify(incoming.authorizedReferences) &&
    existing.requestedAgentId === incoming.requestedAgentId &&
    existing.priority === (incoming.priority ?? 100)
  );
}
