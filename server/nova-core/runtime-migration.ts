import type {
  MissionEventName,
  MissionState,
  RuntimeEvent,
  RuntimeMission,
  RuntimeSnapshot,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import { canonicalJson, sha256 } from "./run-binding.js";
import {
  sealRuntimeEventJournal,
  verifyRuntimeEventJournal,
} from "../runtime/journal/append-only-journal.js";

export const CURRENT_RUNTIME_DATA_VERSION = 3 as const;

export interface RuntimeDataEnvelope {
  dataSchemaVersion: 3;
  projection: RuntimeSnapshot;
  projectionChecksum: string;
  journal: {
    schemaVersion: 1;
    events: RuntimeEvent[];
    checksum: string;
  };
  migrationHistory: Array<{
    fromVersion: number;
    toVersion: number;
    migratedAt: string;
    actions: string[];
  }>;
  extensions?: Record<string, unknown>;
}

export interface RuntimeMigrationResult {
  snapshot: RuntimeSnapshot;
  envelope: RuntimeDataEnvelope;
  changed: boolean;
  sourceVersion: number;
  actions: string[];
}

const SNAPSHOT_KEYS = new Set([
  "version", "missions", "events", "audits", "locks", "contexts", "reports",
  "queues", "agents", "observabilityEvents", "runs", "journal",
]);

export function migrateRuntimeData(raw: unknown, now = new Date().toISOString()): RuntimeMigrationResult {
  if (!isRecord(raw)) throw new Error("NOVA_MIGRATION_DATA_NOT_OBJECT");
  if (raw.dataSchemaVersion === CURRENT_RUNTIME_DATA_VERSION) {
    return openCurrentEnvelope(raw, now);
  }

  const sourceVersion = raw.dataSchemaVersion === 2
    ? 2
    : numericVersion(raw.version ?? raw.schemaVersion ?? 0);
  if (sourceVersion > 2) throw new Error(`NOVA_MIGRATION_UNSUPPORTED_SOURCE_VERSION:${sourceVersion}`);
  const sourceSnapshot = isRecord(raw.projection) ? raw.projection : isRecord(raw.snapshot) ? raw.snapshot : raw;
  const actions = [
    sourceVersion === 0 ? "legacy-snapshot-v0-normalized" :
      sourceVersion === 1 ? "snapshot-v1-normalized" :
      "data-envelope-v2-normalized",
    "legacy-journal-normalized",
    "mission-projection-rebuilt-from-journal",
    "data-envelope-v2-created",
  ];
  const events = normalizeJournal(extractJournal(raw, sourceSnapshot));
  const snapshot = rebuildRuntimeProjection(normalizeSnapshot(sourceSnapshot, events), events);
  const extensions = extractExtensions(raw);
  const envelope = createEnvelope(snapshot, events, [{
    fromVersion: sourceVersion,
    toVersion: CURRENT_RUNTIME_DATA_VERSION,
    migratedAt: now,
    actions,
  }], extensions);
  return { snapshot: envelope.projection, envelope, changed: true, sourceVersion, actions };
}

export function rebuildRuntimeProjection(
  snapshot: RuntimeSnapshot,
  journalEvents: readonly RuntimeEvent[],
): RuntimeSnapshot {
  const rebuilt = structuredClone(snapshot);
  rebuilt.events = structuredClone([...journalEvents]);
  const grouped = new Map<string, RuntimeEvent[]>();
  for (const event of journalEvents) {
    const key = `${event.projectId}:${event.missionId}`;
    const events = grouped.get(key) ?? [];
    events.push(event);
    grouped.set(key, events);
  }

  rebuilt.missions = rebuilt.missions.map((mission) => {
    const events = (grouped.get(`${mission.projectId}:${mission.missionId}`) ?? [])
      .sort((left, right) => left.sequence - right.sequence);
    if (events.length === 0) return mission;
    const result = structuredClone(mission);
    for (const event of events) {
      if (event.targetState) result.state = normalizeMissionState(event.targetState);
      if (event.runId) result.runId = event.runId;
      if (event.eventName === "ReportSubmitted" && typeof event.payload.reportId === "string") {
        result.reportId = event.payload.reportId;
      }
      result.updatedAt = event.publishedAt || event.occurredAt || result.updatedAt;
    }
    return result;
  });
  return rebuilt;
}

export function verifyRuntimeEnvelope(envelope: RuntimeDataEnvelope): {
  journalValid: boolean;
  projectionValid: boolean;
} {
  const chain = verifyRuntimeEventJournal(envelope.journal.events);
  return {
    journalValid: chain.valid && envelope.journal.checksum === sha256(canonicalJson(envelope.journal.events)),
    projectionValid: envelope.projectionChecksum === sha256(canonicalJson(envelope.projection)),
  };
}

function openCurrentEnvelope(raw: Record<string, unknown>, now: string): RuntimeMigrationResult {
  const envelope = raw as unknown as RuntimeDataEnvelope;
  if (!isRecord(envelope.journal) || !Array.isArray(envelope.journal.events) || !isRecord(envelope.projection)) {
    throw new Error("NOVA_MIGRATION_ENVELOPE_INVALID");
  }
  const integrity = verifyRuntimeEnvelope(envelope);
  if (!integrity.journalValid) throw new Error("NOVA_MIGRATION_JOURNAL_CORRUPTED");
  if (integrity.projectionValid) {
    const replayed = rebuildRuntimeProjection(
      normalizeSnapshot(envelope.projection, envelope.journal.events),
      envelope.journal.events,
    );
    if (!projectionMatchesJournal(envelope.projection, replayed)) {
      throw new Error("NOVA_RUNTIME_PROJECTION_JOURNAL_MISMATCH");
    }
    return {
      snapshot: structuredClone(envelope.projection),
      envelope: structuredClone(envelope),
      changed: false,
      sourceVersion: CURRENT_RUNTIME_DATA_VERSION,
      actions: [],
    };
  }

  const events = normalizeJournal(envelope.journal.events);
  const snapshot = rebuildRuntimeProjection(normalizeSnapshot(envelope.projection, events), events);
  const actions = ["projection-checksum-mismatch-detected", "mission-projection-rebuilt-from-journal"];
  const repaired = createEnvelope(
    snapshot,
    events,
    [
      ...(Array.isArray(envelope.migrationHistory) ? envelope.migrationHistory : []),
      {
        fromVersion: CURRENT_RUNTIME_DATA_VERSION,
        toVersion: CURRENT_RUNTIME_DATA_VERSION,
        migratedAt: now,
        actions,
      },
    ],
    envelope.extensions,
  );
  return {
    snapshot,
    envelope: repaired,
    changed: true,
    sourceVersion: CURRENT_RUNTIME_DATA_VERSION,
    actions,
  };
}

function projectionMatchesJournal(persisted: RuntimeSnapshot, replayed: RuntimeSnapshot): boolean {
  if (canonicalJson(persisted.events) !== canonicalJson(replayed.events)) return false;
  const facts = (snapshot: RuntimeSnapshot) => snapshot.missions
    .map((mission) => ({
      projectId: mission.projectId,
      missionId: mission.missionId,
      state: mission.state,
      runId: mission.runId,
      reportId: mission.reportId,
      updatedAt: mission.updatedAt,
    }))
    .sort((left, right) =>
      `${left.projectId}:${left.missionId}`.localeCompare(`${right.projectId}:${right.missionId}`));
  return canonicalJson(facts(persisted)) === canonicalJson(facts(replayed));
}

function normalizeSnapshot(source: Record<string, unknown> | RuntimeSnapshot, events: RuntimeEvent[]): RuntimeSnapshot {
  return {
    version: 1,
    missions: arrayOf<RuntimeMission>(source.missions).map(normalizeMission),
    events,
    audits: arrayOf(source.audits),
    locks: arrayOf(source.locks),
    contexts: arrayOf(source.contexts),
    reports: arrayOf(source.reports),
    queues: arrayOf(source.queues),
    agents: arrayOf(source.agents),
    observabilityEvents: arrayOf(source.observabilityEvents),
    runs: arrayOf(source.runs),
  } as RuntimeSnapshot;
}

function normalizeMission(mission: RuntimeMission): RuntimeMission {
  const now = new Date(0).toISOString();
  return {
    ...mission,
    priority: mission.priority ?? 100,
    state: normalizeMissionState(mission.state),
    assignedAgentId: mission.assignedAgentId ?? null,
    lockId: mission.lockId ?? null,
    runId: mission.runId ?? null,
    contextId: mission.contextId ?? null,
    reportId: mission.reportId ?? null,
    updatedAt: mission.updatedAt ?? mission.createdAt ?? now,
    scope: mission.scope ?? { allowed: [], forbidden: [] },
    deliverables: mission.deliverables ?? [],
    stopCriteria: mission.stopCriteria ?? [],
    authorizedReferences: mission.authorizedReferences ?? [],
  };
}

function normalizeMissionState(value: unknown): MissionState {
  const state = String(value ?? "DRAFT").toUpperCase();
  if (state === "APPROVED" || state === "COMPLETED") return "ACCEPTED";
  const supported: MissionState[] = [
    "DRAFT", "READY", "ASSIGNED", "LOCKED", "RUNNING", "WAITING_INPUT",
    "WAITING_DEPENDENCY", "ESCALATED", "SUBMITTED", "TECHNICAL_VALIDATION",
    "DOCUMENTARY_VALIDATION", "HUMAN_VALIDATION", "NEEDS_REVISION", "ACCEPTED",
    "REJECTED", "FAILED", "TIMEOUT", "CANCELLED", "CERTIFIED",
  ];
  return supported.includes(state as MissionState) ? state as MissionState : "FAILED";
}

function normalizeJournal(source: unknown): RuntimeEvent[] {
  if (!Array.isArray(source)) return [];
  const sequences = new Map<string, number>();
  return source.map((value, index) => {
    if (!isRecord(value)) throw new Error(`NOVA_MIGRATION_JOURNAL_EVENT_INVALID:${index}`);
    const projectId = stringValue(value.projectId ?? value.project);
    const missionId = stringValue(value.missionId ?? value.mission);
    const eventName = stringValue(value.eventName ?? value.type) as MissionEventName;
    if (!projectId || !missionId || !eventName) {
      throw new Error(`NOVA_MIGRATION_JOURNAL_EVENT_INVALID:${index}`);
    }
    const key = `${projectId}:${missionId}`;
    const sequence = Number.isInteger(value.sequence)
      ? Number(value.sequence)
      : (sequences.get(key) ?? 0) + 1;
    sequences.set(key, sequence);
    const occurredAt = stringValue(value.occurredAt ?? value.timestamp) || new Date(0).toISOString();
    return {
      eventId: stringValue(value.eventId) || `MIGRATED-${projectId}-${missionId}-${sequence}`,
      eventName,
      projectId,
      missionId,
      runId: stringValue(value.runId) || undefined,
      correlationId: stringValue(value.correlationId) || `CORR-${projectId}-${missionId}`,
      causationId: stringValue(value.causationId) || undefined,
      sequence,
      sourceState: value.sourceState ? normalizeMissionState(value.sourceState) : null,
      targetState: value.targetState || value.state ? normalizeMissionState(value.targetState ?? value.state) : null,
      producer: stringValue(value.producer) || "Legacy Migration",
      occurredAt,
      publishedAt: stringValue(value.publishedAt) || occurredAt,
      payload: isRecord(value.payload) ? value.payload : {},
      metadata: isRecord(value.metadata) ? value.metadata : { migrated: true },
    };
  });
}

function extractJournal(raw: Record<string, unknown>, snapshot: Record<string, unknown>): unknown {
  if (Array.isArray(raw.journal)) return raw.journal;
  if (isRecord(raw.journal) && Array.isArray(raw.journal.events)) return raw.journal.events;
  if (Array.isArray(raw.eventLog)) return raw.eventLog;
  return snapshot.events;
}

function extractExtensions(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  const carried = isRecord(raw.extensions) ? structuredClone(raw.extensions) : {};
  const entries = Object.entries(raw).filter(([key]) =>
    !SNAPSHOT_KEYS.has(key) &&
    !["dataSchemaVersion", "projection", "projectionChecksum", "snapshot", "eventLog", "migrationHistory", "extensions"].includes(key));
  const extensions = { ...carried, ...Object.fromEntries(entries) };
  return Object.keys(extensions).length > 0 ? extensions : undefined;
}

function createEnvelope(
  snapshot: RuntimeSnapshot,
  events: RuntimeEvent[],
  migrationHistory: RuntimeDataEnvelope["migrationHistory"],
  extensions?: Record<string, unknown>,
): RuntimeDataEnvelope {
  const sealedEvents = sealRuntimeEventJournal(events);
  const integrity = verifyRuntimeEventJournal(sealedEvents);
  if (!integrity.valid) {
    throw new Error(`NOVA_MIGRATION_JOURNAL_SEQUENCE_INVALID:${integrity.firstError?.code ?? "UNKNOWN"}`);
  }
  const projection = { ...structuredClone(snapshot), events: structuredClone(sealedEvents) };
  return {
    dataSchemaVersion: CURRENT_RUNTIME_DATA_VERSION,
    projection,
    projectionChecksum: sha256(canonicalJson(projection)),
    journal: {
      schemaVersion: 1,
      events: structuredClone(sealedEvents),
      checksum: sha256(canonicalJson(sealedEvents)),
    },
    migrationHistory: structuredClone(migrationHistory),
    ...(extensions && Object.keys(extensions).length > 0 ? { extensions: structuredClone(extensions) } : {}),
  };
}

function numericVersion(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function arrayOf<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? structuredClone(value) as T[] : [];
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}
