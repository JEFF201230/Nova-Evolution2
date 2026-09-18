import { EvidenceDomainError } from "./errors.js";
import { EvidenceAuthority } from "./evidence-authority.js";
import { EvidenceId, type BusinessEvidenceRecord, type CertificationReference } from "./evidence-model.js";

export type EvidenceQueryResult =
  | Readonly<{ state: "FOUND"; evidence: BusinessEvidenceRecord }>
  | Readonly<{ state: "ABSENT" }>
  | Readonly<{ state: "AUTHORITY_UNAVAILABLE"; cause: unknown }>;

export class EvidenceInternalQueries {
  constructor(private readonly authority: EvidenceAuthority) { Object.freeze(this); }
  byEvidenceId(id: EvidenceId): EvidenceQueryResult {
    try {
      const evidence = this.authority.readAll().get(id.value);
      return evidence === undefined ? Object.freeze({ state: "ABSENT" }) : Object.freeze({ state: "FOUND", evidence });
    } catch (cause) {
      return Object.freeze({ state: "AUTHORITY_UNAVAILABLE", cause });
    }
  }
  byOrderedEvidenceIds(ids: readonly EvidenceId[]): readonly EvidenceQueryResult[] {
    return Object.freeze(ids.map((id) => this.byEvidenceId(id)));
  }
}

export interface CertificationAuthorityQueries<T> { resolve(reference: CertificationReference): T; }
export type CertificationResolution<T> =
  | Readonly<{ state: "REFERENCE_ABSENT" }>
  | Readonly<{ state: "AUTHORITY_UNAVAILABLE"; cause?: unknown }>
  | Readonly<{ state: "RESOLVED"; value: T }>;

export class EvidenceCertificationResolver<T> {
  constructor(private readonly authority?: CertificationAuthorityQueries<T>) { Object.freeze(this); }
  resolve(evidence: BusinessEvidenceRecord): CertificationResolution<T> {
    if (evidence.certificationReference === null) return Object.freeze({ state: "REFERENCE_ABSENT" });
    if (this.authority === undefined) return Object.freeze({ state: "AUTHORITY_UNAVAILABLE" });
    try { return Object.freeze({ state: "RESOLVED", value: this.authority.resolve(evidence.certificationReference) }); }
    catch (cause) { return Object.freeze({ state: "AUTHORITY_UNAVAILABLE", cause }); }
  }
}

export function requireValidEvidence(result: EvidenceQueryResult): BusinessEvidenceRecord {
  if (result.state !== "FOUND") throw new EvidenceDomainError("EVIDENCE_NOT_FOUND", `Evidence query state is ${result.state}.`);
  if (result.evidence.lifecycle === "INVALIDATED") throw new EvidenceDomainError("EVIDENCE_TERMINAL", "Evidence is invalidated, not absent.");
  return result.evidence;
}
