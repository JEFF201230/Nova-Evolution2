import type { BffMiddleware } from "../bff.types.js";

export const requestLoggerMiddleware: BffMiddleware = async (
  context,
  next,
) => {
  try {
    await next();
  } finally {
    context.logger.info("request.completed", {
      correlationId: context.correlationId,
      method: context.request.method ?? "UNKNOWN",
      path: context.pathname,
      status: context.response.statusCode,
      durationMs: Math.max(0, Date.now() - context.startedAt),
      authenticated: context.session?.userId !== null && context.session !== null,
    });
  }
};
