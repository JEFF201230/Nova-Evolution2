import { BffError } from "../bff.errors.js";
import type { BffMiddleware } from "../bff.types.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const csrfMiddleware: BffMiddleware = async (context, next) => {
  const method = context.request.method ?? "GET";
  if (SAFE_METHODS.has(method)) {
    await next();
    return;
  }

  const fetchSite = context.request.headers["sec-fetch-site"];
  if (fetchSite === "cross-site") {
    throw new BffError(403, "CSRF_CROSS_SITE_REJECTED", "Cross-site requests are forbidden.");
  }

  const origin = context.request.headers.origin;
  if (origin !== undefined && origin !== context.config.publicOrigin) {
    throw new BffError(403, "CSRF_ORIGIN_REJECTED", "The request origin is not allowed.");
  }

  const suppliedToken = context.request.headers["x-csrf-token"];
  if (
    typeof suppliedToken !== "string"
    || (
      context.pathname === "/session/logout"
        ? !await context.sessionManager.verifyLogoutCsrf(
            context.request,
            context.session,
            suppliedToken,
          )
        : !context.session
          || !context.sessionManager.verifyCsrfToken(context.session, suppliedToken)
    )
  ) {
    throw new BffError(403, "CSRF_TOKEN_INVALID", "The CSRF token is missing or invalid.");
  }
  await next();
};
