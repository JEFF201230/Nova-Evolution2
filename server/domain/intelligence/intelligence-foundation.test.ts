import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { WorkAuthorizedState } from "../work/index.js";
import {
  FileIntelligenceJournal,
  IntelligenceAuthority,
  IntelligenceDomainError,
  IntelligenceQueries,
  MemoryIntelligenceJournal,
  type IntelligenceAssessmentContent,
} from "./index.js";

const T0 = "2026-09-17T08:00:00.000Z";
const T1 = "2026-09-17T09:00:00.000Z";
const T2 = "2026-09-17T10:00:00.000Z";

test("creates the typed Intelligence foundation from admissible Work, Evidence and existing Actions", () => {
  const authority = new IntelligenceAuthority(new MemoryIntelligenceJournal());
  const state = workState();
  const assessment = authority.create(createCommand(state, content()));

  assert.equal(assessment.assessmentId, "assessment-1");
  assert.deepEqual(assessment.workReference, { projectId: "project-1", workId: "work-1" });
  assert.equal(assessment.currentRevision.content.analyses.length, 1);
  assert.equal(assessment.currentRevision.content.insights.length, 1);
  assert.equal(assessment.currentRevision.content.evaluations.length, 1);
  assert.equal(assessment.currentRevision.content.diagnostics.length, 1);
  assert.deepEqual(assessment.currentRevision.content.factualAssertions[0]?.evidenceIds, ["evidence-1"]);
  assert.equal(assessment.currentRevision.content.recommendations[0]?.effect, "NONE");
  assert.throws(() => ((assessment.currentRevision.content.analyses[0] as { statement: string }).statement = "silently rewritten"), TypeError);
});

test("rejects factual assertions without Evidence and fails closed when Evidence authority is unavailable", () => {
  const withoutEvidence = content();
  withoutEvidence.factualAssertions[0] = { ...withoutEvidence.factualAssertions[0]!, evidenceIds: [] as never };
  expectCode("INTELLIGENCE_EVIDENCE_REQUIRED", () => new IntelligenceAuthority(new MemoryIntelligenceJournal()).create(createCommand(workState(), withoutEvidence)));

  const unavailable = workState();
  unavailable.evidence = { availability: "UNAVAILABLE", reason: "EVIDENCE_READ_UNAVAILABLE" } as never;
  expectCode("INTELLIGENCE_EVIDENCE_AUTHORITY_UNAVAILABLE", () => new IntelligenceAuthority(new MemoryIntelligenceJournal()).create(createCommand(unavailable, content())));
});

test("preserves contradictions and limits explicitly without suppressing concurrent Evidence", () => {
  const assessment = new IntelligenceAuthority(new MemoryIntelligenceJournal()).create(createCommand(workState(), content()));
  assert.deepEqual(assessment.currentRevision.content.contradictions, [{
    contradictionId: "contradiction-1",
    statement: "The two admitted observations disagree.",
    evidenceIds: ["evidence-1", "evidence-2"],
  }]);
  assert.deepEqual(assessment.currentRevision.content.limits, [{ limitId: "limit-1", statement: "The observation window is bounded." }]);
  assert.deepEqual(assessment.currentRevision.content.analyses[0]?.contradictionIds, ["contradiction-1"]);
  assert.deepEqual(assessment.currentRevision.content.analyses[0]?.limitIds, ["limit-1"]);
});

test("keeps a general Recommendation out of NBA and deterministically ranks only existing-Action Recommendations", () => {
  const state = workState();
  const authority = new IntelligenceAuthority(new MemoryIntelligenceJournal());
  authority.create(createCommand(state, content()));
  const nba = new IntelligenceQueries(authority).nextBestAction("assessment-1", state);

  assert.equal(nba?.recommendation.recommendationId, "recommendation-a");
  assert.equal(nba?.actionId, "action-a");
  assert.deepEqual(nba?.candidateRecommendationIds, ["recommendation-a", "recommendation-b"]);
  assert.deepEqual(nba?.tiedRecommendationIds, ["recommendation-a", "recommendation-b"]);
  assert.equal(nba?.candidateRecommendationIds.includes("recommendation-general"), false);
  assert.deepEqual(nba?.supportingEvidenceIds, ["evidence-1"]);
});

test("rejects an unresolved ActionId and an unavailable Actions owner when authoritative resolution is required", () => {
  const missing = content();
  missing.recommendations[0] = { ...missing.recommendations[0]!, actionId: "action-absent" };
  expectCode("INTELLIGENCE_ACTION_NOT_FOUND", () => new IntelligenceAuthority(new MemoryIntelligenceJournal()).create(createCommand(workState(), missing)));
  const unavailable = workState();
  unavailable.actions = { availability: "UNAVAILABLE", reason: "ACTIONS_READ_UNAVAILABLE" } as never;
  expectCode("INTELLIGENCE_ACTION_AUTHORITY_UNAVAILABLE", () => new IntelligenceAuthority(new MemoryIntelligenceJournal()).create(createCommand(unavailable, content())));
});

test("has no Action or Planning side effect", () => {
  const state = workState();
  const beforeActions = JSON.stringify(state.actions);
  const beforePlanning = JSON.stringify(state.planning);
  const authority = new IntelligenceAuthority(new MemoryIntelligenceJournal());
  authority.create(createCommand(state, content()));
  new IntelligenceQueries(authority).nextBestAction("assessment-1", state);
  assert.equal(JSON.stringify(state.actions), beforeActions);
  assert.equal(JSON.stringify(state.planning), beforePlanning);
});

test("revision and withdrawal are append-only, recoverable and idempotent", () => {
  const journal = new MemoryIntelligenceJournal();
  const authority = new IntelligenceAuthority(journal);
  const state = workState();
  authority.create(createCommand(state, content()));
  const revisedContent = content();
  revisedContent.question = "What changed in the bounded situation?";
  const revisionCommand = {
    assessmentId: "assessment-1", expectedRevision: 1, reason: "New admitted observation",
    workState: state, content: revisedContent, actor: "analyst", causationIdentity: "cause-2",
    idempotencyIdentity: "revise-1", at: new Date(T1),
  } as const;
  const revised = authority.revise(revisionCommand);
  const replay = authority.revise(revisionCommand);
  assert.equal(revised.currentRevision.revision, 2);
  assert.equal(replay.history.length, 2);
  assert.equal(revised.revisions[0]?.content.question, "What does the admitted evidence show?");
  assert.equal(revised.revisions[1]?.reason, "New admitted observation");

  const withdrawn = authority.withdraw({ assessmentId: "assessment-1", expectedRevision: 2, reason: "No longer applicable", actor: "analyst", idempotencyIdentity: "withdraw-1", at: new Date(T2) });
  const withdrawalReplay = authority.withdraw({ assessmentId: "assessment-1", expectedRevision: 2, reason: "No longer applicable", actor: "analyst", idempotencyIdentity: "withdraw-1", at: new Date(T2) });
  assert.equal(withdrawn.lifecycle, "WITHDRAWN");
  assert.equal(withdrawalReplay.history.length, 3);
  assert.equal(authority.revise(revisionCommand).history.length, 3);
  assert.equal(new IntelligenceQueries(new IntelligenceAuthority(journal)).nextBestAction("assessment-1", state), null);
});

test("an exact creation replay is independent of later source availability", () => {
  const journal = new MemoryIntelligenceJournal();
  const authority = new IntelligenceAuthority(journal);
  authority.create(createCommand(workState(), content()));
  const laterUnavailable = workState();
  laterUnavailable.workCore = { availability: "UNAVAILABLE", reason: "WORK_CORE_READ_UNAVAILABLE" } as never;
  laterUnavailable.evidence = { availability: "UNAVAILABLE", reason: "EVIDENCE_READ_UNAVAILABLE" } as never;
  laterUnavailable.actions = { availability: "UNAVAILABLE", reason: "ACTIONS_READ_UNAVAILABLE" } as never;
  const replay = authority.create(createCommand(laterUnavailable, content()));
  assert.equal(replay.history.length, 1);
  assert.equal(journal.read().length, 1);
});

test("normalizes collection order deterministically", () => {
  const first = new IntelligenceAuthority(new MemoryIntelligenceJournal()).create(createCommand(workState(), content()));
  const reversed = content();
  reversed.recommendations.reverse(); reversed.factualAssertions.reverse(); reversed.hypotheses.reverse();
  const secondCommand = createCommand(workState(), reversed);
  secondCommand.assessmentId = "assessment-2";
  secondCommand.idempotencyIdentity = "create-2";
  const second = new IntelligenceAuthority(new MemoryIntelligenceJournal()).create(secondCommand);
  assert.equal(JSON.stringify(first.currentRevision.content), JSON.stringify(second.currentRevision.content));
});

test("does not treat later inadmissible Evidence as current support for a new result or NBA projection", () => {
  const state = workState();
  const authority = new IntelligenceAuthority(new MemoryIntelligenceJournal());
  authority.create(createCommand(state, content()));
  const invalid = workState();
  const evidenceValue = invalid.evidence.value as { evidences: Array<{ lifecycle: string }> };
  evidenceValue.evidences[0]!.lifecycle = "INVALIDATED";
  expectCode("INTELLIGENCE_EVIDENCE_NOT_ADMISSIBLE", () => authority.revise({ assessmentId: "assessment-1", expectedRevision: 1, reason: "Attempt with stale support", workState: invalid, content: content(), actor: "analyst", causationIdentity: "cause-stale", idempotencyIdentity: "revise-stale", at: new Date(T1) }));
  expectCode("INTELLIGENCE_EVIDENCE_NOT_ADMISSIBLE", () => new IntelligenceQueries(authority).nextBestAction("assessment-1", invalid));
});

test("durable journal recovers exact history and detects rewriting", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-intelligence-"));
  const path = join(directory, "intelligence.json");
  try {
    new IntelligenceAuthority(new FileIntelligenceJournal(path)).create(createCommand(workState(), content()));
    const recovered = new IntelligenceAuthority(new FileIntelligenceJournal(path)).readAll().get("assessment-1");
    assert.equal(recovered?.currentRevision.content.question, "What does the admitted evidence show?");
    const raw = await readFile(path, "utf8");
    await writeFile(path, raw.replace("What does", "What did"), "utf8");
    expectCode("INTELLIGENCE_JOURNAL_CORRUPT", () => new FileIntelligenceJournal(path).read());
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("attached Business Certification must remain resolved and currently CERTIFIED", () => {
  const unavailable = workState({ certifiedEvidence: true });
  const items = (unavailable.evidence.value as { evidences: Array<{ certification: unknown }> }).evidences;
  items[1]!.certification = { state: "AUTHORITY_UNAVAILABLE" };
  expectCode("INTELLIGENCE_EVIDENCE_AUTHORITY_UNAVAILABLE", () => new IntelligenceAuthority(new MemoryIntelligenceJournal()).create(createCommand(unavailable, content())));

  const rejected = workState({ certifiedEvidence: true });
  const rejectedItems = (rejected.evidence.value as { evidences: Array<{ certification: { state: string; value: { currentState: string } } }> }).evidences;
  rejectedItems[1]!.certification.value.currentState = "WITHDRAWN";
  expectCode("INTELLIGENCE_EVIDENCE_NOT_ADMISSIBLE", () => new IntelligenceAuthority(new MemoryIntelligenceJournal()).create(createCommand(rejected, content())));
});

function createCommand(state: WorkAuthorizedState, value: IntelligenceAssessmentContent) {
  return { assessmentId: "assessment-1", workState: state, content: value, actor: "analyst", causationIdentity: "cause-1", idempotencyIdentity: "create-1", at: new Date(T0) };
}

function content(): MutableContent {
  return {
    question: "What does the admitted evidence show?", scope: "Authorized Work observations only", method: "Deterministic comparison", observedAt: T0,
    factualAssertions: [
      { assertionId: "fact-1", statement: "The first observation is recorded.", evidenceIds: ["evidence-1"] },
      { assertionId: "fact-2", statement: "The second observation is recorded.", evidenceIds: ["evidence-2"] },
    ],
    hypotheses: [{ hypothesisId: "hypothesis-1", statement: "A business factor may explain the difference.", supportingEvidenceIds: ["evidence-1"] }],
    interpretations: [{ interpretationId: "interpretation-1", statement: "The observations require contextual review.", factualAssertionIds: ["fact-1", "fact-2"] }],
    contradictions: [{ contradictionId: "contradiction-1", statement: "The two admitted observations disagree.", evidenceIds: ["evidence-1", "evidence-2"] }],
    limits: [{ limitId: "limit-1", statement: "The observation window is bounded." }],
    analyses: [{ analysisId: "analysis-1", statement: "The observations differ within the declared scope.", factualAssertionIds: ["fact-1", "fact-2"], hypothesisIds: ["hypothesis-1"], interpretationIds: ["interpretation-1"], contradictionIds: ["contradiction-1"], limitIds: ["limit-1"] }],
    insights: [{ insightId: "insight-1", statement: "The discrepancy merits review.", analysisId: "analysis-1", factualAssertionIds: ["fact-1", "fact-2"] }],
    recommendations: [
      { recommendationId: "recommendation-b", statement: "Consider the second existing option.", rationale: "It addresses the bounded observation.", analysisId: "analysis-1", factualAssertionIds: ["fact-2"], actionId: "action-b", rank: 1, rankingMethod: "LOWEST_INTEGER_THEN_ID", effect: "NONE" },
      { recommendationId: "recommendation-general", statement: "Consider a broader review.", rationale: "It may improve later understanding.", analysisId: "analysis-1", factualAssertionIds: [], rank: 2, rankingMethod: "LOWEST_INTEGER_THEN_ID", effect: "NONE" },
      { recommendationId: "recommendation-a", statement: "Consider the first existing option.", rationale: "It addresses the bounded observation.", analysisId: "analysis-1", factualAssertionIds: ["fact-1"], actionId: "action-a", rank: 1, rankingMethod: "LOWEST_INTEGER_THEN_ID", effect: "NONE" },
    ],
    evaluations: [{ evaluationId: "evaluation-1", subjectReference: "subject-1", analysisId: "analysis-1", criteria: [{ criterionId: "criterion-1", statement: "Observation is present", outcome: "MET", factualAssertionIds: ["fact-1"] }] }],
    diagnostics: [{ diagnosticId: "diagnostic-1", statement: "A discrepancy is present; its cause is not established.", analysisId: "analysis-1", establishedFactIds: ["fact-1", "fact-2"], possibleCauseHypothesisIds: ["hypothesis-1"] }],
  };
}

type MutableContent = { -readonly [K in keyof IntelligenceAssessmentContent]: IntelligenceAssessmentContent[K] extends readonly (infer T)[] ? T[] : IntelligenceAssessmentContent[K] };

function workState(options: Readonly<{ certifiedEvidence?: boolean }> = {}): WorkAuthorizedState & Record<string, any> {
  const evidence = (id: string) => ({
    state: "EVIDENCE_FOUND", evidenceId: id, lifecycle: "ACTIVE",
    link: { projectId: "project-1", workId: "work-1", evidenceId: id, provenance: { source: "WORK", actor: "owner", causalityId: `link-${id}` }, linkedAt: T0 },
    evidence: { evidenceId: { value: id }, lifecycle: "ACTIVE", certificationReference: options.certifiedEvidence && id === "evidence-2" ? { authority: "BUSINESS_CERTIFICATION_AUTHORITY", reference: "cert-2" } : null, history: [], source: {}, provenance: {} },
    ...(options.certifiedEvidence && id === "evidence-2" ? { certification: { state: "RESOLVED", value: { certificationId: "cert-2", authority: "BUSINESS_CERTIFICATION_AUTHORITY", subject: { kind: "BUSINESS_EVIDENCE", evidenceId: id }, criteriaReference: "criteria-1", decision: "CERTIFIED", currentState: "CERTIFIED", decidedAt: T0, provenance: { actor: "certifier", authority: "BUSINESS", causationIdentity: "cert-cause" } } } } : {}),
  });
  return {
    workReference: { projectId: "project-1", workId: "work-1" }, compositionObservedAt: T0,
    workCore: { availability: "AVAILABLE", value: { identity: { projectId: "project-1", workId: "work-1" } } },
    deliverables: { availability: "AVAILABLE_EMPTY", value: {} }, decisions: { availability: "AVAILABLE_EMPTY", value: {} },
    people: { availability: "AVAILABLE_EMPTY", value: {} }, planning: { availability: "AVAILABLE_EMPTY", value: { status: "PLANNING_ABSENT" } },
    actions: { availability: "AVAILABLE", value: { projectId: "project-1", workId: "work-1", status: "ACTIONS_AVAILABLE", sourceDomain: "ACTIONS", actions: [{ actionId: "action-a", status: "PROPOSED", revision: 1, graphRevision: 1 }, { actionId: "action-b", status: "PROPOSED", revision: 1, graphRevision: 1 }] } },
    evidence: { availability: "AVAILABLE", value: { projectId: "project-1", workId: "work-1", status: "AVAILABLE", sourceDomain: "EVIDENCE", evidences: [evidence("evidence-1"), evidence("evidence-2")] } },
  } as unknown as WorkAuthorizedState & Record<string, any>;
}

function expectCode(code: string, operation: () => unknown): void {
  assert.throws(operation, (error: unknown) => error instanceof IntelligenceDomainError && error.code === code);
}
