import type { TLSSocket } from "node:tls";
import { BffError } from "../bff.errors.js";
import type { BffMiddleware, BffRequestContext } from "../bff.types.js";

export const securityHeadersMiddleware: BffMiddleware = async (
  context,
  next,
) => {
  const secure = isSecureRequest(context);
  context.isSecure = secure;

  context.response.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  context.response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  context.response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  context.response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  context.response.setHeader("Referrer-Policy", "no-referrer");
  context.response.setHeader("X-Content-Type-Options", "nosniff");
  context.response.setHeader("X-Frame-Options", "DENY");
  if (secure) {
    context.response.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  if (context.config.requireHttps && !secure) {
    throw new BffError(
      400,
      "HTTPS_REQUIRED",
      "This endpoint is available only through HTTPS.",
    );
  }
  await next();
};

function isSecureRequest(context: BffRequestContext): boolean {
  if ((context.request.socket as TLSSocket).encrypted === true) {
    return true;
  }
  if (!context.config.trustProxy) {
    return false;
  }
  const remoteAddress = context.request.socket.remoteAddress ?? "";
  if (!context.config.trustedProxyAddresses.has(remoteAddress)) {
    return false;
  }
  const forwardedProto = context.request.headers["x-forwarded-proto"];
  if (typeof forwardedProto !== "string") {
    return false;
  }
  return forwardedProto.split(",")[0]?.trim().toLowerCase() === "https";
}
