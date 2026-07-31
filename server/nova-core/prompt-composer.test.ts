import assert from "node:assert/strict";
import test from "node:test";
import type {
  MissionPackageBrief,
} from "./mission-brief-builder.js";
import {
  PromptComposer,
} from "./prompt-composer.js";

const MISSION_ID = "CEREBRAU-MISSION-PACKAGING-A";

function createBrief(
  overrides: Partial<MissionPackageBrief> = {},
): MissionPackageBrief {
  return {
    missionId: MISSION_ID,
    title: "Mission Packaging",
    objective: "Produire un PromptPackage exécutable.",
    program: null,
    capability: "MISSION_PACKAGING",
    epic: "SUPER-WAVE-A",
    feature: null,
    lot: "MVP",
    wave: null,
    authorityDecision: null,
    constraints: ["Additive only", "Feature Flag OFF"],
    dependencies: ["MissionContextBuilder"],
    requiredKnowledge: [],
    requiredArtifacts: [],
    acceptanceCriteria: ["Tests PASS"],
    missingArtifacts: [],
    resolutionStatus: "RESOLVED",
    mission: {
      id: MISSION_ID,
      title: "Mission Packaging",
    },
    scope: ["server/nova-core"],
    allowedFiles: ["server/nova-core/prompt-composer.ts"],
    forbiddenFiles: ["server/runtime/**"],
    expectedArtifacts: ["PromptPackage"],
    risks: ["Prompt incomplet"],
    authoritySummary: {
      domain: "PROGRAM_GOVERNANCE",
      resolutionStatus: "RESOLVED",
      authoritativeSourceIds: ["PROGRAM-KNOWLEDGE"],
      supportingSourceIds: [],
      rejectedSourceIds: [],
      conflicts: [],
    },
    uxSummary: {
      sourceIds: ["UX-KNOWLEDGE"],
      domains: ["UX_LAYOUTS"],
    },
    ...overrides,
  };
}

test("PromptComposer builds one ordered prompt from the complete MissionBrief", () => {
  const prompt = new PromptComposer({ enabled: true }).compose(
    createBrief(),
  );

  assert.ok(prompt);
  const headings = [
    "MISSION",
    "OBJECTIVE",
    "SCOPE",
    "CONSTRAINTS",
    "ALLOWED FILES",
    "FORBIDDEN FILES",
    "DEPENDENCIES",
    "EXPECTED ARTIFACTS",
    "ACCEPTANCE CRITERIA",
    "RISKS",
    "AUTHORITY",
    "UX",
  ];
  const positions = headings.map((heading) =>
    prompt.indexOf(`## ${heading}`),
  );

  assert.equal(positions.every((position) => position >= 0), true);
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  for (const heading of headings) {
    assert.equal(
      prompt.split(`## ${heading}`).length - 1,
      1,
      `${heading} must occur once`,
    );
  }
});

test("PromptComposer preserves supplied information without inventing values", () => {
  const prompt = new PromptComposer({ enabled: true }).compose(
    createBrief({
      title: null,
      mission: { id: MISSION_ID, title: null },
      risks: [],
      uxSummary: { sourceIds: [], domains: [] },
    }),
  );

  assert.ok(prompt);
  assert.equal(prompt.includes("title:"), false);
  assert.equal(prompt.includes("undefined"), false);
  assert.equal(prompt.includes("null"), false);
  assert.match(prompt, /## RISKS\n- \(none\)/);
  assert.match(prompt, /## UX\n- \(none\)/);
});

test("PromptComposer does not mutate the MissionBrief", () => {
  const brief = createBrief();
  const before = structuredClone(brief);

  new PromptComposer({ enabled: true }).compose(brief);

  assert.deepEqual(brief, before);
});

test("PromptComposer is inert when Feature Flag is OFF", () => {
  const unreadable = {};
  Object.defineProperty(unreadable, "mission", {
    get() {
      throw new Error("MissionBrief must not be inspected.");
    },
  });

  assert.equal(
    new PromptComposer().compose(
      unreadable as MissionPackageBrief,
    ),
    null,
  );
});
