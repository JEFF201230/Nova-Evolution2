export const BUSINESS_CERTIFICATION_AUTHORITY = "BUSINESS_CERTIFICATION_AUTHORITY" as const;

declare const certificationIdBrand: unique symbol;
declare const evidenceIdBrand: unique symbol;

export type CertificationId = string & { readonly [certificationIdBrand]: "CertificationId" };
export type EvidenceId = string & { readonly [evidenceIdBrand]: "EvidenceId" };

export type CertificationReference = Readonly<{
  authority: string;
  reference: string;
}>;

export type BusinessCertificationDecision = "CERTIFIED" | "REJECTED";
export type BusinessCertificationState = BusinessCertificationDecision | "WITHDRAWN" | "INVALIDATED";

export type BusinessCertificationSubject = Readonly<{
  kind: "BUSINESS_EVIDENCE";
  evidenceId: EvidenceId;
}>;

export type BusinessCertificationProvenance = Readonly<{
  actor: string;
  authority: string;
  causationIdentity: string;
}>;

export type BusinessCertificationHistoryEvent =
  | Readonly<{
      type: "DECISION_RECORDED";
      commandId: string;
      certificationId: CertificationId;
      decision: BusinessCertificationDecision;
      state: BusinessCertificationDecision;
      occurredAt: string;
      provenance: BusinessCertificationProvenance;
    }>
  | Readonly<{
      type: "STATE_CHANGED";
      commandId: string;
      certificationId: CertificationId;
      from: BusinessCertificationState;
      to: "WITHDRAWN" | "INVALIDATED";
      occurredAt: string;
      provenance: BusinessCertificationProvenance;
    }>;

export type BusinessCertificationSnapshot = Readonly<{
  certificationId: CertificationId;
  authority: typeof BUSINESS_CERTIFICATION_AUTHORITY;
  subject: BusinessCertificationSubject;
  criteriaReference: string;
  decision: BusinessCertificationDecision;
  currentState: BusinessCertificationState;
  decidedAt: string;
  provenance: BusinessCertificationProvenance;
  supersedesCertificationId?: CertificationId;
}>;

export type EvidenceIdentityResolution =
  | Readonly<{ status: "FOUND"; evidenceId: string }>
  | Readonly<{ status: "NOT_FOUND" }>
  | Readonly<{ status: "UNAVAILABLE" }>;

/** Read-only port owned by this boundary; adapters may query Evidence but cannot mutate it. */
export interface EvidenceIdentityReader {
  resolveEvidenceIdentity(evidenceId: string): EvidenceIdentityResolution;
}

export interface CertificationIdGenerator {
  nextCertificationId(): string;
}

export interface BusinessCertificationClock {
  now(): Date;
}

export type RecordCertificationDecision = Readonly<{
  commandId: string;
  evidenceId: string;
  criteriaReference: string;
  decision: BusinessCertificationDecision;
  provenance: BusinessCertificationProvenance;
  supersedesCertificationId?: string;
}>;

export type ChangeCertificationState = Readonly<{
  commandId: string;
  certificationId: string;
  provenance: BusinessCertificationProvenance;
}>;

export type ResolveCertificationReferenceResult =
  | Readonly<{ status: "UNRECOGNIZED_AUTHORITY" }>
  | Readonly<{ status: "NOT_FOUND" }>
  | Readonly<{ status: "FOUND"; snapshot: BusinessCertificationSnapshot }>
  | Readonly<{ status: "AUTHORITY_UNAVAILABLE" }>;

export function assertOpaqueIdentity(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    throw new TypeError(`${label} must be a non-empty exact identity.`);
  }
}

export function assertProvenance(value: BusinessCertificationProvenance): void {
  if (typeof value !== "object" || value === null) throw new TypeError("provenance must be an object.");
  const keys = Object.keys(value);
  if (keys.length !== 3 || !keys.includes("actor") || !keys.includes("authority") || !keys.includes("causationIdentity")) {
    throw new TypeError("provenance has an inconsistent structure.");
  }
  assertOpaqueIdentity(value.actor, "provenance.actor");
  assertOpaqueIdentity(value.authority, "provenance.authority");
  assertOpaqueIdentity(value.causationIdentity, "provenance.causationIdentity");
}

export function freezeProvenance(value: BusinessCertificationProvenance): BusinessCertificationProvenance {
  assertProvenance(value);
  return Object.freeze({
    actor: value.actor,
    authority: value.authority,
    causationIdentity: value.causationIdentity,
  });
}
