import type {
  CerebrauKnowledgeResult,
  CerebrauProgramReference,
} from "./cerebrau-knowledge-adapter.js";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  NovaUxKnowledgeResult,
} from "./nova-ux-knowledge-adapter.js";

export type ProgramKnowledgeResolutionStatus =
  | "RESOLVED"
  | "PARTIAL"
  | "UNRESOLVED";

export interface ProgramKnowledgeGeneratedFor {
  readonly program?: string;
  readonly capability?: string;
  readonly epic?: string;
  readonly feature?: string;
  readonly lot?: string;
  readonly wave?: string;
}

export interface ProgramKnowledgeProgramMetadata {
  readonly id: string;
  readonly name?: string;
  readonly capability?: string;
  readonly epic?: string;
  readonly feature?: string;
  readonly lot?: string;
  readonly wave?: string;
}

export interface ProgramKnowledgeWaveMetadata {
  readonly id: string;
  readonly lot?: string;
  readonly name?: string;
  readonly status?: string;
  readonly gates?: readonly string[];
  readonly prerequisites?: readonly string[];
  readonly dependencies?: readonly string[];
  readonly requiredArtifacts?: readonly string[];
}

export interface ProgramKnowledgeGateMetadata {
  readonly id: string;
  readonly program?: string;
  readonly lot?: string;
  readonly wave?: string;
}

export interface ProgramKnowledgeIndexMetadata {
  readonly generatedFor?: ProgramKnowledgeGeneratedFor;
  readonly PROGRAMS?: readonly ProgramKnowledgeProgramMetadata[];
  readonly MODULES?: readonly Readonly<Record<string, unknown>>[];
  readonly PDS?: readonly Readonly<Record<string, unknown>>[];
  readonly WAVES?: readonly ProgramKnowledgeWaveMetadata[];
  readonly GATES?: readonly (string | ProgramKnowledgeGateMetadata)[];
  readonly DEPENDENCIES?: readonly string[];
}

export interface ProgramKnowledgeResolutionRequest {
  readonly missionId: string;
  readonly programId?: string;
  readonly lotId?: string;
  readonly waveId?: string;
  readonly requiredArtifacts?: readonly string[];
  readonly missingArtifacts?: readonly string[];
  readonly knowledgeIndex: ProgramKnowledgeIndexMetadata;
  readonly cerebrauKnowledge: CerebrauKnowledgeResult;
  readonly novaUxKnowledge: NovaUxKnowledgeResult;
  readonly authorityDecision: AuthorityResolutionDecision | null;
}

export interface ProgramKnowledgeWaveReference {
  readonly id: string;
  readonly lot: string | null;
  readonly name: string | null;
  readonly status: string | null;
}

export interface ProgramKnowledgeResolution {
  readonly missionId: string;
  readonly program: CerebrauProgramReference | null;
  readonly capability: string | null;
  readonly epic: string | null;
  readonly feature: string | null;
  readonly lot: string | null;
  readonly wave: ProgramKnowledgeWaveReference | null;
  readonly gates: readonly string[];
  readonly prerequisites: readonly string[];
  readonly dependencies: readonly string[];
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly missingArtifacts: readonly string[];
  readonly requiredDocumentIds: readonly string[];
  readonly serviceIds: readonly string[];
  readonly pdsIds: readonly string[];
  readonly resolutionStatus: ProgramKnowledgeResolutionStatus;
}

export interface ProgramKnowledgeResolverFeatureFlag {
  readonly enabled: boolean;
}

const PROGRAM_REFERENCE_KINDS = new Set(["PROGRAM"]);

export class ProgramKnowledgeResolver {
  readonly enabled: boolean;

  constructor(
    featureFlag: ProgramKnowledgeResolverFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  resolve(
    request: ProgramKnowledgeResolutionRequest,
  ): ProgramKnowledgeResolution | null {
    if (!this.enabled) {
      return null;
    }

    assertResolutionRequest(request);

    const generatedFor = request.knowledgeIndex.generatedFor ?? {};
    const missingArtifacts = new Set(
      metadataList(request.missingArtifacts),
    );
    const programMetadata = resolveProgramMetadata(request, generatedFor);

    if (programMetadata === null) {
      missingArtifacts.add("PROGRAM");
    }

    const program = resolveProgramReference(
      request.cerebrauKnowledge,
      programMetadata,
    );

    if (program === null) {
      missingArtifacts.add("PROGRAM_REFERENCE");
    }

    if (
      request.cerebrauKnowledge.status === "ABSENT" ||
      request.cerebrauKnowledge.status === "ERROR"
    ) {
      missingArtifacts.add("CEREBRAU_KNOWLEDGE");
    }

    const capability = firstDefined(
      programMetadata?.capability,
      generatedFor.capability,
    );
    const epic = firstDefined(programMetadata?.epic, generatedFor.epic);
    const feature = firstDefined(
      programMetadata?.feature,
      generatedFor.feature,
    );
    const waveMetadata = resolveWaveMetadata(
      request,
      generatedFor,
      programMetadata,
    );
    const wave = waveMetadata === null ? null : createWaveReference(waveMetadata);
    const lot = resolveLot(request, generatedFor, programMetadata, waveMetadata);

    if (capability === null) {
      missingArtifacts.add("CAPABILITY");
    }

    if (epic === null) {
      missingArtifacts.add("EPIC");
    }

    if (feature === null) {
      missingArtifacts.add("FEATURE");
    }

    if (lot === null) {
      missingArtifacts.add("LOT");
    }

    if (wave === null) {
      missingArtifacts.add("WAVE");
    }

    const rejectedSourceIds = new Set(
      request.authorityDecision?.rejectedSources.map((source) => source.id) ??
        [],
    );
    const authoritativeSourceIds = new Set(
      (
        request.authorityDecision?.authoritativeSources.map(
          (source) => source.id,
        ) ?? []
      ).filter((sourceId) => !rejectedSourceIds.has(sourceId)),
    );
    const acceptedSourceIds = new Set([
      ...authoritativeSourceIds,
      ...(
        request.authorityDecision?.supportingSources.map(
          (source) => source.id,
        ) ?? []
      ).filter((sourceId) => !rejectedSourceIds.has(sourceId)),
    ]);
    const gates = resolveGates(
      request.knowledgeIndex,
      programMetadata,
      lot,
      waveMetadata,
    );
    const prerequisites = metadataList(waveMetadata?.prerequisites);
    const dependencies = resolveDependencies(
      request.knowledgeIndex,
      waveMetadata,
      request.cerebrauKnowledge,
      request.novaUxKnowledge,
      authoritativeSourceIds,
      rejectedSourceIds,
    );

    if (gates.length === 0) {
      missingArtifacts.add("GATES");
    }

    if (prerequisites.length === 0) {
      missingArtifacts.add("PREREQUISITES");
    }

    if (dependencies.length === 0) {
      missingArtifacts.add("DEPENDENCIES");
    }

    const requiredArtifacts = [
      ...new Set([
        ...(request.requiredArtifacts ?? []),
        ...metadataList(waveMetadata?.requiredArtifacts),
      ]),
    ].sort();
    for (const artifact of requiredArtifacts) {
      if (!acceptedSourceIds.has(artifact)) {
        missingArtifacts.add(`ARTIFACT:${artifact}`);
      }
    }

    if (request.authorityDecision === null) {
      missingArtifacts.add("AUTHORITY_DECISION");
    } else if (authoritativeSourceIds.size === 0) {
      missingArtifacts.add("AUTHORITATIVE_SOURCE");
    } else if (
      request.authorityDecision.resolutionStatus === "UNRESOLVED"
    ) {
      missingArtifacts.add("AUTHORITY_CONFLICT");
    } else if (
      request.authorityDecision.resolutionStatus === "PARTIAL"
    ) {
        missingArtifacts.add("AUTHORITY_PARTIAL");
    }

    registerAdapterAbsences(
      request,
      authoritativeSourceIds,
      missingArtifacts,
    );

    const requiredDocumentIds = Object.freeze(
      [...authoritativeSourceIds].sort(),
    );
    const serviceIds = Object.freeze(
      request.cerebrauKnowledge.programReferences
        .filter((reference) => reference.kind === "SERVICE")
        .map((reference) => reference.id)
        .sort(),
    );
    const pdsIds = Object.freeze(
      request.cerebrauKnowledge.programReferences
        .filter((reference) => reference.kind === "PDS")
        .map((reference) => reference.id)
        .sort(),
    );
    const orderedMissingArtifacts = Object.freeze([...missingArtifacts].sort());
    const resolutionStatus = resolveStatus(
      request,
      program,
      wave,
      orderedMissingArtifacts,
    );

    return Object.freeze({
      missionId: request.missionId,
      program,
      capability,
      epic,
      feature,
      lot,
      wave,
      gates,
      prerequisites,
      dependencies,
      authorityDecision: request.authorityDecision,
      missingArtifacts: orderedMissingArtifacts,
      requiredDocumentIds,
      serviceIds,
      pdsIds,
      resolutionStatus,
    });
  }
}

function resolveProgramMetadata(
  request: ProgramKnowledgeResolutionRequest,
  generatedFor: ProgramKnowledgeGeneratedFor,
): ProgramKnowledgeProgramMetadata | null {
  const requestedProgram = request.programId ?? generatedFor.program;
  const programs = request.knowledgeIndex.PROGRAMS ?? [];

  if (requestedProgram === undefined) {
    return programs.length === 1
      ? programs[0]
      : null;
  }

  return (
    programs.find(
      (program) =>
        program.id === requestedProgram ||
        program.name === requestedProgram,
    ) ?? null
  );
}

function resolveProgramReference(
  cerebrauKnowledge: CerebrauKnowledgeResult,
  programMetadata: ProgramKnowledgeProgramMetadata | null,
): CerebrauProgramReference | null {
  if (programMetadata === null) {
    return null;
  }

  return (
    cerebrauKnowledge.programReferences.find(
      (reference) =>
        PROGRAM_REFERENCE_KINDS.has(reference.kind) &&
        (reference.id === programMetadata.id ||
          (programMetadata.name !== undefined &&
            reference.name === programMetadata.name)),
    ) ?? null
  );
}

function resolveLot(
  request: ProgramKnowledgeResolutionRequest,
  generatedFor: ProgramKnowledgeGeneratedFor,
  programMetadata: ProgramKnowledgeProgramMetadata | null,
  waveMetadata: ProgramKnowledgeWaveMetadata | null,
): string | null {
  return (
    request.lotId ??
    waveMetadata?.lot ??
    generatedFor.lot ??
    programMetadata?.lot ??
    null
  );
}

function resolveWaveMetadata(
  request: ProgramKnowledgeResolutionRequest,
  generatedFor: ProgramKnowledgeGeneratedFor,
  programMetadata: ProgramKnowledgeProgramMetadata | null,
): ProgramKnowledgeWaveMetadata | null {
  const requestedWave =
    request.waveId ?? generatedFor.wave ?? programMetadata?.wave;
  const waves = request.knowledgeIndex.WAVES ?? [];

  if (requestedWave === undefined) {
    return waves.length === 1
      ? waves[0]
      : null;
  }

  return (
    waves.find(
      (wave) => wave.id === requestedWave,
    ) ?? null
  );
}

function createWaveReference(
  wave: ProgramKnowledgeWaveMetadata,
): ProgramKnowledgeWaveReference {
  return Object.freeze({
    id: wave.id,
    lot: wave.lot ?? null,
    name: wave.name ?? null,
    status: wave.status ?? null,
  });
}

function resolveDependencies(
  knowledgeIndex: ProgramKnowledgeIndexMetadata,
  wave: ProgramKnowledgeWaveMetadata | null,
  cerebrauKnowledge: CerebrauKnowledgeResult,
  novaUxKnowledge: NovaUxKnowledgeResult,
  authoritativeSourceIds: ReadonlySet<string>,
  rejectedSourceIds: ReadonlySet<string>,
): readonly string[] {
  const waveDependencies = metadataList(wave?.dependencies);
  const indexedDependencies = metadataList(knowledgeIndex.DEPENDENCIES);
  const sourceDependencies = cerebrauKnowledge.sources
    .filter((source) => authoritativeSourceIds.has(source.id))
    .flatMap((source) => source.dependencies);
  const uxDependencies = novaUxKnowledge.dependencies
    .filter((dependency) =>
      authoritativeSourceIds.has(dependency.documentId),
    )
    .map((dependency) => dependency.dependsOn);

  return Object.freeze(
    [
      ...new Set([
        ...waveDependencies,
        ...indexedDependencies,
        ...sourceDependencies,
        ...uxDependencies,
      ]),
    ]
      .filter(
        (dependency) =>
          isMetadataToken(dependency) &&
          !rejectedSourceIds.has(dependency),
      )
      .sort(),
  );
}

function resolveGates(
  knowledgeIndex: ProgramKnowledgeIndexMetadata,
  program: ProgramKnowledgeProgramMetadata | null,
  lot: string | null,
  wave: ProgramKnowledgeWaveMetadata | null,
): readonly string[] {
  const waveGates = metadataList(wave?.gates);
  const indexedGates = (knowledgeIndex.GATES ?? [])
    .filter((gate) => {
      if (typeof gate === "string") {
        return true;
      }

      return (
        (gate.program === undefined ||
          gate.program === program?.id ||
          gate.program === program?.name) &&
        (gate.lot === undefined || gate.lot === lot) &&
        (gate.wave === undefined || gate.wave === wave?.id)
      );
    })
    .map((gate) => typeof gate === "string" ? gate : gate.id);

  return metadataList([...waveGates, ...indexedGates]);
}

function registerAdapterAbsences(
  request: ProgramKnowledgeResolutionRequest,
  authoritativeSourceIds: ReadonlySet<string>,
  missingArtifacts: Set<string>,
): void {
  const authoritativeOrigins = new Set(
    request.authorityDecision?.authoritativeSources
      .filter((source) => authoritativeSourceIds.has(source.id))
      .map((source) => source.origin) ?? [],
  );

  if (
    [...authoritativeOrigins].some(
      (origin) => origin === "CEREBRAU" || origin === "BOTH",
    ) &&
    (request.cerebrauKnowledge.status === "ABSENT" ||
      request.cerebrauKnowledge.status === "ERROR")
  ) {
    missingArtifacts.add("CEREBRAU_KNOWLEDGE");
  }

  if (
    [...authoritativeOrigins].some(
      (origin) => origin === "NOVA_UX" || origin === "BOTH",
    ) &&
    (request.novaUxKnowledge.status === "ABSENT" ||
      request.novaUxKnowledge.status === "ERROR")
  ) {
    missingArtifacts.add("NOVA_UX_KNOWLEDGE");
  }
}

function resolveStatus(
  request: ProgramKnowledgeResolutionRequest,
  program: CerebrauProgramReference | null,
  wave: ProgramKnowledgeWaveReference | null,
  missingArtifacts: readonly string[],
): ProgramKnowledgeResolutionStatus {
  if (
    program === null ||
    wave === null ||
    request.authorityDecision === null ||
    request.authorityDecision.resolutionStatus === "UNRESOLVED"
  ) {
    return "UNRESOLVED";
  }

  if (
    request.authorityDecision.resolutionStatus === "PARTIAL" ||
    request.cerebrauKnowledge.status === "PARTIAL" ||
    missingArtifacts.length > 0
  ) {
    return "PARTIAL";
  }

  return "RESOLVED";
}

function metadataList(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze(
    [...new Set(values ?? [])].filter(isMetadataToken).sort(),
  );
}

function firstDefined(
  first: string | undefined,
  second: string | undefined,
): string | null {
  return first ?? second ?? null;
}

function assertResolutionRequest(
  request: ProgramKnowledgeResolutionRequest,
): void {
  if (!isMetadataToken(request.missionId)) {
    throw new Error(
      "PKR-001: ProgramKnowledgeResolver requires a normalized missionId.",
    );
  }

  if (!isRecord(request.knowledgeIndex)) {
    throw new Error(
      "PKR-002: ProgramKnowledgeResolver requires knowledge-index metadata.",
    );
  }

  if (
    request.knowledgeIndex.PROGRAMS !== undefined &&
    !Array.isArray(request.knowledgeIndex.PROGRAMS)
  ) {
    throw new Error(
      "PKR-003: knowledge-index PROGRAMS metadata must be an array.",
    );
  }

  if (
    request.knowledgeIndex.WAVES !== undefined &&
    !Array.isArray(request.knowledgeIndex.WAVES)
  ) {
    throw new Error(
      "PKR-004: knowledge-index WAVES metadata must be an array.",
    );
  }

  if (!Array.isArray(request.cerebrauKnowledge.sources)) {
    throw new Error(
      "PKR-005: ProgramKnowledgeResolver requires CEREBRAU adapter metadata.",
    );
  }

  if (
    !isRecord(request.novaUxKnowledge) ||
    !Array.isArray(request.novaUxKnowledge.dependencies) ||
    !Array.isArray(request.novaUxKnowledge.sourceMetadata)
  ) {
    throw new Error(
      "PKR-006: ProgramKnowledgeResolver requires NOVA UX adapter metadata.",
    );
  }

  if (
    request.authorityDecision !== null &&
    (!isRecord(request.authorityDecision) ||
      !Array.isArray(request.authorityDecision.authoritativeSources) ||
      !Array.isArray(request.authorityDecision.supportingSources) ||
      !Array.isArray(request.authorityDecision.rejectedSources))
  ) {
    throw new Error(
      "PKR-007: ProgramKnowledgeResolver requires an AuthorityResolver decision.",
    );
  }
}

function isMetadataToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
