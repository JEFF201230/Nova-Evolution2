import type {
  BusinessEvidenceRecord,
  CertificationResolution,
  EvidenceLifecycle,
} from "../evidence/index.js";

export const WORK_EVIDENCE_SOURCE_DOMAIN = "EVIDENCE" as const;

export type WorkEvidenceReference = Readonly<{
  projectId: string;
  workId: string;
}>;

export type WorkEvidenceLinkProvenance = Readonly<{
  source: string;
  actor: string;
  causalityId: string;
}>;

/** The complete Work-owned state of an Evidence association. */
export type WorkEvidenceLink = WorkEvidenceReference & Readonly<{
  evidenceId: string;
  provenance: WorkEvidenceLinkProvenance;
  linkedAt: string;
}>;

export type WorkEvidenceResolved<TCertification> = Readonly<{
  state: "EVIDENCE_FOUND";
  link: WorkEvidenceLink;
  evidenceId: string;
  lifecycle: EvidenceLifecycle;
  /** Exact read-only record returned by the Evidence owner; never persisted by Work. */
  evidence: BusinessEvidenceRecord;
  certification?: CertificationResolution<TCertification>;
}>;

export type WorkEvidenceUnknown = Readonly<{
  state: "EVIDENCE_UNKNOWN";
  link: WorkEvidenceLink;
  evidenceId: string;
}>;

export type WorkEvidenceReadItem<TCertification> =
  | WorkEvidenceResolved<TCertification>
  | WorkEvidenceUnknown;

export type WorkEvidenceUnavailableReason =
  | "WORK_EVIDENCE_LINKS_UNAVAILABLE"
  | "WORK_EVIDENCE_LINKS_INCONSISTENT"
  | "EVIDENCE_AUTHORITY_UNAVAILABLE"
  | "EVIDENCE_READ_INCONSISTENT";

export type WorkEvidenceUnavailable = WorkEvidenceReference & Readonly<{
  status: "UNAVAILABLE";
  sourceDomain: typeof WORK_EVIDENCE_SOURCE_DOMAIN;
  reason: WorkEvidenceUnavailableReason;
}>;

export type WorkEvidenceAvailableEmpty = WorkEvidenceReference & Readonly<{
  status: "AVAILABLE_EMPTY";
  sourceDomain: typeof WORK_EVIDENCE_SOURCE_DOMAIN;
  evidences: readonly [];
}>;

export type WorkEvidenceAvailable<TCertification> = WorkEvidenceReference & Readonly<{
  status: "AVAILABLE";
  sourceDomain: typeof WORK_EVIDENCE_SOURCE_DOMAIN;
  evidences: readonly [WorkEvidenceReadItem<TCertification>, ...WorkEvidenceReadItem<TCertification>[]];
}>;

export type WorkEvidenceReadResult<TCertification = unknown> =
  | WorkEvidenceUnavailable
  | WorkEvidenceAvailableEmpty
  | WorkEvidenceAvailable<TCertification>;
