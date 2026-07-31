import type {
  RuntimeEvent,
  RuntimeSnapshot,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import {
  readFile,
} from "node:fs/promises";
import {
  JsonRuntimeSnapshotStore,
} from "./nova-core.store.js";
import {
  CURRENT_RUNTIME_DATA_VERSION,
} from "./runtime-migration.js";
import {
  canonicalJson,
} from "./run-binding.js";
import {
  assertRuntimeResponseSerializable,
} from "./runtime-response-adapter.js";

export type IntegrationRecordKind =
  | "SESSION"
  | "EVIDENCE"
  | "CERTIFICATION"
  | "HUMAN_APPROVAL"
  | "LOG";

export interface IntegrationPersistedRecord<TPayload = unknown> {
  readonly schemaVersion: 1;
  readonly recordId: string;
  readonly kind: IntegrationRecordKind;
  readonly missionId: string;
  readonly runId: string;
  readonly source: string;
  readonly occurredAt: string;
  readonly payload: TPayload;
}

export interface IntegrationRecoveryResult {
  readonly recovered: boolean;
  readonly records: readonly IntegrationPersistedRecord[];
  readonly journalValid: boolean | "UNKNOWN";
  readonly snapshotValid: boolean | "UNKNOWN";
}

export interface IntegrationRuntimeRepositoryFeatureFlag {
  readonly enabled: boolean;
}

export class IntegrationPersistenceError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "IntegrationPersistenceError";
  }
}

export class IntegrationRuntimeRepository {
  readonly enabled: boolean;
  private readonly store: JsonRuntimeSnapshotStore;
  private writeTail: Promise<void> = Promise.resolve();

  constructor(
    filePath: string,
    options: {
      readonly attestationKey: string;
      readonly anchorPath?: string;
      readonly featureFlag?: IntegrationRuntimeRepositoryFeatureFlag;
    },
  ) {
    this.enabled = options.featureFlag?.enabled === true;
    this.store = new JsonRuntimeSnapshotStore(filePath, {
      attestationKey: options.attestationKey,
      anchorPath: options.anchorPath,
    });
  }

  async append<TPayload>(
    record: IntegrationPersistedRecord<TPayload>,
  ): Promise<IntegrationPersistedRecord<TPayload> | null> {
    if (!this.enabled) {
      return null;
    }

    assertRecord(record);
    return await this.withWriteLock(() => this.appendUnlocked(record));
  }

  async readAll(): Promise<readonly IntegrationPersistedRecord[]> {
    if (!this.enabled) {
      return Object.freeze([]);
    }

    const snapshot = await this.loadSnapshot();
    if (snapshot === null) {
      return Object.freeze([]);
    }
    return Object.freeze(extractRecords(snapshot));
  }

  async readLatest(
    kind: IntegrationRecordKind,
    missionId: string,
    runId: string,
  ): Promise<IntegrationPersistedRecord | null> {
    if (!this.enabled) {
      return null;
    }
    assertLookup(kind, missionId, runId);
    const records = await this.readAll();
    return (
      [...records]
        .reverse()
        .find(
          (record) =>
            record.kind === kind &&
            record.missionId === missionId &&
            record.runId === runId,
        ) ?? null
    );
  }

  async recover(): Promise<IntegrationRecoveryResult> {
    if (!this.enabled) {
      return Object.freeze({
        recovered: false,
        records: Object.freeze([]),
        journalValid: "UNKNOWN",
        snapshotValid: "UNKNOWN",
      });
    }

    const snapshot = await this.loadSnapshot();
    const integrity = await this.store.inspectIntegritySignals();
    if (
      integrity.journalValid !== true ||
      integrity.snapshotValid !== true
    ) {
      throw new IntegrationPersistenceError(
        "IPR-006",
        "Recovery requires a valid journal and snapshot.",
      );
    }

    return Object.freeze({
      recovered: snapshot !== null,
      records: Object.freeze(
        snapshot === null ? [] : extractRecords(snapshot),
      ),
      journalValid: integrity.journalValid,
      snapshotValid: integrity.snapshotValid,
    });
  }

  async inspectIntegrity(): Promise<{
    readonly journalValid: boolean | "UNKNOWN";
    readonly snapshotValid: boolean | "UNKNOWN";
  }> {
    if (!this.enabled) {
      return Object.freeze({
        journalValid: "UNKNOWN",
        snapshotValid: "UNKNOWN",
      });
    }
    return Object.freeze(await this.store.inspectIntegritySignals());
  }

  private async appendUnlocked<TPayload>(
    record: IntegrationPersistedRecord<TPayload>,
  ): Promise<IntegrationPersistedRecord<TPayload>> {
    const snapshot = (await this.loadSnapshot()) ?? createEmptySnapshot();
    const records = extractRecords(snapshot);
    const duplicate = records.find(
      (candidate) => candidate.recordId === record.recordId,
    );

    if (duplicate !== undefined) {
      if (canonicalJson(duplicate) !== canonicalJson(record)) {
        throw new IntegrationPersistenceError(
          "IPR-003",
          `Record ${record.recordId} conflicts with persisted data.`,
        );
      }
      return record;
    }

    const streamSequence =
      snapshot.events.filter(
        (event) =>
          event.projectId === record.source &&
          event.missionId === record.missionId,
      ).length + 1;
    const event = toRuntimeEvent(record, streamSequence);
    const nextSnapshot: RuntimeSnapshot = {
      ...structuredClone(snapshot),
      events: [...snapshot.events, event],
    };

    try {
      await this.store.save(nextSnapshot);
    } catch (error) {
      throw new IntegrationPersistenceError(
        "IPR-004",
        error instanceof Error ? error.message : "Persistence failed.",
      );
    }
    return record;
  }

  private async withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
    const predecessor = this.writeTail;
    let release!: () => void;
    this.writeTail = new Promise<void>((resolve) => {
      release = resolve;
    });

    await predecessor;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  private async loadSnapshot(): Promise<RuntimeSnapshot | null> {
    try {
      const raw = JSON.parse(
        await readFile(this.store.filePath, "utf8"),
      ) as Record<string, unknown>;
      if (
        raw.dataSchemaVersion !== undefined &&
        raw.dataSchemaVersion !== CURRENT_RUNTIME_DATA_VERSION
      ) {
        throw new IntegrationPersistenceError(
          "IPR-005",
          `Data version ${String(raw.dataSchemaVersion)} is unsupported.`,
        );
      }
    } catch (error) {
      if (isMissingFile(error)) {
        return null;
      }
      throw error;
    }

    return await this.store.load();
  }
}

function toRuntimeEvent(
  record: IntegrationPersistedRecord,
  sequence: number,
): RuntimeEvent {
  return {
    eventId: record.recordId,
    eventName: eventNameFor(record.kind),
    projectId: record.source,
    missionId: record.missionId,
    runId: record.runId,
    correlationId: record.runId,
    sequence,
    sourceState: null,
    targetState: null,
    producer: "NOVA Program Integration",
    occurredAt: record.occurredAt,
    publishedAt: record.occurredAt,
    payload: {
      integrationRecord: structuredClone(record),
    },
    metadata: {
      integrationRecord: true,
      kind: record.kind,
      source: record.source,
    },
  };
}

function eventNameFor(
  kind: IntegrationRecordKind,
): RuntimeEvent["eventName"] {
  switch (kind) {
    case "SESSION":
    case "LOG":
      return "ProcessOutput";
    case "EVIDENCE":
      return "ReportSubmitted";
    case "CERTIFICATION":
      return "TechnicalValidationAccepted";
    case "HUMAN_APPROVAL":
      return "HumanValidationStarted";
  }
}

function extractRecords(
  snapshot: RuntimeSnapshot,
): IntegrationPersistedRecord[] {
  const records: IntegrationPersistedRecord[] = [];
  for (const event of snapshot.events) {
    if (event.metadata.integrationRecord !== true) {
      continue;
    }
    const record = event.payload.integrationRecord;
    assertRecord(record);
    records.push(structuredClone(record));
  }
  return records;
}

function createEmptySnapshot(): RuntimeSnapshot {
  return {
    version: 1,
    missions: [],
    events: [],
    audits: [],
    locks: [],
    contexts: [],
    reports: [],
    queues: [],
    agents: [],
    observabilityEvents: [],
    runs: [],
  };
}

function assertRecord(
  record: unknown,
): asserts record is IntegrationPersistedRecord {
  if (
    !isRecord(record) ||
    record.schemaVersion !== 1 ||
    !isToken(record.recordId) ||
    !isRecordKind(record.kind) ||
    !isToken(record.missionId) ||
    !isToken(record.runId) ||
    !isToken(record.source) ||
    !isCanonicalTimestamp(record.occurredAt)
  ) {
    throw new IntegrationPersistenceError(
      "IPR-001",
      "Invalid integration persistence record.",
    );
  }
  assertRuntimeResponseSerializable(record.payload);
}

function assertLookup(
  kind: IntegrationRecordKind,
  missionId: string,
  runId: string,
): void {
  if (
    !isRecordKind(kind) ||
    !isToken(missionId) ||
    !isToken(runId)
  ) {
    throw new IntegrationPersistenceError(
      "IPR-002",
      "Invalid integration record lookup.",
    );
  }
}

function isRecordKind(value: unknown): value is IntegrationRecordKind {
  return (
    value === "SESSION" ||
    value === "EVIDENCE" ||
    value === "CERTIFICATION" ||
    value === "HUMAN_APPROVAL" ||
    value === "LOG"
  );
}

function isToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  ) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMissingFile(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
