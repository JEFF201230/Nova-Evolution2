import { asBffError } from "../bff.errors.js";
import { sendJson } from "../bff.http.js";
import { RUNTIME_EXECUTE_PATH } from "../runtime-execute.contract.js";
import type { BffMiddleware } from "../bff.types.js";

export const errorHandlerMiddleware: BffMiddleware = async (
  context,
  next,
) => {
  try {
    await next();
  } catch (error) {
    const safeError = asBffError(error);
    context.logger.error("request.error", {
      correlationId: context.correlationId,
      code: safeError.code,
      status: safeError.status,
    });
    if (context.pathname === RUNTIME_EXECUTE_PATH) {
      sendJson(context.response, safeError.status, {
        success: false,
        correlationId: context.correlationId,
        error: {
          code: safeError.code,
          message: safeError.message,
        },
      });
    } else {
      sendJson(context.response, safeError.status, {
        error: {
          code: safeError.code,
          message: safeError.message,
          correlationId: context.correlationId,
        },
      });
    }
  }
};
