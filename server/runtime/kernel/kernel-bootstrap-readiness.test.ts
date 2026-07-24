import assert from "node:assert/strict";
import test from "node:test";
import {
  KERNEL_BOOTSTRAP_IS_SERVICE,
  KERNEL_SERVICE_COUNT,
  KERNEL_SERVICE_IDS,
  isKernelServiceId,
} from "./kernel-service-catalog.js";
import {
  assertKernelBootstrapBaseline,
  createKernelBootstrapReadinessEvidence,
  requireKernelBootstrapReadinessPrimitive,
  verifyKernelBootstrapReadiness,
} from "./kernel-bootstrap-readiness.js";
import type {
  KernelBootstrapReadinessError,
  KernelBootstrapReadinessPhaseId,
} from "./kernel-bootstrap-readiness.js";

const EXPECTED_PHASE_IDS: readonly KernelBootstrapReadinessPhaseId[] = Object.freeze([
  "B-001",
  "B-002",
  "B-003",
  "B-004",
  "B-005",
  "B-006",
  "B-007",
  "B-008",
]);

test("Kernel bootstrap readiness verifies the closed eleven-service catalog", () => {
  const evidence = assertKernelBootstrapBaseline();

  assert.equal(KERNEL_SERVICE_COUNT, 11);
  assert.equal(KERNEL_SERVICE_IDS.length, 11);
  assert.equal(new Set(KERNEL_SERVICE_IDS).size, 11);
  assert.equal(evidence.catalogServiceCount, 11);
});

test("Kernel bootstrap readiness preserves Bootstrap as a non-service", () => {
  const evidence = assertKernelBootstrapBaseline();

  assert.equal(KERNEL_BOOTSTRAP_IS_SERVICE, false);
  assert.equal(evidence.bootstrapIsService, false);
  assert.equal(KERNEL_SERVICE_IDS.includes("bootstrap" as never), false);
});

test("Kernel bootstrap readiness validates deterministic readiness phases over authorized primitives", () => {
  const evidence = assertKernelBootstrapBaseline();
  const coveredServiceIds = new Set<string>();

  assert.deepEqual(
    evidence.readinessOrder.map((phase) => phase.phaseId),
    EXPECTED_PHASE_IDS,
  );

  for (const phase of evidence.readinessOrder) {
    assert.ok(phase.serviceIds.length > 0);

    for (const serviceId of phase.serviceIds) {
      assert.notEqual(serviceId, "bootstrap");
      assert.equal(isKernelServiceId(serviceId), true);
      coveredServiceIds.add(serviceId);
    }
  }

  assert.equal(coveredServiceIds.size, KERNEL_SERVICE_COUNT);

  for (const serviceId of KERNEL_SERVICE_IDS) {
    assert.equal(coveredServiceIds.has(serviceId), true);
  }
});

test("Kernel bootstrap readiness evidence preserves boundary invariants", () => {
  const evidence = createKernelBootstrapReadinessEvidence();

  assert.deepEqual(evidence.boundaryEvidence, {
    osSemanticsStarted: false,
    externalApiCreated: false,
    kernelPrimitiveCreated: false,
    bootstrapPrimitiveCreated: false,
  });
});

test("Kernel bootstrap readiness verification is deterministic and regression-stable", () => {
  const first = verifyKernelBootstrapReadiness();
  const second = verifyKernelBootstrapReadiness();

  assert.equal(first.passed, true);
  assert.deepEqual(first, second);
  assert.deepEqual(Object.keys(first), ["passed", "evidence"]);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.evidence), true);
  assert.equal(Object.isFrozen(first.evidence.readinessOrder), true);

  for (const phase of first.evidence.readinessOrder) {
    assert.equal(Object.isFrozen(phase), true);
    assert.equal(Object.isFrozen(phase.serviceIds), true);
  }
});

test("Kernel bootstrap readiness accepts authorized primitives deterministically", () => {
  assert.equal(requireKernelBootstrapReadinessPrimitive("runtime"), "runtime");
  assert.equal(requireKernelBootstrapReadinessPrimitive(" Clock "), "clock");
  assert.equal(
    requireKernelBootstrapReadinessPrimitive("Dependency Injection"),
    "dependency-injection",
  );
});

test("Kernel bootstrap readiness rejects an unknown primitive deterministically", () => {
  assert.throws(
    () => requireKernelBootstrapReadinessPrimitive("mission-runtime"),
    (error: unknown) => {
      const readinessError = error as KernelBootstrapReadinessError;

      assert.equal(readinessError.name, "KernelBootstrapReadinessError");
      assert.equal(readinessError.code, "KBOOT_004_UNKNOWN_KERNEL_PRIMITIVE");
      assert.equal(readinessError.requestedPrimitive, "mission-runtime");
      assert.match(readinessError.message, /^KBOOT-004:/);
      return true;
    },
  );
});

test("Kernel bootstrap readiness rejects Bootstrap as a primitive deterministically", () => {
  assert.throws(
    () => requireKernelBootstrapReadinessPrimitive("Bootstrap"),
    (error: unknown) => {
      const readinessError = error as KernelBootstrapReadinessError;

      assert.equal(readinessError.name, "KernelBootstrapReadinessError");
      assert.equal(readinessError.code, "KBOOT_005_BOOTSTRAP_PRIMITIVE");
      assert.equal(readinessError.requestedPrimitive, "Bootstrap");
      assert.match(readinessError.message, /^KBOOT-005:/);
      return true;
    },
  );
});
