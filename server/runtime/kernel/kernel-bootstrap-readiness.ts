import {
  KERNEL_BOOTSTRAP_IS_SERVICE,
  KERNEL_SERVICE_COUNT,
  isKernelServiceId,
  normalizeKernelServiceId,
} from "./kernel-service-catalog";
import type { KernelServiceId } from "./kernel-service-catalog";

export type KernelBootstrapReadinessPhaseId =
  | "B-001"
  | "B-002"
  | "B-003"
  | "B-004"
  | "B-005"
  | "B-006"
  | "B-007"
  | "B-008";

interface KernelBootstrapReadinessPhaseDefinition {
  readonly phaseId: KernelBootstrapReadinessPhaseId;
  readonly serviceIds: readonly string[];
}

export interface KernelBootstrapReadinessPhaseEvidence {
  readonly phaseId: KernelBootstrapReadinessPhaseId;
  readonly serviceIds: readonly KernelServiceId[];
}

export interface KernelBootstrapBoundaryEvidence {
  readonly osSemanticsStarted: false;
  readonly externalApiCreated: false;
  readonly kernelPrimitiveCreated: false;
  readonly bootstrapPrimitiveCreated: false;
}

const KERNEL_BOOTSTRAP_READINESS_ORDER: readonly KernelBootstrapReadinessPhaseDefinition[] = Object.freeze([
  Object.freeze({
    phaseId: "B-001",
    serviceIds: Object.freeze(["configuration", "logging", "clock"]),
  }),
  Object.freeze({
    phaseId: "B-002",
    serviceIds: Object.freeze(["clock", "configuration"]),
  }),
  Object.freeze({
    phaseId: "B-003",
    serviceIds: Object.freeze(["resource-management", "configuration", "logging"]),
  }),
  Object.freeze({
    phaseId: "B-004",
    serviceIds: Object.freeze(["dependency-injection", "configuration", "logging"]),
  }),
  Object.freeze({
    phaseId: "B-005",
    serviceIds: Object.freeze(["storage", "persistence", "logging"]),
  }),
  Object.freeze({
    phaseId: "B-006",
    serviceIds: Object.freeze(["messaging", "clock", "logging"]),
  }),
  Object.freeze({
    phaseId: "B-007",
    serviceIds: Object.freeze(["runtime", "scheduler", "lifecycle", "clock", "logging"]),
  }),
  Object.freeze({
    phaseId: "B-008",
    serviceIds: Object.freeze(["logging", "clock", "persistence", "storage"]),
  }),
]);

export interface KernelBootstrapReadinessEvidence {
  readonly catalogServiceCount: number;
  readonly bootstrapIsService: false;
  readonly readinessOrder: readonly KernelBootstrapReadinessPhaseEvidence[];
  readonly boundaryEvidence: KernelBootstrapBoundaryEvidence;
}

export function createKernelBootstrapReadinessEvidence(): KernelBootstrapReadinessEvidence {
  return Object.freeze({
    catalogServiceCount: KERNEL_SERVICE_COUNT,
    bootstrapIsService: KERNEL_BOOTSTRAP_IS_SERVICE,
    readinessOrder: createKernelBootstrapReadinessOrderEvidence(),
    boundaryEvidence: createKernelBootstrapBoundaryEvidence(),
  });
}

export function assertKernelBootstrapBaseline(): KernelBootstrapReadinessEvidence {
  if (KERNEL_SERVICE_COUNT !== 11) {
    throw new Error(
      "KBOOT-001: Kernel service catalog must contain exactly 11 services."
    );
  }

  if (KERNEL_BOOTSTRAP_IS_SERVICE) {
    throw new Error(
      "KBOOT-002: Bootstrap must never be registered as a Kernel service."
    );
  }

  const evidence = createKernelBootstrapReadinessEvidence();

  if (evidence.catalogServiceCount !== KERNEL_SERVICE_COUNT) {
    throw new Error(
      "KBOOT-003: Bootstrap readiness evidence is inconsistent with the Kernel service catalog."
    );
  }

  assertKernelBootstrapReadinessOrder(evidence);
  assertKernelBootstrapBoundaryEvidence(evidence);

  return evidence;
}

function createKernelBootstrapReadinessOrderEvidence(): readonly KernelBootstrapReadinessPhaseEvidence[] {
  const coveredServiceIds = new Set<KernelServiceId>();

  const readinessOrder = KERNEL_BOOTSTRAP_READINESS_ORDER.map((phase) => {
    const serviceIds = phase.serviceIds.map((serviceId) => {
      const normalizedServiceId = normalizeKernelServiceId(serviceId);

      if (normalizedServiceId === "bootstrap") {
        throw new Error(
          "KBOOT-005: Bootstrap must remain readiness ordering, not a Kernel primitive."
        );
      }

      if (!isKernelServiceId(normalizedServiceId)) {
        throw new Error(
          "KBOOT-004: Kernel bootstrap readiness requires only authorized Kernel primitives."
        );
      }

      coveredServiceIds.add(normalizedServiceId);
      return normalizedServiceId;
    });

    return Object.freeze({
      phaseId: phase.phaseId,
      serviceIds: Object.freeze(serviceIds),
    });
  });

  if (coveredServiceIds.size !== KERNEL_SERVICE_COUNT) {
    throw new Error(
      "KBOOT-004: Kernel bootstrap readiness order must cover exactly the authorized Kernel service catalog."
    );
  }

  return Object.freeze(readinessOrder);
}

function createKernelBootstrapBoundaryEvidence(): KernelBootstrapBoundaryEvidence {
  return Object.freeze({
    osSemanticsStarted: false as const,
    externalApiCreated: false as const,
    kernelPrimitiveCreated: false as const,
    bootstrapPrimitiveCreated: false as const,
  });
}

function assertKernelBootstrapReadinessOrder(evidence: KernelBootstrapReadinessEvidence): void {
  const expectedPhaseIds: readonly KernelBootstrapReadinessPhaseId[] = Object.freeze([
    "B-001",
    "B-002",
    "B-003",
    "B-004",
    "B-005",
    "B-006",
    "B-007",
    "B-008",
  ]);

  if (evidence.readinessOrder.length !== expectedPhaseIds.length) {
    throw new Error(
      "KBOOT-003: Bootstrap readiness evidence must preserve the complete readiness order."
    );
  }

  for (const [index, expectedPhaseId] of expectedPhaseIds.entries()) {
    const phase = evidence.readinessOrder[index];

    if (phase.phaseId !== expectedPhaseId) {
      throw new Error(
        "KBOOT-003: Bootstrap readiness evidence must preserve deterministic phase ordering."
      );
    }

    if (phase.serviceIds.length === 0) {
      throw new Error(
        "KBOOT-004: Kernel bootstrap readiness phases must reference authorized Kernel primitives."
      );
    }

    for (const serviceId of phase.serviceIds) {
      const normalizedServiceId = normalizeKernelServiceId(serviceId);

      if (normalizedServiceId === "bootstrap") {
        throw new Error(
          "KBOOT-005: Bootstrap must remain readiness ordering, not a Kernel primitive."
        );
      }

      if (!isKernelServiceId(normalizedServiceId)) {
        throw new Error(
          "KBOOT-004: Kernel bootstrap readiness phases must reference only authorized Kernel primitives."
        );
      }
    }
  }
}

function assertKernelBootstrapBoundaryEvidence(evidence: KernelBootstrapReadinessEvidence): void {
  const boundaryEvidence: Readonly<Record<keyof KernelBootstrapBoundaryEvidence, boolean>> = evidence.boundaryEvidence;

  if (boundaryEvidence.osSemanticsStarted) {
    throw new Error(
      "KBOOT-002: Kernel bootstrap readiness must not start Operating System semantics."
    );
  }

  if (boundaryEvidence.externalApiCreated) {
    throw new Error(
      "KBOOT-002: Kernel bootstrap readiness must not create an external API or contract."
    );
  }

  if (boundaryEvidence.kernelPrimitiveCreated) {
    throw new Error(
      "KBOOT-004: Kernel bootstrap readiness must stop before creating a new Kernel primitive."
    );
  }

  if (boundaryEvidence.bootstrapPrimitiveCreated) {
    throw new Error(
      "KBOOT-005: Bootstrap must not be created as a Kernel primitive."
    );
  }
}

export interface KernelBootstrapVerificationResult {
  readonly passed: true;
  readonly evidence: KernelBootstrapReadinessEvidence;
}

export function verifyKernelBootstrapReadiness(): KernelBootstrapVerificationResult {
  const evidence = assertKernelBootstrapBaseline();

  return Object.freeze({
    passed: true as const,
    evidence,
  });
}

export type KernelBootstrapReadinessErrorCode =
  | "KBOOT_004_UNKNOWN_KERNEL_PRIMITIVE"
  | "KBOOT_005_BOOTSTRAP_PRIMITIVE";

export interface KernelBootstrapReadinessError extends Error {
  readonly code: KernelBootstrapReadinessErrorCode;
  readonly requestedPrimitive: string;
}

export function requireKernelBootstrapReadinessPrimitive(value: string): KernelServiceId {
  const normalizedServiceId = normalizeKernelServiceId(value);

  if (normalizedServiceId === "bootstrap") {
    throw kernelBootstrapReadinessError(
      "KBOOT_005_BOOTSTRAP_PRIMITIVE",
      value,
      "KBOOT-005: Bootstrap must not be requested as a Kernel primitive."
    );
  }

  if (!isKernelServiceId(normalizedServiceId)) {
    throw kernelBootstrapReadinessError(
      "KBOOT_004_UNKNOWN_KERNEL_PRIMITIVE",
      value,
      "KBOOT-004: Unknown Kernel primitive requested during bootstrap readiness."
    );
  }

  return normalizedServiceId;
}

function kernelBootstrapReadinessError(
  code: KernelBootstrapReadinessErrorCode,
  requestedPrimitive: string,
  message: string,
): KernelBootstrapReadinessError {
  const error = new Error(message) as KernelBootstrapReadinessError;
  Object.defineProperty(error, "name", { value: "KernelBootstrapReadinessError" });
  Object.defineProperty(error, "code", { value: code, enumerable: true });
  Object.defineProperty(error, "requestedPrimitive", { value: requestedPrimitive, enumerable: true });
  return error;
}
