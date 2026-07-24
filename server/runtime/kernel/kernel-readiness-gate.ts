import {
  verifyKernelBootstrapReadiness,
} from "./kernel-bootstrap-readiness";
import type {
  KernelBootstrapReadinessEvidence,
} from "./kernel-bootstrap-readiness";

export type KernelReadinessGateDecision = "READY" | "NOT_READY";

export type KernelReadinessGateControlCode =
  | "KRG-001"
  | "KRG-002"
  | "KRG-003"
  | "KRG-004"
  | "KRG-005";

export interface KernelReadinessGateControlResult {
  readonly code: KernelReadinessGateControlCode;
  readonly passed: boolean;
  readonly message: string;
}

export interface KernelReadinessGatePrerequisiteEvidence {
  readonly bootstrapReadinessVerified: boolean;
  readonly closedCatalogVerified: boolean;
  readonly bootstrapNonServiceVerified: boolean;
  readonly readinessOrderVerified: boolean;
  readonly boundaryVerified: boolean;
}

export interface KernelReadinessGateEvidence {
  readonly bootstrap: KernelBootstrapReadinessEvidence;
  readonly prerequisites: KernelReadinessGatePrerequisiteEvidence;
  readonly controls: readonly KernelReadinessGateControlResult[];
  readonly decision: KernelReadinessGateDecision;
  readonly ready: boolean;
}

export function createKernelReadinessGateEvidence(): KernelReadinessGateEvidence {
  const bootstrapReadiness = verifyKernelBootstrapReadiness();
  const bootstrapEvidence = bootstrapReadiness.evidence;
  const controls = createConsolidatedKernelReadinessGateEvidence(
    createKernelReadinessGateControlResults(bootstrapEvidence),
  );
  const decisionState = createKernelReadinessGateDecisionState(controls);

  assertKernelReadinessGateDecisionState(decisionState);

  const evidence = createKernelReadinessGateAggregatedEvidence(
    bootstrapEvidence,
    controls,
    decisionState,
  );

  createKernelReadinessGateReport(evidence, decisionState);

  return validateFinalKernelReadinessGateEvidence(evidence, decisionState);
}

export interface KernelReadinessGateResult {
  readonly passed: boolean;
  readonly decision: KernelReadinessGateDecision;
  readonly evidence: KernelReadinessGateEvidence | null;
  readonly controls: readonly KernelReadinessGateControlResult[];
}

export function verifyKernelReadinessGate(): KernelReadinessGateResult {
  try {
    const evidence = createKernelReadinessGateEvidence();

    return Object.freeze({
      passed: evidence.ready,
      decision: evidence.decision,
      evidence,
      controls: evidence.controls,
    });
  } catch (error) {
    const controls = Object.freeze([
      Object.freeze({
        code: "KRG-005" as const,
        passed: false,
        message: kernelReadinessGateErrorMessage(error),
      }),
    ]);

    return Object.freeze({
      passed: false,
      decision: "NOT_READY" as const,
      evidence: null,
      controls,
    });
  }
}

interface KernelReadinessGateReadyDecisionState {
  readonly decision: "READY";
  readonly causes: readonly [];
}

interface KernelReadinessGateNotReadyDecisionState {
  readonly decision: "NOT_READY";
  readonly causes: readonly [
    KernelReadinessGateControlResult,
    ...KernelReadinessGateControlResult[],
  ];
}

type KernelReadinessGateDecisionState =
  | KernelReadinessGateReadyDecisionState
  | KernelReadinessGateNotReadyDecisionState;

function createKernelReadinessGateAggregatedEvidence(
  bootstrapEvidence: KernelBootstrapReadinessEvidence,
  controls: readonly KernelReadinessGateControlResult[],
  decisionState: KernelReadinessGateDecisionState,
): KernelReadinessGateEvidence {
  return Object.freeze({
    bootstrap: bootstrapEvidence,
    prerequisites: createKernelReadinessGatePrerequisiteEvidence(controls),
    controls,
    decision: decisionState.decision,
    ready: decisionState.decision === "READY",
  });
}

function createKernelReadinessGatePrerequisiteEvidence(
  controls: readonly KernelReadinessGateControlResult[],
): KernelReadinessGatePrerequisiteEvidence {
  return Object.freeze({
    bootstrapReadinessVerified: controls.every((control) => control.passed),
    closedCatalogVerified: controlPassed(controls, "KRG-001"),
    bootstrapNonServiceVerified: controlPassed(controls, "KRG-002"),
    readinessOrderVerified: controlPassed(controls, "KRG-003"),
    boundaryVerified: controlPassed(controls, "KRG-004"),
  });
}

function createKernelReadinessGateControlResults(
  evidence: KernelBootstrapReadinessEvidence,
): readonly KernelReadinessGateControlResult[] {
  const boundaryClosed =
    !evidence.boundaryEvidence.osSemanticsStarted &&
    !evidence.boundaryEvidence.externalApiCreated &&
    !evidence.boundaryEvidence.kernelPrimitiveCreated &&
    !evidence.boundaryEvidence.bootstrapPrimitiveCreated;

  return Object.freeze([
    Object.freeze({
      code: "KRG-001" as const,
      passed: evidence.catalogServiceCount === 11,
      message: "Kernel Readiness Gate requires the closed eleven-service Kernel catalog.",
    }),
    Object.freeze({
      code: "KRG-002" as const,
      passed: evidence.bootstrapIsService === false,
      message: "Kernel Readiness Gate requires Bootstrap to remain a non-service readiness concern.",
    }),
    Object.freeze({
      code: "KRG-003" as const,
      passed: evidence.readinessOrder.length > 0,
      message: "Kernel Readiness Gate requires deterministic bootstrap readiness ordering evidence.",
    }),
    Object.freeze({
      code: "KRG-004" as const,
      passed: boundaryClosed,
      message: "Kernel Readiness Gate requires Kernel boundary evidence to remain closed.",
    }),
  ]);
}

function createKernelReadinessGateDecisionState(
  controls: readonly KernelReadinessGateControlResult[],
): KernelReadinessGateDecisionState {
  const causes = controls.filter((control) => !control.passed);

  if (causes.length === 0) {
    return Object.freeze({
      decision: "READY" as const,
      causes: Object.freeze([]) as readonly [],
    });
  }

  assertKernelReadinessGateNotReadyCauses(causes);

  return Object.freeze({
    decision: "NOT_READY" as const,
    causes: Object.freeze(causes) as readonly [
      KernelReadinessGateControlResult,
      ...KernelReadinessGateControlResult[],
    ],
  });
}

function assertKernelReadinessGateNotReadyCauses(
  causes: readonly KernelReadinessGateControlResult[],
): asserts causes is readonly [
  KernelReadinessGateControlResult,
  ...KernelReadinessGateControlResult[],
] {
  if (causes.length === 0) {
    throw new Error(
      "KRG-005: Kernel Readiness Gate NOT_READY decisions require at least one deterministic cause.",
    );
  }
}

function assertKernelReadinessGateDecisionState(
  state: KernelReadinessGateDecisionState,
): void {
  if (state.decision === "NOT_READY") {
    assertKernelReadinessGateNotReadyCauses(state.causes);
  }
}

function controlPassed(
  controls: readonly KernelReadinessGateControlResult[],
  code: KernelReadinessGateControlCode,
): boolean {
  return controls.some((control) => control.code === code && control.passed);
}

function kernelReadinessGateErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Kernel Readiness Gate could not verify bootstrap readiness.";
}

type KernelReadinessGateDecisionControlCode = Exclude<KernelReadinessGateControlCode, "KRG-005">;

const KERNEL_READINESS_GATE_DECISION_CONTROL_CODES: readonly KernelReadinessGateDecisionControlCode[] = Object.freeze([
  "KRG-001",
  "KRG-002",
  "KRG-003",
  "KRG-004",
]);

function createConsolidatedKernelReadinessGateEvidence(
  controls: readonly KernelReadinessGateControlResult[],
): readonly KernelReadinessGateControlResult[] {
  const controlsByCode = new Map<KernelReadinessGateDecisionControlCode, KernelReadinessGateControlResult>();

  for (const control of controls) {
    if (control === undefined || control === null) {
      throw new Error(
        "KRG-005: Kernel Readiness Gate rejects absent consolidated readiness evidence.",
      );
    }

    if (!isKernelReadinessGateDecisionControlCode(control.code)) {
      throw new Error(
        `KRG-005: Kernel Readiness Gate rejects unrecognized consolidated readiness evidence: ${control.code}.`,
      );
    }

    if (controlsByCode.has(control.code)) {
      throw new Error(
        `KRG-005: Kernel Readiness Gate rejects duplicate consolidated readiness evidence: ${control.code}.`,
      );
    }

    if (typeof control.passed !== "boolean" || control.message.length === 0) {
      throw new Error(
        `KRG-005: Kernel Readiness Gate rejects incomplete consolidated readiness evidence: ${control.code}.`,
      );
    }

    controlsByCode.set(control.code, control);
  }

  const consolidatedControls = KERNEL_READINESS_GATE_DECISION_CONTROL_CODES.map((code) => {
    const control = controlsByCode.get(code);

    if (control === undefined) {
      throw new Error(
        `KRG-005: Kernel Readiness Gate requires consolidated readiness evidence: ${code}.`,
      );
    }

    return Object.freeze({
      code: control.code,
      passed: control.passed,
      message: control.message,
    });
  });

  return Object.freeze(consolidatedControls);
}

function isKernelReadinessGateDecisionControlCode(
  code: KernelReadinessGateControlCode,
): code is KernelReadinessGateDecisionControlCode {
  return (
    code === "KRG-001" ||
    code === "KRG-002" ||
    code === "KRG-003" ||
    code === "KRG-004"
  );
}

interface KernelReadinessGateReport {
  readonly finalState: KernelReadinessGateDecision;
  readonly consolidatedEvidence: KernelReadinessGateEvidence;
  readonly deterministicCauses: readonly KernelReadinessGateControlResult[];
  readonly selfConsistent: boolean;
}

function createKernelReadinessGateReport(
  evidence: KernelReadinessGateEvidence,
  decisionState: KernelReadinessGateDecisionState,
): KernelReadinessGateReport {
  const report = Object.freeze({
    finalState: decisionState.decision,
    consolidatedEvidence: evidence,
    deterministicCauses: createKernelReadinessGateReportCauses(
      evidence,
      decisionState,
    ),
    selfConsistent: kernelReadinessGateReportIsSelfConsistent(
      evidence,
      decisionState,
    ),
  });

  assertKernelReadinessGateReportValid(report);

  return report;
}

function createKernelReadinessGateReportCauses(
  evidence: KernelReadinessGateEvidence,
  decisionState: KernelReadinessGateDecisionState,
): readonly KernelReadinessGateControlResult[] {
  if (decisionState.decision === "READY") {
    return Object.freeze([...evidence.controls]);
  }

  return Object.freeze([...decisionState.causes]);
}

function assertKernelReadinessGateReportValid(
  report: KernelReadinessGateReport,
): void {
  if (
    !kernelReadinessGateReportIsComplete(report) ||
    report.finalState !== report.consolidatedEvidence.decision ||
    report.selfConsistent !== true ||
    !kernelReadinessGateReportIsSelfConsistent(
      report.consolidatedEvidence,
      createKernelReadinessGateDecisionState(report.consolidatedEvidence.controls),
    ) ||
    !kernelReadinessGateReportCausesAreConsistent(report)
  ) {
    throw new Error("KRG-005: Kernel Readiness Gate report is incomplete or contradictory.");
  }
}

function kernelReadinessGateReportIsComplete(
  report: KernelReadinessGateReport,
): boolean {
  const evidence = report.consolidatedEvidence;

  return (
    kernelReadinessGateDecisionIsValid(report.finalState) &&
    typeof evidence.bootstrap === "object" &&
    evidence.bootstrap !== null &&
    typeof evidence.prerequisites === "object" &&
    evidence.prerequisites !== null &&
    kernelReadinessGateReportControlsAreComplete(evidence.controls) &&
    report.deterministicCauses.length > 0
  );
}

function kernelReadinessGateReportIsSelfConsistent(
  evidence: KernelReadinessGateEvidence,
  decisionState: KernelReadinessGateDecisionState,
): boolean {
  const expectedPrerequisites =
    createKernelReadinessGatePrerequisiteEvidence(evidence.controls);

  return (
    evidence.decision === decisionState.decision &&
    evidence.ready === (decisionState.decision === "READY") &&
    evidence.prerequisites.bootstrapReadinessVerified ===
      expectedPrerequisites.bootstrapReadinessVerified &&
    evidence.prerequisites.closedCatalogVerified ===
      expectedPrerequisites.closedCatalogVerified &&
    evidence.prerequisites.bootstrapNonServiceVerified ===
      expectedPrerequisites.bootstrapNonServiceVerified &&
    evidence.prerequisites.readinessOrderVerified ===
      expectedPrerequisites.readinessOrderVerified &&
    evidence.prerequisites.boundaryVerified ===
      expectedPrerequisites.boundaryVerified
  );
}

function kernelReadinessGateReportCausesAreConsistent(
  report: KernelReadinessGateReport,
): boolean {
  const controls = report.consolidatedEvidence.controls;

  if (report.finalState === "READY") {
    return (
      report.deterministicCauses.length === controls.length &&
      report.deterministicCauses.every((cause) =>
        controls.some(
          (control) =>
            control.code === cause.code &&
            control.passed === true &&
            cause.passed === true &&
            cause.message === control.message,
        ),
      )
    );
  }

  const failedControls = controls.filter((control) => !control.passed);

  return (
    failedControls.length > 0 &&
    report.deterministicCauses.length === failedControls.length &&
    report.deterministicCauses.every((cause) =>
      failedControls.some(
        (control) =>
          control.code === cause.code &&
          cause.passed === false &&
          cause.message === control.message,
      ),
    )
  );
}

function kernelReadinessGateReportControlsAreComplete(
  controls: readonly KernelReadinessGateControlResult[],
): boolean {
  return (
    controls.length === KERNEL_READINESS_GATE_DECISION_CONTROL_CODES.length &&
    KERNEL_READINESS_GATE_DECISION_CONTROL_CODES.every((code) =>
      kernelReadinessGateReportControlAppearsOnce(controls, code),
    ) &&
    controls.every((control) => control.message.length > 0)
  );
}

function kernelReadinessGateReportControlAppearsOnce(
  controls: readonly KernelReadinessGateControlResult[],
  code: KernelReadinessGateDecisionControlCode,
): boolean {
  return controls.filter((control) => control.code === code).length === 1;
}

function kernelReadinessGateDecisionIsValid(
  decision: KernelReadinessGateDecision,
): boolean {
  return decision === "READY" || decision === "NOT_READY";
}

function validateFinalKernelReadinessGateEvidence(
  evidence: KernelReadinessGateEvidence,
  decisionState: KernelReadinessGateDecisionState,
): KernelReadinessGateEvidence {
  const finalDecision = evidence.decision;
  const failedControls = evidence.controls.filter((control) => !control.passed);
  const deterministicCauses = Object.freeze([...decisionState.causes]);

  if (!kernelReadinessGateDecisionIsValid(finalDecision)) {
    throw new Error(
      "KRG-005: Kernel Readiness Gate final decision must be READY or NOT_READY.",
    );
  }

  if (finalDecision !== decisionState.decision) {
    throw new Error(
      "KRG-005: Kernel Readiness Gate final decision contradicts deterministic decision state.",
    );
  }

  if (finalDecision === "READY" && (deterministicCauses.length > 0 || failedControls.length > 0)) {
    throw new Error(
      "KRG-005: Kernel Readiness Gate READY decisions cannot contain failure causes.",
    );
  }

  if (finalDecision === "NOT_READY" && (deterministicCauses.length === 0 || failedControls.length === 0)) {
    throw new Error(
      "KRG-005: Kernel Readiness Gate NOT_READY decisions require deterministic failure causes.",
    );
  }

  const prerequisites = createKernelReadinessGatePrerequisiteEvidence(evidence.controls);
  const ready = finalDecision === "READY";

  if (
    evidence.ready !== ready ||
    prerequisites.bootstrapReadinessVerified !== evidence.prerequisites.bootstrapReadinessVerified ||
    prerequisites.closedCatalogVerified !== evidence.prerequisites.closedCatalogVerified ||
    prerequisites.bootstrapNonServiceVerified !== evidence.prerequisites.bootstrapNonServiceVerified ||
    prerequisites.readinessOrderVerified !== evidence.prerequisites.readinessOrderVerified ||
    prerequisites.boundaryVerified !== evidence.prerequisites.boundaryVerified
  ) {
    throw new Error(
      "KRG-005: Kernel Readiness Gate final evidence must be coherent.",
    );
  }

  return Object.freeze({
    bootstrap: evidence.bootstrap,
    prerequisites,
    controls: Object.freeze(
      evidence.controls.map((control) =>
        Object.freeze({
          code: control.code,
          passed: control.passed,
          message: control.message,
        }),
      ),
    ),
    decision: finalDecision,
    ready,
  });
}
