import type { WorkOverviewResponse } from "../../contracts/work-overview.contract.js";
export interface WorkOverviewGatewayPort { get(workId: string, correlationId: string): Promise<WorkOverviewResponse>; }
