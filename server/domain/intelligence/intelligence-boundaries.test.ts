import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

test("product implementation has no CEREBRAU, Synthesis, Confidence, WCF-008 or command dependency", async () => {
  const names = (await readdir(import.meta.dirname)).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts") && !name.startsWith("intelligence-confidence"));
  const sources = await Promise.all(names.map((name) => readFile(join(import.meta.dirname, name), "utf8")));
  const product = sources.join("\n").toLowerCase();
  assert.equal(product.includes("cerebrau"), false);
  assert.equal(product.includes("synthesis"), false);
  assert.equal(product.includes("confidence"), false);
  assert.equal(product.includes("wcf-008"), false);
  assert.equal(product.includes("actionsinternalcommands"), false);
  assert.equal(product.includes("planningauthority"), false);
  assert.equal(product.includes("evidenceauthority"), false);
  assert.equal(product.includes("businesscertificationauthority"), false);
});
