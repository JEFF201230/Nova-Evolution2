export const WORK_PEOPLE_SOURCE_DOMAIN = "PEOPLE" as const;

export interface WorkPeopleReference {
  readonly projectId: string;
  readonly workId: string;
}

export interface WorkPeopleParticipant {
  readonly businessPersonId: string;
  readonly workAssignmentId: string;
}

export interface WorkPeopleQualification {
  readonly sourceDomain: typeof WORK_PEOPLE_SOURCE_DOMAIN;
  readonly aggregateRevision: number;
  readonly lastEventSequence: number;
  readonly qualifiedAt: string;
  readonly provenance: Readonly<{
    authority: string;
    businessCause: string;
    effectiveAt: string;
  }>;
}

export type WorkPeopleUnavailable = WorkPeopleReference & Readonly<{
  status: "PEOPLE_UNAVAILABLE";
  sourceDomain: typeof WORK_PEOPLE_SOURCE_DOMAIN;
  reason: "PEOPLE_READ_UNAVAILABLE";
}>;

export type WorkPeopleAbsent = WorkPeopleReference & Readonly<{
  status: "WORK_PEOPLE_ABSENT";
  sourceDomain: typeof WORK_PEOPLE_SOURCE_DOMAIN;
}>;

export type WorkPeopleWithoutActiveParticipants = WorkPeopleReference & Readonly<{
  status: "NO_ACTIVE_PARTICIPANTS";
  participants: readonly WorkPeopleParticipant[];
  qualification: WorkPeopleQualification;
}>;

export type WorkPeopleWithParticipants = WorkPeopleReference & Readonly<{
  status: "PARTICIPANTS_AVAILABLE";
  participants: readonly WorkPeopleParticipant[];
  qualification: WorkPeopleQualification;
}>;

export type WorkPeopleReadResult =
  | WorkPeopleUnavailable
  | WorkPeopleAbsent
  | WorkPeopleWithoutActiveParticipants
  | WorkPeopleWithParticipants;
