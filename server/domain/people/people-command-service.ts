import type { BusinessPerson } from "./business-person.aggregate.js";
import type { PeopleAuthorityCommand } from "./people-authority.commands.js";
import { PeopleAuthority, type PeopleAuthorityResult } from "./people-authority.js";
import { PeopleDomainError } from "./people.errors.js";
import { createPeopleRequestFingerprint } from "./people-persistence-aggregate-store.js";
import type {
  CommandEnvelope,
  CommitResult,
  PeoplePersistencePorts,
} from "./people-persistence-ports.js";
import { PeoplePersistenceConflictError } from "./people-persistence-sqlite-adapter.js";
import type { WorkReference } from "./people.value-objects.js";
import type { WorkPeople } from "./work-people.aggregate.js";

export type PeopleCommandExecutionContext = Readonly<{
  expectedRevision: number;
  correlationId: string;
  workReference?: WorkReference;
}>;

export type PeopleCommandResult =
  | CommitResult<BusinessPerson>
  | CommitResult<WorkPeople>;

/**
 * Internal PEOPLE write path. Business decisions remain exclusively in
 * PeopleAuthority; this component only loads, routes and durably commits them.
 */
export class PeopleCommandService {
  constructor(
    private readonly authority: PeopleAuthority,
    private readonly persistence: PeoplePersistencePorts,
  ) {}

  execute(
    command: PeopleAuthorityCommand,
    context: PeopleCommandExecutionContext,
  ): PeopleCommandResult {
    assertExecutionContext(context);

    if (command.kind === "CREATE_BUSINESS_PERSON") {
      const current = this.persistence.businessPersons.load(command.personId.value);
      const commandEnvelope = envelope(command, context, command.personId.value);
      if (
        current !== null
        && hasCausation(
          (afterSequence) => this.persistence.businessPersons.readHistory(
            command.personId.value,
            afterSequence,
          ),
          command.provenance.businessCause,
        )
      ) {
        return this.persistence.businessPersons.commit(
          context.expectedRevision,
          { aggregate: current.aggregate, events: [] },
          commandEnvelope,
        );
      }
      const change = this.invoke(
        current?.revision ?? 0,
        context.expectedRevision,
        () => this.authority.createBusinessPerson(current?.aggregate ?? null, command),
      );
      return this.persistence.businessPersons.commit(
        context.expectedRevision,
        change,
        commandEnvelope,
      );
    }

    const workReference = resolveWorkReference(command, context.workReference);
    const current = this.persistence.workPeople.load(workReference);
    const commandEnvelope = envelope(command, context, workReference);
    if (
      current !== null
      && hasCausation(
        (afterSequence) => this.persistence.workPeople.readHistory(
          workReference,
          afterSequence,
        ),
        command.provenance.businessCause,
      )
    ) {
      return this.persistence.workPeople.commit(
        context.expectedRevision,
        { aggregate: current.aggregate, events: [] },
        commandEnvelope,
      );
    }
    if (current === null) {
      if (context.expectedRevision !== 0) {
        throw new PeoplePersistenceConflictError(context.expectedRevision, 0);
      }
      if (command.kind !== "ASSIGN_PERSON_TO_WORK") {
        throw new PeopleDomainError(
          "WORK_REFERENCE_NOT_FOUND",
          "The targeted Work People aggregate does not exist.",
        );
      }
    }

    const change = this.invoke(
      current?.revision ?? 0,
      context.expectedRevision,
      () => this.routeWorkCommand(command, current?.aggregate ?? null),
    );
    return this.persistence.workPeople.commit(
      context.expectedRevision,
      change,
      commandEnvelope,
    );
  }

  private routeWorkCommand(
    command: Exclude<PeopleAuthorityCommand, { kind: "CREATE_BUSINESS_PERSON" }>,
    current: WorkPeople | null,
  ): PeopleAuthorityResult<WorkPeople> {
    if (command.kind === "ASSIGN_PERSON_TO_WORK") {
      const person = this.requireBusinessPerson(command.person.id.value);
      return this.authority.assignPersonToWork(current, { ...command, person });
    }

    if (current === null) {
      throw new PeopleDomainError(
        "WORK_REFERENCE_NOT_FOUND",
        "The targeted Work People aggregate does not exist.",
      );
    }

    switch (command.kind) {
      case "REMOVE_PERSON_FROM_WORK":
        return this.authority.removePersonFromWork(current, command);
      case "ASSIGN_BUSINESS_ROLE":
        return this.authority.assignBusinessRole(current, command);
      case "REVOKE_BUSINESS_ROLE":
        return this.authority.revokeBusinessRole(current, command);
      case "CHANGE_WORK_OWNER": {
        const nextOwner = command.nextOwner === null
          ? null
          : this.requireBusinessPerson(command.nextOwner.id.value);
        return this.authority.changeWorkOwner(current, { ...command, nextOwner });
      }
      case "ASSIGN_APPROVER":
        return this.authority.assignApprover(current, command);
      case "REPLACE_ASSIGNED_PERSON": {
        const replacementPerson = this.requireBusinessPerson(
          command.replacementPerson.id.value,
        );
        return this.authority.replaceAssignedPerson(current, {
          ...command,
          replacementPerson,
        });
      }
      case "SUSPEND_WORK_ASSIGNMENT":
        return this.authority.suspendWorkAssignment(current, command);
      case "RESUME_WORK_ASSIGNMENT":
        return this.authority.resumeWorkAssignment(current, command);
    }
  }

  private requireBusinessPerson(personId: string): BusinessPerson {
    const persisted = this.persistence.businessPersons.load(personId);
    if (persisted === null) {
      throw new PeopleDomainError(
        "BUSINESS_PERSON_NOT_FOUND",
        `${personId} is not recognized by PEOPLE.`,
      );
    }
    return persisted.aggregate;
  }

  private invoke<Aggregate>(
    actualRevision: number,
    expectedRevision: number,
    operation: () => PeopleAuthorityResult<Aggregate>,
  ): PeopleAuthorityResult<Aggregate> {
    try {
      return operation();
    } catch (error) {
      if (actualRevision !== expectedRevision) {
        throw new PeoplePersistenceConflictError(expectedRevision, actualRevision);
      }
      throw error;
    }
  }
}

function resolveWorkReference(
  command: Exclude<PeopleAuthorityCommand, { kind: "CREATE_BUSINESS_PERSON" }>,
  supplied: WorkReference | undefined,
): WorkReference {
  if (command.kind === "ASSIGN_PERSON_TO_WORK") {
    if (supplied !== undefined && !supplied.equals(command.workReference)) {
      throw new PeopleDomainError(
        "WORK_REFERENCE_NOT_FOUND",
        "The execution target differs from the canonical command Work reference.",
      );
    }
    return command.workReference;
  }
  if (supplied === undefined) {
    throw new PeopleDomainError(
      "WORK_REFERENCE_NOT_FOUND",
      "A Work reference is required to route this PEOPLE command.",
    );
  }
  return supplied;
}

function envelope(
  command: PeopleAuthorityCommand,
  context: PeopleCommandExecutionContext,
  target: string | WorkReference,
): CommandEnvelope {
  return Object.freeze({
    commandType: command.kind,
    causationId: command.provenance.businessCause,
    correlationId: context.correlationId,
    requestFingerprint: createPeopleRequestFingerprint({ command, target }),
    fingerprintVersion: 1,
    provenance: command.provenance,
    occurredAt: command.provenance.effectiveAt,
  });
}

function assertExecutionContext(context: PeopleCommandExecutionContext): void {
  if (!Number.isSafeInteger(context.expectedRevision) || context.expectedRevision < 0) {
    throw new RangeError("expectedRevision must be a non-negative integer.");
  }
  if (context.correlationId.length === 0 || context.correlationId !== context.correlationId.trim()) {
    throw new TypeError("correlationId must be canonical.");
  }
}

function hasCausation(
  read: (afterSequence: number) => Readonly<{
    events: readonly Readonly<{ causationId: string }>[];
    toSequence: number;
    hasMore: boolean;
  }>,
  causationId: string,
): boolean {
  let afterSequence = 0;
  do {
    const slice = read(afterSequence);
    if (slice.events.some((event) => event.causationId === causationId)) return true;
    if (!slice.hasMore) return false;
    afterSequence = slice.toSequence;
  } while (true);
}
