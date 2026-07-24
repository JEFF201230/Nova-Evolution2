import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createKernelReadinessGateEvidence,
  verifyKernelReadinessGate,
} from "./kernel-readiness-gate.js";
import type {
  KernelReadinessGateControlCode,
  KernelReadinessGateControlResult,
  KernelReadinessGateEvidence,
  KernelReadinessGateResult,
} from "./kernel-readiness-gate.js";

type KernelReadinessGateDecisionControlCode = Exclude<
  KernelReadinessGateControlCode,
  "KRG-005"
>;

const EXPECTED_CONTROL_CODES: readonly KernelReadinessGateDecisionControlCode[] =
  Object.freeze([
    "KRG-001",
    "KRG-002",
    "KRG-003",
    "KRG-004",
  ]);

const EXPECTED_CONTROL_MESSAGES: Readonly<
  Record<KernelReadinessGateDecisionControlCode, string>
> = Object.freeze({
  "KRG-001": "Kernel Readiness Gate requires the closed eleven-service Kernel catalog.",
  "KRG-002":
    "Kernel Readiness Gate requires Bootstrap to remain a non-service readiness concern.",
  "KRG-003":
    "Kernel Readiness Gate requires deterministic bootstrap readiness ordering evidence.",
  "KRG-004": "Kernel Readiness Gate requires Kernel boundary evidence to remain closed.",
});

const EXPECTED_RESULT_KEYS = Object.freeze([
  "passed",
  "decision",
  "evidence",
  "controls",
]);

const EXPECTED_EVIDENCE_KEYS = Object.freeze([
  "bootstrap",
  "prerequisites",
  "controls",
  "decision",
  "ready",
]);

const EXPECTED_PREREQUISITE_KEYS = Object.freeze([
  "bootstrapReadinessVerified",
  "closedCatalogVerified",
  "bootstrapNonServiceVerified",
  "readinessOrderVerified",
  "boundaryVerified",
]);

test("Kernel readiness gate returns a deterministic READY decision", () => {
  const result = verifyKernelReadinessGate();
  const evidence = requireReadyEvidence(result);

  assert.equal(result.passed, true);
  assert.equal(result.decision, "READY");
  assert.equal(result.controls, evidence.controls);
  assert.equal(evidence.ready, true);
  assert.equal(evidence.decision, "READY");
  assert.deepEqual(Object.keys(result), EXPECTED_RESULT_KEYS);
  assert.deepEqual(Object.keys(evidence), EXPECTED_EVIDENCE_KEYS);
  assert.deepEqual(Object.keys(evidence.prerequisites), EXPECTED_PREREQUISITE_KEYS);
});

test("Kernel readiness gate validates controls KRG-001 through KRG-004", () => {
  const result = verifyKernelReadinessGate();
  const evidence = requireReadyEvidence(result);

  assertDecisionControls(evidence.controls);

  assert.equal(
    evidence.prerequisites.closedCatalogVerified,
    requireDecisionControl(evidence.controls, "KRG-001").passed,
  );
  assert.equal(
    evidence.prerequisites.bootstrapNonServiceVerified,
    requireDecisionControl(evidence.controls, "KRG-002").passed,
  );
  assert.equal(
    evidence.prerequisites.readinessOrderVerified,
    requireDecisionControl(evidence.controls, "KRG-003").passed,
  );
  assert.equal(
    evidence.prerequisites.boundaryVerified,
    requireDecisionControl(evidence.controls, "KRG-004").passed,
  );
});

test("Kernel readiness gate aggregates coherent bootstrap readiness evidence", () => {
  const evidence = createKernelReadinessGateEvidence();

  assert.equal(evidence.bootstrap.catalogServiceCount, 11);
  assert.equal(evidence.bootstrap.bootstrapIsService, false);
  assert.equal(evidence.bootstrap.readinessOrder.length > 0, true);
  assert.deepEqual(evidence.bootstrap.boundaryEvidence, {
    osSemanticsStarted: false,
    externalApiCreated: false,
    kernelPrimitiveCreated: false,
    bootstrapPrimitiveCreated: false,
  });
  assert.equal(
    evidence.prerequisites.bootstrapReadinessVerified,
    evidence.controls.every((control) => control.passed),
  );
  assert.equal(evidence.prerequisites.closedCatalogVerified, true);
  assert.equal(evidence.prerequisites.bootstrapNonServiceVerified, true);
  assert.equal(evidence.prerequisites.readinessOrderVerified, true);
  assert.equal(evidence.prerequisites.boundaryVerified, true);

  for (const phase of evidence.bootstrap.readinessOrder) {
    assert.equal(phase.serviceIds.includes("bootstrap" as never), false);
  }
});

test("Kernel readiness gate evidence and result objects are frozen", () => {
  const result = verifyKernelReadinessGate();
  const evidence = requireReadyEvidence(result);

  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(evidence), true);
  assert.equal(Object.isFrozen(result.controls), true);
  assert.equal(Object.isFrozen(evidence.controls), true);
  assert.equal(Object.isFrozen(evidence.prerequisites), true);

  for (const control of evidence.controls) {
    assert.equal(Object.isFrozen(control), true);
  }
});

test("Kernel readiness gate is deterministic and regression-stable", () => {
  const firstResult = verifyKernelReadinessGate();
  const secondResult = verifyKernelReadinessGate();
  const firstEvidence = createKernelReadinessGateEvidence();
  const secondEvidence = createKernelReadinessGateEvidence();

  assert.deepEqual(firstResult, secondResult);
  assert.deepEqual(firstEvidence, secondEvidence);
  assertDecisionControls(requireReadyEvidence(firstResult).controls);
  assertDecisionControls(firstEvidence.controls);
});

test("Kernel readiness gate returns NOT_READY with KRG-005 for Error failures", () => {
  const result = withGateControlCodeMapFailure(
    new Error("forced readiness consolidation failure"),
    () => verifyKernelReadinessGate(),
  );

  assertNotReadyResult(result);
  assert.equal(result.controls[0]?.message, "forced readiness consolidation failure");
});

test("Kernel readiness gate returns deterministic NOT_READY for non-Error failures", () => {
  const result = withGateControlCodeMapFailure(
    "forced non-error readiness failure",
    () => verifyKernelReadinessGate(),
  );

  assertNotReadyResult(result);
  assert.equal(
    result.controls[0]?.message,
    "Kernel Readiness Gate could not verify bootstrap readiness.",
  );
});

test("Kernel readiness gate retains mandatory KRG-005 regression guards", () => {
  const source = readKernelReadinessGateSource();
  const requiredGuards = Object.freeze([
    "KRG-005: Kernel Readiness Gate rejects absent consolidated readiness evidence.",
    "KRG-005: Kernel Readiness Gate rejects unrecognized consolidated readiness evidence:",
    "KRG-005: Kernel Readiness Gate rejects duplicate consolidated readiness evidence:",
    "KRG-005: Kernel Readiness Gate rejects incomplete consolidated readiness evidence:",
    "KRG-005: Kernel Readiness Gate requires consolidated readiness evidence:",
    "KRG-005: Kernel Readiness Gate NOT_READY decisions require at least one deterministic cause.",
    "KRG-005: Kernel Readiness Gate report is incomplete or contradictory.",
    "KRG-005: Kernel Readiness Gate final decision must be READY or NOT_READY.",
    "KRG-005: Kernel Readiness Gate final decision contradicts deterministic decision state.",
    "KRG-005: Kernel Readiness Gate READY decisions cannot contain failure causes.",
    "KRG-005: Kernel Readiness Gate NOT_READY decisions require deterministic failure causes.",
    "KRG-005: Kernel Readiness Gate final evidence must be coherent.",
  ]);

  for (const guard of requiredGuards) {
    assert.equal(source.includes(guard), true, guard);
  }
});

function requireReadyEvidence(
  result: KernelReadinessGateResult,
): KernelReadinessGateEvidence {
  assert.equal(result.passed, true);
  assert.equal(result.decision, "READY");
  assert.notEqual(result.evidence, null);

  return result.evidence as KernelReadinessGateEvidence;
}

function assertDecisionControls(
  controls: readonly KernelReadinessGateControlResult[],
): void {
  assert.deepEqual(
    controls.map((control) => control.code),
    EXPECTED_CONTROL_CODES,
  );

  for (const code of EXPECTED_CONTROL_CODES) {
    const control = requireDecisionControl(controls, code);

    assert.equal(control.passed, true);
    assert.equal(control.message, EXPECTED_CONTROL_MESSAGES[code]);
  }
}

function requireDecisionControl(
  controls: readonly KernelReadinessGateControlResult[],
  code: KernelReadinessGateDecisionControlCode,
): KernelReadinessGateControlResult {
  const control = controls.find((candidate) => candidate.code === code);

  assert.notEqual(control, undefined, code);

  return control as KernelReadinessGateControlResult;
}

function assertNotReadyResult(result: KernelReadinessGateResult): void {
  assert.equal(result.passed, false);
  assert.equal(result.decision, "NOT_READY");
  assert.equal(result.evidence, null);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.controls), true);
  assert.deepEqual(result.controls, [
    {
      code: "KRG-005",
      passed: false,
      message: result.controls[0]?.message,
    },
  ]);
  assert.equal(result.controls[0]?.code, "KRG-005");
  assert.equal(result.controls[0]?.passed, false);
  assert.equal(Object.isFrozen(result.controls[0]), true);
}

function withGateControlCodeMapFailure<T>(failure: unknown, action: () => T): T {
  const originalMap = Array.prototype.map;

  Object.defineProperty(Array.prototype, "map", {
    configurable: true,
    writable: true,
    value: function patchedMap(
      this: unknown[],
      callback: unknown,
      thisArg?: unknown,
    ): unknown[] {
      if (
        Array.isArray(this) &&
        this.length === EXPECTED_CONTROL_CODES.length &&
        EXPECTED_CONTROL_CODES.every((code, index) => this[index] === code)
      ) {
        throw failure;
      }

      return Reflect.apply(originalMap, this, [callback, thisArg]) as unknown[];
    },
  });

  try {
    return action();
  } finally {
    Object.defineProperty(Array.prototype, "map", {
      configurable: true,
      writable: true,
      value: originalMap,
    });
  }
}

function readKernelReadinessGateSource(): string {
  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "kernel-readiness-gate.ts"),
    "utf8",
  );
}
