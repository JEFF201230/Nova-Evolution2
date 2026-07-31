export const WORK_CORE_SCHEMA_VERSION = "1.0.0" as const;

export type WorkLifecycleState =
  | "CREATED"
  | "READY"
  | "ACTIVE"
  | "WAITING"
  | "VALIDATING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type WorkSourceDomain = "MISSIONS" | "MONITORING" | "WORK";

export interface WorkProvenance {
  readonly sourceDomain: WorkSourceDomain;
  readonly producer: string;
  readonly sourceId: string;
  readonly observedAt: string;
}

export interface WorkProgressionProvenance extends WorkProvenance {
  readonly sequence: number;
  readonly correlationId: string;
  readonly runId: string | null;
}

export interface WorkIdentity {
  readonly workId: string;
  readonly projectId: string;
  readonly objective: string;
  readonly mission: {
    readonly projectId: string;
    readonly missionId: string;
  };
  readonly provenance: WorkProvenance;
}

export interface WorkLifecycle {
  readonly current: WorkLifecycleState;
  readonly observedAt: string;
  readonly provenance: WorkProvenance;
}

export interface WorkProgression {
  readonly percentage: number;
  readonly observedAt: string;
  readonly provenance: WorkProgressionProvenance;
}

export interface WorkTimestamps {
  readonly createdAt: string | null;
  readonly updatedAt: string;
}

/**
 * WCF-001 internal domain contract.
 *
 * This is neither an HTTP DTO nor a UI projection. It deliberately contains
 * only the Work identity, its Mission binding, its Work-owned lifecycle,
 * accepted authoritative progression, timestamps and provenance.
 */
export interface WorkCoreAggregate {
  readonly schemaVersion: typeof WORK_CORE_SCHEMA_VERSION;
  readonly identity: WorkIdentity;
  readonly lifecycle: WorkLifecycle;
  readonly progression: WorkProgression;
  readonly timestamps: WorkTimestamps;
}

export type WorkCoreFailureCode =
  | "WCF-ERR-001"
  | "WCF-ERR-002"
  | "WCF-ERR-003"
  | "WCF-ERR-004"
  | "WCF-ERR-005";

export class WorkCoreFailure extends Error {
  constructor(
    readonly code: WorkCoreFailureCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "WorkCoreFailure";
  }
}
