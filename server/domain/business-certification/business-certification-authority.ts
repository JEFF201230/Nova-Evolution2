import { createHash, randomUUID } from "node:crypto";
import { BusinessCertificationRecord, isAllowedTransition } from "./business-certification.aggregate.js";
import { BusinessCertificationError } from "./business-certification.errors.js";
import type { BusinessCertificationEvent } from "./business-certification.events.js";
import { BusinessCertificationJournal } from "./business-certification.journal.js";
import {
  BUSINESS_CERTIFICATION_AUTHORITY,
  assertOpaqueIdentity,
  assertProvenance,
  freezeProvenance,
  type BusinessCertificationClock,
  type BusinessCertificationSnapshot,
  type CertificationId,
  type CertificationIdGenerator,
  type ChangeCertificationState,
  type EvidenceIdentityReader,
  type RecordCertificationDecision,
} from "./business-certification.types.js";

type CommandReceipt = Readonly<{ fingerprint: string; snapshot: BusinessCertificationSnapshot }>;
type Projection = Readonly<{
  records: Map<string, BusinessCertificationRecord>;
  commands: Map<string, CommandReceipt>;
}>;

export type BusinessCertificationAuthorityOptions = Readonly<{
  journal: BusinessCertificationJournal;
  evidenceIdentities: EvidenceIdentityReader;
  idGenerator?: CertificationIdGenerator;
  clock?: BusinessCertificationClock;
}>;

/** The sole allocator of CertificationId and producer of certification lifecycle facts. */
export class BusinessCertificationAuthority {
  readonly authority = BUSINESS_CERTIFICATION_AUTHORITY;
  readonly #journal: BusinessCertificationJournal;
  readonly #evidenceIdentities: EvidenceIdentityReader;
  readonly #idGenerator: CertificationIdGenerator;
  readonly #clock: BusinessCertificationClock;

  constructor(options: BusinessCertificationAuthorityOptions) {
    this.#journal = options.journal;
    this.#evidenceIdentities = options.evidenceIdentities;
    this.#idGenerator = options.idGenerator ?? { nextCertificationId: () => randomUUID() };
    this.#clock = options.clock ?? { now: () => new Date() };
    this.#journal.read((events) => project(events));
  }

  recordDecision(command: RecordCertificationDecision): BusinessCertificationSnapshot {
    validateRecordCommand(command);
    const fingerprint = commandFingerprint("recordDecision", command);
    return this.#journal.transact((events) => {
      const state = project(events);
      const replay = replayOrConflict(state, command.commandId, fingerprint);
      if (replay !== undefined) return { value: replay };
      const evidence = this.#resolveEvidence(command.evidenceId);
      if (evidence === "NOT_FOUND") throw new BusinessCertificationError("EVIDENCE_NOT_FOUND", "The Evidence identity does not exist.");
      if (evidence === "UNAVAILABLE") throw new BusinessCertificationError("EVIDENCE_AUTHORITY_UNAVAILABLE", "The Evidence identity owner is unavailable.");
      if (evidence !== command.evidenceId) throw new BusinessCertificationError(
        "EVIDENCE_RESPONSE_INCONSISTENT", "The Evidence owner returned a different identity.",
      );
      if (command.supersedesCertificationId !== undefined) {
        const superseded = state.records.get(command.supersedesCertificationId);
        if (superseded === undefined) throw new BusinessCertificationError(
          "SUPERSEDED_CERTIFICATION_NOT_FOUND", "The superseded certification does not exist.",
        );
        if (superseded.evidenceId !== command.evidenceId) throw new BusinessCertificationError(
          "SUPERSESSION_SUBJECT_MISMATCH", "A certification may supersede only a record for the same Evidence identity.",
        );
      }
      const certificationId = this.#allocateIdentity(state);
      const event: BusinessCertificationEvent = Object.freeze({
        type: "DECISION_RECORDED",
        commandId: command.commandId,
        commandFingerprint: fingerprint,
        certificationId,
        authority: BUSINESS_CERTIFICATION_AUTHORITY,
        subject: Object.freeze({ kind: "BUSINESS_EVIDENCE", evidenceId: command.evidenceId as never }),
        criteriaReference: command.criteriaReference,
        decision: command.decision,
        decidedAt: clockTimestamp(this.#clock),
        provenance: freezeProvenance(command.provenance),
        ...(command.supersedesCertificationId === undefined
          ? {}
          : { supersedesCertificationId: command.supersedesCertificationId as CertificationId }),
      });
      const record = BusinessCertificationRecord.fromDecision(event);
      return { value: record.snapshot(), append: event };
    });
  }

  withdraw(command: ChangeCertificationState): BusinessCertificationSnapshot {
    return this.#changeState("withdraw", command, "WITHDRAWN");
  }

  invalidate(command: ChangeCertificationState): BusinessCertificationSnapshot {
    return this.#changeState("invalidate", command, "INVALIDATED");
  }

  #changeState(
    operation: "withdraw" | "invalidate",
    command: ChangeCertificationState,
    target: "WITHDRAWN" | "INVALIDATED",
  ): BusinessCertificationSnapshot {
    validateChangeCommand(command);
    const fingerprint = commandFingerprint(operation, command);
    return this.#journal.transact((events) => {
      const state = project(events);
      const replay = replayOrConflict(state, command.commandId, fingerprint);
      if (replay !== undefined) return { value: replay };
      const record = state.records.get(command.certificationId);
      if (record === undefined) throw new BusinessCertificationError("CERTIFICATION_NOT_FOUND", "Certification identity does not exist.");
      if (!isAllowedTransition(record.currentState, target)) throw new BusinessCertificationError(
        "STATE_TRANSITION_REJECTED", `${record.currentState} -> ${target} is not admitted.`,
      );
      const event: BusinessCertificationEvent = Object.freeze({
        type: "STATE_CHANGED",
        commandId: command.commandId,
        commandFingerprint: fingerprint,
        certificationId: command.certificationId as CertificationId,
        from: record.currentState,
        to: target,
        occurredAt: clockTimestamp(this.#clock),
        provenance: freezeProvenance(command.provenance),
      });
      record.apply(event);
      return { value: record.snapshot(), append: event };
    });
  }

  #resolveEvidence(evidenceId: string): string | "NOT_FOUND" | "UNAVAILABLE" {
    try {
      const resolution = this.#evidenceIdentities.resolveEvidenceIdentity(evidenceId);
      if (resolution?.status === "FOUND" && typeof resolution.evidenceId === "string") return resolution.evidenceId;
      if (resolution?.status === "NOT_FOUND") return "NOT_FOUND";
      if (resolution?.status === "UNAVAILABLE") return "UNAVAILABLE";
      return "UNAVAILABLE";
    } catch {
      return "UNAVAILABLE";
    }
  }

  #allocateIdentity(state: Projection): CertificationId {
    const value = this.#idGenerator.nextCertificationId();
    try { assertOpaqueIdentity(value, "certificationId"); }
    catch (error) { throw new BusinessCertificationError("CERTIFICATION_ID_COLLISION", "The generator returned an invalid identity.", { cause: error }); }
    if (state.records.has(value)) throw new BusinessCertificationError("CERTIFICATION_ID_COLLISION", "The generated identity already exists.");
    return value as CertificationId;
  }
}

export function project(events: readonly BusinessCertificationEvent[]): Projection {
  const records = new Map<string, BusinessCertificationRecord>();
  const commands = new Map<string, CommandReceipt>();
  for (const event of events) {
    if (event.commandFingerprint !== eventFingerprint(event)) {
      throw recoveryFailure("A command fingerprint is inconsistent with its durable event.");
    }
    if (commands.has(event.commandId)) throw recoveryFailure("A command identity occurs more than once in the journal.");
    let record: BusinessCertificationRecord;
    if (event.type === "DECISION_RECORDED") {
      if (records.has(event.certificationId)) throw recoveryFailure("A CertificationId was allocated more than once.");
      if (event.supersedesCertificationId !== undefined) {
        const superseded = records.get(event.supersedesCertificationId);
        if (superseded === undefined || superseded.evidenceId !== event.subject.evidenceId) {
          throw recoveryFailure("Supersession does not identify an earlier record for the same subject.");
        }
      }
      record = BusinessCertificationRecord.fromDecision(event);
      records.set(event.certificationId, record);
    } else {
      record = records.get(event.certificationId) ?? (() => { throw recoveryFailure("Lifecycle event has no aggregate."); })();
      record.apply(event);
    }
    commands.set(event.commandId, Object.freeze({ fingerprint: event.commandFingerprint, snapshot: record.snapshot() }));
  }
  return Object.freeze({ records, commands });
}

function replayOrConflict(state: Projection, commandId: string, fingerprint: string): BusinessCertificationSnapshot | undefined {
  const prior = state.commands.get(commandId);
  if (prior === undefined) return undefined;
  if (prior.fingerprint !== fingerprint) throw new BusinessCertificationError(
    "COMMAND_ID_CONFLICT", "A command identity was reused with divergent content.",
  );
  return prior.snapshot;
}

function validateRecordCommand(command: RecordCertificationDecision): void {
  assertExactKeys(
    command,
    ["commandId", "evidenceId", "criteriaReference", "decision", "provenance", "supersedesCertificationId"],
    ["supersedesCertificationId"],
    "recordDecision command",
  );
  assertOpaqueIdentity(command.commandId, "commandId");
  assertOpaqueIdentity(command.evidenceId, "evidenceId");
  assertOpaqueIdentity(command.criteriaReference, "criteriaReference");
  assertProvenance(command.provenance);
  if (command.decision !== "CERTIFIED" && command.decision !== "REJECTED") throw new TypeError("decision is invalid.");
  if (command.supersedesCertificationId !== undefined) assertOpaqueIdentity(command.supersedesCertificationId, "supersedesCertificationId");
}

function validateChangeCommand(command: ChangeCertificationState): void {
  assertExactKeys(command, ["commandId", "certificationId", "provenance"], [], "lifecycle command");
  assertOpaqueIdentity(command.commandId, "commandId");
  assertOpaqueIdentity(command.certificationId, "certificationId");
  assertProvenance(command.provenance);
}

function clockTimestamp(clock: BusinessCertificationClock): string {
  const value = clock.now();
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) throw new TypeError("Clock returned an invalid timestamp.");
  return value.toISOString();
}

function commandFingerprint(operation: string, command: object): string {
  return createHash("sha256").update(JSON.stringify(canonicalize({ operation, command }))).digest("hex");
}

function eventFingerprint(event: BusinessCertificationEvent): string {
  if (event.type === "DECISION_RECORDED") {
    return commandFingerprint("recordDecision", {
      commandId: event.commandId,
      evidenceId: event.subject.evidenceId,
      criteriaReference: event.criteriaReference,
      decision: event.decision,
      provenance: event.provenance,
      ...(event.supersedesCertificationId === undefined
        ? {}
        : { supersedesCertificationId: event.supersedesCertificationId }),
    });
  }
  return commandFingerprint(event.to === "WITHDRAWN" ? "withdraw" : "invalidate", {
    commandId: event.commandId,
    certificationId: event.certificationId,
    provenance: event.provenance,
  });
}

function assertExactKeys(
  value: object,
  admitted: readonly string[],
  optional: readonly string[],
  label: string,
): void {
  const keys = Object.keys(value);
  if (keys.some((key) => !admitted.includes(key))
    || admitted.some((key) => !optional.includes(key) && !Object.prototype.hasOwnProperty.call(value, key))) {
    throw new TypeError(`${label} has an inconsistent structure.`);
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function recoveryFailure(message: string): BusinessCertificationError {
  return new BusinessCertificationError("BUSINESS_CERTIFICATION_RECOVERY_FAILED", message);
}
