import { join, resolve } from "node:path";
import { NovaCoreExecutionEngine } from "./nova-core.execution.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import { NovaCoreService } from "./nova-core.service.js";

const port = Number(process.env.PORT ?? 4100);
const host = process.env.HOST ?? "127.0.0.1";
const dataFile = resolve(process.env.NOVA_DATA_FILE ?? ".nova-data/runtime.json");
const repositoryRoot = resolve(process.env.NOVA_EXECUTION_ROOT ?? ".");
const executionDataRoot = resolve(
  process.env.NOVA_EXECUTION_DATA_ROOT ?? join(repositoryRoot, ".nova-data", "execution"),
);
const executionEngine = new NovaCoreExecutionEngine({
  repositoryRoot,
  dataRoot: executionDataRoot,
});

const core = await NovaCoreService.open(dataFile, executionEngine);
const server = createNovaCoreHttpServer(core);

server.listen(port, host, () => {
  console.log(`NOVA Core est prêt sur http://${host}:${port}`);
  console.log(`Mémoire locale : ${dataFile}`);
  console.log(`Moteur d’exécution autonome : ${repositoryRoot}`);
});
