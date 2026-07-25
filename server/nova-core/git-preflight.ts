import { createHash } from "node:crypto";
import { resolve } from "node:path";
import type { NovaCoreCommandResult, NovaCoreCommandRunner } from "./nova-core.execution.js";

export interface GitPreflight {
  gitVersion: string;
  topLevel: string;
  branch: string;
  head: string;
  worktreeStatus: string;
  worktreeFingerprint: string;
  submodules: string[];
}

export class GitPreflightError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly result?: NovaCoreCommandResult,
  ) {
    super(message);
    this.name = "GitPreflightError";
  }
}

export async function inspectGitPreflight(
  repositoryRoot: string,
  commandRunner: NovaCoreCommandRunner,
): Promise<GitPreflight> {
  const root = resolve(repositoryRoot);
  const version = await git(commandRunner, root, ["--version"], "NOVA_CORE_GIT_VERSION_UNAVAILABLE");
  if (!/^git version \d+\.\d+(?:\.\d+)?/i.test(version.stdout.trim())) {
    throw new GitPreflightError(
      "NOVA_CORE_GIT_VERSION_INVALID",
      `La version Git retournée est invalide : ${version.stdout.trim() || "<vide>"}.`,
      version,
    );
  }
  const inside = await git(commandRunner, root, ["rev-parse", "--is-inside-work-tree"], "NOVA_CORE_GIT_WORKTREE_REQUIRED");
  if (inside.stdout.trim() !== "true") {
    throw new GitPreflightError("NOVA_CORE_GIT_WORKTREE_REQUIRED", "Le dépôt Git doit être un worktree non bare.", inside);
  }

  const topLevelResult = await git(commandRunner, root, ["rev-parse", "--show-toplevel"], "NOVA_CORE_GIT_TOP_LEVEL_UNRESOLVED");
  const topLevel = resolve(topLevelResult.stdout.trim());
  if (normalizePath(topLevel) !== normalizePath(root)) {
    throw new GitPreflightError(
      "NOVA_CORE_GIT_TOP_LEVEL_MISMATCH",
      `La racine d'exécution ${root} ne correspond pas au top-level Git ${topLevel}.`,
      topLevelResult,
    );
  }

  const headResult = await git(commandRunner, root, ["rev-parse", "--verify", "HEAD"], "NOVA_CORE_GIT_UNBORN_HEAD");
  const head = headResult.stdout.trim();
  if (!/^[0-9a-f]{40,64}$/i.test(head)) {
    throw new GitPreflightError("NOVA_CORE_GIT_HEAD_INVALID", "Le HEAD Git n'est pas une empreinte valide.", headResult);
  }

  const branchResult = await git(
    commandRunner,
    root,
    ["symbolic-ref", "--quiet", "--short", "HEAD"],
    "NOVA_CORE_GIT_DETACHED_HEAD",
  );
  const branch = branchResult.stdout.trim();
  if (!branch) {
    throw new GitPreflightError("NOVA_CORE_GIT_DETACHED_HEAD", "Le HEAD Git est détaché.", branchResult);
  }

  const statusResult = await git(
    commandRunner,
    root,
    ["status", "--porcelain=v1", "--untracked-files=all"],
    "NOVA_CORE_GIT_STATUS_FAILED",
  );
  const submoduleResult = await git(
    commandRunner,
    root,
    ["submodule", "status", "--recursive"],
    "NOVA_CORE_GIT_SUBMODULE_CHECK_FAILED",
  );
  const submodules = submoduleResult.stdout.split(/\r?\n/).map((line) => line.trimEnd()).filter(Boolean);
  const invalidSubmodule = submodules.find((line) => /^[-+U]/.test(line));
  if (invalidSubmodule) {
    throw new GitPreflightError(
      "NOVA_CORE_GIT_SUBMODULE_INVALID",
      `Un sous-module est absent ou en conflit : ${invalidSubmodule}`,
      submoduleResult,
    );
  }

  const worktreeStatus = statusResult.stdout.replaceAll("\r\n", "\n");
  return {
    gitVersion: version.stdout.trim(),
    topLevel,
    branch,
    head,
    worktreeStatus,
    worktreeFingerprint: createHash("sha256").update(worktreeStatus).digest("hex"),
    submodules,
  };
}

export function assertStableGitPreflight(initial: GitPreflight, current: GitPreflight): void {
  const changed = (["gitVersion", "topLevel", "branch", "head", "worktreeFingerprint"] as const)
    .filter((field) => normalizeValue(field, initial[field]) !== normalizeValue(field, current[field]));
  if (JSON.stringify(initial.submodules) !== JSON.stringify(current.submodules)) changed.push("worktreeFingerprint");
  if (changed.length > 0) {
    throw new GitPreflightError(
      "NOVA_CORE_GIT_PREFLIGHT_DRIFT",
      `L'état Git a changé pendant le preflight : ${[...new Set(changed)].join(", ")}.`,
    );
  }
}

async function git(
  commandRunner: NovaCoreCommandRunner,
  cwd: string,
  args: readonly string[],
  code: string,
): Promise<NovaCoreCommandResult> {
  const result = await commandRunner("git", args, cwd);
  if (result.exitCode !== 0) {
    throw new GitPreflightError(code, gitErrorMessage(code), result);
  }
  return result;
}

function gitErrorMessage(code: string): string {
  switch (code) {
    case "NOVA_CORE_GIT_UNBORN_HEAD": return "Le dépôt Git possède une branche unborn sans HEAD validable.";
    case "NOVA_CORE_GIT_DETACHED_HEAD": return "Le dépôt Git est en detached HEAD.";
    case "NOVA_CORE_GIT_WORKTREE_REQUIRED": return "NOVA Core exige un worktree Git réel.";
    default: return `Le preflight Git a échoué (${code}).`;
  }
}

function normalizePath(value: string): string {
  const normalized = resolve(value).replaceAll("\\", "/").replace(/\/+$/, "");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function normalizeValue(field: keyof GitPreflight, value: string): string {
  return field === "topLevel" ? normalizePath(value) : value;
}
