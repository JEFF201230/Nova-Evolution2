import type { GlobalDeliverablesResponse } from "../../contracts/global-deliverables.contract.js";

export interface GlobalDeliverablesGatewayPort {
  list(correlationId: string): Promise<GlobalDeliverablesResponse>;
}
