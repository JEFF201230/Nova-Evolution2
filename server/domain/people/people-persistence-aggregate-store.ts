import type { DatabaseSync } from "node:sqlite";
import { BusinessPerson } from "./business-person.aggregate.js";
import { WorkPeople } from "./work-people.aggregate.js";
import { peopleFoundationAccess } from "./people-foundation-access.js";
import {
  createPeopleSQLitePersistence,
  PeoplePersistenceConflictError,
} from "./people-persistence-sqlite-adapter.js";
import type { PeoplePersistenceContext } from "./people-persistence-ports.js";

export class PeopleAggregatePersistenceStore {
  private readonly ports;

  constructor(
    private readonly database: DatabaseSync,
    now?: () => string,
  ) {
    this.ports = createPeopleSQLitePersistence(database, now);
  }

  persistBusinessPerson(
    person: BusinessPerson,
    expectedRevision: number,
    context: PeoplePersistenceContext,
  ): number {
    return this.ports.transaction.run(() => {
      const saved = this.ports.aggregates.save(expectedRevision, {
        aggregateType: "BUSINESS_PERSON",
        aggregateId: person.id.value,
        revision: expectedRevision,
        payload: {
          status: "ACTIVE",
          recognizedAt: person.recognitionProvenance.effectiveAt.toISOString(),
          provenance: serializeProvenance(person.recognitionProvenance),
        },
      }, context);
      return saved.snapshot.revision;
    });
  }

  persistWorkPeople(
    aggregate: WorkPeople,
    expectedRevision: number,
    context: PeoplePersistenceContext,
  ): number {
    return this.ports.transaction.run(() => {
      const workReference = encodeWorkReference(aggregate);
      const saved = this.ports.aggregates.save(expectedRevision, {
        aggregateType: "WORK_PEOPLE",
        aggregateId: workReference,
        revision: expectedRevision,
        payload: {
          lifecycleStatus: "ACTIVE",
          provenance: serializeProvenance(aggregate.provenance),
        },
      }, context);
      this.database.prepare("DELETE FROM people_role_assignment WHERE work_assignment_id IN (SELECT work_assignment_id FROM people_work_assignment WHERE work_reference = ?)").run(workReference);
      this.database.prepare("DELETE FROM people_work_assignment WHERE work_reference = ?").run(workReference);
      for (const assignment of aggregate.assignments) {
        const period = assignment.period;
        this.database.prepare(
          `INSERT INTO people_work_assignment
            (work_assignment_id, work_reference, business_person_id, status, effective_from, effective_to, provenance_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).run(
          assignment.id.value,
          workReference,
          assignment.personId.value,
          assignment.status.name,
          period.effectiveFrom.toISOString(),
          period.effectiveUntil?.toISOString() ?? null,
          JSON.stringify(assignment.provenanceTrail.map(serializeProvenance)),
        );
        for (const role of assignment.roleAssignments) {
          for (const rolePeriod of role.periods) {
            this.database.prepare(
              `INSERT INTO people_role_assignment
                (role_assignment_id, work_assignment_id, business_role, status, effective_from, effective_to, provenance_json)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ).run(
              `${assignment.id.value}:${role.role.name}:${rolePeriod.effectiveFrom.toISOString()}`,
              assignment.id.value,
              role.role.name,
              rolePeriod.effectiveUntil === null ? "ACTIVE" : "INACTIVE",
              rolePeriod.effectiveFrom.toISOString(),
              rolePeriod.effectiveUntil?.toISOString() ?? null,
              JSON.stringify(role.provenanceTrail.map(serializeProvenance)),
            );
          }
        }
      }
      return saved.snapshot.revision;
    });
  }

  static isConflict(error: unknown): boolean {
    return error instanceof PeoplePersistenceConflictError;
  }
}

function encodeWorkReference(aggregate: WorkPeople): string {
  return `${aggregate.workReference.projectIdentity}::${aggregate.workReference.workIdentity}`;
}

function serializeProvenance(provenance: { authority: string; businessCause: string; effectiveAt: Date }): Record<string, string> {
  return {
    authority: provenance.authority,
    businessCause: provenance.businessCause,
    effectiveAt: provenance.effectiveAt.toISOString(),
  };
}

export { peopleFoundationAccess };

