import type { ConfidenceAssessment } from "../confidence/index.js";
import {
  WORK_CONFIDENCE_SOURCE_DOMAIN,
  type WorkConfidenceReadResult,
  type WorkConfidenceReference,
} from "./work-confidence.types.js";

export interface WorkConfidenceReadSource {
  currentWorkResults(): readonly ConfidenceAssessment[];
}

/** Read-only Work association. Confidence remains the sole owner of the measure. */
export class WorkConfidenceQuery {
  constructor(private readonly confidence: WorkConfidenceReadSource) {}

  get(work: WorkConfidenceReference): WorkConfidenceReadResult {
    const reference = canonical(work);
    let assessments: readonly ConfidenceAssessment[];
    try { assessments = this.confidence.currentWorkResults(); }
    catch { return unavailable(reference, "CONFIDENCE_READ_UNAVAILABLE"); }
    if (!Array.isArray(assessments)) return unavailable(reference, "CONFIDENCE_READ_INCONSISTENT");
    const expected = workResultReference(reference);
    const matching = assessments.filter((item) => item.lifecycle === "CURRENT"
      && item.subject.kind === "WORK_RESULT" && item.subject.reference === expected);
    if (matching.length === 0) return Object.freeze({ ...reference, status: "CONFIDENCE_ABSENT", sourceDomain: WORK_CONFIDENCE_SOURCE_DOMAIN });
    if (matching.length !== 1) return unavailable(reference, "CONFIDENCE_READ_INCONSISTENT");
    const assessment = matching[0]!;
    const value = assessment.currentRevision.content.measure.value;
    if (!Number.isFinite(value) || value < 0 || value > 100
      || assessment.currentRevision.content.provenance.producer !== "INTELLIGENCE_CONFIDENCE_PRODUCER") {
      return unavailable(reference, "CONFIDENCE_READ_INCONSISTENT");
    }
    return Object.freeze({ ...reference, status: "CONFIDENCE_AVAILABLE", sourceDomain: WORK_CONFIDENCE_SOURCE_DOMAIN, value, assessment });
  }
}

export function workResultReference(work: WorkConfidenceReference): string {
  const value = canonical(work);
  return `${value.projectId}/${value.workId}`;
}

function canonical(work: WorkConfidenceReference): WorkConfidenceReference {
  if (typeof work?.projectId !== "string" || work.projectId.length === 0 || work.projectId.trim() !== work.projectId
    || typeof work.workId !== "string" || work.workId.length === 0 || work.workId.trim() !== work.workId) throw new TypeError("WorkReference must be canonical.");
  return Object.freeze({ projectId: work.projectId, workId: work.workId });
}
function unavailable(reference: WorkConfidenceReference, reason: "CONFIDENCE_READ_UNAVAILABLE" | "CONFIDENCE_READ_INCONSISTENT"): WorkConfidenceReadResult {
  return Object.freeze({ ...reference, status: "CONFIDENCE_UNAVAILABLE", sourceDomain: WORK_CONFIDENCE_SOURCE_DOMAIN, reason });
}
