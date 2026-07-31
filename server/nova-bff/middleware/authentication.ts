import { BffError } from "../bff.errors.js";
import type { BffMiddleware } from "../bff.types.js";

export const requireAuthentication: BffMiddleware = async (
  context,
  next,
) => {
  if (!context.session?.userId) {
    throw new BffError(
      401,
      "AUTHENTICATION_REQUIRED",
      "An authenticated server session is required.",
    );
  }
  await next();
};
