import type { ConfidenceAssessment } from "../confidence/index.js";

export const WORK_CONFIDENCE_SOURCE_DOMAIN = "CONFIDENCE" as const;
export type WorkConfidenceReference = Readonly<{ projectId: string; workId: string }>;
export type WorkConfidenceReadResult =
  | (WorkConfidenceReference & Readonly<{ status: "CONFIDENCE_ABSENT"; sourceDomain: typeof WORK_CONFIDENCE_SOURCE_DOMAIN }>)
  | (WorkConfidenceReference & Readonly<{ status: "CONFIDENCE_UNAVAILABLE"; sourceDomain: typeof WORK_CONFIDENCE_SOURCE_DOMAIN; reason: "CONFIDENCE_READ_UNAVAILABLE" | "CONFIDENCE_READ_INCONSISTENT" }>)
  | (WorkConfidenceReference & Readonly<{ status: "CONFIDENCE_AVAILABLE"; sourceDomain: typeof WORK_CONFIDENCE_SOURCE_DOMAIN; value: number; assessment: ConfidenceAssessment }>);
