import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { ConfidenceAuthority, FileConfidenceJournal, type ConfidenceEvidenceReadPort } from "../domain/confidence/index.js";
import { EvidenceId, type BusinessEvidenceRecord } from "../domain/evidence/index.js";
import type { IntelligenceAssessment } from "../domain/intelligence/index.js";
import { IntelligenceConfidenceProducer } from "../domain/intelligence/intelligence-confidence.producer.js";
import { BusinessInstant, BusinessPeriod, CausalityId, Phase, PhaseId, PlanningAuthority, PlanningCommands, PlanningProvenance, PlanningRevision, PlanningSQLiteRepository, PlanningVersion, Schedule, WorkReference } from "../domain/planning/index.js";

export const E2E_PROJECT_ID = "NOVA";
export const E2E_WORK_ID = "WORK-OVERVIEW-E2E";
export const E2E_OBJECTIVE = "Close Work Overview gaps with authoritative data.";
const OBSERVED_AT = "2026-09-21T08:00:00.000Z";

export function seedWorkOverviewAuthorities(directory: string): Readonly<{ planningPath: string; confidencePath: string }> {
  const planningPath = join(directory, "planning.sqlite"); const confidencePath = join(directory, "confidence.json");
  const database = new DatabaseSync(planningPath);
  try {
    const repository = new PlanningSQLiteRepository(database); const work = WorkReference.of(E2E_PROJECT_ID, E2E_WORK_ID);
    const authority = PlanningAuthority.create("PLANNING_AUTHORITY", { workExists: (reference) => reference.equals(work), objectiveAvailable: () => true });
    const source = PlanningProvenance.of("PLANNING_AUTHORITY", "SIGNED_PLANNING_DECISION", "work-overview-e2e-planning", new Date(OBSERVED_AT));
    const phase = Phase.of(PhaseId.of("delivery"), "Deliver the authorized Work Overview scope.");
    const start = BusinessInstant.of(new Date("2020-01-01T00:00:00.000Z"), "Approved phase start", source, "BUSINESS_DECISION");
    const end = BusinessInstant.of(new Date("2099-01-01T00:00:00.000Z"), "Approved Work due date", source, "BUSINESS_DECISION");
    const period = BusinessPeriod.of({ start, end, startBoundary: "INCLUSIVE", endBoundary: "EXCLUSIVE", meaning: "Approved delivery phase", provenance: source });
    const revision = PlanningRevision.of({ version: PlanningVersion.of(1), applicability: period, phases: [phase], milestones: [], dependencies: [], schedule: Schedule.of([{ element: phase.reference, time: period }]), priorities: [], constraints: [], provenance: source });
    new PlanningCommands(authority, repository).establishPlanning({ command: { kind: "ESTABLISH_PLANNING", workReference: work, causality: CausalityId.of("work-overview-e2e-planning"), provenance: source, expectedVersion: null, proposal: revision }, expectedRevision: 0, correlationId: "work-overview-e2e" });
  } finally { database.close(); }
  const intelligence = intelligenceAssessment();
  const produced = new IntelligenceConfidenceProducer({ byAssessmentId: () => ({ state: "FOUND", assessment: intelligence }) }).produce({
    intelligenceAssessmentId: intelligence.assessmentId,
    subject: { kind: "WORK_RESULT", reference: `${E2E_PROJECT_ID}/${E2E_WORK_ID}`, statement: "The current Work result is supported by authoritative Evidence." },
    context: { scope: `${E2E_PROJECT_ID}/${E2E_WORK_ID}`, applicability: "Current Work result at the declared observation date." },
    supportingEvidence: [{ evidenceId: "e-work-support", weight: 6 }], contradictingEvidence: [{ evidenceId: "e-work-contradict-a", weight: 1 }, { evidenceId: "e-work-contradict-b", weight: 1 }], inconclusiveEvidence: [],
    limitations: ["Bounded to the declared Work result and Evidence."], producedAt: new Date("2026-09-21T08:01:00.000Z"),
  });
  new ConfidenceAuthority(new FileConfidenceJournal(confidencePath), evidencePort()).assess({ confidenceAssessmentId: "confidence-work-overview-e2e", actor: "authorized-reviewer", causationIdentity: "work-overview-e2e-confidence", idempotencyIdentity: "work-overview-e2e-confidence-1", at: new Date("2026-09-21T08:02:00.000Z"), produced });
  return Object.freeze({ planningPath, confidencePath });
}

function intelligenceAssessment(): IntelligenceAssessment {
  const content = { question: "Is the current Work result supported?", scope: `${E2E_PROJECT_ID}/${E2E_WORK_ID}`, method: "DECLARED_ANALYSIS_V1", observedAt: OBSERVED_AT,
    factualAssertions: [{ assertionId: "fact-work", statement: "Authoritative Evidence supports the Work result.", evidenceIds: ["e-work-support"] as [string] }], hypotheses: [], interpretations: [],
    contradictions: [{ contradictionId: "contradiction-work", statement: "Two authoritative sources contradict the result.", evidenceIds: ["e-work-contradict-a", "e-work-contradict-b"] as [string, string] }],
    limits: [{ limitId: "limit-work", statement: "The observation window is bounded." }], analyses: [], insights: [], recommendations: [], evaluations: [], diagnostics: [] };
  const revision = { revision: 1, content, provenance: { producer: "INTELLIGENCE_AUTHORITY" as const, actor: "analyst", causationIdentity: "work-overview-e2e-intelligence", producedAt: OBSERVED_AT }, reason: null };
  return Object.freeze({ assessmentId: "intelligence-work-overview-e2e", workReference: { projectId: E2E_PROJECT_ID, workId: E2E_WORK_ID }, lifecycle: "CURRENT", currentRevision: revision, revisions: [revision], history: [], withdrawal: null });
}
function evidencePort(): ConfidenceEvidenceReadPort { return { byEvidenceId(id) { return { state: "FOUND", evidence: activeEvidence(id.value) }; } }; }
function activeEvidence(id: string): BusinessEvidenceRecord { return Object.freeze({ evidenceId: EvidenceId.of(id), source: { authority: "ACTIONS_AUTHORITY" as const, kind: "ACTIONS_ACTION_RESULT_RECORDED" as const, projectIdentity: E2E_PROJECT_ID, workIdentity: E2E_WORK_ID, actionId: `action-${id}`, actionsRevision: 1, resultId: `result-${id}` }, provenance: { producer: "EVIDENCE_AUTHORITY" as const, sourceAuthority: "ACTIONS_AUTHORITY" as const, actor: "operator", occurredAt: OBSERVED_AT, registeredAt: OBSERVED_AT }, lifecycle: "ACTIVE", certificationReference: null, history: [] }); }
