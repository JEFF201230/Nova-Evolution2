export type BusinessCertificationErrorCode =
  | "EVIDENCE_NOT_FOUND"
  | "EVIDENCE_AUTHORITY_UNAVAILABLE"
  | "EVIDENCE_RESPONSE_INCONSISTENT"
  | "CERTIFICATION_NOT_FOUND"
  | "SUPERSEDED_CERTIFICATION_NOT_FOUND"
  | "SUPERSESSION_SUBJECT_MISMATCH"
  | "CERTIFICATION_ID_COLLISION"
  | "COMMAND_ID_CONFLICT"
  | "STATE_TRANSITION_REJECTED"
  | "BUSINESS_CERTIFICATION_RECOVERY_FAILED";

export class BusinessCertificationError extends Error {
  constructor(readonly code: BusinessCertificationErrorCode, message: string, options?: ErrorOptions) {
    super(`${code}: ${message}`, options);
    this.name = "BusinessCertificationError";
  }
}
