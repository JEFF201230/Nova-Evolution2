import type { WorkSynthesis } from "../synthesis/index.js";

export const WORK_SYNTHESIS_SOURCE_DOMAIN = "SYNTHESIS" as const;

export type WorkSynthesisReference = Readonly<{ projectId: string; workId: string }>;
export type WorkSynthesisUnavailableReason = "SYNTHESIS_AUTHORITY_UNAVAILABLE" | "SYNTHESIS_READ_INCONSISTENT";

export type WorkSynthesisAbsent = WorkSynthesisReference & Readonly<{
  status: "SYNTHESIS_ABSENT";
  sourceDomain: typeof WORK_SYNTHESIS_SOURCE_DOMAIN;
}>;

export type WorkSynthesisAvailableEmpty = WorkSynthesisReference & Readonly<{
  status: "SYNTHESIS_AVAILABLE_EMPTY";
  sourceDomain: typeof WORK_SYNTHESIS_SOURCE_DOMAIN;
  synthesis: WorkSynthesis;
}>;

export type WorkSynthesisAvailable = WorkSynthesisReference & Readonly<{
  status: "SYNTHESIS_AVAILABLE";
  sourceDomain: typeof WORK_SYNTHESIS_SOURCE_DOMAIN;
  synthesis: WorkSynthesis;
}>;

export type WorkSynthesisWithdrawn = WorkSynthesisReference & Readonly<{
  status: "SYNTHESIS_WITHDRAWN";
  sourceDomain: typeof WORK_SYNTHESIS_SOURCE_DOMAIN;
  synthesis: WorkSynthesis;
}>;

export type WorkSynthesisUnavailable = WorkSynthesisReference & Readonly<{
  status: "SYNTHESIS_UNAVAILABLE";
  sourceDomain: typeof WORK_SYNTHESIS_SOURCE_DOMAIN;
  reason: WorkSynthesisUnavailableReason;
}>;

export type WorkSynthesisReadResult = WorkSynthesisAbsent | WorkSynthesisAvailableEmpty
  | WorkSynthesisAvailable | WorkSynthesisWithdrawn | WorkSynthesisUnavailable;
