import type { WorkOverviewMissingGroup, WorkOverviewReadModel } from "../../contracts/work-overview.contract.js";
import type { WorkCoreAggregate, WorkDecisions, WorkDeliverables } from "../runtime/work/work-core.js";
import type { WorkPeopleReadResult } from "../runtime/work/work-people.types.js";
import type { IntelligenceAssessment } from "../domain/intelligence/index.js";
import type { WorkActionsReadResult, WorkConfidenceReadResult, WorkPlanningReadResult, WorkSynthesisReadResult } from "../domain/work/index.js";

export type WorkOverviewReference = Readonly<{ projectId: string; workId: string }>;
export type WorkOverviewQueryResult = Readonly<{ state: "READY"; overview: WorkOverviewReadModel }>
  | Readonly<{ state: "NOT_READY"; missingGroups: readonly WorkOverviewMissingGroup[] }>
  | Readonly<{ state: "NOT_FOUND" }>;
export interface WorkOverviewSources {
  workCore: Readonly<{ load(projectId: string, workId: string): WorkCoreAggregate }>;
  planning: Readonly<{ get(work: WorkOverviewReference): WorkPlanningReadResult }>;
  confidence: Readonly<{ get(work: WorkOverviewReference): WorkConfidenceReadResult }>;
  intelligence: Readonly<{ listByWork(work: WorkOverviewReference): readonly IntelligenceAssessment[] }>;
  synthesis: Readonly<{ get(work: WorkOverviewReference): WorkSynthesisReadResult }>;
  actions: Readonly<{ get(work: WorkOverviewReference): WorkActionsReadResult }>;
  deliverables: Readonly<{ get(projectId: string, workId: string): WorkDeliverables }>;
  decisions: Readonly<{ get(projectId: string, workId: string): Promise<WorkDecisions> }>;
  people: Readonly<{ get(work: WorkOverviewReference, qualifiedAt: Date): WorkPeopleReadResult }>;
}

/** Read-only fail-closed composition. It never calculates a domain-owned value. */
export class WorkOverviewQuery {
  constructor(private readonly sources: WorkOverviewSources, private readonly now: () => Date = () => new Date()) {}
  async get(reference: WorkOverviewReference): Promise<WorkOverviewQueryResult> {
    let core: WorkCoreAggregate;
    try { core = this.sources.workCore.load(reference.projectId, reference.workId); }
    catch (error) { return missingWork(error) ? Object.freeze({ state: "NOT_FOUND" }) : notReady(["WORK_IDENTITY"]); }
    const missing = new Set<WorkOverviewMissingGroup>();
    const planning = safe(() => this.sources.planning.get(reference));
    if (!planning || planning.status !== "PLANNING_AVAILABLE") { missing.add("WORK_PHASE"); missing.add("WORK_SCHEDULE"); }
    else if (planning.dueAt === null) missing.add("WORK_SCHEDULE");
    const confidence = safe(() => this.sources.confidence.get(reference));
    if (!confidence || confidence.status !== "CONFIDENCE_AVAILABLE") missing.add("WORK_CONFIDENCE");
    const intelligence = safe(() => this.sources.intelligence.listByWork(reference));
    if (intelligence === null || intelligence.filter((item) => item.lifecycle === "CURRENT").length > 1) missing.add("WORK_INSIGHT");
    const currentIntelligence = intelligence?.filter((item) => item.lifecycle === "CURRENT")[0];
    const content = currentIntelligence?.currentRevision.content;
    const insightRecommendations = content?.recommendations.filter((item) => item.actionId === undefined) ?? [];
    const hasInsightProjection = content !== undefined && (content.insights.length > 0 || insightRecommendations.length > 0);
    const insight = content && content.insights.length === 1 && insightRecommendations.length === 1
      && content.insights[0]!.analysisId === insightRecommendations[0]!.analysisId
      ? Object.freeze({ summary: content.insights[0]!.statement, recommendation: insightRecommendations[0]!.statement }) : null;
    if (hasInsightProjection && insight === null) missing.add("WORK_INSIGHT");
    if (content?.recommendations.some((item) => item.actionId !== undefined)) missing.add("WORK_NEXT_ACTION");
    const actions = safe(() => this.sources.actions.get(reference));
    if (!actions || actions.status === "ACTIONS_UNAVAILABLE" || actions.status === "ACTIONS_AVAILABLE") missing.add("WORK_NEXT_ACTION");
    const deliverables = safe(() => this.sources.deliverables.get(reference.projectId, reference.workId));
    if (!deliverables || deliverables.deliverables.length > 0) missing.add("WORK_DELIVERABLES");
    const decisions = await safeAsync(() => this.sources.decisions.get(reference.projectId, reference.workId));
    if (!decisions || decisions.decisions.length > 0) missing.add("WORK_DECISION");
    const people = safe(() => this.sources.people.get(reference, this.now()));
    if (!people || people.status === "PEOPLE_UNAVAILABLE" || people.status === "PARTICIPANTS_AVAILABLE") missing.add("WORK_PEOPLE");
    const synthesis = safe(() => this.sources.synthesis.get(reference));
    if (!synthesis || synthesis.status === "SYNTHESIS_UNAVAILABLE") missing.add("WORK_NOVA_UPDATE");
    if (missing.size > 0 || !planning || planning.status !== "PLANNING_AVAILABLE" || !confidence || confidence.status !== "CONFIDENCE_AVAILABLE") return notReady([...missing]);
    const synthesisValue = synthesis && (synthesis.status === "SYNTHESIS_AVAILABLE" || synthesis.status === "SYNTHESIS_AVAILABLE_EMPTY") ? synthesis.synthesis : null;
    const firstSynthesis = synthesisValue?.currentRevision.content.elements[0];
    return Object.freeze({ state: "READY", overview: Object.freeze({
      projectId: core.identity.projectId, workId: core.identity.workId, title: core.identity.objective,
      confidence: confidence.value, phase: Object.freeze({ current: planning.phase.current, total: planning.phase.total }), dueAt: planning.dueAt,
      insight, nextAction: null, deferredActionCount: 0, pendingDecision: null,
      progress: Object.freeze({ percentage: core.progression.percentage, owner: null, updatedAt: core.timestamps.updatedAt }),
      deliverables: Object.freeze([]), people: Object.freeze([]),
      novaUpdate: firstSynthesis ? Object.freeze({ message: firstSynthesis.text, updatedAt: synthesisValue!.currentRevision.content.observationDate }) : null,
    }) });
  }
}
function safe<T>(read: () => T): T | null { try { return read(); } catch { return null; } }
async function safeAsync<T>(read: () => Promise<T>): Promise<T | null> { try { return await read(); } catch { return null; } }
function notReady(groups: readonly WorkOverviewMissingGroup[]): WorkOverviewQueryResult { return Object.freeze({ state: "NOT_READY", missingGroups: Object.freeze([...new Set(groups)].sort()) }); }
function missingWork(error: unknown): boolean { return error instanceof Error && /WCF-ERR-001|not found|n.existe pas/i.test(error.message); }
