import type {
  WorkActivityResponse,
} from "../../contracts/work-activity.contract.js";

export interface WorkActivityGatewayPort {
  read(workId: string, correlationId: string): Promise<WorkActivityResponse>;
}
