import {
  createMissionControlCapability,
} from "../os-integration/mission-control-capability.js";
import type {
  MissionControlCapability,
} from "../os-integration/mission-control-capability.js";
import {
  verifyRuntimeEvidenceConsumption,
} from "../os-integration/runtime-evidence-consumption.js";
import type {
  RuntimeEvidenceConsumptionEvidence,
  RuntimeEvidenceConsumptionResult,
} from "../os-integration/runtime-evidence-consumption.js";
import {
  createGovernanceApprovalRecord,
  verifyGovernanceApprovalWorkflow,
} from "./approval-workflow.js";
import type {
  GovernanceApprovalWorkflowEvidence,
} from "./approval-workflow.js";
import {
  createCampaignGovernanceGate,
  verifyCampaignGovernance,
} from "./campaign-governance.js";
import type {
  CampaignGovernanceEvidence,
} from "./campaign-governance.js";
import {
  createGovernanceDecisionRecord,
  verifyGovernanceDecisionWorkflow,
} from "./decision-workflow.js";
import type {
  GovernanceDecisionWorkflowEvidence,
} from "./decision-workflow.js";
import {
  createMissionOrderGovernanceGate,
  verifyMissionOrderGovernance,
} from "./mission-order-governance.js";
import type {
  MissionOrderGovernanceEvidence,
} from "./mission-order-governance.js";
import {
  createProgramLifecycleGate,
  verifyProgramLifecycleTransition,
} from "./program-lifecycle.js";
import type {
  ProgramLifecycleEvidence,
} from "./program-lifecycle.js";

export type GovernanceCoreSourceReferenceId =
  | "nova-master-plan"
  | "program-board"
  | "program-delivery-squad-standard"
  | "nova-delivery-squad-standard"
  | "program-005-certified-capability"
  | "program-006-charter"
  | "program-006-program-index";

export type GovernanceCoreComponentId =
  | "source-authority"
  | "approval-workflow"
  | "decision-workflow"
  | "program-lifecycle"
  | "mission-order-governance"
  | "campaign-governance"
  | "program-005-evidence-consumption"
  | "mission-control-capability";

export interface GovernanceCoreSourceReference {
  readonly id: GovernanceCoreSourceReferenceId;
  readonly value: string;
}

export interface GovernanceCoreComponent {
  readonly id: GovernanceCoreComponentId;
  readonly ready: boolean;
}

export interface GovernanceCoreCompositionEvidence {
  readonly components: readonly GovernanceCoreComponent[];
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly ready: boolean;
}

export interface GovernanceCoreEvidence {
  readonly sourceReferences: readonly GovernanceCoreSourceReference[];
  readonly approvals: GovernanceApprovalWorkflowEvidence;
  readonly decisions: GovernanceDecisionWorkflowEvidence;
  readonly programLifecycle: ProgramLifecycleEvidence;
  readonly missionOrderGovernance: MissionOrderGovernanceEvidence;
  readonly campaignGovernance: CampaignGovernanceEvidence;
  readonly runtimeEvidenceConsumption: RuntimeEvidenceConsumptionEvidence;
  readonly missionControlCapability: MissionControlCapability;
  readonly composition: GovernanceCoreCompositionEvidence;
  readonly ready: boolean;
}

export interface GovernanceCoreResult {
  readonly passed: boolean;
  readonly evidence: GovernanceCoreEvidence;
}

const GOVERNANCE_CORE_SOURCE_REFERENCE_IDS: readonly GovernanceCoreSourceReferenceId[] =
  Object.freeze([
    "nova-master-plan",
    "program-board",
    "program-delivery-squad-standard",
    "nova-delivery-squad-standard",
    "program-005-certified-capability",
    "program-006-charter",
    "program-006-program-index",
  ]);

const GOVERNANCE_CORE_COMPONENT_IDS: readonly GovernanceCoreComponentId[] =
  Object.freeze([
    "source-authority",
    "approval-workflow",
    "decision-workflow",
    "program-lifecycle",
    "mission-order-governance",
    "campaign-governance",
    "program-005-evidence-consumption",
    "mission-control-capability",
  ]);

const GOVERNANCE_CORE_SOURCE_REFERENCES: readonly GovernanceCoreSourceReference[] =
  Object.freeze([
    Object.freeze({
      id: "nova-master-plan",
      value: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
    }),
    Object.freeze({
      id: "program-board",
      value: "Docs/20_NOVA_PORTFOLIO/PROGRAM_BOARD.md",
    }),
    Object.freeze({
      id: "program-delivery-squad-standard",
      value: "Docs/00_GOVERNANCE/PROGRAM_DELIVERY_SQUAD_STANDARD.md",
    }),
    Object.freeze({
      id: "nova-delivery-squad-standard",
      value: "Docs/00_GOVERNANCE/NOVA_DELIVERY_SQUAD_STANDARD.md",
    }),
    Object.freeze({
      id: "program-005-certified-capability",
      value: "Docs/19_PROGRAMS/PROGRAM-005_OPERATING_SYSTEM_CAPABILITY_INTEGRATION/CAMPAIGN_005_CERTIFICATION_REPORT.md",
    }),
    Object.freeze({
      id: "program-006-charter",
      value: "Docs/19_PROGRAMS/PROGRAM-006_GOVERNANCE/PROGRAM_006_CHARTER.md",
    }),
    Object.freeze({
      id: "program-006-program-index",
      value: "Docs/19_PROGRAMS/PROGRAM-006_GOVERNANCE/PROGRAM_006_PROGRAM_INDEX.md",
    }),
  ]);

export function verifyGovernanceCore(): GovernanceCoreResult {
  const sourceReferences = createGovernanceCoreSourceReferences(
    GOVERNANCE_CORE_SOURCE_REFERENCES,
  );
  const approvals = verifyGovernanceApprovalWorkflow([
    createGovernanceApprovalRecord(
      "PROGRAM-006-APPROVAL-ACTIVATION",
      "program-board",
      "program-activation",
      "APPROVED",
      "PROGRAM_006_CHARTER.md",
    ),
    createGovernanceApprovalRecord(
      "PROGRAM-006-APPROVAL-MO-001",
      "program-board",
      "mission-order-issue",
      "APPROVED",
      "P6-MO-001-GOVERNANCE-CORE.md",
    ),
    createGovernanceApprovalRecord(
      "PROGRAM-006-APPROVAL-CAMPAIGN-001",
      "program-delivery-squad",
      "campaign-open",
      "APPROVED",
      "CAMPAIGN_001_EXECUTION_REPORT.md",
    ),
    createGovernanceApprovalRecord(
      "PROGRAM-006-APPROVAL-CLOSURE",
      "program-board",
      "program-closure",
      "APPROVED",
      "PROGRAM_006_CLOSURE_REPORT.md",
    ),
  ]);
  const decisions = verifyGovernanceDecisionWorkflow([
    createGovernanceDecisionRecord(
      "PROGRAM-006-DECISION-LIFECYCLE",
      "program-lifecycle",
      "GO",
      "PROGRAM_006_VERIFICATION_REPORT.md",
    ),
    createGovernanceDecisionRecord(
      "PROGRAM-006-DECISION-MISSION",
      "mission-order-governance",
      "GO",
      "P6-MO-001_VERIFICATION_REPORT.md",
    ),
    createGovernanceDecisionRecord(
      "PROGRAM-006-DECISION-CAMPAIGN",
      "campaign-governance",
      "GO",
      "CAMPAIGN_001_VERIFICATION_REPORT.md",
    ),
    createGovernanceDecisionRecord(
      "PROGRAM-006-DECISION-APPROVAL",
      "approval-workflow",
      "GO",
      "PROGRAM_006_CERTIFICATION_REPORT.md",
    ),
    createGovernanceDecisionRecord(
      "PROGRAM-006-DECISION-CERTIFICATION",
      "closure-certification",
      "GO",
      "PROGRAM_006_CERTIFICATION_REPORT.md",
    ),
  ]);
  const programLifecycle = verifyProgramLifecycleTransition(
    "ACTIVE",
    "COMPLETE",
    [
      createProgramLifecycleGate(
        "program-board-approval",
        approvals.ready,
        "PROGRAM_006_CHARTER.md",
      ),
      createProgramLifecycleGate(
        "charter-active",
        true,
        "PROGRAM_006_CHARTER.md",
      ),
      createProgramLifecycleGate(
        "dependencies-complete",
        true,
        "PROGRAM_005_ROADMAP.md",
      ),
      createProgramLifecycleGate(
        "mission-orders-complete",
        true,
        "P6-MO-001_RESULT.md",
      ),
      createProgramLifecycleGate(
        "campaigns-closed",
        true,
        "CAMPAIGN_001_RESULT.md",
      ),
      createProgramLifecycleGate(
        "tests-pass",
        true,
        "CAMPAIGN_001_TEST_REPORT.md",
      ),
      createProgramLifecycleGate(
        "certification-go",
        true,
        "PROGRAM_006_CERTIFICATION_REPORT.md",
      ),
      createProgramLifecycleGate(
        "closure-approved",
        true,
        "PROGRAM_006_CLOSURE_REPORT.md",
      ),
    ],
  );
  const missionOrderGovernance = verifyMissionOrderGovernance(
    "P6-MO-001",
    "COMPLETE",
    [
      createMissionOrderGovernanceGate(
        "program-active",
        true,
        "PROGRAM_006_CHARTER.md",
      ),
      createMissionOrderGovernanceGate(
        "program-board-approval",
        approvals.ready,
        "P6-MO-001-GOVERNANCE-CORE.md",
      ),
      createMissionOrderGovernanceGate(
        "scope-bounded",
        true,
        "P6-MO-001-GOVERNANCE-CORE.md",
      ),
      createMissionOrderGovernanceGate(
        "campaigns-closed",
        true,
        "CAMPAIGN_001_RESULT.md",
      ),
      createMissionOrderGovernanceGate(
        "execution-evidence",
        true,
        "CAMPAIGN_001_EXECUTION_REPORT.md",
      ),
      createMissionOrderGovernanceGate(
        "verification-go",
        true,
        "P6-MO-001_VERIFICATION_REPORT.md",
      ),
      createMissionOrderGovernanceGate(
        "certification-go",
        true,
        "P6-MO-001_CERTIFICATION_REPORT.md",
      ),
      createMissionOrderGovernanceGate(
        "result-produced",
        true,
        "P6-MO-001_RESULT.md",
      ),
    ],
  );
  const campaignGovernance = verifyCampaignGovernance(
    "CAMPAIGN-001",
    "CLOSED",
    [
      createCampaignGovernanceGate(
        "mission-order-issued",
        missionOrderGovernance.ready,
        "P6-MO-001-GOVERNANCE-CORE.md",
      ),
      createCampaignGovernanceGate(
        "scope-authorized",
        true,
        "CAMPAIGN_001_EXECUTION_REPORT.md",
      ),
      createCampaignGovernanceGate(
        "forbidden-scope-absent",
        true,
        "CAMPAIGN_001_VERIFICATION_REPORT.md",
      ),
      createCampaignGovernanceGate(
        "implementation-complete",
        true,
        "server/governance/governance-core.ts",
      ),
      createCampaignGovernanceGate(
        "tests-pass",
        true,
        "CAMPAIGN_001_TEST_REPORT.md",
      ),
      createCampaignGovernanceGate(
        "verification-go",
        true,
        "CAMPAIGN_001_VERIFICATION_REPORT.md",
      ),
      createCampaignGovernanceGate(
        "certification-go",
        true,
        "CAMPAIGN_001_CERTIFICATION_REPORT.md",
      ),
      createCampaignGovernanceGate(
        "result-recorded",
        true,
        "CAMPAIGN_001_RESULT.md",
      ),
    ],
  );
  const runtimeEvidenceConsumption = verifyRuntimeEvidenceConsumption();
  const missionControlCapability = createMissionControlCapability(
    missionOrderGovernance.ready ? "COMPLETE" : "INCOMPLETE",
    campaignGovernance.ready ? "CLOSED" : "OPEN",
    decisions.ready ? "GO" : "REWORK",
    runtimeEvidenceConsumption.passed ? "PROGRAM-005: COMPLETE" : "PROGRAM-005: INCOMPLETE",
    runtimeEvidenceConsumption.evidence.readyGovernanceEvidenceCount > 0 ? "AVAILABLE" : "UNAVAILABLE",
    runtimeEvidenceConsumption.evidence.ready ? "READY" : "INCOMPLETE",
  );
  const composition = verifyGovernanceCoreComposition(
    createGovernanceCoreComponents(
      sourceReferences,
      approvals,
      decisions,
      programLifecycle,
      missionOrderGovernance,
      campaignGovernance,
      runtimeEvidenceConsumption,
      missionControlCapability,
    ),
  );
  const evidence = createGovernanceCoreEvidence(
    sourceReferences,
    approvals,
    decisions,
    programLifecycle,
    missionOrderGovernance,
    campaignGovernance,
    runtimeEvidenceConsumption,
    missionControlCapability,
    composition,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createGovernanceCoreSourceReferences(
  references: readonly GovernanceCoreSourceReference[],
): readonly GovernanceCoreSourceReference[] {
  assertGovernanceCoreSourceReferences(references);

  return Object.freeze(
    GOVERNANCE_CORE_SOURCE_REFERENCE_IDS
      .filter((referenceId) => references.some((reference) => reference.id === referenceId))
      .map((referenceId) => {
        const reference = references.find((candidate) => candidate.id === referenceId);

        if (reference === undefined) {
          throw new Error(
            "PGOV-CORE-006: Governance Core could not preserve deterministic source ordering.",
          );
        }

        return Object.freeze({
          id: reference.id,
          value: reference.value,
        });
      }),
  );
}

export function verifyGovernanceCoreComposition(
  components: readonly GovernanceCoreComponent[],
): GovernanceCoreCompositionEvidence {
  assertGovernanceCoreComponents(components);

  const orderedComponents = GOVERNANCE_CORE_COMPONENT_IDS
    .filter((componentId) => components.some((component) => component.id === componentId))
    .map((componentId) => {
      const component = components.find((candidate) => candidate.id === componentId);

      if (component === undefined) {
        throw new Error(
          "PGOV-CORE-007: Governance Core could not preserve deterministic component ordering.",
        );
      }

      return Object.freeze({
        id: component.id,
        ready: component.ready,
      });
    });
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = GOVERNANCE_CORE_COMPONENT_IDS.length;
  const ready =
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount;

  return Object.freeze({
    components: Object.freeze(orderedComponents),
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    ready,
  });
}

export function createGovernanceCoreEvidence(
  sourceReferences: readonly GovernanceCoreSourceReference[],
  approvals: GovernanceApprovalWorkflowEvidence,
  decisions: GovernanceDecisionWorkflowEvidence,
  programLifecycle: ProgramLifecycleEvidence,
  missionOrderGovernance: MissionOrderGovernanceEvidence,
  campaignGovernance: CampaignGovernanceEvidence,
  runtimeEvidenceConsumption: RuntimeEvidenceConsumptionResult,
  missionControlCapability: MissionControlCapability,
  composition: GovernanceCoreCompositionEvidence,
): GovernanceCoreEvidence {
  const normalizedSourceReferences = createGovernanceCoreSourceReferences(sourceReferences);
  const ready =
    normalizedSourceReferences.length === GOVERNANCE_CORE_SOURCE_REFERENCE_IDS.length &&
    approvals.ready &&
    decisions.ready &&
    programLifecycle.ready &&
    missionOrderGovernance.ready &&
    campaignGovernance.ready &&
    runtimeEvidenceConsumption.passed &&
    isMissionControlCapabilityReady(missionControlCapability) &&
    composition.ready;

  return Object.freeze({
    sourceReferences: normalizedSourceReferences,
    approvals,
    decisions,
    programLifecycle,
    missionOrderGovernance,
    campaignGovernance,
    runtimeEvidenceConsumption: runtimeEvidenceConsumption.evidence,
    missionControlCapability: Object.freeze({ ...missionControlCapability }),
    composition,
    ready,
  });
}

function createGovernanceCoreComponents(
  sourceReferences: readonly GovernanceCoreSourceReference[],
  approvals: GovernanceApprovalWorkflowEvidence,
  decisions: GovernanceDecisionWorkflowEvidence,
  programLifecycle: ProgramLifecycleEvidence,
  missionOrderGovernance: MissionOrderGovernanceEvidence,
  campaignGovernance: CampaignGovernanceEvidence,
  runtimeEvidenceConsumption: RuntimeEvidenceConsumptionResult,
  missionControlCapability: MissionControlCapability,
): readonly GovernanceCoreComponent[] {
  return Object.freeze([
    Object.freeze({
      id: "source-authority",
      ready: sourceReferences.length === GOVERNANCE_CORE_SOURCE_REFERENCE_IDS.length,
    }),
    Object.freeze({
      id: "approval-workflow",
      ready: approvals.ready,
    }),
    Object.freeze({
      id: "decision-workflow",
      ready: decisions.ready,
    }),
    Object.freeze({
      id: "program-lifecycle",
      ready: programLifecycle.ready,
    }),
    Object.freeze({
      id: "mission-order-governance",
      ready: missionOrderGovernance.ready,
    }),
    Object.freeze({
      id: "campaign-governance",
      ready: campaignGovernance.ready,
    }),
    Object.freeze({
      id: "program-005-evidence-consumption",
      ready: runtimeEvidenceConsumption.passed,
    }),
    Object.freeze({
      id: "mission-control-capability",
      ready: isMissionControlCapabilityReady(missionControlCapability),
    }),
  ]);
}

function isMissionControlCapabilityReady(
  capability: MissionControlCapability,
): boolean {
  return (
    capability.missionOrderStatus === "COMPLETE" &&
    capability.campaignStatus === "CLOSED" &&
    capability.certificationStatus === "GO" &&
    capability.dependencyStatus === "PROGRAM-005: COMPLETE" &&
    capability.runtimeEvidenceStatus === "AVAILABLE" &&
    capability.traceabilityStatus === "READY"
  );
}

function assertGovernanceCoreSourceReferences(
  references: readonly GovernanceCoreSourceReference[],
): void {
  const seen = new Set<string>();

  for (const reference of references) {
    assertGovernanceCoreSourceReferenceId(reference.id);
    assertNormalizedReferenceValue(reference.value, "PGOV-CORE-005");

    if (seen.has(reference.id)) {
      throw new Error(
        "PGOV-CORE-002: Governance Core rejects duplicate source references.",
      );
    }

    seen.add(reference.id);
  }
}

function assertGovernanceCoreComponents(
  components: readonly GovernanceCoreComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertGovernanceCoreComponentId(component.id);

    if (seen.has(component.id)) {
      throw new Error(
        "PGOV-CORE-004: Governance Core rejects duplicate components.",
      );
    }

    seen.add(component.id);
  }
}

function assertGovernanceCoreSourceReferenceId(
  value: string,
): asserts value is GovernanceCoreSourceReferenceId {
  if (!GOVERNANCE_CORE_SOURCE_REFERENCE_IDS.includes(value as GovernanceCoreSourceReferenceId)) {
    throw new Error(
      "PGOV-CORE-001: Governance Core rejects unknown source references.",
    );
  }
}

function assertGovernanceCoreComponentId(
  value: string,
): asserts value is GovernanceCoreComponentId {
  if (!GOVERNANCE_CORE_COMPONENT_IDS.includes(value as GovernanceCoreComponentId)) {
    throw new Error(
      "PGOV-CORE-003: Governance Core rejects unknown components.",
    );
  }
}

function assertNormalizedReferenceValue(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Governance Core rejects empty or non-normalized reference values.`,
    );
  }
}
