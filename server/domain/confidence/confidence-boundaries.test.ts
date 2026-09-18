import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const implementationFiles = [
  "server/domain/confidence/confidence.authority.ts",
  "server/domain/confidence/confidence.journal.ts",
  "server/domain/confidence/confidence.queries.ts",
  "server/domain/confidence/confidence.types.ts",
  "server/domain/intelligence/intelligence-confidence.producer.ts",
];

test("Confidence has no operational, UI, CEREBRAU, VEEDDA, report, log, or fixture dependency", () => {
  const source = implementationFiles.map((path) => readFileSync(path, "utf8")).join("\n");
  for (const forbidden of ["domain/actions", "domain/planning", "domain/decisions", "nova-bff", "apps/", "cerebrau", "veedda", "mission-report", "runtime-diagnostic", ".fixture", ".log"]) {
    assert.equal(source.toLowerCase().includes(forbidden), false, `forbidden dependency: ${forbidden}`);
  }
  assert.equal(source.includes("Recommendation"), false);
});

test("adapter is read-only and Confidence is the sole authority", () => {
  const adapter = readFileSync("server/domain/intelligence/intelligence-confidence.producer.ts", "utf8");
  assert.equal(adapter.includes("append("), false); assert.equal(adapter.includes(".create("), false); assert.equal(adapter.includes(".revise("), false);
  const source = implementationFiles.map((path) => readFileSync(path, "utf8")).join("\n");
  assert.equal((source.match(/class ConfidenceAuthority/g) ?? []).length, 1);
});
