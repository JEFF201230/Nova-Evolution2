import {
  AuthorityResolver,
  type AuthorityRejectionReason,
  type AuthoritySourceDeclaration,
  type ResolvedAuthoritySource,
  type UnresolvedAuthorityConflict,
} from "./authority-resolver.js";
import {
  NovaUxKnowledgeAdapter,
  type NovaUxDependencyReference,
  type NovaUxDomainReference,
  type NovaUxKnowledgeIndexInput,
  type NovaUxKnowledgeIssue,
  type NovaUxKnowledgeResult,
  type NovaUxRouteReference,
} from "./nova-ux-knowledge-adapter.js";

export type UxKnowledgeResolutionStatus =
  | "RESOLVED"
  | "PARTIAL"
  | "UNRESOLVED";

export interface MissionRequest {
  readonly missionId: string;
  readonly authorityDomain: string;
  readonly knowledgeIndex: NovaUxKnowledgeIndexInput | null | undefined;
  readonly authorityDeclarations: readonly AuthoritySourceDeclaration[];
}

export interface UxKnowledgeRejectionReasons {
  readonly sourceRejections: readonly AuthorityRejectionReason[];
  readonly knowledgeConflicts: readonly string[];
  readonly authorityConflicts: readonly UnresolvedAuthorityConflict[];
}

export interface UxKnowledgeResolution {
  readonly screen: readonly ResolvedAuthoritySource[];
  readonly page: readonly ResolvedAuthoritySource[];
  readonly route: readonly NovaUxRouteReference[];
  readonly navigation: readonly NovaUxDomainReference[];
  readonly layouts: readonly ResolvedAuthoritySource[];
  readonly components: readonly string[];
  readonly designTokens: readonly ResolvedAuthoritySource[];
  readonly informationArchitecture: readonly ResolvedAuthoritySource[];
  readonly dependencies: readonly NovaUxDependencyReference[];
  readonly authoritativeSources: readonly ResolvedAuthoritySource[];
  readonly supportingSources: readonly ResolvedAuthoritySource[];
  readonly rejectedSources: readonly ResolvedAuthoritySource[];
  readonly rejectionReasons: UxKnowledgeRejectionReasons;
  readonly missingArtifacts: readonly string[];
  readonly resolutionStatus: UxKnowledgeResolutionStatus;
}

export interface UxKnowledgeResolverFeatureFlag {
  readonly enabled: boolean;
}

interface NovaUxKnowledgeAdapterPort {
  adapt(
    input: NovaUxKnowledgeIndexInput | null | undefined,
  ): NovaUxKnowledgeResult;
}

interface AuthorityResolverPort {
  resolve(
    request: Parameters<AuthorityResolver["resolve"]>[0],
  ): ReturnType<AuthorityResolver["resolve"]>;
}

export interface UxKnowledgeResolverDependencies {
  readonly knowledgeAdapter: NovaUxKnowledgeAdapterPort;
  readonly authorityResolver: AuthorityResolverPort;
}

const ABSENT_NON_UX_KNOWLEDGE = Object.freeze({
  status: "ABSENT" as const,
  sources: Object.freeze([]),
  authorities: Object.freeze([]),
  programReferences: Object.freeze([]),
  warnings: Object.freeze([]),
  errors: Object.freeze([]),
});

const SOURCE_DOMAINS = Object.freeze({
  screen: "UX_SCREENS",
  page: "UX_PAGES",
  layouts: "UX_LAYOUTS",
  designTokens: "UX_DESIGN_TOKENS",
  informationArchitecture: "UX_INFORMATION_ARCHITECTURE",
});

export class UxKnowledgeResolver {
  readonly enabled: boolean;

  private readonly knowledgeAdapter: NovaUxKnowledgeAdapterPort;
  private readonly authorityResolver: AuthorityResolverPort;

  constructor(
    featureFlag: UxKnowledgeResolverFeatureFlag = { enabled: false },
    dependencies?: UxKnowledgeResolverDependencies,
  ) {
    this.enabled = featureFlag.enabled === true;
    this.knowledgeAdapter =
      dependencies?.knowledgeAdapter ??
      new NovaUxKnowledgeAdapter({ enabled: this.enabled });
    this.authorityResolver =
      dependencies?.authorityResolver ??
      new AuthorityResolver({ enabled: this.enabled });
  }

  resolve(request: MissionRequest): UxKnowledgeResolution | null {
    if (!this.enabled) {
      return null;
    }

    assertMissionRequest(request);

    const knowledge = this.knowledgeAdapter.adapt(request.knowledgeIndex);
    const authorityDecision = this.authorityResolver.resolve({
      missionId: request.missionId,
      authorityDomain: request.authorityDomain,
      cerebrauKnowledge: ABSENT_NON_UX_KNOWLEDGE,
      novaUxKnowledge: knowledge,
      authorityDeclarations: request.authorityDeclarations,
    });
    const authoritativeSources = freezeArray(
      authorityDecision?.authoritativeSources,
    );
    const supportingSources = freezeArray(
      authorityDecision?.supportingSources,
    );
    const rejectedSources = freezeArray(authorityDecision?.rejectedSources);
    const acceptedSourceIds = new Set(
      [...authoritativeSources, ...supportingSources].map(
        (source) => source.id,
      ),
    );
    const missingArtifacts = resolveMissingArtifacts(knowledge.warnings);
    const knowledgeConflicts = freezeUniqueStrings(knowledge.conflicts);
    const authorityConflicts = freezeArray(
      authorityDecision?.unresolvedAuthorityConflicts,
    );

    return Object.freeze({
      screen: sourcesForDomain(
        authoritativeSources,
        SOURCE_DOMAINS.screen,
      ),
      page: sourcesForDomain(authoritativeSources, SOURCE_DOMAINS.page),
      route: freezeArray(knowledge.routes),
      navigation: freezeArray(knowledge.domains),
      layouts: sourcesForDomain(
        authoritativeSources,
        SOURCE_DOMAINS.layouts,
      ),
      components: freezeUniqueStrings(knowledge.components),
      designTokens: sourcesForDomain(
        authoritativeSources,
        SOURCE_DOMAINS.designTokens,
      ),
      informationArchitecture: freezeArray(
        authoritativeSources.filter(
          (source) =>
            source.domain === SOURCE_DOMAINS.informationArchitecture ||
            source.type === "ARCHITECTURE",
        ),
      ),
      dependencies: freezeArray(
        knowledge.dependencies.filter((dependency) =>
          acceptedSourceIds.has(dependency.documentId),
        ),
      ),
      authoritativeSources,
      supportingSources,
      rejectedSources,
      rejectionReasons: Object.freeze({
        sourceRejections: freezeArray(authorityDecision?.rejectionReasons),
        knowledgeConflicts,
        authorityConflicts,
      }),
      missingArtifacts,
      resolutionStatus: resolveStatus(
        knowledge,
        authorityDecision?.resolutionStatus,
        knowledgeConflicts,
        missingArtifacts,
      ),
    });
  }
}

function sourcesForDomain(
  sources: readonly ResolvedAuthoritySource[],
  domain: string,
): readonly ResolvedAuthoritySource[] {
  return freezeArray(
    sources.filter((source) => source.domain === domain),
  );
}

function resolveMissingArtifacts(
  warnings: readonly NovaUxKnowledgeIssue[],
): readonly string[] {
  const missingArtifacts: string[] = [];

  for (const warning of warnings) {
    if (!warning.code.startsWith("NUX-W")) {
      continue;
    }

    const referencedArtifact =
      /^.+: (.+)\.$/.exec(warning.message)?.[1] ?? warning.subject;
    missingArtifacts.push(referencedArtifact);
  }

  return freezeUniqueStrings(missingArtifacts);
}

function resolveStatus(
  knowledge: NovaUxKnowledgeResult,
  authorityStatus: UxKnowledgeResolutionStatus | undefined,
  knowledgeConflicts: readonly string[],
  missingArtifacts: readonly string[],
): UxKnowledgeResolutionStatus {
  if (
    !knowledge.active ||
    knowledge.status === "ABSENT" ||
    knowledge.status === "ERROR" ||
    authorityStatus === undefined ||
    authorityStatus === "UNRESOLVED"
  ) {
    return "UNRESOLVED";
  }

  if (
    knowledge.status === "PARTIAL" ||
    authorityStatus === "PARTIAL" ||
    knowledgeConflicts.length > 0 ||
    missingArtifacts.length > 0
  ) {
    return "PARTIAL";
  }

  return "RESOLVED";
}

function freezeArray<T>(values: readonly T[] | undefined): readonly T[] {
  return Object.freeze([...(values ?? [])]);
}

function freezeUniqueStrings(
  values: readonly string[],
): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function assertMissionRequest(
  request: MissionRequest,
): asserts request is MissionRequest {
  if (!isRecord(request)) {
    throw new Error(
      "UXR-001: UxKnowledgeResolver requires a structured MissionRequest.",
    );
  }

  if (!isMetadataToken(request.missionId)) {
    throw new Error(
      "UXR-002: UxKnowledgeResolver requires a normalized missionId.",
    );
  }

  if (!isMetadataToken(request.authorityDomain)) {
    throw new Error(
      "UXR-003: UxKnowledgeResolver requires a normalized authorityDomain.",
    );
  }

  if (!Array.isArray(request.authorityDeclarations)) {
    throw new Error(
      "UXR-004: UxKnowledgeResolver requires authority declarations.",
    );
  }
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
