import { createHmac, timingSafeEqual } from "node:crypto";
import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { RuntimeSnapshot } from "../runtime/orchestrator/orchestrator-runtime.js";
import {
  CURRENT_RUNTIME_DATA_VERSION,
  migrateRuntimeData,
  verifyRuntimeEnvelope,
  type RuntimeDataEnvelope,
} from "./runtime-migration.js";
import { canonicalJson, sha256 } from "./run-binding.js";

export interface JsonRuntimeSnapshotStoreOptions {
  attestationKey: string;
  anchorPath?: string;
}

export interface RuntimeJournalAnchor {
  schemaVersion: 1;
  eventCount: number;
  lastEventId: string | null;
  lastEventHash: string | null;
  journalChecksum: string;
  anchoredAt: string;
  algorithm: "HMAC-SHA256";
  signature: string;
}

export interface AppliedRuntimeMigration {
  sourceVersion: number;
  targetVersion: number;
  actions: string[];
  backupPath: string;
}

export class JsonRuntimeSnapshotStore {
  private envelope: RuntimeDataEnvelope | null = null;
  private readonly attestationKey: string;
  readonly anchorPath: string;
  lastMigration: AppliedRuntimeMigration | null = null;

  constructor(readonly filePath: string, options: JsonRuntimeSnapshotStoreOptions) {
    if (!options.attestationKey || options.attestationKey.length < 32) {
      throw new Error("NOVA_RUNTIME_ATTESTATION_KEY_REQUIRED");
    }
    this.attestationKey = options.attestationKey;
    this.anchorPath = options.anchorPath ?? `${filePath}.journal-anchor.json`;
  }

  async load(): Promise<RuntimeSnapshot | null> {
    try {
      const content = await readFile(this.filePath, "utf8");
      const raw = JSON.parse(content) as Record<string, unknown>;
      const migrated = migrateRuntimeData(raw);
      if (migrated.changed) {
        const backupPath = `${this.filePath}.rollback-v${migrated.sourceVersion}-to-v${CURRENT_RUNTIME_DATA_VERSION}-${Date.now()}.bak`;
        await copyFile(this.filePath, backupPath);
        await this.persistEnvelope(migrated.envelope);
        await this.persistAnchor(createJournalAnchor(migrated.envelope, this.attestationKey));
        this.lastMigration = {
          sourceVersion: migrated.sourceVersion,
          targetVersion: CURRENT_RUNTIME_DATA_VERSION,
          actions: [...migrated.actions],
          backupPath,
        };
      }
      if (!migrated.changed) {
        await this.verifyPersistedAnchor(migrated.envelope);
      }
      this.envelope = migrated.envelope;
      return migrated.snapshot;
    } catch (error) {
      if (isMissingFile(error)) return null;
      throw error;
    }
  }

  async save(snapshot: RuntimeSnapshot): Promise<void> {
    const migrated = migrateRuntimeData(snapshot);
    const envelope = migrated.envelope;
    if (this.envelope) {
      assertJournalAppendOnly(this.envelope, envelope);
      envelope.migrationHistory = structuredClone(this.envelope.migrationHistory);
      if (this.envelope.extensions) envelope.extensions = structuredClone(this.envelope.extensions);
    }
    await this.persistEnvelope(envelope);
    await this.persistAnchor(createJournalAnchor(envelope, this.attestationKey));
    this.envelope = envelope;
  }

  async verifyAuthority(): Promise<void> {
    const raw = JSON.parse(await readFile(this.filePath, "utf8")) as Record<string, unknown>;
    const migrated = migrateRuntimeData(raw);
    if (migrated.changed) throw new Error("NOVA_RUNTIME_AUTHORITY_REQUIRES_CURRENT_DATA");
    await this.verifyPersistedAnchor(migrated.envelope);
  }

  async inspectIntegritySignals(): Promise<{
    journalValid: boolean | "UNKNOWN";
    snapshotValid: boolean | "UNKNOWN";
  }> {
    try {
      const raw = JSON.parse(await readFile(this.filePath, "utf8")) as RuntimeDataEnvelope;
      const integrity = verifyRuntimeEnvelope(raw);
      let anchorValid = false;
      try {
        await this.verifyPersistedAnchor(raw);
        anchorValid = true;
      } catch {
        anchorValid = false;
      }
      let projectionConsistent = false;
      try {
        projectionConsistent = !migrateRuntimeData(raw).changed;
      } catch {
        projectionConsistent = false;
      }
      return {
        journalValid: integrity.journalValid && anchorValid,
        snapshotValid: integrity.projectionValid && projectionConsistent,
      };
    } catch (error) {
      if (error instanceof SyntaxError || isMissingFile(error)) {
        return { journalValid: false, snapshotValid: false };
      }
      return { journalValid: "UNKNOWN", snapshotValid: "UNKNOWN" };
    }
  }

  async rollbackLastMigration(): Promise<string> {
    if (!this.lastMigration) throw new Error("NOVA_MIGRATION_ROLLBACK_UNAVAILABLE");
    const currentBackupPath = `${this.filePath}.pre-rollback-${Date.now()}.bak`;
    await copyFile(this.filePath, currentBackupPath);
    const temporaryPath = `${this.filePath}.${process.pid}.${Date.now()}.rollback.tmp`;
    await copyFile(this.lastMigration.backupPath, temporaryPath);
    await rename(temporaryPath, this.filePath);
    this.envelope = null;
    this.lastMigration = null;
    return currentBackupPath;
  }

  private async persistEnvelope(envelope: RuntimeDataEnvelope): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.filePath);
  }

  private async persistAnchor(anchor: RuntimeJournalAnchor): Promise<void> {
    await mkdir(dirname(this.anchorPath), { recursive: true });
    const temporaryPath = `${this.anchorPath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(anchor, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.anchorPath);
  }

  private async verifyPersistedAnchor(envelope: RuntimeDataEnvelope): Promise<void> {
    let anchor: RuntimeJournalAnchor;
    try {
      anchor = JSON.parse(await readFile(this.anchorPath, "utf8")) as RuntimeJournalAnchor;
    } catch {
      throw new Error("NOVA_RUNTIME_JOURNAL_ANCHOR_MISSING");
    }
    if (!verifyJournalAnchor(anchor, envelope, this.attestationKey)) {
      throw new Error("NOVA_RUNTIME_JOURNAL_ANCHOR_INVALID");
    }
  }
}

export function createJournalAnchor(
  envelope: RuntimeDataEnvelope,
  attestationKey: string,
  anchoredAt = new Date().toISOString(),
): RuntimeJournalAnchor {
  const last = envelope.journal.events.at(-1);
  const unsigned = {
    schemaVersion: 1 as const,
    eventCount: envelope.journal.events.length,
    lastEventId: last?.eventId ?? null,
    lastEventHash: last?.eventHash ?? null,
    journalChecksum: sha256(canonicalJson(envelope.journal.events)),
    anchoredAt,
    algorithm: "HMAC-SHA256" as const,
  };
  const signature = createHmac("sha256", attestationKey).update(canonicalJson(unsigned)).digest("hex");
  return { ...unsigned, signature };
}

export function verifyJournalAnchor(
  anchor: RuntimeJournalAnchor,
  envelope: RuntimeDataEnvelope,
  attestationKey: string,
): boolean {
  const last = envelope.journal.events.at(-1);
  if (
    anchor.schemaVersion !== 1 ||
    anchor.algorithm !== "HMAC-SHA256" ||
    anchor.eventCount !== envelope.journal.events.length ||
    anchor.lastEventId !== (last?.eventId ?? null) ||
    anchor.lastEventHash !== (last?.eventHash ?? null) ||
    anchor.journalChecksum !== sha256(canonicalJson(envelope.journal.events))
  ) {
    return false;
  }
  const { signature, ...unsigned } = anchor;
  const expected = createHmac("sha256", attestationKey).update(canonicalJson(unsigned)).digest("hex");
  return safeHexEqual(signature, expected);
}

function safeHexEqual(left: string, right: string): boolean {
  if (!/^[0-9a-f]{64}$/i.test(left) || !/^[0-9a-f]{64}$/i.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function assertJournalAppendOnly(previous: RuntimeDataEnvelope, next: RuntimeDataEnvelope): void {
  if (next.journal.events.length < previous.journal.events.length) {
    throw new Error("NOVA_RUNTIME_JOURNAL_TRUNCATION");
  }
  for (let index = 0; index < previous.journal.events.length; index += 1) {
    if (previous.journal.events[index]?.eventHash !== next.journal.events[index]?.eventHash) {
      throw new Error(`NOVA_RUNTIME_JOURNAL_REWRITE:${index}`);
    }
  }
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
