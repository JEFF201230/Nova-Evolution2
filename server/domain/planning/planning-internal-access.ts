import { createHash } from "node:crypto";
import type {
  EstablishPlanningCommand,
  PlanningAuthorityCommand,
  RevisePlanningCommand,
  WithdrawPlanningCommand,
} from "./planning-authority.commands.js";
import type { PlanningDomainEvent } from "./planning-authority.events.js";
import { PlanningAuthority } from "./planning-authority.js";
import type { PlanningRevision } from "./planning.aggregate.js";
import { BusinessInstant, BusinessPeriod, type PlanningProvenance,
  type PlanningVersion, type WorkReference } from "./planning.value-objects.js";
import { canonicalJson, serializeRevision } from "./planning-persistence-codec.js";
import type {
  PlanningCommitResult,
  PlanningHistoryEvent,
  PlanningRepository,
} from "./planning-persistence-ports.js";

export type InternalPlanningCommandRequest<T extends PlanningAuthorityCommand> = Readonly<{
  command: T;
  /** Canonical persistence-stream revision observed by the caller, distinct from PlanningVersion. */
  expectedRevision: number;
  correlationId: string;
}>;

/** The sole internal application mutation boundary over PlanningAuthority and canonical persistence. */
export class PlanningCommands {
  constructor(
    private readonly authority: PlanningAuthority,
    private readonly repository: PlanningRepository,
  ) {}

  establishPlanning(
    request: InternalPlanningCommandRequest<EstablishPlanningCommand>,
  ): PlanningCommitResult {
    return this.execute(request);
  }

  revisePlanning(
    request: InternalPlanningCommandRequest<RevisePlanningCommand>,
  ): PlanningCommitResult {
    return this.execute(request);
  }

  withdrawPlanning(
    request: InternalPlanningCommandRequest<WithdrawPlanningCommand>,
  ): PlanningCommitResult {
    return this.execute(request);
  }

  private execute<T extends PlanningAuthorityCommand>(
    request: InternalPlanningCommandRequest<T>,
  ): PlanningCommitResult {
    const prior = request.expectedRevision === 0
      ? null
      : this.repository.rehydrate(request.command.workReference, request.expectedRevision)?.aggregate
        ?? null;
    const accepted = request.command.kind === "ESTABLISH_PLANNING"
      ? this.authority.establishPlanning(prior, request.command)
      : request.command.kind === "REVISE_PLANNING"
        ? this.authority.revisePlanning(prior, request.command)
        : this.authority.withdrawPlanning(prior, request.command);

    return this.repository.commit(request.expectedRevision, accepted, {
      commandType: request.command.kind,
      causationId: request.command.causality.value,
      correlationId: request.correlationId,
      requestFingerprint: createHash("sha256")
        .update(canonicalJson(commandFingerprint(request.command)), "utf8").digest("hex"),
      fingerprintVersion: 1,
      provenance: request.command.provenance,
    });
  }
}

export type PlanningUnavailable = Readonly<{ status: "UNAVAILABLE" }>;
export type PlanningAbsent = Readonly<{ status: "ABSENT" }>;
export type PlanningVersionAbsent = Readonly<{
  status: "VERSION_ABSENT";
  requestedVersion: number;
}>;

export type GetCurrentPlanningResult = PlanningUnavailable | PlanningAbsent | Readonly<{
  status: "WITHDRAWN";
  workReference: WorkReference;
  revision: number;
  latestVersion: PlanningVersion;
  provenance: PlanningProvenance;
}> | Readonly<{
  status: "CURRENT";
  workReference: WorkReference;
  revision: number;
  planning: PlanningRevision;
  provenance: PlanningProvenance;
}>;

export type GetPlanningVersionResult = PlanningUnavailable | PlanningAbsent
  | PlanningVersionAbsent | Readonly<{
    status: "PRESENT";
    planning: PlanningRevision;
    provenance: PlanningProvenance;
  }>;

export type PlanningHistoryEntry = Readonly<{
  eventId: string;
  streamSequence: number;
  aggregateRevision: number;
  eventOrdinal: number;
  eventType: PlanningDomainEvent["name"];
  payload: unknown;
  causationId: string;
  correlationId: string;
  provenance: PlanningProvenance;
  recordedAt: Date;
}>;

export type GetPlanningHistoryResult = PlanningUnavailable | PlanningAbsent | Readonly<{
  status: "PRESENT";
  applicability: "CURRENT" | "WITHDRAWN";
  revision: number;
  events: readonly PlanningHistoryEntry[];
  hasMore: boolean;
  toSequence: number;
}>;

export type PlanningTimelineEntry = Readonly<{
  elementKind: "PHASE" | "MILESTONE";
  elementId: string;
  time: BusinessInstant | BusinessPeriod;
  provenance: PlanningProvenance;
}>;

export type GetPlanningTimelineResult = PlanningUnavailable | PlanningAbsent
  | PlanningVersionAbsent | Readonly<{
    status: "PRESENT";
    sourceVersion: PlanningVersion;
    provenance: PlanningProvenance;
    entries: readonly PlanningTimelineEntry[];
  }>;

export type GetPlanningScheduleResult = PlanningUnavailable | PlanningAbsent
  | PlanningVersionAbsent | Readonly<{
    status: "PRESENT";
    sourceVersion: PlanningVersion;
    provenance: PlanningProvenance;
    entries: PlanningRevision["schedule"]["entries"];
  }>;

/** The five canonical, read-only internal Planning queries. */
export class PlanningQueries {
  constructor(private readonly repository: PlanningRepository) {}

  getCurrentPlanning(workReference: WorkReference): GetCurrentPlanningResult {
    return this.available(() => {
      const persisted = this.repository.load(workReference);
      if (persisted === null) return ABSENT;
      const current = persisted.aggregate.currentVersion;
      if (current !== null) {
        return Object.freeze({
          status: "CURRENT" as const,
          workReference: persisted.aggregate.workReference,
          revision: persisted.revision,
          planning: current,
          provenance: current.provenance,
        });
      }
      const latest = persisted.aggregate.versions.at(-1)!;
      return Object.freeze({
        status: "WITHDRAWN" as const,
        workReference: persisted.aggregate.workReference,
        revision: persisted.revision,
        latestVersion: latest.version,
        provenance: latest.provenance,
      });
    });
  }

  getPlanningVersion(
    workReference: WorkReference,
    version: PlanningVersion,
  ): GetPlanningVersionResult {
    return this.available(() => {
      const persisted = this.repository.load(workReference);
      if (persisted === null) return ABSENT;
      const planning = persisted.aggregate.versions.find((item) => item.version.equals(version));
      return planning === undefined
        ? versionAbsent(version)
        : Object.freeze({ status: "PRESENT" as const, planning, provenance: planning.provenance });
    });
  }

  getPlanningHistory(
    workReference: WorkReference,
    afterSequence = 0,
    limit = 100,
  ): GetPlanningHistoryResult {
    return this.available(() => {
      const persisted = this.repository.load(workReference);
      if (persisted === null) return ABSENT;
      const history = this.repository.readHistory(workReference, afterSequence, limit);
      return Object.freeze({
        status: "PRESENT" as const,
        applicability: persisted.aggregate.currentVersion === null
          ? "WITHDRAWN" as const : "CURRENT" as const,
        revision: history.lastRevision,
        events: Object.freeze(history.events.map(copyHistoryEntry)),
        hasMore: history.hasMore,
        toSequence: history.toSequence,
      });
    });
  }

  getPlanningTimeline(
    workReference: WorkReference,
    version: PlanningVersion,
  ): GetPlanningTimelineResult {
    return this.available(() => {
      const planning = this.findVersion(workReference, version);
      if (planning === null) return ABSENT;
      if (planning === undefined) return versionAbsent(version);
      const entries = planning.schedule.entries.map((entry): PlanningTimelineEntry => Object.freeze({
        elementKind: entry.element.kind,
        elementId: entry.element.id,
        time: entry.time,
        provenance: entry.time.provenance,
      })).sort(compareTimelineEntries);
      return Object.freeze({
        status: "PRESENT" as const,
        sourceVersion: planning.version,
        provenance: planning.provenance,
        entries: Object.freeze(entries),
      });
    });
  }

  getPlanningSchedule(
    workReference: WorkReference,
    version: PlanningVersion,
  ): GetPlanningScheduleResult {
    return this.available(() => {
      const planning = this.findVersion(workReference, version);
      if (planning === null) return ABSENT;
      if (planning === undefined) return versionAbsent(version);
      return Object.freeze({
        status: "PRESENT" as const,
        sourceVersion: planning.version,
        provenance: planning.provenance,
        entries: Object.freeze([...planning.schedule.entries]),
      });
    });
  }

  private findVersion(
    workReference: WorkReference,
    version: PlanningVersion,
  ): PlanningRevision | null | undefined {
    const persisted = this.repository.load(workReference);
    return persisted === null
      ? null
      : persisted.aggregate.versions.find((item) => item.version.equals(version));
  }

  private available<T>(read: () => T): T | PlanningUnavailable {
    try {
      return read();
    } catch (error) {
      if (isUnavailable(error)) return UNAVAILABLE;
      throw error;
    }
  }
}

const ABSENT = Object.freeze({ status: "ABSENT" as const });
const UNAVAILABLE = Object.freeze({ status: "UNAVAILABLE" as const });

function versionAbsent(version: PlanningVersion): PlanningVersionAbsent {
  return Object.freeze({ status: "VERSION_ABSENT" as const, requestedVersion: version.value });
}

function isUnavailable(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error
    && (error as { code?: unknown }).code === "PLANNING_PERSISTENCE_UNAVAILABLE";
}

function commandFingerprint(command: PlanningAuthorityCommand): unknown {
  return {
    kind: command.kind,
    workReference: {
      projectIdentity: command.workReference.projectIdentity,
      workIdentity: command.workReference.workIdentity,
    },
    causality: command.causality.value,
    provenance: {
      authority: command.provenance.authority,
      source: command.provenance.source,
      businessCause: command.provenance.businessCause,
      effectiveAtEpochMs: command.provenance.effectiveAt.getTime(),
    },
    expectedVersion: command.expectedVersion?.value ?? null,
    proposal: "proposal" in command ? serializeRevision(command.proposal) : undefined,
    reason: "reason" in command ? command.reason : undefined,
  };
}

function copyHistoryEntry(event: PlanningHistoryEvent): PlanningHistoryEntry {
  return Object.freeze({
    eventId: event.eventId,
    streamSequence: event.streamSequence,
    aggregateRevision: event.aggregateRevision,
    eventOrdinal: event.eventOrdinal,
    eventType: event.eventType,
    payload: freezeJson(event.payload),
    causationId: event.causationId,
    correlationId: event.correlationId,
    provenance: event.provenance,
    recordedAt: new Date(event.recordedAt.getTime()),
  });
}

function freezeJson(value: unknown): unknown {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeJson));
  if (value !== null && typeof value === "object") {
    return Object.freeze(Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, freezeJson(item)])));
  }
  return value;
}

function compareTimelineEntries(left: PlanningTimelineEntry, right: PlanningTimelineEntry): number {
  return timelineEpoch(left.time) - timelineEpoch(right.time)
    || left.elementKind.localeCompare(right.elementKind)
    || left.elementId.localeCompare(right.elementId);
}

function timelineEpoch(time: BusinessInstant | BusinessPeriod): number {
  if (time instanceof BusinessInstant) return time.value.getTime();
  return time.start?.value.getTime() ?? time.end?.value.getTime() ?? Number.POSITIVE_INFINITY;
}
