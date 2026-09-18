import { ActionsInternalQueries } from "../actions/actions-internal-access.js";
import { ActionId, ActionReference, WorkReference } from "../actions/action.value-objects.js";
import { EvidenceDomainError } from "./errors.js";
import {
  freezeSource,
  validateSource,
  type AdmissibleSourceReference,
  type EvidenceSourceResolver,
  type ResolvedSourceOccurrence,
} from "./evidence-model.js";

export class ActionsResultRecordedSourceResolver implements EvidenceSourceResolver {
  constructor(private readonly queries: ActionsInternalQueries) { Object.freeze(this); }

  resolve(source: AdmissibleSourceReference): ResolvedSourceOccurrence {
    validateSource(source);
    const reference = ActionReference.of(
      WorkReference.of(source.projectIdentity, source.workIdentity),
      ActionId.of(source.actionId),
    );
    let history;
    try {
      history = this.queries.getActionHistory(reference);
    } catch (error) {
      throw new EvidenceDomainError(
        "EVIDENCE_SOURCE_AUTHORITY_UNAVAILABLE",
        "The ACTIONS history authority is unavailable.",
        { cause: error },
      );
    }
    if (history === null) {
      throw new EvidenceDomainError("EVIDENCE_SOURCE_NOT_FOUND", "The ACTIONS Action occurrence does not exist.");
    }
    const matches = history.value.filter((event) =>
      event.type === "ResultRecorded"
      && event.workReference.key === reference.workReference.key
      && event.actionId.value === source.actionId
      && event.revision === source.actionsRevision
      && event.payload.result.id.value === source.resultId);
    if (matches.length === 0) {
      throw new EvidenceDomainError("EVIDENCE_SOURCE_NOT_FOUND", "The exact ACTIONS ResultRecorded occurrence does not exist.");
    }
    if (matches.length !== 1) {
      throw new EvidenceDomainError("EVIDENCE_SOURCE_AMBIGUOUS", "The ACTIONS ResultRecorded occurrence is ambiguous.");
    }
    const occurrence = matches[0];
    if (occurrence === undefined || occurrence.type !== "ResultRecorded") {
      throw new EvidenceDomainError("EVIDENCE_SOURCE_NOT_FOUND", "The exact ACTIONS occurrence could not be resolved.");
    }
    return Object.freeze({
      source: freezeSource(source),
      occurredAt: occurrence.payload.result.provenance.effectiveAt,
    });
  }
}
