import type {
  PeopleQueryService,
  TemporalPeopleQueryQualification,
} from "../../domain/people/people-query-service.js";
import { WorkReference } from "../../domain/people/people.value-objects.js";
import type { WorkAssignment } from "../../domain/people/work-assignment.entity.js";
import {
  WORK_PEOPLE_SOURCE_DOMAIN,
  type WorkPeopleParticipant,
  type WorkPeopleQualification,
  type WorkPeopleReadResult,
  type WorkPeopleReference,
} from "./work-people.types.js";

export type WorkPeopleReadSource = Pick<
  PeopleQueryService,
  "GetWorkParticipants"
>;

/**
 * Internal, read-only Work -> PEOPLE boundary.
 *
 * Temporal participation remains qualified exclusively by PeopleQueryService.
 * This query owns no PEOPLE rule, command, event, cache or persistence.
 */
export class WorkPeopleQuery {
  constructor(private readonly people: WorkPeopleReadSource) {}

  get(
    work: WorkPeopleReference,
    qualifiedAt: Date,
  ): WorkPeopleReadResult {
    const instant = validInstant(qualifiedAt);
    const workReference = WorkReference.of(work.projectId, work.workId);
    const reference = Object.freeze({
      projectId: work.projectId,
      workId: work.workId,
    });

    let result: ReturnType<WorkPeopleReadSource["GetWorkParticipants"]>;
    try {
      result = this.people.GetWorkParticipants(workReference, instant);
    } catch {
      return Object.freeze({
        ...reference,
        status: "PEOPLE_UNAVAILABLE",
        sourceDomain: WORK_PEOPLE_SOURCE_DOMAIN,
        reason: "PEOPLE_READ_UNAVAILABLE",
      });
    }

    if (result.status === "AGGREGATE_ABSENT") {
      return Object.freeze({
        ...reference,
        status: "WORK_PEOPLE_ABSENT",
        sourceDomain: WORK_PEOPLE_SOURCE_DOMAIN,
      });
    }

    const qualification = qualify(result.qualification);
    if (result.assignments.length === 0) {
      return Object.freeze({
        ...reference,
        status: "NO_ACTIVE_PARTICIPANTS",
        participants: Object.freeze([]),
        qualification,
      });
    }

    return Object.freeze({
      ...reference,
      status: "PARTICIPANTS_AVAILABLE",
      participants: Object.freeze(result.assignments.map(participant)),
      qualification,
    });
  }
}

function participant(assignment: WorkAssignment): WorkPeopleParticipant {
  return Object.freeze({
    businessPersonId: assignment.personId.value,
    workAssignmentId: assignment.id.value,
  });
}

function qualify(
  qualification: TemporalPeopleQueryQualification,
): WorkPeopleQualification {
  return Object.freeze({
    sourceDomain: WORK_PEOPLE_SOURCE_DOMAIN,
    aggregateRevision: qualification.aggregateRevision,
    lastEventSequence: qualification.lastEventSequence,
    qualifiedAt: qualification.qualifiedAt.toISOString(),
    provenance: Object.freeze({
      authority: qualification.provenance.authority,
      businessCause: qualification.provenance.businessCause,
      effectiveAt: qualification.provenance.effectiveAt.toISOString(),
    }),
  });
}

function validInstant(value: Date): Date {
  const epochMs = value.getTime();
  if (!Number.isFinite(epochMs)) {
    throw new RangeError("qualifiedAt must be a valid Date.");
  }
  return new Date(epochMs);
}
