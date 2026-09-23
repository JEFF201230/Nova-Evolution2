import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { HOME_ACTIVE_WORK_PATH, type HomeActiveWorkResponse } from "../../contracts/home-active-work.contract.js";
import { runtimeWorkOverviewPath, workOverviewPath, type WorkOverviewResponse } from "../../contracts/work-overview.contract.js";
import { ConfidenceAuthority, FileConfidenceJournal, type ConfidenceEvidenceReadPort } from "../domain/confidence/index.js";
import { EvidenceId, type BusinessEvidenceRecord } from "../domain/evidence/index.js";
import type { IntelligenceAssessment } from "../domain/intelligence/index.js";
import { IntelligenceConfidenceProducer } from "../domain/intelligence/intelligence-confidence.producer.js";
import {
  BusinessInstant, BusinessPeriod, CausalityId, Phase, PhaseId, PlanningAuthority, PlanningCommands,
  PlanningProvenance, PlanningRevision, PlanningSQLiteRepository, PlanningVersion, Schedule, WorkReference,
} from "../domain/planning/index.js";
import { sessionCookiePair, startTestBff, TEST_PASSWORD, testBffConfig } from "../nova-bff/bff.test-support.js";
import { HttpHomeActiveWorkGateway } from "../nova-bff/home-active-work.gateway.js";
import { HttpWorkOverviewGateway } from "../nova-bff/work-overview.gateway.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import { NovaCoreService } from "./nova-core.service.js";
import { WorkOverviewQuery, type WorkOverviewSources } from "./work-overview.query.js";

const PROJECT_ID = "NOVA";
const WORK_ID = "WORK-OVERVIEW-E2E";
const OBSERVED_AT = "2026-09-21T08:00:00.000Z";

test("HOME real Active Work reaches an authoritative Work Overview through authenticated BFF", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "work-overview-e2e-"));
  const runtimePath = join(directory, "runtime.json");
  const planningPath = join(directory, "planning.sqlite");
  const confidencePath = join(directory, "confidence.json");
  establishPlanning(planningPath);
  establishConfidence(confidencePath);
  const core = await NovaCoreService.open(runtimePath, undefined, {
    journalAttestationKey: "work-overview-e2e-attestation-key-001",
    planningDatabasePath: planningPath,
    confidenceJournalPath: confidencePath,
    intelligenceJournalPath: join(directory, "intelligence.json"),
    synthesisJournalPath: join(directory, "synthesis.json"),
    peopleDatabasePath: join(directory, "people.sqlite"),
  });
  await core.createMission({
    projectId: PROJECT_ID, missionId: WORK_ID, missionType: "WORK",
    objective: "Close Work Overview gaps with authoritative data.", authority: "PROGRAM_DIRECTOR",
    scope: { allowed: ["server/nova-core", "server/nova-bff", "apps/nova-web"], forbidden: ["VEEDDA", "CEREBRAU"] },
    deliverables: ["Authoritative Work Overview"], stopCriteria: ["The real user path returns the Overview."],
    authorizedReferences: ["NOVA_WORK_OVERVIEW_READMODEL_SPECIFICATION.md"],
  });

  const coreServer = createNovaCoreHttpServer(core); coreServer.listen(0, "127.0.0.1"); await once(coreServer, "listening");
  context.after(() => coreServer.close());
  const coreOrigin = `http://127.0.0.1:${(coreServer.address() as AddressInfo).port}`;
  const bff = await startTestBff(testBffConfig({ runtimeOrigin: coreOrigin }), {
    homeActiveWorkGateway: new HttpHomeActiveWorkGateway(coreOrigin),
    workOverviewGateway: new HttpWorkOverviewGateway(coreOrigin),
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);

  const homeResponse = await fetch(`${bff.baseUrl}${HOME_ACTIVE_WORK_PATH}`, { headers: { Cookie: proof.cookie } });
  const home = await homeResponse.json() as HomeActiveWorkResponse;
  assert.equal(homeResponse.status, 200);
  assert.deepEqual(home.works.map((work) => work.workIdentity), [{ projectId: PROJECT_ID, workId: WORK_ID }]);

  const selectedWorkId = home.works[0]!.workIdentity.workId;
  const overviewResponse = await fetch(`${bff.baseUrl}${workOverviewPath(selectedWorkId)}`, { headers: { Cookie: proof.cookie } });
  const overview = await overviewResponse.json() as WorkOverviewResponse;
  assert.equal(overviewResponse.status, 200);
  assert.deepEqual(overview.overview, {
    projectId: PROJECT_ID, workId: WORK_ID, title: "Close Work Overview gaps with authoritative data.", confidence: 75,
    phase: { current: 1, total: 1 }, dueAt: "2099-01-01T00:00:00.000Z", insight: null, nextAction: null,
    deferredActionCount: 0, pendingDecision: null,
    progress: { percentage: 0, owner: null, updatedAt: home.works[0]!.updatedAt },
    deliverables: [], people: [], novaUpdate: null,
  });
});

test("Work Overview returns explicit NOT_READY when mandatory producers are absent", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "work-overview-not-ready-"));
  const core = await NovaCoreService.open(join(directory, "runtime.json"), undefined, {
    journalAttestationKey: "work-overview-not-ready-attestation-key-001",
  });
  await core.createMission({
    projectId: PROJECT_ID, missionId: WORK_ID, missionType: "WORK", objective: "Remain fail-closed without mandatory producers.", authority: "PROGRAM_DIRECTOR",
    scope: { allowed: ["server/nova-core"], forbidden: [] }, deliverables: ["Explicit NOT_READY"], stopCriteria: ["No fallback is emitted."], authorizedReferences: [],
  });
  const server = createNovaCoreHttpServer(core); server.listen(0, "127.0.0.1"); await once(server, "listening");
  context.after(() => server.close());
  const response = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}${runtimeWorkOverviewPath(PROJECT_ID, WORK_ID)}`);
  const body = await response.json() as { error: { code: string; missingGroups: string[] } };
  assert.equal(response.status, 409);
  assert.equal(body.error.code, "WORK_OVERVIEW_NOT_READY");
  assert.ok(body.error.missingGroups.includes("WORK_PHASE"));
  assert.ok(body.error.missingGroups.includes("WORK_SCHEDULE"));
  assert.ok(body.error.missingGroups.includes("WORK_CONFIDENCE"));
});

test("Work Overview returns NOT_READY instead of substituting an absent business due date", async () => {
  const reference = { projectId: PROJECT_ID, workId: WORK_ID };
  const sources = {
    workCore: { load: () => ({
      schemaVersion: "1.0.0",
      identity: { ...reference, objective: "Work without an authoritative due date.", mission: { projectId: PROJECT_ID, missionId: WORK_ID }, provenance: { sourceDomain: "MISSIONS", producer: "ORCHESTRATOR_RUNTIME", sourceId: `${PROJECT_ID}/${WORK_ID}`, observedAt: OBSERVED_AT } },
      lifecycle: { current: "ACTIVE", observedAt: OBSERVED_AT, provenance: { sourceDomain: "WORK", producer: "WCF-001-LIFECYCLE-001", sourceId: `${PROJECT_ID}/${WORK_ID}/ACTIVE`, observedAt: OBSERVED_AT } },
      progression: { percentage: 25, observedAt: OBSERVED_AT, provenance: { sourceDomain: "MONITORING", producer: "ORCHESTRATOR_OBSERVABILITY", sourceId: "progress-1", observedAt: OBSERVED_AT, sequence: 1, correlationId: "corr-1", runId: null } },
      timestamps: { createdAt: OBSERVED_AT, updatedAt: OBSERVED_AT },
    }) },
    planning: { get: () => ({ ...reference, status: "PLANNING_AVAILABLE", sourceDomain: "PLANNING", planningVersion: 1, revision: 1, phase: { current: 1, total: 1, phaseId: "delivery" }, dueAt: null, dependencies: [] }) },
    confidence: { get: () => ({ ...reference, status: "CONFIDENCE_AVAILABLE", sourceDomain: "CONFIDENCE", value: 75 }) },
    intelligence: { listByWork: () => [] },
    synthesis: { get: () => ({ ...reference, status: "SYNTHESIS_ABSENT", sourceDomain: "SYNTHESIS" }) },
    actions: { get: () => ({ ...reference, status: "ACTIONS_AVAILABLE_EMPTY", sourceDomain: "ACTIONS", actions: [] }) },
    deliverables: { get: () => ({ ...reference, missionId: WORK_ID, deliverables: [] }) },
    decisions: { get: async () => ({ ...reference, decisions: [] }) },
    people: { get: () => ({ ...reference, status: "WORK_PEOPLE_ABSENT", sourceDomain: "PEOPLE" }) },
  } as unknown as WorkOverviewSources;
  const result = await new WorkOverviewQuery(sources).get(reference);
  assert.deepEqual(result, { state: "NOT_READY", missingGroups: ["WORK_SCHEDULE"] });
});

test("Work Overview never substitutes an Insight statement for an absent Recommendation", async () => {
  const reference = { projectId: PROJECT_ID, workId: WORK_ID };
  const current = intelligenceAssessment();
  const content = current.currentRevision.content;
  const insightOnly = {
    ...current,
    currentRevision: {
      ...current.currentRevision,
      content: {
        ...content,
        insights: [{ insightId: "insight-work", statement: "The authoritative situation summary.", analysisId: "analysis-work", factualAssertionIds: [] }],
        recommendations: [],
      },
    },
  } as unknown as IntelligenceAssessment;
  const sources = readySources(reference, [insightOnly]);

  const result = await new WorkOverviewQuery(sources).get(reference);

  assert.deepEqual(result, { state: "NOT_READY", missingGroups: ["WORK_INSIGHT"] });
});

function readySources(
  reference: Readonly<{ projectId: string; workId: string }>,
  intelligence: readonly IntelligenceAssessment[],
): WorkOverviewSources {
  return {
    workCore: { load: () => ({
      schemaVersion: "1.0.0",
      identity: { ...reference, objective: "Authoritative Work Overview.", mission: { projectId: reference.projectId, missionId: reference.workId }, provenance: { sourceDomain: "MISSIONS", producer: "ORCHESTRATOR_RUNTIME", sourceId: `${reference.projectId}/${reference.workId}`, observedAt: OBSERVED_AT } },
      lifecycle: { current: "ACTIVE", observedAt: OBSERVED_AT, provenance: { sourceDomain: "WORK", producer: "WCF-001-LIFECYCLE-001", sourceId: `${reference.projectId}/${reference.workId}/ACTIVE`, observedAt: OBSERVED_AT } },
      progression: { percentage: 25, observedAt: OBSERVED_AT, provenance: { sourceDomain: "MONITORING", producer: "ORCHESTRATOR_OBSERVABILITY", sourceId: "progress-1", observedAt: OBSERVED_AT, sequence: 1, correlationId: "corr-1", runId: null } },
      timestamps: { createdAt: OBSERVED_AT, updatedAt: OBSERVED_AT },
    }) },
    planning: { get: () => ({ ...reference, status: "PLANNING_AVAILABLE", sourceDomain: "PLANNING", planningVersion: 1, revision: 1, phase: { current: 1, total: 1, phaseId: "delivery" }, dueAt: "2099-01-01T00:00:00.000Z", dependencies: [] }) },
    confidence: { get: () => ({ ...reference, status: "CONFIDENCE_AVAILABLE", sourceDomain: "CONFIDENCE", value: 75 }) },
    intelligence: { listByWork: () => intelligence },
    synthesis: { get: () => ({ ...reference, status: "SYNTHESIS_ABSENT", sourceDomain: "SYNTHESIS" }) },
    actions: { get: () => ({ ...reference, status: "ACTIONS_AVAILABLE_EMPTY", sourceDomain: "ACTIONS", actions: [] }) },
    deliverables: { get: () => ({ ...reference, missionId: reference.workId, deliverables: [] }) },
    decisions: { get: async () => ({ ...reference, decisions: [] }) },
    people: { get: () => ({ ...reference, status: "WORK_PEOPLE_ABSENT", sourceDomain: "PEOPLE" }) },
  } as unknown as WorkOverviewSources;
}

function establishPlanning(path: string): void {
  const database = new DatabaseSync(path);
  try {
    const repository = new PlanningSQLiteRepository(database);
    const work = WorkReference.of(PROJECT_ID, WORK_ID);
    const authority = PlanningAuthority.create("PLANNING_AUTHORITY", { workExists: (reference) => reference.equals(work), objectiveAvailable: () => true });
    const source = PlanningProvenance.of("PLANNING_AUTHORITY", "SIGNED_PLANNING_DECISION", "work-overview-e2e-planning", new Date(OBSERVED_AT));
    const phase = Phase.of(PhaseId.of("delivery"), "Deliver the authorized Work Overview scope.");
    const start = BusinessInstant.of(new Date("2020-01-01T00:00:00.000Z"), "Approved phase start", source, "BUSINESS_DECISION");
    const end = BusinessInstant.of(new Date("2099-01-01T00:00:00.000Z"), "Approved Work due date", source, "BUSINESS_DECISION");
    const revision = PlanningRevision.of({
      version: PlanningVersion.of(1),
      applicability: BusinessPeriod.of({ start, end, startBoundary: "INCLUSIVE", endBoundary: "EXCLUSIVE", meaning: "Approved Work planning window", provenance: source }),
      phases: [phase], milestones: [], dependencies: [],
      schedule: Schedule.of([{ element: phase.reference, time: BusinessPeriod.of({ start, end, startBoundary: "INCLUSIVE", endBoundary: "EXCLUSIVE", meaning: "Approved delivery phase", provenance: source }) }]),
      priorities: [], constraints: [], provenance: source,
    });
    new PlanningCommands(authority, repository).establishPlanning({
      command: { kind: "ESTABLISH_PLANNING", workReference: work, causality: CausalityId.of("work-overview-e2e-planning"), provenance: source, expectedVersion: null, proposal: revision },
      expectedRevision: 0, correlationId: "work-overview-e2e",
    });
  } finally { database.close(); }
}

function establishConfidence(path: string): void {
  const intelligence = intelligenceAssessment();
  const produced = new IntelligenceConfidenceProducer({ byAssessmentId: () => ({ state: "FOUND", assessment: intelligence }) }).produce({
    intelligenceAssessmentId: intelligence.assessmentId,
    subject: { kind: "WORK_RESULT", reference: `${PROJECT_ID}/${WORK_ID}`, statement: "The current Work result is supported by authoritative Evidence." },
    context: { scope: `${PROJECT_ID}/${WORK_ID}`, applicability: "Current Work result at the declared observation date." },
    supportingEvidence: [{ evidenceId: "e-work-support", weight: 6 }], contradictingEvidence: [{ evidenceId: "e-work-contradict-a", weight: 1 }, { evidenceId: "e-work-contradict-b", weight: 1 }], inconclusiveEvidence: [],
    limitations: ["Bounded to the declared Work result and Evidence."], producedAt: new Date("2026-09-21T08:01:00.000Z"),
  });
  new ConfidenceAuthority(new FileConfidenceJournal(path), evidencePort()).assess({
    confidenceAssessmentId: "confidence-work-overview-e2e", actor: "authorized-reviewer",
    causationIdentity: "work-overview-e2e-confidence", idempotencyIdentity: "work-overview-e2e-confidence-1",
    at: new Date("2026-09-21T08:02:00.000Z"), produced,
  });
}

function intelligenceAssessment(): IntelligenceAssessment {
  const content = {
    question: "Is the current Work result supported?", scope: `${PROJECT_ID}/${WORK_ID}`, method: "DECLARED_ANALYSIS_V1", observedAt: OBSERVED_AT,
    factualAssertions: [{ assertionId: "fact-work", statement: "Authoritative Evidence supports the Work result.", evidenceIds: ["e-work-support"] as [string] }],
    hypotheses: [], interpretations: [],
    contradictions: [{ contradictionId: "contradiction-work", statement: "Two authoritative sources contradict the result.", evidenceIds: ["e-work-contradict-a", "e-work-contradict-b"] as [string, string] }],
    limits: [{ limitId: "limit-work", statement: "The observation window is bounded." }], analyses: [], insights: [], recommendations: [], evaluations: [], diagnostics: [],
  };
  const revision = { revision: 1, content, provenance: { producer: "INTELLIGENCE_AUTHORITY" as const, actor: "analyst", causationIdentity: "work-overview-e2e-intelligence", producedAt: OBSERVED_AT }, reason: null };
  return Object.freeze({ assessmentId: "intelligence-work-overview-e2e", workReference: { projectId: PROJECT_ID, workId: WORK_ID }, lifecycle: "CURRENT", currentRevision: revision, revisions: [revision], history: [], withdrawal: null });
}

function evidencePort(): ConfidenceEvidenceReadPort {
  return { byEvidenceId(id) { return { state: "FOUND", evidence: activeEvidence(id.value) }; } };
}
function activeEvidence(id: string): BusinessEvidenceRecord {
  return Object.freeze({ evidenceId: EvidenceId.of(id), source: { authority: "ACTIONS_AUTHORITY" as const, kind: "ACTIONS_ACTION_RESULT_RECORDED" as const, projectIdentity: PROJECT_ID, workIdentity: WORK_ID, actionId: `action-${id}`, actionsRevision: 1, resultId: `result-${id}` }, provenance: { producer: "EVIDENCE_AUTHORITY" as const, sourceAuthority: "ACTIONS_AUTHORITY" as const, actor: "operator", occurredAt: OBSERVED_AT, registeredAt: OBSERVED_AT }, lifecycle: "ACTIVE", certificationReference: null, history: [] });
}

interface SessionProof { readonly cookie: string; readonly csrf: string }
async function authenticatedProof(baseUrl: string): Promise<SessionProof> {
  const anonymous = await fetch(`${baseUrl}/session`); const anonymousProof = proofFromResponse(anonymous);
  const login = await fetch(`${baseUrl}/session/login`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: anonymousProof.cookie, Origin: "https://bff.test", "X-CSRF-Token": anonymousProof.csrf }, body: JSON.stringify({ username: "active.operator", password: TEST_PASSWORD }) });
  assert.equal(login.status, 200); return proofFromResponse(login);
}
function proofFromResponse(response: Response): SessionProof { return { cookie: sessionCookiePair(response.headers.get("set-cookie") ?? ""), csrf: response.headers.get("x-csrf-token") ?? "" }; }
