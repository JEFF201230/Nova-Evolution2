import assert from "node:assert/strict";
import test from "node:test";
import type {
  CerebrauKnowledgeResult,
  CerebrauKnowledgeSourceReference,
} from "./cerebrau-knowledge-adapter.js";
import {
  AuthorityResolver,
  type AuthorityResolutionRequest,
  type AuthoritySourceDeclaration,
} from "./authority-resolver.js";
import type {
  NovaUxKnowledgeResult,
  NovaUxSourceMetadataReference,
} from "./nova-ux-knowledge-adapter.js";

function createCerebrauSource(
  id: string,
  overrides: Partial<CerebrauKnowledgeSourceReference> = {},
): CerebrauKnowledgeSourceReference {
  return {
    id,
    domain: "KNOWLEDGE",
    authority: "CEREBRAU_KNOWLEDGE_GOVERNANCE",
    type: "REFERENCE",
    dependencies: [],
    sourceRoot: "CEREBRAU",
    path: `${id}.md`,
    ...overrides,
  };
}

function createUxSource(
  id: string,
  overrides: Partial<NovaUxSourceMetadataReference> = {},
): NovaUxSourceMetadataReference {
  return {
    id,
    domain: "UX_NAVIGATION",
    authority: "NOVA_USER_NAVIGATION_ARCHITECTURE",
    type: "MATRIX",
    sourceRoot: "NOVA_UX_ARCHITECTURE",
    path: `${id}.md`,
    ...overrides,
  };
}

function createCerebrauResult(
  sources: readonly CerebrauKnowledgeSourceReference[],
  status: CerebrauKnowledgeResult["status"] = "AVAILABLE",
): CerebrauKnowledgeResult {
  return {
    status,
    sources,
    authorities: [],
    programReferences: [],
    warnings: [],
    errors: [],
  };
}

function createUxResult(
  sources: readonly NovaUxSourceMetadataReference[] = [],
  status: NovaUxKnowledgeResult["status"] = "ABSENT",
): NovaUxKnowledgeResult {
  return {
    active: true,
    status,
    domains: [],
    routes: [],
    components: [],
    dependencies: [],
    conflicts: [],
    sourceMetadata: sources,
    warnings: [],
    errors: [],
  };
}

function declaration(
  sourceId: string,
  overrides: Partial<AuthoritySourceDeclaration> = {},
): AuthoritySourceDeclaration {
  return {
    sourceId,
    authorityDomain: "KNOWLEDGE",
    role: "AUTHORITATIVE",
    completeness: "COMPLETE",
    ...overrides,
  };
}

function request(
  cerebrauSources: readonly CerebrauKnowledgeSourceReference[],
  authorityDeclarations: readonly AuthoritySourceDeclaration[],
  overrides: Partial<AuthorityResolutionRequest> = {},
): AuthorityResolutionRequest {
  return {
    missionId: "NOVA_CORE_MISSION_PREPARATION_ENGINE_MVP_004",
    authorityDomain: "KNOWLEDGE",
    cerebrauKnowledge: createCerebrauResult(cerebrauSources),
    novaUxKnowledge: createUxResult(),
    authorityDeclarations,
    ...overrides,
  };
}

test("AuthorityResolver resolves one explicitly authoritative source", () => {
  const source = createCerebrauSource("DOC-AUTHORITY");
  const result = new AuthorityResolver({ enabled: true }).resolve(
    request([source], [declaration(source.id)]),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "RESOLVED");
  assert.equal(result.missionId, "NOVA_CORE_MISSION_PREPARATION_ENGINE_MVP_004");
  assert.equal(result.authorityDomain, "KNOWLEDGE");
  assert.deepEqual(
    result.authoritativeSources.map((candidate) => candidate.id),
    ["DOC-AUTHORITY"],
  );
  assert.equal(result.unresolvedAuthorityConflicts.length, 0);
});

test("AuthorityResolver keeps support separate from explicit authority", () => {
  const authority = createCerebrauSource("DOC-AUTHORITY");
  const supportA = createCerebrauSource("DOC-SUPPORT-A");
  const supportB = createCerebrauSource("DOC-SUPPORT-B");
  const result = new AuthorityResolver({ enabled: true }).resolve(
    request(
      [supportB, authority, supportA],
      [
        declaration(supportB.id, { role: "SUPPORTING" }),
        declaration(authority.id),
        declaration(supportA.id, { role: "SUPPORTING" }),
      ],
    ),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "RESOLVED");
  assert.deepEqual(
    result.authoritativeSources.map((source) => source.id),
    ["DOC-AUTHORITY"],
  );
  assert.deepEqual(
    result.supportingSources.map((source) => source.id),
    ["DOC-SUPPORT-A", "DOC-SUPPORT-B"],
  );
});

test("AuthorityResolver reports contradictory authoritative sources as UNRESOLVED", () => {
  const authorityA = createCerebrauSource("DOC-AUTHORITY-A");
  const authorityB = createCerebrauSource("DOC-AUTHORITY-B");
  const result = new AuthorityResolver({ enabled: true }).resolve(
    request(
      [authorityA, authorityB],
      [
        declaration(authorityA.id, {
          conflictsWith: [authorityB.id],
        }),
        declaration(authorityB.id),
      ],
    ),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "UNRESOLVED");
  assert.deepEqual(
    result.unresolvedAuthorityConflicts.map((conflict) => conflict.code),
    ["AR-C007"],
  );
  assert.deepEqual(result.unresolvedAuthorityConflicts[0].sourceIds, [
    "DOC-AUTHORITY-A",
    "DOC-AUTHORITY-B",
  ]);
});

test("AuthorityResolver reports demonstrated but incomplete authority as PARTIAL", () => {
  const source = createCerebrauSource("DOC-PARTIAL-AUTHORITY");
  const result = new AuthorityResolver({ enabled: true }).resolve(
    request(
      [source],
      [
        declaration(source.id, {
          completeness: "PARTIAL",
        }),
      ],
    ),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "PARTIAL");
  assert.equal(result.unresolvedAuthorityConflicts.length, 0);
});

test("AuthorityResolver never invents authority when none is identifiable", () => {
  const source = createCerebrauSource("DOC-UNDECLARED");
  const result = new AuthorityResolver({ enabled: true }).resolve(
    request([source], []),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "UNRESOLVED");
  assert.equal(result.authoritativeSources.length, 0);
  assert.deepEqual(
    result.rejectedSources.map((candidate) => candidate.id),
    ["DOC-UNDECLARED"],
  );
  assert.match(
    result.rejectionReasons[0].reason,
    /No explicit authority declaration/,
  );
});

test("AuthorityResolver preserves an explicit reason for every rejected source", () => {
  const authority = createCerebrauSource("DOC-AUTHORITY");
  const rejected = createCerebrauSource("DOC-REJECTED");
  const result = new AuthorityResolver({ enabled: true }).resolve(
    request(
      [rejected, authority],
      [
        declaration(authority.id),
        declaration(rejected.id, {
          role: "REJECTED",
          rejectionReason: "Source is archived and explicitly non-authoritative.",
        }),
      ],
    ),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "RESOLVED");
  assert.deepEqual(
    result.rejectedSources.map((source) => source.id),
    ["DOC-REJECTED"],
  );
  assert.deepEqual(result.rejectionReasons, [
    {
      sourceId: "DOC-REJECTED",
      reason: "Source is archived and explicitly non-authoritative.",
    },
  ]);
});

test("AuthorityResolver lets an authoritative declaration prevail over support", () => {
  const source = createCerebrauSource("DOC-AUTHORITY");
  const result = new AuthorityResolver({ enabled: true }).resolve(
    request(
      [source],
      [
        declaration(source.id, { role: "SUPPORTING" }),
        declaration(source.id),
      ],
    ),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "RESOLVED");
  assert.deepEqual(
    result.authoritativeSources.map((candidate) => candidate.id),
    ["DOC-AUTHORITY"],
  );
  assert.equal(result.supportingSources.length, 0);
});

test("AuthorityResolver consumes NOVA UX adapter source metadata", () => {
  const uxSource = createUxSource("DOC-UX-NAVIGATION-MATRIX");
  const result = new AuthorityResolver({ enabled: true }).resolve({
    missionId: "NOVA_CORE_MISSION_PREPARATION_ENGINE_MVP_004",
    authorityDomain: "UX_NAVIGATION",
    cerebrauKnowledge: createCerebrauResult([], "ABSENT"),
    novaUxKnowledge: createUxResult([uxSource], "AVAILABLE"),
    authorityDeclarations: [
      {
        sourceId: uxSource.id,
        authorityDomain: "UX_NAVIGATION",
        role: "AUTHORITATIVE",
        completeness: "COMPLETE",
      },
    ],
  });

  assert.ok(result);
  assert.equal(result.resolutionStatus, "RESOLVED");
  assert.equal(result.authoritativeSources[0].origin, "NOVA_UX");
});

test("AuthorityResolver is inert and does not inspect input when Feature Flag is OFF", () => {
  const unreadableRequest = {};
  Object.defineProperty(unreadableRequest, "missionId", {
    get() {
      throw new Error("Feature Flag OFF must not inspect the request.");
    },
  });

  const result = new AuthorityResolver().resolve(
    unreadableRequest as AuthorityResolutionRequest,
  );

  assert.equal(result, null);
});

test("AuthorityResolver returns immutable deterministic decisions", () => {
  const source = createCerebrauSource("DOC-AUTHORITY");
  const resolver = new AuthorityResolver({ enabled: true });
  const input = request([source], [declaration(source.id)]);
  const first = resolver.resolve(input);
  const second = resolver.resolve(input);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.authoritativeSources), true);
  assert.equal(Object.isFrozen(first.authoritativeSources[0]), true);
  assert.equal(Object.isFrozen(first.unresolvedAuthorityConflicts), true);
});
