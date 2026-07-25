import { join, resolve } from "node:path";
import { NovaCoreExecutionEngine } from "./nova-core.execution.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import { NovaCoreService } from "./nova-core.service.js";
import { assertNovaBootstrap } from "./nova-core.bootstrap.js";
import type { CertificationAuthority } from "./mission-certification.js";

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
  ...(process.env.NOVA_EXECUTION_TIMEOUT_MS
    ? { defaultTimeoutMs: Number(process.env.NOVA_EXECUTION_TIMEOUT_MS) }
    : {}),
  ...(process.env.NOVA_EXECUTION_MAX_OUTPUT_BYTES
    ? { maxOutputBytes: Number(process.env.NOVA_EXECUTION_MAX_OUTPUT_BYTES) }
    : {}),
});
const certificationAuthorities = process.env.NOVA_CERTIFICATION_AUTHORITIES_JSON
  ? JSON.parse(process.env.NOVA_CERTIFICATION_AUTHORITIES_JSON) as CertificationAuthority[]
  : [];
const certificationPolicy = {
  allowedAuthorityTypes: (process.env.NOVA_CERTIFICATION_ALLOWED_AUTHORITY_TYPES ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  requiredRole: process.env.NOVA_CERTIFICATION_REQUIRED_ROLE ?? "CERTIFY",
};

assertNovaBootstrap({
  repositoryRoot,
  dataFile,
  runtimeDirectory: join(repositoryRoot, "tools", "nova-core-runtime"),
});

const core = await NovaCoreService.open(dataFile, executionEngine, {
  ...(process.env.NOVA_JOURNAL_ATTESTATION_KEY
    ? { journalAttestationKey: process.env.NOVA_JOURNAL_ATTESTATION_KEY }
    : {}),
});
const server = createNovaCoreHttpServer(core, { certificationAuthorities, certificationPolicy });

server.listen(port, host, () => {
  console.log(`NOVA Core est prêt sur http://${host}:${port}`);
  console.log(`Mémoire locale : ${dataFile}`);
  console.log(`Moteur d’exécution autonome : ${repositoryRoot}`);
});
