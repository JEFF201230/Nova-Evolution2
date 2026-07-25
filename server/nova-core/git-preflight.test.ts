import assert from "node:assert/strict";
import test from "node:test";
import { assertStableGitPreflight, GitPreflightError, inspectGitPreflight } from "./git-preflight.js";
import type { NovaCoreCommandRunner } from "./nova-core.execution.js";

test("preflight validates version, worktree, top-level, HEAD, branch and submodules", async () => {
  const root = process.cwd();
  const calls: string[] = [];
  const runner: NovaCoreCommandRunner = async (_command, args) => {
    const key = args.join(" ");
    calls.push(key);
    if (key === "--version") return ok("git version 2.50.1\n");
    if (key === "rev-parse --is-inside-work-tree") return ok("true\n");
    if (key === "rev-parse --show-toplevel") return ok(`${root}\n`);
    if (key === "rev-parse --verify HEAD") return ok(`${"a".repeat(40)}\n`);
    if (key === "symbolic-ref --quiet --short HEAD") return ok("main\n");
    if (key === "status --porcelain=v1 --untracked-files=all") return ok(" M server/runtime.ts\n");
    if (key === "submodule status --recursive") return ok("");
    return fail("unexpected");
  };

  const result = await inspectGitPreflight(root, runner);
  assert.equal(result.branch, "main");
  assert.equal(result.head, "a".repeat(40));
  assert.equal(calls.length, 7);
  assertStableGitPreflight(result, { ...result });
});

test("preflight rejects detached, unborn and drifting repositories", async () => {
  const root = process.cwd();
  const base: NovaCoreCommandRunner = async (_command, args) => {
    const key = args.join(" ");
    if (key === "--version") return ok("git version 2.50.1\n");
    if (key === "rev-parse --is-inside-work-tree") return ok("true\n");
    if (key === "rev-parse --show-toplevel") return ok(`${root}\n`);
    if (key === "rev-parse --verify HEAD") return ok(`${"b".repeat(40)}\n`);
    if (key === "symbolic-ref --quiet --short HEAD") return fail("");
    return ok("");
  };
  await assert.rejects(() => inspectGitPreflight(root, base), (error) =>
    error instanceof GitPreflightError && error.code === "NOVA_CORE_GIT_DETACHED_HEAD");

  const unborn: NovaCoreCommandRunner = async (_command, args) => {
    const key = args.join(" ");
    if (key === "--version") return ok("git version 2.50.1\n");
    if (key === "rev-parse --is-inside-work-tree") return ok("true\n");
    if (key === "rev-parse --show-toplevel") return ok(`${root}\n`);
    if (key === "rev-parse --verify HEAD") return fail("Needed a single revision");
    return ok("");
  };
  await assert.rejects(() => inspectGitPreflight(root, unborn), (error) =>
    error instanceof GitPreflightError && error.code === "NOVA_CORE_GIT_UNBORN_HEAD");

  const invalidSubmodule: NovaCoreCommandRunner = async (_command, args) => {
    const key = args.join(" ");
    if (key === "--version") return ok("git version 2.50.1\n");
    if (key === "rev-parse --is-inside-work-tree") return ok("true\n");
    if (key === "rev-parse --show-toplevel") return ok(`${root}\n`);
    if (key === "rev-parse --verify HEAD") return ok(`${"c".repeat(40)}\n`);
    if (key === "symbolic-ref --quiet --short HEAD") return ok("main\n");
    if (key === "status --porcelain=v1 --untracked-files=all") return ok("");
    if (key === "submodule status --recursive") return ok(`-${"d".repeat(40)} vendor/module\n`);
    return fail("unexpected");
  };
  await assert.rejects(() => inspectGitPreflight(root, invalidSubmodule), (error) =>
    error instanceof GitPreflightError && error.code === "NOVA_CORE_GIT_SUBMODULE_INVALID");

  const stable = {
    gitVersion: "git version 2.50.1",
    topLevel: root,
    branch: "main",
    head: "a".repeat(40),
    worktreeStatus: "",
    worktreeFingerprint: "one",
    submodules: [],
  };
  assert.throws(
    () => assertStableGitPreflight(stable, { ...stable, head: "b".repeat(40) }),
    /état Git a changé/,
  );
});

function ok(stdout: string) {
  return { exitCode: 0, stdout, stderr: "" };
}

function fail(stderr: string) {
  return { exitCode: 1, stdout: "", stderr };
}
