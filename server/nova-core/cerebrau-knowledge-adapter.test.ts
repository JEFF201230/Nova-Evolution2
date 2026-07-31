import assert from "node:assert/strict";
import test from "node:test";
import {
  CerebrauKnowledgeAdapter,
  type CerebrauKnowledgeIndexInput,
} from "./cerebrau-knowledge-adapter.js";

function createCompleteInput(
  documents: readonly Record<string, unknown>[],
): CerebrauKnowledgeIndexInput {
  return {
    DOCUMENTS: documents,
    AUTHORITIES: [
      {
        priority: 1,
        id: "MISSION_CURRENT",
        owner: "PROGRAM DIRECTOR",
        scope: "FEATURE-001",
      },
    ],
    PROGRAMS: [
      {
        id: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
        name: "NOVA CORE KNOWLEDGE EVOLUTION",
      },
    ],
    PDS: [
      {
        id: "PDS-001",
        name: "CEREBRAU AI EXECUTION DIRECTOR",
      },
    ],
    MODULES: [
      {
        id: "CEREBRAU-KNOWLEDGE-SYSTEM",
      },
    ],
    SERVICES: [
      {
        id: "CerebrauKnowledgeIndex",
      },
    ],
  };
}

function createDocument(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    id: "DOC-CEREBRAU-KNOWLEDGE-INDEX-SCHEMA",
    domain: "KNOWLEDGE",
    authority: "CEREBRAU_KNOWLEDGE_GOVERNANCE",
    type: "REFERENCE",
    dependencies: [],
    sourceRoot: "CEREBRAU",
    path: "09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_SCHEMA.md",
    ...overrides,
  };
}

test("CerebrauKnowledgeAdapter returns deterministic immutable metadata", () => {
  const adapter = new CerebrauKnowledgeAdapter();
  const input = createCompleteInput([
    createDocument({
      id: "DOC-CEREBRAU-KNOWLEDGE-INDEX-ENGINE",
      type: "ARCHITECTURE",
      dependencies: ["DOC-CEREBRAU-KNOWLEDGE-INDEX-SCHEMA"],
      path: "09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_ENGINE.md",
    }),
    createDocument(),
  ]);

  const first = adapter.adapt(input);
  const second = adapter.adapt(input);

  assert.equal(first.status, "AVAILABLE");
  assert.deepEqual(first, second);
  assert.deepEqual(
    first.sources.map((source) => source.id),
    [
      "DOC-CEREBRAU-KNOWLEDGE-INDEX-ENGINE",
      "DOC-CEREBRAU-KNOWLEDGE-INDEX-SCHEMA",
    ],
  );
  assert.deepEqual(
    first.programReferences.map((reference) => reference.kind),
    ["MODULE", "PDS", "PROGRAM", "SERVICE"],
  );
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.sources), true);
  assert.equal(Object.isFrozen(first.sources[0]), true);
  assert.equal(Object.isFrozen(first.sources[0].dependencies), true);
});

test("CerebrauKnowledgeAdapter reports ABSENT when input metadata is absent", () => {
  const result = new CerebrauKnowledgeAdapter().adapt(undefined);

  assert.equal(result.status, "ABSENT");
  assert.equal(result.sources.length, 0);
  assert.equal(result.errors.length, 0);
  assert.deepEqual(
    result.warnings.map((warning) => warning.code),
    ["CKA-W001"],
  );
});

test("CerebrauKnowledgeAdapter reports PARTIAL for a missing dependency", () => {
  const result = new CerebrauKnowledgeAdapter().adapt(
    createCompleteInput([
      createDocument({
        dependencies: ["DOC-CEREBRAU-MISSING"],
      }),
    ]),
  );

  assert.equal(result.status, "PARTIAL");
  assert.equal(result.sources.length, 1);
  assert.deepEqual(
    result.warnings.map((warning) => warning.code),
    ["CKA-W002"],
  );
  assert.match(result.warnings[0].message, /DOC-CEREBRAU-MISSING/);
});

test("CerebrauKnowledgeAdapter rejects duplicate document identifiers", () => {
  const result = new CerebrauKnowledgeAdapter().adapt(
    createCompleteInput([
      createDocument(),
      createDocument({
        path: "duplicate-path.md",
      }),
    ]),
  );

  assert.equal(result.status, "ERROR");
  assert.equal(result.sources.length, 0);
  assert.deepEqual(
    result.errors.map((error) => error.code),
    ["CKA-004"],
  );
});

test("CerebrauKnowledgeAdapter never exposes document content", () => {
  const result = new CerebrauKnowledgeAdapter().adapt(
    createCompleteInput([
      createDocument({
        content: "DO NOT EXPOSE THIS DOCUMENT CONTENT",
        body: {
          rawText: "DO NOT EXPOSE THIS NESTED CONTENT",
        },
      }),
    ]),
  );
  const serialized = JSON.stringify(result);

  assert.equal(result.status, "AVAILABLE");
  assert.doesNotMatch(serialized, /DO NOT EXPOSE/);
  assert.doesNotMatch(serialized, /"content"|"body"|"rawText"/);
});

test("CerebrauKnowledgeAdapter selects only authorized CEREBRAU domains", () => {
  const result = new CerebrauKnowledgeAdapter().adapt(
    createCompleteInput([
      createDocument(),
      createDocument({
        id: "DOC-UX-NAVIGATION-MATRIX",
        domain: "UX_NAVIGATION",
        authority: "NOVA_USER_NAVIGATION_ARCHITECTURE",
        type: "MATRIX",
        sourceRoot: "NOVA_UX_ARCHITECTURE",
        path: "NOVA_NAVIGATION_MATRIX.md",
      }),
    ]),
  );

  assert.equal(result.status, "AVAILABLE");
  assert.deepEqual(
    result.sources.map((source) => source.id),
    ["DOC-CEREBRAU-KNOWLEDGE-INDEX-SCHEMA"],
  );
});

test("CerebrauKnowledgeAdapter reports PARTIAL when metadata sections are absent", () => {
  const result = new CerebrauKnowledgeAdapter().adapt({
    DOCUMENTS: [createDocument()],
  });

  assert.equal(result.status, "PARTIAL");
  assert.equal(result.warnings.length, 5);
  assert.deepEqual(
    result.warnings.map((warning) => warning.subject),
    ["AUTHORITIES", "MODULES", "PDS", "PROGRAMS", "SERVICES"],
  );
});

test("CerebrauKnowledgeAdapter rejects malformed metadata sections", () => {
  const result = new CerebrauKnowledgeAdapter().adapt({
    ...createCompleteInput([createDocument()]),
    AUTHORITIES: {},
  });

  assert.equal(result.status, "ERROR");
  assert.deepEqual(
    result.errors.map((error) => error.code),
    ["CKA-002"],
  );
});
