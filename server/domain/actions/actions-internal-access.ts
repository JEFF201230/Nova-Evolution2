import type { Action } from "./action.aggregate.js";
import type { ActionsCommand } from "./action-authority.commands.js";
import type { ActionsDomainEvent } from "./action-authority.events.js";
import type {
  ActionDependency,
  ActionResult,
  Activity,
  Execution,
} from "./action.entities.js";
import {
  ActionsAuthority,
  type ActionsAdmissionPolicy,
  type ActionsAuthorityReadRecord,
  type ActionsAuthorityReceipt,
} from "./actions-authority.js";
import type { ActionsJournal } from "./actions-journal.js";
import {
  assertActionReference,
  assertWorkReference,
  type ActionReference,
  type WorkReference,
} from "./action.value-objects.js";

export type QualifiedAction<T> = Readonly<{
  actionReference: ActionReference;
  revision: number;
  graphRevision: number;
  value: T;
}>;

export type CurrentAction = Readonly<{
  action: Action;
  revision: number;
  graphRevision: number;
}>;

/** Internal command boundary. It deliberately owns no mutation rule or persistence primitive. */
export class ActionsInternalCommands {
  constructor(private readonly authority: ActionsAuthority) {
    Object.freeze(this);
  }

  execute(command: ActionsCommand): ActionsAuthorityReceipt {
    return this.authority.accept(command);
  }
}

/** Internal query boundary over the canonical or canonically rebuilt Authority state. */
export class ActionsInternalQueries {
  constructor(private readonly authority: ActionsAuthority) {
    Object.freeze(this);
  }

  getAction(reference: ActionReference): CurrentAction | null {
    const selected = this.find(reference);
    return selected === null ? null : current(selected.record, selected.graphRevision);
  }

  listActionsByWork(workReference: WorkReference): readonly CurrentAction[] {
    assertWorkReference(workReference);
    const state = this.authority.readCanonicalState();
    return Object.freeze(state.actions
      .filter((record) => record.action.reference.workReference.equals(workReference))
      .sort((left, right) => left.action.reference.key.localeCompare(right.action.reference.key))
      .map((record) => current(record, state.graphRevision)));
  }

  getActionHistory(reference: ActionReference): QualifiedAction<readonly ActionsDomainEvent[]> | null {
    return this.select(reference, (record) => record.events);
  }

  getActionActivities(reference: ActionReference): QualifiedAction<readonly Activity[]> | null {
    return this.select(reference, (record) => record.action.activities);
  }

  getActionExecutions(reference: ActionReference): QualifiedAction<readonly Execution[]> | null {
    return this.select(reference, (record) => record.action.executions);
  }

  getActionResult(reference: ActionReference): QualifiedAction<ActionResult | null> | null {
    return this.select(reference, (record) => record.action.currentResult);
  }

  getActionDependencies(reference: ActionReference): QualifiedAction<readonly ActionDependency[]> | null {
    return this.select(reference, (record) => record.action.dependencies);
  }

  private select<T>(
    reference: ActionReference,
    value: (record: ActionsAuthorityReadRecord) => T,
  ): QualifiedAction<T> | null {
    const selected = this.find(reference);
    if (selected === null) return null;
    return Object.freeze({
      actionReference: selected.record.action.reference,
      revision: selected.record.revision,
      graphRevision: selected.graphRevision,
      value: value(selected.record),
    });
  }

  private find(reference: ActionReference): Readonly<{
    record: ActionsAuthorityReadRecord;
    graphRevision: number;
  }> | null {
    assertActionReference(reference);
    const state = this.authority.readCanonicalState();
    const record = state.actions.find((candidate) => candidate.action.reference.equals(reference));
    return record === undefined ? null : Object.freeze({ record, graphRevision: state.graphRevision });
  }
}

/** Shared internal application boundary; Commands and Queries use the same sole Authority instance. */
export class ActionsInternalAccess {
  readonly commands: ActionsInternalCommands;
  readonly queries: ActionsInternalQueries;

  private constructor(authority: ActionsAuthority) {
    this.commands = new ActionsInternalCommands(authority);
    this.queries = new ActionsInternalQueries(authority);
    Object.freeze(this);
  }

  static fromAuthority(authority: ActionsAuthority): ActionsInternalAccess {
    return new ActionsInternalAccess(authority);
  }

  static inMemory(admission: ActionsAdmissionPolicy): ActionsInternalAccess {
    return new ActionsInternalAccess(new ActionsAuthority(admission));
  }

  static durable(
    admission: ActionsAdmissionPolicy,
    journal: ActionsJournal,
  ): ActionsInternalAccess {
    return new ActionsInternalAccess(new ActionsAuthority(admission, journal));
  }
}

function current(record: ActionsAuthorityReadRecord, graphRevision: number): CurrentAction {
  return Object.freeze({ action: record.action, revision: record.revision, graphRevision });
}
