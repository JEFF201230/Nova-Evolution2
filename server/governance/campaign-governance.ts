export type CampaignGovernanceStatus =
  | "PLANNED"
  | "OPEN"
  | "CLOSED";

export type CampaignGovernanceGateId =
  | "mission-order-issued"
  | "scope-authorized"
  | "forbidden-scope-absent"
  | "implementation-complete"
  | "tests-pass"
  | "verification-go"
  | "certification-go"
  | "result-recorded";

export interface CampaignGovernanceGate {
  readonly id: CampaignGovernanceGateId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface CampaignGovernanceEvidence {
  readonly campaignId: string;
  readonly targetStatus: CampaignGovernanceStatus;
  readonly gates: readonly CampaignGovernanceGate[];
  readonly gateCount: number;
  readonly requiredGateCount: number;
  readonly readyGateCount: number;
  readonly ready: boolean;
}

const CAMPAIGN_GOVERNANCE_STATUSES: readonly CampaignGovernanceStatus[] =
  Object.freeze([
    "PLANNED",
    "OPEN",
    "CLOSED",
  ]);

const CAMPAIGN_GOVERNANCE_GATE_IDS: readonly CampaignGovernanceGateId[] =
  Object.freeze([
    "mission-order-issued",
    "scope-authorized",
    "forbidden-scope-absent",
    "implementation-complete",
    "tests-pass",
    "verification-go",
    "certification-go",
    "result-recorded",
  ]);

const CAMPAIGN_REQUIRED_BY_TARGET: Readonly<
  Record<CampaignGovernanceStatus, readonly CampaignGovernanceGateId[]>
> = Object.freeze({
  PLANNED: Object.freeze([]),
  OPEN: Object.freeze([
    "mission-order-issued",
    "scope-authorized",
    "forbidden-scope-absent",
  ]),
  CLOSED: CAMPAIGN_GOVERNANCE_GATE_IDS,
});

export function createCampaignGovernanceGate(
  id: CampaignGovernanceGateId,
  ready: boolean,
  evidenceReference: string,
): CampaignGovernanceGate {
  assertCampaignGovernanceGateId(id);
  assertNormalizedReferenceValue(evidenceReference, "PGOV-CAMP-005");

  return Object.freeze({
    id,
    ready,
    evidenceReference,
  });
}

export function createCampaignGovernanceGates(
  gates: readonly CampaignGovernanceGate[],
): readonly CampaignGovernanceGate[] {
  assertCampaignGovernanceGates(gates);

  return Object.freeze(
    CAMPAIGN_GOVERNANCE_GATE_IDS
      .filter((gateId) => gates.some((gate) => gate.id === gateId))
      .map((gateId) => {
        const gate = gates.find((candidate) => candidate.id === gateId);

        if (gate === undefined) {
          throw new Error(
            "PGOV-CAMP-006: Campaign Governance could not preserve deterministic gate ordering.",
          );
        }

        return createCampaignGovernanceGate(
          gate.id,
          gate.ready,
          gate.evidenceReference,
        );
      }),
  );
}

export function verifyCampaignGovernance(
  campaignId: string,
  targetStatus: CampaignGovernanceStatus,
  gates: readonly CampaignGovernanceGate[],
): CampaignGovernanceEvidence {
  assertNormalizedReferenceValue(campaignId, "PGOV-CAMP-004");
  assertCampaignGovernanceStatus(targetStatus);

  const orderedGates = createCampaignGovernanceGates(gates);
  const requiredGateIds = CAMPAIGN_REQUIRED_BY_TARGET[targetStatus];
  const readyGateCount = requiredGateIds
    .filter((gateId) => orderedGates.some((gate) => gate.id === gateId && gate.ready))
    .length;
  const ready =
    requiredGateIds.length > 0 &&
    readyGateCount === requiredGateIds.length;

  return Object.freeze({
    campaignId,
    targetStatus,
    gates: orderedGates,
    gateCount: orderedGates.length,
    requiredGateCount: requiredGateIds.length,
    readyGateCount,
    ready,
  });
}

function assertCampaignGovernanceGates(
  gates: readonly CampaignGovernanceGate[],
): void {
  const seen = new Set<string>();

  for (const gate of gates) {
    createCampaignGovernanceGate(
      gate.id,
      gate.ready,
      gate.evidenceReference,
    );

    if (seen.has(gate.id)) {
      throw new Error(
        "PGOV-CAMP-003: Campaign Governance rejects duplicate gates.",
      );
    }

    seen.add(gate.id);
  }
}

function assertCampaignGovernanceStatus(
  value: string,
): asserts value is CampaignGovernanceStatus {
  if (!CAMPAIGN_GOVERNANCE_STATUSES.includes(value as CampaignGovernanceStatus)) {
    throw new Error(
      "PGOV-CAMP-001: Campaign Governance rejects unknown campaign statuses.",
    );
  }
}

function assertCampaignGovernanceGateId(
  value: string,
): asserts value is CampaignGovernanceGateId {
  if (!CAMPAIGN_GOVERNANCE_GATE_IDS.includes(value as CampaignGovernanceGateId)) {
    throw new Error(
      "PGOV-CAMP-002: Campaign Governance rejects unknown gates.",
    );
  }
}

function assertNormalizedReferenceValue(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Campaign Governance rejects empty or non-normalized reference values.`,
    );
  }
}
