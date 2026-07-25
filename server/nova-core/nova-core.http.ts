import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import type { MissionDefinition, RuntimeMission, RuntimeRecoveryAction } from "../runtime/orchestrator/orchestrator-runtime.js";
import { canonicalStateOf } from "../runtime/orchestrator/canonical-state.js";
import type { NovaCoreExecutionRequest } from "./nova-core.execution.js";
import { NovaCoreService } from "./nova-core.service.js";
import { NovaCoreError, type EvidenceSubmission } from "./nova-core.types.js";
import { validateScopePayload } from "./scope-validation.js";
import {
  authenticateCertificationAuthority,
  authorizeCertificationAuthority,
  type CertificationAuthority,
  type CertificationAuthorizationPolicy,
} from "./mission-certification.js";

const MAX_BODY_BYTES = 1_000_000;

export interface NovaCoreHttpOptions {
  certificationAuthorities?: readonly CertificationAuthority[];
  certificationPolicy?: CertificationAuthorizationPolicy;
}

export function createNovaCoreHttpServer(core: NovaCoreService, options: NovaCoreHttpOptions = {}): Server {
  return createServer(async (request, response) => {
    try {
      await route(core, request, response, options);
    } catch (error) {
      sendError(response, error);
    }
  });
}

async function route(
  core: NovaCoreService,
  request: IncomingMessage,
  response: ServerResponse,
  options: NovaCoreHttpOptions,
): Promise<void> {
  setCommonHeaders(response);
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url ?? "/", "http://nova.local");
  const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);

  if (request.method === "GET" && url.pathname === "/") {
    const html = await readFile(new URL("./public/index.html", import.meta.url), "utf8");
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { status: "ok", service: "nova-core", memory: "durable-json" });
    return;
  }

  if (parts[0] !== "api" || parts[1] !== "v1" || parts[2] !== "missions") {
    throw new NovaCoreError(404, "ROUTE_NOT_FOUND", "Cette adresse n’existe pas.");
  }

  if (request.method === "GET" && parts.length === 3) {
    sendJson(response, 200, { missions: core.listMissions(url.searchParams.get("projectId") ?? undefined).map(missionView) });
    return;
  }

  if (request.method === "POST" && parts.length === 3) {
    const definition = validateMissionDefinition(await readJson<unknown>(request));
    let scope;
    try {
      scope = validateScopePayload({ version: 1, ...definition.scope });
    } catch (error) {
      throw new NovaCoreError(400, "INVALID_SCOPE", error instanceof Error ? error.message : "Le scope est invalide.");
    }
    const result = await core.createMission({ ...definition, scope: { allowed: scope.payload.allowed, forbidden: scope.payload.forbidden } });
    sendJson(response, result.created ? 201 : 200, { ...result, mission: missionView(result.mission) });
    return;
  }

  const projectId = parts[3];
  const missionId = parts[4];
  if (!projectId || !missionId) {
    throw new NovaCoreError(404, "ROUTE_NOT_FOUND", "Cette adresse n’existe pas.");
  }

  if (request.method === "GET" && parts.length === 5) {
    const mission = core.getMission(projectId, missionId);
    if (!mission) {
      throw new NovaCoreError(404, "MISSION_NOT_FOUND", "La mission demandée n’existe pas.");
    }
    sendJson(response, 200, {
      mission: missionView(mission),
      report: core.getReport(projectId, missionId),
      events: core.getEvents(projectId, missionId),
      observabilityEvents: core.getObservabilityEvents(projectId, missionId),
      incompleteRuns: core.getIncompleteRuns(projectId, missionId),
    });
    return;
  }

  if (request.method === "GET" && parts[5] === "monitor" && parts.length === 6) {
    if (!core.getMission(projectId, missionId)) {
      throw new NovaCoreError(404, "MISSION_NOT_FOUND", "La mission demandée n’existe pas.");
    }
    sendJson(response, 200, {
      mission: missionView(core.getMission(projectId, missionId)),
      events: core.getObservabilityEvents(projectId, missionId),
      incompleteRuns: core.getIncompleteRuns(projectId, missionId),
    });
    return;
  }

  if (request.method === "GET" && parts[5] === "monitor" && parts[6] === "stream" && parts.length === 7) {
    if (!core.getMission(projectId, missionId)) {
      throw new NovaCoreError(404, "MISSION_NOT_FOUND", "La mission demandée n’existe pas.");
    }
    response.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });
    const writeEvent = (event: unknown) => {
      if (!response.writableEnded) response.write(`event: mission\ndata: ${JSON.stringify(event)}\n\n`);
    };
    for (const event of core.getObservabilityEvents(projectId, missionId)) writeEvent(event);
    const unsubscribe = core.subscribeObservability(projectId, missionId, writeEvent);
    const heartbeat = setInterval(() => {
      if (!response.writableEnded) response.write(": heartbeat\n\n");
    }, 15_000);
    request.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
    return;
  }

  if (request.method === "GET" && parts[5] === "events" && parts.length === 6) {
    if (!core.getMission(projectId, missionId)) {
      throw new NovaCoreError(404, "MISSION_NOT_FOUND", "La mission demandée n’existe pas.");
    }
    sendJson(response, 200, { events: core.getEvents(projectId, missionId) });
    return;
  }

  if (request.method === "GET" && parts[5] === "certificate" && parts.length === 6) {
    const certificate = core.getCertificate(projectId, missionId);
    if (!certificate) {
      throw new NovaCoreError(404, "CERTIFICATE_NOT_FOUND", "Aucun certificat n'a été émis pour cette mission.");
    }
    sendJson(response, 200, { certificate });
    return;
  }

  if (request.method === "POST" && parts[5] === "assign" && parts.length === 6) {
    const body = validateAssignRequest(await readOptionalJson<unknown>(request));
    sendJson(response, 200, {
      mission: missionView(await core.assignAndLock(projectId, missionId, body.agentId)),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "evidence" && parts.length === 6) {
    sendJson(response, 200, {
      report: await core.submitEvidence(projectId, missionId, validateEvidenceRequest(await readJson<unknown>(request))),
      mission: missionView(core.getMission(projectId, missionId)),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "execute" && parts.length === 6) {
    sendJson(response, 200, {
      report: await core.executeWithNovaCore(
        projectId,
        missionId,
        validateExecutionRequest(await readOptionalJson<unknown>(request)),
      ),
      mission: missionView(core.getMission(projectId, missionId)),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "cancel" && parts.length === 6) {
    sendJson(response, 202, core.cancelExecution(projectId, missionId));
    return;
  }

  if (request.method === "POST" && parts[5] === "technical-accept" && parts.length === 6) {
    sendJson(response, 200, {
      mission: missionView(await core.acceptTechnicalValidation(projectId, missionId)),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "certify" && parts.length === 6) {
    let authority;
    try {
      authority = authenticateCertificationAuthority(
        request.headers.authorization,
        options.certificationAuthorities ?? [],
      );
    } catch {
      throw new NovaCoreError(
        401,
        "CERTIFICATION_UNAUTHENTICATED",
        "Une autorité de certification authentifiée est obligatoire.",
      );
    }
    try {
      authority = authorizeCertificationAuthority(
        authority,
        options.certificationPolicy ?? { allowedAuthorityTypes: [], requiredRole: "CERTIFY" },
      );
    } catch {
      throw new NovaCoreError(
        403,
        "CERTIFICATION_FORBIDDEN",
        "L'autorite authentifiee n'est pas autorisee a certifier.",
      );
    }
    const certificate = await core.certifyMission(
      projectId,
      missionId,
      validateCertificationRequest(await readJson<unknown>(request)),
      authority,
    );
    sendJson(response, 201, {
      certificate,
      mission: missionView(core.getMission(projectId, missionId)),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "recovery" && parts.length === 7) {
    requireAuthority(request, options);
    const action = validateRecoveryAction(parts[6]);
    const body = validateRecoveryRequest(await readJson<unknown>(request));
    sendJson(response, 200, {
      recovery: await core.recoverMission(projectId, missionId, body.runId, action),
      mission: missionView(core.getMission(projectId, missionId)),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "approve" && parts.length === 6) {
    throw new NovaCoreError(410, "APPROVAL_ROUTE_REMOVED", "La validation finale exige l'endpoint de certification authentifie.");
  }

  throw new NovaCoreError(404, "ROUTE_NOT_FOUND", "Cette adresse n’existe pas.");
}

function missionView(mission: RuntimeMission | null): (RuntimeMission & { canonicalState: string }) | null {
  return mission ? { ...mission, canonicalState: canonicalStateOf(mission.state) } : null;
}

function validateMissionDefinition(input: unknown): MissionDefinition {
  const value = expectObject(input, "INVALID_MISSION");
  rejectUnknown(value, [
    "projectId", "missionId", "missionType", "objective", "authority", "scope",
    "deliverables", "stopCriteria", "authorizedReferences", "requestedAgentId", "priority", "createdAt",
  ]);
  const scope = expectObject(value.scope, "INVALID_SCOPE");
  rejectUnknown(scope, ["allowed", "forbidden"]);
  return {
    projectId: requiredString(value.projectId, "projectId"),
    missionId: requiredString(value.missionId, "missionId"),
    missionType: requiredString(value.missionType, "missionType"),
    objective: requiredString(value.objective, "objective", 20_000),
    authority: requiredString(value.authority, "authority"),
    scope: {
      allowed: stringArray(scope.allowed, "scope.allowed"),
      forbidden: stringArray(scope.forbidden, "scope.forbidden"),
    },
    deliverables: stringArray(value.deliverables, "deliverables"),
    stopCriteria: stringArray(value.stopCriteria, "stopCriteria"),
    authorizedReferences: stringArray(value.authorizedReferences, "authorizedReferences"),
    ...(value.requestedAgentId === undefined ? {} : { requestedAgentId: requiredString(value.requestedAgentId, "requestedAgentId") }),
    ...(value.priority === undefined ? {} : { priority: finiteNumber(value.priority, "priority") }),
    ...(value.createdAt === undefined ? {} : { createdAt: requiredString(value.createdAt, "createdAt") }),
  };
}

function validateAssignRequest(input: unknown): { agentId?: string } {
  const value = expectObject(input, "INVALID_ASSIGN_REQUEST");
  rejectUnknown(value, ["agentId"]);
  return value.agentId === undefined ? {} : { agentId: requiredString(value.agentId, "agentId") };
}

function validateEvidenceRequest(input: unknown): EvidenceSubmission {
  const value = expectObject(input, "INVALID_EVIDENCE");
  rejectUnknown(value, ["reportId", "reportType", "deliverables", "filesChanged", "checks", "blockers", "errors", "scopeConfirmed"]);
  if (value.scopeConfirmed !== true) {
    throw new NovaCoreError(400, "INVALID_EVIDENCE", "scopeConfirmed doit etre true.");
  }
  return {
    ...(value.reportId === undefined ? {} : { reportId: requiredString(value.reportId, "reportId") }),
    ...(value.reportType === undefined ? {} : { reportType: requiredString(value.reportType, "reportType") }),
    deliverables: stringArray(value.deliverables, "deliverables"),
    filesChanged: stringArray(value.filesChanged, "filesChanged"),
    checks: stringArray(value.checks, "checks"),
    ...(value.blockers === undefined ? {} : { blockers: stringArray(value.blockers, "blockers") }),
    ...(value.errors === undefined ? {} : { errors: stringArray(value.errors, "errors") }),
    scopeConfirmed: true,
  };
}

function validateExecutionRequest(input: unknown): NovaCoreExecutionRequest {
  const value = expectObject(input, "INVALID_EXECUTION_REQUEST");
  rejectUnknown(value, ["profile", "prompt", "expectedBranch", "changesExpected", "humanReviewRequired", "timeoutMs"]);
  const profiles = new Set(["FAST", "BUILD", "ARCHITECTURE", "READ_ONLY"]);
  if (value.profile !== undefined && (typeof value.profile !== "string" || !profiles.has(value.profile))) {
    throw new NovaCoreError(400, "INVALID_EXECUTION_REQUEST", "Le profil d'execution est invalide.");
  }
  return {
    ...(value.profile === undefined ? {} : { profile: value.profile as NovaCoreExecutionRequest["profile"] }),
    ...(value.prompt === undefined ? {} : { prompt: requiredString(value.prompt, "prompt", 100_000) }),
    ...(value.expectedBranch === undefined ? {} : { expectedBranch: requiredString(value.expectedBranch, "expectedBranch") }),
    ...(value.changesExpected === undefined ? {} : { changesExpected: requiredBoolean(value.changesExpected, "changesExpected") }),
    ...(value.humanReviewRequired === undefined ? {} : { humanReviewRequired: requiredBoolean(value.humanReviewRequired, "humanReviewRequired") }),
    ...(value.timeoutMs === undefined ? {} : { timeoutMs: positiveInteger(value.timeoutMs, "timeoutMs") }),
  };
}

function validateCertificationRequest(input: unknown): { runId: string; reportFingerprint: string; attestation: string } {
  const value = expectObject(input, "INVALID_CERTIFICATION_REQUEST");
  rejectUnknown(value, ["runId", "reportFingerprint", "attestation"]);
  const fingerprint = requiredString(value.reportFingerprint, "reportFingerprint");
  if (!/^[a-f0-9]{64}$/i.test(fingerprint)) {
    throw new NovaCoreError(400, "INVALID_CERTIFICATION_REQUEST", "reportFingerprint doit etre un SHA-256.");
  }
  return {
    runId: requiredString(value.runId, "runId"),
    reportFingerprint: fingerprint.toLowerCase(),
    attestation: requiredAttestation(value.attestation),
  };
}

function requiredAttestation(value: unknown): string {
  const attestation = requiredString(value, "attestation", 10_000);
  if (!/^[0-9a-f]{64}$/i.test(attestation)) {
    throw new NovaCoreError(
      400,
      "INVALID_CERTIFICATION_ATTESTATION",
      "attestation doit etre une signature HMAC-SHA256 hexadecimale.",
    );
  }
  return attestation;
}

function validateRecoveryRequest(input: unknown): { runId: string } {
  const value = expectObject(input, "INVALID_RECOVERY_REQUEST");
  rejectUnknown(value, ["runId"]);
  return { runId: requiredString(value.runId, "runId") };
}

function validateRecoveryAction(input: string): RuntimeRecoveryAction {
  if (!["reconcile", "resume", "abandon", "quarantine", "recover"].includes(input)) {
    throw new NovaCoreError(400, "INVALID_RECOVERY_ACTION", "L'action de recovery est invalide.");
  }
  return input as RuntimeRecoveryAction;
}

function requireAuthority(request: IncomingMessage, options: NovaCoreHttpOptions) {
  let principal;
  try {
    principal = authenticateCertificationAuthority(request.headers.authorization, options.certificationAuthorities ?? []);
  } catch {
    throw new NovaCoreError(401, "CERTIFICATION_UNAUTHENTICATED", "Une autorite authentifiee est obligatoire.");
  }
  try {
    return authorizeCertificationAuthority(
      principal,
      options.certificationPolicy ?? { allowedAuthorityTypes: [], requiredRole: "CERTIFY" },
    );
  } catch {
    throw new NovaCoreError(403, "CERTIFICATION_FORBIDDEN", "L'autorite n'est pas autorisee a gouverner le recovery.");
  }
}

function expectObject(input: unknown, code: string): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new NovaCoreError(400, code, "Le payload doit etre un objet JSON.");
  }
  return input as Record<string, unknown>;
}

function rejectUnknown(value: Record<string, unknown>, allowed: readonly string[]): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    throw new NovaCoreError(400, "UNKNOWN_PAYLOAD_FIELD", `Champs inconnus: ${unknown.join(", ")}.`);
  }
}

function requiredString(value: unknown, name: string, maxLength = 4_096): string {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new NovaCoreError(400, "INVALID_PAYLOAD_FIELD", `${name} doit etre une chaine non vide.`);
  }
  return value;
}

function stringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.length > 1_000 || value.some((entry) => typeof entry !== "string" || !entry.trim() || entry.length > 4_096)) {
    throw new NovaCoreError(400, "INVALID_PAYLOAD_FIELD", `${name} doit etre une liste de chaines.`);
  }
  return value as string[];
}

function requiredBoolean(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") {
    throw new NovaCoreError(400, "INVALID_PAYLOAD_FIELD", `${name} doit etre un booleen.`);
  }
  return value;
}

function finiteNumber(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new NovaCoreError(400, "INVALID_PAYLOAD_FIELD", `${name} doit etre un nombre fini.`);
  }
  return value;
}

function positiveInteger(value: unknown, name: string): number {
  const numeric = finiteNumber(value, name);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new NovaCoreError(400, "INVALID_PAYLOAD_FIELD", `${name} doit etre un entier positif.`);
  }
  return numeric;
}

async function readJson<T>(request: IncomingMessage): Promise<T> {
  const raw = await readBody(request);
  if (!raw) {
    throw new NovaCoreError(400, "EMPTY_BODY", "Le contenu de la demande est vide.");
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new NovaCoreError(400, "INVALID_JSON", "Le contenu envoyé n’est pas un JSON valide.");
  }
}

async function readOptionalJson<T>(request: IncomingMessage): Promise<T | Record<string, never>> {
  const raw = await readBody(request);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new NovaCoreError(400, "INVALID_JSON", "Le contenu envoyé n’est pas un JSON valide.");
  }
}

async function readBody(request: IncomingMessage): Promise<string> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) {
      throw new NovaCoreError(413, "BODY_TOO_LARGE", "Le contenu envoyé est trop volumineux.");
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function sendError(response: ServerResponse, error: unknown): void {
  if (error instanceof NovaCoreError) {
    sendJson(response, error.status, {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
        ...(error.diagnostics.length > 0 ? { diagnostics: error.diagnostics } : {}),
      },
    });
    return;
  }
  sendJson(response, 500, {
    error: {
      code: "INTERNAL_ERROR",
      message: "NOVA a rencontré une erreur interne.",
    },
  });
}

function setCommonHeaders(response: ServerResponse): void {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type, authorization");
}
