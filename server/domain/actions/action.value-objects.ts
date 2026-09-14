import { ActionDomainError, type ActionFoundationErrorCode } from "./action.errors.js";

export type ActionBusinessOrigin =
  | "AUTHORITATIVE_BUSINESS_SOURCE"
  | "BUSINESS_OBSERVATION";

export type ObjectiveCompatibility = "CONTRIBUTES_TO_WORK_OBJECTIVE";

abstract class OpaqueActionIdentifier {
  protected constructor(private readonly canonicalValue: string) {
    Object.freeze(this);
  }

  get value(): string {
    return this.canonicalValue;
  }

  equals(other: OpaqueActionIdentifier): boolean {
    return this.canonicalValue === other.canonicalValue;
  }
}

export class ActionId extends OpaqueActionIdentifier {
  static of(value: string): ActionId {
    assertIdentifier(value, "ActionId", "ACTION_NOT_FOUND");
    return new ActionId(value);
  }
}

export class TaskId extends OpaqueActionIdentifier {
  static of(value: string): TaskId {
    assertIdentifier(value, "TaskId", "TASK_DUPLICATE");
    return new TaskId(value);
  }
}

export class CommandId extends OpaqueActionIdentifier {
  static of(value: string): CommandId {
    assertIdentifier(value, "CommandId", "ACTION_NOT_FOUND");
    return new CommandId(value);
  }
}

export class ActivityId extends OpaqueActionIdentifier {
  static of(value: string): ActivityId {
    assertIdentifier(value, "ActivityId", "ACTION_NOT_FOUND");
    return new ActivityId(value);
  }
}

export class ExecutionId extends OpaqueActionIdentifier {
  static of(value: string): ExecutionId {
    assertIdentifier(value, "ExecutionId", "EXECUTION_STATE_INVALID");
    return new ExecutionId(value);
  }
}

export class ResultId extends OpaqueActionIdentifier {
  static of(value: string): ResultId {
    assertIdentifier(value, "ResultId", "ACTION_RESULT_CONFLICT");
    return new ResultId(value);
  }
}

export class WorkReference {
  private constructor(
    readonly projectIdentity: string,
    readonly workIdentity: string,
  ) {
    Object.freeze(this);
  }

  static of(projectIdentity: string, workIdentity: string): WorkReference {
    assertIdentifier(projectIdentity, "Project Identity", "WORK_REFERENCE_NOT_FOUND");
    assertIdentifier(workIdentity, "Work Identity", "WORK_REFERENCE_NOT_FOUND");
    return new WorkReference(projectIdentity, workIdentity);
  }

  get key(): string {
    return `${this.projectIdentity}/${this.workIdentity}`;
  }

  equals(other: WorkReference): boolean {
    return this.projectIdentity === other.projectIdentity
      && this.workIdentity === other.workIdentity;
  }
}

export class ActionReference {
  private constructor(
    readonly workReference: WorkReference,
    readonly actionId: ActionId,
  ) {
    Object.freeze(this);
  }

  static of(workReference: WorkReference, actionId: ActionId): ActionReference {
    assertWorkReference(workReference);
    assertActionId(actionId);
    return new ActionReference(workReference, actionId);
  }

  get key(): string {
    return `${this.workReference.key}::${this.actionId.value}`;
  }

  equals(other: ActionReference): boolean {
    return this.workReference.equals(other.workReference) && this.actionId.equals(other.actionId);
  }
}

export class ActionPurpose {
  private constructor(
    readonly statement: string,
    readonly compatibility: ObjectiveCompatibility,
  ) {
    Object.freeze(this);
  }

  static of(statement: string, compatibility: ObjectiveCompatibility): ActionPurpose {
    assertText(statement, "Action purpose", "ACTION_PURPOSE_REQUIRED");
    if (compatibility !== "CONTRIBUTES_TO_WORK_OBJECTIVE") {
      throw new ActionDomainError(
        "ACTION_PURPOSE_REQUIRED",
        "Action purpose must explicitly contribute to the Work Objective without copying it.",
      );
    }
    return new ActionPurpose(statement, compatibility);
  }
}

export class ActionProvenance {
  private constructor(
    readonly authority: string,
    readonly source: string,
    readonly businessCause: string,
    private readonly effectiveAtEpochMs: number,
    readonly origin: ActionBusinessOrigin,
  ) {
    Object.freeze(this);
  }

  static of(
    authority: string,
    source: string,
    businessCause: string,
    effectiveAt: Date,
    origin: ActionBusinessOrigin,
  ): ActionProvenance {
    assertText(authority, "Action provenance authority", "ACTION_PROVENANCE_REQUIRED");
    assertText(source, "Action provenance source", "ACTION_PROVENANCE_REQUIRED");
    assertText(businessCause, "Action provenance cause", "ACTION_PROVENANCE_REQUIRED");
    if (!(effectiveAt instanceof Date) || !Number.isFinite(effectiveAt.getTime())) {
      throw new ActionDomainError(
        "ACTION_PROVENANCE_REQUIRED",
        "Action provenance effective date must be a valid business date.",
      );
    }
    assertActionBusinessOrigin(origin);
    return new ActionProvenance(
      authority,
      source,
      businessCause,
      effectiveAt.getTime(),
      origin,
    );
  }

  get effectiveAt(): Date {
    return new Date(this.effectiveAtEpochMs);
  }
}

export function assertActionId(value: unknown): asserts value is ActionId {
  if (!(value instanceof ActionId)) {
    throw new ActionDomainError("ACTION_NOT_FOUND", "ActionId must be explicit.");
  }
  assertIdentifier(value.value, "ActionId", "ACTION_NOT_FOUND");
}

export function assertTaskId(value: unknown): asserts value is TaskId {
  if (!(value instanceof TaskId)) {
    throw new ActionDomainError("TASK_DUPLICATE", "TaskId must be explicit.");
  }
  assertIdentifier(value.value, "TaskId", "TASK_DUPLICATE");
}

export function assertWorkReference(value: unknown): asserts value is WorkReference {
  if (!(value instanceof WorkReference)) {
    throw new ActionDomainError(
      "WORK_REFERENCE_NOT_FOUND",
      "WorkReference must carry canonical Project and Work identities.",
    );
  }
  assertIdentifier(value.projectIdentity, "Project Identity", "WORK_REFERENCE_NOT_FOUND");
  assertIdentifier(value.workIdentity, "Work Identity", "WORK_REFERENCE_NOT_FOUND");
}

export function assertActionReference(value: unknown): asserts value is ActionReference {
  if (!(value instanceof ActionReference)) {
    throw new ActionDomainError("ACTION_NOT_FOUND", "ActionReference must be explicit.");
  }
  assertWorkReference(value.workReference);
  assertActionId(value.actionId);
}

export function assertActionPurpose(value: unknown): asserts value is ActionPurpose {
  if (!(value instanceof ActionPurpose)) {
    throw new ActionDomainError("ACTION_PURPOSE_REQUIRED", "Action purpose must be explicit.");
  }
  ActionPurpose.of(value.statement, value.compatibility);
}

export function assertActionProvenance(value: unknown): asserts value is ActionProvenance {
  if (!(value instanceof ActionProvenance)) {
    throw new ActionDomainError(
      "ACTION_PROVENANCE_REQUIRED",
      "Action provenance must be explicit and relisible.",
    );
  }
  ActionProvenance.of(
    value.authority,
    value.source,
    value.businessCause,
    value.effectiveAt,
    value.origin,
  );
}

export function assertText(
  value: unknown,
  field: string,
  code: ActionFoundationErrorCode,
): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) {
    throw new ActionDomainError(code, `${field} must be explicit and canonical.`);
  }
}

function assertIdentifier(
  value: unknown,
  field: string,
  code: ActionFoundationErrorCode,
): asserts value is string {
  assertText(value, field, code);
}

function assertActionBusinessOrigin(value: unknown): asserts value is ActionBusinessOrigin {
  if (value !== "AUTHORITATIVE_BUSINESS_SOURCE" && value !== "BUSINESS_OBSERVATION") {
    throw new ActionDomainError(
      "TECHNICAL_ACTION_SOURCE_FORBIDDEN",
      "Runtime, Mission, agent, queue, timer, log, audit, fixture, UI and projection sources are not business facts.",
    );
  }
}
