import { project } from "./business-certification-authority.js";
import { BusinessCertificationJournal } from "./business-certification.journal.js";
import {
  BUSINESS_CERTIFICATION_AUTHORITY,
  type CertificationReference,
  type ResolveCertificationReferenceResult,
} from "./business-certification.types.js";

/** Read-only owner boundary. Every recognized lookup is resolved from authoritative durable facts. */
export class BusinessCertificationQueries {
  readonly #journal: BusinessCertificationJournal;

  constructor(journal: BusinessCertificationJournal) {
    this.#journal = journal;
  }

  resolveReference(reference: CertificationReference): ResolveCertificationReferenceResult {
    if (typeof reference !== "object" || reference === null || reference.authority !== BUSINESS_CERTIFICATION_AUTHORITY) {
      return Object.freeze({ status: "UNRECOGNIZED_AUTHORITY" });
    }
    if (typeof reference.reference !== "string" || reference.reference.length === 0) {
      return Object.freeze({ status: "NOT_FOUND" });
    }
    try {
      return this.#journal.read((events) => {
        const record = project(events).records.get(reference.reference);
        return record === undefined
          ? Object.freeze({ status: "NOT_FOUND" as const })
          : Object.freeze({ status: "FOUND" as const, snapshot: record.snapshot() });
      });
    } catch {
      return Object.freeze({ status: "AUTHORITY_UNAVAILABLE" });
    }
  }
}
