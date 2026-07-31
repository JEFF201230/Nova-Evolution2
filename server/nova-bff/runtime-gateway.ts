import { RuntimeGatewayAdapter } from "./runtime-gateway.adapter.js";
import type {
  RuntimeGatewayPort,
  RuntimeGatewayRequestDto,
  RuntimeGatewayResponseDto,
} from "./runtime-gateway.port.js";
import { RuntimeRequestMapper } from "./runtime-request.mapper.js";
import { RuntimeResponseMapper } from "./runtime-response.mapper.js";

export class RuntimeGateway implements RuntimeGatewayPort {
  constructor(
    private readonly adapter: RuntimeGatewayAdapter,
    private readonly requestMapper = new RuntimeRequestMapper(),
    private readonly responseMapper = new RuntimeResponseMapper(),
  ) {}

  async execute(
    request: RuntimeGatewayRequestDto,
  ): Promise<RuntimeGatewayResponseDto> {
    const invocation = this.requestMapper.map(request);
    const result = await this.adapter.execute(invocation);
    return this.responseMapper.map(invocation, result);
  }
}
