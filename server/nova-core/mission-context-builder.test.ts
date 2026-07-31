import assert from "node:assert/strict";
import test from "node:test";
import {
  MissionContextBuilder,
  type MissionContextBuildRequest,
  type MissionContextBuilderDependencies,
} from "./mission-context-builder.js";
import type {
  ProgramKnowledgeResolution,
  ProgramKnowledgeResolutionRequest,
} from "./program-knowledge-resolver.js";
import type {
  MissionRequest as UxKnowledgeMissionRequest,
  UxKnowledgeResolution,
} from "./ux-knowledge-resolver.js";

const MISSION_ID = "NOVA_CORE_MISSION_CONTEXT_MVP_008";

type AuthorityDecision =
  NonNullable<ProgramKnowledgeResolution["authorityDecision"]>;
type KnowledgeSource =
  UxKnowledgeResolution["authoritativeSources"][number];

const PROGRAM_SOURCE: KnowledgeSource = {
  id: "DOC-PROGRAM",
  domain: "PROGRAM_GOVERNANCE",
  authority: "MISSION_CURRENT",
  type: "PROGRAM",
  sourceRoot: "CEREBRAU",
  path: "PROGRAM_REGISTER.md",
  origin: "CEREBRAU",
};

const UX_SOURCE: KnowledgeSource = {
  id: "DOC-UX",
  domain: "UX_NAVIGATION",
  authority: "NOVA_USER_NAVIGATION_ARCHITECTURE",
  type: "GRAPH",
  sourceRoot: "NOVA_UX_ARCHITECTURE",
  path: "NOVA_NAVIGATION_MAP.md",
  origin: "NOVA_UX",
};

const AUTHORITY_DECISION: AuthorityDecision = {
  missionId: MISSION_ID,
  authorityDomain: "PROGRAM_GOVERNANCE",
  authoritativeSources: [PROGRAM_SOURCE],
  supportingSources: [UX_SOURCE],
  rejectedSources: [],
  rejectionReasons: [],
  unresolvedAuthorityConflicts: [],
  resolutionStatus: "RESOLVED",
};

function createProgramKnowledge(
  overrides: Partial<ProgramKnowledgeResolution> = {},
): ProgramKnowledgeResolution {
  return {
    missionId: MISSION_ID,
    program: {
      kind: "PROGRAM",
      id: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
      name: "NOVA CORE KNOWLEDGE EVOLUTION",
    },
    capability: "MISSION PREPARATION ENGINE",
    epic: "NOVA KNOWLEDGE RUNTIME",
    feature: "FEATURE-001",
    lot: "LOT-04",
    wave: {
      id: "WAVE-08",
      lot: "LOT-04",
      name: "Mission Context Builder",
      status: "ACTIVE",
    },
    gates: ["GATE-CONTEXT"],
    prerequisites: ["WAVE-07"],
    dependencies: ["AuthorityResolver", "DOC-CEREBRAU", "DOC-SHARED"],
    authorityDecision: AUTHORITY_DECISION,
    missingArtifacts: [],
    requiredDocumentIds: ["DOC-PROGRAM"],
    serviceIds: ["ProgramProvider"],
    pdsIds: ["PDS-001"],
    resolutionStatus: "RESOLVED",
    ...overrides,
  };
}

function createUxKnowledge(
  overrides: Partial<UxKnowledgeResolution> = {},
): UxKnowledgeResolution {
  return {
    screen: [],
    page: [],
    route: [],
    navigation: [],
    layouts: [],
    components: [],
    designTokens: [],
    informationArchitecture: [],
    dependencies: [
      {
        documentId: "DOC-UX",
        dependsOn: "DOC-UX-DEPENDENCY",
      },
    ],
    authoritativeSources: [],
    supportingSources: [UX_SOURCE],
    rejectedSources: [],
    rejectionReasons: {
      sourceRejections: [],
      knowledgeConflicts: [],
      authorityConflicts: [],
    },
    missingArtifacts: [],
    resolutionStatus: "RESOLVED",
    ...overrides,
  };
}

const PROGRAM_REQUEST = {
  missionId: MISSION_ID,
} as ProgramKnowledgeResolutionRequest;

const UX_REQUEST = {
  missionId: MISSION_ID,
} as UxKnowledgeMissionRequest;

function createRequest(
  overrides: Partial<MissionContextBuildRequest> = {},
): MissionContextBuildRequest {
  return {
    mission: {
      id: MISSION_ID,
      objective: "Construire le contexte minimal de mission.",
      constraints: ["Runtime inchangé", "Feature Flag OFF"],
      acceptanceCriteria: ["Contexte déterministe", "Aucune régression"],
      reusedArtifacts: ["DOC-PROGRAM", "MISSION-SPEC"],
      missingArtifacts: [],
    },
    programKnowledge: PROGRAM_REQUEST,
    uxKnowledge: UX_REQUEST,
    ...overrides,
  };
}

function createBuilder(
  overrides: {
    readonly programKnowledge?: ProgramKnowledgeResolution | null;
    readonly uxKnowledge?: UxKnowledgeResolution | null;
    readonly order?: string[];
  } = {},
): MissionContextBuilder {
  const dependencies: MissionContextBuilderDependencies = {
    programKnowledgeResolver: {
      resolve() {
        overrides.order?.push("ProgramKnowledgeResolver");
        return overrides.programKnowledge === undefined
          ? createProgramKnowledge()
          : overrides.programKnowledge;
      },
    },
    uxKnowledgeResolver: {
      resolve() {
        overrides.order?.push("UxKnowledgeResolver");
        return overrides.uxKnowledge === undefined
          ? createUxKnowledge()
          : overrides.uxKnowledge;
      },
    },
  };

  return new MissionContextBuilder({ enabled: true }, dependencies);
}

test("MissionContextBuilder orchestrates certified resolvers in order", () => {
  const order: string[] = [];
  const context = createBuilder({ order }).build(createRequest());

  assert.ok(context);
  assert.deepEqual(order, [
    "ProgramKnowledgeResolver",
    "UxKnowledgeResolver",
  ]);
});

test("MissionContextBuilder constructs the same mission context contract", () => {
  const context = createBuilder().build(createRequest());

  assert.ok(context);
  assert.equal(context.mission.id, MISSION_ID);
  assert.equal(context.program?.id, "NOVA-CORE-KNOWLEDGE-EVOLUTION");
  assert.equal(context.capability, "MISSION PREPARATION ENGINE");
  assert.equal(context.epic, "NOVA KNOWLEDGE RUNTIME");
  assert.equal(context.feature, "FEATURE-001");
  assert.equal(context.lot, "LOT-04");
  assert.equal(context.wave?.id, "WAVE-08");
  assert.equal(context.authority, "PROGRAM_GOVERNANCE");
  assert.equal(context.resolutionStatus, "RESOLVED");
});

test("MissionContextBuilder propagates and deduplicates resolver dependencies", () => {
  const context = createBuilder().build(createRequest());

  assert.ok(context);
  assert.deepEqual(context.dependencies, [
    "AuthorityResolver",
    "DOC-CEREBRAU",
    "DOC-SHARED",
    "DOC-UX-DEPENDENCY",
  ]);
});

test("MissionContextBuilder propagates mission constraints and acceptance criteria", () => {
  const context = createBuilder().build(
    createRequest({
      mission: {
        id: MISSION_ID,
        constraints: [
          "Runtime inchangé",
          "Feature Flag OFF",
          "Runtime inchangé",
        ],
        acceptanceCriteria: [
          "Tous les tests PASS",
          "Tous les tests PASS",
        ],
      },
    }),
  );

  assert.ok(context);
  assert.deepEqual(context.constraints, [
    "Runtime inchangé",
    "Feature Flag OFF",
  ]);
  assert.deepEqual(context.acceptanceCriteria, ["Tous les tests PASS"]);
});

test("MissionContextBuilder preserves missing artifacts without duplication", () => {
  const context = createBuilder({
    programKnowledge: createProgramKnowledge({
      missingArtifacts: ["GATE-DECISION", "LATEST-LOT"],
      resolutionStatus: "PARTIAL",
    }),
    uxKnowledge: createUxKnowledge({
      missingArtifacts: ["UX-INVENTORY", "GATE-DECISION"],
      resolutionStatus: "PARTIAL",
    }),
  }).build(
    createRequest({
      mission: {
        id: MISSION_ID,
        missingArtifacts: ["GATE-DECISION", "GATE-DECISION"],
      },
    }),
  );

  assert.ok(context);
  assert.deepEqual(context.missingArtifacts, [
    "GATE-DECISION",
    "LATEST-LOT",
    "UX-INVENTORY",
  ]);
  assert.equal(context.resolutionStatus, "PARTIAL");
});

test("MissionContextBuilder consumes authority only from resolver results", () => {
  const ignoredDirectDecision: AuthorityDecision = {
    ...AUTHORITY_DECISION,
    authorityDomain: "IGNORED_DIRECT_AUTHORITY",
  };
  const context = createBuilder().build(
    createRequest({
      authorityDecision: ignoredDirectDecision,
    }),
  );

  assert.ok(context);
  assert.equal(context.authorityDecision, AUTHORITY_DECISION);
  assert.equal(context.authority, "PROGRAM_GOVERNANCE");
});

test("MissionContextBuilder excludes rejected resolver sources and dependencies", () => {
  const rejectedSource: KnowledgeSource = {
    id: "DOC-REJECTED",
    domain: "UX_NAVIGATION",
    authority: "NOVA_USER_NAVIGATION_ARCHITECTURE",
    type: "GRAPH",
    sourceRoot: "NOVA_UX_ARCHITECTURE",
    path: "REJECTED.md",
    origin: "NOVA_UX",
  };
  const context = createBuilder({
    programKnowledge: createProgramKnowledge({
      dependencies: ["DOC-REJECTED", "DOC-SAFE"],
    }),
    uxKnowledge: createUxKnowledge({
      supportingSources: [UX_SOURCE, rejectedSource],
      rejectedSources: [rejectedSource],
      dependencies: [
        {
          documentId: "DOC-REJECTED",
          dependsOn: "DOC-REJECTED-DEPENDENCY",
        },
      ],
    }),
  }).build(createRequest());

  assert.ok(context);
  assert.equal(
    context.knowledgeSources.some((source) => source.id === "DOC-REJECTED"),
    false,
  );
  assert.equal(context.dependencies.includes("DOC-REJECTED"), false);
  assert.equal(
    context.dependencies.includes("DOC-REJECTED-DEPENDENCY"),
    false,
  );
});

test("MissionContextBuilder deduplicates reused artifacts and knowledge sources", () => {
  const authorityDecision: AuthorityDecision = {
    ...AUTHORITY_DECISION,
    authoritativeSources: [PROGRAM_SOURCE, UX_SOURCE],
    supportingSources: [UX_SOURCE],
  };
  const context = createBuilder({
    programKnowledge: createProgramKnowledge({
      authorityDecision,
      requiredDocumentIds: ["DOC-PROGRAM", "DOC-PROGRAM"],
      serviceIds: ["ProgramProvider", "ProgramProvider"],
      pdsIds: ["PDS-001", "PDS-001"],
    }),
    uxKnowledge: createUxKnowledge({
      authoritativeSources: [UX_SOURCE],
      supportingSources: [UX_SOURCE],
    }),
  }).build(createRequest());

  assert.ok(context);
  assert.deepEqual(
    context.knowledgeSources.map((source) => source.id),
    ["DOC-PROGRAM", "DOC-UX"],
  );
  assert.deepEqual(context.reusedArtifacts, [
    "DOC-PROGRAM",
    "MISSION-SPEC",
    "PDS-001",
    "ProgramProvider",
  ]);
});

test("MissionContextBuilder is inert and does not call resolvers when Feature Flag is OFF", () => {
  let resolverCalls = 0;
  const builder = new MissionContextBuilder(
    { enabled: false },
    {
      programKnowledgeResolver: {
        resolve() {
          resolverCalls += 1;
          throw new Error("Program resolver must not be called.");
        },
      },
      uxKnowledgeResolver: {
        resolve() {
          resolverCalls += 1;
          throw new Error("UX resolver must not be called.");
        },
      },
    },
  );
  const unreadableRequest = new Proxy({} as MissionContextBuildRequest, {
    get() {
      throw new Error("Feature Flag OFF must not inspect the request.");
    },
  });

  assert.equal(builder.build(unreadableRequest), null);
  assert.equal(resolverCalls, 0);
});

test("MissionContextBuilder accepts an already-certified Program resolver result", () => {
  let programResolverCalls = 0;
  let uxResolverCalls = 0;
  const builder = new MissionContextBuilder(
    { enabled: true },
    {
      programKnowledgeResolver: {
        resolve() {
          programResolverCalls += 1;
          return null;
        },
      },
      uxKnowledgeResolver: {
        resolve() {
          uxResolverCalls += 1;
          return null;
        },
      },
    },
  );
  const context = builder.build(
    createRequest({
      programKnowledge: createProgramKnowledge(),
      uxKnowledge: createUxKnowledge(),
    }),
  );

  assert.ok(context);
  assert.equal(programResolverCalls, 0);
  assert.equal(uxResolverCalls, 0);
});

test("MissionContextBuilder returns deterministic immutable context without mutating inputs", () => {
  const builder = createBuilder();
  const request = createRequest();
  const before = structuredClone(request);
  const first = builder.build(request);
  const second = builder.build(request);

  assert.deepEqual(first, second);
  assert.deepEqual(request, before);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.mission), true);
  assert.equal(Object.isFrozen(first.dependencies), true);
  assert.equal(Object.isFrozen(first.knowledgeSources), true);
  assert.equal(Object.isFrozen(first.missingArtifacts), true);
});

test("MissionContextBuilder propagates Program resolver failures", () => {
  assert.throws(
    () =>
      createBuilder({ programKnowledge: null }).build(createRequest()),
    /MCB-006/,
  );
});

test("MissionContextBuilder propagates UX resolver failures", () => {
  assert.throws(
    () => createBuilder({ uxKnowledge: null }).build(createRequest()),
    /MCB-007/,
  );
});
