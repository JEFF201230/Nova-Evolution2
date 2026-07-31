import {
  execFile,
} from "node:child_process";
import {
  lstat,
  readFile,
  readlink,
} from "node:fs/promises";
import {
  join,
} from "node:path";
import type {
  NovaCoreCommandResult,
  NovaCoreCommandRunner,
} from "./nova-core.execution.js";
import {
  GitPreflightError,
  inspectGitPreflight,
} from "./git-preflight.js";
import {
  canonicalJson,
  sha256,
} from "./run-binding.js";
import type {
  ValidatedWorkspace,
} from "./workspace-security.js";

export interface GitProvenance {
  readonly schemaVersion: 1;
  readonly workspaceId: string;
  readonly repositoryId: string;
  readonly workspaceRoot: string;
  readonly branch: string;
  readonly commitSha: string;
  readonly headSha: string;
  readonly worktreeFingerprint: string;
  readonly indexFingerprint: string;
  readonly trackedContentFingerprint: string;
  readonly untrackedContentFingerprint: string;
  readonly submoduleFingerprint: string;
  readonly exclusionFingerprint: string;
  readonly repositoryFingerprint: string;
  readonly provenanceSha256: string;
  readonly allowedUntrackedPaths: readonly string[];
  readonly excludedPaths: readonly string[];
  readonly trackedFileCount: number;
  readonly untrackedFileCount: number;
  readonly dirty: boolean;
  readonly gitVersion: string;
  readonly certifiedAt: string;
}

export interface GitProvenancePort {
  certify(
    workspace: ValidatedWorkspace,
    scope?: GitProvenanceScope,
  ): GitProvenance | null | Promise<GitProvenance | null>;
}

export interface GitProvenanceScope {
  readonly allowedUntrackedPaths: readonly string[];
  readonly excludedPaths: readonly string[];
}

export interface GitProvenanceFeatureFlag {
  readonly enabled: boolean;
}

export interface GitProvenanceDependencies {
  readonly commandRunner?: NovaCoreCommandRunner;
  readonly now?: () => Date;
  readonly fileSystem?: GitProvenanceFileSystem;
}

export interface GitProvenanceFileSystem {
  lstat(path: string): Promise<{
    isFile(): boolean;
    isSymbolicLink(): boolean;
  }>;
  readFile(path: string): Promise<Uint8Array>;
  readlink(path: string): Promise<string>;
}

export class GitProvenanceError extends Error {
  readonly code = "GIT_PROVENANCE_ERROR";

  constructor(readonly reason: string) {
    super(`Git provenance certification failed: ${reason}.`);
    this.name = "GitProvenanceError";
  }
}

export class GitProvenanceCertifier implements GitProvenancePort {
  readonly enabled: boolean;
  private readonly commandRunner: NovaCoreCommandRunner;
  private readonly now: () => Date;
  private readonly fileSystem: GitProvenanceFileSystem;

  constructor(
    featureFlag: GitProvenanceFeatureFlag = { enabled: false },
    dependencies: GitProvenanceDependencies = {},
  ) {
    this.enabled = featureFlag.enabled === true;
    this.commandRunner =
      dependencies.commandRunner ?? systemGitCommandRunner;
    this.now = dependencies.now ?? (() => new Date());
    this.fileSystem = dependencies.fileSystem ?? SYSTEM_FILE_SYSTEM;
  }

  async certify(
    workspace: ValidatedWorkspace,
    scope: GitProvenanceScope = {
      allowedUntrackedPaths: [],
      excludedPaths: [],
    },
  ): Promise<GitProvenance | null> {
    if (!this.enabled) {
      return null;
    }
    if (
      !isRecord(workspace) ||
      !isToken(workspace.workspaceId) ||
      !isToken(workspace.repositoryId) ||
      typeof workspace.canonicalRoot !== "string" ||
      workspace.canonicalRoot.length === 0 ||
      workspace.canonicalRoot !== workspace.sandboxRoot
    ) {
      throw new GitProvenanceError("WORKSPACE_INVALID");
    }
    assertScope(scope);

    try {
      const preflight = await inspectGitPreflight(
        workspace.canonicalRoot,
        this.commandRunner,
      );
      const certifiedAt = this.now().toISOString();
      if (Number.isNaN(Date.parse(certifiedAt))) {
        throw new GitProvenanceError("CLOCK_INVALID");
      }
      const content = await inspectRepositoryContent(
        workspace.canonicalRoot,
        "",
        scope,
        this.commandRunner,
        this.fileSystem,
      );
      const allowedUntrackedPaths = normalizedPatterns(
        scope.allowedUntrackedPaths,
      );
      const excludedPaths = normalizedPatterns(scope.excludedPaths);
      const indexFingerprint = sha256(
        canonicalJson(content.indexEntries),
      );
      const trackedContentFingerprint = sha256(
        canonicalJson(content.trackedManifest),
      );
      const untrackedContentFingerprint = sha256(
        canonicalJson(content.untrackedManifest),
      );
      const submoduleFingerprint = sha256(
        canonicalJson({
          preflight: [...preflight.submodules].sort(),
          content: content.submodules,
        }),
      );
      const exclusionFingerprint = sha256(
        canonicalJson(excludedPaths),
      );
      const repositoryIdentity = {
        workspaceId: workspace.workspaceId,
        repositoryId: workspace.repositoryId,
        workspaceRoot: preflight.topLevel,
        branch: preflight.branch,
        commitSha: preflight.head,
        headSha: preflight.head,
        worktreeFingerprint: sha256(canonicalJson({
          trackedContentFingerprint,
          untrackedContentFingerprint,
        })),
        indexFingerprint,
        trackedContentFingerprint,
        untrackedContentFingerprint,
        submoduleFingerprint,
        exclusionFingerprint,
        allowedUntrackedPaths,
        excludedPaths,
        trackedFileCount: content.trackedManifest.length,
        untrackedFileCount: content.untrackedManifest.length,
      };
      const repositoryFingerprint = sha256(
        canonicalJson(repositoryIdentity),
      );
      const contentBound = {
        schemaVersion: 1 as const,
        ...repositoryIdentity,
        repositoryFingerprint,
        dirty: preflight.worktreeStatus.length > 0,
      };
      const provenanceSha256 = sha256(canonicalJson(contentBound));

      return Object.freeze({
        ...contentBound,
        provenanceSha256,
        gitVersion: preflight.gitVersion,
        certifiedAt,
      });
    } catch (error) {
      if (error instanceof GitProvenanceError) {
        throw error;
      }
      throw new GitProvenanceError(
        error instanceof GitPreflightError
          ? error.code
          : "INSPECTION_FAILED",
      );
    }
  }
}

const SYSTEM_FILE_SYSTEM: GitProvenanceFileSystem = Object.freeze({
  lstat,
  readFile,
  readlink,
});

async function gitOutput(
  commandRunner: NovaCoreCommandRunner,
  cwd: string,
  args: readonly string[],
): Promise<string> {
  const result = await commandRunner("git", args, cwd);
  if (result.exitCode !== 0) {
    throw new GitProvenanceError("CONTENT_INSPECTION_FAILED");
  }
  return result.stdout;
}

async function contentManifest(
  root: string,
  paths: readonly string[],
  fileSystem: GitProvenanceFileSystem,
  prefix = "",
): Promise<readonly {
  readonly path: string;
  readonly kind: "FILE" | "SYMLINK" | "MISSING";
  readonly sha256: string;
}[]> {
  const entries = [];
  for (const path of [...paths].sort()) {
    const absolute = join(root, ...path.split("/"));
    try {
      const stat = await fileSystem.lstat(absolute);
      if (stat.isSymbolicLink()) {
        entries.push({
          path: `${prefix}${path}`,
          kind: "SYMLINK" as const,
          sha256: sha256(await fileSystem.readlink(absolute)),
        });
      } else if (stat.isFile()) {
        entries.push({
          path: `${prefix}${path}`,
          kind: "FILE" as const,
          sha256: sha256(await fileSystem.readFile(absolute)),
        });
      } else {
        throw new GitProvenanceError("CONTENT_TYPE_INVALID");
      }
    } catch (error) {
      if (error instanceof GitProvenanceError) {
        throw error;
      }
      entries.push({
        path: `${prefix}${path}`,
        kind: "MISSING" as const,
        sha256: sha256("MISSING"),
      });
    }
  }
  return Object.freeze(entries);
}

interface RepositoryContentSnapshot {
  readonly trackedManifest: readonly {
    readonly path: string;
    readonly kind: "FILE" | "SYMLINK" | "MISSING";
    readonly sha256: string;
  }[];
  readonly untrackedManifest: readonly {
    readonly path: string;
    readonly kind: "FILE" | "SYMLINK" | "MISSING";
    readonly sha256: string;
  }[];
  readonly indexEntries: readonly string[];
  readonly submodules: readonly {
    readonly path: string;
    readonly head: string;
    readonly indexEntries: readonly string[];
    readonly trackedManifest: RepositoryContentSnapshot["trackedManifest"];
    readonly untrackedManifest: RepositoryContentSnapshot["untrackedManifest"];
  }[];
}

async function inspectRepositoryContent(
  root: string,
  prefix: string,
  scope: GitProvenanceScope,
  commandRunner: NovaCoreCommandRunner,
  fileSystem: GitProvenanceFileSystem,
): Promise<RepositoryContentSnapshot> {
  const rawIndexEntries = parseNullSeparated(
    await gitOutput(
      commandRunner,
      root,
      ["ls-files", "-s", "-z"],
    ),
  );
  const gitlinks = rawIndexEntries
    .filter((entry) => entry.startsWith("160000 "))
    .map(indexEntryPath)
    .filter((path): path is string => path !== null)
    .sort();
  const trackedPaths = sortedPaths(
    await gitOutput(commandRunner, root, ["ls-files", "-z"]),
  ).filter((path) => {
    const qualified = `${prefix}${path}`;
    return (
      !gitlinks.includes(path) &&
      !matchesAny(qualified, scope.excludedPaths)
    );
  });
  const untrackedPaths = sortedPaths(
    await gitOutput(
      commandRunner,
      root,
      ["ls-files", "--others", "--exclude-standard", "-z"],
    ),
  );
  const authorizedUntracked = untrackedPaths.filter((path) => {
    const qualified = `${prefix}${path}`;
    return (
      !matchesAny(qualified, scope.excludedPaths) &&
      matchesAny(qualified, scope.allowedUntrackedPaths)
    );
  });
  const unauthorizedUntracked = untrackedPaths.filter((path) => {
    const qualified = `${prefix}${path}`;
    return (
      !matchesAny(qualified, scope.excludedPaths) &&
      !matchesAny(qualified, scope.allowedUntrackedPaths)
    );
  });
  if (unauthorizedUntracked.length > 0) {
    throw new GitProvenanceError(
      "UNTRACKED_CONTENT_OUT_OF_SCOPE",
    );
  }
  const indexEntries = rawIndexEntries
    .filter((entry) => {
      const path = indexEntryPath(entry);
      return (
        path !== null &&
        !matchesAny(`${prefix}${path}`, scope.excludedPaths)
      );
    })
    .map((entry) => `${prefix}${entry}`)
    .sort();
  const trackedManifest = [
    ...await contentManifest(
      root,
      trackedPaths,
      fileSystem,
      prefix,
    ),
  ];
  const untrackedManifest = [
    ...await contentManifest(
      root,
      authorizedUntracked,
      fileSystem,
      prefix,
    ),
  ];
  const submodules = [];
  for (const path of gitlinks) {
    const qualified = `${prefix}${path}`;
    if (matchesAny(qualified, scope.excludedPaths)) {
      continue;
    }
    const nested = await inspectRepositoryContent(
      join(root, ...path.split("/")),
      `${qualified}/`,
      scope,
      commandRunner,
      fileSystem,
    );
    const head = (
      await gitOutput(
        commandRunner,
        join(root, ...path.split("/")),
        ["rev-parse", "--verify", "HEAD"],
      )
    ).trim();
    if (!/^[0-9a-f]{40}$/i.test(head)) {
      throw new GitProvenanceError("SUBMODULE_HEAD_INVALID");
    }
    submodules.push({
      path: qualified,
      head: head.toLowerCase(),
      indexEntries: nested.indexEntries,
      trackedManifest: nested.trackedManifest,
      untrackedManifest: nested.untrackedManifest,
    });
    trackedManifest.push(...nested.trackedManifest);
    untrackedManifest.push(...nested.untrackedManifest);
    indexEntries.push(...nested.indexEntries);
  }
  trackedManifest.sort((left, right) =>
    left.path.localeCompare(right.path),
  );
  untrackedManifest.sort((left, right) =>
    left.path.localeCompare(right.path),
  );
  indexEntries.sort();
  submodules.sort((left, right) =>
    left.path.localeCompare(right.path),
  );
  return {
    trackedManifest: Object.freeze(trackedManifest),
    untrackedManifest: Object.freeze(untrackedManifest),
    indexEntries: Object.freeze(indexEntries),
    submodules: Object.freeze(submodules),
  };
}

function sortedPaths(output: string): readonly string[] {
  return Object.freeze(
    parseNullSeparated(output)
      .map(normalizeRelativePath)
      .sort(),
  );
}

function parseNullSeparated(output: string): string[] {
  return output
    .split("\0")
    .filter((entry) => entry.length > 0);
}

function indexEntryPath(entry: string): string | null {
  const tab = entry.indexOf("\t");
  return tab === -1
    ? null
    : normalizeRelativePath(entry.slice(tab + 1));
}

function normalizeRelativePath(path: string): string {
  const normalized = path.replaceAll("\\", "/");
  if (
    normalized.length === 0 ||
    normalized.startsWith("/") ||
    normalized.split("/").includes("..")
  ) {
    throw new GitProvenanceError("CONTENT_PATH_INVALID");
  }
  return normalized;
}

function normalizedPatterns(
  patterns: readonly string[],
): readonly string[] {
  return Object.freeze(
    [...new Set(patterns.map(normalizeRelativePath))].sort(),
  );
}

function matchesAny(
  path: string,
  patterns: readonly string[],
): boolean {
  return patterns.some((pattern) => {
    const normalized = normalizeRelativePath(pattern);
    const source = normalized
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replaceAll("**", "\u0000")
      .replaceAll("*", "[^/]*")
      .replaceAll("\u0000", ".*");
    return (
      new RegExp(`^${source}$`).test(path) ||
      (!normalized.includes("*") &&
        path.startsWith(`${normalized.replace(/\/+$/, "")}/`))
    );
  });
}

function assertScope(scope: GitProvenanceScope): void {
  if (
    !isRecord(scope) ||
    !Array.isArray(scope.allowedUntrackedPaths) ||
    !Array.isArray(scope.excludedPaths) ||
    !scope.allowedUntrackedPaths.every(isPathPattern) ||
    !scope.excludedPaths.every(isPathPattern)
  ) {
    throw new GitProvenanceError("SCOPE_INVALID");
  }
}

function isPathPattern(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    !value.includes("\0") &&
    !value.split(/[\\/]+/).includes("..")
  );
}

function systemGitCommandRunner(
  command: string,
  args: readonly string[],
  workingDirectory: string,
): Promise<NovaCoreCommandResult> {
  return new Promise((resolve) => {
    execFile(
      command,
      [...args],
      {
        cwd: workingDirectory,
        encoding: "utf8",
        windowsHide: true,
        maxBuffer: 16 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        resolve({
          exitCode:
            typeof error?.code === "number" ? error.code : error ? 1 : 0,
          stdout,
          stderr,
          command,
          args: [...args],
          cwd: workingDirectory,
        });
      },
    );
  });
}

function isToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
