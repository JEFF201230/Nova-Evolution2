import type { WorkPeopleResponse } from "../../contracts/work-people.contract.js";

export interface WorkPeopleGatewayPort {
  read(workId: string, correlationId: string): Promise<WorkPeopleResponse>;
}
