export type CerebrauKnowledgeStatus =
  | "AVAILABLE"
  | "PARTIAL"
  | "ABSENT"
  | "ERROR";

export interface CerebrauKnowledgeSourceReference {
  readonly id: string;
  readonly domain: string;
  readonly authority: string;
  readonly type: string;
  readonly dependencies: readonly string[];
  readonly sourceRoot: string;
  readonly path: string;
}

export interface CerebrauKnowledgeAuthorityReference {
  readonly id: string;
  readonly priority: number | null;
  readonly owner: string | null;
  readonly scope: string | null;
}

export type CerebrauProgramReferenceKind =
  | "PROGRAM"
  | "PDS"
  | "MODULE"
  | "SERVICE";

export interface CerebrauProgramReference {
  readonly kind: CerebrauProgramReferenceKind;
  readonly id: string;
  readonly name: string | null;
}

export interface CerebrauKnowledgeIssue {
  readonly code: string;
  readonly subject: string;
  readonly message: string;
}

export interface CerebrauKnowledgeResult {
  readonly status: CerebrauKnowledgeStatus;
  readonly sources: readonly CerebrauKnowledgeSourceReference[];
  readonly authorities: readonly CerebrauKnowledgeAuthorityReference[];
  readonly programReferences: readonly CerebrauProgramReference[];
  readonly warnings: readonly CerebrauKnowledgeIssue[];
  readonly errors: readonly CerebrauKnowledgeIssue[];
}

export interface CerebrauKnowledgeIndexInput {
  readonly DOCUMENTS?: unknown;
  readonly AUTHORITIES?: unknown;
  readonly PROGRAMS?: unknown;
  readonly PDS?: unknown;
  readonly MODULES?: unknown;
  readonly SERVICES?: unknown;
}

const CEREBRAU_DOCUMENT_DOMAINS: ReadonlySet<string> = new Set([
  "KNOWLEDGE",
  "AUTHORITY",
  "PROGRAM_GOVERNANCE",
  "MISSION_CONTEXT",
  "MISSION_PREPARATION",
]);

const REQUIRED_METADATA_SECTIONS = Object.freeze([
  "AUTHORITIES",
  "PROGRAMS",
  "PDS",
  "MODULES",
  "SERVICES",
] as const);

type RequiredMetadataSection = (typeof REQUIRED_METADATA_SECTIONS)[number];

interface DocumentMetadataRecord {
  readonly id: string;
  readonly domain: string;
  readonly authority: string;
  readonly type: string;
  readonly dependencies: readonly string[];
  readonly sourceRoot: string;
  readonly path: string;
}

interface ProgramReferenceSection {
  readonly section: "PROGRAMS" | "PDS" | "MODULES" | "SERVICES";
  readonly kind: CerebrauProgramReferenceKind;
}

const PROGRAM_REFERENCE_SECTIONS: readonly ProgramReferenceSection[] = Object.freeze([
  Object.freeze({
    section: "PROGRAMS",
    kind: "PROGRAM",
  }),
  Object.freeze({
    section: "PDS",
    kind: "PDS",
  }),
  Object.freeze({
    section: "MODULES",
    kind: "MODULE",
  }),
  Object.freeze({
    section: "SERVICES",
    kind: "SERVICE",
  }),
]);

export class CerebrauKnowledgeAdapter {
  adapt(input: CerebrauKnowledgeIndexInput | null | undefined): CerebrauKnowledgeResult {
    if (input === null || input === undefined) {
      return createResult({
        status: "ABSENT",
        warnings: [
          createIssue(
            "CKA-W001",
            "DOCUMENTS",
            "CEREBRAU knowledge metadata is absent.",
          ),
        ],
      });
    }

    if (!isRecord(input)) {
      return createErrorResult([
        createIssue(
          "CKA-001",
          "input",
          "CerebrauKnowledgeAdapter requires a structured metadata record.",
        ),
      ]);
    }

    if (!("DOCUMENTS" in input)) {
      return createResult({
        status: "ABSENT",
        warnings: [
          createIssue(
            "CKA-W001",
            "DOCUMENTS",
            "The DOCUMENTS metadata section is absent.",
          ),
        ],
      });
    }

    if (!Array.isArray(input.DOCUMENTS)) {
      return createErrorResult([
        createIssue(
          "CKA-002",
          "DOCUMENTS",
          "The DOCUMENTS metadata section must be an array.",
        ),
      ]);
    }

    const documentResult = parseDocuments(input.DOCUMENTS);

    if (documentResult.errors.length > 0) {
      return createErrorResult(documentResult.errors);
    }

    const duplicateDocumentIds = findDuplicates(
      documentResult.documents.map((document) => document.id),
    );

    if (duplicateDocumentIds.length > 0) {
      return createErrorResult(
        duplicateDocumentIds.map((id) =>
          createIssue(
            "CKA-004",
            id,
            "Duplicate document metadata identifiers are rejected.",
          ),
        ),
      );
    }

    const warnings: CerebrauKnowledgeIssue[] = [];
    const errors: CerebrauKnowledgeIssue[] = [];
    const allDocumentIds = new Set(
      documentResult.documents.map((document) => document.id),
    );
    const sources = documentResult.documents
      .filter((document) => CEREBRAU_DOCUMENT_DOMAINS.has(document.domain))
      .sort(compareById)
      .map((document) => {
        for (const dependency of document.dependencies) {
          if (!allDocumentIds.has(dependency)) {
            warnings.push(
              createIssue(
                "CKA-W002",
                document.id,
                `Missing indexed dependency: ${dependency}.`,
              ),
            );
          }
        }

        return createSourceReference(document);
      });

    const authorities = parseAuthorities(input.AUTHORITIES, warnings, errors);
    const programReferences = parseProgramReferences(input, warnings, errors);

    if (errors.length > 0) {
      return createErrorResult(errors);
    }

    if (sources.length === 0) {
      warnings.push(
        createIssue(
          "CKA-W003",
          "DOCUMENTS",
          "No CEREBRAU knowledge metadata matches the authorized domains.",
        ),
      );
    }

    const orderedWarnings = Object.freeze([...warnings].sort(compareIssues));
    const status: CerebrauKnowledgeStatus =
      sources.length === 0
        ? "ABSENT"
        : orderedWarnings.length > 0
          ? "PARTIAL"
          : "AVAILABLE";

    return createResult({
      status,
      sources,
      authorities,
      programReferences,
      warnings: orderedWarnings,
    });
  }
}

function parseDocuments(values: readonly unknown[]): Readonly<{
  readonly documents: readonly DocumentMetadataRecord[];
  readonly errors: readonly CerebrauKnowledgeIssue[];
}> {
  const documents: DocumentMetadataRecord[] = [];
  const errors: CerebrauKnowledgeIssue[] = [];

  values.forEach((value, index) => {
    const subject = `DOCUMENTS[${index}]`;

    if (!isRecord(value)) {
      errors.push(
        createIssue(
          "CKA-003",
          subject,
          "Document metadata must be a structured record.",
        ),
      );
      return;
    }

    if (
      !isMetadataToken(value.id) ||
      !isMetadataToken(value.domain) ||
      !isMetadataToken(value.authority) ||
      !isMetadataToken(value.type) ||
      !isMetadataToken(value.sourceRoot) ||
      !isNormalizedText(value.path) ||
      !Array.isArray(value.dependencies) ||
      !value.dependencies.every(isMetadataToken)
    ) {
      errors.push(
        createIssue(
          "CKA-003",
          subject,
          "Document metadata is incomplete or non-normalized.",
        ),
      );
      return;
    }

    const duplicateDependencies = findDuplicates(value.dependencies);

    if (duplicateDependencies.length > 0) {
      errors.push(
        createIssue(
          "CKA-003",
          value.id,
          "Duplicate document dependencies are rejected.",
        ),
      );
      return;
    }

    documents.push(
      Object.freeze({
        id: value.id,
        domain: value.domain,
        authority: value.authority,
        type: value.type,
        dependencies: Object.freeze([...value.dependencies].sort()),
        sourceRoot: value.sourceRoot,
        path: value.path,
      }),
    );
  });

  return Object.freeze({
    documents: Object.freeze(documents),
    errors: Object.freeze(errors),
  });
}

function parseAuthorities(
  value: unknown,
  warnings: CerebrauKnowledgeIssue[],
  errors: CerebrauKnowledgeIssue[],
): readonly CerebrauKnowledgeAuthorityReference[] {
  if (value === undefined) {
    warnings.push(createMissingSectionWarning("AUTHORITIES"));
    return Object.freeze([]);
  }

  if (!Array.isArray(value)) {
    errors.push(createInvalidSectionError("AUTHORITIES"));
    return Object.freeze([]);
  }

  const authorities: CerebrauKnowledgeAuthorityReference[] = [];

  value.forEach((entry, index) => {
    if (!isRecord(entry) || !isMetadataToken(entry.id)) {
      errors.push(
        createIssue(
          "CKA-005",
          `AUTHORITIES[${index}]`,
          "Authority metadata requires a normalized identifier.",
        ),
      );
      return;
    }

    const priority =
      typeof entry.priority === "number" && Number.isFinite(entry.priority)
        ? entry.priority
        : null;
    const owner = isNormalizedText(entry.owner) ? entry.owner : null;
    const scope = isNormalizedText(entry.scope) ? entry.scope : null;

    authorities.push(
      Object.freeze({
        id: entry.id,
        priority,
        owner,
        scope,
      }),
    );
  });

  const duplicates = findDuplicates(authorities.map((authority) => authority.id));

  for (const id of duplicates) {
    errors.push(
      createIssue(
        "CKA-006",
        id,
        "Duplicate authority metadata identifiers are rejected.",
      ),
    );
  }

  return Object.freeze(
    authorities.sort(
      (left, right) =>
        compareNullableNumbers(left.priority, right.priority) ||
        left.id.localeCompare(right.id),
    ),
  );
}

function parseProgramReferences(
  input: Record<string, unknown>,
  warnings: CerebrauKnowledgeIssue[],
  errors: CerebrauKnowledgeIssue[],
): readonly CerebrauProgramReference[] {
  const references: CerebrauProgramReference[] = [];

  for (const descriptor of PROGRAM_REFERENCE_SECTIONS) {
    const value = input[descriptor.section];

    if (value === undefined) {
      warnings.push(createMissingSectionWarning(descriptor.section));
      continue;
    }

    if (!Array.isArray(value)) {
      errors.push(createInvalidSectionError(descriptor.section));
      continue;
    }

    value.forEach((entry, index) => {
      if (!isRecord(entry) || !isMetadataToken(entry.id)) {
        errors.push(
          createIssue(
            "CKA-007",
            `${descriptor.section}[${index}]`,
            "Program metadata references require a normalized identifier.",
          ),
        );
        return;
      }

      references.push(
        Object.freeze({
          kind: descriptor.kind,
          id: entry.id,
          name: isNormalizedText(entry.name) ? entry.name : null,
        }),
      );
    });
  }

  const compositeIds = references.map(
    (reference) => `${reference.kind}:${reference.id}`,
  );

  for (const compositeId of findDuplicates(compositeIds)) {
    errors.push(
      createIssue(
        "CKA-008",
        compositeId,
        "Duplicate program metadata references are rejected.",
      ),
    );
  }

  return Object.freeze(
    references.sort(
      (left, right) =>
        left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id),
    ),
  );
}

function createSourceReference(
  document: DocumentMetadataRecord,
): CerebrauKnowledgeSourceReference {
  return Object.freeze({
    id: document.id,
    domain: document.domain,
    authority: document.authority,
    type: document.type,
    dependencies: document.dependencies,
    sourceRoot: document.sourceRoot,
    path: document.path,
  });
}

function createResult(fields: {
  readonly status: CerebrauKnowledgeStatus;
  readonly sources?: readonly CerebrauKnowledgeSourceReference[];
  readonly authorities?: readonly CerebrauKnowledgeAuthorityReference[];
  readonly programReferences?: readonly CerebrauProgramReference[];
  readonly warnings?: readonly CerebrauKnowledgeIssue[];
  readonly errors?: readonly CerebrauKnowledgeIssue[];
}): CerebrauKnowledgeResult {
  return Object.freeze({
    status: fields.status,
    sources: Object.freeze([...(fields.sources ?? [])]),
    authorities: Object.freeze([...(fields.authorities ?? [])]),
    programReferences: Object.freeze([...(fields.programReferences ?? [])]),
    warnings: Object.freeze([...(fields.warnings ?? [])]),
    errors: Object.freeze([...(fields.errors ?? [])]),
  });
}

function createErrorResult(
  errors: readonly CerebrauKnowledgeIssue[],
): CerebrauKnowledgeResult {
  return createResult({
    status: "ERROR",
    errors: Object.freeze([...errors].sort(compareIssues)),
  });
}

function createIssue(
  code: string,
  subject: string,
  message: string,
): CerebrauKnowledgeIssue {
  return Object.freeze({
    code,
    subject,
    message,
  });
}

function createMissingSectionWarning(
  section: RequiredMetadataSection,
): CerebrauKnowledgeIssue {
  return createIssue(
    "CKA-W004",
    section,
    `The ${section} metadata section is absent.`,
  );
}

function createInvalidSectionError(
  section: RequiredMetadataSection,
): CerebrauKnowledgeIssue {
  return createIssue(
    "CKA-002",
    section,
    `The ${section} metadata section must be an array.`,
  );
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

function compareById(
  left: DocumentMetadataRecord,
  right: DocumentMetadataRecord,
): number {
  return left.id.localeCompare(right.id);
}

function compareIssues(
  left: CerebrauKnowledgeIssue,
  right: CerebrauKnowledgeIssue,
): number {
  return (
    left.code.localeCompare(right.code) ||
    left.subject.localeCompare(right.subject) ||
    left.message.localeCompare(right.message)
  );
}

function compareNullableNumbers(
  left: number | null,
  right: number | null,
): number {
  if (left === right) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left - right;
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
