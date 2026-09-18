import { BusinessCertificationError } from "./business-certification.errors.js";
import type { BusinessCertificationEvent } from "./business-certification.events.js";
import {
  BUSINESS_CERTIFICATION_AUTHORITY,
  type BusinessCertificationHistoryEvent,
  type BusinessCertificationSnapshot,
  type BusinessCertificationState,
  type CertificationId,
} from "./business-certification.types.js";

/** Aggregate root rebuilt exclusively from the owner's append-only facts. */
export class BusinessCertificationRecord {
  readonly #certificationId: CertificationId;
  readonly #subject: BusinessCertificationSnapshot["subject"];
  readonly #criteriaReference: string;
  readonly #decision: BusinessCertificationSnapshot["decision"];
  readonly #decidedAt: string;
  readonly #provenance: BusinessCertificationSnapshot["provenance"];
  readonly #supersedesCertificationId: CertificationId | undefined;
  readonly #history: BusinessCertificationHistoryEvent[];
  #currentState: BusinessCertificationState;

  private constructor(event: Extract<BusinessCertificationEvent, { type: "DECISION_RECORDED" }>) {
    this.#certificationId = event.certificationId;
    this.#subject = Object.freeze({ ...event.subject });
    this.#criteriaReference = event.criteriaReference;
    this.#decision = event.decision;
    this.#currentState = event.decision;
    this.#decidedAt = event.decidedAt;
    this.#provenance = Object.freeze({ ...event.provenance });
    this.#supersedesCertificationId = event.supersedesCertificationId;
    this.#history = [historyEvent(event)];
  }

  static fromDecision(event: Extract<BusinessCertificationEvent, { type: "DECISION_RECORDED" }>): BusinessCertificationRecord {
    return new BusinessCertificationRecord(event);
  }

  apply(event: Extract<BusinessCertificationEvent, { type: "STATE_CHANGED" }>): void {
    if (event.certificationId !== this.#certificationId || event.from !== this.#currentState) {
      throw recoveryFailure("Lifecycle event does not continue the aggregate's current state.");
    }
    if (!isAllowedTransition(event.from, event.to)) {
      throw recoveryFailure(`Lifecycle transition ${event.from} -> ${event.to} is not admitted.`);
    }
    this.#currentState = event.to;
    this.#history.push(historyEvent(event));
  }

  get currentState(): BusinessCertificationState {
    return this.#currentState;
  }

  get evidenceId(): string {
    return this.#subject.evidenceId;
  }

  snapshot(): BusinessCertificationSnapshot {
    const base = {
      certificationId: this.#certificationId,
      authority: BUSINESS_CERTIFICATION_AUTHORITY,
      subject: this.#subject,
      criteriaReference: this.#criteriaReference,
      decision: this.#decision,
      currentState: this.#currentState,
      decidedAt: this.#decidedAt,
      provenance: this.#provenance,
    };
    return Object.freeze(this.#supersedesCertificationId === undefined
      ? base
      : { ...base, supersedesCertificationId: this.#supersedesCertificationId });
  }

  history(): readonly BusinessCertificationHistoryEvent[] {
    return Object.freeze([...this.#history]);
  }
}

export function isAllowedTransition(
  from: BusinessCertificationState,
  to: "WITHDRAWN" | "INVALIDATED",
): boolean {
  return (from === "CERTIFIED" && (to === "WITHDRAWN" || to === "INVALIDATED"))
    || (from === "REJECTED" && to === "INVALIDATED");
}

function historyEvent(event: BusinessCertificationEvent): BusinessCertificationHistoryEvent {
  if (event.type === "DECISION_RECORDED") {
    return Object.freeze({
      type: event.type,
      commandId: event.commandId,
      certificationId: event.certificationId,
      decision: event.decision,
      state: event.decision,
      occurredAt: event.decidedAt,
      provenance: Object.freeze({ ...event.provenance }),
    });
  }
  return Object.freeze({
    type: event.type,
    commandId: event.commandId,
    certificationId: event.certificationId,
    from: event.from,
    to: event.to,
    occurredAt: event.occurredAt,
    provenance: Object.freeze({ ...event.provenance }),
  });
}

function recoveryFailure(message: string): BusinessCertificationError {
  return new BusinessCertificationError("BUSINESS_CERTIFICATION_RECOVERY_FAILED", message);
}
