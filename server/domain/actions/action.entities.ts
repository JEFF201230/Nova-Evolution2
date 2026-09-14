import { ActionDomainError } from "./action.errors.js";
import {
  ActionProvenance,
  ActionReference,
  ActivityId,
  CommandId,
  ExecutionId,
  ResultId,
  TaskId,
  assertActionProvenance,
  assertActionReference,
  assertTaskId,
  assertText,
} from "./action.value-objects.js";

export class Task {
  private constructor(
    readonly id: TaskId,
    readonly purpose: string,
    readonly relationship: "DECOMPOSES_ACTION_PURPOSE",
    readonly provenance: ActionProvenance,
  ) {
    Object.freeze(this);
  }

  static of(id: TaskId, purpose: string, provenance: ActionProvenance): Task {
    assertTaskId(id);
    assertText(purpose, "Task purpose", "TASK_PURPOSE_CONFLICT");
    assertActionProvenance(provenance);
    return new Task(id, purpose, "DECOMPOSES_ACTION_PURPOSE", provenance);
  }
}

export class ActionCommand {
  private constructor(
    readonly id: CommandId,
    readonly instruction: string,
    readonly provenance: ActionProvenance,
  ) {
    Object.freeze(this);
  }

  static record(id: CommandId, instruction: string, provenance: ActionProvenance): ActionCommand {
    if (!(id instanceof CommandId)) {
      throw new ActionDomainError("ACTION_NOT_FOUND", "CommandId must be explicit.");
    }
    assertText(instruction, "Command instruction", "ACTION_PURPOSE_REQUIRED");
    assertActionProvenance(provenance);
    return new ActionCommand(id, instruction, provenance);
  }
}

export class Activity {
  private constructor(
    readonly id: ActivityId,
    readonly observedFact: string,
    readonly provenance: ActionProvenance,
  ) {
    Object.freeze(this);
  }

  static observe(id: ActivityId, observedFact: string, provenance: ActionProvenance): Activity {
    if (!(id instanceof ActivityId)) {
      throw new ActionDomainError("ACTION_NOT_FOUND", "ActivityId must be explicit.");
    }
    assertText(observedFact, "Observed business fact", "ACTION_PURPOSE_REQUIRED");
    assertActionProvenance(provenance);
    return new Activity(id, observedFact, provenance);
  }
}

export type ExecutionTarget =
  | Readonly<{ kind: "ACTION" }>
  | Readonly<{ kind: "TASK"; taskId: TaskId }>;

export class Execution {
  private constructor(
    readonly id: ExecutionId,
    readonly target: ExecutionTarget,
    readonly businessOccurrence: string,
    readonly provenance: ActionProvenance,
  ) {
    Object.freeze(this);
  }

  static occur(
    id: ExecutionId,
    target: ExecutionTarget,
    businessOccurrence: string,
    provenance: ActionProvenance,
  ): Execution {
    if (!(id instanceof ExecutionId)) {
      throw new ActionDomainError("EXECUTION_STATE_INVALID", "ExecutionId must be explicit.");
    }
    assertExecutionTarget(target);
    assertText(businessOccurrence, "Execution business occurrence", "EXECUTION_STATE_INVALID");
    assertActionProvenance(provenance);
    return new Execution(id, freezeExecutionTarget(target), businessOccurrence, provenance);
  }
}

export type ResultExternalReferenceKind =
  | "DELIVERABLE"
  | "DECISION"
  | "AUTHORITATIVE_FACT";

export type ResultExternalReference = Readonly<{
  kind: ResultExternalReferenceKind;
  identity: string;
}>;

export class ActionResult {
  private constructor(
    readonly id: ResultId,
    readonly outcome: string,
    readonly externalReference: ResultExternalReference | null,
    readonly provenance: ActionProvenance,
  ) {
    Object.freeze(this);
  }

  static record(
    id: ResultId,
    outcome: string,
    externalReference: ResultExternalReference | null,
    provenance: ActionProvenance,
  ): ActionResult {
    if (!(id instanceof ResultId)) {
      throw new ActionDomainError("ACTION_RESULT_CONFLICT", "ResultId must be explicit.");
    }
    assertText(outcome, "Action Result outcome", "ACTION_RESULT_REQUIRED");
    const reference = freezeExternalReference(externalReference);
    assertActionProvenance(provenance);
    return new ActionResult(id, outcome, reference, provenance);
  }
}

export class ActionDependency {
  private constructor(
    readonly source: ActionReference,
    readonly target: ActionReference,
    readonly condition: string,
    readonly provenance: ActionProvenance,
  ) {
    Object.freeze(this);
  }

  static from(
    source: ActionReference,
    target: ActionReference,
    condition: string,
    provenance: ActionProvenance,
  ): ActionDependency {
    assertActionReference(source);
    assertActionReference(target);
    if (source.equals(target)) {
      throw new ActionDomainError(
        "INVALID_ACTION_DEPENDENCY",
        "An Action cannot depend on itself.",
      );
    }
    if (!source.workReference.equals(target.workReference)) {
      throw new ActionDomainError(
        "INVALID_ACTION_DEPENDENCY",
        "Foundation Dependencies are limited to Actions in the same Work.",
      );
    }
    assertText(condition, "Dependency condition", "INVALID_ACTION_DEPENDENCY");
    assertActionProvenance(provenance);
    return new ActionDependency(source, target, condition, provenance);
  }

  get key(): string {
    return `${this.source.key}->${this.target.key}`;
  }
}

export function assertAcyclicActionDependencies(
  dependencies: readonly ActionDependency[],
): void {
  const edges = new Map<string, string[]>();
  const unique = new Set<string>();
  for (const dependency of dependencies) {
    if (!(dependency instanceof ActionDependency)) {
      throw new ActionDomainError("INVALID_ACTION_DEPENDENCY", "Dependency must be explicit.");
    }
    if (unique.has(dependency.key)) {
      throw new ActionDomainError(
        "INVALID_ACTION_DEPENDENCY",
        "A Dependency business identity must be unique.",
      );
    }
    unique.add(dependency.key);
    const targets = edges.get(dependency.source.key) ?? [];
    targets.push(dependency.target.key);
    edges.set(dependency.source.key, targets);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (node: string): void => {
    if (visiting.has(node)) {
      throw new ActionDomainError(
        "ACTION_DEPENDENCY_CYCLE",
        "The Action Dependency graph must remain acyclic.",
      );
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const target of edges.get(node) ?? []) visit(target);
    visiting.delete(node);
    visited.add(node);
  };
  for (const source of edges.keys()) visit(source);
}

function assertExecutionTarget(value: unknown): asserts value is ExecutionTarget {
  if (typeof value !== "object" || value === null || !("kind" in value)) {
    throw new ActionDomainError("EXECUTION_STATE_INVALID", "Execution target must be explicit.");
  }
  const candidate = value as { kind: unknown; taskId?: unknown };
  if (candidate.kind === "ACTION") return;
  if (candidate.kind === "TASK") {
    assertTaskId(candidate.taskId);
    return;
  }
  throw new ActionDomainError("EXECUTION_STATE_INVALID", "Execution target must be ACTION or TASK.");
}

function freezeExecutionTarget(target: ExecutionTarget): ExecutionTarget {
  return target.kind === "ACTION"
    ? Object.freeze({ kind: "ACTION" })
    : Object.freeze({ kind: "TASK", taskId: target.taskId });
}

function freezeExternalReference(
  reference: ResultExternalReference | null,
): ResultExternalReference | null {
  if (reference === null) return null;
  if (reference.kind !== "DELIVERABLE"
    && reference.kind !== "DECISION"
    && reference.kind !== "AUTHORITATIVE_FACT") {
    throw new ActionDomainError(
      "ACTION_RESULT_CONFLICT",
      "Result external reference kind must preserve an admitted external authority.",
    );
  }
  assertText(reference.identity, "Result external identity", "ACTION_RESULT_CONFLICT");
  return Object.freeze({ ...reference });
}
