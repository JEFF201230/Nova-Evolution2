import {
  EvidenceId,
  type BusinessEvidenceRecord,
  type CertificationResolution,
  type EvidenceQueryResult,
} from "../evidence/index.js";
import type { WorkEvidenceLinks } from "./work-evidence.links.js";
import {
  WORK_EVIDENCE_SOURCE_DOMAIN,
  type WorkEvidenceReadItem,
  type WorkEvidenceReadResult,
  type WorkEvidenceReference,
  type WorkEvidenceUnavailableReason,
} from "./work-evidence.types.js";

const AVAILABILITY_PROBE_ID = EvidenceId.of("work_evidence_authority_availability_probe");

/** The existing certified Evidence query shape; no parallel Evidence query is introduced. */
export interface WorkEvidenceReadSource {
  byEvidenceId(id: EvidenceId): EvidenceQueryResult;
  byOrderedEvidenceIds(ids: readonly EvidenceId[]): readonly EvidenceQueryResult[];
}

export interface WorkCertificationReadSource<T> {
  resolve(evidence: BusinessEvidenceRecord): CertificationResolution<T>;
}

/** Internal read-only Work -> Evidence boundary. */
export class WorkEvidenceQuery<TCertification = unknown> {
  constructor(
    private readonly links: Pick<WorkEvidenceLinks, "listByWork">,
    private readonly evidence: WorkEvidenceReadSource,
    private readonly certification?: WorkCertificationReadSource<TCertification>,
  ) {}

  get(work: WorkEvidenceReference, options: Readonly<{ includeCertification?: boolean }> = {}): WorkEvidenceReadResult<TCertification> {
    const reference = Object.freeze({ projectId: work.projectId, workId: work.workId });
    let links: ReturnType<WorkEvidenceLinks["listByWork"]>;
    try { links = this.links.listByWork(reference); }
    catch { return unavailable(reference, "WORK_EVIDENCE_LINKS_UNAVAILABLE"); }
    if (!Array.isArray(links) || !linksAreConsistent(links, reference)) {
      return unavailable(reference, "WORK_EVIDENCE_LINKS_INCONSISTENT");
    }

    if (links.length === 0) {
      let probe: unknown;
      try { probe = this.evidence.byEvidenceId(AVAILABILITY_PROBE_ID); }
      catch { return unavailable(reference, "EVIDENCE_AUTHORITY_UNAVAILABLE"); }
      if (!isEvidenceQueryResult(probe)) return unavailable(reference, "EVIDENCE_READ_INCONSISTENT");
      if (probe.state === "AUTHORITY_UNAVAILABLE") return unavailable(reference, "EVIDENCE_AUTHORITY_UNAVAILABLE");
      return Object.freeze({ ...reference, status: "AVAILABLE_EMPTY", sourceDomain: WORK_EVIDENCE_SOURCE_DOMAIN, evidences: Object.freeze([] as []) });
    }

    let results: unknown;
    try { results = this.evidence.byOrderedEvidenceIds(links.map((link) => EvidenceId.of(link.evidenceId))); }
    catch { return unavailable(reference, "EVIDENCE_AUTHORITY_UNAVAILABLE"); }
    if (!Array.isArray(results) || results.length !== links.length || !results.every(isEvidenceQueryResult)) {
      return unavailable(reference, "EVIDENCE_READ_INCONSISTENT");
    }
    if (results.some((result) => result.state === "AUTHORITY_UNAVAILABLE")) {
      return unavailable(reference, "EVIDENCE_AUTHORITY_UNAVAILABLE");
    }

    const items: WorkEvidenceReadItem<TCertification>[] = [];
    for (let index = 0; index < links.length; index += 1) {
      const link = links[index]!;
      const result = results[index] as Exclude<EvidenceQueryResult, { state: "AUTHORITY_UNAVAILABLE" }>;
      if (result.state === "ABSENT") {
        items.push(Object.freeze({ state: "EVIDENCE_UNKNOWN", link, evidenceId: link.evidenceId }));
        continue;
      }
      if (result.evidence.evidenceId.value !== link.evidenceId) return unavailable(reference, "EVIDENCE_READ_INCONSISTENT");
      const certification = options.includeCertification
        ? resolveCertification(result.evidence, this.certification)
        : undefined;
      items.push(Object.freeze({
        state: "EVIDENCE_FOUND",
        link,
        evidenceId: link.evidenceId,
        lifecycle: result.evidence.lifecycle,
        evidence: result.evidence,
        ...(certification === undefined ? {} : { certification }),
      }));
    }
    return Object.freeze({
      ...reference,
      status: "AVAILABLE",
      sourceDomain: WORK_EVIDENCE_SOURCE_DOMAIN,
      evidences: Object.freeze(items) as readonly [WorkEvidenceReadItem<TCertification>, ...WorkEvidenceReadItem<TCertification>[]],
    });
  }
}

function resolveCertification<T>(evidence: BusinessEvidenceRecord, source?: WorkCertificationReadSource<T>): CertificationResolution<T> {
  if (evidence.certificationReference === null) return Object.freeze({ state: "REFERENCE_ABSENT" });
  if (source === undefined) return Object.freeze({ state: "AUTHORITY_UNAVAILABLE" });
  try {
    const result = source.resolve(evidence);
    return isCertificationResolution(result) ? result : Object.freeze({ state: "AUTHORITY_UNAVAILABLE" });
  } catch (cause) {
    return Object.freeze({ state: "AUTHORITY_UNAVAILABLE", cause });
  }
}

function unavailable(reference: WorkEvidenceReference, reason: WorkEvidenceUnavailableReason): WorkEvidenceReadResult<never> {
  return Object.freeze({ ...reference, status: "UNAVAILABLE", sourceDomain: WORK_EVIDENCE_SOURCE_DOMAIN, reason });
}

function linksAreConsistent(links: readonly unknown[], work: WorkEvidenceReference): boolean {
  const ids = new Set<string>();
  for (const candidate of links) {
    if (typeof candidate !== "object" || candidate === null) return false;
    const link = candidate as Record<string, unknown>;
    if (link.projectId !== work.projectId || link.workId !== work.workId || typeof link.evidenceId !== "string" || ids.has(link.evidenceId)) return false;
    ids.add(link.evidenceId);
  }
  return true;
}

function isEvidenceQueryResult(value: unknown): value is EvidenceQueryResult {
  if (typeof value !== "object" || value === null || !("state" in value)) return false;
  const state = (value as { state: unknown }).state;
  return state === "ABSENT" || state === "AUTHORITY_UNAVAILABLE"
    || (state === "FOUND" && "evidence" in value && (value as { evidence?: unknown }).evidence !== undefined);
}

function isCertificationResolution<T>(value: unknown): value is CertificationResolution<T> {
  if (typeof value !== "object" || value === null || !("state" in value)) return false;
  const state = (value as { state: unknown }).state;
  return state === "REFERENCE_ABSENT" || state === "AUTHORITY_UNAVAILABLE" || (state === "RESOLVED" && "value" in value);
}
