import assert from "node:assert/strict";
import { mkdtemp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import {
  assertScopeContainment,
  isCanonicalPathWithin,
  normalizeScopeEntry,
  scopesOverlap,
  stableIdentitySlug,
  validateScopePayload,
} from "./scope-validation.js";

test("directory scopes become recursive and separators are canonical", async () => {
  const root = await mkdtemp(join(process.env.TEMP ?? ".", "nova-scope-"));
  await mkdir(join(root, "server", "nova-core"), { recursive: true });
  assert.equal(normalizeScopeEntry("server\\nova-core", root), "server/nova-core/**");
  assert.equal(normalizeScopeEntry("./server/nova-core/**"), "server/nova-core/**");
});

test("canonical containment respects sibling boundaries", () => {
  assert.equal(isCanonicalPathWithin("C:/repo", "C:/repo/server/file.ts"), true);
  assert.equal(isCanonicalPathWithin("C:/repo", "C:/repository/file.ts"), false);
  assert.throws(() => assertScopeContainment("C:/repo", "../secrets"));
});

test("scope overlap is parent/child and segment aware", () => {
  assert.equal(scopesOverlap("server/nova-core/**", "server/nova-core/http.ts"), true);
  assert.equal(scopesOverlap("server/nova-core", "server/nova-core-extra"), false);
  assert.equal(scopesOverlap("a/*.ts", "a/b.ts"), true);
  assert.equal(scopesOverlap("Server/Nova-Core/**", "server/nova-core/http.ts"), process.platform === "win32");
  assert.equal(scopesOverlap("server\\nova-core\\.\\http\\..\\**", "server/nova-core/file.ts"), true);
  assert.equal(scopesOverlap("C:\\DEV\\NOVA", "c:\\dev\\nova"), process.platform === "win32");
  assert.equal(scopesOverlap("C:\\DEV\\NOVA", "C:\\DEV\\NOVA-OLD"), false);
  assert.equal(scopesOverlap("server/a/file-a.ts", "server/a/file-b.ts"), false);
});

test("allowed and forbidden conflicts are rejected by versioned schema", () => {
  assert.throws(() => validateScopePayload({ version: 1, allowed: ["server/nova-core"], forbidden: ["server/nova-core/private"] }));
  const valid = validateScopePayload({ version: 1, allowed: ["server/nova-core"], forbidden: ["secrets"] });
  assert.deepEqual(valid.payload.allowed, ["server/nova-core"]);
});

test("identity slug stays readable while avoiding collisions", () => {
  const first = stableIdentitySlug("Mission/Review", "project-a:mission-1");
  const second = stableIdentitySlug("Mission/Review", "project-a:mission-2");
  assert.match(first, /^mission-review-[0-9a-f]{12}$/);
  assert.notEqual(first, second);
});
