import type {
  CerebrauKnowledgeResult,
  CerebrauKnowledgeSourceReference,
} from "./cerebrau-knowledge-adapter.js";
import type {
  NovaUxKnowledgeResult,
  NovaUxSourceMetadataReference,
} from "./nova-ux-knowledge-adapter.js";

export type AuthorityResolutionStatus =
  | "RESOLVED"
  | "PARTIAL"
  | "UNRESOLVED";

export type AuthoritySourceRole =
  | "AUTHORITATIVE"
  | "SUPPORTING"
  | "REJECTED";

export type AuthorityCompleteness = "COMPLETE" | "PARTIAL";

export interface AuthoritySourceDeclaration {
  readonly sourceId: string;
  readonly authorityDomain: string;
  readonly role: AuthoritySourceRole;
  readonly completeness: AuthorityCompleteness;
  readonly conflictsWith?: readonly string[];
  readonly rejectionReason?: string;
}

export type AuthoritySourceOrigin = "CEREBRAU" | "NOVA_UX" | "BOTH";

export interface ResolvedAuthoritySource {
  readonly id: string;
  readonly domain: string;
  readonly authority: string;
  readonly type: string;
  readonly sourceRoot: string;
  readonly path: string;
  readonly origin: AuthoritySourceOrigin;
}

export interface AuthorityRejectionReason {
  readonly sourceId: string;
  readonly reason: string;
}

export interface UnresolvedAuthorityConflict {
  readonly code: string;
  readonly sourceIds: readonly string[];
  readonly message: string;
}

export interface AuthorityResolutionDecision {
  readonly missionId: string;
  readonly authorityDomain: string;
  readonly authoritativeSources: readonly ResolvedAuthoritySource[];
  readonly supportingSources: readonly ResolvedAuthoritySource[];
  readonly rejectedSources: readonly ResolvedAuthoritySource[];
  readonly rejectionReasons: readonly AuthorityRejectionReason[];
  readonly unresolvedAuthorityConflicts: readonly UnresolvedAuthorityConflict[];
  readonly resolutionStatus: AuthorityResolutionStatus;
}

export interface AuthorityResolutionRequest {
  readonly missionId: string;
  readonly authorityDomain: string;
  readonly cerebrauKnowledge: CerebrauKnowledgeResult;
  readonly novaUxKnowledge: NovaUxKnowledgeResult;
  readonly authorityDeclarations: readonly AuthoritySourceDeclaration[];
}

export interface AuthorityResolverFeatureFlag {
  readonly enabled: boolean;
}

interface SourceCollectionResult {
  readonly sources: ReadonlyMap<string, ResolvedAuthoritySource>;
  readonly conflicts: readonly UnresolvedAuthorityConflict[];
}

const AUTHORITY_SOURCE_ROLES: ReadonlySet<string> = new Set([
  "AUTHORITATIVE",
  "SUPPORTING",
  "REJECTED",
]);

const AUTHORITY_COMPLETENESS_VALUES: ReadonlySet<string> = new Set([
  "COMPLETE",
  "PARTIAL",
]);

export class AuthorityResolver {
  readonly enabled: boolean;

  constructor(featureFlag: AuthorityResolverFeatureFlag = { enabled: false }) {
    this.enabled = featureFlag.enabled === true;
  }

  resolve(
    request: AuthorityResolutionRequest,
  ): AuthorityResolutionDecision | null {
    if (!this.enabled) {
      return null;
    }

    assertResolutionRequest(request);

    const sourceCollection = collectSources(
      request.cerebrauKnowledge.sources,
      request.novaUxKnowledge.sourceMetadata,
    );
    const sources = sourceCollection.sources;
    const conflicts: UnresolvedAuthorityConflict[] = [
      ...sourceCollection.conflicts,
    ];
    const declarations = request.authorityDeclarations
      .filter(
        (declaration) =>
          declaration.authorityDomain === request.authorityDomain,
      )
      .map(normalizeDeclaration)
      .sort(compareDeclarations);
    const declarationsBySource = groupDeclarationsBySource(declarations);
    const authoritativeSourceIds = new Set<string>();
    const supportingSourceIds = new Set<string>();
    const rejectedSourceIds = new Set<string>();
    const rejectionReasons = new Map<string, string>();
    let authorityIsPartial = false;

    for (const [sourceId, sourceDeclarations] of declarationsBySource) {
      const source = sources.get(sourceId);

      if (source === undefined) {
        conflicts.push(
          createConflict(
            "AR-C001",
            [sourceId],
            "Authority metadata references a source that is not present in either adapter result.",
          ),
        );
        continue;
      }

      const roles = new Set(
        sourceDeclarations.map((declaration) => declaration.role),
      );

      if (roles.has("REJECTED") && roles.size > 1) {
        conflicts.push(
          createConflict(
            "AR-C002",
            [sourceId],
            "A source cannot be rejected and accepted as authority or support in the same domain.",
          ),
        );
        rejectedSourceIds.add(sourceId);
        rejectionReasons.set(
          sourceId,
          rejectionReasonFor(sourceDeclarations),
        );
        continue;
      }

      if (roles.has("AUTHORITATIVE")) {
        authoritativeSourceIds.add(sourceId);

        if (
          sourceDeclarations
            .filter((declaration) => declaration.role === "AUTHORITATIVE")
            .some((declaration) => declaration.completeness === "PARTIAL")
        ) {
          authorityIsPartial = true;
        }

        continue;
      }

      if (roles.has("SUPPORTING")) {
        supportingSourceIds.add(sourceId);
        continue;
      }

      rejectedSourceIds.add(sourceId);
      rejectionReasons.set(sourceId, rejectionReasonFor(sourceDeclarations));
    }

    for (const source of sources.values()) {
      if (
        source.domain === request.authorityDomain &&
        !declarationsBySource.has(source.id)
      ) {
        rejectedSourceIds.add(source.id);
        rejectionReasons.set(
          source.id,
          "No explicit authority declaration demonstrates this source for the requested domain.",
        );
      }
    }

    conflicts.push(
      ...findDeclaredContradictions(
        declarationsBySource,
        authoritativeSourceIds,
      ),
    );

    const authoritativeSources = resolveSources(
      authoritativeSourceIds,
      sources,
    );
    const supportingSources = resolveSources(
      supportingSourceIds,
      sources,
    );
    const rejectedSources = resolveSources(rejectedSourceIds, sources);

    if (authoritativeSources.length === 0) {
      conflicts.push(
        createConflict(
          "AR-C003",
          [],
          "No authoritative source is explicitly demonstrated for the requested authority domain.",
        ),
      );
    }

    if (
      authoritativeSources.some(
        (source) =>
          source.origin === "CEREBRAU" || source.origin === "BOTH",
      ) &&
      request.cerebrauKnowledge.status === "PARTIAL"
    ) {
      authorityIsPartial = true;
    }

    if (
      authoritativeSources.some(
        (source) =>
          source.origin === "NOVA_UX" || source.origin === "BOTH",
      ) &&
      request.novaUxKnowledge.status === "PARTIAL"
    ) {
      authorityIsPartial = true;
    }

    if (
      request.cerebrauKnowledge.status === "ERROR" &&
      declarations.some((declaration) => {
        const source = sources.get(declaration.sourceId);
        return (
          declaration.role === "AUTHORITATIVE" &&
          (source?.origin === "CEREBRAU" || source?.origin === "BOTH")
        );
      })
    ) {
      conflicts.push(
        createConflict(
          "AR-C005",
          authoritativeSources
            .filter(
              (source) =>
                source.origin === "CEREBRAU" || source.origin === "BOTH",
            )
            .map((source) => source.id),
          "The CEREBRAU adapter reported an error for declared authority metadata.",
        ),
      );
    }

    if (
      request.novaUxKnowledge.active &&
      request.novaUxKnowledge.status === "ERROR" &&
      declarations.some((declaration) => {
        const source = sources.get(declaration.sourceId);
        return (
          declaration.role === "AUTHORITATIVE" &&
          (source?.origin === "NOVA_UX" || source?.origin === "BOTH")
        );
      })
    ) {
      conflicts.push(
        createConflict(
          "AR-C006",
          authoritativeSources
            .filter(
              (source) =>
                source.origin === "NOVA_UX" || source.origin === "BOTH",
            )
            .map((source) => source.id),
          "The NOVA UX adapter reported an error for declared authority metadata.",
        ),
      );
    }

    const unresolvedAuthorityConflicts = Object.freeze(
      deduplicateConflicts(conflicts).sort(compareConflicts),
    );
    const resolutionStatus: AuthorityResolutionStatus =
      unresolvedAuthorityConflicts.length > 0
        ? "UNRESOLVED"
        : authorityIsPartial
          ? "PARTIAL"
          : "RESOLVED";

    return Object.freeze({
      missionId: request.missionId,
      authorityDomain: request.authorityDomain,
      authoritativeSources,
      supportingSources,
      rejectedSources,
      rejectionReasons: Object.freeze(
        [...rejectionReasons.entries()]
          .map(([sourceId, reason]) =>
            Object.freeze({
              sourceId,
              reason,
            }),
          )
          .sort((left, right) => left.sourceId.localeCompare(right.sourceId)),
      ),
      unresolvedAuthorityConflicts,
      resolutionStatus,
    });
  }
}

function collectSources(
  cerebrauSources: readonly CerebrauKnowledgeSourceReference[],
  novaUxSources: readonly NovaUxSourceMetadataReference[],
): SourceCollectionResult {
  const sources = new Map<string, ResolvedAuthoritySource>();
  const conflicts: UnresolvedAuthorityConflict[] = [];

  for (const source of cerebrauSources) {
    addSource(sources, conflicts, source, "CEREBRAU");
  }

  for (const source of novaUxSources) {
    addSource(sources, conflicts, source, "NOVA_UX");
  }

  return Object.freeze({
    sources,
    conflicts: Object.freeze(conflicts),
  });
}

function addSource(
  sources: Map<string, ResolvedAuthoritySource>,
  conflicts: UnresolvedAuthorityConflict[],
  source:
    | CerebrauKnowledgeSourceReference
    | NovaUxSourceMetadataReference,
  origin: Exclude<AuthoritySourceOrigin, "BOTH">,
): void {
  const normalized = createResolvedSource(source, origin);
  const existing = sources.get(normalized.id);

  if (existing === undefined) {
    sources.set(normalized.id, normalized);
    return;
  }

  if (!sameSourceMetadata(existing, normalized)) {
    conflicts.push(
      createConflict(
        "AR-C004",
        [normalized.id],
        "Adapter results expose contradictory metadata for the same source identifier.",
      ),
    );
    return;
  }

  if (existing.origin !== normalized.origin) {
    sources.set(
      normalized.id,
      Object.freeze({
        ...existing,
        origin: "BOTH",
      }),
    );
  }
}

function createResolvedSource(
  source:
    | CerebrauKnowledgeSourceReference
    | NovaUxSourceMetadataReference,
  origin: Exclude<AuthoritySourceOrigin, "BOTH">,
): ResolvedAuthoritySource {
  return Object.freeze({
    id: source.id,
    domain: source.domain,
    authority: source.authority,
    type: source.type,
    sourceRoot: source.sourceRoot,
    path: source.path,
    origin,
  });
}

function sameSourceMetadata(
  left: ResolvedAuthoritySource,
  right: ResolvedAuthoritySource,
): boolean {
  return (
    left.id === right.id &&
    left.domain === right.domain &&
    left.authority === right.authority &&
    left.type === right.type &&
    left.sourceRoot === right.sourceRoot &&
    left.path === right.path
  );
}

function normalizeDeclaration(
  declaration: AuthoritySourceDeclaration,
): AuthoritySourceDeclaration {
  return Object.freeze({
    sourceId: declaration.sourceId,
    authorityDomain: declaration.authorityDomain,
    role: declaration.role,
    completeness: declaration.completeness,
    conflictsWith: Object.freeze(
      [...new Set(declaration.conflictsWith ?? [])].sort(),
    ),
    rejectionReason: declaration.rejectionReason,
  });
}

function groupDeclarationsBySource(
  declarations: readonly AuthoritySourceDeclaration[],
): ReadonlyMap<string, readonly AuthoritySourceDeclaration[]> {
  const grouped = new Map<string, AuthoritySourceDeclaration[]>();

  for (const declaration of declarations) {
    const current = grouped.get(declaration.sourceId) ?? [];
    current.push(declaration);
    grouped.set(declaration.sourceId, current);
  }

  return new Map(
    [...grouped.entries()].map(([sourceId, values]) => [
      sourceId,
      Object.freeze([...values]),
    ]),
  );
}

function findDeclaredContradictions(
  declarationsBySource: ReadonlyMap<
    string,
    readonly AuthoritySourceDeclaration[]
  >,
  authoritativeSourceIds: ReadonlySet<string>,
): readonly UnresolvedAuthorityConflict[] {
  const pairs = new Set<string>();
  const conflicts: UnresolvedAuthorityConflict[] = [];

  for (const [sourceId, declarations] of declarationsBySource) {
    if (!authoritativeSourceIds.has(sourceId)) {
      continue;
    }

    for (const declaration of declarations) {
      if (declaration.role !== "AUTHORITATIVE") {
        continue;
      }

      for (const conflictingSourceId of declaration.conflictsWith ?? []) {
        if (!authoritativeSourceIds.has(conflictingSourceId)) {
          continue;
        }

        const sourceIds = [sourceId, conflictingSourceId].sort();
        const key = sourceIds.join("\u0000");

        if (pairs.has(key)) {
          continue;
        }

        pairs.add(key);
        conflicts.push(
          createConflict(
            "AR-C007",
            sourceIds,
            "Explicit metadata declares a contradiction between authoritative sources.",
          ),
        );
      }
    }
  }

  return Object.freeze(conflicts);
}

function resolveSources(
  ids: ReadonlySet<string>,
  sources: ReadonlyMap<string, ResolvedAuthoritySource>,
): readonly ResolvedAuthoritySource[] {
  return Object.freeze(
    [...ids]
      .map((id) => sources.get(id))
      .filter(
        (source): source is ResolvedAuthoritySource => source !== undefined,
      )
      .sort((left, right) => left.id.localeCompare(right.id)),
  );
}

function rejectionReasonFor(
  declarations: readonly AuthoritySourceDeclaration[],
): string {
  const explicitReason = declarations.find(
    (declaration) =>
      declaration.role === "REJECTED" &&
      declaration.rejectionReason !== undefined,
  )?.rejectionReason;

  return (
    explicitReason ??
    "The source is explicitly rejected by authority metadata."
  );
}

function createConflict(
  code: string,
  sourceIds: readonly string[],
  message: string,
): UnresolvedAuthorityConflict {
  return Object.freeze({
    code,
    sourceIds: Object.freeze([...new Set(sourceIds)].sort()),
    message,
  });
}

function deduplicateConflicts(
  conflicts: readonly UnresolvedAuthorityConflict[],
): UnresolvedAuthorityConflict[] {
  const unique = new Map<string, UnresolvedAuthorityConflict>();

  for (const conflict of conflicts) {
    const key = [
      conflict.code,
      conflict.sourceIds.join("\u0000"),
      conflict.message,
    ].join("\u0001");
    unique.set(key, conflict);
  }

  return [...unique.values()];
}

function compareDeclarations(
  left: AuthoritySourceDeclaration,
  right: AuthoritySourceDeclaration,
): number {
  return (
    left.sourceId.localeCompare(right.sourceId) ||
    left.role.localeCompare(right.role) ||
    left.completeness.localeCompare(right.completeness)
  );
}

function compareConflicts(
  left: UnresolvedAuthorityConflict,
  right: UnresolvedAuthorityConflict,
): number {
  return (
    left.code.localeCompare(right.code) ||
    left.sourceIds.join("\u0000").localeCompare(
      right.sourceIds.join("\u0000"),
    ) ||
    left.message.localeCompare(right.message)
  );
}

function assertResolutionRequest(
  request: AuthorityResolutionRequest,
): void {
  if (!isRecord(request)) {
    throw new Error(
      "AR-001: AuthorityResolver requires a structured resolution request.",
    );
  }

  if (!isMetadataToken(request.missionId)) {
    throw new Error(
      "AR-002: AuthorityResolver requires a normalized missionId.",
    );
  }

  if (!isMetadataToken(request.authorityDomain)) {
    throw new Error(
      "AR-003: AuthorityResolver requires a normalized authorityDomain.",
    );
  }

  if (
    !isRecord(request.cerebrauKnowledge) ||
    !Array.isArray(request.cerebrauKnowledge.sources)
  ) {
    throw new Error(
      "AR-004: AuthorityResolver requires a CerebrauKnowledgeAdapter result.",
    );
  }

  if (
    !isRecord(request.novaUxKnowledge) ||
    !Array.isArray(request.novaUxKnowledge.sourceMetadata)
  ) {
    throw new Error(
      "AR-005: AuthorityResolver requires a NovaUxKnowledgeAdapter result.",
    );
  }

  if (!Array.isArray(request.authorityDeclarations)) {
    throw new Error(
      "AR-006: AuthorityResolver requires authority declaration metadata.",
    );
  }

  request.authorityDeclarations.forEach((declaration, index) => {
    if (
      !isRecord(declaration) ||
      !isMetadataToken(declaration.sourceId) ||
      !isMetadataToken(declaration.authorityDomain) ||
      typeof declaration.role !== "string" ||
      !AUTHORITY_SOURCE_ROLES.has(declaration.role) ||
      typeof declaration.completeness !== "string" ||
      !AUTHORITY_COMPLETENESS_VALUES.has(declaration.completeness) ||
      (declaration.conflictsWith !== undefined &&
        (!Array.isArray(declaration.conflictsWith) ||
          !declaration.conflictsWith.every(isMetadataToken))) ||
      (declaration.rejectionReason !== undefined &&
        !isNormalizedText(declaration.rejectionReason)) ||
      (declaration.role === "REJECTED" &&
        !isNormalizedText(declaration.rejectionReason))
    ) {
      throw new Error(
        `AR-007: Invalid authority declaration metadata at index ${index}.`,
      );
    }
  });
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
