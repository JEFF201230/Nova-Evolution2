import assert from "node:assert/strict";
import test from "node:test";
import { missingDynamicValidations, validationsForChangedFiles } from "./validation-matrix.js";

test("validation suites are selected from files actually changed", () => {
  assert.deepEqual(
    validationsForChangedFiles([
      "server/nova-core/nova-core.http.ts",
      "apps\\nova-web\\src\\App.tsx",
      "Docs/README.md",
    ]).map((validation) => validation.name),
    ["nova-core-tests", "nova-core-typecheck", "nova-web-tests", "nova-web-typecheck", "nova-web-build"],
  );
});

test("missing required dynamic validations are reported", () => {
  const missing = missingDynamicValidations(
    ["tools/nova-core-runtime/Invoke-NovaCoreMission.ps1"],
    [{ Name: "nova-runtime-syntax", Passed: true, Required: true }],
  );
  assert.deepEqual(missing.map((validation) => validation.name), ["nova-runtime-e2e"]);
});
