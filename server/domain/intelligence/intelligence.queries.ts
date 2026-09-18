import type { WorkAuthorizedState } from "../work/index.js";
import { assertIntelligenceSourcesCurrent, IntelligenceAuthority } from "./intelligence.authority.js";
import { IntelligenceDomainError } from "./intelligence.errors.js";
import type { IntelligenceAssessment, NextBestAction, Recommendation } from "./intelligence.types.js";

export type IntelligenceQueryResult =
  | Readonly<{ state: "FOUND"; assessment: IntelligenceAssessment }>
  | Readonly<{ state: "ABSENT" }>
  | Readonly<{ state: "AUTHORITY_UNAVAILABLE"; cause: unknown }>;

export class IntelligenceQueries {
  constructor(private readonly authority: IntelligenceAuthority) {}

  byAssessmentId(assessmentId: string): IntelligenceQueryResult {
    try {
      const assessment = this.authority.readAll().get(assessmentId);
      return assessment === undefined ? Object.freeze({ state: "ABSENT" }) : Object.freeze({ state: "FOUND", assessment });
    } catch (cause) { return Object.freeze({ state: "AUTHORITY_UNAVAILABLE", cause }); }
  }

  listByWork(workReference: Readonly<{ projectId: string; workId: string }>): readonly IntelligenceAssessment[] {
    try {
      return Object.freeze([...this.authority.readAll().values()]
        .filter((item) => item.workReference.projectId === workReference.projectId && item.workReference.workId === workReference.workId)
        .sort((left, right) => compare(left.assessmentId, right.assessmentId)));
    } catch (cause) {
      throw new IntelligenceDomainError("INTELLIGENCE_JOURNAL_CORRUPT", "Intelligence authority is unavailable.", { cause });
    }
  }

  nextBestAction(assessmentId: string, currentWorkState: WorkAuthorizedState): NextBestAction | null {
    const result = this.byAssessmentId(assessmentId);
    if (result.state === "AUTHORITY_UNAVAILABLE") throw new IntelligenceDomainError("INTELLIGENCE_JOURNAL_CORRUPT", "Intelligence authority is unavailable.", { cause: result.cause });
    if (result.state === "ABSENT") throw new IntelligenceDomainError("INTELLIGENCE_NOT_FOUND", `Assessment ${assessmentId} does not exist.`);
    const assessment = result.assessment;
    if (assessment.lifecycle === "WITHDRAWN") return null;
    if (assessment.workReference.projectId !== currentWorkState.workReference.projectId || assessment.workReference.workId !== currentWorkState.workReference.workId) {
      throw new IntelligenceDomainError("INTELLIGENCE_INVALID_INPUT", "Current Work state does not match the Assessment.");
    }
    assertIntelligenceSourcesCurrent(assessment.currentRevision.content, currentWorkState);
    const candidates = assessment.currentRevision.content.recommendations
      .filter((item): item is Recommendation & Readonly<{ actionId: string }> => item.actionId !== undefined)
      .sort((left, right) => left.rank - right.rank || compare(left.recommendationId, right.recommendationId));
    if (candidates.length === 0) return null;
    const winner = candidates[0]!;
    const tied = candidates.filter((item) => item.rank === winner.rank).map((item) => item.recommendationId).sort(compare);
    const facts = new Map(assessment.currentRevision.content.factualAssertions.map((item) => [item.assertionId, item]));
    const supportingEvidenceIds = [...new Set(winner.factualAssertionIds.flatMap((id) => facts.get(id)?.evidenceIds ?? []))].sort(compare);
    return Object.freeze({
      assessmentId, assessmentRevision: assessment.currentRevision.revision, recommendation: winner,
      actionId: winner.actionId, rankingMethod: winner.rankingMethod,
      candidateRecommendationIds: Object.freeze(candidates.map((item) => item.recommendationId)),
      tiedRecommendationIds: Object.freeze(tied), supportingEvidenceIds: Object.freeze(supportingEvidenceIds),
      observedAt: assessment.currentRevision.content.observedAt,
    });
  }
}

function compare(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
