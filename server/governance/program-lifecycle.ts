export type GovernanceProgramStatus =
  | "PLANNED"
  | "ACTIVE"
  | "COMPLETE";

export type ProgramLifecycleGateId =
  | "program-board-approval"
  | "charter-active"
  | "dependencies-complete"
  | "mission-orders-complete"
  | "campaigns-closed"
  | "tests-pass"
  | "certification-go"
  | "closure-approved";

export interface ProgramLifecycleGate {
  readonly id: ProgramLifecycleGateId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface ProgramLifecycleEvidence {
  readonly currentStatus: GovernanceProgramStatus;
  readonly targetStatus: GovernanceProgramStatus;
  readonly gates: readonly ProgramLifecycleGate[];
  readonly gateCount: number;
  readonly requiredGateCount: number;
  readonly readyGateCount: number;
  readonly transitionAllowed: boolean;
  readonly ready: boolean;
}

const GOVERNANCE_PROGRAM_STATUSES: readonly GovernanceProgramStatus[] =
  Object.freeze([
    "PLANNED",
    "ACTIVE",
    "COMPLETE",
  ]);

const PROGRAM_LIFECYCLE_GATE_IDS: readonly ProgramLifecycleGateId[] =
  Object.freeze([
    "program-board-approval",
    "charter-active",
    "dependencies-complete",
    "mission-orders-complete",
    "campaigns-closed",
    "tests-pass",
    "certification-go",
    "closure-approved",
  ]);

const PROGRAM_LIFECYCLE_REQUIRED_BY_TARGET: Readonly<
  Record<GovernanceProgramStatus, readonly ProgramLifecycleGateId[]>
> = Object.freeze({
  PLANNED: Object.freeze([]),
  ACTIVE: Object.freeze([
    "program-board-approval",
    "charter-active",
    "dependencies-complete",
  ]),
  COMPLETE: PROGRAM_LIFECYCLE_GATE_IDS,
});

export function createProgramLifecycleGate(
  id: ProgramLifecycleGateId,
  ready: boolean,
  evidenceReference: string,
): ProgramLifecycleGate {
  assertProgramLifecycleGateId(id);
  assertNormalizedReferenceValue(evidenceReference, "PGOV-LIFE-005");

  return Object.freeze({
    id,
    ready,
    evidenceReference,
  });
}

export function createProgramLifecycleGates(
  gates: readonly ProgramLifecycleGate[],
): readonly ProgramLifecycleGate[] {
  assertProgramLifecycleGates(gates);

  return Object.freeze(
    PROGRAM_LIFECYCLE_GATE_IDS
      .filter((gateId) => gates.some((gate) => gate.id === gateId))
      .map((gateId) => {
        const gate = gates.find((candidate) => candidate.id === gateId);

        if (gate === undefined) {
          throw new Error(
            "PGOV-LIFE-006: Program Lifecycle could not preserve deterministic gate ordering.",
          );
        }

        return createProgramLifecycleGate(
          gate.id,
          gate.ready,
          gate.evidenceReference,
        );
      }),
  );
}

export function verifyProgramLifecycleTransition(
  currentStatus: GovernanceProgramStatus,
  targetStatus: GovernanceProgramStatus,
  gates: readonly ProgramLifecycleGate[],
): ProgramLifecycleEvidence {
  assertGovernanceProgramStatus(currentStatus);
  assertGovernanceProgramStatus(targetStatus);

  const orderedGates = createProgramLifecycleGates(gates);
  const requiredGateIds = PROGRAM_LIFECYCLE_REQUIRED_BY_TARGET[targetStatus];
  const readyGateCount = requiredGateIds
    .filter((gateId) => orderedGates.some((gate) => gate.id === gateId && gate.ready))
    .length;
  const transitionAllowed = isProgramLifecycleTransitionAllowed(currentStatus, targetStatus);
  const ready =
    transitionAllowed &&
    requiredGateIds.length > 0 &&
    readyGateCount === requiredGateIds.length;

  return Object.freeze({
    currentStatus,
    targetStatus,
    gates: orderedGates,
    gateCount: orderedGates.length,
    requiredGateCount: requiredGateIds.length,
    readyGateCount,
    transitionAllowed,
    ready,
  });
}

function isProgramLifecycleTransitionAllowed(
  currentStatus: GovernanceProgramStatus,
  targetStatus: GovernanceProgramStatus,
): boolean {
  return (
    (currentStatus === "PLANNED" && targetStatus === "ACTIVE") ||
    (currentStatus === "ACTIVE" && targetStatus === "COMPLETE")
  );
}

function assertProgramLifecycleGates(
  gates: readonly ProgramLifecycleGate[],
): void {
  const seen = new Set<string>();

  for (const gate of gates) {
    createProgramLifecycleGate(
      gate.id,
      gate.ready,
      gate.evidenceReference,
    );

    if (seen.has(gate.id)) {
      throw new Error(
        "PGOV-LIFE-003: Program Lifecycle rejects duplicate lifecycle gates.",
      );
    }

    seen.add(gate.id);
  }
}

function assertGovernanceProgramStatus(
  value: string,
): asserts value is GovernanceProgramStatus {
  if (!GOVERNANCE_PROGRAM_STATUSES.includes(value as GovernanceProgramStatus)) {
    throw new Error(
      "PGOV-LIFE-001: Program Lifecycle rejects unknown program statuses.",
    );
  }
}

function assertProgramLifecycleGateId(
  value: string,
): asserts value is ProgramLifecycleGateId {
  if (!PROGRAM_LIFECYCLE_GATE_IDS.includes(value as ProgramLifecycleGateId)) {
    throw new Error(
      "PGOV-LIFE-002: Program Lifecycle rejects unknown lifecycle gates.",
    );
  }
}

function assertNormalizedReferenceValue(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Program Lifecycle rejects empty or non-normalized reference values.`,
    );
  }
}
