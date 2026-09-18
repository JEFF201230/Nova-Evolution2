import { EvidenceDomainError } from "./errors.js";
import {
  BUSINESS_CERTIFICATION_AUTHORITY,
  type BusinessCertificationSnapshot,
  type ResolveCertificationReferenceResult,
} from "../business-certification/business-certification.types.js";
import type { EvidenceRepositoryJournal } from "./evidence-journal.js";
import {
  EvidenceId,
  assertText,
  freezeSource,
  sourceKey,
  type AdmissibleSourceReference,
  type BusinessEvidenceRecord,
  type CertificationReference,
  type EvidenceDomainEvent,
  type EvidenceLifecycle,
  type EvidenceProvenance,
  type EvidenceSourceResolver,
} from "./evidence-model.js";

export type RegisterBusinessEvidence = Readonly<{
  source: AdmissibleSourceReference;
  actor: string;
  idempotencyIdentity: string;
  originatingMissionReference?: string;
  certificationReference?: CertificationReference;
}>;

export type EvidenceTransition = Readonly<{
  evidenceId: EvidenceId;
  actor: string;
  at: Date;
  reason: string;
  idempotencyIdentity: string;
}>;

/** Read-only product boundary implemented by BusinessCertificationQueries. */
export interface BusinessCertificationReferenceQueries {
  resolveReference(reference: CertificationReference): ResolveCertificationReferenceResult;
}

export class EvidenceAuthority {
  constructor(
    private readonly sourceResolver: EvidenceSourceResolver,
    private readonly journal: EvidenceRepositoryJournal,
    private readonly now: () => Date = () => new Date(),
    private readonly certificationQueries?: BusinessCertificationReferenceQueries,
  ) {}

  register(command: RegisterBusinessEvidence): BusinessEvidenceRecord {
    assertText(command.actor, "actor");
    assertText(command.idempotencyIdentity, "idempotencyIdentity");
    const source = freezeSource(command.source);
    const records = rebuild(this.journal.read());
    const replay = findIdempotency(records, command.idempotencyIdentity);
    if (replay !== null) {
      if (replay.type !== "BusinessEvidenceRegistered" || replay.source === undefined
        || sourceKey(replay.source) !== sourceKey(source)
        || replay.actor !== command.actor
        || !sameCertification(replay.certificationReference, command.certificationReference)
        || replay.provenance?.originatingMissionReference !== command.originatingMissionReference) {
        throw conflict("Registration idempotency identity was reused divergently.");
      }
      return requiredRecord(records, EvidenceId.of(replay.evidenceId));
    }
    const existing = [...records.values()].find((record) => sourceKey(record.source) === sourceKey(source));
    if (existing !== undefined) {
      if (existing.provenance.actor !== command.actor
        || existing.provenance.originatingMissionReference !== command.originatingMissionReference
        || !sameCertification(existing.certificationReference ?? undefined, command.certificationReference)) {
        throw conflict("The immutable source occurrence is already registered with different Evidence metadata.");
      }
      return existing;
    }
    const resolved = this.sourceResolver.resolve(source);
    const occurredAt = iso(resolved.occurredAt, "occurredAt");
    const evidenceId = EvidenceId.fromSourceKey(sourceKey(source));
    const certificationReference = command.certificationReference === undefined
      ? undefined
      : this.requireAdmissibleCertification(command.certificationReference, evidenceId);
    const registeredAt = iso(this.now(), "registeredAt");
    const provenance: EvidenceProvenance = Object.freeze({
      producer: "EVIDENCE_AUTHORITY",
      sourceAuthority: "ACTIONS_AUTHORITY",
      actor: command.actor,
      occurredAt,
      registeredAt,
      ...(resolved.ownerProvidedFingerprint === undefined ? {} : { ownerProvidedFingerprint: resolved.ownerProvidedFingerprint }),
      ...(command.originatingMissionReference === undefined ? {} : { originatingMissionReference: command.originatingMissionReference }),
    });
    const event: EvidenceDomainEvent = Object.freeze({
      type: "BusinessEvidenceRegistered", evidenceId: evidenceId.value,
      idempotencyIdentity: command.idempotencyIdentity, producer: "EVIDENCE_AUTHORITY",
      actor: command.actor, at: registeredAt, source, provenance,
      ...(certificationReference === undefined ? {} : { certificationReference }),
    });
    this.journal.append(Object.freeze([event]));
    return requiredRecord(rebuild(this.journal.read()), evidenceId);
  }

  withdraw(command: EvidenceTransition): BusinessEvidenceRecord {
    return this.transition("BusinessEvidenceWithdrawn", "WITHDRAWN", command);
  }
  invalidate(command: EvidenceTransition): BusinessEvidenceRecord {
    return this.transition("BusinessEvidenceInvalidated", "INVALIDATED", command);
  }
  supersede(command: EvidenceTransition & Readonly<{ supersededBy: EvidenceId }>): BusinessEvidenceRecord {
    if (command.evidenceId.equals(command.supersededBy)) throw conflict("Evidence cannot supersede itself.");
    const records = rebuild(this.journal.read());
    requiredRecord(records, command.supersededBy);
    return this.transition("BusinessEvidenceSuperseded", "SUPERSEDED", command, command.supersededBy);
  }

  attachCertification(command: Omit<EvidenceTransition, "reason"> & Readonly<{ reference: CertificationReference }>): BusinessEvidenceRecord {
    return this.certificationEvent("CertificationReferenceAttached", command, command.reference);
  }
  detachCertification(command: Omit<EvidenceTransition, "reason">): BusinessEvidenceRecord {
    return this.certificationEvent("CertificationReferenceDetached", command);
  }

  readAll(): ReadonlyMap<string, BusinessEvidenceRecord> { return rebuild(this.journal.read()); }

  private transition(
    type: Extract<EvidenceDomainEvent["type"], "BusinessEvidenceWithdrawn" | "BusinessEvidenceInvalidated" | "BusinessEvidenceSuperseded">,
    _lifecycle: EvidenceLifecycle,
    command: EvidenceTransition,
    supersededBy?: EvidenceId,
  ): BusinessEvidenceRecord {
    assertText(command.actor, "actor"); assertText(command.reason, "reason"); assertText(command.idempotencyIdentity, "idempotencyIdentity");
    const records = rebuild(this.journal.read());
    const replay = findIdempotency(records, command.idempotencyIdentity);
    if (replay !== null) {
      if (replay.type !== type || replay.evidenceId !== command.evidenceId.value || replay.reason !== command.reason
        || replay.supersededBy !== supersededBy?.value) throw conflict("Lifecycle idempotency identity was reused divergently.");
      return requiredRecord(records, command.evidenceId);
    }
    const record = requiredRecord(records, command.evidenceId);
    if (record.lifecycle !== "ACTIVE") throw new EvidenceDomainError("EVIDENCE_TERMINAL", "A terminal Evidence cannot transition.");
    const event: EvidenceDomainEvent = Object.freeze({ type, evidenceId: command.evidenceId.value,
      idempotencyIdentity: command.idempotencyIdentity, producer: "EVIDENCE_AUTHORITY", actor: command.actor,
      at: iso(command.at, "transition at"), reason: command.reason,
      ...(supersededBy === undefined ? {} : { supersededBy: supersededBy.value }) });
    this.journal.append(Object.freeze([event]));
    return requiredRecord(rebuild(this.journal.read()), command.evidenceId);
  }

  private certificationEvent(
    type: "CertificationReferenceAttached" | "CertificationReferenceDetached",
    command: Omit<EvidenceTransition, "reason">,
    reference?: CertificationReference,
  ): BusinessEvidenceRecord {
    assertText(command.actor, "actor"); assertText(command.idempotencyIdentity, "idempotencyIdentity");
    const records = rebuild(this.journal.read());
    const replay = findIdempotency(records, command.idempotencyIdentity);
    if (replay !== null) {
      if (replay.type !== type || replay.evidenceId !== command.evidenceId.value
        || !sameCertification(replay.certificationReference, reference)) throw conflict("Certification idempotency identity was reused divergently.");
      return requiredRecord(records, command.evidenceId);
    }
    const record = requiredRecord(records, command.evidenceId);
    if (record.lifecycle !== "ACTIVE") throw new EvidenceDomainError("EVIDENCE_TERMINAL", "A terminal Evidence cannot be mutated.");
    const admittedReference = reference === undefined
      ? undefined
      : this.requireAdmissibleCertification(reference, command.evidenceId);
    const event: EvidenceDomainEvent = Object.freeze({ type, evidenceId: command.evidenceId.value,
      idempotencyIdentity: command.idempotencyIdentity, producer: "EVIDENCE_AUTHORITY", actor: command.actor,
      at: iso(command.at, "certification event at"),
      ...(admittedReference === undefined ? {} : { certificationReference: admittedReference }) });
    this.journal.append(Object.freeze([event]));
    return requiredRecord(rebuild(this.journal.read()), command.evidenceId);
  }

  private requireAdmissibleCertification(reference: CertificationReference, evidenceId: EvidenceId): CertificationReference {
    const canonical = freezeCertification(reference);
    if (canonical.authority !== BUSINESS_CERTIFICATION_AUTHORITY) {
      throw new EvidenceDomainError(
        "EVIDENCE_CERTIFICATION_UNRECOGNIZED_AUTHORITY",
        "Certification authority is not the canonical Business Certification authority.",
      );
    }
    if (this.certificationQueries === undefined) {
      throw new EvidenceDomainError(
        "EVIDENCE_CERTIFICATION_AUTHORITY_UNAVAILABLE",
        "Business Certification authority is unavailable.",
      );
    }
    let resolution: ResolveCertificationReferenceResult;
    try {
      resolution = this.certificationQueries.resolveReference(canonical);
    } catch (cause) {
      throw new EvidenceDomainError(
        "EVIDENCE_CERTIFICATION_AUTHORITY_UNAVAILABLE",
        "Business Certification authority is unavailable.",
        { cause },
      );
    }
    if (resolution?.status === "UNRECOGNIZED_AUTHORITY") {
      throw new EvidenceDomainError(
        "EVIDENCE_CERTIFICATION_UNRECOGNIZED_AUTHORITY",
        "Business Certification did not recognize the supplied authority.",
      );
    }
    if (resolution?.status === "NOT_FOUND") {
      throw new EvidenceDomainError(
        "EVIDENCE_CERTIFICATION_NOT_FOUND",
        "Business Certification did not resolve the supplied CertificationId.",
      );
    }
    if (resolution?.status === "AUTHORITY_UNAVAILABLE") {
      throw new EvidenceDomainError(
        "EVIDENCE_CERTIFICATION_AUTHORITY_UNAVAILABLE",
        "Business Certification authority is unavailable.",
      );
    }
    if (resolution?.status !== "FOUND" || !isCoherentSnapshot(resolution.snapshot, canonical)) {
      throw new EvidenceDomainError(
        "EVIDENCE_CERTIFICATION_RESOLUTION_INCONSISTENT",
        "Business Certification returned an inconsistent resolution.",
      );
    }
    if (resolution.snapshot.subject.kind !== "BUSINESS_EVIDENCE"
      || resolution.snapshot.subject.evidenceId !== evidenceId.value) {
      throw new EvidenceDomainError(
        "EVIDENCE_CERTIFICATION_SUBJECT_MISMATCH",
        "Certification subject does not identify the Evidence receiving the reference.",
      );
    }
    if (resolution.snapshot.decision !== "CERTIFIED" || resolution.snapshot.currentState !== "CERTIFIED") {
      throw new EvidenceDomainError(
        "EVIDENCE_CERTIFICATION_STATE_NOT_ADMISSIBLE",
        `Business Certification state ${resolution.snapshot.currentState} is not admissible.`,
      );
    }
    return canonical;
  }
}

function rebuild(events: readonly EvidenceDomainEvent[]): ReadonlyMap<string, BusinessEvidenceRecord> {
  const records = new Map<string, BusinessEvidenceRecord>();
  const idempotency = new Set<string>();
  for (const raw of events) {
    const event = freezeEvent(raw);
    if (event.producer !== "EVIDENCE_AUTHORITY" || idempotency.has(event.idempotencyIdentity)) throw journalCorrupt("Invalid producer or duplicate idempotency identity.");
    idempotency.add(event.idempotencyIdentity);
    if (event.type === "BusinessEvidenceRegistered") {
      if (records.has(event.evidenceId) || event.source === undefined || event.provenance === undefined) throw journalCorrupt("Invalid registration history.");
      if (EvidenceId.fromSourceKey(sourceKey(event.source)).value !== event.evidenceId
        || [...records.values()].some((record) => sourceKey(record.source) === sourceKey(event.source!))) throw journalCorrupt("Evidence/source identity is not unique.");
      records.set(event.evidenceId, Object.freeze({ evidenceId: EvidenceId.of(event.evidenceId), source: freezeSource(event.source),
        provenance: Object.freeze({ ...event.provenance }), lifecycle: "ACTIVE",
        certificationReference: event.certificationReference === undefined ? null : freezeCertification(event.certificationReference),
        history: Object.freeze([event]) }));
      continue;
    }
    const record = records.get(event.evidenceId);
    if (record === undefined || record.lifecycle !== "ACTIVE") throw journalCorrupt("History mutates an absent or terminal Evidence.");
    let lifecycle: EvidenceLifecycle = "ACTIVE";
    let certificationReference = record.certificationReference;
    if (event.type === "BusinessEvidenceWithdrawn") lifecycle = "WITHDRAWN";
    else if (event.type === "BusinessEvidenceInvalidated") lifecycle = "INVALIDATED";
    else if (event.type === "BusinessEvidenceSuperseded") lifecycle = "SUPERSEDED";
    else if (event.type === "CertificationReferenceAttached") {
      if (event.certificationReference === undefined) throw journalCorrupt("Attached Certification reference is missing.");
      certificationReference = freezeCertification(event.certificationReference);
    } else certificationReference = null;
    records.set(event.evidenceId, Object.freeze({ ...record, lifecycle, certificationReference,
      history: Object.freeze([...record.history, event]) }));
  }
  return records;
}

function findIdempotency(records: ReadonlyMap<string, BusinessEvidenceRecord>, identity: string): EvidenceDomainEvent | null {
  for (const record of records.values()) for (const event of record.history) if (event.idempotencyIdentity === identity) return event;
  return null;
}
function requiredRecord(records: ReadonlyMap<string, BusinessEvidenceRecord>, id: EvidenceId): BusinessEvidenceRecord {
  const record = records.get(id.value);
  if (record === undefined) throw new EvidenceDomainError("EVIDENCE_NOT_FOUND", `Evidence ${id.value} is absent.`);
  return record;
}
function freezeCertification(value: CertificationReference): CertificationReference {
  if (typeof value !== "object" || value === null || Array.isArray(value)
    || Object.keys(value).length !== 2
    || !Object.prototype.hasOwnProperty.call(value, "authority")
    || !Object.prototype.hasOwnProperty.call(value, "reference")) {
    throw new EvidenceDomainError(
      "EVIDENCE_CERTIFICATION_RESOLUTION_INCONSISTENT",
      "CertificationReference must contain exactly authority and reference.",
    );
  }
  if (typeof value.authority !== "string" || value.authority !== BUSINESS_CERTIFICATION_AUTHORITY) {
    throw new EvidenceDomainError(
      "EVIDENCE_CERTIFICATION_UNRECOGNIZED_AUTHORITY",
      "Certification authority is not the canonical Business Certification authority.",
    );
  }
  assertText(value.reference, "Certification reference");
  return Object.freeze({ authority: value.authority, reference: value.reference });
}

function isCoherentSnapshot(snapshot: BusinessCertificationSnapshot, reference: CertificationReference): boolean {
  if (typeof snapshot !== "object" || snapshot === null || Array.isArray(snapshot)) return false;
  const keys = Object.keys(snapshot);
  const admitted = [
    "certificationId", "authority", "subject", "criteriaReference", "decision", "currentState",
    "decidedAt", "provenance", "supersedesCertificationId",
  ];
  if (keys.some((key) => !admitted.includes(key))
    || ["certificationId", "authority", "subject", "criteriaReference", "decision", "currentState", "decidedAt", "provenance"]
      .some((key) => !Object.prototype.hasOwnProperty.call(snapshot, key))) return false;
  if (snapshot.certificationId !== reference.reference || snapshot.authority !== BUSINESS_CERTIFICATION_AUTHORITY) return false;
  if (typeof snapshot.subject !== "object" || snapshot.subject === null || Array.isArray(snapshot.subject)
    || Object.keys(snapshot.subject).length !== 2
    || !Object.prototype.hasOwnProperty.call(snapshot.subject, "kind")
    || !Object.prototype.hasOwnProperty.call(snapshot.subject, "evidenceId")
    || typeof snapshot.subject.evidenceId !== "string" || snapshot.subject.evidenceId.length === 0) return false;
  if (snapshot.decision !== "CERTIFIED" && snapshot.decision !== "REJECTED") return false;
  if (!["CERTIFIED", "REJECTED", "WITHDRAWN", "INVALIDATED"].includes(snapshot.currentState)) return false;
  if (!isCanonicalText(snapshot.criteriaReference) || !isCanonicalIso(snapshot.decidedAt)) return false;
  if (typeof snapshot.provenance !== "object" || snapshot.provenance === null
    || Object.keys(snapshot.provenance).length !== 3
    || !isCanonicalText(snapshot.provenance.actor)
    || !isCanonicalText(snapshot.provenance.authority)
    || !isCanonicalText(snapshot.provenance.causationIdentity)) return false;
  return snapshot.supersedesCertificationId === undefined || isCanonicalText(snapshot.supersedesCertificationId);
}

function isCanonicalText(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.trim() === value;
}

function isCanonicalIso(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { return new Date(value).toISOString() === value; } catch { return false; }
}
function sameCertification(left?: CertificationReference, right?: CertificationReference): boolean {
  return left?.authority === right?.authority && left?.reference === right?.reference;
}
function freezeEvent(raw: EvidenceDomainEvent): EvidenceDomainEvent {
  return Object.freeze({
    ...raw,
    ...(raw.source === undefined ? {} : { source: freezeSource(raw.source) }),
    ...(raw.provenance === undefined ? {} : { provenance: Object.freeze({ ...raw.provenance }) }),
    ...(raw.certificationReference === undefined ? {} : { certificationReference: freezeCertification(raw.certificationReference) }),
  });
}
function iso(value: Date, name: string): string {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) throw conflict(`${name} must be a valid date.`);
  return value.toISOString();
}
function conflict(message: string): EvidenceDomainError { return new EvidenceDomainError("EVIDENCE_REGISTRATION_CONFLICT", message); }
function journalCorrupt(message: string): EvidenceDomainError { return new EvidenceDomainError("EVIDENCE_JOURNAL_CORRUPT", message); }
