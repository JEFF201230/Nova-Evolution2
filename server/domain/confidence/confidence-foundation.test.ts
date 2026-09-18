import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { EvidenceId, type BusinessEvidenceRecord } from "../evidence/index.js";
import { IntelligenceConfidenceProducer, type ProduceConfidence } from "../intelligence/intelligence-confidence.producer.js";
import type { IntelligenceAssessment } from "../intelligence/intelligence.types.js";
import { ConfidenceAuthority, rebuild, type ConfidenceEvidenceReadPort } from "./confidence.authority.js";
import { ConfidenceDomainError, type ConfidenceErrorCode } from "./confidence.errors.js";
import { FileConfidenceJournal, MemoryConfidenceJournal } from "./confidence.journal.js";
import { ConfidenceQueries } from "./confidence.queries.js";
import type { ProducedConfidenceAssessment } from "./confidence.types.js";

const observedAt = "2026-09-18T08:00:00.000Z";
const recordedAt = new Date("2026-09-18T09:00:00.000Z");
const evidenceIds = ["e-support", "e-contradict-a", "e-contradict-b", "e-inconclusive"] as const;

function intelligence(): IntelligenceAssessment {
  const content = {
    question: "Is the proposition supported?", scope: "project-1/work-1", method: "DECLARED_ANALYSIS_V1", observedAt,
    factualAssertions: [{ assertionId: "fact-1", statement: "Observed business result", evidenceIds: [evidenceIds[0]] as [string] }],
    hypotheses: [{ hypothesisId: "hypothesis-1", statement: "Cause remains unresolved", supportingEvidenceIds: [evidenceIds[3]] }],
    interpretations: [],
    contradictions: [{ contradictionId: "contradiction-1", statement: "Sources conflict", evidenceIds: [evidenceIds[1], evidenceIds[2]] as [string, string] }],
    limits: [{ limitId: "limit-1", statement: "Observation window is bounded" }], analyses: [], insights: [], recommendations: [], evaluations: [], diagnostics: [],
  };
  const revision = { revision: 1, content, provenance: { producer: "INTELLIGENCE_AUTHORITY" as const, actor: "analyst", causationIdentity: "cause-intel", producedAt: observedAt }, reason: null };
  return Object.freeze({ assessmentId: "intel-1", workReference: { projectId: "project-1", workId: "work-1" }, lifecycle: "CURRENT", currentRevision: revision, revisions: [revision], history: [], withdrawal: null });
}

function activeEvidence(id: string): BusinessEvidenceRecord {
  return Object.freeze({ evidenceId: EvidenceId.of(id), source: { authority: "ACTIONS_AUTHORITY", kind: "ACTIONS_ACTION_RESULT_RECORDED", projectIdentity: "project-1", workIdentity: "work-1", actionId: `action-${id}`, actionsRevision: 1, resultId: `result-${id}` },
    provenance: { producer: "EVIDENCE_AUTHORITY", sourceAuthority: "ACTIONS_AUTHORITY", actor: "operator", occurredAt: observedAt, registeredAt: observedAt }, lifecycle: "ACTIVE", certificationReference: null, history: [] });
}

function evidencePort(overrides: Partial<Record<string, "ABSENT" | "UNAVAILABLE" | "WITHDRAWN">> = {}): ConfidenceEvidenceReadPort {
  return { byEvidenceId(id) { const state = overrides[id.value]; if (state === "ABSENT") return { state: "ABSENT" }; if (state === "UNAVAILABLE") return { state: "AUTHORITY_UNAVAILABLE", cause: new Error("offline") }; const evidence = activeEvidence(id.value); return { state: "FOUND", evidence: state === "WITHDRAWN" ? { ...evidence, lifecycle: "WITHDRAWN" } : evidence }; } };
}

function producer(assessment: IntelligenceAssessment = intelligence()): IntelligenceConfidenceProducer {
  return new IntelligenceConfidenceProducer({ byAssessmentId: () => ({ state: "FOUND", assessment }) });
}

function production(overrides: Partial<ProduceConfidence> = {}, assessment: IntelligenceAssessment = intelligence()): ProducedConfidenceAssessment {
  return producer(assessment).produce({ intelligenceAssessmentId: "intel-1",
    subject: { kind: "BUSINESS_PROPOSITION", reference: "proposition-1", statement: "The observed result satisfies the stated proposition" },
    context: { scope: "project-1/work-1", applicability: "Observation window ending 2026-09-18" },
    supportingEvidence: [{ evidenceId: evidenceIds[0], weight: 6 }],
    contradictingEvidence: [{ evidenceId: evidenceIds[1], weight: 1 }, { evidenceId: evidenceIds[2], weight: 1 }],
    inconclusiveEvidence: [{ evidenceId: evidenceIds[3], weight: 2 }],
    limitations: ["Only the declared observation window is covered"], producedAt: recordedAt, ...overrides });
}

function assess(authority = new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort()), produced = production()) {
  return authority.assess({ confidenceAssessmentId: "confidence-1", actor: "reviewer", causationIdentity: "cause-1", idempotencyIdentity: "idem-1", at: recordedAt, produced });
}

function expectCode(code: ConfidenceErrorCode, action: () => unknown): void {
  assert.throws(action, (error: unknown) => error instanceof ConfidenceDomainError && error.code === code);
}

test("produces explicit contextual bounded Confidence with all Evidence roles and provenance", () => {
  const result = assess();
  assert.deepEqual(result.subject, { kind: "BUSINESS_PROPOSITION", reference: "proposition-1", statement: "The observed result satisfies the stated proposition" });
  assert.deepEqual(result.context, { scope: "project-1/work-1", applicability: "Observation window ending 2026-09-18" });
  assert.deepEqual(result.currentRevision.content.measure, { value: 60, unit: "PERCENT", lowerBound: 0, upperBound: 100 });
  assert.equal(result.currentRevision.content.method.methodId, "WEIGHTED_EVIDENCE_RATIO_V1");
  assert.deepEqual(result.currentRevision.content.supportingEvidence.map((item) => item.evidenceId), ["e-support"]);
  assert.deepEqual(result.currentRevision.content.contradictingEvidence.map((item) => item.evidenceId), ["e-contradict-a", "e-contradict-b"]);
  assert.deepEqual(result.currentRevision.content.inconclusiveEvidence.map((item) => item.evidenceId), ["e-inconclusive"]);
  assert.equal(result.currentRevision.content.provenance.intelligenceAssessmentId, "intel-1");
  assert.equal(result.currentRevision.content.observationDate, observedAt);
  assert.deepEqual(result.currentRevision.content.limitations, ["Only the declared observation window is covered"]);
  assert.equal(result.currentRevision.content.effect, "NONE");
  assert.equal("recommendations" in result.currentRevision.content, false);
});

test("method is deterministic, order independent, and bounded at both endpoints", () => {
  const first = production(); const second = production({ supportingEvidence: [{ evidenceId: "e-support", weight: 6 }], contradictingEvidence: [{ evidenceId: "e-contradict-b", weight: 1 }, { evidenceId: "e-contradict-a", weight: 1 }] });
  assert.equal(first.measure.value, 60); assert.equal(second.measure.value, 60);
  const supportingOnly = { ...intelligence(), currentRevision: { ...intelligence().currentRevision, content: { ...intelligence().currentRevision.content, hypotheses: [], contradictions: [] } } } as IntelligenceAssessment;
  const opposingOnly = { ...intelligence(), currentRevision: { ...intelligence().currentRevision, content: { ...intelligence().currentRevision.content, factualAssertions: [], hypotheses: [], contradictions: [{ contradictionId: "contradiction-1", statement: "Sources conflict", evidenceIds: [evidenceIds[1], evidenceIds[2]] }] } } } as IntelligenceAssessment;
  assert.equal(production({ supportingEvidence: [{ evidenceId: "e-support", weight: 1 }], contradictingEvidence: [], inconclusiveEvidence: [] }, supportingOnly).measure.value, 100);
  assert.equal(production({ supportingEvidence: [], contradictingEvidence: [{ evidenceId: "e-contradict-a", weight: 1 }, { evidenceId: "e-contradict-b", weight: 1 }], inconclusiveEvidence: [] }, opposingOnly).measure.value, 0);
  const tampered = { ...first, measure: { ...first.measure, value: 101 } } as ProducedConfidenceAssessment;
  expectCode("CONFIDENCE_INVALID_INPUT", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort()), tampered));
  const mismatch = { ...first, measure: { ...first.measure, value: 59 } } as ProducedConfidenceAssessment;
  expectCode("CONFIDENCE_METHOD_MISMATCH", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort()), mismatch));
});

test("requires explicit subject, context, Evidence, limitations, and the declared method", () => {
  const valid = production();
  expectCode("CONFIDENCE_INVALID_INPUT", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort()), { ...valid, subject: { ...valid.subject, statement: "" } }));
  expectCode("CONFIDENCE_INVALID_INPUT", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort()), { ...valid, context: { ...valid.context, scope: "" } }));
  const noEvidence = { ...intelligence(), currentRevision: { ...intelligence().currentRevision, content: { ...intelligence().currentRevision.content, factualAssertions: [], hypotheses: [], contradictions: [] } } } as IntelligenceAssessment;
  expectCode("CONFIDENCE_EVIDENCE_REQUIRED", () => production({ supportingEvidence: [], contradictingEvidence: [], inconclusiveEvidence: [] }, noEvidence));
  expectCode("CONFIDENCE_INVALID_INPUT", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort()), { ...valid, limitations: [] } as unknown as ProducedConfidenceAssessment));
  expectCode("CONFIDENCE_METHOD_MISMATCH", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort()), { ...valid, method: { ...valid.method, version: 2 } } as unknown as ProducedConfidenceAssessment));
});

test("keeps contradictory and inconclusive roles explicit and rejects role invention", () => {
  expectCode("CONFIDENCE_INVALID_INPUT", () => production({ contradictingEvidence: [{ evidenceId: "e-contradict-a", weight: 2 }] }));
  expectCode("CONFIDENCE_INVALID_INPUT", () => production({ inconclusiveEvidence: [] }));
  expectCode("CONFIDENCE_INVALID_INPUT", () => production({ supportingEvidence: [{ evidenceId: "e-inconclusive", weight: 1 }] }));
  expectCode("CONFIDENCE_INVALID_INPUT", () => production({ contradictingEvidence: [{ evidenceId: "e-support", weight: 1 }] }));
  expectCode("CONFIDENCE_INVALID_INPUT", () => production({ inconclusiveEvidence: [{ evidenceId: "e-contradict-a", weight: 1 }] }));
});

test("distinguishes missing and unavailable Intelligence and Evidence", () => {
  const command = { intelligenceAssessmentId: "missing", subject: { kind: "BUSINESS_PROPOSITION" as const, reference: "p", statement: "statement" }, context: { scope: "scope", applicability: "context" }, supportingEvidence: [], contradictingEvidence: [], inconclusiveEvidence: [], limitations: ["limited"] as [string], producedAt: recordedAt };
  expectCode("CONFIDENCE_INTELLIGENCE_NOT_FOUND", () => new IntelligenceConfidenceProducer({ byAssessmentId: () => ({ state: "ABSENT" }) }).produce(command));
  expectCode("CONFIDENCE_INTELLIGENCE_UNAVAILABLE", () => new IntelligenceConfidenceProducer({ byAssessmentId: () => ({ state: "AUTHORITY_UNAVAILABLE", cause: new Error("offline") }) }).produce(command));
  expectCode("CONFIDENCE_INTELLIGENCE_UNAVAILABLE", () => new IntelligenceConfidenceProducer({ byAssessmentId: () => { throw new Error("offline"); } }).produce(command));
  expectCode("CONFIDENCE_EVIDENCE_NOT_FOUND", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort({ "e-support": "ABSENT" }))));
  expectCode("CONFIDENCE_EVIDENCE_UNAVAILABLE", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort({ "e-support": "UNAVAILABLE" }))));
  expectCode("CONFIDENCE_EVIDENCE_NOT_ADMISSIBLE", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort({ "e-support": "WITHDRAWN" }))));
});

test("fails closed when a read authority returns a different source identity", () => {
  expectCode("CONFIDENCE_INVALID_INPUT", () => new IntelligenceConfidenceProducer({
    byAssessmentId: () => ({ state: "FOUND", assessment: { ...intelligence(), assessmentId: "intel-other" } }),
  }).produce({
    intelligenceAssessmentId: "intel-1",
    subject: { kind: "BUSINESS_PROPOSITION", reference: "p", statement: "statement" },
    context: { scope: "scope", applicability: "context" },
    supportingEvidence: [{ evidenceId: "e-support", weight: 1 }],
    contradictingEvidence: [{ evidenceId: "e-contradict-a", weight: 1 }, { evidenceId: "e-contradict-b", weight: 1 }],
    inconclusiveEvidence: [{ evidenceId: "e-inconclusive", weight: 1 }],
    limitations: ["limited"],
    producedAt: recordedAt,
  }));
  const mismatchedEvidence: ConfidenceEvidenceReadPort = {
    byEvidenceId: () => ({ state: "FOUND", evidence: activeEvidence("e-other") }),
  };
  expectCode("CONFIDENCE_EVIDENCE_NOT_ADMISSIBLE", () => assess(new ConfidenceAuthority(new MemoryConfidenceJournal(), mismatchedEvidence)));
});

test("revision, withdrawal, replacement, query, and journal recovery preserve history", () => {
  const directory = mkdtempSync(join(tmpdir(), "nova-confidence-")); const path = join(directory, "confidence.json");
  try {
    const authority = new ConfidenceAuthority(new FileConfidenceJournal(path), evidencePort());
    const initial = assess(authority); assert.equal(initial.revisions.length, 1);
    const revised = authority.reassess({ confidenceAssessmentId: "confidence-1", expectedRevision: 1, reason: "New weighting", actor: "reviewer", causationIdentity: "cause-2", idempotencyIdentity: "idem-2", at: new Date("2026-09-18T10:00:00.000Z"), produced: production({ supportingEvidence: [{ evidenceId: "e-support", weight: 8 }] }) });
    assert.equal(revised.currentRevision.revision, 2); assert.equal(revised.revisions.length, 2); assert.equal(revised.currentRevision.content.measure.value, 66.67);
    const withdrawn = authority.withdraw({ confidenceAssessmentId: "confidence-1", expectedRevision: 2, reason: "Observation expired", actor: "reviewer", idempotencyIdentity: "idem-3", at: new Date("2026-09-18T11:00:00.000Z") });
    assert.equal(withdrawn.lifecycle, "WITHDRAWN"); assert.equal(withdrawn.revisions.length, 2); assert.equal(withdrawn.history.length, 3);
    expectCode("CONFIDENCE_TERMINAL", () => authority.reassess({ confidenceAssessmentId: "confidence-1", expectedRevision: 2, reason: "forbidden", actor: "reviewer", causationIdentity: "cause-x", idempotencyIdentity: "idem-x", at: recordedAt, produced: production() }));
    const recovered = new ConfidenceAuthority(new FileConfidenceJournal(path), evidencePort());
    assert.deepEqual(recovered.readAll().get("confidence-1"), withdrawn);
    const replacement = recovered.assess({ confidenceAssessmentId: "confidence-2", actor: "reviewer", causationIdentity: "cause-4", idempotencyIdentity: "idem-4", at: new Date("2026-09-18T12:00:00.000Z"), produced: production() });
    assert.equal(replacement.lifecycle, "CURRENT"); assert.equal(new ConfidenceQueries(recovered).currentBySubjectContext(replacement.subject, replacement.context).state, "FOUND");
    const raw = readFileSync(path, "utf8"); writeFileSync(path, raw.replace("confidence-2", "confidence-X"), "utf8");
    expectCode("CONFIDENCE_JOURNAL_CORRUPT", () => recovered.readAll());
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("deterministic reconstruction rejects an unknown lifecycle event", () => {
  const event = {
    type: "CONFIDENCE_RECOVERED",
    confidenceAssessmentId: "confidence-1",
    idempotencyIdentity: "idem-unknown",
    at: recordedAt.toISOString(),
    actor: "reviewer",
    reason: "not an admitted lifecycle event",
  };
  expectCode("CONFIDENCE_JOURNAL_CORRUPT", () => rebuild([event] as never));
});

test("enforces one current assessment per subject/context and idempotency", () => {
  const authority = new ConfidenceAuthority(new MemoryConfidenceJournal(), evidencePort()); const first = assess(authority);
  assert.deepEqual(assess(authority), first);
  expectCode("CONFIDENCE_CURRENT_CONFLICT", () => authority.assess({ confidenceAssessmentId: "confidence-2", actor: "reviewer", causationIdentity: "cause-2", idempotencyIdentity: "idem-2", at: recordedAt, produced: production() }));
  expectCode("CONFIDENCE_IDEMPOTENCY_CONFLICT", () => authority.assess({ confidenceAssessmentId: "confidence-2", actor: "reviewer", causationIdentity: "cause-2", idempotencyIdentity: "idem-1", at: recordedAt, produced: production() }));
});

test("rejects every forbidden derivation and Mission/runtime fallback as producer input", () => {
  const forbidden = ["progress", "readiness", "riskScore", "kpiScore", "status", "testCount", "passCount", "certification", "absenceOfFailure", "missionReport", "log", "fixture", "ui", "runtimeDiagnostic"];
  const base = { intelligenceAssessmentId: "intel-1", subject: { kind: "BUSINESS_PROPOSITION", reference: "proposition-1", statement: "statement" }, context: { scope: "scope", applicability: "context" }, supportingEvidence: [{ evidenceId: "e-support", weight: 1 }], contradictingEvidence: [], inconclusiveEvidence: [], limitations: ["limited"], producedAt: recordedAt };
  for (const key of forbidden) expectCode("CONFIDENCE_INVALID_INPUT", () => producer().produce({ ...base, [key]: true } as unknown as ProduceConfidence));
  expectCode("CONFIDENCE_INVALID_INPUT", () => producer().produce({ ...base, subject: { kind: "PERSON", reference: "person-1", statement: "general score" } } as unknown as ProduceConfidence));
});
