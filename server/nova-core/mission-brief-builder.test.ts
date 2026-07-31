import assert from "node:assert/strict";
import test from "node:test";
import {
  MissionBriefBuilder,
  type MissionBriefSourceContext,
} from "./mission-brief-builder.js";

const MISSION_ID = "CEREBRAU-MISSION-PACKAGING-A";

function createContext(
  overrides: Partial<MissionBriefSourceContext> = {},
): MissionBriefSourceContext {
  return {
    mission: {
      id: MISSION_ID,
      objective: "Transformer le MissionContext en PromptPackage.",
      title: "Mission Packaging",
    },
    program: {
      kind: "PROGRAM",
      id: "CEREBRAU",
      name: "CEREBRAU PROGRAM",
    },
    capability: "MISSION_PACKAGING",
    epic: "SUPER-WAVE-A",
    feature: "FEATURE-FLAG-OFF",
    lot: "MVP",
    wave: {
      id: "SUPER-WAVE-A",
      lot: "MVP",
      name: "Mission Packaging",
      status: "ACTIVE",
    },
    authority: "PROGRAM_GOVERNANCE",
    authorityDecision: {
      missionId: MISSION_ID,
      authorityDomain: "PROGRAM_GOVERNANCE",
      authoritativeSources: [
        {
          id: "PROGRAM-KNOWLEDGE",
          domain: "PROGRAM_GOVERNANCE",
          authority: "MISSION_CURRENT",
          type: "PROGRAM",
          sourceRoot: "CEREBRAU",
          path: "program-knowledge.json",
          origin: "CEREBRAU",
        },
      ],
      supportingSources: [
        {
          id: "UX-KNOWLEDGE",
          domain: "UX_LAYOUTS",
          authority: "NOVA_UX",
          type: "ARCHITECTURE",
          sourceRoot: "NOVA_UX",
          path: "ux-knowledge.json",
          origin: "NOVA_UX",
        },
      ],
      rejectedSources: [],
      rejectionReasons: [],
      unresolvedAuthorityConflicts: [],
      resolutionStatus: "RESOLVED",
    },
    gates: ["MISSION_PACKAGE_READY"],
    prerequisites: [],
    dependencies: [
      "MissionContextBuilder",
      "ProgramKnowledgeResolver",
      "UxKnowledgeResolver",
      "MissionContextBuilder",
    ],
    knowledgeSources: [
      {
        id: "PROGRAM-KNOWLEDGE",
        domain: "PROGRAM_GOVERNANCE",
        authority: "MISSION_CURRENT",
        type: "PROGRAM",
        sourceRoot: "CEREBRAU",
        path: "program-knowledge.json",
        origin: "CEREBRAU",
      },
      {
        id: "UX-KNOWLEDGE",
        domain: "UX_LAYOUTS",
        authority: "NOVA_UX",
        type: "ARCHITECTURE",
        sourceRoot: "NOVA_UX",
        path: "ux-knowledge.json",
        origin: "NOVA_UX",
      },
    ],
    reusedArtifacts: ["MissionContext"],
    missingArtifacts: [],
    constraints: ["Additive only", "Feature Flag OFF", "Additive only"],
    acceptanceCriteria: [
      "TypeScript PASS",
      "Tests PASS",
      "MISSION_PACKAGE_READY",
    ],
    resolutionStatus: "RESOLVED",
    packaging: {
      scope: ["server/nova-core mission packaging"],
      allowedFiles: [
        "server/nova-core/mission-brief-builder.ts",
        "server/nova-core/prompt-composer.ts",
      ],
      forbiddenFiles: ["server/runtime/**", "server/kernel/**"],
      expectedArtifacts: ["PromptPackage"],
      risks: ["Prompt incomplet", "Conflit d'autorité"],
    },
    ...overrides,
  };
}

test("MissionBriefBuilder creates the complete MissionBrief without duplication", () => {
  const brief = new MissionBriefBuilder({ enabled: true }).build(
    createContext(),
  );

  assert.ok(brief);
  assert.deepEqual(brief.mission, {
    id: MISSION_ID,
    title: "Mission Packaging",
  });
  assert.equal(
    brief.objective,
    "Transformer le MissionContext en PromptPackage.",
  );
  assert.deepEqual(brief.scope, [
    "server/nova-core mission packaging",
  ]);
  assert.deepEqual(brief.constraints, [
    "Additive only",
    "Feature Flag OFF",
  ]);
  assert.deepEqual(brief.allowedFiles, [
    "server/nova-core/mission-brief-builder.ts",
    "server/nova-core/prompt-composer.ts",
  ]);
  assert.deepEqual(brief.forbiddenFiles, [
    "server/runtime/**",
    "server/kernel/**",
  ]);
  assert.deepEqual(brief.dependencies, [
    "MissionContextBuilder",
    "ProgramKnowledgeResolver",
    "UxKnowledgeResolver",
  ]);
  assert.deepEqual(brief.expectedArtifacts, ["PromptPackage"]);
  assert.deepEqual(brief.acceptanceCriteria, [
    "TypeScript PASS",
    "Tests PASS",
    "MISSION_PACKAGE_READY",
  ]);
  assert.deepEqual(brief.risks, [
    "Prompt incomplet",
    "Conflit d'autorité",
  ]);
});

test("MissionBriefBuilder derives authority and UX summaries only from context", () => {
  const brief = new MissionBriefBuilder({ enabled: true }).build(
    createContext(),
  );

  assert.ok(brief);
  assert.deepEqual(brief.authoritySummary, {
    domain: "PROGRAM_GOVERNANCE",
    resolutionStatus: "RESOLVED",
    authoritativeSourceIds: ["PROGRAM-KNOWLEDGE"],
    supportingSourceIds: ["UX-KNOWLEDGE"],
    rejectedSourceIds: [],
    conflicts: [],
  });
  assert.deepEqual(brief.uxSummary, {
    sourceIds: ["UX-KNOWLEDGE"],
    domains: ["UX_LAYOUTS"],
  });
});

test("MissionBriefBuilder derives scope from certified hierarchy when absent", () => {
  const context = createContext({ packaging: undefined });
  const brief = new MissionBriefBuilder({ enabled: true }).build(context);

  assert.ok(brief);
  assert.deepEqual(brief.scope, [
    "PROGRAM:CEREBRAU",
    "CAPABILITY:MISSION_PACKAGING",
    "EPIC:SUPER-WAVE-A",
    "FEATURE:FEATURE-FLAG-OFF",
    "LOT:MVP",
    "WAVE:SUPER-WAVE-A",
  ]);
  assert.deepEqual(brief.allowedFiles, []);
  assert.deepEqual(brief.expectedArtifacts, []);
  assert.deepEqual(brief.risks, []);
});

test("MissionBriefBuilder rejects unresolved authority for a resolved context", () => {
  const context = createContext({
    authorityDecision: {
      ...createContext().authorityDecision!,
      resolutionStatus: "UNRESOLVED",
    },
  });

  assert.throws(
    () =>
      new MissionBriefBuilder({ enabled: true }).build(context),
    /MBB-007/,
  );
});

test("MissionBriefBuilder is inert when Feature Flag is OFF", () => {
  const unreadable = {};
  Object.defineProperty(unreadable, "mission", {
    get() {
      throw new Error("MissionContext must not be inspected.");
    },
  });

  assert.equal(
    new MissionBriefBuilder().build(
      unreadable as MissionBriefSourceContext,
    ),
    null,
  );
});

test("MissionBriefBuilder returns immutable deterministic data", () => {
  const builder = new MissionBriefBuilder({ enabled: true });
  const context = createContext();
  const first = builder.build(context);
  const second = builder.build(context);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.scope), true);
  assert.equal(Object.isFrozen(first.authoritySummary), true);
  assert.equal(Object.isFrozen(first.uxSummary), true);
});
