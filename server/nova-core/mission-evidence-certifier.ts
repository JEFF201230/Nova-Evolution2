import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import {
  IntegrationRuntimeRepository,
  type IntegrationPersistedRecord,
} from "./integration-runtime-repository.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import {
  canonicalJson,
  sha256,
} from "./run-binding.js";
import {
  assertRuntimeResponseSerializable,
} from "./runtime-response-adapter.js";

export type MissionEvidenceStatus = "PASS" | "FAIL" | "UNAVAILABLE";
export type TechnicalCertificationDecision = "GO" | "NO_GO" | "BLOCKED";

export interface MissionEvidenceInput {
  readonly evidenceId: string;
  readonly evidenceType: string;
  readonly source: string;
  readonly occurredAt: string;
  readonly status: MissionEvidenceStatus;
  readonly payload: unknown;
}

export interface MissionEvidence extends MissionEvidenceInput {
  readonly fingerprint: string;
}

export interface MissionEvidenceCertificationInput {
  readonly missionId: string;
  readonly runId: string;
  readonly source: string;
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
  readonly requiredEvidenceTypes: readonly string[];
  readonly evidence: readonly MissionEvidenceInput[];
}

export interface TechnicalCertificationResult {
  readonly decision: TechnicalCertificationDecision;
  readonly justification: readonly string[];
  readonly bundleFingerprint: string;
}

export interface MissionCertificationReport {
  readonly facts: readonly string[];
  readonly controls: readonly string[];
  readonly anomalies: readonly string[];
  readonly decision: TechnicalCertificationDecision;
}

export interface MissionEvidenceBundle {
  readonly schemaVersion: 1;
  readonly missionId: string;
  readonly runId: string;
  readonly source: string;
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
  readonly requiredEvidenceTypes: readonly string[];
  readonly evidence: readonly MissionEvidence[];
  readonly bundleFingerprint: string;
  readonly certification: TechnicalCertificationResult;
  readonly report: MissionCertificationReport;
}

export interface MissionEvidencePersistenceInput {
  readonly evidenceRecordId: string;
  readonly certificationRecordId: string;
  readonly occurredAt: string;
}

export interface MissionEvidenceCertifierFeatureFlag {
  readonly enabled: boolean;
}

export class MissionEvidenceCertificationError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "MissionEvidenceCertificationError";
  }
}

export class MissionEvidenceCertifier {
  readonly enabled: boolean;

  constructor(
    private readonly repository: IntegrationRuntimeRepository | null = null,
    featureFlag: MissionEvidenceCertifierFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  build(
    input: MissionEvidenceCertificationInput,
  ): MissionEvidenceBundle | null {
    if (!this.enabled) {
      return null;
    }
    assertCertificationInput(input);
    return createBundle(input);
  }

  verify(bundle: MissionEvidenceBundle): boolean {
    if (!this.enabled) {
      return false;
    }
    try {
      const expected = createBundle({
        missionId: bundle.missionId,
        runId: bundle.runId,
        source: bundle.source,
        authorityDecision: bundle.authorityDecision,
        validationStatus: bundle.validationStatus,
        pipelineTrace: bundle.pipelineTrace,
        missingArtifacts: bundle.missingArtifacts,
        requiredEvidenceTypes: bundle.requiredEvidenceTypes,
        evidence: bundle.evidence.map(
          ({ fingerprint: _fingerprint, ...evidence }) => evidence,
        ),
      });
      return canonicalJson(expected) === canonicalJson(bundle);
    } catch {
      return false;
    }
  }

  async persist(
    bundle: MissionEvidenceBundle,
    input: MissionEvidencePersistenceInput,
  ): Promise<readonly IntegrationPersistedRecord[]> {
    if (!this.enabled) {
      return Object.freeze([]);
    }
    if (this.repository === null) {
      throw new MissionEvidenceCertificationError(
        "MEC-005",
        "Certification persistence repository is absent.",
      );
    }
    if (
      !this.verify(bundle) ||
      !isToken(input.evidenceRecordId) ||
      !isToken(input.certificationRecordId) ||
      input.evidenceRecordId === input.certificationRecordId ||
      !isCanonicalTimestamp(input.occurredAt)
    ) {
      throw new MissionEvidenceCertificationError(
        "MEC-004",
        "Only an intact bundle with valid persistence metadata can be stored.",
      );
    }

    const evidenceRecord: IntegrationPersistedRecord = {
      schemaVersion: 1,
      recordId: input.evidenceRecordId,
      kind: "EVIDENCE",
      missionId: bundle.missionId,
      runId: bundle.runId,
      source: bundle.source,
      occurredAt: input.occurredAt,
      payload: bundle,
    };
    const certificationRecord: IntegrationPersistedRecord = {
      ...evidenceRecord,
      recordId: input.certificationRecordId,
      kind: "CERTIFICATION",
      payload: bundle.certification,
    };

    const storedEvidence = await this.repository.append(evidenceRecord);
    const storedCertification =
      await this.repository.append(certificationRecord);
    if (storedEvidence === null || storedCertification === null) {
      throw new MissionEvidenceCertificationError(
        "MEC-005",
        "Certification persistence repository is inactive.",
      );
    }
    return Object.freeze([storedEvidence, storedCertification]);
  }
}

function createBundle(
  input: MissionEvidenceCertificationInput,
): MissionEvidenceBundle {
  const requiredEvidenceTypes = Object.freeze(
    [...new Set(input.requiredEvidenceTypes)].sort(),
  );
  const evidence = Object.freeze(
    input.evidence
      .map((item) => {
        const base = {
          evidenceId: item.evidenceId,
          evidenceType: item.evidenceType,
          source: item.source,
          occurredAt: item.occurredAt,
          status: item.status,
          payload: item.payload,
        };
        return Object.freeze({
          ...base,
          fingerprint: sha256(canonicalJson(base)),
        });
      })
      .sort((left, right) =>
        `${left.evidenceType}:${left.evidenceId}`.localeCompare(
          `${right.evidenceType}:${right.evidenceId}`,
        ),
      ),
  );
  const evaluation = evaluateEvidence({
    authorityDecision: input.authorityDecision,
    validationStatus: input.validationStatus,
    missingArtifacts: input.missingArtifacts,
    requiredEvidenceTypes,
    evidence,
  });
  const report = Object.freeze({
    facts: Object.freeze([
      `MISSION:${input.missionId}`,
      `RUN:${input.runId}`,
      `EVIDENCE_COUNT:${evidence.length}`,
    ]),
    controls: Object.freeze([
      "AUTHORITY_CHECKED",
      "VALIDATION_CHECKED",
      "REQUIRED_EVIDENCE_CHECKED",
      "FINGERPRINTS_CHECKED",
    ]),
    anomalies: evaluation.justification,
    decision: evaluation.decision,
  });
  const unsigned = {
    schemaVersion: 1 as const,
    missionId: input.missionId,
    runId: input.runId,
    source: input.source,
    authorityDecision: input.authorityDecision,
    validationStatus: input.validationStatus,
    pipelineTrace: input.pipelineTrace,
    missingArtifacts: input.missingArtifacts,
    requiredEvidenceTypes,
    evidence,
    report,
  };
  const bundleFingerprint = sha256(canonicalJson(unsigned));
  const certification = Object.freeze({
    decision: evaluation.decision,
    justification: evaluation.justification,
    bundleFingerprint,
  });

  return Object.freeze({
    ...unsigned,
    bundleFingerprint,
    certification,
  });
}

function evaluateEvidence(input: {
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly missingArtifacts: readonly string[];
  readonly requiredEvidenceTypes: readonly string[];
  readonly evidence: readonly MissionEvidence[];
}): {
  readonly decision: TechnicalCertificationDecision;
  readonly justification: readonly string[];
} {
  const blocked = new Set<string>();
  const failed = new Set<string>();
  const presentTypes = new Set(
    input.evidence.map((item) => item.evidenceType),
  );

  for (const required of input.requiredEvidenceTypes) {
    if (!presentTypes.has(required)) {
      blocked.add(`REQUIRED_EVIDENCE_MISSING:${required}`);
    }
  }
  for (const evidence of input.evidence) {
    if (evidence.status === "UNAVAILABLE") {
      blocked.add(`EVIDENCE_UNAVAILABLE:${evidence.evidenceId}`);
    } else if (evidence.status === "FAIL") {
      failed.add(`EVIDENCE_FAILED:${evidence.evidenceId}`);
    }
  }
  if (input.authorityDecision === null) {
    blocked.add("AUTHORITY_UNAVAILABLE");
  } else if (input.authorityDecision.resolutionStatus !== "RESOLVED") {
    failed.add("AUTHORITY_UNRESOLVED");
  }
  if (input.validationStatus !== "VALID") {
    failed.add("VALIDATION_INVALID");
  }
  for (const artifact of input.missingArtifacts) {
    failed.add(`MISSING_ARTIFACT:${artifact}`);
  }

  if (blocked.size > 0) {
    return {
      decision: "BLOCKED",
      justification: Object.freeze([...blocked].sort()),
    };
  }
  if (failed.size > 0) {
    return {
      decision: "NO_GO",
      justification: Object.freeze([...failed].sort()),
    };
  }
  return {
    decision: "GO",
    justification: Object.freeze(["ALL_REQUIRED_EVIDENCE_VALID"]),
  };
}

function assertCertificationInput(
  input: MissionEvidenceCertificationInput,
): void {
  if (
    !isToken(input.missionId) ||
    !isToken(input.runId) ||
    !isToken(input.source) ||
    input.pipelineTrace.missionId !== input.missionId ||
    !Array.isArray(input.missingArtifacts) ||
    !input.missingArtifacts.every(isToken) ||
    !Array.isArray(input.requiredEvidenceTypes) ||
    !input.requiredEvidenceTypes.every(isToken) ||
    new Set(input.requiredEvidenceTypes).size !==
      input.requiredEvidenceTypes.length ||
    !Array.isArray(input.evidence)
  ) {
    throw new MissionEvidenceCertificationError(
      "MEC-001",
      "Invalid evidence certification input.",
    );
  }

  const ids = new Set<string>();
  for (const evidence of input.evidence) {
    if (
      !isToken(evidence.evidenceId) ||
      !isToken(evidence.evidenceType) ||
      !isToken(evidence.source) ||
      !isCanonicalTimestamp(evidence.occurredAt) ||
      !isEvidenceStatus(evidence.status) ||
      ids.has(evidence.evidenceId)
    ) {
      throw new MissionEvidenceCertificationError(
        "MEC-002",
        "Evidence metadata is invalid or duplicated.",
      );
    }
    ids.add(evidence.evidenceId);
    assertRuntimeResponseSerializable(evidence.payload);
  }
}

function isEvidenceStatus(value: unknown): value is MissionEvidenceStatus {
  return value === "PASS" || value === "FAIL" || value === "UNAVAILABLE";
}

function isToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  ) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}
