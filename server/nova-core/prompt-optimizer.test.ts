import assert from "node:assert/strict";
import test from "node:test";
import type {
  MissionPackageBrief,
} from "./mission-brief-builder.js";
import {
  PromptComposer,
} from "./prompt-composer.js";
import {
  PromptOptimizer,
} from "./prompt-optimizer.js";
import {
  PromptValidator,
  type PromptValidationResult,
} from "./prompt-validator.js";

const MISSION_ID = "CEREBRAU-MISSION-PACKAGING-A";

function createBrief(): MissionPackageBrief {
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
    allowedFiles: ["server/nova-core/prompt-optimizer.ts"],
    forbiddenFiles: ["server/runtime/**"],
    expectedArtifacts: ["PromptPackage"],
    risks: ["Coût token"],
    authoritySummary: {
      domain: "PROGRAM_GOVERNANCE",
      resolutionStatus: "RESOLVED",
      authoritativeSourceIds: ["PROGRAM-KNOWLEDGE"],
      supportingSourceIds: [],
      rejectedSourceIds: [],
      conflicts: [],
    },
    uxSummary: { sourceIds: [], domains: [] },
  };
}

test("PromptOptimizer generates an immutable validated PromptPackage", () => {
  const brief = createBrief();
  const prompt = new PromptComposer({ enabled: true }).compose(brief)!;
  const validation = new PromptValidator({ enabled: true }).validate(
    brief,
    prompt,
  )!;
  const promptPackage = new PromptOptimizer({
    enabled: true,
  }).optimize(brief, prompt, validation);

  assert.ok(promptPackage);
  assert.equal(promptPackage.missionId, MISSION_ID);
  assert.equal(promptPackage.validationStatus, "VALID");
  assert.equal(promptPackage.prompt.includes("\n\n"), false);
  assert.equal(
    promptPackage.prompt.includes(
      "Produire un PromptPackage exécutable.",
    ),
    true,
  );
  assert.equal(
    promptPackage.optimization.optimizedCharacters <
      promptPackage.optimization.originalCharacters,
    true,
  );
  assert.equal(
    promptPackage.optimization.estimatedTokens,
    Math.ceil(promptPackage.prompt.length / 4),
  );
  assert.equal(Object.isFrozen(promptPackage), true);
  assert.equal(Object.isFrozen(promptPackage.optimization), true);
});

test("PromptOptimizer preserves section order and semantic content", () => {
  const brief = createBrief();
  const prompt = new PromptComposer({ enabled: true }).compose(brief)!;
  const validation = new PromptValidator({ enabled: true }).validate(
    brief,
    prompt,
  )!;
  const promptPackage = new PromptOptimizer({
    enabled: true,
  }).optimize(brief, prompt, validation);

  assert.ok(promptPackage);
  const missionPosition = promptPackage.prompt.indexOf("## MISSION");
  const scopePosition = promptPackage.prompt.indexOf("## SCOPE");
  const acceptancePosition = promptPackage.prompt.indexOf(
    "## ACCEPTANCE CRITERIA",
  );
  assert.equal(
    missionPosition < scopePosition &&
      scopePosition < acceptancePosition,
    true,
  );
  assert.match(
    promptPackage.prompt,
    /## ALLOWED FILES\n- server\/nova-core\/prompt-optimizer\.ts/,
  );
  assert.match(
    promptPackage.prompt,
    /## FORBIDDEN FILES\n- server\/runtime\/\*\*/,
  );
});

test("PromptOptimizer refuses an INVALID prompt", () => {
  const invalid: PromptValidationResult = {
    status: "INVALID",
    issues: [{ code: "PV-012", message: "Prompt incomplete." }],
  };

  assert.equal(
    new PromptOptimizer({ enabled: true }).optimize(
      createBrief(),
      "incomplete",
      invalid,
    ),
    null,
  );
});

test("PromptOptimizer is inert when Feature Flag is OFF", () => {
  const unreadable = {};
  Object.defineProperty(unreadable, "mission", {
    get() {
      throw new Error("MissionBrief must not be inspected.");
    },
  });

  assert.equal(
    new PromptOptimizer().optimize(
      unreadable as MissionPackageBrief,
      "",
      unreadable as PromptValidationResult,
    ),
    null,
  );
});
