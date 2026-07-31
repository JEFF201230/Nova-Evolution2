import assert from "node:assert/strict";
import {
  execFile,
} from "node:child_process";
import {
  mkdtemp,
  mkdir,
  rm,
  utimes,
  writeFile,
} from "node:fs/promises";
import {
  tmpdir,
} from "node:os";
import {
  join,
} from "node:path";
import {
  promisify,
} from "node:util";
import test from "node:test";
import {
  GitProvenanceCertifier,
  GitProvenanceError,
} from "./git-provenance.js";
import type {
  NovaCoreCommandRunner,
} from "./nova-core.execution.js";
import type {
  ValidatedWorkspace,
} from "./workspace-security.js";

const ROOT = process.cwd();
const HEAD = "a".repeat(40);
const execFileAsync = promisify(execFile);
const directories: string[] = [];

test.after(async () => {
  await Promise.all(
    directories.map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

function workspace(): ValidatedWorkspace {
  return {
    workspaceId: "WORKSPACE-001",
    repositoryId: "REPOSITORY-001",
    canonicalRoot: ROOT,
    sandboxRoot: ROOT,
  };
}

function commandRunner(
  overrides: Readonly<Record<string, string>> = {},
): NovaCoreCommandRunner {
  return async (_command, args) => {
    const key = args.join(" ");
    const outputs: Record<string, string> = {
      "--version": "git version 2.50.1\n",
      "rev-parse --is-inside-work-tree": "true\n",
      "rev-parse --show-toplevel": `${ROOT}\n`,
      "rev-parse --git-path index.lock": ".git/index.lock\n",
      "rev-parse --verify HEAD": `${HEAD}\n`,
      "symbolic-ref --quiet --short HEAD": "feature/hardening\n",
      "status --porcelain=v1 --untracked-files=all":
        " M server/nova-core/prompt-optimizer.ts\n",
      "diff --name-only --diff-filter=U": "",
      "submodule status --recursive": "",
      "ls-files -z": "server/nova-core/prompt-optimizer.ts\0",
      "ls-files -s -z":
        `100644 ${HEAD} 0\tserver/nova-core/prompt-optimizer.ts\0`,
      "ls-files --others --exclude-standard -z": "",
      ...overrides,
    };
    return {
      exitCode: Object.hasOwn(outputs, key) ? 0 : 1,
      stdout: outputs[key] ?? "",
      stderr: "",
    };
  };
}

test("P1-007 certifies repository, branch, HEAD, workspace and SHA", async () => {
  const provenance = await new GitProvenanceCertifier(
    { enabled: true },
    {
      commandRunner: commandRunner(),
      now: () => new Date("2026-07-28T23:00:00.000Z"),
    },
  ).certify(workspace());

  assert.ok(provenance);
  assert.equal(provenance.repositoryId, "REPOSITORY-001");
  assert.equal(provenance.workspaceId, "WORKSPACE-001");
  assert.equal(provenance.branch, "feature/hardening");
  assert.equal(provenance.commitSha, HEAD);
  assert.equal(provenance.headSha, HEAD);
  assert.match(provenance.worktreeFingerprint, /^[0-9a-f]{64}$/);
  assert.match(provenance.repositoryFingerprint, /^[0-9a-f]{64}$/);
  assert.match(provenance.provenanceSha256, /^[0-9a-f]{64}$/);
  assert.equal(provenance.dirty, true);
});

test("P1-007 is deterministic for the same certified Git state", async () => {
  const dependencies = {
    commandRunner: commandRunner(),
    now: () => new Date("2026-07-28T23:00:00.000Z"),
  };
  const certifier = new GitProvenanceCertifier(
    { enabled: true },
    dependencies,
  );
  assert.deepEqual(
    await certifier.certify(workspace()),
    await certifier.certify(workspace()),
  );
});

test("P1-007 fails closed when Git top-level differs from workspace", async () => {
  const certifier = new GitProvenanceCertifier(
    { enabled: true },
    {
      commandRunner: commandRunner({
        "rev-parse --show-toplevel": `${ROOT}\\outside\n`,
      }),
    },
  );
  await assert.rejects(
    () => certifier.certify(workspace()),
    (error) =>
      error instanceof GitProvenanceError &&
      error.code === "GIT_PROVENANCE_ERROR",
  );
});

test("P1-007 Feature Flag OFF performs no Git command", async () => {
  let commandCalled = false;
  const certifier = new GitProvenanceCertifier(
    { enabled: false },
    {
      commandRunner: async () => {
        commandCalled = true;
        throw new Error("Git must remain inert.");
      },
    },
  );
  assert.equal(
    await certifier.certify({} as ValidatedWorkspace),
    null,
  );
  assert.equal(commandCalled, false);
});

async function git(
  root: string,
  ...args: string[]
): Promise<void> {
  await execFileAsync("git", args, { cwd: root });
}

async function contentRepository(): Promise<string> {
  const root = await mkdtemp(
    join(tmpdir(), "nova-content-provenance-"),
  );
  directories.push(root);
  await git(root, "init");
  await git(root, "config", "user.name", "NOVA Test");
  await git(root, "config", "user.email", "nova@example.invalid");
  await writeFile(join(root, "tracked.txt"), "version-one\n");
  await git(root, "add", "tracked.txt");
  await git(root, "commit", "-m", "initial");
  await mkdir(join(root, "generated"));
  await writeFile(join(root, "generated", "result.txt"), "result-one\n");
  return root;
}

function contentWorkspace(root: string): ValidatedWorkspace {
  return {
    workspaceId: "WORKSPACE-CONTENT",
    repositoryId: "REPOSITORY-CONTENT",
    canonicalRoot: root,
    sandboxRoot: root,
  };
}

const CONTENT_SCOPE = {
  allowedUntrackedPaths: ["generated/**"],
  excludedPaths: [],
} as const;

test("content-bound provenance changes for tracked, staged and authorized untracked content only", async () => {
  const root = await contentRepository();
  const first = await new GitProvenanceCertifier(
    { enabled: true },
    {
      now: () => new Date("2026-07-28T12:00:00.000Z"),
    },
  ).certify(contentWorkspace(root), CONTENT_SCOPE);
  const restarted = await new GitProvenanceCertifier(
    { enabled: true },
    {
      now: () => new Date("2026-07-29T12:00:00.000Z"),
    },
  ).certify(contentWorkspace(root), CONTENT_SCOPE);
  assert.ok(first);
  assert.ok(restarted);
  assert.equal(
    restarted.provenanceSha256,
    first.provenanceSha256,
  );

  await utimes(
    join(root, "tracked.txt"),
    new Date("2027-01-01T00:00:00.000Z"),
    new Date("2027-01-01T00:00:00.000Z"),
  );
  const timestampOnly = await new GitProvenanceCertifier({
    enabled: true,
  }).certify(contentWorkspace(root), CONTENT_SCOPE);
  assert.equal(
    timestampOnly?.provenanceSha256,
    first.provenanceSha256,
  );

  await writeFile(join(root, "tracked.txt"), "version-two\n");
  const unstaged = await new GitProvenanceCertifier({
    enabled: true,
  }).certify(contentWorkspace(root), CONTENT_SCOPE);
  assert.notEqual(
    unstaged?.provenanceSha256,
    first.provenanceSha256,
  );

  await git(root, "add", "tracked.txt");
  const staged = await new GitProvenanceCertifier({
    enabled: true,
  }).certify(contentWorkspace(root), CONTENT_SCOPE);
  assert.notEqual(
    staged?.provenanceSha256,
    unstaged?.provenanceSha256,
  );

  await writeFile(
    join(root, "generated", "result.txt"),
    "result-two\n",
  );
  const untracked = await new GitProvenanceCertifier({
    enabled: true,
  }).certify(contentWorkspace(root), CONTENT_SCOPE);
  assert.notEqual(
    untracked?.provenanceSha256,
    staged?.provenanceSha256,
  );
});

test("content-bound provenance normalizes traversal order", async () => {
  const files = {
    "first.txt": new TextEncoder().encode("first"),
    "second.txt": new TextEncoder().encode("second"),
  } as const;
  const ordered = (
    paths: readonly string[],
  ): NovaCoreCommandRunner =>
    commandRunner({
      "status --porcelain=v1 --untracked-files=all": "",
      "ls-files -z": `${paths.join("\0")}\0`,
      "ls-files -s -z": `${paths
        .map((path) =>
          `100644 ${
            path === "first.txt" ? "1".repeat(40) : "2".repeat(40)
          } 0\t${path}`,
        )
        .join("\0")}\0`,
      "ls-files --others --exclude-standard -z": "",
    });
  const fileSystem = {
    async lstat() {
      return {
        isFile: () => true,
        isSymbolicLink: () => false,
      };
    },
    async readFile(path: string) {
      return files[
        path.endsWith("first.txt") ? "first.txt" : "second.txt"
      ];
    },
    async readlink() {
      return "";
    },
  };
  const first = await new GitProvenanceCertifier(
    { enabled: true },
    {
      commandRunner: ordered(["first.txt", "second.txt"]),
      fileSystem,
    },
  ).certify(workspace());
  const reversed = await new GitProvenanceCertifier(
    { enabled: true },
    {
      commandRunner: ordered(["second.txt", "first.txt"]),
      fileSystem,
    },
  ).certify(workspace());
  assert.equal(
    first?.provenanceSha256,
    reversed?.provenanceSha256,
  );
});

test("content-bound provenance recursively binds submodule HEAD, index and worktree content", async () => {
  const moduleRoot = await mkdtemp(
    join(tmpdir(), "nova-content-submodule-source-"),
  );
  directories.push(moduleRoot);
  await git(moduleRoot, "init");
  await git(moduleRoot, "config", "user.name", "NOVA Test");
  await git(
    moduleRoot,
    "config",
    "user.email",
    "nova@example.invalid",
  );
  await writeFile(join(moduleRoot, "module.txt"), "module-one\n");
  await git(moduleRoot, "add", "module.txt");
  await git(moduleRoot, "commit", "-m", "module initial");

  const root = await contentRepository();
  await execFileAsync(
    "git",
    [
      "-c",
      "protocol.file.allow=always",
      "submodule",
      "add",
      moduleRoot,
      "modules/core",
    ],
    { cwd: root },
  );
  await git(root, "commit", "-am", "add submodule");
  const certifier = new GitProvenanceCertifier({
    enabled: true,
  });
  const clean = await certifier.certify(
    contentWorkspace(root),
    CONTENT_SCOPE,
  );

  await writeFile(
    join(root, "modules", "core", "module.txt"),
    "module-two\n",
  );
  const modified = await certifier.certify(
    contentWorkspace(root),
    CONTENT_SCOPE,
  );
  assert.ok(clean);
  assert.ok(modified);
  assert.notEqual(
    modified.submoduleFingerprint,
    clean.submoduleFingerprint,
  );
  assert.notEqual(
    modified.provenanceSha256,
    clean.provenanceSha256,
  );
});
