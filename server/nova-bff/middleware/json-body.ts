import { BffError } from "../bff.errors.js";
import type { BffMiddleware } from "../bff.types.js";

const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const jsonBodyMiddleware: BffMiddleware = async (context, next) => {
  const method = context.request.method ?? "GET";
  if (!BODY_METHODS.has(method)) {
    await next();
    return;
  }

  const declaredLength = parseContentLength(
    context.request.headers["content-length"],
  );
  if (declaredLength > context.config.maxJsonBodyBytes) {
    throw new BffError(400, "JSON_BODY_TOO_LARGE", "The JSON body exceeds the configured limit.");
  }
  if (declaredLength === 0 && !context.request.headers["transfer-encoding"]) {
    context.jsonBody = null;
    await next();
    return;
  }

  const contentType = context.request.headers["content-type"];
  if (
    typeof contentType !== "string"
    || contentType.split(";")[0]?.trim().toLowerCase() !== "application/json"
  ) {
    throw new BffError(400, "JSON_CONTENT_TYPE_REQUIRED", "Content-Type must be application/json.");
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of context.request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > context.config.maxJsonBodyBytes) {
      throw new BffError(400, "JSON_BODY_TOO_LARGE", "The JSON body exceeds the configured limit.");
    }
    chunks.push(buffer);
  }
  if (size === 0) {
    context.jsonBody = null;
    await next();
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new BffError(400, "JSON_BODY_INVALID", "The request body is not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new BffError(400, "JSON_OBJECT_REQUIRED", "The JSON body must be an object.");
  }
  context.jsonBody = parsed as Record<string, unknown>;
  await next();
};

function parseContentLength(value: string | undefined): number {
  if (value === undefined) {
    return 0;
  }
  if (!/^\d+$/.test(value)) {
    throw new BffError(400, "CONTENT_LENGTH_INVALID", "Content-Length is invalid.");
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new BffError(400, "CONTENT_LENGTH_INVALID", "Content-Length is invalid.");
  }
  return parsed;
}
