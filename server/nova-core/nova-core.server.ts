import { join, resolve } from "node:path";
import { NovaCoreExecutionEngine } from "./nova-core.execution.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import { NovaCoreService } from "./nova-core.service.js";
import { assertNovaBootstrap } from "./nova-core.bootstrap.js";
import type { CertificationAuthority } from "./mission-certification.js";

const port = Number(process.env.PORT ?? 4100);
const host = process.env.HOST ?? "127.0.0.1";
const runtimeRoot = resolve(process.env.NOVA_RUNTIME_ROOT ?? ".");
const configuredProjectId = process.env.NOVA_TARGET_PROJECT_ID?.trim();
const configuredRepository = process.env.NOVA_TARGET_REPOSITORY?.trim();
if (Boolean(configuredProjectId) !== Boolean(configuredRepository)) {
  throw new Error(
    "NOVA_PROJECT_TARGET_CONFIG_INCOMPLETE: NOVA_TARGET_PROJECT_ID et NOVA_TARGET_REPOSITORY sont indissociables.",
  );
}
const repositoryRoot = resolve(configuredRepository ?? process.env.NOVA_EXECUTION_ROOT ?? runtimeRoot);
const dataFile = resolve(process.env.NOVA_DATA_FILE ?? join(runtimeRoot, ".nova-data", "runtime.json"));
const executionDataRoot = resolve(
  process.env.NOVA_EXECUTION_DATA_ROOT ?? join(runtimeRoot, ".nova-data", "execution"),
);
const runtimeDirectory = resolve(
  process.env.NOVA_RUNTIME_DIRECTORY ?? join(runtimeRoot, "tools", "nova-core-runtime"),
);
const targetValidationProfile = process.env.NOVA_TARGET_VALIDATION_PROFILE?.trim()
  ?? (configuredProjectId === "VEEDDA" ? "VEEDDA" : "NOVA_CORE");
if (!["NOVA_CORE", "VEEDDA"].includes(targetValidationProfile)) {
  throw new Error(`NOVA_TARGET_VALIDATION_PROFILE_INVALID: ${targetValidationProfile}`);
}
const executionEngine = new NovaCoreExecutionEngine({
  repositoryRoot,
  dataRoot: executionDataRoot,
  runtimeDirectory,
  validationTarget: targetValidationProfile as "NOVA_CORE" | "VEEDDA",
  contextAssemblyEnabled: targetValidationProfile !== "VEEDDA",
  protectRepositoryFromRuntimeArtifacts: Boolean(configuredProjectId),
  protectedPaths: targetValidationProfile === "VEEDDA"
    ? ["tools/cerebrau/**"]
    : [],
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
  runtimeDirectory,
});

const executionConfiguration = configuredProjectId
  ? [{ projectId: configuredProjectId, repositoryRoot, engine: executionEngine }]
  : executionEngine;
const core = await NovaCoreService.open(dataFile, executionConfiguration, {
  ...(process.env.NOVA_JOURNAL_ATTESTATION_KEY
    ? { journalAttestationKey: process.env.NOVA_JOURNAL_ATTESTATION_KEY }
    : {}),
});
const server = createNovaCoreHttpServer(core, { certificationAuthorities, certificationPolicy });

server.listen(port, host, () => {
  console.log(`NOVA Core est prêt sur http://${host}:${port}`);
  console.log(`Mémoire locale : ${dataFile}`);
  console.log(`Runtime NOVA autonome : ${runtimeDirectory}`);
  console.log(`Projet cible : ${configuredProjectId ?? "<mode compatible>"} -> ${repositoryRoot}`);
});
