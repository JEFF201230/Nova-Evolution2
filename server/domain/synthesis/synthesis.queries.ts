import { SynthesisAuthority } from "./synthesis.authority.js";
import type { SynthesisWorkReference, WorkSynthesis } from "./synthesis.types.js";

export type CurrentSynthesisQueryResult =
  | Readonly<{ state: "FOUND"; synthesis: WorkSynthesis }>
  | Readonly<{ state: "ABSENT" }>
  | Readonly<{ state: "AUTHORITY_UNAVAILABLE"; cause: unknown }>;

export class SynthesisQueries {
  constructor(private readonly authority: SynthesisAuthority) {}

  currentByWork(work: SynthesisWorkReference): CurrentSynthesisQueryResult {
    try {
      const synthesis = [...this.authority.readAll().values()].find((item) => item.lifecycle === "CURRENT"
        && item.workReference.projectId === work.projectId && item.workReference.workId === work.workId);
      return synthesis === undefined ? Object.freeze({ state: "ABSENT" }) : Object.freeze({ state: "FOUND", synthesis });
    } catch (cause) { return Object.freeze({ state: "AUTHORITY_UNAVAILABLE", cause }); }
  }

  historyByWork(work: SynthesisWorkReference): readonly WorkSynthesis[] {
    return Object.freeze([...this.authority.readAll().values()]
      .filter((item) => item.workReference.projectId === work.projectId && item.workReference.workId === work.workId)
      .sort((left, right) => left.history[0]!.at < right.history[0]!.at ? -1 : left.history[0]!.at > right.history[0]!.at ? 1 : left.synthesisId < right.synthesisId ? -1 : 1));
  }
}
