import { readFile } from "node:fs/promises";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import type { AddressInfo, Server } from "node:net";
import { pathToFileURL } from "node:url";
import { loadBffConfig, type BffConfig } from "./bff.config.js";
import { JsonConsoleLogger, type BffLogger } from "./bff.logger.js";
import {
  createNovaBffApplication,
  type NovaBffDependencies,
} from "./nova-bff.app.js";
import { HttpHomeActiveWorkGateway } from "./home-active-work.gateway.js";

export async function createNovaBffServer(
  config: BffConfig,
  dependencies: NovaBffDependencies = {},
): Promise<Server> {
  const application = createNovaBffApplication(config, {
    ...dependencies,
    homeActiveWorkGateway: dependencies.homeActiveWorkGateway
      ?? new HttpHomeActiveWorkGateway(config.runtimeOrigin),
  });
  if (!config.tls) {
    return createHttpServer(application.handler);
  }
  const [key, cert] = await Promise.all([
    readFile(config.tls.keyFile),
    readFile(config.tls.certificateFile),
  ]);
  return createHttpsServer({ key, cert }, application.handler);
}

export async function startNovaBff(
  config: BffConfig = loadBffConfig(),
  logger: BffLogger = new JsonConsoleLogger(),
): Promise<Server> {
  const server = await createNovaBffServer(config, { logger });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address() as AddressInfo | string | null;
  logger.info("server.started", {
    host: config.host,
    port: typeof address === "object" && address ? address.port : config.port,
    transport: config.tls ? "https" : "http_internal",
    environment: config.environment,
    runtimeProxy: "configured_not_connected",
  });
  return server;
}

function installShutdownHandlers(server: Server, logger: BffLogger): void {
  let shuttingDown = false;
  const shutdown = (signal: string): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info("server.stopping", { signal });
    server.close((error) => {
      if (error) {
        logger.error("server.stop_failed", { signal });
        process.exitCode = 1;
      } else {
        logger.info("server.stopped", { signal });
      }
    });
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const logger = new JsonConsoleLogger();
  const server = await startNovaBff(loadBffConfig(), logger);
  installShutdownHandlers(server, logger);
}
