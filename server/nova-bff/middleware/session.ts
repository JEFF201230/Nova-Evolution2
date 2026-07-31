import type { BffMiddleware } from "../bff.types.js";

export const sessionMiddleware: BffMiddleware = async (context, next) => {
  context.session = await context.sessionManager.resolve(
    context.request,
    context.response,
    false,
  );
  await next();
};
