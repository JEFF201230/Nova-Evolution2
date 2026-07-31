import {
  CertifiedIntegrationService,
  type CertifiedIntegrationResult,
  type CertifiedRuntimePort,
} from "./certified-integration-service.js";
import {
  CodexExecutionAdapter,
  type CodexExecutionClock,
  type CodexExecutionTransport,
} from "./codex-execution-adapter.js";
import {
  DurableExecutionSessionStore,
} from "./durable-execution-session.js";
import {
  ExecutionIntegrityRegistry,
} from "./execution-integrity-registry.js";
import {
  ExecutionSessionPersistence,
} from "./execution-session-persistence.js";
import type {
  GitProvenancePort,
} from "./git-provenance.js";
import {
  IntegrationPipeline,
  type IntegrationPipelineExecutionOptions,
  type IntegrationPipelineResult,
} from "./integration-pipeline.js";
import {
  IntegrationRuntimeRepository,
} from "./integration-runtime-repository.js";
import {
  MissionEvidenceCertifier,
} from "./mission-evidence-certifier.js";
import type {
  ProductionAuthenticationPort,
} from "./production-authentication.js";
import type {
  PromptPackage,
} from "./prompt-optimizer.js";
import type {
  WorkspaceSecurityPort,
} from "./workspace-security.js";

export interface ProgramProductionEntrypointDependencies {
  readonly repository: IntegrationRuntimeRepository;
  readonly runtime: CertifiedRuntimePort;
  readonly transport: CodexExecutionTransport;
  readonly productionAuthenticator: ProductionAuthenticationPort;
  readonly workspaceSecurity: WorkspaceSecurityPort;
  readonly gitProvenance: GitProvenancePort;
  readonly clock?: CodexExecutionClock;
}

export interface ProgramProductionEntrypointFeatureFlag {
  readonly enabled: boolean;
}

export class ProgramProductionEntrypoint {
  readonly enabled: boolean;
  private readonly pipeline:
    IntegrationPipeline<CertifiedIntegrationResult> | null;
  private readonly durableSessionStore:
    DurableExecutionSessionStore | null;

  constructor(
    featureFlag: ProgramProductionEntrypointFeatureFlag = {
      enabled: false,
    },
    dependencies?: ProgramProductionEntrypointDependencies,
  ) {
    this.enabled = featureFlag.enabled === true;
    if (!this.enabled) {
      this.pipeline = null;
      this.durableSessionStore = null;
      return;
    }
    if (
      dependencies === undefined ||
      dependencies.repository.enabled !== true
    ) {
      throw new Error(
        "PPE-001: Production entrypoint requires an enabled durable repository.",
      );
    }

    const durableSessionStore = new DurableExecutionSessionStore(
      dependencies.repository,
      { enabled: true },
    );
    const executionAdapter = new CodexExecutionAdapter(
      { enabled: true },
      {
        transport: dependencies.transport,
        clock: dependencies.clock,
        productionAuthenticator:
          dependencies.productionAuthenticator,
        workspaceSecurity: dependencies.workspaceSecurity,
        gitProvenance: dependencies.gitProvenance,
        sessionPersistence: new ExecutionSessionPersistence(
          dependencies.repository,
          { enabled: true },
        ),
        durableSessionStore,
      },
    );
    const certifiedIntegrationService =
      new CertifiedIntegrationService(
        { enabled: true },
        {
          runtime: dependencies.runtime,
          evidenceCertifier: new MissionEvidenceCertifier(
            dependencies.repository,
            { enabled: true },
          ),
          durableSessionStore,
        },
      );

    this.durableSessionStore = durableSessionStore;
    this.pipeline = new IntegrationPipeline<CertifiedIntegrationResult>(
      { enabled: true },
      {
        codexExecutionAdapter: executionAdapter,
        executionIntegrityRegistry:
          new ExecutionIntegrityRegistry<
            IntegrationPipelineResult<CertifiedIntegrationResult>
          >(),
        integrationService: certifiedIntegrationService,
      },
    );
  }

  execute(
    promptPackage: PromptPackage,
    options: IntegrationPipelineExecutionOptions,
  ): Promise<
    IntegrationPipelineResult<CertifiedIntegrationResult> | null
  > {
    if (!this.enabled) {
      return Promise.resolve(null);
    }
    return this.pipeline!.run(promptPackage, options);
  }

  reconstruct(
    missionId: string,
    executionSessionId: string,
  ) {
    if (!this.enabled) {
      return Promise.resolve(null);
    }
    return this.durableSessionStore!.reconstruct(
      missionId,
      executionSessionId,
    );
  }
}
