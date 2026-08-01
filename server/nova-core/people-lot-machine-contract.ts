export type PeopleLotMachineCondition = Readonly<{
  code: string;
  statement: string;
}>;

export type PeopleLotMachineError = Readonly<{
  code: string;
  condition: string;
}>;

export interface PeopleLotMachineContract {
  readonly schemaVersion: "1.0.0";
  readonly kind: "DOMAIN_LOT_MACHINE_CONTRACT";
  readonly domainId: "PEOPLE";
  readonly lotId: "P3-PEOPLE-001D";
  readonly previousLotId: "P3-PEOPLE-001C";
  readonly nextAuthorizedLotId: "P3-PEOPLE-001E";
  readonly certificationStatus: "PENDING_EVIDENCE";
  readonly implementationContractPath:
    "Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md";
  readonly certificationPath:
    "Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json";
  readonly input: Readonly<{
    contract: "RuntimeExecutionContract";
    requiredFields: readonly [
      "missionBrief",
      "executionContext",
      "authorityDecision",
      "validationStatus",
      "pipelineTrace",
      "requestMetadata",
    ];
  }>;
  readonly output: Readonly<{
    contract: "PeopleLotRuntimeExecutionContract";
    requiredFields: readonly [
      "domainId",
      "lotId",
      "machineContract",
      "runtimeExecutionContract",
    ];
  }>;
  readonly preconditions: readonly PeopleLotMachineCondition[];
  readonly postconditions: readonly PeopleLotMachineCondition[];
  readonly invariants: readonly PeopleLotMachineCondition[];
  readonly errors: readonly PeopleLotMachineError[];
}

function conditions(
  values: readonly PeopleLotMachineCondition[],
): readonly PeopleLotMachineCondition[] {
  return Object.freeze(values.map((value) => Object.freeze({ ...value })));
}

function errors(
  values: readonly PeopleLotMachineError[],
): readonly PeopleLotMachineError[] {
  return Object.freeze(values.map((value) => Object.freeze({ ...value })));
}

export const PEOPLE_LOT_MACHINE_CONTRACT: PeopleLotMachineContract =
  Object.freeze({
    schemaVersion: "1.0.0",
    kind: "DOMAIN_LOT_MACHINE_CONTRACT",
    domainId: "PEOPLE",
    lotId: "P3-PEOPLE-001D",
    previousLotId: "P3-PEOPLE-001C",
    nextAuthorizedLotId: "P3-PEOPLE-001E",
    certificationStatus: "PENDING_EVIDENCE",
    implementationContractPath:
      "Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md",
    certificationPath:
      "Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json",
    input: Object.freeze({
      contract: "RuntimeExecutionContract",
      requiredFields: Object.freeze([
        "missionBrief",
        "executionContext",
        "authorityDecision",
        "validationStatus",
        "pipelineTrace",
        "requestMetadata",
      ] as const),
    }),
    output: Object.freeze({
      contract: "PeopleLotRuntimeExecutionContract",
      requiredFields: Object.freeze([
        "domainId",
        "lotId",
        "machineContract",
        "runtimeExecutionContract",
      ] as const),
    }),
    preconditions: conditions([
      {
        code: "PEOPLE-LOT-PRE-001",
        statement: "P3-PEOPLE-001C is certified and authorizes P3-PEOPLE-001D.",
      },
      {
        code: "PEOPLE-LOT-PRE-002",
        statement: "RuntimeExecutionContract validationStatus is VALID.",
      },
      {
        code: "PEOPLE-LOT-PRE-003",
        statement: "Runtime mission, execution context and trace identify the same mission.",
      },
      {
        code: "PEOPLE-LOT-PRE-004",
        statement: "The resolved authority domain is PEOPLE.",
      },
      {
        code: "PEOPLE-LOT-PRE-005",
        statement: "Runtime mission and execution context identify P3-PEOPLE-001D.",
      },
    ]),
    postconditions: conditions([
      {
        code: "PEOPLE-LOT-POST-001",
        statement: "The adapted envelope identifies domain PEOPLE and lot P3-PEOPLE-001D.",
      },
      {
        code: "PEOPLE-LOT-POST-002",
        statement: "The RuntimeExecutionContract reference and contents are preserved.",
      },
      {
        code: "PEOPLE-LOT-POST-003",
        statement: "The adapted envelope is immutable and JSON serializable.",
      },
      {
        code: "PEOPLE-LOT-POST-004",
        statement: "Certification remains PENDING_EVIDENCE until evidence is certified.",
      },
    ]),
    invariants: conditions([
      {
        code: "PEOPLE-LOT-INV-001",
        statement: "The PEOPLE domain has no dependency on NOVA runtime contracts.",
      },
      {
        code: "PEOPLE-LOT-INV-002",
        statement: "The adapter is the only PEOPLE bridge that knows RuntimeExecutionContract.",
      },
      {
        code: "PEOPLE-LOT-INV-003",
        statement: "Domain, lot and certification continuity metadata are immutable.",
      },
      {
        code: "PEOPLE-LOT-INV-004",
        statement: "Adaptation does not execute or mutate PEOPLE domain behavior.",
      },
    ]),
    errors: errors([
      {
        code: "PLRCA-001",
        condition: "RuntimeExecutionContract is missing or malformed.",
      },
      {
        code: "PLRCA-002",
        condition: "RuntimeExecutionContract is not validated.",
      },
      {
        code: "PLRCA-003",
        condition: "RuntimeExecutionContract mission references are inconsistent.",
      },
      {
        code: "PLRCA-004",
        condition: "Resolved authority domain is not PEOPLE.",
      },
      {
        code: "PLRCA-005",
        condition: "Runtime lot is not P3-PEOPLE-001D.",
      },
      {
        code: "PLRCA-006",
        condition: "Adapted output is not JSON serializable.",
      },
    ]),
  });
