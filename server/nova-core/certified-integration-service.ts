import type {
  ExecutionSession,
} from "./execution-session.js";
import type {
  DurableExecutionSessionPort,
} from "./durable-execution-session.js";
import {
  toSerializableSession,
} from "./execution-session-persistence.js";
import type {
  IntegrationPersistedRecord,
} from "./integration-runtime-repository.js";
import type {
  IntegrationServicePort,
} from "./integration-pipeline.js";
import type {
  RuntimeMission,
} from "./mission-package-runtime-mapper.js";
import {
  MissionEvidenceCertifier,
  type MissionEvidenceBundle,
} from "./mission-evidence-certifier.js";

export interface CertifiedRuntimeResult {
  readonly missionId: string;
  readonly status: "SUCCESS";
  readonly completedAt: string;
  readonly result: unknown;
}

export interface CertifiedRuntimePort {
  execute(
    mission: RuntimeMission,
    executionSession: ExecutionSession,
  ): Promise<CertifiedRuntimeResult> | CertifiedRuntimeResult;
}

export interface CertifiedIntegrationResult {
  readonly missionId: string;
  readonly runtimeResult: CertifiedRuntimeResult;
  readonly evidenceBundle: MissionEvidenceBundle;
  readonly certification: MissionEvidenceBundle["certification"];
  readonly persistedRecords: readonly IntegrationPersistedRecord[];
}

export interface CertifiedIntegrationServiceFeatureFlag {
  readonly enabled: boolean;
}

export interface CertifiedIntegrationServiceDependencies {
  readonly runtime: CertifiedRuntimePort;
  readonly evidenceCertifier: MissionEvidenceCertifier;
  readonly durableSessionStore: DurableExecutionSessionPort;
}

export class CertifiedIntegrationError extends Error {
  readonly code = "INTEGRATION_CERTIFICATION_ERROR";

  constructor(readonly reason: string) {
    super(`Certified integration failed: ${reason}.`);
    this.name = "CertifiedIntegrationError";
  }
}

export class CertifiedIntegrationService
implements IntegrationServicePort<CertifiedIntegrationResult> {
  readonly certificationMode = "CERTIFIED_END_TO_END" as const;
  readonly enabled: boolean;

  constructor(
    featureFlag: CertifiedIntegrationServiceFeatureFlag = {
      enabled: false,
    },
    private readonly dependencies?: CertifiedIntegrationServiceDependencies,
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  async run(
    mission: RuntimeMission,
    executionSession?: ExecutionSession | null,
  ): Promise<CertifiedIntegrationResult | null> {
    if (!this.enabled) {
      return null;
    }
    if (
      this.dependencies === undefined ||
      executionSession === undefined ||
      executionSession === null ||
      executionSession.status !== "COMPLETED" ||
      mission.missionId !== executionSession.missionId ||
      executionSession.gitProvenance === null ||
      executionSession.securityContext === null ||
      mission.certificationContext.pipelineTrace.missionId !==
        mission.missionId ||
      this.dependencies.durableSessionStore.isReady?.() !== true
    ) {
      throw new CertifiedIntegrationError("INPUT_INVALID");
    }

    await this.checkpointRequired(
      executionSession.executionSessionId,
      "RUNTIME_STARTED",
      executionSession.completedAt,
    );
    const runtimeResult = await this.dependencies.runtime.execute(
      mission,
      executionSession,
    );
    if (
      runtimeResult.missionId !== mission.missionId ||
      runtimeResult.status !== "SUCCESS"
    ) {
      throw new CertifiedIntegrationError(
        "RUNTIME_TRACEABILITY_INVALID",
      );
    }
    await this.checkpointRequired(
      executionSession.executionSessionId,
      "RUNTIME_COMPLETED",
      runtimeResult.completedAt,
      runtimeResult,
    );

    const evidenceBundle = this.dependencies.evidenceCertifier.build({
      missionId: mission.missionId,
      runId: executionSession.executionSessionId,
      source: "NOVA_PROGRAM_INTEGRATION",
      authorityDecision:
        mission.certificationContext.authorityDecision,
      validationStatus:
        mission.certificationContext.validationStatus,
      pipelineTrace: mission.certificationContext.pipelineTrace,
      missingArtifacts:
        mission.certificationContext.missingArtifacts,
      requiredEvidenceTypes: [
        "EXECUTION_SESSION",
        "RUNTIME_RESULT",
        "GIT_PROVENANCE",
        "PROMPT_ISOLATION",
      ],
      evidence: [
        {
          evidenceId: `SESSION:${executionSession.executionSessionId}`,
          evidenceType: "EXECUTION_SESSION",
          source: "CODEX_EXECUTION_ADAPTER",
          occurredAt: executionSession.completedAt,
          status: "PASS",
          payload: toSerializableSession(executionSession),
        },
        {
          evidenceId: `RUNTIME:${executionSession.executionSessionId}`,
          evidenceType: "RUNTIME_RESULT",
          source: "RUNTIME",
          occurredAt: runtimeResult.completedAt,
          status: "PASS",
          payload: runtimeResult,
        },
        {
          evidenceId: `GIT:${executionSession.executionSessionId}`,
          evidenceType: "GIT_PROVENANCE",
          source: "GIT_PROVENANCE_CERTIFIER",
          occurredAt: executionSession.gitProvenance.certifiedAt,
          status: "PASS",
          payload: executionSession.gitProvenance,
        },
        {
          evidenceId: `PROMPT:${executionSession.executionSessionId}`,
          evidenceType: "PROMPT_ISOLATION",
          source: "PROMPT_OPTIMIZER",
          occurredAt: executionSession.startedAt,
          status: "PASS",
          payload: mission.isolatedPrompt,
        },
      ],
    });
    if (
      evidenceBundle === null ||
      !this.dependencies.evidenceCertifier.verify(evidenceBundle) ||
      evidenceBundle.certification.decision !== "GO"
    ) {
      throw new CertifiedIntegrationError(
        "CERTIFICATION_NOT_GO",
      );
    }

    const persistedRecords =
      await this.dependencies.evidenceCertifier.persist(
        evidenceBundle,
        {
          evidenceRecordId:
            `EVIDENCE:${executionSession.executionSessionId}`,
          certificationRecordId:
            `CERTIFICATION:${executionSession.executionSessionId}`,
          occurredAt: runtimeResult.completedAt,
        },
      );
    if (persistedRecords.length !== 2) {
      throw new CertifiedIntegrationError(
        "CERTIFICATION_NOT_PERSISTED",
      );
    }
    await this.checkpointRequired(
      executionSession.executionSessionId,
      "CERTIFIED",
      runtimeResult.completedAt,
      {
        evidenceBundleFingerprint: evidenceBundle.bundleFingerprint,
        certificationDecision:
          evidenceBundle.certification.decision,
      },
    );

    return Object.freeze({
      missionId: mission.missionId,
      runtimeResult,
      evidenceBundle,
      certification: evidenceBundle.certification,
      persistedRecords,
    });
  }

  private async checkpointRequired(
    executionSessionId: string,
    status: Parameters<DurableExecutionSessionPort["checkpoint"]>[1],
    occurredAt: string,
    checkpointData: unknown = null,
  ): Promise<void> {
    const checkpoint =
      await this.dependencies!.durableSessionStore.checkpoint(
        executionSessionId,
        status,
        occurredAt,
        checkpointData,
      );
    if (checkpoint === null) {
      throw new CertifiedIntegrationError(
        `CHECKPOINT_NOT_PERSISTED:${status}`,
      );
    }
  }
}
