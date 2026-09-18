import type { CurrentSynthesisQueryResult } from "../synthesis/index.js";
import type { WorkSynthesis } from "../synthesis/index.js";
import { WORK_SYNTHESIS_SOURCE_DOMAIN, type WorkSynthesisReadResult, type WorkSynthesisReference } from "./work-synthesis.types.js";

export interface WorkSynthesisReadSource {
  currentByWork(work: WorkSynthesisReference): CurrentSynthesisQueryResult;
  historyByWork(work: WorkSynthesisReference): readonly WorkSynthesis[];
}

/** Reference-only Work projection. It owns no Synthesis state and exposes no command capability. */
export class WorkSynthesisQuery {
  constructor(private readonly source: WorkSynthesisReadSource) {}

  get(work: WorkSynthesisReference): WorkSynthesisReadResult {
    const reference = canonical(work);
    try {
      const current = this.source.currentByWork(reference);
      if (current.state === "AUTHORITY_UNAVAILABLE") return unavailable(reference, "SYNTHESIS_AUTHORITY_UNAVAILABLE");
      if (current.state === "FOUND") {
        if (!matches(current.synthesis, reference) || current.synthesis.lifecycle !== "CURRENT") return unavailable(reference, "SYNTHESIS_READ_INCONSISTENT");
        return Object.freeze({ ...reference,
          status: current.synthesis.currentRevision.content.elements.length === 0 ? "SYNTHESIS_AVAILABLE_EMPTY" : "SYNTHESIS_AVAILABLE",
          sourceDomain: WORK_SYNTHESIS_SOURCE_DOMAIN, synthesis: current.synthesis });
      }
      const history = this.source.historyByWork(reference);
      if (history.length === 0) return Object.freeze({ ...reference, status: "SYNTHESIS_ABSENT", sourceDomain: WORK_SYNTHESIS_SOURCE_DOMAIN });
      if (history.some((item) => !matches(item, reference))) return unavailable(reference, "SYNTHESIS_READ_INCONSISTENT");
      const latest = [...history].sort((left, right) => compare(right.history.at(-1)?.at ?? "", left.history.at(-1)?.at ?? "") || compare(right.synthesisId, left.synthesisId))[0]!;
      if (latest.lifecycle !== "WITHDRAWN") return unavailable(reference, "SYNTHESIS_READ_INCONSISTENT");
      return Object.freeze({ ...reference, status: "SYNTHESIS_WITHDRAWN", sourceDomain: WORK_SYNTHESIS_SOURCE_DOMAIN, synthesis: latest });
    } catch {
      return unavailable(reference, "SYNTHESIS_AUTHORITY_UNAVAILABLE");
    }
  }
}

function canonical(work: WorkSynthesisReference): WorkSynthesisReference {
  if (typeof work?.projectId !== "string" || work.projectId.length === 0 || work.projectId.trim() !== work.projectId
    || typeof work.workId !== "string" || work.workId.length === 0 || work.workId.trim() !== work.workId) throw new TypeError("WorkReference must be canonical.");
  return Object.freeze({ projectId: work.projectId, workId: work.workId });
}
function matches(value: WorkSynthesis, work: WorkSynthesisReference): boolean { return value.workReference.projectId === work.projectId && value.workReference.workId === work.workId; }
function unavailable(reference: WorkSynthesisReference, reason: "SYNTHESIS_AUTHORITY_UNAVAILABLE" | "SYNTHESIS_READ_INCONSISTENT"): WorkSynthesisReadResult { return Object.freeze({ ...reference, status: "SYNTHESIS_UNAVAILABLE", sourceDomain: WORK_SYNTHESIS_SOURCE_DOMAIN, reason }); }
function compare(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
