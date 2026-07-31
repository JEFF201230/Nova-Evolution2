import {
  WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE,
  WORK_TECHNICAL_AGENT_REGISTRY_SOURCE,
  WorkTechnicalAgentFailure,
  type WorkTechnicalAgent,
  type WorkTechnicalAgentDetails,
} from "./work-technical-agent.types.js";

export function createWorkTechnicalAgent(
  input: WorkTechnicalAgent,
): WorkTechnicalAgent {
  assertIdentifier(input.projectId, "projectId");
  assertIdentifier(input.workId, "workId");
  assertIdentifier(input.missionId, "missionId");
  if (input.workId !== input.missionId) {
    throw new WorkTechnicalAgentFailure(
      "WTA-ERR-002",
      "Work Technical Agent requires the canonical Work-to-Mission identity binding.",
    );
  }
  if (
    input.provenance.sourceDomain !== "MISSIONS"
    || input.provenance.producer !== "ORCHESTRATOR_RUNTIME"
    || input.provenance.missionId !== input.missionId
    || input.provenance.assignmentSource
      !== WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE
    || input.provenance.agentSource
      !== WORK_TECHNICAL_AGENT_REGISTRY_SOURCE
  ) {
    throw new WorkTechnicalAgentFailure(
      "WTA-ERR-002",
      "Work Technical Agent accepts only RuntimeMission-to-RuntimeAgent provenance.",
    );
  }
  assertIdentifier(input.provenance.sourceId, "provenance.sourceId");
  assertTimestamp(input.provenance.observedAt, "provenance.observedAt");

  return Object.freeze({
    projectId: input.projectId,
    workId: input.workId,
    missionId: input.missionId,
    agent:
      input.agent === null
        ? null
        : createAgentDetails(input.agent),
    provenance: Object.freeze({
      sourceDomain: "MISSIONS",
      producer: "ORCHESTRATOR_RUNTIME",
      sourceId: input.provenance.sourceId,
      observedAt: input.provenance.observedAt,
      missionId: input.provenance.missionId,
      assignmentSource: WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE,
      agentSource: WORK_TECHNICAL_AGENT_REGISTRY_SOURCE,
    }),
  });
}

function createAgentDetails(
  input: WorkTechnicalAgentDetails,
): WorkTechnicalAgentDetails {
  assertIdentifier(input.agentId, "agent.agentId");
  assertIdentifiers(input.missionTypes, "agent.missionTypes");
  assertIdentifiers(input.authorizedScopes, "agent.authorizedScopes");

  return Object.freeze({
    agentId: input.agentId,
    missionTypes: Object.freeze([...input.missionTypes]),
    authorizedScopes: Object.freeze([...input.authorizedScopes]),
  });
}

function assertIdentifiers(
  values: readonly string[],
  field: string,
): void {
  if (!Array.isArray(values)) {
    throw new WorkTechnicalAgentFailure(
      "WTA-ERR-001",
      `${field} must contain the RuntimeAgent string collection.`,
    );
  }
  values.forEach((value, index) =>
    assertIdentifier(value, `${field}[${index}]`),
  );
}

function assertIdentifier(value: string, field: string): void {
  if (
    typeof value !== "string"
    || value.length === 0
    || value !== value.trim()
  ) {
    throw new WorkTechnicalAgentFailure(
      "WTA-ERR-001",
      `${field} must be a non-empty canonical identifier.`,
    );
  }
}

function assertTimestamp(value: string, field: string): void {
  if (!Number.isFinite(Date.parse(value))) {
    throw new WorkTechnicalAgentFailure(
      "WTA-ERR-001",
      `${field} must contain a valid timestamp.`,
    );
  }
}
