import { BffError } from "../bff.errors.js";
import type { BffRole } from "../bff.identity.js";
import type { BffMiddleware } from "../bff.types.js";

export function requireAnyRole(
  allowedRoles: readonly BffRole[],
): BffMiddleware {
  const allowed = new Set(allowedRoles);
  return async (context, next) => {
    const session = context.session;
    if (!session?.userId) {
      throw new BffError(
        401,
        "AUTHENTICATION_REQUIRED",
        "An authenticated server session is required.",
      );
    }
    if (!session.roles.some((role) => allowed.has(role))) {
      throw new BffError(
        403,
        "ROLE_FORBIDDEN",
        "The authenticated principal is not allowed to perform this action.",
      );
    }
    await next();
  };
}

export const BFF_CAPABILITY_MATRIX = Object.freeze({
  SESSION_READ_SELF: Object.freeze(["ADMIN", "OPERATOR", "APPROVER", "VIEWER"]),
  SESSION_LOGIN: Object.freeze(["ADMIN", "OPERATOR", "APPROVER", "VIEWER"]),
  SESSION_LOGOUT: Object.freeze(["ADMIN", "OPERATOR", "APPROVER", "VIEWER"]),
} satisfies Readonly<Record<string, readonly BffRole[]>>);

export type BffCapability = keyof typeof BFF_CAPABILITY_MATRIX;

export function requireCapability(capability: BffCapability): BffMiddleware {
  return requireAnyRole(BFF_CAPABILITY_MATRIX[capability]);
}
