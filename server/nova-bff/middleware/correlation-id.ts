import { randomUUID } from "node:crypto";
import type { BffMiddleware } from "../bff.types.js";

const CORRELATION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

export const correlationIdMiddleware: BffMiddleware = async (
  context,
  next,
) => {
  const supplied = context.request.headers["x-correlation-id"];
  context.correlationId = typeof supplied === "string"
    && CORRELATION_ID_PATTERN.test(supplied)
    ? supplied
    : randomUUID();
  context.response.setHeader("X-Correlation-ID", context.correlationId);
  await next();
};
