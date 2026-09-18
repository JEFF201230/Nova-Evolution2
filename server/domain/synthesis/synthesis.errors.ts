export type SynthesisErrorCode =
  | "SYNTHESIS_INVALID_INPUT"
  | "SYNTHESIS_WORK_UNAVAILABLE"
  | "SYNTHESIS_INTELLIGENCE_UNAVAILABLE"
  | "SYNTHESIS_EVIDENCE_UNAVAILABLE"
  | "SYNTHESIS_EVIDENCE_NOT_ADMISSIBLE"
  | "SYNTHESIS_SOURCE_NOT_FOUND"
  | "SYNTHESIS_REVISION_CONFLICT"
  | "SYNTHESIS_CURRENT_CONFLICT"
  | "SYNTHESIS_NOT_FOUND"
  | "SYNTHESIS_TERMINAL"
  | "SYNTHESIS_IDEMPOTENCY_CONFLICT"
  | "SYNTHESIS_JOURNAL_CORRUPT";

export class SynthesisDomainError extends Error {
  constructor(readonly code: SynthesisErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SynthesisDomainError";
  }
}
