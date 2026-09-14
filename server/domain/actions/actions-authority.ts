import { Action, type ActionDefinition } from "./action.aggregate.js";
import { ACTION_COMMAND_TYPES, type ActionsCommand } from "./action-authority.commands.js";
import type {
  ActionsDomainEvent,
  ActionsEventPayloadByType,
  ActionsEventProvenance,
  ActionsEventType,
} from "./action-authority.events.js";
import { ActionDomainError } from "./action.errors.js";
import {
  ActionDependency,
  ActionResult,
  Activity,
  assertAcyclicActionDependencies,
} from "./action.entities.js";
import { assertActionStatusTransition } from "./action-status.js";
import {
  assertActionProvenance,
  assertActionReference,
  assertText,
  CommandId,
  type WorkReference,
} from "./action.value-objects.js";
import {
  ActionsJournal,
  ActionsJournalError,
  actionsJournalDocumentsEqual,
  type ActionsJournalEntry,
} from "./actions-journal.js";

export type ActionsAuthorityReceipt = Readonly<{
  commandType: ActionsCommand["type"];
  causalityId: string;
  previousRevision: number;
  revision: number;
  graphRevision: number;
  action: Action;
  events: readonly ActionsDomainEvent[];
}>;

type AuthorityRecord = Readonly<{
  action: Action;
  revision: number;
  endedExecutions: ReadonlySet<string>;
  events: readonly ActionsDomainEvent[];
}>;

export type ActionsAuthorityReadRecord = Readonly<{
  action: Action;
  revision: number;
  events: readonly ActionsDomainEvent[];
}>;

export type ActionsAuthorityReadState = Readonly<{
  graphRevision: number;
  actions: readonly ActionsAuthorityReadRecord[];
}>;

type CausalityReceipt = Readonly<{
  fingerprint: string;
  receipt: ActionsAuthorityReceipt;
}>;

export interface ActionsAdmissionPolicy {
  workExists(workReference: WorkReference): boolean;
}

/** The sole operational producer of authoritative Actions mutations. */
export class ActionsAuthority {
  readonly boundary = "ACTIONS_AUTHORITY" as const;
  readonly #actions = new Map<string, AuthorityRecord>();
  readonly #causalities = new Map<string, CausalityReceipt>();
  readonly #admission: ActionsAdmissionPolicy;
  readonly #journal: ActionsJournal | undefined;
  #graphRevision = 0;

  constructor(admission: ActionsAdmissionPolicy, journal?: ActionsJournal) {
    this.#admission = admission;
    this.#journal = journal;
    if (journal !== undefined) journal.read((entries) => this.#restore(entries));
  }

  accept(command: ActionsCommand): ActionsAuthorityReceipt {
    if (this.#journal !== undefined) {
      return this.#journal.transact((entries) => {
        this.#restore(entries);
        const prior = this.#causalities.get(command.causalityId);
        const receipt = this.#acceptInMemory(command);
        return prior === undefined
          ? Object.freeze({ value: receipt, append: Object.freeze({ command, receipt }) })
          : Object.freeze({ value: receipt });
      });
    }
    return this.#acceptInMemory(command);
  }

  /** Rebuilds from the durable canonical source when configured and exposes no mutation capability. */
  readCanonicalState(): ActionsAuthorityReadState {
    if (this.#journal !== undefined) {
      return this.#journal.read((entries) => {
        this.#restore(entries);
        return this.#snapshot();
      });
    }
    return this.#snapshot();
  }

  #snapshot(): ActionsAuthorityReadState {
    return Object.freeze({
      graphRevision: this.#graphRevision,
      actions: Object.freeze([...this.#actions.values()].map((record) => Object.freeze({
        action: record.action,
        revision: record.revision,
        events: record.events,
      }))),
    });
  }

  #acceptInMemory(
    command: ActionsCommand,
    admissionMode: "NEW_COMMAND" | "HISTORICAL_REPLAY" = "NEW_COMMAND",
  ): ActionsAuthorityReceipt {
    assertCommandContext(command);
    const fingerprint = canonicalFingerprint(command);
    const prior = this.#causalities.get(command.causalityId);
    if (prior !== undefined) {
      if (prior.fingerprint !== fingerprint) {
        throw new ActionDomainError(
          "ACTION_CAUSALITY_CONFLICT",
          "A CausalityId cannot identify different Actions command content.",
        );
      }
      return prior.receipt;
    }
    if (command.type === "ProposeAction" && admissionMode === "NEW_COMMAND") {
      this.#assertWorkExists(command.actionReference.workReference);
    }

    const receipt = command.type === "ProposeAction"
      ? this.#propose(command)
      : this.#mutate(command);
    this.#causalities.set(command.causalityId, Object.freeze({ fingerprint, receipt }));
    return receipt;
  }

  #assertWorkExists(workReference: WorkReference): void {
    if (!this.#admission.workExists(workReference)) {
      throw new ActionDomainError(
        "WORK_REFERENCE_NOT_FOUND",
        "WorkReference does not identify an authoritative Work.",
      );
    }
  }

  #restore(entries: readonly ActionsJournalEntry[]): void {
    this.#actions.clear();
    this.#causalities.clear();
    this.#graphRevision = 0;
    for (const entry of entries) {
      if (this.#causalities.has(entry.command.causalityId)) {
        throw new ActionsJournalError("ACTIONS_JOURNAL_CORRUPT", "Durable causality receipt is duplicated.");
      }
      const receipt = this.#acceptInMemory(entry.command, "HISTORICAL_REPLAY");
      if (!actionsJournalDocumentsEqual(receipt, entry.receiptDocument)) {
        throw new ActionsJournalError("ACTIONS_JOURNAL_CORRUPT", "Rebuilt authoritative receipt is incoherent.");
      }
    }
  }

  #propose(command: Extract<ActionsCommand, { type: "ProposeAction" }>): ActionsAuthorityReceipt {
    if (command.expectedRevision !== 0) revisionConflict();
    if (this.#actions.has(command.actionReference.key)) {
      throw new ActionDomainError(
        "ACTION_ALREADY_EXISTS",
        "Action identity is already authoritative inside this Work.",
      );
    }
    const action = Action.of({
      reference: command.actionReference,
      purpose: command.purpose,
      status: "PROPOSED",
      tasks: [],
      commands: [],
      activities: [],
      executions: [],
      resultHistory: [],
      dependencies: [],
      provenance: command.provenance,
    });
    const events = this.#events(command, 1, [["ActionProposed", {
      purpose: command.purpose,
      status: "PROPOSED",
    }]]);
    const receipt = freezeReceipt(command, 0, 1, this.#graphRevision, action, events);
    this.#actions.set(action.reference.key, Object.freeze({
      action,
      revision: 1,
      endedExecutions: new Set<string>(),
      events,
    }));
    return receipt;
  }

  #mutate(command: Exclude<ActionsCommand, { type: "ProposeAction" }>): ActionsAuthorityReceipt {
    const current = this.#actions.get(command.actionReference.key);
    if (current === undefined) {
      throw new ActionDomainError("ACTION_NOT_FOUND", "The authoritative Action does not exist.");
    }
    if (command.expectedRevision !== current.revision) revisionConflict();

    const definition = copyDefinition(current.action);
    const endedExecutions = new Set(current.endedExecutions);
    const facts: EventFact[] = [];
    let graphMutation = false;

    switch (command.type) {
      case "AcceptAction":
        assertStatusIs(definition.status, "PROPOSED");
        transition(definition, "READY");
        facts.push(["ActionAccepted", { from: "PROPOSED", to: "READY" }]);
        break;
      case "StartAction":
        assertStatusIs(definition.status, "READY");
        transition(definition, "IN_PROGRESS");
        facts.push(["ActionStarted", { from: "READY", to: "IN_PROGRESS" }]);
        break;
      case "BlockAction":
        assertText(command.condition, "Block condition", "ACTION_STATUS_TRANSITION_INVALID");
        transition(definition, "BLOCKED");
        facts.push(["ActionBlocked", { from: "IN_PROGRESS", to: "BLOCKED", condition: command.condition }]);
        break;
      case "ResumeAction":
        assertStatusIs(definition.status, "BLOCKED");
        if (command.destination !== "READY" && command.destination !== "IN_PROGRESS") {
          throw new ActionDomainError("ACTION_STATUS_TRANSITION_INVALID", "Resume destination must be explicit.");
        }
        transition(definition, command.destination);
        facts.push(["ActionResumed", { from: "BLOCKED", to: command.destination }]);
        break;
      case "CompleteAction": {
        assertActionStatusTransition(definition.status, "COMPLETED");
        const result = command.result;
        const completionObservation = command.completionObservation;
        if (result === undefined && completionObservation === undefined) {
          throw new ActionDomainError(
            "ACTION_RESULT_REQUIRED",
            "CompleteAction requires an explicit Result or completion observation.",
          );
        }
        if (result !== undefined && completionObservation !== undefined) {
          throw new ActionDomainError(
            "ACTION_RESULT_CONFLICT",
            "CompleteAction must identify exactly one completion proof.",
          );
        }
        if (result !== undefined) {
          if (!(result instanceof ActionResult)) {
            throw new ActionDomainError("ACTION_RESULT_REQUIRED", "Completion Result must be explicit.");
          }
          definition.resultHistory = appendResult(definition.resultHistory, result);
          facts.push(["ResultRecorded", { result }]);
        } else {
          if (!(completionObservation instanceof Activity)) {
            throw new ActionDomainError(
              "ACTION_RESULT_REQUIRED",
              "Completion observation must be an explicit business Activity.",
            );
          }
          if (definition.resultHistory.length > 0) {
            throw new ActionDomainError(
              "ACTION_RESULT_CONFLICT",
              "A completion observation cannot replace an existing authoritative Result.",
            );
          }
          definition.activities = [...definition.activities, completionObservation];
          definition.completionObservationId = completionObservation.id;
          facts.push(["ActivityObserved", { activity: completionObservation }]);
        }
        definition.status = "COMPLETED";
        facts.push(["ActionCompleted", completionObservation === undefined
          ? { from: "IN_PROGRESS", to: "COMPLETED" }
          : {
              from: "IN_PROGRESS",
              to: "COMPLETED",
              completionObservationId: completionObservation.id,
            }]);
        break;
      }
      case "FailAction": {
        assertText(command.outcome, "Failure outcome", "ACTION_STATUS_TRANSITION_INVALID");
        const from = definition.status;
        assertFailureOrigin(from);
        transition(definition, "FAILED");
        facts.push(["ActionFailed", { from, to: "FAILED", outcome: command.outcome }]);
        break;
      }
      case "CancelAction": {
        assertText(command.reason, "Cancellation reason", "ACTION_STATUS_TRANSITION_INVALID");
        const from = definition.status;
        assertCancellationOrigin(from);
        transition(definition, "CANCELLED");
        facts.push(["ActionCancelled", { from, to: "CANCELLED", reason: command.reason }]);
        break;
      }
      case "RetryAction":
        assertStatusIs(definition.status, "FAILED");
        transition(definition, "READY");
        break;
      case "AddTask":
        definition.tasks = [...definition.tasks, command.task];
        facts.push(["TaskAdded", { task: command.task }]);
        break;
      case "RemoveTask":
        assertText(command.taskId, "TaskId", "TASK_NOT_FOUND");
        if (!definition.tasks.some((task) => task.id.value === command.taskId)) {
          throw new ActionDomainError("TASK_NOT_FOUND", "Task is not owned by the Action.");
        }
        definition.tasks = definition.tasks.filter((task) => task.id.value !== command.taskId);
        facts.push(["TaskRemoved", { taskId: command.taskId }]);
        break;
      case "IssueActionCommand":
        definition.commands = [...definition.commands, command.issuedCommand];
        facts.push(["CommandIssued", { command: command.issuedCommand }]);
        break;
      case "ObserveActivity":
        definition.activities = [...definition.activities, command.activity];
        facts.push(["ActivityObserved", { activity: command.activity }]);
        break;
      case "StartExecution":
        if (definition.executions.some((execution) => execution.id.equals(command.execution.id))) {
          throw new ActionDomainError("EXECUTION_STATE_INVALID", "Execution is already started.");
        }
        definition.executions = [...definition.executions, command.execution];
        facts.push(["ExecutionStarted", { execution: command.execution }]);
        break;
      case "EndExecution":
        assertText(command.executionId, "ExecutionId", "EXECUTION_NOT_FOUND");
        if (!definition.executions.some((execution) => execution.id.value === command.executionId)) {
          throw new ActionDomainError("EXECUTION_NOT_FOUND", "Execution is not owned by the Action.");
        }
        if (endedExecutions.has(command.executionId)) {
          throw new ActionDomainError("EXECUTION_STATE_INVALID", "Execution is already ended.");
        }
        assertText(command.outcome, "Execution outcome", "EXECUTION_STATE_INVALID");
        endedExecutions.add(command.executionId);
        facts.push(["ExecutionEnded", { executionId: command.executionId, outcome: command.outcome }]);
        break;
      case "RecordResult":
        definition.resultHistory = appendResult(definition.resultHistory, command.result);
        facts.push(["ResultRecorded", { result: command.result }]);
        break;
      case "DeclareActionDependency":
        this.#assertGraphRevision(command.expectedGraphRevision);
        if (!command.dependency.source.equals(command.actionReference)) {
          throw new ActionDomainError("INVALID_ACTION_DEPENDENCY", "Dependency must be owned by its source Action.");
        }
        if (!this.#actions.has(command.dependency.target.key)) {
          throw new ActionDomainError("INVALID_ACTION_DEPENDENCY", "Dependency target must be an existing Action.");
        }
        definition.dependencies = [...definition.dependencies, command.dependency];
        graphMutation = true;
        facts.push(["ActionDependencyDeclared", { dependency: command.dependency }]);
        break;
      case "RemoveActionDependency":
        this.#assertGraphRevision(command.expectedGraphRevision);
        if (!command.target.workReference.equals(command.actionReference.workReference)) {
          throw new ActionDomainError("INVALID_ACTION_DEPENDENCY", "Dependency target must belong to the same Work.");
        }
        if (!definition.dependencies.some((dependency) => dependency.target.equals(command.target))) {
          throw new ActionDomainError("INVALID_ACTION_DEPENDENCY", "Dependency does not exist.");
        }
        definition.dependencies = definition.dependencies.filter(
          (dependency) => !dependency.target.equals(command.target),
        );
        graphMutation = true;
        facts.push(["ActionDependencyRemoved", { target: command.target }]);
        break;
    }

    const action = Action.of(definition);
    if (graphMutation) this.#assertCommittableGraph(action);
    const revision = current.revision + 1;
    const nextGraphRevision = graphMutation ? this.#graphRevision + 1 : this.#graphRevision;
    const events = this.#events(command, revision, facts);
    const receipt = freezeReceipt(
      command,
      current.revision,
      revision,
      nextGraphRevision,
      action,
      events,
    );
    this.#actions.set(action.reference.key, Object.freeze({
      action,
      revision,
      endedExecutions,
      events: Object.freeze([...current.events, ...events]),
    }));
    if (graphMutation) this.#graphRevision = nextGraphRevision;
    return receipt;
  }

  #assertGraphRevision(expected: number): void {
    if (expected !== this.#graphRevision) revisionConflict();
  }

  #assertCommittableGraph(candidate: Action): void {
    const dependencies: ActionDependency[] = [];
    for (const [key, record] of this.#actions) {
      dependencies.push(...(key === candidate.reference.key
        ? candidate.dependencies
        : record.action.dependencies));
    }
    assertAcyclicActionDependencies(dependencies);
  }

  #events(
    command: ActionsCommand,
    revision: number,
    facts: readonly EventFact[],
  ): readonly ActionsDomainEvent[] {
    const provenance: ActionsEventProvenance = Object.freeze({
      authoritativeBoundary: this.boundary,
      sourceCommandId: command.commandId.value,
      commandProvenance: command.provenance,
    });
    return Object.freeze(facts.map(([type, payload], ordinal) => Object.freeze({
      type,
      workReference: command.actionReference.workReference,
      actionId: command.actionReference.actionId,
      causalityId: command.causalityId,
      revision,
      ordinal,
      provenance,
      payload: Object.freeze(payload),
    }) as ActionsDomainEvent));
  }
}

type MutableActionDefinition = {
  -readonly [Key in keyof ActionDefinition]: ActionDefinition[Key];
};

type EventFact = {
  [Type in ActionsEventType]: readonly [Type, ActionsEventPayloadByType[Type]];
}[ActionsEventType];

function copyDefinition(action: Action): MutableActionDefinition {
  return {
    reference: action.reference,
    purpose: action.purpose,
    status: action.status,
    tasks: action.tasks,
    commands: action.commands,
    activities: action.activities,
    ...(action.completionObservationId === undefined
      ? {}
      : { completionObservationId: action.completionObservationId }),
    executions: action.executions,
    resultHistory: action.resultHistory,
    dependencies: action.dependencies,
    provenance: action.provenance,
  };
}

function transition(definition: MutableActionDefinition, to: ActionDefinition["status"]): void {
  assertActionStatusTransition(definition.status, to);
  definition.status = to;
}

function appendResult(
  history: ActionDefinition["resultHistory"],
  result: ActionDefinition["resultHistory"][number],
): ActionDefinition["resultHistory"] {
  if (history.some((item) => item.id.equals(result.id))) {
    throw new ActionDomainError("ACTION_RESULT_CONFLICT", "Result history cannot be rewritten.");
  }
  return [...history, result];
}

function assertCommandContext(command: ActionsCommand): void {
  if (typeof command !== "object" || command === null) {
    throw new ActionDomainError("ACTION_NOT_FOUND", "Actions command must be explicit.");
  }
  assertActionReference(command.actionReference);
  assertActionProvenance(command.provenance);
  if (!(command.commandId instanceof CommandId)) {
    throw new ActionDomainError("ACTION_NOT_FOUND", "Source CommandId must be explicit.");
  }
  if (!(ACTION_COMMAND_TYPES as readonly string[]).includes(command.type)) {
    throw new ActionDomainError("ACTION_NOT_FOUND", "Actions command type is not admitted.");
  }
  assertText(command.causalityId, "CausalityId", "ACTION_PROVENANCE_REQUIRED");
  if (!Number.isSafeInteger(command.expectedRevision) || command.expectedRevision < 0) {
    revisionConflict();
  }
}

function assertStatusIs(actual: ActionDefinition["status"], expected: ActionDefinition["status"]): void {
  if (actual !== expected) {
    if (actual === "COMPLETED" || actual === "CANCELLED") {
      assertActionStatusTransition(actual, expected);
    }
    throw new ActionDomainError(
      "ACTION_STATUS_TRANSITION_INVALID",
      `Command requires ${expected}; authoritative status is ${actual}.`,
    );
  }
}

function assertFailureOrigin(
  status: ActionDefinition["status"],
): asserts status is Extract<ActionDefinition["status"], "IN_PROGRESS" | "BLOCKED"> {
  if (status !== "IN_PROGRESS" && status !== "BLOCKED") {
    assertActionStatusTransition(status, "FAILED");
  }
}

function assertCancellationOrigin(
  status: ActionDefinition["status"],
): asserts status is Exclude<ActionDefinition["status"], "COMPLETED" | "CANCELLED"> {
  if (status === "COMPLETED" || status === "CANCELLED") {
    assertActionStatusTransition(status, "CANCELLED");
  }
}

function revisionConflict(): never {
  throw new ActionDomainError(
    "ACTION_REVISION_CONFLICT",
    "Expected authoritative revision does not match committable in-memory state.",
  );
}

function freezeReceipt(
  command: ActionsCommand,
  previousRevision: number,
  revision: number,
  graphRevision: number,
  action: Action,
  events: readonly ActionsDomainEvent[],
): ActionsAuthorityReceipt {
  return Object.freeze({
    commandType: command.type,
    causalityId: command.causalityId,
    previousRevision,
    revision,
    graphRevision,
    action,
    events,
  });
}

function canonicalFingerprint(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)]));
  }
  return value;
}
