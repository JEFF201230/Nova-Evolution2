export type IntelligenceErrorCode =
  | "INTELLIGENCE_INVALID_INPUT"
  | "INTELLIGENCE_WORK_UNAVAILABLE"
  | "INTELLIGENCE_EVIDENCE_REQUIRED"
  | "INTELLIGENCE_EVIDENCE_NOT_ADMISSIBLE"
  | "INTELLIGENCE_EVIDENCE_AUTHORITY_UNAVAILABLE"
  | "INTELLIGENCE_ACTION_NOT_FOUND"
  | "INTELLIGENCE_ACTION_AUTHORITY_UNAVAILABLE"
  | "INTELLIGENCE_NOT_FOUND"
  | "INTELLIGENCE_REVISION_CONFLICT"
  | "INTELLIGENCE_TERMINAL"
  | "INTELLIGENCE_IDEMPOTENCY_CONFLICT"
  | "INTELLIGENCE_JOURNAL_CORRUPT";

export class IntelligenceDomainError extends Error {
  constructor(readonly code: IntelligenceErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "IntelligenceDomainError";
  }
}
