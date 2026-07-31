import type { IncomingMessage, ServerResponse } from "node:http";
import type { BffConfig } from "./bff.config.js";
import type { BffLogger } from "./bff.logger.js";
import type {
  IdentityProvider,
  LoginAttemptLimiter,
} from "./bff.identity.js";
import type { ServerSession, SessionManager } from "./bff.session.js";

export interface BffRequestContext {
  readonly request: IncomingMessage;
  readonly response: ServerResponse;
  readonly config: BffConfig;
  readonly logger: BffLogger;
  readonly sessionManager: SessionManager;
  readonly identityProvider: IdentityProvider;
  readonly loginAttemptLimiter: LoginAttemptLimiter;
  readonly startedAt: number;
  correlationId: string;
  pathname: string;
  isSecure: boolean;
  session: ServerSession | null;
  jsonBody: Record<string, unknown> | null;
}

export type BffNext = () => Promise<void>;

export type BffMiddleware = (
  context: BffRequestContext,
  next: BffNext,
) => Promise<void>;

export function composeMiddleware(
  middleware: readonly BffMiddleware[],
): BffMiddleware {
  return async (context, terminalNext) => {
    let lastIndex = -1;

    const dispatch = async (index: number): Promise<void> => {
      if (index <= lastIndex) {
        throw new Error("BFF_MIDDLEWARE_NEXT_CALLED_TWICE");
      }
      lastIndex = index;
      const current = middleware[index];
      if (!current) {
        await terminalNext();
        return;
      }
      await current(context, () => dispatch(index + 1));
    };

    await dispatch(0);
  };
}
