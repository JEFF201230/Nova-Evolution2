import assert from "node:assert/strict";
import test from "node:test";
import type { ConfidenceAssessment } from "../confidence/index.js";
import { WorkConfidenceQuery, workResultReference } from "./index.js";

const WORK = Object.freeze({ projectId: "NOVA", workId: "WORK-001" });
function assessment(reference = workResultReference(WORK)): ConfidenceAssessment {
  const content = {
    subject: { kind: "WORK_RESULT" as const, reference, statement: "Current Work result" },
    context: { scope: "WORK", applicability: "CURRENT" },
    measure: { value: 75, unit: "PERCENT" as const, lowerBound: 0 as const, upperBound: 100 as const },
    method: { methodId: "WEIGHTED_EVIDENCE_RATIO_V1" as const, version: 1 as const, derivationBasis: "AUTHORITATIVE_EVIDENCE" as const, declaration: "supporting weight / total classified Evidence weight; rounded to two decimals" as const },
    supportingEvidence: [{ evidenceId: "e-1", role: "SUPPORTING" as const, weight: 3 }], contradictingEvidence: [{ evidenceId: "e-2", role: "CONTRADICTING" as const, weight: 1 }], inconclusiveEvidence: [],
    provenance: { producer: "INTELLIGENCE_CONFIDENCE_PRODUCER" as const, intelligenceAssessmentId: "intel-1", intelligenceRevision: 1, intelligenceObservedAt: "2026-09-20T00:00:00.000Z", producedAt: "2026-09-20T00:01:00.000Z" },
    observationDate: "2026-09-20T00:00:00.000Z", limitations: ["Bounded to current evidence"] as [string], effect: "NONE" as const,
  };
  const revision = { revision: 1, content, provenance: { producer: "CONFIDENCE_AUTHORITY" as const, actor: "analyst", causationIdentity: "cause-1", recordedAt: "2026-09-20T00:02:00.000Z" }, reason: null };
  const event = { type: "CONFIDENCE_ASSESSED" as const, confidenceAssessmentId: "confidence-1", idempotencyIdentity: "idem-1", at: revision.provenance.recordedAt, actor: "analyst", revision };
  return Object.freeze({ confidenceAssessmentId: "confidence-1", subject: content.subject, context: content.context, lifecycle: "CURRENT", currentRevision: revision, revisions: [revision], history: [event], withdrawal: null });
}

test("Work reads the sole current WORK_RESULT Confidence without calculating it", () => {
  const authoritative = assessment();
  const source = { currentWorkResults: () => [authoritative] };
  const result = new WorkConfidenceQuery(source).get(WORK);
  assert.equal(result.status, "CONFIDENCE_AVAILABLE");
  if (result.status === "CONFIDENCE_AVAILABLE") {
    assert.equal(result.value, 75);
    assert.strictEqual(result.assessment, authoritative);
  }
});

test("Work Confidence fails closed for absence, ambiguity and source failure", () => {
  assert.equal(new WorkConfidenceQuery({ currentWorkResults: () => [] }).get(WORK).status, "CONFIDENCE_ABSENT");
  assert.equal(new WorkConfidenceQuery({ currentWorkResults: () => [assessment(), assessment()] }).get(WORK).status, "CONFIDENCE_UNAVAILABLE");
  assert.equal(new WorkConfidenceQuery({ currentWorkResults: () => { throw new Error("offline"); } }).get(WORK).status, "CONFIDENCE_UNAVAILABLE");
});
