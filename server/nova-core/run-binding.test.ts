import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildRunBinding,
  canonicalJson,
  createRunIdentity,
  fingerprintReport,
  identitySlug,
  isReportBoundToRun,
  reportBindingMismatches,
  runDirectory,
} from "./run-binding.js";

test("canonical hashes are independent of object insertion order", () => {
  assert.equal(canonicalJson({ b: 2, a: 1 }), canonicalJson({ a: 1, b: 2 }));
  assert.equal(fingerprintReport({ b: 2, a: 1 }), fingerprintReport({ a: 1, b: 2 }));
});

test("identity slug remains readable while distinguishing colliding safe names", () => {
  assert.notEqual(identitySlug("a/b"), identitySlug("a\\b"));
  assert.match(identitySlug("project alpha"), /^project-alpha-/);
});

test("run identity and directory are deterministic for supplied run id", () => {
  const identity = createRunIdentity({ projectId: "P", missionId: "M", runId: "RUN-1", createdAt: "2026-01-01T00:00:00.000Z" });
  assert.equal(identity.runId, "RUN-1");
  assert.equal(identity.createdAt, "2026-01-01T00:00:00.000Z");
  assert.match(runDirectory(".nova-data", identity.runId), /runs[\\/]RUN-1$/);
});

test("binding rejects stale or altered reports", () => {
  const binding = buildRunBinding({
    projectId: "P",
    missionId: "M",
    runId: "RUN-1",
    prompt: "prompt",
    executionRequest: { profile: "BUILD" },
    manifest: { runId: "RUN-1" },
  });
  const expected = { ...binding };
  assert.equal(isReportBoundToRun(expected, expected), true);
  assert.deepEqual(reportBindingMismatches({ ...expected, runId: "RUN-old" }, expected), ["runId"]);
  assert.equal(isReportBoundToRun({ ...expected, manifestHash: "altered" }, expected), false);
});
