import { createHash } from "node:crypto";
import { EvidenceDomainError } from "./errors.js";

export const ADMISSIBLE_EVIDENCE_SOURCE_KINDS = Object.freeze([
  "ACTIONS_ACTION_RESULT_RECORDED",
] as const);
export type AdmissibleEvidenceSourceKind = (typeof ADMISSIBLE_EVIDENCE_SOURCE_KINDS)[number];
export type EvidenceLifecycle = "ACTIVE" | "WITHDRAWN" | "INVALIDATED" | "SUPERSEDED";

export class EvidenceId {
  private constructor(readonly value: string) { Object.freeze(this); }
  static of(value: string): EvidenceId {
    assertText(value, "EvidenceId");
    return new EvidenceId(value);
  }
  static fromSourceKey(sourceKey: string): EvidenceId {
    return new EvidenceId(`evidence_${createHash("sha256").update(sourceKey).digest("hex")}`);
  }
  equals(other: EvidenceId): boolean { return this.value === other.value; }
}

export type ActionsActionResultRecordedReference = Readonly<{
  authority: "ACTIONS_AUTHORITY";
  kind: "ACTIONS_ACTION_RESULT_RECORDED";
  projectIdentity: string;
  workIdentity: string;
  actionId: string;
  actionsRevision: number;
  resultId: string;
}>;

export type AdmissibleSourceReference = ActionsActionResultRecordedReference;

export type EvidenceProvenance = Readonly<{
  producer: "EVIDENCE_AUTHORITY";
  sourceAuthority: "ACTIONS_AUTHORITY";
  actor: string;
  occurredAt: string;
  registeredAt: string;
  ownerProvidedFingerprint?: string;
  originatingMissionReference?: string;
}>;

export type CertificationReference = Readonly<{ authority: string; reference: string }>;

export type EvidenceEventType =
  | "BusinessEvidenceRegistered"
  | "BusinessEvidenceWithdrawn"
  | "BusinessEvidenceInvalidated"
  | "BusinessEvidenceSuperseded"
  | "CertificationReferenceAttached"
  | "CertificationReferenceDetached";

export type EvidenceDomainEvent = Readonly<{
  type: EvidenceEventType;
  evidenceId: string;
  idempotencyIdentity: string;
  producer: "EVIDENCE_AUTHORITY";
  actor: string;
  at: string;
  reason?: string;
  source?: AdmissibleSourceReference;
  provenance?: EvidenceProvenance;
  certificationReference?: CertificationReference;
  supersededBy?: string;
}>;

export type BusinessEvidenceRecord = Readonly<{
  evidenceId: EvidenceId;
  source: AdmissibleSourceReference;
  provenance: EvidenceProvenance;
  lifecycle: EvidenceLifecycle;
  certificationReference: CertificationReference | null;
  history: readonly EvidenceDomainEvent[];
}>;

export type ResolvedSourceOccurrence = Readonly<{
  source: AdmissibleSourceReference;
  occurredAt: Date;
  ownerProvidedFingerprint?: string;
}>;

export interface EvidenceSourceResolver {
  resolve(source: AdmissibleSourceReference): ResolvedSourceOccurrence;
}

export function sourceKey(source: AdmissibleSourceReference): string {
  validateSource(source);
  return [source.authority, source.kind, source.projectIdentity, source.workIdentity,
    source.actionId, String(source.actionsRevision), source.resultId].join("|");
}

export function validateSource(source: AdmissibleSourceReference): void {
  if (source?.authority !== "ACTIONS_AUTHORITY" || source?.kind !== "ACTIONS_ACTION_RESULT_RECORDED") {
    throw new EvidenceDomainError("EVIDENCE_SOURCE_NOT_ALLOWED", "Only ACTIONS_ACTION_RESULT_RECORDED is admitted.");
  }
  assertText(source.projectIdentity, "projectIdentity");
  assertText(source.workIdentity, "workIdentity");
  assertText(source.actionId, "actionId");
  assertText(source.resultId, "resultId");
  if (!Number.isSafeInteger(source.actionsRevision) || source.actionsRevision < 1) {
    throw new EvidenceDomainError("EVIDENCE_SOURCE_NOT_FOUND", "actionsRevision must identify a positive ACTIONS revision.");
  }
}

export function freezeSource(source: AdmissibleSourceReference): AdmissibleSourceReference {
  validateSource(source);
  return Object.freeze({ ...source });
}

export function assertText(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    throw new EvidenceDomainError("EVIDENCE_REGISTRATION_CONFLICT", `${name} must be explicit and canonical.`);
  }
}
