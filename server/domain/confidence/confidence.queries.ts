import { ConfidenceAuthority } from "./confidence.authority.js";
import type { ConfidenceAssessment, ConfidenceContext, ConfidenceSubject } from "./confidence.types.js";

export type ConfidenceQueryResult = Readonly<{ state: "FOUND"; assessment: ConfidenceAssessment }> | Readonly<{ state: "ABSENT" }> | Readonly<{ state: "AUTHORITY_UNAVAILABLE"; cause: unknown }>;

export class ConfidenceQueries {
  constructor(private readonly authority: ConfidenceAuthority) {}
  byAssessmentId(id: string): ConfidenceQueryResult {
    try { const assessment = this.authority.readAll().get(id); return assessment === undefined ? Object.freeze({ state: "ABSENT" }) : Object.freeze({ state: "FOUND", assessment }); }
    catch (cause) { return Object.freeze({ state: "AUTHORITY_UNAVAILABLE", cause }); }
  }
  currentBySubjectContext(subject: ConfidenceSubject, context: ConfidenceContext): ConfidenceQueryResult {
    try {
      const assessment = [...this.authority.readAll().values()].find((item) => item.lifecycle === "CURRENT"
        && item.subject.kind === subject.kind && item.subject.reference === subject.reference && item.subject.statement === subject.statement
        && item.context.scope === context.scope && item.context.applicability === context.applicability);
      return assessment === undefined ? Object.freeze({ state: "ABSENT" }) : Object.freeze({ state: "FOUND", assessment });
    } catch (cause) { return Object.freeze({ state: "AUTHORITY_UNAVAILABLE", cause }); }
  }
}
