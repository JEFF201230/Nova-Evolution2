export const WORK_OVERVIEW_PATH_PREFIX = "/api/work" as const;
export const RUNTIME_WORK_OVERVIEW_PATH_PREFIX = "/api/v1/missions" as const;

export interface WorkOverviewReadModel {
  readonly projectId: string;
  readonly workId: string;
  readonly title: string;
  readonly confidence: number;
  readonly phase: Readonly<{ current: number; total: number }>;
  readonly dueAt: string | null;
  readonly insight: Readonly<{ summary: string; recommendation: string }> | null;
  readonly nextAction: Readonly<{ title: string; durationLabel: string; impactLabel: string; confidenceFrom: number; confidenceTo: number; why: string }> | null;
  readonly deferredActionCount: number;
  readonly pendingDecision: Readonly<{ decisionId: string; dueAt: string | null; confidence: number; title: string; consequence: string }> | null;
  readonly progress: Readonly<{ percentage: number; owner: Readonly<{ id: string; label: string }> | null; updatedAt: string }>;
  readonly deliverables: readonly Readonly<{ id: string; title: string; confidence: number }>[];
  readonly people: readonly Readonly<{ id: string; name: string; availability: string; kind: "HUMAN" | "NOVA"; status: "AVAILABLE" | "BUSY" | "AWAY" }>[];
  readonly novaUpdate: Readonly<{ message: string; updatedAt: string }> | null;
}

export type WorkOverviewMissingGroup = "WORK_IDENTITY" | "WORK_CONFIDENCE" | "WORK_PHASE" | "WORK_SCHEDULE" | "WORK_INSIGHT" | "WORK_NEXT_ACTION" | "WORK_DECISION" | "WORK_PROGRESS" | "WORK_DELIVERABLES" | "WORK_PEOPLE" | "WORK_NOVA_UPDATE";
export interface WorkOverviewResponse { readonly overview: WorkOverviewReadModel; }
export interface WorkOverviewNotReady { readonly error: Readonly<{ code: "WORK_OVERVIEW_NOT_READY"; missingGroups: readonly WorkOverviewMissingGroup[] }> }
const MISSING_GROUPS = new Set<WorkOverviewMissingGroup>(["WORK_IDENTITY", "WORK_CONFIDENCE", "WORK_PHASE", "WORK_SCHEDULE", "WORK_INSIGHT", "WORK_NEXT_ACTION", "WORK_DECISION", "WORK_PROGRESS", "WORK_DELIVERABLES", "WORK_PEOPLE", "WORK_NOVA_UPDATE"]);

export function workOverviewPath(workId: string): string { return `${WORK_OVERVIEW_PATH_PREFIX}/${encode(workId)}/overview`; }
export function runtimeWorkOverviewPath(projectId: string, workId: string): string { return `${RUNTIME_WORK_OVERVIEW_PATH_PREFIX}/${encode(projectId)}/${encode(workId)}/overview`; }
function encode(value: string): string { if (typeof value !== "string" || value.length === 0 || value.trim() !== value) throw new Error("WORK_OVERVIEW_CONTRACT_INVALID"); return encodeURIComponent(value); }

export function parseWorkOverviewResponse(value: unknown): WorkOverviewResponse {
  if (!record(value)) throw invalid();
  exact(value, ["overview"]);
  if (!record(value.overview)) throw invalid();
  const overview = value.overview;
  exact(overview, ["projectId", "workId", "title", "confidence", "phase", "dueAt", "insight", "nextAction", "deferredActionCount", "pendingDecision", "progress", "deliverables", "people", "novaUpdate"]);
  text(overview.projectId); text(overview.workId); text(overview.title); percentage(overview.confidence);
  if (!record(overview.phase)) throw invalid();
  exact(overview.phase, ["current", "total"]);
  if (!Number.isSafeInteger(overview.phase.current) || !Number.isSafeInteger(overview.phase.total)
    || (overview.phase.current as number) < 1 || (overview.phase.total as number) < (overview.phase.current as number)) throw invalid();
  nullableIso(overview.dueAt);
  nullable(overview.insight, (insight) => { exact(insight, ["summary", "recommendation"]); text(insight.summary); text(insight.recommendation); });
  nullable(overview.nextAction, (action) => {
    exact(action, ["title", "durationLabel", "impactLabel", "confidenceFrom", "confidenceTo", "why"]);
    text(action.title); text(action.durationLabel); text(action.impactLabel); percentage(action.confidenceFrom); percentage(action.confidenceTo); text(action.why);
  });
  if (!record(overview.progress)) throw invalid();
  exact(overview.progress, ["percentage", "owner", "updatedAt"]);
  percentage(overview.progress.percentage); iso(overview.progress.updatedAt);
  nullable(overview.progress.owner, (owner) => { exact(owner, ["id", "label"]); text(owner.id); text(owner.label); });
  if (!Array.isArray(overview.deliverables) || !Array.isArray(overview.people)
    || !Number.isSafeInteger(overview.deferredActionCount) || (overview.deferredActionCount as number) < 0) throw invalid();
  nullable(overview.pendingDecision, (decision) => {
    exact(decision, ["decisionId", "dueAt", "confidence", "title", "consequence"]);
    text(decision.decisionId); nullableIso(decision.dueAt); percentage(decision.confidence); text(decision.title); text(decision.consequence);
  });
  for (const value of overview.deliverables) {
    if (!record(value)) throw invalid();
    exact(value, ["id", "title", "confidence"]); text(value.id); text(value.title); percentage(value.confidence);
  }
  for (const value of overview.people) {
    if (!record(value)) throw invalid();
    exact(value, ["id", "name", "availability", "kind", "status"]); text(value.id); text(value.name); text(value.availability);
    if (!(value.kind === "HUMAN" || value.kind === "NOVA") || !(value.status === "AVAILABLE" || value.status === "BUSY" || value.status === "AWAY")) throw invalid();
  }
  nullable(overview.novaUpdate, (update) => { exact(update, ["message", "updatedAt"]); text(update.message); iso(update.updatedAt); });
  return deepFreeze(JSON.parse(JSON.stringify(value)) as WorkOverviewResponse);
}
export function parseWorkOverviewNotReady(value: unknown): WorkOverviewNotReady {
  if (!record(value)) throw invalid();
  exact(value, ["error"]);
  if (!record(value.error)) throw invalid();
  exact(value.error, ["code", "missingGroups"]);
  if (value.error.code !== "WORK_OVERVIEW_NOT_READY"
    || !Array.isArray(value.error.missingGroups) || value.error.missingGroups.length === 0
    || new Set(value.error.missingGroups).size !== value.error.missingGroups.length
    || value.error.missingGroups.some((group) => typeof group !== "string" || !MISSING_GROUPS.has(group as WorkOverviewMissingGroup))) throw invalid();
  return deepFreeze(JSON.parse(JSON.stringify(value)) as WorkOverviewNotReady);
}
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function exact(value: Record<string, unknown>, expected: readonly string[]): void {
  const actual = Object.keys(value).sort(); const sorted = [...expected].sort();
  if (actual.length !== sorted.length || actual.some((key, index) => key !== sorted[index])) throw invalid();
}
function nullable(value: unknown, validate: (value: Record<string, unknown>) => void): void { if (value === null) return; if (!record(value)) throw invalid(); validate(value); }
function text(value: unknown): asserts value is string { if (typeof value !== "string" || value.length === 0 || value.trim() !== value) throw invalid(); }
function percentage(value: unknown): void { if (!Number.isSafeInteger(value) || (value as number) < 0 || (value as number) > 100) throw invalid(); }
function iso(value: unknown): void { if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw invalid(); }
function nullableIso(value: unknown): void { if (value !== null) iso(value); }
function deepFreeze<T>(value: T): T { if (typeof value === "object" && value !== null) { Object.values(value).forEach(deepFreeze); Object.freeze(value); } return value; }
function invalid(): Error { return new Error("WORK_OVERVIEW_CONTRACT_INVALID"); }
