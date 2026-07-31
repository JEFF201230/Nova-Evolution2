import assert from "node:assert/strict";
import test from "node:test";
import type {
  MissionPackageBrief,
} from "./mission-brief-builder.js";
import {
  PromptComposer,
} from "./prompt-composer.js";
import {
  PromptValidator,
} from "./prompt-validator.js";

const MISSION_ID = "CEREBRAU-MISSION-PACKAGING-A";

function createBrief(
  overrides: Partial<MissionPackageBrief> = {},
): MissionPackageBrief {
  return {
    missionId: MISSION_ID,
    title: "Mission Packaging",
    objective: "Produire un PromptPackage exécutable.",
    program: null,
    capability: null,
    epic: null,
    feature: null,
    lot: null,
    wave: null,
    authorityDecision: null,
    constraints: ["Feature Flag OFF"],
    dependencies: ["MissionContextBuilder"],
    requiredKnowledge: [],
    requiredArtifacts: [],
    acceptanceCriteria: ["Tests PASS"],
    missingArtifacts: [],
    resolutionStatus: "RESOLVED",
    mission: { id: MISSION_ID, title: "Mission Packaging" },
    scope: ["server/nova-core"],
    allowedFiles: ["server/nova-core/prompt-validator.ts"],
    forbiddenFiles: ["server/runtime/**"],
    expectedArtifacts: ["PromptPackage"],
    risks: [],
    authoritySummary: {
      domain: "PROGRAM_GOVERNANCE",
      resolutionStatus: "RESOLVED",
      authoritativeSourceIds: ["PROGRAM-KNOWLEDGE"],
      supportingSourceIds: [],
      rejectedSourceIds: [],
      conflicts: [],
    },
    uxSummary: { sourceIds: [], domains: [] },
    ...overrides,
  };
}

function compose(brief: MissionPackageBrief): string {
  return new PromptComposer({ enabled: true }).compose(brief)!;
}

test("PromptValidator returns VALID for a complete coherent prompt", () => {
  const brief = createBrief();
  const result = new PromptValidator({ enabled: true }).validate(
    brief,
    compose(brief),
  );

  assert.deepEqual(result, { status: "VALID", issues: [] });
});

test("PromptValidator detects missing mission information and dependencies", () => {
  const brief = createBrief({
    objective: null,
    scope: [],
    dependencies: [],
    expectedArtifacts: [],
    acceptanceCriteria: [],
  });
  const result = new PromptValidator({ enabled: true }).validate(
    brief,
    compose(brief),
  );

  assert.equal(result?.status, "INVALID");
  assert.deepEqual(
    result?.issues.map(({ code }) => code),
    ["PV-002", "PV-003", "PV-004", "PV-005", "PV-006"],
  );
});

test("PromptValidator detects contradictions and absent dependencies", () => {
  const brief = createBrief({
    allowedFiles: ["server/nova-core/shared.ts"],
    forbiddenFiles: ["SERVER\\NOVA-CORE\\SHARED.TS"],
    dependencies: ["MissionContextBuilder"],
    missingArtifacts: ["MissionContextBuilder"],
  });
  const result = new PromptValidator({ enabled: true }).validate(
    brief,
    compose(brief),
  );

  assert.equal(result?.status, "INVALID");
  assert.equal(
    result?.issues.some(({ code }) => code === "PV-008"),
    true,
  );
  assert.equal(
    result?.issues.some(({ code }) => code === "PV-009"),
    true,
  );
  assert.equal(
    result?.issues.some(({ code }) => code === "PV-010"),
    true,
  );
});

test("PromptValidator detects authority conflicts", () => {
  const brief = createBrief({
    resolutionStatus: "PARTIAL",
    authoritySummary: {
      domain: "PROGRAM_GOVERNANCE",
      resolutionStatus: "PARTIAL",
      authoritativeSourceIds: [],
      supportingSourceIds: [],
      rejectedSourceIds: ["CONFLICTING-SOURCE"],
      conflicts: ["AUTH-001: conflicting authority"],
    },
  });
  const result = new PromptValidator({ enabled: true }).validate(
    brief,
    compose(brief),
  );

  assert.equal(result?.status, "INVALID");
  assert.equal(
    result?.issues.some(({ code }) => code === "PV-011"),
    true,
  );
});

test("PromptValidator detects an incomplete or altered prompt", () => {
  const brief = createBrief();
  const prompt = compose(brief).replace(
    "## EXPECTED ARTIFACTS\n- PromptPackage\n\n",
    "",
  );
  const result = new PromptValidator({ enabled: true }).validate(
    brief,
    prompt,
  );

  assert.equal(result?.status, "INVALID");
  assert.deepEqual(
    result?.issues.map(({ code }) => code),
    ["PV-012"],
  );
});

test("PromptValidator returns INVALID for malformed packaging data", () => {
  const brief = {
    ...createBrief(),
    allowedFiles: undefined,
  } as unknown as MissionPackageBrief;
  const result = new PromptValidator({ enabled: true }).validate(
    brief,
    "incomplete",
  );

  assert.equal(result?.status, "INVALID");
  assert.equal(
    result?.issues.some(({ code }) => code === "PV-013"),
    true,
  );
  assert.equal(
    result?.issues.some(({ code }) => code === "PV-012"),
    true,
  );
});

test("PromptValidator is inert when Feature Flag is OFF", () => {
  const unreadable = {};
  Object.defineProperty(unreadable, "mission", {
    get() {
      throw new Error("MissionBrief must not be inspected.");
    },
  });

  assert.equal(
    new PromptValidator().validate(
      unreadable as MissionPackageBrief,
      "",
    ),
    null,
  );
});
