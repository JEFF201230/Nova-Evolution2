import {
  OrchestratorRuntimeService,
  RuntimeFailure,
  type MissionDefinition,
  type MissionReport,
  type RuntimeAgent,
  type RuntimeEvent,
  type RuntimeMission,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import {
  NovaCoreExecutionEngine,
  NovaCoreExecutionError,
  type NovaCoreExecutionRequest,
} from "./nova-core.execution.js";
import { JsonRuntimeSnapshotStore } from "./nova-core.store.js";
import { NovaCoreError, type EvidenceSubmission } from "./nova-core.types.js";

const DEFAULT_AGENTS: RuntimeAgent[] = [
  {
    agentId: "NOVA-DEVELOPER",
    missionTypes: ["*"],
    authorizedScopes: ["*"],
  },
];

export class NovaCoreService {
  private mutationQueue: Promise<void> = Promise.resolve();

  private constructor(
    private readonly runtime: OrchestratorRuntimeService,
    private readonly store: JsonRuntimeSnapshotStore,
    private readonly executionEngine?: NovaCoreExecutionEngine,
  ) {}

  static async open(
    filePath: string,
    executionEngine?: NovaCoreExecutionEngine,
  ): Promise<NovaCoreService> {
    const store = new JsonRuntimeSnapshotStore(filePath);
    const snapshot = await store.load();
    const runtime = new OrchestratorRuntimeService(DEFAULT_AGENTS, snapshot ?? undefined);
    return new NovaCoreService(runtime, store, executionEngine);
  }

  async createMission(definition: MissionDefinition): Promise<{ created: boolean; mission: RuntimeMission }> {
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
    if (!this.executionEngine) {
      throw new NovaCoreError(
        503,
        "EXECUTION_ENGINE_UNAVAILABLE",
        "Le moteur d’exécution NOVA Core n’est pas configuré.",
      );
    }

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
        (context, activeMission) => this.executionEngine!.execute(context, activeMission, request),
      );
      return result.report;
    });
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

  async approveMission(projectId: string, missionId: string): Promise<RuntimeMission> {
    return this.mutate(() => {
      const mission = this.requireMission(projectId, missionId);
      if (mission.state === "ACCEPTED") {
        return mission;
      }
      if (mission.state !== "HUMAN_VALIDATION") {
        throw stateError(mission, "HUMAN_VALIDATION");
      }
      return this.runtime.approveMission(projectId, missionId);
    });
  }

  listMissions(projectId?: string): RuntimeMission[] {
    return structuredClone(this.runtime.listMissions(projectId));
  }

  getMission(projectId: string, missionId: string): RuntimeMission | null {
    const mission = this.runtime.getMission(projectId, missionId);
    return mission ? structuredClone(mission) : null;
  }

  getReport(projectId: string, missionId: string): MissionReport | null {
    const report = this.runtime.getReport(projectId, missionId);
    return report ? structuredClone(report) : null;
  }

  getEvents(projectId: string, missionId: string): RuntimeEvent[] {
    return structuredClone(this.runtime.getEvents(projectId, missionId));
  }

  private requireMission(projectId: string, missionId: string): RuntimeMission {
    const mission = this.runtime.getMission(projectId, missionId);
    if (!mission) {
      throw new NovaCoreError(404, "MISSION_NOT_FOUND", "La mission demandée n’existe pas.");
    }
    return mission;
  }

  private async mutate<T>(operation: () => T | Promise<T>): Promise<T> {
    const result = this.mutationQueue.then(async () => {
      try {
        const value = await operation();
        await this.store.save(this.runtime.exportSnapshot());
        return structuredClone(value);
      } catch (error) {
        await this.store.save(this.runtime.exportSnapshot());
        throw translateRuntimeError(error);
      }
    });
    this.mutationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
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
    return new NovaCoreError(409, error.runtimeError.code, error.runtimeError.message);
  }
  if (error instanceof NovaCoreExecutionError) {
    return new NovaCoreError(500, error.code, error.message);
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
