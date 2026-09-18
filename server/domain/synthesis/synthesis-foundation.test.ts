import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { IntelligenceAssessment, IntelligenceAssessmentContent } from "../intelligence/index.js";
import type { WorkAuthorizedState } from "../work/index.js";
import {
  FileSynthesisJournal,
  MemorySynthesisJournal,
  SynthesisAuthority,
  SynthesisDomainError,
  SynthesisQueries,
  type SynthesisDraft,
  type SynthesisIntelligenceReadSource,
} from "./index.js";

const T0 = "2026-09-17T08:00:00.000Z";
const T1 = "2026-09-17T09:00:00.000Z";
const T2 = "2026-09-17T10:00:00.000Z";
const WORK = Object.freeze({ projectId: "NOVA", workId: "WORK-1" });

function workState(observedAt = T0): WorkAuthorizedState {
  const evidenceItems = ["evidence-1", "evidence-2"].map((evidenceId) => ({
    state: "EVIDENCE_FOUND", evidenceId, lifecycle: "ACTIVE",
    link: { ...WORK, evidenceId, provenance: { source: "test", actor: "owner", causalityId: `link-${evidenceId}` }, linkedAt: T0 },
    evidence: { evidenceId: { value: evidenceId }, lifecycle: "ACTIVE", certificationReference: null },
  }));
  return {
    workReference: WORK,
    compositionObservedAt: observedAt,
    workCore: { availability: "AVAILABLE", value: { identity: WORK } },
    deliverables: { availability: "AVAILABLE_EMPTY", value: { projectId: "NOVA", workId: "WORK-1", deliverables: [] } },
    decisions: { availability: "AVAILABLE_EMPTY", value: { projectId: "NOVA", workId: "WORK-1", decisions: [] } },
    people: { availability: "AVAILABLE_EMPTY", value: { projectId: "NOVA", workId: "WORK-1", status: "NO_PARTICIPANTS" } },
    planning: { availability: "AVAILABLE_EMPTY", value: { projectId: "NOVA", workId: "WORK-1", status: "PLANNING_ABSENT" } },
    actions: { availability: "AVAILABLE_EMPTY", value: { projectId: "NOVA", workId: "WORK-1", status: "ACTIONS_AVAILABLE_EMPTY", actions: [] } },
    evidence: { availability: "AVAILABLE", value: { projectId: "NOVA", workId: "WORK-1", status: "AVAILABLE", sourceDomain: "EVIDENCE", evidences: evidenceItems } },
  } as unknown as WorkAuthorizedState;
}

function content(observedAt = T0): IntelligenceAssessmentContent {
  return Object.freeze({
    question: "What is supported?", scope: "work", method: "certified method", observedAt,
    factualAssertions: Object.freeze([
      Object.freeze({ assertionId: "fact-b", statement: "B", evidenceIds: Object.freeze(["evidence-2"]) as readonly [string, ...string[]] }),
      Object.freeze({ assertionId: "fact-a", statement: "A", evidenceIds: Object.freeze(["evidence-1"]) as readonly [string, ...string[]] }),
    ]),
    hypotheses: Object.freeze([]), interpretations: Object.freeze([]),
    contradictions: Object.freeze([Object.freeze({ contradictionId: "conflict-1", statement: "A and B disagree.", evidenceIds: Object.freeze(["evidence-2", "evidence-1"]) as readonly [string, string, ...string[]] })]),
    limits: Object.freeze([Object.freeze({ limitId: "limit-1", statement: "Observation window is bounded." })]),
    analyses: Object.freeze([Object.freeze({ analysisId: "analysis-1", statement: "Bounded analysis", factualAssertionIds: Object.freeze(["fact-a"]), hypothesisIds: Object.freeze([]), interpretationIds: Object.freeze([]), contradictionIds: Object.freeze(["conflict-1"]), limitIds: Object.freeze(["limit-1"]) })]),
    insights: Object.freeze([Object.freeze({ insightId: "insight-1", statement: "Source-owned insight", analysisId: "analysis-1", factualAssertionIds: Object.freeze(["fact-a"]) })]),
    recommendations: Object.freeze([Object.freeze({ recommendationId: "recommendation-1", statement: "Source-owned recommendation", rationale: "because", analysisId: "analysis-1", factualAssertionIds: Object.freeze(["fact-a"]), rank: 1, rankingMethod: "OWNER_METHOD", effect: "NONE" as const })]),
    evaluations: Object.freeze([]), diagnostics: Object.freeze([]),
  });
}

function assessment(id: string, observedAt = T0): IntelligenceAssessment {
  const revision = Object.freeze({ revision: 1, content: content(observedAt), provenance: Object.freeze({ producer: "INTELLIGENCE_AUTHORITY" as const, actor: "analyst", causationIdentity: `cause-${id}`, producedAt: observedAt }), reason: null });
  return Object.freeze({ assessmentId: id, workReference: WORK, lifecycle: "CURRENT" as const, currentRevision: revision,
    revisions: Object.freeze([revision]), history: Object.freeze([]), withdrawal: null });
}

function source(items: readonly IntelligenceAssessment[]): SynthesisIntelligenceReadSource {
  return { listByWork: () => items };
}

function draft(assessmentId = "assessment-b"): SynthesisDraft {
  return {
    scope: "CURRENT_WORK", audience: "GOVERNANCE", selectedAssessmentIds: [assessmentId],
    elements: [{ elementId: "summary-1", form: "SUMMARY", text: "Selected source-owned situation.",
      sourceReferenceIds: [`INTELLIGENCE:${assessmentId}:R1:FACTUAL_ASSERTION:fact-a`, "WORK_AUTHORIZED_STATE"] }],
  };
}

function establish(authority: SynthesisAuthority, overrides: Partial<Parameters<SynthesisAuthority["establish"]>[0]> = {}) {
  return authority.establish({ synthesisId: "synthesis-1", workState: workState(), draft: draft(), actor: "synthesizer",
    causationIdentity: "cause-establish", idempotencyIdentity: "establish-1", at: new Date(T0), ...overrides });
}

function expectCode(code: string, action: () => unknown): void {
  assert.throws(action, (error: unknown) => error instanceof SynthesisDomainError && error.code === code);
}

test("maintains exactly zero or one current Synthesis per Work", () => {
  const authority = new SynthesisAuthority(new MemorySynthesisJournal(), source([assessment("assessment-b")]));
  establish(authority);
  expectCode("SYNTHESIS_CURRENT_CONFLICT", () => establish(authority, { synthesisId: "synthesis-2", idempotencyIdentity: "establish-2" }));
  assert.equal(new SynthesisQueries(authority).currentByWork(WORK).state, "FOUND");
});

test("selects explicit Intelligence sources and orders every collection deterministically", () => {
  const items = [assessment("assessment-b"), assessment("assessment-a")];
  const first = establish(new SynthesisAuthority(new MemorySynthesisJournal(), source(items)), {
    draft: { ...draft("assessment-b"), selectedAssessmentIds: ["assessment-b", "assessment-a"], elements: [
      { elementId: "z", form: "SUMMARY", text: "Z", sourceReferenceIds: ["WORK_AUTHORIZED_STATE"] },
      { elementId: "a", form: "CONCLUSION", text: "A", sourceReferenceIds: ["INTELLIGENCE:assessment-a:R1:FACTUAL_ASSERTION:fact-a"] },
    ] },
  });
  const second = establish(new SynthesisAuthority(new MemorySynthesisJournal(), source([...items].reverse())), {
    draft: { ...draft("assessment-b"), selectedAssessmentIds: ["assessment-a", "assessment-b"], elements: [
      { elementId: "a", form: "CONCLUSION", text: "A", sourceReferenceIds: ["INTELLIGENCE:assessment-a:R1:FACTUAL_ASSERTION:fact-a"] },
      { elementId: "z", form: "SUMMARY", text: "Z", sourceReferenceIds: ["WORK_AUTHORIZED_STATE"] },
    ] },
  });
  assert.deepEqual(first.currentRevision.content, second.currentRevision.content);
  assert.deepEqual(first.currentRevision.content.elements.map((item) => item.elementId), ["a", "z"]);
  assert.deepEqual(first.currentRevision.content.sources.map((item) => item.sourceReferenceId), [...first.currentRevision.content.sources.map((item) => item.sourceReferenceId)].sort());
});

test("preserves source observation and factual Evidence provenance without copying producer aggregates", () => {
  const input = assessment("assessment-b");
  const result = establish(new SynthesisAuthority(new MemorySynthesisJournal(), source([input])));
  const factual = result.currentRevision.content.sources.find((item) => item.sourceReferenceId.endsWith("FACTUAL_ASSERTION:fact-a"));
  assert.deepEqual(factual, { sourceReferenceId: "INTELLIGENCE:assessment-b:R1:FACTUAL_ASSERTION:fact-a", owner: "INTELLIGENCE", kind: "FACTUAL_ASSERTION",
    assessmentId: "assessment-b", assessmentRevision: 1, elementId: "fact-a", observedAt: T0, evidenceIds: ["evidence-1"] });
  assert.equal(result.currentRevision.content.observationDate, T0);
  assert.equal("factualAssertions" in result.currentRevision.content, false);
  assert.equal("recommendations" in result.currentRevision.content, false);
});

test("makes all selected-source contradictions and limits visible", () => {
  const result = establish(new SynthesisAuthority(new MemorySynthesisJournal(), source([assessment("assessment-b")])));
  assert.deepEqual(result.currentRevision.content.conflicts, [{ conflictId: "assessment-b:conflict-1", statement: "A and B disagree.", sourceReferenceId: "INTELLIGENCE:assessment-b:R1:CONTRADICTION:conflict-1", evidenceIds: ["evidence-1", "evidence-2"] }]);
  assert.deepEqual(result.currentRevision.content.limits, [{ limitId: "assessment-b:limit-1", statement: "Observation window is bounded.", sourceReferenceId: "INTELLIGENCE:assessment-b:R1:LIMIT:limit-1" }]);
});

test("revision, withdrawal, replacement and durable recovery are append-only", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-synthesis-"));
  const path = join(directory, "synthesis.json");
  try {
    let available = [assessment("assessment-b")];
    const authority = new SynthesisAuthority(new FileSynthesisJournal(path), { listByWork: () => available });
    establish(authority);
    available = [assessment("assessment-b", T1)];
    const revised = authority.revise({ synthesisId: "synthesis-1", expectedRevision: 1, reason: "New observation", workState: workState(T1), draft: draft(), actor: "synthesizer", causationIdentity: "cause-revise", idempotencyIdentity: "revise-1", at: new Date(T1) });
    assert.equal(revised.currentRevision.revision, 2);
    assert.equal(revised.revisions[0]?.content.observationDate, T0);
    const withdrawn = authority.withdraw({ synthesisId: "synthesis-1", expectedRevision: 2, reason: "No longer supported", actor: "synthesizer", idempotencyIdentity: "withdraw-1", at: new Date(T2) });
    assert.equal(withdrawn.lifecycle, "WITHDRAWN");
    const replacement = establish(authority, { synthesisId: "synthesis-2", workState: workState(T1), idempotencyIdentity: "establish-2", causationIdentity: "cause-replacement", at: new Date(T2) });
    assert.equal(replacement.lifecycle, "CURRENT");
    const recovered = new SynthesisAuthority(new FileSynthesisJournal(path), source([])).readAll();
    assert.equal(recovered.get("synthesis-1")?.history.length, 3);
    assert.equal(recovered.get("synthesis-2")?.currentRevision.revision, 1);
    const persisted = await readFile(path, "utf8");
    for (const forbidden of ["MissionReport", "runtimeDiagnostic", "confidence", "workCore\":{"]) assert.equal(persisted.includes(forbidden), false);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("distinguishes empty Intelligence from unavailable Intelligence and rejects absent selected sources", () => {
  const empty = establish(new SynthesisAuthority(new MemorySynthesisJournal(), source([])), { draft: { scope: "CURRENT_WORK", audience: "OPERATIONS", elements: [] } });
  assert.equal(empty.currentRevision.content.elements.length, 0);
  assert.deepEqual(empty.currentRevision.content.sources.map((item) => item.sourceReferenceId), ["WORK_AUTHORIZED_STATE"]);
  expectCode("SYNTHESIS_SOURCE_NOT_FOUND", () => establish(new SynthesisAuthority(new MemorySynthesisJournal(), source([]))));
  expectCode("SYNTHESIS_INTELLIGENCE_UNAVAILABLE", () => establish(new SynthesisAuthority(new MemorySynthesisJournal(), { listByWork: () => { throw new Error("offline"); } })));
  const unavailableEvidence = workState() as unknown as { evidence: unknown };
  unavailableEvidence.evidence = { availability: "UNAVAILABLE", reason: "EVIDENCE_READ_UNAVAILABLE" };
  expectCode("SYNTHESIS_EVIDENCE_UNAVAILABLE", () => establish(new SynthesisAuthority(new MemorySynthesisJournal(), source([assessment("assessment-b")])), { workState: unavailableEvidence as WorkAuthorizedState }));
});

test("has no Mission/log/UI/fixture fallback and invents no Confidence", () => {
  const authority = new SynthesisAuthority(new MemorySynthesisJournal(), source([]));
  expectCode("SYNTHESIS_SOURCE_NOT_FOUND", () => establish(authority, { draft: { scope: "CURRENT_WORK", audience: "OPERATIONS", elements: [{ elementId: "fallback", form: "SUMMARY", text: "Not admitted", sourceReferenceIds: ["MISSION_REPORT:last"] }] } }));
  expectCode("SYNTHESIS_SOURCE_NOT_FOUND", () => establish(new SynthesisAuthority(new MemorySynthesisJournal(), source([])), { idempotencyIdentity: "confidence-attempt", draft: { scope: "CURRENT_WORK", audience: "OPERATIONS", elements: [{ elementId: "confidence", form: "SUMMARY", text: "Not admitted", sourceReferenceIds: ["CONFIDENCE:default"] }] } }));
});

test("does not mutate Work, Intelligence, Evidence, Actions, Planning or Recommendations", () => {
  const state = workState(); const intelligence = assessment("assessment-b");
  const beforeState = JSON.stringify(state); const beforeIntelligence = JSON.stringify(intelligence);
  establish(new SynthesisAuthority(new MemorySynthesisJournal(), source([intelligence])), { workState: state });
  assert.equal(JSON.stringify(state), beforeState);
  assert.equal(JSON.stringify(intelligence), beforeIntelligence);
  assert.equal(intelligence.currentRevision.content.recommendations[0]?.effect, "NONE");
});
