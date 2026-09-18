import type {
  BusinessCertificationDecision,
  BusinessCertificationProvenance,
  BusinessCertificationState,
  CertificationId,
  EvidenceId,
} from "./business-certification.types.js";
import { BUSINESS_CERTIFICATION_AUTHORITY } from "./business-certification.types.js";

export type DecisionRecordedEvent = Readonly<{
  type: "DECISION_RECORDED";
  commandId: string;
  commandFingerprint: string;
  certificationId: CertificationId;
  authority: typeof BUSINESS_CERTIFICATION_AUTHORITY;
  subject: Readonly<{ kind: "BUSINESS_EVIDENCE"; evidenceId: EvidenceId }>;
  criteriaReference: string;
  decision: BusinessCertificationDecision;
  decidedAt: string;
  provenance: BusinessCertificationProvenance;
  supersedesCertificationId?: CertificationId;
}>;

export type CertificationStateChangedEvent = Readonly<{
  type: "STATE_CHANGED";
  commandId: string;
  commandFingerprint: string;
  certificationId: CertificationId;
  from: BusinessCertificationState;
  to: "WITHDRAWN" | "INVALIDATED";
  occurredAt: string;
  provenance: BusinessCertificationProvenance;
}>;

export type BusinessCertificationEvent = DecisionRecordedEvent | CertificationStateChangedEvent;
