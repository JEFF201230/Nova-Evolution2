import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import type { MissionDefinition } from "../runtime/orchestrator/orchestrator-runtime.js";
import type { NovaCoreExecutionRequest } from "./nova-core.execution.js";
import { NovaCoreService } from "./nova-core.service.js";
import { NovaCoreError, type EvidenceSubmission } from "./nova-core.types.js";

const MAX_BODY_BYTES = 1_000_000;

export function createNovaCoreHttpServer(core: NovaCoreService): Server {
  return createServer(async (request, response) => {
    try {
      await route(core, request, response);
    } catch (error) {
      sendError(response, error);
    }
  });
}

async function route(core: NovaCoreService, request: IncomingMessage, response: ServerResponse): Promise<void> {
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
    sendJson(response, 200, { missions: core.listMissions(url.searchParams.get("projectId") ?? undefined) });
    return;
  }

  if (request.method === "POST" && parts.length === 3) {
    const result = await core.createMission(await readJson<MissionDefinition>(request));
    sendJson(response, result.created ? 201 : 200, result);
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
      mission,
      report: core.getReport(projectId, missionId),
      events: core.getEvents(projectId, missionId),
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

  if (request.method === "POST" && parts[5] === "assign" && parts.length === 6) {
    const body = await readOptionalJson<{ agentId?: string }>(request);
    sendJson(response, 200, {
      mission: await core.assignAndLock(projectId, missionId, body.agentId),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "evidence" && parts.length === 6) {
    sendJson(response, 200, {
      report: await core.submitEvidence(projectId, missionId, await readJson<EvidenceSubmission>(request)),
      mission: core.getMission(projectId, missionId),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "execute" && parts.length === 6) {
    sendJson(response, 200, {
      report: await core.executeWithNovaCore(
        projectId,
        missionId,
        await readOptionalJson<NovaCoreExecutionRequest>(request),
      ),
      mission: core.getMission(projectId, missionId),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "technical-accept" && parts.length === 6) {
    sendJson(response, 200, {
      mission: await core.acceptTechnicalValidation(projectId, missionId),
    });
    return;
  }

  if (request.method === "POST" && parts[5] === "approve" && parts.length === 6) {
    sendJson(response, 200, {
      mission: await core.approveMission(projectId, missionId),
    });
    return;
  }

  throw new NovaCoreError(404, "ROUTE_NOT_FOUND", "Cette adresse n’existe pas.");
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

async function readOptionalJson<T extends object>(request: IncomingMessage): Promise<T> {
  const raw = await readBody(request);
  if (!raw) {
    return {} as T;
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
    sendJson(response, error.status, { error: { code: error.code, message: error.message } });
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
  response.setHeader("access-control-allow-headers", "content-type");
}
