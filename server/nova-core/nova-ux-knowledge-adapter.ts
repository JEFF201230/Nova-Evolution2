export type NovaUxKnowledgeStatus =
  | "AVAILABLE"
  | "PARTIAL"
  | "ABSENT"
  | "ERROR";

export interface NovaUxDomainReference {
  readonly id: string;
  readonly root: string;
  readonly routes: readonly string[];
}

export interface NovaUxRouteReference {
  readonly id: string;
  readonly path: string;
  readonly domain: string;
}

export interface NovaUxDependencyReference {
  readonly documentId: string;
  readonly dependsOn: string;
}

export interface NovaUxSourceMetadataReference {
  readonly id: string;
  readonly domain: string;
  readonly authority: string;
  readonly type: NovaUxSourceMetadataType;
  readonly sourceRoot: string;
  readonly path: string;
}

export type NovaUxSourceMetadataType =
  | "INVENTORY"
  | "MATRIX"
  | "GRAPH"
  | "ARCHITECTURE";

export interface NovaUxKnowledgeIssue {
  readonly code: string;
  readonly subject: string;
  readonly message: string;
}

export interface NovaUxKnowledgeResult {
  readonly active: boolean;
  readonly status: NovaUxKnowledgeStatus;
  readonly domains: readonly NovaUxDomainReference[];
  readonly routes: readonly NovaUxRouteReference[];
  readonly components: readonly string[];
  readonly dependencies: readonly NovaUxDependencyReference[];
  readonly conflicts: readonly string[];
  readonly sourceMetadata: readonly NovaUxSourceMetadataReference[];
  readonly warnings: readonly NovaUxKnowledgeIssue[];
  readonly errors: readonly NovaUxKnowledgeIssue[];
}

export interface NovaUxKnowledgeIndexInput {
  readonly DOMAINS?: unknown;
  readonly ROUTES?: unknown;
  readonly COMPONENTS?: unknown;
  readonly DOCUMENTS?: unknown;
  readonly UX?: unknown;
}

export interface NovaUxKnowledgeAdapterFeatureFlag {
  readonly enabled: boolean;
}

interface NovaUxDocumentMetadataRecord {
  readonly id: string;
  readonly domain: string;
  readonly authority: string;
  readonly type: string;
  readonly dependencies: readonly string[];
  readonly sourceRoot: string;
  readonly path: string;
}

interface ParseResult<T> {
  readonly values: readonly T[];
  readonly errors: readonly NovaUxKnowledgeIssue[];
}

const UX_METADATA_TYPES: ReadonlySet<string> = new Set([
  "INVENTORY",
  "MATRIX",
  "GRAPH",
  "ARCHITECTURE",
]);

const DISABLED_RESULT: NovaUxKnowledgeResult = createResult({
  active: false,
  status: "ABSENT",
});

export class NovaUxKnowledgeAdapter {
  readonly enabled: boolean;

  constructor(featureFlag: NovaUxKnowledgeAdapterFeatureFlag = { enabled: false }) {
    this.enabled = featureFlag.enabled === true;
  }

  adapt(input: NovaUxKnowledgeIndexInput | null | undefined): NovaUxKnowledgeResult {
    if (!this.enabled) {
      return DISABLED_RESULT;
    }

    if (input === null || input === undefined) {
      return createResult({
        active: true,
        status: "ABSENT",
        warnings: [
          createIssue(
            "NUX-W001",
            "input",
            "NOVA UX knowledge metadata is absent.",
          ),
        ],
      });
    }

    if (!isRecord(input)) {
      return createErrorResult([
        createIssue(
          "NUX-001",
          "input",
          "NovaUxKnowledgeAdapter requires a structured metadata record.",
        ),
      ]);
    }

    const warnings: NovaUxKnowledgeIssue[] = [];
    const errors: NovaUxKnowledgeIssue[] = [];
    const domainResult = parseDomains(input.DOMAINS, warnings);
    const routeResult = parseRoutes(input.ROUTES, warnings);
    const componentResult = parseComponents(input.COMPONENTS, warnings);
    const documentResult = parseDocuments(input.DOCUMENTS, warnings);
    const conflictResult = parseConflicts(input.UX, warnings);

    errors.push(
      ...domainResult.errors,
      ...routeResult.errors,
      ...componentResult.errors,
      ...documentResult.errors,
      ...conflictResult.errors,
    );

    if (errors.length > 0) {
      return createErrorResult(errors);
    }

    const duplicateDomainIds = findDuplicates(
      domainResult.values.map((domain) => domain.id),
    );
    const duplicateRouteIds = findDuplicates(
      routeResult.values.map((route) => route.id),
    );
    const duplicateDocumentIds = findDuplicates(
      documentResult.values.map((document) => document.id),
    );

    for (const id of duplicateDomainIds) {
      errors.push(
        createIssue(
          "NUX-007",
          id,
          "Duplicate UX domain identifiers are rejected.",
        ),
      );
    }

    for (const id of duplicateRouteIds) {
      errors.push(
        createIssue(
          "NUX-008",
          id,
          "Duplicate UX route identifiers are rejected.",
        ),
      );
    }

    for (const id of duplicateDocumentIds) {
      errors.push(
        createIssue(
          "NUX-009",
          id,
          "Duplicate UX document identifiers are rejected.",
        ),
      );
    }

    if (errors.length > 0) {
      return createErrorResult(errors);
    }

    const domains = Object.freeze([...domainResult.values].sort(compareById));
    const routes = Object.freeze([...routeResult.values].sort(compareById));
    const components = Object.freeze(
      [...new Set(componentResult.values)].sort(),
    );
    const conflicts = Object.freeze(
      [...new Set(conflictResult.values)].sort(),
    );
    const domainIds = new Set(domains.map((domain) => domain.id));
    const routeIds = new Set(routes.map((route) => route.id));
    const allDocumentIds = new Set(
      documentResult.values.map((document) => document.id),
    );

    for (const route of routes) {
      if (!domainIds.has(route.domain)) {
        warnings.push(
          createIssue(
            "NUX-W006",
            route.id,
            `Route metadata references an unknown domain: ${route.domain}.`,
          ),
        );
      }
    }

    for (const domain of domains) {
      for (const routeId of domain.routes) {
        if (!routeIds.has(routeId)) {
          warnings.push(
            createIssue(
              "NUX-W007",
              domain.id,
              `Domain metadata references an unknown route: ${routeId}.`,
            ),
          );
        }
      }
    }

    const selectedDocuments = documentResult.values
      .filter(
        (document) =>
          document.domain.startsWith("UX_") &&
          UX_METADATA_TYPES.has(document.type),
      )
      .sort(compareById);
    const sourceMetadata = Object.freeze(
      selectedDocuments.map(createSourceMetadataReference),
    );
    const dependencies: NovaUxDependencyReference[] = [];

    for (const document of selectedDocuments) {
      for (const dependency of document.dependencies) {
        dependencies.push(
          Object.freeze({
            documentId: document.id,
            dependsOn: dependency,
          }),
        );

        if (!allDocumentIds.has(dependency)) {
          warnings.push(
            createIssue(
              "NUX-W008",
              document.id,
              `Missing indexed dependency: ${dependency}.`,
            ),
          );
        }
      }
    }

    dependencies.sort(
      (left, right) =>
        left.documentId.localeCompare(right.documentId) ||
        left.dependsOn.localeCompare(right.dependsOn),
    );

    const hasKnowledge =
      domains.length > 0 ||
      routes.length > 0 ||
      components.length > 0 ||
      sourceMetadata.length > 0;

    if (!hasKnowledge) {
      warnings.push(
        createIssue(
          "NUX-W009",
          "input",
          "No NOVA UX knowledge metadata is available.",
        ),
      );
    }

    const orderedWarnings = Object.freeze([...warnings].sort(compareIssues));
    const status: NovaUxKnowledgeStatus =
      !hasKnowledge
        ? "ABSENT"
        : orderedWarnings.length > 0
          ? "PARTIAL"
          : "AVAILABLE";

    return createResult({
      active: true,
      status,
      domains,
      routes,
      components,
      dependencies: Object.freeze(dependencies),
      conflicts,
      sourceMetadata,
      warnings: orderedWarnings,
    });
  }
}

function parseDomains(
  value: unknown,
  warnings: NovaUxKnowledgeIssue[],
): ParseResult<NovaUxDomainReference> {
  if (value === undefined) {
    warnings.push(createMissingSectionWarning("DOMAINS"));
    return emptyParseResult();
  }

  if (!Array.isArray(value)) {
    return errorParseResult(
      createIssue(
        "NUX-002",
        "DOMAINS",
        "The DOMAINS metadata section must be an array.",
      ),
    );
  }

  const domains: NovaUxDomainReference[] = [];
  const errors: NovaUxKnowledgeIssue[] = [];

  value.forEach((entry, index) => {
    if (
      !isRecord(entry) ||
      !isMetadataToken(entry.id) ||
      !isNormalizedText(entry.root) ||
      !Array.isArray(entry.routes) ||
      !entry.routes.every(isMetadataToken)
    ) {
      errors.push(
        createIssue(
          "NUX-003",
          `DOMAINS[${index}]`,
          "UX domain metadata is incomplete or non-normalized.",
        ),
      );
      return;
    }

    if (findDuplicates(entry.routes).length > 0) {
      errors.push(
        createIssue(
          "NUX-003",
          entry.id,
          "Duplicate route identifiers in a domain are rejected.",
        ),
      );
      return;
    }

    domains.push(
      Object.freeze({
        id: entry.id,
        root: entry.root,
        routes: Object.freeze([...entry.routes].sort()),
      }),
    );
  });

  return Object.freeze({
    values: Object.freeze(domains),
    errors: Object.freeze(errors),
  });
}

function parseRoutes(
  value: unknown,
  warnings: NovaUxKnowledgeIssue[],
): ParseResult<NovaUxRouteReference> {
  if (value === undefined) {
    warnings.push(createMissingSectionWarning("ROUTES"));
    return emptyParseResult();
  }

  if (!Array.isArray(value)) {
    return errorParseResult(
      createIssue(
        "NUX-002",
        "ROUTES",
        "The ROUTES metadata section must be an array.",
      ),
    );
  }

  const routes: NovaUxRouteReference[] = [];
  const errors: NovaUxKnowledgeIssue[] = [];

  value.forEach((entry, index) => {
    if (
      !isRecord(entry) ||
      !isMetadataToken(entry.id) ||
      !isNormalizedPath(entry.path) ||
      !isMetadataToken(entry.domain)
    ) {
      errors.push(
        createIssue(
          "NUX-004",
          `ROUTES[${index}]`,
          "UX route metadata is incomplete or non-normalized.",
        ),
      );
      return;
    }

    routes.push(
      Object.freeze({
        id: entry.id,
        path: entry.path,
        domain: entry.domain,
      }),
    );
  });

  return Object.freeze({
    values: Object.freeze(routes),
    errors: Object.freeze(errors),
  });
}

function parseComponents(
  value: unknown,
  warnings: NovaUxKnowledgeIssue[],
): ParseResult<string> {
  if (value === undefined) {
    warnings.push(createMissingSectionWarning("COMPONENTS.UX"));
    return emptyParseResult();
  }

  if (!isRecord(value) || !Array.isArray(value.UX)) {
    return errorParseResult(
      createIssue(
        "NUX-002",
        "COMPONENTS.UX",
        "The COMPONENTS.UX metadata section must be an array.",
      ),
    );
  }

  if (!value.UX.every(isNormalizedText)) {
    return errorParseResult(
      createIssue(
        "NUX-005",
        "COMPONENTS.UX",
        "UX component metadata must contain normalized names.",
      ),
    );
  }

  return Object.freeze({
    values: Object.freeze([...value.UX]),
    errors: Object.freeze([]),
  });
}

function parseDocuments(
  value: unknown,
  warnings: NovaUxKnowledgeIssue[],
): ParseResult<NovaUxDocumentMetadataRecord> {
  if (value === undefined) {
    warnings.push(createMissingSectionWarning("DOCUMENTS"));
    return emptyParseResult();
  }

  if (!Array.isArray(value)) {
    return errorParseResult(
      createIssue(
        "NUX-002",
        "DOCUMENTS",
        "The DOCUMENTS metadata section must be an array.",
      ),
    );
  }

  const documents: NovaUxDocumentMetadataRecord[] = [];
  const errors: NovaUxKnowledgeIssue[] = [];

  value.forEach((entry, index) => {
    if (
      !isRecord(entry) ||
      !isMetadataToken(entry.id) ||
      !isMetadataToken(entry.domain) ||
      !isMetadataToken(entry.authority) ||
      !isMetadataToken(entry.type) ||
      !isMetadataToken(entry.sourceRoot) ||
      !isNormalizedText(entry.path) ||
      !Array.isArray(entry.dependencies) ||
      !entry.dependencies.every(isMetadataToken)
    ) {
      errors.push(
        createIssue(
          "NUX-006",
          `DOCUMENTS[${index}]`,
          "UX document metadata is incomplete or non-normalized.",
        ),
      );
      return;
    }

    if (findDuplicates(entry.dependencies).length > 0) {
      errors.push(
        createIssue(
          "NUX-006",
          entry.id,
          "Duplicate UX document dependencies are rejected.",
        ),
      );
      return;
    }

    documents.push(
      Object.freeze({
        id: entry.id,
        domain: entry.domain,
        authority: entry.authority,
        type: entry.type,
        dependencies: Object.freeze([...entry.dependencies].sort()),
        sourceRoot: entry.sourceRoot,
        path: entry.path,
      }),
    );
  });

  return Object.freeze({
    values: Object.freeze(documents),
    errors: Object.freeze(errors),
  });
}

function parseConflicts(
  value: unknown,
  warnings: NovaUxKnowledgeIssue[],
): ParseResult<string> {
  if (value === undefined) {
    warnings.push(createMissingSectionWarning("UX.knownConflicts"));
    return emptyParseResult();
  }

  if (!isRecord(value) || !Array.isArray(value.knownConflicts)) {
    return errorParseResult(
      createIssue(
        "NUX-002",
        "UX.knownConflicts",
        "The UX.knownConflicts metadata section must be an array.",
      ),
    );
  }

  if (!value.knownConflicts.every(isNormalizedText)) {
    return errorParseResult(
      createIssue(
        "NUX-010",
        "UX.knownConflicts",
        "UX conflicts must contain normalized metadata descriptions.",
      ),
    );
  }

  return Object.freeze({
    values: Object.freeze([...value.knownConflicts]),
    errors: Object.freeze([]),
  });
}

function createSourceMetadataReference(
  document: NovaUxDocumentMetadataRecord,
): NovaUxSourceMetadataReference {
  return Object.freeze({
    id: document.id,
    domain: document.domain,
    authority: document.authority,
    type: document.type as NovaUxSourceMetadataType,
    sourceRoot: document.sourceRoot,
    path: document.path,
  });
}

function createResult(fields: {
  readonly active: boolean;
  readonly status: NovaUxKnowledgeStatus;
  readonly domains?: readonly NovaUxDomainReference[];
  readonly routes?: readonly NovaUxRouteReference[];
  readonly components?: readonly string[];
  readonly dependencies?: readonly NovaUxDependencyReference[];
  readonly conflicts?: readonly string[];
  readonly sourceMetadata?: readonly NovaUxSourceMetadataReference[];
  readonly warnings?: readonly NovaUxKnowledgeIssue[];
  readonly errors?: readonly NovaUxKnowledgeIssue[];
}): NovaUxKnowledgeResult {
  return Object.freeze({
    active: fields.active,
    status: fields.status,
    domains: Object.freeze([...(fields.domains ?? [])]),
    routes: Object.freeze([...(fields.routes ?? [])]),
    components: Object.freeze([...(fields.components ?? [])]),
    dependencies: Object.freeze([...(fields.dependencies ?? [])]),
    conflicts: Object.freeze([...(fields.conflicts ?? [])]),
    sourceMetadata: Object.freeze([...(fields.sourceMetadata ?? [])]),
    warnings: Object.freeze([...(fields.warnings ?? [])]),
    errors: Object.freeze([...(fields.errors ?? [])]),
  });
}

function createErrorResult(
  errors: readonly NovaUxKnowledgeIssue[],
): NovaUxKnowledgeResult {
  return createResult({
    active: true,
    status: "ERROR",
    errors: Object.freeze([...errors].sort(compareIssues)),
  });
}

function createIssue(
  code: string,
  subject: string,
  message: string,
): NovaUxKnowledgeIssue {
  return Object.freeze({
    code,
    subject,
    message,
  });
}

function createMissingSectionWarning(section: string): NovaUxKnowledgeIssue {
  return createIssue(
    "NUX-W005",
    section,
    `The ${section} metadata section is absent.`,
  );
}

function emptyParseResult<T>(): ParseResult<T> {
  return Object.freeze({
    values: Object.freeze([]),
    errors: Object.freeze([]),
  });
}

function errorParseResult<T>(error: NovaUxKnowledgeIssue): ParseResult<T> {
  return Object.freeze({
    values: Object.freeze([]),
    errors: Object.freeze([error]),
  });
}

function findDuplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }

  return Object.freeze([...duplicates].sort());
}

function compareById<T extends { readonly id: string }>(
  left: T,
  right: T,
): number {
  return left.id.localeCompare(right.id);
}

function compareIssues(
  left: NovaUxKnowledgeIssue,
  right: NovaUxKnowledgeIssue,
): number {
  return (
    left.code.localeCompare(right.code) ||
    left.subject.localeCompare(right.subject) ||
    left.message.localeCompare(right.message)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMetadataToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isNormalizedText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function isNormalizedPath(value: unknown): value is string {
  return (
    isNormalizedText(value) &&
    value.startsWith("/") &&
    !value.includes("//")
  );
}
