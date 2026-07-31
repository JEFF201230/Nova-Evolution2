import type {
  HomeActiveWorkResponse,
} from "../../contracts/home-active-work.contract.js";

export interface HomeActiveWorkGatewayPort {
  list(correlationId: string): Promise<HomeActiveWorkResponse>;
}
