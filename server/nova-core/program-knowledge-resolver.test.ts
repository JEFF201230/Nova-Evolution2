import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  CerebrauKnowledgeResult,
  CerebrauProgramReference,
} from "./cerebrau-knowledge-adapter.js";
import type {
  NovaUxKnowledgeResult,
} from "./nova-ux-knowledge-adapter.js";
import {
  ProgramKnowledgeResolver,
  type ProgramKnowledgeIndexMetadata,
  type ProgramKnowledgeResolutionRequest,
} from "./program-knowledge-resolver.js";

const PROGRAM_REFERENCE: CerebrauProgramReference = {
  kind: "PROGRAM",
  id: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
  name: "NOVA CORE KNOWLEDGE EVOLUTION",
};

const AUTHORITY_DECISION: AuthorityResolutionDecision = {
  missionId: "NOVA_CORE_MISSION_PREPARATION_ENGINE_MVP_005",
  authorityDomain: "KNOWLEDGE",
  authoritativeSources: [
    {
      id: "DOC-PROGRAM",
      domain: "PROGRAM_GOVERNANCE",
      authority: "MISSION_CURRENT",
      type: "PROGRAM",
      sourceRoot: "CEREBRAU",
      path: "PROGRAM_REGISTER.md",
      origin: "CEREBRAU",
    },
  ],
  supportingSources: [],
  rejectedSources: [],
  rejectionReasons: [],
  unresolvedAuthorityConflicts: [],
  resolutionStatus: "RESOLVED",
};

function createIndex(
  overrides: Partial<ProgramKnowledgeIndexMetadata> = {},
): ProgramKnowledgeIndexMetadata {
  return {
    generatedFor: {
      program: "NOVA CORE KNOWLEDGE EVOLUTION",
      capability: "MISSION PREPARATION ENGINE",
      epic: "NOVA KNOWLEDGE RUNTIME",
      feature: "FEATURE-001",
      lot: "LOT-03",
      wave: "WAVE-06",
    },
    PROGRAMS: [
      {
        id: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
        name: "NOVA CORE KNOWLEDGE EVOLUTION",
        capability: "MISSION PREPARATION ENGINE",
        epic: "NOVA KNOWLEDGE RUNTIME",
        feature: "FEATURE-001",
        lot: "LOT-03",
        wave: "WAVE-06",
      },
    ],
    WAVES: [
      {
        id: "WAVE-06",
        lot: "LOT-03",
        name: "PROGRAM Knowledge Resolver",
        status: "NOT_STARTED",
        gates: ["GATE-LOT-03"],
        prerequisites: ["WAVE-05"],
        dependencies: ["CerebrauKnowledgeAdapter", "AuthorityResolver"],
        requiredArtifacts: ["DOC-PROGRAM"],
      },
    ],
    ...overrides,
  };
}

function createKnowledge(
  overrides: Partial<CerebrauKnowledgeResult> = {},
): CerebrauKnowledgeResult {
  return {
    status: "AVAILABLE",
    sources: [
      {
        id: "DOC-PROGRAM",
        domain: "PROGRAM_GOVERNANCE",
        authority: "MISSION_CURRENT",
        type: "PROGRAM",
        dependencies: ["DOC-PROGRAM-REGISTER"],
        sourceRoot: "CEREBRAU",
        path: "PROGRAM_REGISTER.md",
      },
    ],
    authorities: [],
    programReferences: [PROGRAM_REFERENCE, { kind: "SERVICE", id: "ProgramProvider", name: "Program Provider" }, { kind: "PDS", id: "PDS-001", name: "CEREBRAU AI EXECUTION DIRECTOR" }],
    warnings: [],
    errors: [],
    ...overrides,
  };
}

function createNovaUxKnowledge(
  overrides: Partial<NovaUxKnowledgeResult> = {},
): NovaUxKnowledgeResult {
  return {
    active: false,
    status: "ABSENT",
    domains: [],
    routes: [],
    components: [],
    dependencies: [],
    conflicts: [],
    sourceMetadata: [],
    warnings: [],
    errors: [],
    ...overrides,
  };
}

function createRequest(
  overrides: Partial<ProgramKnowledgeResolutionRequest> = {},
): ProgramKnowledgeResolutionRequest {
  return {
    missionId: "NOVA_CORE_MISSION_PREPARATION_ENGINE_MVP_005",
    knowledgeIndex: createIndex(),
    cerebrauKnowledge: createKnowledge(),
    novaUxKnowledge: createNovaUxKnowledge(),
    authorityDecision: AUTHORITY_DECISION,
    ...overrides,
  };
}

test("ProgramKnowledgeResolver resolves a complete mission", () => {
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest(),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "RESOLVED");
  assert.equal(result.program?.id, PROGRAM_REFERENCE.id);
  assert.equal(result.capability, "MISSION PREPARATION ENGINE");
  assert.equal(result.epic, "NOVA KNOWLEDGE RUNTIME");
  assert.equal(result.feature, "FEATURE-001");
  assert.equal(result.lot, "LOT-03");
  assert.equal(result.wave?.id, "WAVE-06");
  assert.deepEqual(result.gates, ["GATE-LOT-03"]);
  assert.deepEqual(result.prerequisites, ["WAVE-05"]);
  assert.deepEqual(result.dependencies, [
    "AuthorityResolver",
    "CerebrauKnowledgeAdapter",
    "DOC-PROGRAM-REGISTER",
  ]);
  assert.deepEqual(result.serviceIds, ["ProgramProvider"]);
  assert.deepEqual(result.pdsIds, ["PDS-001"]);
  assert.deepEqual(result.missingArtifacts, []);
});

test("ProgramKnowledgeResolver reports an absent LOT as PARTIAL", () => {
  const index = createIndex({
    generatedFor: {
      program: "NOVA CORE KNOWLEDGE EVOLUTION",
      capability: "MISSION PREPARATION ENGINE",
      epic: "NOVA KNOWLEDGE RUNTIME",
      feature: "FEATURE-001",
      wave: "WAVE-06",
    },
    PROGRAMS: [
      {
        id: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
        name: "NOVA CORE KNOWLEDGE EVOLUTION",
      },
    ],
    WAVES: [{ id: "WAVE-06", gates: ["GATE-LOT-03"], prerequisites: ["WAVE-05"], dependencies: ["AuthorityResolver"], requiredArtifacts: ["DOC-PROGRAM"] }],
  });
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest({ knowledgeIndex: index }),
  );

  assert.ok(result);
  assert.equal(result.lot, null);
  assert.equal(result.resolutionStatus, "PARTIAL");
  assert.ok(result.missingArtifacts.includes("LOT"));
});

test("ProgramKnowledgeResolver reports an absent WAVE as UNRESOLVED", () => {
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest({
      waveId: "WAVE-MISSING",
      requiredArtifacts: [],
    }),
  );

  assert.ok(result);
  assert.equal(result.wave, null);
  assert.equal(result.resolutionStatus, "UNRESOLVED");
  assert.ok(result.missingArtifacts.includes("WAVE"));
});

test("ProgramKnowledgeResolver reports a missing Gate as PARTIAL", () => {
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest({
      knowledgeIndex: createIndex({
        WAVES: [
          {
            id: "WAVE-06",
            lot: "LOT-03",
            prerequisites: ["WAVE-05"],
            dependencies: ["AuthorityResolver"],
            requiredArtifacts: ["DOC-PROGRAM"],
          },
        ],
      }),
    }),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "PARTIAL");
  assert.ok(result.missingArtifacts.includes("GATES"));
});

test("ProgramKnowledgeResolver reports a missing dependency", () => {
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest({
      knowledgeIndex: createIndex({
        WAVES: [
          {
            id: "WAVE-06",
            lot: "LOT-03",
            gates: ["GATE-LOT-03"],
            prerequisites: ["WAVE-05"],
            requiredArtifacts: ["DOC-PROGRAM"],
          },
        ],
      }),
      cerebrauKnowledge: createKnowledge({
        sources: [
          {
            ...createKnowledge().sources[0],
            dependencies: [],
          },
        ],
      }),
    }),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "PARTIAL");
  assert.ok(result.missingArtifacts.includes("DEPENDENCIES"));
});

test("ProgramKnowledgeResolver propagates an authority conflict", () => {
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest({
      authorityDecision: {
        ...AUTHORITY_DECISION,
        resolutionStatus: "UNRESOLVED",
        unresolvedAuthorityConflicts: [
          {
            code: "AR-C007",
            sourceIds: ["DOC-A", "DOC-B"],
            message: "Contradiction",
          },
        ],
      },
    }),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "UNRESOLVED");
  assert.ok(result.missingArtifacts.includes("AUTHORITY_CONFLICT"));
  assert.equal(result.authorityDecision?.resolutionStatus, "UNRESOLVED");
});

test("ProgramKnowledgeResolver ignores explicitly rejected sources", () => {
  const rejectedSource = {
    id: "DOC-REJECTED",
    domain: "PROGRAM_GOVERNANCE",
    authority: "MISSION_CURRENT",
    type: "PROGRAM",
    sourceRoot: "CEREBRAU",
    path: "REJECTED.md",
    origin: "CEREBRAU" as const,
  };
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest({
      requiredArtifacts: ["DOC-REJECTED"],
      cerebrauKnowledge: createKnowledge({
        sources: [
          ...createKnowledge().sources,
          {
            id: "DOC-REJECTED",
            domain: "PROGRAM_GOVERNANCE",
            authority: "MISSION_CURRENT",
            type: "PROGRAM",
            dependencies: ["DOC-REJECTED-DEPENDENCY"],
            sourceRoot: "CEREBRAU",
            path: "REJECTED.md",
          },
        ],
      }),
      authorityDecision: {
        ...AUTHORITY_DECISION,
        rejectedSources: [rejectedSource],
        rejectionReasons: [
          {
            sourceId: "DOC-REJECTED",
            reason: "Explicitly rejected.",
          },
        ],
      },
    }),
  );

  assert.ok(result);
  assert.deepEqual(result.requiredDocumentIds, ["DOC-PROGRAM"]);
  assert.equal(
    result.dependencies.includes("DOC-REJECTED-DEPENDENCY"),
    false,
  );
  assert.ok(result.missingArtifacts.includes("ARTIFACT:DOC-REJECTED"));
});

test("ProgramKnowledgeResolver uses NOVA UX dependencies only for an authoritative source", () => {
  const uxSource = {
    id: "DOC-UX-PROGRAM",
    domain: "PROGRAM_GOVERNANCE",
    authority: "MISSION_CURRENT",
    type: "GRAPH",
    sourceRoot: "NOVA_UX_ARCHITECTURE",
    path: "PROGRAM_GRAPH.md",
    origin: "NOVA_UX" as const,
  };
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest({
      novaUxKnowledge: createNovaUxKnowledge({
        active: true,
        status: "AVAILABLE",
        dependencies: [
          {
            documentId: "DOC-UX-PROGRAM",
            dependsOn: "DOC-UX-DEPENDENCY",
          },
          {
            documentId: "DOC-UX-SUPPORT",
            dependsOn: "DOC-UX-NOT-AUTHORITATIVE",
          },
        ],
      }),
      authorityDecision: {
        ...AUTHORITY_DECISION,
        authoritativeSources: [
          ...AUTHORITY_DECISION.authoritativeSources,
          uxSource,
        ],
      },
    }),
  );

  assert.ok(result);
  assert.ok(result.dependencies.includes("DOC-UX-DEPENDENCY"));
  assert.equal(
    result.dependencies.includes("DOC-UX-NOT-AUTHORITATIVE"),
    false,
  );
});

test("ProgramKnowledgeResolver never fabricates a missing PROGRAM reference", () => {
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest({
      cerebrauKnowledge: createKnowledge({
        programReferences: [],
      }),
    }),
  );

  assert.ok(result);
  assert.equal(result.program, null);
  assert.equal(result.resolutionStatus, "UNRESOLVED");
  assert.ok(result.missingArtifacts.includes("PROGRAM_REFERENCE"));
});

test("ProgramKnowledgeResolver reports a missing required artifact", () => {
  const result = new ProgramKnowledgeResolver({ enabled: true }).resolve(
    createRequest({
      requiredArtifacts: ["DOC-NOT-IN-INDEX"],
    }),
  );

  assert.ok(result);
  assert.equal(result.resolutionStatus, "PARTIAL");
  assert.ok(result.missingArtifacts.includes("ARTIFACT:DOC-NOT-IN-INDEX"));
});

test("ProgramKnowledgeResolver is inert and does not inspect input when Feature Flag is OFF", () => {
  const unreadableRequest = {};
  Object.defineProperty(unreadableRequest, "missionId", {
    get() {
      throw new Error("Feature Flag OFF must not inspect the request.");
    },
  });

  const result = new ProgramKnowledgeResolver().resolve(
    unreadableRequest as ProgramKnowledgeResolutionRequest,
  );

  assert.equal(result, null);
});

test("ProgramKnowledgeResolver returns deterministic immutable metadata", () => {
  const resolver = new ProgramKnowledgeResolver({ enabled: true });
  const input = createRequest();
  const first = resolver.resolve(input);
  const second = resolver.resolve(input);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.gates), true);
  assert.equal(Object.isFrozen(first.missingArtifacts), true);
});
