import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  join,
  sep,
} from "node:path";
import {
  tmpdir,
} from "node:os";
import test from "node:test";
import {
  WorkspaceSecurityError,
  type WorkspaceSecurityRequest,
  WorkspaceSecurityValidator,
} from "./workspace-security.js";

interface WorkspaceFixture {
  readonly container: string;
  readonly root: string;
  readonly request: WorkspaceSecurityRequest;
  readonly validator: WorkspaceSecurityValidator;
}

function createFixture(
  repository = true,
): WorkspaceFixture {
  const container = mkdtempSync(
    join(tmpdir(), "nova-workspace-security-"),
  );
  const rootCandidate = join(container, "trusted-repository");
  mkdirSync(rootCandidate, { recursive: true });
  if (repository) {
    mkdirSync(join(rootCandidate, ".git"), { recursive: true });
    writeFileSync(
      join(rootCandidate, ".git", "HEAD"),
      "ref: refs/heads/main\n",
      "utf8",
    );
    writeFileSync(
      join(rootCandidate, "mission.txt"),
      "trusted workspace\n",
      "utf8",
    );
  }
  const root = realpathSync.native(rootCandidate);
  const request: WorkspaceSecurityRequest = {
    workspaceId: "WORKSPACE-001",
    repositoryId: "REPOSITORY-001",
    workspaceRoot: root,
    sandboxRoot: root,
    workingDirectory: root,
  };
  const validator = new WorkspaceSecurityValidator(
    { enabled: true },
    {
      configuration: {
        trustedWorkspaces: [
          {
            workspaceId: request.workspaceId,
            repositoryId: request.repositoryId,
            rootPath: root,
            sandboxRoot: root,
          },
        ],
      },
    },
  );

  return { container, root, request, validator };
}

function cleanup(fixture: WorkspaceFixture): void {
  rmSync(fixture.container, { recursive: true, force: true });
}

function assertWorkspaceError(
  action: () => unknown,
  reason?: WorkspaceSecurityError["reason"],
): void {
  assert.throws(
    action,
    (error) =>
      error instanceof WorkspaceSecurityError &&
      error.code === "WORKSPACE_SECURITY_ERROR" &&
      (reason === undefined || error.reason === reason),
  );
}

function changeCase(path: string): string {
  const index = path.search(/[A-Za-z]/);
  if (index < 0) {
    return `${path}A`;
  }
  const character = path[index]!;
  const changed =
    character === character.toUpperCase()
      ? character.toLowerCase()
      : character.toUpperCase();
  return `${path.slice(0, index)}${changed}${path.slice(index + 1)}`;
}

test("WorkspaceSecurityValidator accepts only the configured canonical workspace and repository", (context) => {
  const fixture = createFixture();
  context.after(() => cleanup(fixture));

  const validated = fixture.validator.validate(fixture.request);

  assert.deepEqual(validated, {
    workspaceId: fixture.request.workspaceId,
    repositoryId: fixture.request.repositoryId,
    canonicalRoot: fixture.root,
    sandboxRoot: fixture.root,
  });
  assert.equal(Object.isFrozen(validated), true);
});

test("WorkspaceSecurityValidator rejects an unknown workspace", (context) => {
  const fixture = createFixture();
  context.after(() => cleanup(fixture));

  assertWorkspaceError(
    () =>
      fixture.validator.validate({
        ...fixture.request,
        workspaceId: "WORKSPACE-UNKNOWN",
      }),
    "UNKNOWN_WORKSPACE",
  );
});

test("WorkspaceSecurityValidator rejects an unknown repository identity", (context) => {
  const fixture = createFixture();
  context.after(() => cleanup(fixture));

  assertWorkspaceError(
    () =>
      fixture.validator.validate({
        ...fixture.request,
        repositoryId: "REPOSITORY-UNKNOWN",
      }),
    "UNKNOWN_REPOSITORY",
  );
});

test("WorkspaceSecurityValidator rejects relative and parent traversal paths", (context) => {
  const fixture = createFixture();
  context.after(() => cleanup(fixture));
  const traversals = [
    "../trusted-repository",
    "../../trusted-repository",
    `${fixture.root}${sep}..${sep}${basename(fixture.root)}`,
  ];

  for (const workspaceRoot of traversals) {
    assertWorkspaceError(() =>
      fixture.validator.validate({
        ...fixture.request,
        workspaceRoot,
        sandboxRoot: workspaceRoot,
        workingDirectory: workspaceRoot,
      }),
    );
  }
});

test("WorkspaceSecurityValidator rejects an absolute path outside the trusted root", (context) => {
  const fixture = createFixture();
  const outside = createFixture();
  context.after(() => {
    cleanup(fixture);
    cleanup(outside);
  });

  assertWorkspaceError(
    () =>
      fixture.validator.validate({
        ...fixture.request,
        workspaceRoot: outside.root,
        sandboxRoot: outside.root,
        workingDirectory: outside.root,
      }),
    "ROOT_NOT_TRUSTED",
  );
});

test("WorkspaceSecurityValidator rejects a symbolic workspace root", () => {
  const root =
    process.platform === "win32"
      ? "C:\\trusted-symbolic-workspace"
      : "/trusted-symbolic-workspace";
  const validator = new WorkspaceSecurityValidator(
    { enabled: true },
    {
      configuration: {
        trustedWorkspaces: [
          {
            workspaceId: "WORKSPACE-SYMLINK",
            repositoryId: "REPOSITORY-SYMLINK",
            rootPath: root,
            sandboxRoot: root,
          },
        ],
      },
      fileSystem: {
        realpath: () => root,
        lstat: () => ({
          isDirectory: () => true,
          isFile: () => false,
          isSymbolicLink: () => true,
          size: 0,
        }),
      },
    },
  );

  assertWorkspaceError(
    () =>
      validator.validate({
        workspaceId: "WORKSPACE-SYMLINK",
        repositoryId: "REPOSITORY-SYMLINK",
        workspaceRoot: root,
        sandboxRoot: root,
        workingDirectory: root,
      }),
    "LINKED_PATH",
  );
});

test("WorkspaceSecurityValidator rejects a junction or directory link", (context) => {
  const fixture = createFixture();
  const link = join(dirname(fixture.root), "workspace-link");
  context.after(() => cleanup(fixture));
  symlinkSync(
    fixture.root,
    link,
    process.platform === "win32" ? "junction" : "dir",
  );
  const validator = new WorkspaceSecurityValidator(
    { enabled: true },
    {
      configuration: {
        trustedWorkspaces: [
          {
            workspaceId: "WORKSPACE-LINK",
            repositoryId: "REPOSITORY-LINK",
            rootPath: link,
            sandboxRoot: link,
          },
        ],
      },
    },
  );

  assertWorkspaceError(() =>
    validator.validate({
      workspaceId: "WORKSPACE-LINK",
      repositoryId: "REPOSITORY-LINK",
      workspaceRoot: link,
      sandboxRoot: link,
      workingDirectory: link,
    }),
  );
});

test("WorkspaceSecurityValidator rejects path casing that differs from configuration", (context) => {
  const fixture = createFixture();
  context.after(() => cleanup(fixture));
  const changed = changeCase(fixture.root);

  assertWorkspaceError(() =>
    fixture.validator.validate({
      ...fixture.request,
      workspaceRoot: changed,
      sandboxRoot: changed,
      workingDirectory: changed,
    }),
  );
});

test("WorkspaceSecurityValidator rejects UNC and different-volume paths", (context) => {
  const fixture = createFixture();
  context.after(() => cleanup(fixture));
  const candidates = [
    "\\\\server\\share\\repository",
    process.platform === "win32"
      ? "Z:\\unauthorized\\repository"
      : "/different-volume/repository",
  ];

  for (const candidate of candidates) {
    assertWorkspaceError(() =>
      fixture.validator.validate({
        ...fixture.request,
        workspaceRoot: candidate,
        sandboxRoot: candidate,
        workingDirectory: candidate,
      }),
    );
  }
});

test("WorkspaceSecurityValidator rejects a sandbox different from the workspace", (context) => {
  const fixture = createFixture();
  const outside = createFixture();
  context.after(() => {
    cleanup(fixture);
    cleanup(outside);
  });

  assertWorkspaceError(
    () =>
      fixture.validator.validate({
        ...fixture.request,
        sandboxRoot: outside.root,
      }),
    "SANDBOX_MISMATCH",
  );
});

test("WorkspaceSecurityValidator rejects a deleted workspace", (context) => {
  const fixture = createFixture();
  context.after(() => cleanup(fixture));
  rmSync(fixture.root, { recursive: true, force: true });

  assertWorkspaceError(
    () => fixture.validator.validate(fixture.request),
    "WORKSPACE_NOT_FOUND",
  );
});

test("WorkspaceSecurityValidator rejects an empty repository", (context) => {
  const fixture = createFixture(false);
  context.after(() => cleanup(fixture));

  assertWorkspaceError(
    () => fixture.validator.validate(fixture.request),
    "REPOSITORY_INVALID",
  );
});

test("WorkspaceSecurityValidator fails closed without explicit configuration", () => {
  const validator = new WorkspaceSecurityValidator({ enabled: true });
  const root =
    process.platform === "win32" ? "C:\\repository" : "/repository";

  assertWorkspaceError(
    () =>
      validator.validate({
        workspaceId: "WORKSPACE-001",
        repositoryId: "REPOSITORY-001",
        workspaceRoot: root,
        sandboxRoot: root,
        workingDirectory: root,
      }),
    "CONFIGURATION_MISSING",
  );
});

test("WorkspaceSecurityValidator is inert before path resolution when Feature Flag is OFF", () => {
  let fileSystemCalled = false;
  const request = {};
  Object.defineProperty(request, "workspaceRoot", {
    get() {
      throw new Error("Workspace request must not be read.");
    },
  });
  const validator = new WorkspaceSecurityValidator(
    { enabled: false },
    {
      fileSystem: {
        realpath() {
          fileSystemCalled = true;
          throw new Error("Path resolution must remain inert.");
        },
        lstat() {
          fileSystemCalled = true;
          throw new Error("Filesystem must remain inert.");
        },
      },
    },
  );

  assert.equal(
    validator.validate(request as WorkspaceSecurityRequest),
    null,
  );
  assert.equal(fileSystemCalled, false);
});
