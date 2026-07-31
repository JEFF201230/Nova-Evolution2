import assert from "node:assert/strict";
import test from "node:test";
import {
  AuthorityResolver,
  type AuthoritySourceDeclaration,
} from "./authority-resolver.js";
import {
  CerebrauKnowledgeAdapter,
} from "./cerebrau-knowledge-adapter.js";
import {
  MissionBriefBuilder,
} from "./mission-brief-builder.js";
import {
  MissionContextBuilder,
} from "./mission-context-builder.js";
import {
  MissionPipeline,
  type MissionPipelineComponents,
  type MissionPipelineRequest,
} from "./mission-pipeline.js";
import {
  NovaUxKnowledgeAdapter,
} from "./nova-ux-knowledge-adapter.js";
import {
  ProgramKnowledgeResolver,
} from "./program-knowledge-resolver.js";

const MISSION_ID = "NOVA_CORE_MISSION_PIPELINE_MVP_009";

const AUTHORITY_DECLARATIONS: readonly AuthoritySourceDeclaration[] = [
  {
    sourceId: "DOC-PROGRAM",
    authorityDomain: "PROGRAM_GOVERNANCE",
    role: "AUTHORITATIVE",
    completeness: "COMPLETE",
  },
];

function createRequest(
  overrides: Partial<MissionPipelineRequest> = {},
): MissionPipelineRequest {
  return {
    mission: {
      id: MISSION_ID,
      title: "Mission Pipeline Integration",
      objective: "Préparer un MissionBrief sans exécuter la mission.",
      constraints: ["Runtime inchangé", "Aucun appel Codex"],
      acceptanceCriteria: ["MissionBrief traçable", "Tous les tests PASS"],
      reusedArtifacts: ["DOC-PROGRAM", "ProgramProvider"],
      missingArtifacts: [],
    },
    knowledgeIndex: {
      generatedFor: {
        program: "NOVA CORE KNOWLEDGE EVOLUTION",
        capability: "MISSION PREPARATION ENGINE",
        epic: "NOVA KNOWLEDGE RUNTIME",
        feature: "FEATURE-001",
        lot: "LOT-05",
        wave: "WAVE-09",
      },
      DOCUMENTS: [
        {
          id: "DOC-PROGRAM",
          domain: "PROGRAM_GOVERNANCE",
          authority: "MISSION_CURRENT",
          type: "PROGRAM",
          dependencies: ["DOC-PROGRAM-BASE"],
          sourceRoot: "CEREBRAU",
          path: "PROGRAM_REGISTER.md",
        },
        {
          id: "DOC-UX",
          domain: "UX_NAVIGATION",
          authority: "NOVA_USER_NAVIGATION_ARCHITECTURE",
          type: "GRAPH",
          dependencies: [],
          sourceRoot: "NOVA_UX_ARCHITECTURE",
          path: "NOVA_NAVIGATION_MAP.md",
        },
        {
          id: "DOC-PROGRAM-BASE",
          domain: "KNOWLEDGE",
          authority: "CEREBRAU_KNOWLEDGE_GOVERNANCE",
          type: "REFERENCE",
          dependencies: [],
          sourceRoot: "CEREBRAU",
          path: "PROGRAM_BASE.md",
        },
      ],
      AUTHORITIES: [
        {
          id: "MISSION_CURRENT",
          priority: 1,
          owner: "PROGRAM DIRECTOR",
          scope: "PROGRAM_GOVERNANCE",
        },
      ],
      PROGRAMS: [
        {
          id: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
          name: "NOVA CORE KNOWLEDGE EVOLUTION",
          capability: "MISSION PREPARATION ENGINE",
          epic: "NOVA KNOWLEDGE RUNTIME",
          feature: "FEATURE-001",
        },
      ],
      PDS: [
        {
          id: "PDS-001",
          name: "CEREBRAU AI EXECUTION DIRECTOR",
        },
      ],
      MODULES: [],
      SERVICES: [
        {
          id: "ProgramProvider",
          name: "Program Provider",
        },
      ],
      WAVES: [
        {
          id: "WAVE-09",
          lot: "LOT-05",
          name: "Mission Pipeline Integration",
          status: "ACTIVE",
          gates: ["GATE-PIPELINE"],
          prerequisites: ["WAVE-08"],
          dependencies: ["MissionContextBuilder", "MissionBriefBuilder"],
          requiredArtifacts: ["DOC-PROGRAM"],
        },
      ],
    },
    authorityDomain: "PROGRAM_GOVERNANCE",
    authorityDeclarations: AUTHORITY_DECLARATIONS,
    requiredArtifacts: ["DOC-PROGRAM"],
    ...overrides,
  };
}

function createRealComponents(
  order?: string[],
): MissionPipelineComponents {
  const cerebrauKnowledgeAdapter = new CerebrauKnowledgeAdapter();
  const novaUxKnowledgeAdapter = new NovaUxKnowledgeAdapter({
    enabled: true,
  });
  const authorityResolver = new AuthorityResolver({ enabled: true });
  const programKnowledgeResolver = new ProgramKnowledgeResolver({
    enabled: true,
  });
  const missionContextBuilder = new MissionContextBuilder({
    enabled: true,
  });
  const missionBriefBuilder = new MissionBriefBuilder({
    enabled: true,
  });

  return {
    cerebrauKnowledgeAdapter: {
      adapt(input) {
        order?.push("CerebrauKnowledgeAdapter");
        return cerebrauKnowledgeAdapter.adapt(input);
      },
    },
    novaUxKnowledgeAdapter: {
      adapt(input) {
        order?.push("NovaUxKnowledgeAdapter");
        return novaUxKnowledgeAdapter.adapt(input);
      },
    },
    authorityResolver: {
      resolve(request) {
        order?.push("AuthorityResolver");
        return authorityResolver.resolve(request);
      },
    },
    programKnowledgeResolver: {
      resolve(request) {
        order?.push("ProgramKnowledgeResolver");
        return programKnowledgeResolver.resolve(request);
      },
    },
    missionContextBuilder: {
      build(request) {
        order?.push("MissionContextBuilder");
        return missionContextBuilder.build(request);
      },
    },
    missionBriefBuilder: {
      build(context) {
        order?.push("MissionBriefBuilder");
        return missionBriefBuilder.build(context);
      },
    },
  };
}

test("MissionPipeline orchestrates the complete preparation chain", () => {
  const brief = new MissionPipeline({ enabled: true }).prepare(
    createRequest(),
  );

  assert.ok(brief);
  assert.equal(brief.missionId, MISSION_ID);
  assert.equal(brief.title, "Mission Pipeline Integration");
  assert.equal(brief.program?.id, "NOVA-CORE-KNOWLEDGE-EVOLUTION");
  assert.equal(brief.wave?.id, "WAVE-09");
  assert.equal(brief.resolutionStatus, "RESOLVED");
});

test("MissionPipeline executes certified components in the required order", () => {
  const order: string[] = [];
  const pipeline = new MissionPipeline(
    { enabled: true },
    createRealComponents(order),
  );

  assert.ok(pipeline.prepare(createRequest()));
  assert.deepEqual(order, [
    "CerebrauKnowledgeAdapter",
    "NovaUxKnowledgeAdapter",
    "AuthorityResolver",
    "ProgramKnowledgeResolver",
    "MissionContextBuilder",
    "MissionBriefBuilder",
  ]);
});

test("MissionPipeline propagates component errors and stops orchestration", () => {
  const expectedError = new Error("Adapter failure");
  const order: string[] = [];
  const components = createRealComponents(order);
  const pipeline = new MissionPipeline(
    { enabled: true },
    {
      ...components,
      cerebrauKnowledgeAdapter: {
        adapt() {
          order.push("CerebrauKnowledgeAdapter");
          throw expectedError;
        },
      },
    },
  );

  assert.throws(() => pipeline.prepare(createRequest()), expectedError);
  assert.deepEqual(order, ["CerebrauKnowledgeAdapter"]);
});

test("MissionPipeline preserves authority decisions in the MissionBrief", () => {
  const brief = new MissionPipeline({ enabled: true }).prepare(
    createRequest(),
  );

  assert.ok(brief);
  assert.equal(
    brief.authorityDecision?.authorityDomain,
    "PROGRAM_GOVERNANCE",
  );
  assert.deepEqual(
    brief.authorityDecision?.authoritativeSources.map(
      (source) => source.id,
    ),
    ["DOC-PROGRAM"],
  );
  assert.equal(brief.authorityDecision?.resolutionStatus, "RESOLVED");
});

test("MissionPipeline preserves missing artifacts and resolution status", () => {
  const brief = new MissionPipeline({ enabled: true }).prepare(
    createRequest({
      requiredArtifacts: ["DOC-MISSING"],
    }),
  );

  assert.ok(brief);
  assert.ok(
    brief.missingArtifacts.includes("ARTIFACT:DOC-MISSING"),
  );
  assert.equal(brief.resolutionStatus, "PARTIAL");
});

test("MissionPipeline does not duplicate dependencies or artifacts", () => {
  const request = createRequest({
    mission: {
      ...createRequest().mission,
      reusedArtifacts: [
        "DOC-PROGRAM",
        "DOC-PROGRAM",
        "ProgramProvider",
      ],
    },
  });
  const brief = new MissionPipeline({ enabled: true }).prepare(request);

  assert.ok(brief);
  assert.equal(
    new Set(brief.dependencies).size,
    brief.dependencies.length,
  );
  assert.equal(
    new Set(brief.requiredArtifacts).size,
    brief.requiredArtifacts.length,
  );
});

test("MissionPipeline keeps knowledge source traceability", () => {
  const brief = new MissionPipeline({ enabled: true }).prepare(
    createRequest(),
  );

  assert.ok(brief);
  assert.deepEqual(brief.requiredKnowledge, [
    {
      id: "DOC-PROGRAM",
      domain: "PROGRAM_GOVERNANCE",
      authority: "MISSION_CURRENT",
      type: "PROGRAM",
      sourceRoot: "CEREBRAU",
      path: "PROGRAM_REGISTER.md",
      origin: "CEREBRAU",
    },
  ]);
});

test("MissionPipeline reports an unexpected disabled downstream component", () => {
  const components = createRealComponents();
  const pipeline = new MissionPipeline(
    { enabled: true },
    {
      ...components,
      missionBriefBuilder: new MissionBriefBuilder(),
    },
  );

  assert.throws(() => pipeline.prepare(createRequest()), /MP-004/);
});

test("MissionPipeline is inert and does not inspect input when Feature Flag is OFF", () => {
  const unreadableRequest = {};
  Object.defineProperty(unreadableRequest, "knowledgeIndex", {
    get() {
      throw new Error("Feature Flag OFF must not inspect pipeline input.");
    },
  });

  const brief = new MissionPipeline().prepare(
    unreadableRequest as MissionPipelineRequest,
  );

  assert.equal(brief, null);
});
