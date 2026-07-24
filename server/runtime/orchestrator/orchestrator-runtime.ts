import { OrchestratorRuntimeService } from "./orchestrator-runtime.service.js";
import type { MissionDefinition, RuntimeAgent } from "./orchestrator-runtime.types.js";

export function createOrchestratorRuntime(agents: RuntimeAgent[] = []): OrchestratorRuntimeService {
  return new OrchestratorRuntimeService(agents);
}

export function createMissionRuntime(definition: MissionDefinition, agents: RuntimeAgent[] = []): OrchestratorRuntimeService {
  const runtime = createOrchestratorRuntime(agents);
  runtime.createMission(definition);
  return runtime;
}

export { OrchestratorEventBus, OrchestratorQueue, OrchestratorRuntimeService, RuntimeFailure } from "./orchestrator-runtime.service.js";

export type {
  AuditEntry,
  MissionDefinition,
  MissionEventName,
  MissionReport,
  MissionScope,
  MissionState,
  RuntimeAgent,
  RuntimeContext,
  RuntimeError,
  RuntimeEvent,
  RuntimeExecutionHandler,
  RuntimeExecutionResult,
  RuntimeLock,
  RuntimeLockStatus,
  RuntimeMission,
  RuntimeQueueItem,
  RuntimeQueueSnapshot,
  RuntimeSnapshot,
} from "./orchestrator-runtime.types.js";
