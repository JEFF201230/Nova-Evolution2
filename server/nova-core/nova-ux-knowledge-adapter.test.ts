import assert from "node:assert/strict";
import test from "node:test";
import {
  NovaUxKnowledgeAdapter,
  type NovaUxKnowledgeIndexInput,
} from "./nova-ux-knowledge-adapter.js";

function createCompleteInput(): NovaUxKnowledgeIndexInput {
  return {
    DOMAINS: [
      {
        id: "WORK",
        root: "NOVA_UX_DOMAINS/WORK",
        routes: ["work.activity", "work"],
      },
      {
        id: "HOME",
        root: "NOVA_UX_DOMAINS/HOME",
        routes: ["home"],
      },
    ],
    ROUTES: [
      {
        id: "work.activity",
        path: "/work/:workId/activity",
        domain: "WORK",
      },
      {
        id: "home",
        path: "/home",
        domain: "HOME",
      },
      {
        id: "work",
        path: "/work",
        domain: "WORK",
      },
    ],
    COMPONENTS: {
      UX: ["Card", "Button", "Card", "Drawer"],
    },
    DOCUMENTS: [
      {
        id: "DOC-UX-SCREEN-INVENTORY",
        domain: "UX_SCREENS",
        authority: "NOVA_USER_NAVIGATION_ARCHITECTURE",
        type: "INVENTORY",
        dependencies: [],
        sourceRoot: "NOVA_UX_SOURCE",
        path: "01_SCREEN_INVENTORY.md.txt",
      },
      {
        id: "DOC-UX-IMPLEMENTATION-MATRIX",
        domain: "UX_COMPONENTS",
        authority: "NOVA_USER_NAVIGATION_ARCHITECTURE",
        type: "MATRIX",
        dependencies: ["DOC-UX-SCREEN-INVENTORY"],
        sourceRoot: "NOVA_UX_SOURCE",
        path: "# 20 — IMPLEMENTATION MATRIX.txt",
      },
      {
        id: "DOC-CEREBRAU-KNOWLEDGE-INDEX",
        domain: "KNOWLEDGE",
        authority: "CEREBRAU_KNOWLEDGE_GOVERNANCE",
        type: "REFERENCE",
        dependencies: [],
        sourceRoot: "CEREBRAU",
        path: "KNOWLEDGE_INDEX.md",
      },
    ],
    UX: {
      knownConflicts: [
        "Route and legacy setView navigation coexist.",
        "NavRail width differs between sources.",
        "NavRail width differs between sources.",
      ],
    },
  };
}

test("NovaUxKnowledgeAdapter is inert by default when the feature flag is OFF", () => {
  const unreadableInput = {};
  Object.defineProperty(unreadableInput, "DOMAINS", {
    get() {
      throw new Error("Feature Flag OFF must not inspect knowledge metadata.");
    },
  });

  const result = new NovaUxKnowledgeAdapter().adapt(unreadableInput);

  assert.equal(result.active, false);
  assert.equal(result.status, "ABSENT");
  assert.equal(result.domains.length, 0);
  assert.equal(result.routes.length, 0);
  assert.equal(result.components.length, 0);
  assert.equal(result.warnings.length, 0);
  assert.equal(result.errors.length, 0);
});

test("NovaUxKnowledgeAdapter resolves deterministic immutable UX knowledge", () => {
  const adapter = new NovaUxKnowledgeAdapter({ enabled: true });
  const input = createCompleteInput();
  const first = adapter.adapt(input);
  const second = adapter.adapt(input);

  assert.equal(first.active, true);
  assert.equal(first.status, "AVAILABLE");
  assert.deepEqual(first, second);
  assert.deepEqual(
    first.domains.map((domain) => domain.id),
    ["HOME", "WORK"],
  );
  assert.deepEqual(
    first.routes.map((route) => route.id),
    ["home", "work", "work.activity"],
  );
  assert.deepEqual(first.components, ["Button", "Card", "Drawer"]);
  assert.deepEqual(first.dependencies, [
    {
      documentId: "DOC-UX-IMPLEMENTATION-MATRIX",
      dependsOn: "DOC-UX-SCREEN-INVENTORY",
    },
  ]);
  assert.deepEqual(first.conflicts, [
    "NavRail width differs between sources.",
    "Route and legacy setView navigation coexist.",
  ]);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.domains), true);
  assert.equal(Object.isFrozen(first.domains[0]), true);
  assert.equal(Object.isFrozen(first.domains[0].routes), true);
});

test("NovaUxKnowledgeAdapter reports ABSENT when enabled without metadata", () => {
  const result = new NovaUxKnowledgeAdapter({ enabled: true }).adapt(undefined);

  assert.equal(result.active, true);
  assert.equal(result.status, "ABSENT");
  assert.deepEqual(
    result.warnings.map((warning) => warning.code),
    ["NUX-W001"],
  );
});

test("NovaUxKnowledgeAdapter reports PARTIAL for route and domain gaps", () => {
  const input = createCompleteInput() as {
    DOMAINS: unknown;
    ROUTES: unknown;
  } & NovaUxKnowledgeIndexInput;
  input.DOMAINS = [
    {
      id: "WORK",
      root: "NOVA_UX_DOMAINS/WORK",
      routes: ["work", "work.missing"],
    },
  ];
  input.ROUTES = [
    {
      id: "work",
      path: "/work",
      domain: "UNKNOWN_DOMAIN",
    },
  ];

  const result = new NovaUxKnowledgeAdapter({ enabled: true }).adapt(input);

  assert.equal(result.status, "PARTIAL");
  assert.deepEqual(
    result.warnings.map((warning) => warning.code),
    ["NUX-W006", "NUX-W007"],
  );
});

test("NovaUxKnowledgeAdapter rejects duplicate route identifiers", () => {
  const input = createCompleteInput() as {
    ROUTES: unknown;
  } & NovaUxKnowledgeIndexInput;
  input.ROUTES = [
    {
      id: "home",
      path: "/home",
      domain: "HOME",
    },
    {
      id: "home",
      path: "/duplicate",
      domain: "HOME",
    },
  ];

  const result = new NovaUxKnowledgeAdapter({ enabled: true }).adapt(input);

  assert.equal(result.status, "ERROR");
  assert.deepEqual(
    result.errors.map((error) => error.code),
    ["NUX-008"],
  );
});

test("NovaUxKnowledgeAdapter selects only indexed UX metadata types", () => {
  const result = new NovaUxKnowledgeAdapter({ enabled: true }).adapt(
    createCompleteInput(),
  );

  assert.deepEqual(
    result.sourceMetadata.map((source) => source.id),
    ["DOC-UX-IMPLEMENTATION-MATRIX", "DOC-UX-SCREEN-INVENTORY"],
  );
  assert.equal(
    result.sourceMetadata.some(
      (source) => source.id === "DOC-CEREBRAU-KNOWLEDGE-INDEX",
    ),
    false,
  );
});

test("NovaUxKnowledgeAdapter never exposes document content", () => {
  const input = createCompleteInput() as {
    DOCUMENTS: Array<Record<string, unknown>>;
  } & NovaUxKnowledgeIndexInput;
  input.DOCUMENTS[0] = {
    ...(input.DOCUMENTS[0] ?? {}),
    content: "DO NOT EXPOSE UX DOCUMENT CONTENT",
    body: {
      rawText: "DO NOT EXPOSE NESTED UX CONTENT",
    },
  };

  const result = new NovaUxKnowledgeAdapter({ enabled: true }).adapt(input);
  const serialized = JSON.stringify(result);

  assert.equal(result.status, "AVAILABLE");
  assert.doesNotMatch(serialized, /DO NOT EXPOSE/);
  assert.doesNotMatch(serialized, /"content"|"body"|"rawText"/);
});

test("NovaUxKnowledgeAdapter reports PARTIAL when required sections are absent", () => {
  const result = new NovaUxKnowledgeAdapter({ enabled: true }).adapt({
    DOMAINS: [
      {
        id: "HOME",
        root: "NOVA_UX_DOMAINS/HOME",
        routes: [],
      },
    ],
  });

  assert.equal(result.status, "PARTIAL");
  assert.deepEqual(
    result.warnings.map((warning) => warning.subject),
    ["COMPONENTS.UX", "DOCUMENTS", "ROUTES", "UX.knownConflicts"],
  );
});

test("NovaUxKnowledgeAdapter rejects malformed metadata sections", () => {
  const result = new NovaUxKnowledgeAdapter({ enabled: true }).adapt({
    ...createCompleteInput(),
    COMPONENTS: {
      UX: {},
    },
  });

  assert.equal(result.status, "ERROR");
  assert.deepEqual(
    result.errors.map((error) => error.code),
    ["NUX-002"],
  );
});
