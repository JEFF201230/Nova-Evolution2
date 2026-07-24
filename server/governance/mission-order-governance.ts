export type MissionOrderGovernanceStatus =
  | "PLANNED"
  | "ISSUED"
  | "COMPLETE";

export type MissionOrderGovernanceGateId =
  | "program-active"
  | "program-board-approval"
  | "scope-bounded"
  | "campaigns-closed"
  | "execution-evidence"
  | "verification-go"
  | "certification-go"
  | "result-produced";

export interface MissionOrderGovernanceGate {
  readonly id: MissionOrderGovernanceGateId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface MissionOrderGovernanceEvidence {
  readonly missionOrderId: string;
  readonly targetStatus: MissionOrderGovernanceStatus;
  readonly gates: readonly MissionOrderGovernanceGate[];
  readonly gateCount: number;
  readonly requiredGateCount: number;
  readonly readyGateCount: number;
  readonly ready: boolean;
}

const MISSION_ORDER_STATUSES: readonly MissionOrderGovernanceStatus[] =
  Object.freeze([
    "PLANNED",
    "ISSUED",
    "COMPLETE",
  ]);

const MISSION_ORDER_GATE_IDS: readonly MissionOrderGovernanceGateId[] =
  Object.freeze([
    "program-active",
    "program-board-approval",
    "scope-bounded",
    "campaigns-closed",
    "execution-evidence",
    "verification-go",
    "certification-go",
    "result-produced",
  ]);

const MISSION_ORDER_REQUIRED_BY_TARGET: Readonly<
  Record<MissionOrderGovernanceStatus, readonly MissionOrderGovernanceGateId[]>
> = Object.freeze({
  PLANNED: Object.freeze([]),
  ISSUED: Object.freeze([
    "program-active",
    "program-board-approval",
    "scope-bounded",
  ]),
  COMPLETE: MISSION_ORDER_GATE_IDS,
});

export function createMissionOrderGovernanceGate(
  id: MissionOrderGovernanceGateId,
  ready: boolean,
  evidenceReference: string,
): MissionOrderGovernanceGate {
  assertMissionOrderGovernanceGateId(id);
  assertNormalizedReferenceValue(evidenceReference, "PGOV-MO-005");

  return Object.freeze({
    id,
    ready,
    evidenceReference,
  });
}

export function createMissionOrderGovernanceGates(
  gates: readonly MissionOrderGovernanceGate[],
): readonly MissionOrderGovernanceGate[] {
  assertMissionOrderGovernanceGates(gates);

  return Object.freeze(
    MISSION_ORDER_GATE_IDS
      .filter((gateId) => gates.some((gate) => gate.id === gateId))
      .map((gateId) => {
        const gate = gates.find((candidate) => candidate.id === gateId);

        if (gate === undefined) {
          throw new Error(
            "PGOV-MO-006: Mission Order Governance could not preserve deterministic gate ordering.",
          );
        }

        return createMissionOrderGovernanceGate(
          gate.id,
          gate.ready,
          gate.evidenceReference,
        );
      }),
  );
}

export function verifyMissionOrderGovernance(
  missionOrderId: string,
  targetStatus: MissionOrderGovernanceStatus,
  gates: readonly MissionOrderGovernanceGate[],
): MissionOrderGovernanceEvidence {
  assertNormalizedReferenceValue(missionOrderId, "PGOV-MO-004");
  assertMissionOrderGovernanceStatus(targetStatus);

  const orderedGates = createMissionOrderGovernanceGates(gates);
  const requiredGateIds = MISSION_ORDER_REQUIRED_BY_TARGET[targetStatus];
  const readyGateCount = requiredGateIds
    .filter((gateId) => orderedGates.some((gate) => gate.id === gateId && gate.ready))
    .length;
  const ready =
    requiredGateIds.length > 0 &&
    readyGateCount === requiredGateIds.length;

  return Object.freeze({
    missionOrderId,
    targetStatus,
    gates: orderedGates,
    gateCount: orderedGates.length,
    requiredGateCount: requiredGateIds.length,
    readyGateCount,
    ready,
  });
}

function assertMissionOrderGovernanceGates(
  gates: readonly MissionOrderGovernanceGate[],
): void {
  const seen = new Set<string>();

  for (const gate of gates) {
    createMissionOrderGovernanceGate(
      gate.id,
      gate.ready,
      gate.evidenceReference,
    );

    if (seen.has(gate.id)) {
      throw new Error(
        "PGOV-MO-003: Mission Order Governance rejects duplicate gates.",
      );
    }

    seen.add(gate.id);
  }
}

function assertMissionOrderGovernanceStatus(
  value: string,
): asserts value is MissionOrderGovernanceStatus {
  if (!MISSION_ORDER_STATUSES.includes(value as MissionOrderGovernanceStatus)) {
    throw new Error(
      "PGOV-MO-001: Mission Order Governance rejects unknown mission order statuses.",
    );
  }
}

function assertMissionOrderGovernanceGateId(
  value: string,
): asserts value is MissionOrderGovernanceGateId {
  if (!MISSION_ORDER_GATE_IDS.includes(value as MissionOrderGovernanceGateId)) {
    throw new Error(
      "PGOV-MO-002: Mission Order Governance rejects unknown gates.",
    );
  }
}

function assertNormalizedReferenceValue(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Mission Order Governance rejects empty or non-normalized reference values.`,
    );
  }
}
