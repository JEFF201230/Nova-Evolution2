import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthoritySourceDeclaration,
} from "./authority-resolver.js";
import type {
  NovaUxKnowledgeIndexInput,
} from "./nova-ux-knowledge-adapter.js";
import {
  UxKnowledgeResolver,
  type MissionRequest,
} from "./ux-knowledge-resolver.js";

function document(
  id: string,
  domain: string,
  type: "INVENTORY" | "MATRIX" | "GRAPH" | "ARCHITECTURE",
  dependencies: readonly string[] = [],
): Record<string, unknown> {
  return {
    id,
    domain,
    authority: "NOVA_USER_NAVIGATION_ARCHITECTURE",
    type,
    dependencies,
    sourceRoot: "NOVA_UX_SOURCE",
    path: `${id}.md`,
  };
}

function completeIndex(
  overrides: Partial<NovaUxKnowledgeIndexInput> = {},
): NovaUxKnowledgeIndexInput {
  return {
    DOMAINS: [
      {
        id: "WORK",
        root: "NOVA_UX_DOMAINS/WORK",
        routes: ["work"],
      },
    ],
    ROUTES: [
      {
        id: "work",
        path: "/work",
        domain: "WORK",
      },
    ],
    COMPONENTS: {
      UX: ["Button", "Card"],
    },
    DOCUMENTS: [
      document("DOC-SCREEN", "UX_SCREENS", "INVENTORY"),
      document("DOC-PAGE", "UX_PAGES", "INVENTORY"),
      document("DOC-LAYOUT", "UX_LAYOUTS", "MATRIX"),
      document("DOC-TOKENS", "UX_DESIGN_TOKENS", "MATRIX"),
      document(
        "DOC-IA",
        "UX_INFORMATION_ARCHITECTURE",
        "ARCHITECTURE",
      ),
    ],
    UX: {
      knownConflicts: [],
    },
    ...overrides,
  };
}

function declaration(
  sourceId: string,
  overrides: Partial<AuthoritySourceDeclaration> = {},
): AuthoritySourceDeclaration {
  return {
    sourceId,
    authorityDomain: "UX_NAVIGATION",
    role: "AUTHORITATIVE",
    completeness: "COMPLETE",
    ...overrides,
  };
}

function missionRequest(
  overrides: Partial<MissionRequest> = {},
): MissionRequest {
  return {
    missionId: "MISSION-UX-001",
    authorityDomain: "UX_NAVIGATION",
    knowledgeIndex: completeIndex(),
    authorityDeclarations: [
      declaration("DOC-SCREEN"),
      declaration("DOC-PAGE"),
      declaration("DOC-LAYOUT"),
      declaration("DOC-TOKENS"),
      declaration("DOC-IA"),
    ],
    ...overrides,
  };
}

test("UxKnowledgeResolver is inert when Feature Flag is OFF", () => {
  let adapterCalls = 0;
  let authorityCalls = 0;
  const resolver = new UxKnowledgeResolver(
    { enabled: false },
    {
      knowledgeAdapter: {
        adapt() {
          adapterCalls += 1;
          throw new Error("adapter must not be called");
        },
      },
      authorityResolver: {
        resolve() {
          authorityCalls += 1;
          throw new Error("resolver must not be called");
        },
      },
    },
  );
  const unreadableRequest = new Proxy({} as MissionRequest, {
    get() {
      throw new Error("request must not be inspected");
    },
  });

  assert.equal(resolver.resolve(unreadableRequest), null);
  assert.equal(adapterCalls, 0);
  assert.equal(authorityCalls, 0);
});

test("UxKnowledgeResolver resolves complete authoritative UX metadata", () => {
  const result = new UxKnowledgeResolver({ enabled: true }).resolve(
    missionRequest(),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "RESOLVED");
  assert.deepEqual(result.screen.map(({ id }) => id), ["DOC-SCREEN"]);
  assert.deepEqual(result.page.map(({ id }) => id), ["DOC-PAGE"]);
  assert.deepEqual(result.route.map(({ id }) => id), ["work"]);
  assert.deepEqual(result.navigation.map(({ id }) => id), ["WORK"]);
  assert.deepEqual(result.layouts.map(({ id }) => id), ["DOC-LAYOUT"]);
  assert.deepEqual(result.components, ["Button", "Card"]);
  assert.deepEqual(result.designTokens.map(({ id }) => id), ["DOC-TOKENS"]);
  assert.deepEqual(
    result.informationArchitecture.map(({ id }) => id),
    ["DOC-IA"],
  );
});

test("UxKnowledgeResolver preserves authority classifications", () => {
  const result = new UxKnowledgeResolver({ enabled: true }).resolve(
    missionRequest({
      authorityDeclarations: [
        declaration("DOC-SCREEN"),
        declaration("DOC-PAGE", {
          role: "SUPPORTING",
        }),
        declaration("DOC-LAYOUT", {
          role: "REJECTED",
          rejectionReason: "Superseded layout metadata.",
        }),
        declaration("DOC-TOKENS", {
          role: "SUPPORTING",
        }),
        declaration("DOC-IA", {
          role: "SUPPORTING",
        }),
      ],
    }),
  );

  assert.ok(result);
  assert.deepEqual(result.authoritativeSources.map(({ id }) => id), [
    "DOC-SCREEN",
  ]);
  assert.deepEqual(result.supportingSources.map(({ id }) => id), [
    "DOC-IA",
    "DOC-PAGE",
    "DOC-TOKENS",
  ]);
  assert.deepEqual(result.rejectedSources.map(({ id }) => id), [
    "DOC-LAYOUT",
  ]);
  assert.deepEqual(result.rejectionReasons.sourceRejections, [
    {
      sourceId: "DOC-LAYOUT",
      reason: "Superseded layout metadata.",
    },
  ]);
});

test("UxKnowledgeResolver propagates UX and authority conflicts", () => {
  const result = new UxKnowledgeResolver({ enabled: true }).resolve(
    missionRequest({
      knowledgeIndex: completeIndex({
        UX: {
          knownConflicts: ["Route and legacy navigation conflict."],
        },
      }),
      authorityDeclarations: [
        declaration("DOC-SCREEN", {
          conflictsWith: ["DOC-PAGE"],
        }),
        declaration("DOC-PAGE"),
        declaration("DOC-LAYOUT"),
        declaration("DOC-TOKENS"),
        declaration("DOC-IA"),
      ],
    }),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "UNRESOLVED");
  assert.deepEqual(result.rejectionReasons.knowledgeConflicts, [
    "Route and legacy navigation conflict.",
  ]);
  assert.deepEqual(
    result.rejectionReasons.authorityConflicts.map(({ code }) => code),
    ["AR-C007"],
  );
});

test("UxKnowledgeResolver reports missing indexed artifacts", () => {
  const result = new UxKnowledgeResolver({ enabled: true }).resolve(
    missionRequest({
      knowledgeIndex: completeIndex({
        DOCUMENTS: [
          document(
            "DOC-SCREEN",
            "UX_SCREENS",
            "INVENTORY",
            ["DOC-MISSING"],
          ),
        ],
      }),
      authorityDeclarations: [declaration("DOC-SCREEN")],
    }),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "PARTIAL");
  assert.deepEqual(result.missingArtifacts, ["DOC-MISSING"]);
});

test("UxKnowledgeResolver excludes rejected-source dependencies", () => {
  const result = new UxKnowledgeResolver({ enabled: true }).resolve(
    missionRequest({
      knowledgeIndex: completeIndex({
        DOCUMENTS: [
          document("DOC-SCREEN", "UX_SCREENS", "INVENTORY"),
          document(
            "DOC-PAGE",
            "UX_PAGES",
            "MATRIX",
            ["DOC-SCREEN"],
          ),
        ],
      }),
      authorityDeclarations: [
        declaration("DOC-SCREEN"),
        declaration("DOC-PAGE", {
          role: "REJECTED",
          rejectionReason: "Rejected by UX authority.",
        }),
      ],
    }),
  );

  assert.ok(result);
  assert.deepEqual(result.dependencies, []);
});

test("UxKnowledgeResolver propagates accepted-source dependencies", () => {
  const result = new UxKnowledgeResolver({ enabled: true }).resolve(
    missionRequest({
      knowledgeIndex: completeIndex({
        DOCUMENTS: [
          document("DOC-SCREEN", "UX_SCREENS", "INVENTORY"),
          document(
            "DOC-PAGE",
            "UX_PAGES",
            "MATRIX",
            ["DOC-SCREEN"],
          ),
        ],
      }),
      authorityDeclarations: [
        declaration("DOC-SCREEN"),
        declaration("DOC-PAGE", {
          role: "SUPPORTING",
        }),
      ],
    }),
  );

  assert.ok(result);
  assert.deepEqual(result.dependencies, [
    {
      documentId: "DOC-PAGE",
      dependsOn: "DOC-SCREEN",
    },
  ]);
});

test("UxKnowledgeResolver does not invent absent UX categories", () => {
  const result = new UxKnowledgeResolver({ enabled: true }).resolve(
    missionRequest({
      knowledgeIndex: completeIndex({
        DOCUMENTS: [
          document("DOC-SCREEN", "UX_SCREENS", "INVENTORY"),
        ],
      }),
      authorityDeclarations: [declaration("DOC-SCREEN")],
    }),
  );

  assert.ok(result);
  assert.deepEqual(result.page, []);
  assert.deepEqual(result.layouts, []);
  assert.deepEqual(result.designTokens, []);
  assert.deepEqual(result.informationArchitecture, []);
});

test("UxKnowledgeResolver returns UNRESOLVED for absent knowledge", () => {
  const result = new UxKnowledgeResolver({ enabled: true }).resolve(
    missionRequest({
      knowledgeIndex: null,
      authorityDeclarations: [],
    }),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "UNRESOLVED");
  assert.deepEqual(result.authoritativeSources, []);
});

test("UxKnowledgeResolver rejects an invalid MissionRequest", () => {
  assert.throws(
    () =>
      new UxKnowledgeResolver({ enabled: true }).resolve(
        missionRequest({ missionId: " invalid " }),
      ),
    /UXR-002/,
  );
});

test("UxKnowledgeResolver is deterministic and does not mutate inputs", () => {
  const request = missionRequest();
  const before = JSON.stringify(request);
  const resolver = new UxKnowledgeResolver({ enabled: true });
  const first = resolver.resolve(request);
  const second = resolver.resolve(request);

  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(request), before);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.rejectionReasons), true);
  assert.equal(Object.isFrozen(first.authoritativeSources), true);
  assert.throws(() => {
    (first.components as string[]).push("InventedComponent");
  });
});
