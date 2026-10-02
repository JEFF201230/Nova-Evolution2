import type { WorkPlanResponse } from "../../contracts/work-plan.contract.js";

export interface WorkPlanGatewayPort {
  read(workId: string, correlationId: string): Promise<WorkPlanResponse>;
}
