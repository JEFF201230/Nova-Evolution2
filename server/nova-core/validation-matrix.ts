export interface DynamicValidation {
  name: string;
  command: string;
  required: true;
}

type ValidationTarget = "NOVA_CORE" | "VEEDDA";

const NOVA_CORE_RULES: ReadonlyArray<{ matches: (path: string) => boolean; validations: readonly DynamicValidation[] }> = [
  {
    matches: (path) => path.startsWith("apps/nova-web/"),
    validations: [
      { name: "nova-web-tests", command: "novaWebTests", required: true },
      { name: "nova-web-typecheck", command: "novaWebTypecheck", required: true },
      { name: "nova-web-build", command: "novaWebBuild", required: true },
    ],
  },
  {
    matches: (path) => path.startsWith("server/") || path === "package.json" || path === "package-lock.json" || path === "tsconfig.nova-core.json",
    validations: [
      { name: "nova-core-tests", command: "novaCoreTests", required: true },
      { name: "nova-core-typecheck", command: "novaCoreTypecheck", required: true },
    ],
  },
  {
    matches: (path) => path.startsWith("tools/nova-core-runtime/"),
    validations: [
      { name: "nova-runtime-syntax", command: "powershellSyntax", required: true },
      { name: "nova-runtime-e2e", command: "runtimeE2ETests", required: true },
    ],
  },
];

const VEEDDA_RULES: ReadonlyArray<{ matches: (path: string) => boolean; validations: readonly DynamicValidation[] }> = [
  {
    matches: (path) => path.startsWith("client/"),
    validations: [
      { name: "veedda-root-tests", command: "veeddaRootTests", required: true },
      { name: "veedda-client-check", command: "veeddaClientCheck", required: true },
      { name: "veedda-client-build", command: "veeddaClientBuild", required: true },
    ],
  },
  {
    matches: (path) => path.startsWith("server/"),
    validations: [
      { name: "veedda-root-tests", command: "veeddaRootTests", required: true },
      { name: "veedda-server-build", command: "veeddaServerBuild", required: true },
    ],
  },
  {
    matches: (path) => path === "package.json" || path === "package-lock.json",
    validations: [
      { name: "veedda-root-tests", command: "veeddaRootTests", required: true },
      { name: "veedda-client-check", command: "veeddaClientCheck", required: true },
      { name: "veedda-client-build", command: "veeddaClientBuild", required: true },
      { name: "veedda-server-build", command: "veeddaServerBuild", required: true },
    ],
  },
];

export function validationsForChangedFiles(
  files: readonly string[],
  target: ValidationTarget = "NOVA_CORE",
): DynamicValidation[] {
  const selected = new Map<string, DynamicValidation>();
  const rules = target === "VEEDDA" ? VEEDDA_RULES : NOVA_CORE_RULES;
  for (const rawPath of files) {
    const path = rawPath.replaceAll("\\", "/").replace(/^\.\//, "");
    for (const rule of rules) {
      if (!rule.matches(path)) continue;
      for (const validation of rule.validations) selected.set(validation.name, validation);
    }
  }
  return [...selected.values()];
}

export function missingDynamicValidations(
  files: readonly string[],
  results: readonly { Name?: string; Passed?: boolean; Required?: boolean }[],
  target: ValidationTarget = "NOVA_CORE",
): DynamicValidation[] {
  const passed = new Set(
    results
      .filter((result) => result.Passed === true && result.Required !== false && result.Name)
      .map((result) => result.Name as string),
  );
  return validationsForChangedFiles(files, target).filter((validation) => !passed.has(validation.name));
}
