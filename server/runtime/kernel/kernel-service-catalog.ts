export const KERNEL_SERVICE_COUNT = 11;

export const KERNEL_BOOTSTRAP_IS_SERVICE = false;

export const KERNEL_SERVICE_IDS = [
  "runtime",
  "scheduler",
  "configuration",
  "dependency-injection",
  "messaging",
  "persistence",
  "storage",
  "logging",
  "resource-management",
  "clock",
  "lifecycle",
] as const;

export type KernelServiceId = (typeof KERNEL_SERVICE_IDS)[number];

export type KernelServiceName =
  | "Runtime"
  | "Scheduler"
  | "Configuration"
  | "Dependency Injection"
  | "Messaging"
  | "Persistence"
  | "Storage"
  | "Logging"
  | "Resource Management"
  | "Clock"
  | "Lifecycle";

export interface KernelServiceCatalogEntry {
  readonly id: KernelServiceId;
  readonly name: KernelServiceName;
  readonly kernelResponsibility: string;
  readonly operatingSystemUse: string;
  readonly nonOwnershipBoundary: string;
}

export type KernelServiceCatalogErrorCode =
  | "KERNEL_SERVICE_UNKNOWN"
  | "KERNEL_SERVICE_CATALOG_OPEN"
  | "KERNEL_SERVICE_CATALOG_DUPLICATE";

export interface KernelServiceCatalogError extends Error {
  readonly code: KernelServiceCatalogErrorCode;
}

export const KERNEL_SERVICE_CATALOG: readonly KernelServiceCatalogEntry[] = Object.freeze([
  Object.freeze({
    id: "runtime",
    name: "Runtime",
    kernelResponsibility: "Generic execution substrate for Kernel-supported operation.",
    operatingSystemUse: "OS may rely on generic execution support.",
    nonOwnershipBoundary:
      "Does not own Mission Runtime, Agent Runtime, Workspace Runtime, product runtime, or runtime implementation technology.",
  }),
  Object.freeze({
    id: "scheduler",
    name: "Scheduler",
    kernelResponsibility: "Generic scheduling primitive support.",
    operatingSystemUse: "OS may rely on scheduling support for governed execution needs.",
    nonOwnershipBoundary: "Does not own workflow meaning, mission priorities, product scheduling, or UI scheduling.",
  }),
  Object.freeze({
    id: "configuration",
    name: "Configuration",
    kernelResponsibility: "Generic configuration primitive support.",
    operatingSystemUse: "OS may rely on configuration values needed for controlled execution.",
    nonOwnershipBoundary: "Does not own product configuration, Platform administration, secrets policy, or business rules.",
  }),
  Object.freeze({
    id: "dependency-injection",
    name: "Dependency Injection",
    kernelResponsibility: "Generic dependency composition support.",
    operatingSystemUse: "OS may rely on composition support without exposing implementation.",
    nonOwnershipBoundary: "Does not define classes, constructors, containers, APIs, modules, or technology.",
  }),
  Object.freeze({
    id: "messaging",
    name: "Messaging",
    kernelResponsibility: "Generic message exchange primitive support.",
    operatingSystemUse: "OS may rely on communication support between governed concepts.",
    nonOwnershipBoundary: "Does not own Event Engine semantics, workflow events, product events, transport technology, or API contracts.",
  }),
  Object.freeze({
    id: "persistence",
    name: "Persistence",
    kernelResponsibility: "Generic durable state primitive support.",
    operatingSystemUse: "OS may rely on durability support for evidence and state needs.",
    nonOwnershipBoundary: "Does not define database schema, product data, memory source of truth, or storage implementation.",
  }),
  Object.freeze({
    id: "storage",
    name: "Storage",
    kernelResponsibility: "Generic storage primitive support.",
    operatingSystemUse: "OS may rely on storage support for documents, evidence, and state artefacts when later authorized.",
    nonOwnershipBoundary: "Does not define file layout, database design, product storage, or workspace UI.",
  }),
  Object.freeze({
    id: "logging",
    name: "Logging",
    kernelResponsibility: "Generic execution record support.",
    operatingSystemUse: "OS may rely on logging support for traceability evidence.",
    nonOwnershipBoundary: "Does not own observability, analytics, report semantics, certification decisions, or Platform monitoring.",
  }),
  Object.freeze({
    id: "resource-management",
    name: "Resource Management",
    kernelResponsibility: "Generic resource constraint support.",
    operatingSystemUse: "OS may rely on bounded resource use during execution.",
    nonOwnershipBoundary: "Does not own product capacity planning, Platform administration, or infrastructure technology.",
  }),
  Object.freeze({
    id: "clock",
    name: "Clock",
    kernelResponsibility: "Generic time reference support.",
    operatingSystemUse: "OS may rely on time support for transitions, evidence, and ordering.",
    nonOwnershipBoundary: "Does not own product calendar semantics, timezone policy, or scheduling business rules.",
  }),
  Object.freeze({
    id: "lifecycle",
    name: "Lifecycle",
    kernelResponsibility: "Generic lifecycle primitive support.",
    operatingSystemUse: "OS may rely on lifecycle support for state handling.",
    nonOwnershipBoundary: "Does not own mission lifecycle semantics, workflow state model, certification state, or Workstream closure.",
  }),
]);

const KERNEL_SERVICE_ID_SET = new Set<string>(KERNEL_SERVICE_IDS);

const KERNEL_SERVICE_BY_ID: Readonly<Record<KernelServiceId, KernelServiceCatalogEntry>> = Object.freeze(
  KERNEL_SERVICE_CATALOG.reduce(
    (index, service) => ({
      ...index,
      [service.id]: service,
    }),
    {} as Record<KernelServiceId, KernelServiceCatalogEntry>,
  ),
);

export function normalizeKernelServiceId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function isKernelServiceId(value: string): value is KernelServiceId {
  return KERNEL_SERVICE_ID_SET.has(normalizeKernelServiceId(value));
}

export function getKernelServiceCatalog(): readonly KernelServiceCatalogEntry[] {
  assertClosedKernelServiceCatalog();
  return KERNEL_SERVICE_CATALOG;
}

export function getKernelServiceIds(): readonly KernelServiceId[] {
  return KERNEL_SERVICE_IDS;
}

export function requireKernelService(value: string): KernelServiceCatalogEntry {
  const id = normalizeKernelServiceId(value);
  if (!isKernelServiceId(id)) {
    throw kernelServiceCatalogError("KERNEL_SERVICE_UNKNOWN", `Unknown Kernel primitive requested: ${value}`);
  }

  return KERNEL_SERVICE_BY_ID[id];
}

export function assertClosedKernelServiceCatalog(
  catalog: readonly KernelServiceCatalogEntry[] = KERNEL_SERVICE_CATALOG,
): void {
  const seen = new Set<string>();

  for (const service of catalog) {
    if (seen.has(service.id)) {
      throw kernelServiceCatalogError("KERNEL_SERVICE_CATALOG_DUPLICATE", `Duplicate Kernel service: ${service.id}`);
    }
    seen.add(service.id);

    if (!isKernelServiceId(service.id) || normalizeKernelServiceId(service.name) === "bootstrap") {
      throw kernelServiceCatalogError("KERNEL_SERVICE_CATALOG_OPEN", `Unauthorized Kernel service: ${service.name}`);
    }
  }

  if (catalog.length !== KERNEL_SERVICE_COUNT || seen.size !== KERNEL_SERVICE_COUNT) {
    throw kernelServiceCatalogError(
      "KERNEL_SERVICE_CATALOG_OPEN",
      `Kernel service catalog must contain exactly ${KERNEL_SERVICE_COUNT} services.`,
    );
  }
}

function kernelServiceCatalogError(
  code: KernelServiceCatalogErrorCode,
  message: string,
): KernelServiceCatalogError {
  const error = new Error(message) as KernelServiceCatalogError;
  Object.defineProperty(error, "name", { value: "KernelServiceCatalogError" });
  Object.defineProperty(error, "code", { value: code, enumerable: true });
  return error;
}
