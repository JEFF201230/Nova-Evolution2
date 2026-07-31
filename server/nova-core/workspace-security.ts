import {
  lstatSync,
  realpathSync,
} from "node:fs";
import {
  isAbsolute,
  join,
  normalize,
} from "node:path";

export interface TrustedWorkspace {
  readonly workspaceId: string;
  readonly repositoryId: string;
  readonly rootPath: string;
  readonly sandboxRoot: string;
}

export interface WorkspaceSecurityConfiguration {
  readonly trustedWorkspaces: readonly TrustedWorkspace[];
}

export interface WorkspaceSecurityRequest {
  readonly workspaceId: string;
  readonly repositoryId: string;
  readonly workspaceRoot: string;
  readonly sandboxRoot: string;
  readonly workingDirectory: string;
}

export interface ValidatedWorkspace {
  readonly workspaceId: string;
  readonly repositoryId: string;
  readonly canonicalRoot: string;
  readonly sandboxRoot: string;
}

export interface WorkspaceSecurityPort {
  validate(
    request: WorkspaceSecurityRequest,
  ): ValidatedWorkspace | null | Promise<ValidatedWorkspace | null>;
}

export interface WorkspaceSecurityFileStat {
  isDirectory(): boolean;
  isFile(): boolean;
  isSymbolicLink(): boolean;
  readonly size: number;
}

export interface WorkspaceSecurityFileSystem {
  realpath(path: string): string;
  lstat(path: string): WorkspaceSecurityFileStat;
}

export interface WorkspaceSecurityDependencies {
  readonly configuration?: WorkspaceSecurityConfiguration;
  readonly fileSystem?: WorkspaceSecurityFileSystem;
}

export interface WorkspaceSecurityFeatureFlag {
  readonly enabled: boolean;
}

export type WorkspaceSecurityFailure =
  | "CONFIGURATION_MISSING"
  | "INVALID_REQUEST"
  | "UNKNOWN_WORKSPACE"
  | "UNKNOWN_REPOSITORY"
  | "RELATIVE_PATH"
  | "PARENT_TRAVERSAL"
  | "UNC_PATH"
  | "ROOT_NOT_TRUSTED"
  | "NON_CANONICAL_PATH"
  | "LINKED_PATH"
  | "SANDBOX_MISMATCH"
  | "WORKSPACE_NOT_FOUND"
  | "REPOSITORY_INVALID";

export class WorkspaceSecurityError extends Error {
  readonly code = "WORKSPACE_SECURITY_ERROR";

  constructor(readonly reason: WorkspaceSecurityFailure) {
    super(`Workspace security rejected the execution: ${reason}.`);
    this.name = "WorkspaceSecurityError";
  }
}

export class WorkspaceSecurityValidator
implements WorkspaceSecurityPort {
  readonly enabled: boolean;

  private readonly configuration:
    WorkspaceSecurityConfiguration | undefined;
  private readonly fileSystem: WorkspaceSecurityFileSystem;

  constructor(
    featureFlag: WorkspaceSecurityFeatureFlag = { enabled: false },
    dependencies: WorkspaceSecurityDependencies = {},
  ) {
    this.enabled = featureFlag.enabled === true;
    this.configuration = dependencies.configuration;
    this.fileSystem = dependencies.fileSystem ?? SYSTEM_FILE_SYSTEM;
  }

  validate(
    request: WorkspaceSecurityRequest,
  ): ValidatedWorkspace | null {
    if (!this.enabled) {
      return null;
    }

    const trustedWorkspaces = this.configuration?.trustedWorkspaces;
    if (
      !Array.isArray(trustedWorkspaces) ||
      trustedWorkspaces.length === 0
    ) {
      throw new WorkspaceSecurityError("CONFIGURATION_MISSING");
    }
    assertRequest(request);
    assertUniqueConfiguration(trustedWorkspaces);

    const trusted = trustedWorkspaces.find(
      (workspace) => workspace.workspaceId === request.workspaceId,
    );
    if (trusted === undefined) {
      throw new WorkspaceSecurityError("UNKNOWN_WORKSPACE");
    }
    assertTrustedWorkspace(trusted);
    if (trusted.repositoryId !== request.repositoryId) {
      throw new WorkspaceSecurityError("UNKNOWN_REPOSITORY");
    }

    for (const candidate of [
      request.workspaceRoot,
      request.sandboxRoot,
      request.workingDirectory,
      trusted.rootPath,
      trusted.sandboxRoot,
    ]) {
      assertSafeAbsolutePath(candidate);
    }

    if (
      request.workspaceRoot !== trusted.rootPath ||
      request.workingDirectory !== trusted.rootPath
    ) {
      throw new WorkspaceSecurityError("ROOT_NOT_TRUSTED");
    }
    if (
      trusted.sandboxRoot !== trusted.rootPath ||
      request.sandboxRoot !== trusted.sandboxRoot ||
      request.sandboxRoot !== request.workspaceRoot
    ) {
      throw new WorkspaceSecurityError("SANDBOX_MISMATCH");
    }

    const canonicalRoot = this.resolveCanonical(trusted.rootPath);
    const canonicalSandbox = this.resolveCanonical(
      trusted.sandboxRoot,
    );
    const canonicalWorkingDirectory = this.resolveCanonical(
      request.workingDirectory,
    );
    if (
      canonicalRoot !== trusted.rootPath ||
      canonicalSandbox !== trusted.sandboxRoot ||
      canonicalWorkingDirectory !== request.workingDirectory
    ) {
      throw new WorkspaceSecurityError("NON_CANONICAL_PATH");
    }

    const rootStat = this.safeLstat(canonicalRoot);
    if (rootStat.isSymbolicLink()) {
      throw new WorkspaceSecurityError("LINKED_PATH");
    }
    if (!rootStat.isDirectory()) {
      throw new WorkspaceSecurityError("WORKSPACE_NOT_FOUND");
    }

    assertRepository(canonicalRoot, this.fileSystem);

    return Object.freeze({
      workspaceId: trusted.workspaceId,
      repositoryId: trusted.repositoryId,
      canonicalRoot,
      sandboxRoot: canonicalSandbox,
    });
  }

  private resolveCanonical(path: string): string {
    try {
      return this.fileSystem.realpath(path);
    } catch {
      throw new WorkspaceSecurityError("WORKSPACE_NOT_FOUND");
    }
  }

  private safeLstat(path: string): WorkspaceSecurityFileStat {
    try {
      return this.fileSystem.lstat(path);
    } catch {
      throw new WorkspaceSecurityError("WORKSPACE_NOT_FOUND");
    }
  }
}

const SYSTEM_FILE_SYSTEM: WorkspaceSecurityFileSystem = Object.freeze({
  realpath: (path: string) => realpathSync.native(path),
  lstat: (path: string) => lstatSync(path),
});

function assertRepository(
  canonicalRoot: string,
  fileSystem: WorkspaceSecurityFileSystem,
): void {
  try {
    const gitDirectory = fileSystem.lstat(join(canonicalRoot, ".git"));
    const gitHead = fileSystem.lstat(
      join(canonicalRoot, ".git", "HEAD"),
    );
    if (
      gitDirectory.isSymbolicLink() ||
      !gitDirectory.isDirectory() ||
      gitHead.isSymbolicLink() ||
      !gitHead.isFile() ||
      gitHead.size <= 0
    ) {
      throw new WorkspaceSecurityError("REPOSITORY_INVALID");
    }
  } catch (error) {
    if (error instanceof WorkspaceSecurityError) {
      throw error;
    }
    throw new WorkspaceSecurityError("REPOSITORY_INVALID");
  }
}

function assertRequest(request: WorkspaceSecurityRequest): void {
  if (
    !isRecord(request) ||
    !isToken(request.workspaceId) ||
    !isToken(request.repositoryId) ||
    typeof request.workspaceRoot !== "string" ||
    typeof request.sandboxRoot !== "string" ||
    typeof request.workingDirectory !== "string"
  ) {
    throw new WorkspaceSecurityError("INVALID_REQUEST");
  }
}

function assertUniqueConfiguration(
  trustedWorkspaces: readonly TrustedWorkspace[],
): void {
  const workspaceIds = new Set<string>();
  const repositoryIds = new Set<string>();
  const rootPaths = new Set<string>();
  for (const workspace of trustedWorkspaces) {
    assertTrustedWorkspace(workspace);
    if (
      workspaceIds.has(workspace.workspaceId) ||
      repositoryIds.has(workspace.repositoryId) ||
      rootPaths.has(workspace.rootPath)
    ) {
      throw new WorkspaceSecurityError("CONFIGURATION_MISSING");
    }
    workspaceIds.add(workspace.workspaceId);
    repositoryIds.add(workspace.repositoryId);
    rootPaths.add(workspace.rootPath);
  }
}

function assertTrustedWorkspace(workspace: TrustedWorkspace): void {
  if (
    !isRecord(workspace) ||
    !isToken(workspace.workspaceId) ||
    !isToken(workspace.repositoryId) ||
    typeof workspace.rootPath !== "string" ||
    typeof workspace.sandboxRoot !== "string"
  ) {
    throw new WorkspaceSecurityError("CONFIGURATION_MISSING");
  }
}

function assertSafeAbsolutePath(path: string): void {
  if (
    path.length === 0 ||
    path !== path.trim() ||
    path.includes("\0")
  ) {
    throw new WorkspaceSecurityError("INVALID_REQUEST");
  }
  if (path.startsWith("\\\\") || path.startsWith("//")) {
    throw new WorkspaceSecurityError("UNC_PATH");
  }
  if (!isAbsolute(path)) {
    throw new WorkspaceSecurityError("RELATIVE_PATH");
  }
  if (path.split(/[\\/]+/).includes("..")) {
    throw new WorkspaceSecurityError("PARENT_TRAVERSAL");
  }
  if (normalize(path) !== path) {
    throw new WorkspaceSecurityError("NON_CANONICAL_PATH");
  }
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
