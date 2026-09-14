import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  linkSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type { ActionsCommand } from "./action-authority.commands.js";
import {
  ActionCommand,
  ActionDependency,
  ActionResult,
  Activity,
  Execution,
  Task,
  type ResultExternalReference,
} from "./action.entities.js";
import {
  ActionId,
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  ActivityId,
  CommandId,
  ExecutionId,
  ResultId,
  TaskId,
  WorkReference,
} from "./action.value-objects.js";
import type { ActionsAuthorityReceipt } from "./actions-authority.js";

const FORMAT = "NOVA_ACTIONS_JOURNAL_V1";
const ZERO_HASH = "0".repeat(64);

export type ActionsJournalEntry = Readonly<{
  command: ActionsCommand;
  receiptDocument: unknown;
}>;

type StoredEntry = Readonly<{
  sequence: number;
  previousHash: string;
  command: unknown;
  receipt: unknown;
  hash: string;
}>;

type JournalDocument = Readonly<{
  format: typeof FORMAT;
  entries: readonly StoredEntry[];
}>;

type JournalAppend = Readonly<{
  command: ActionsCommand;
  receipt: ActionsAuthorityReceipt;
}>;

type TransactionResult<T> = Readonly<{
  value: T;
  append?: JournalAppend;
}>;

export class ActionsJournalError extends Error {
  constructor(
    readonly code: "ACTIONS_JOURNAL_BUSY" | "ACTIONS_JOURNAL_CORRUPT" | "ACTIONS_JOURNAL_WRITE_FAILED",
    message: string,
    options?: ErrorOptions,
  ) {
    super(`${code}: ${message}`, options);
    this.name = "ActionsJournalError";
  }
}

/** Single local durable source. It stores facts accepted by ActionsAuthority; it produces none. */
export class ActionsJournal {
  readonly #canonicalPath: string;
  readonly #lockPath: string;

  constructor(canonicalPath: string) {
    if (typeof canonicalPath !== "string" || canonicalPath.trim() !== canonicalPath || canonicalPath.length === 0) {
      throw new ActionsJournalError("ACTIONS_JOURNAL_CORRUPT", "Canonical path must be explicit.");
    }
    this.#canonicalPath = canonicalPath;
    this.#lockPath = `${canonicalPath}.lock`;
  }

  read<T>(reader: (entries: readonly ActionsJournalEntry[]) => T): T {
    return this.#withLock(() => reader(this.#load().entries));
  }

  transact<T>(operation: (entries: readonly ActionsJournalEntry[]) => TransactionResult<T>): T {
    return this.#withLock(() => {
      const loaded = this.#load();
      const result = operation(loaded.entries);
      if (result.append === undefined) return result.value;
      const previousHash = loaded.stored.at(-1)?.hash ?? ZERO_HASH;
      const body = {
        sequence: loaded.stored.length + 1,
        previousHash,
        command: canonicalize(result.append.command),
        receipt: canonicalize(result.append.receipt),
      };
      const next = Object.freeze({ ...body, hash: digest(body) });
      this.#replace(Object.freeze({ format: FORMAT, entries: [...loaded.stored, next] }));
      return result.value;
    });
  }

  #load(): Readonly<{ stored: readonly StoredEntry[]; entries: readonly ActionsJournalEntry[] }> {
    if (!existsSync(this.#canonicalPath)) return Object.freeze({ stored: [], entries: [] });
    let candidate: unknown;
    try {
      candidate = JSON.parse(readFileSync(this.#canonicalPath, "utf8"));
    } catch (error) {
      throw corrupt("Canonical journal is not valid JSON.", error);
    }
    const document = record(candidate, "journal");
    if (document.format !== FORMAT || !Array.isArray(document.entries)) {
      throw corrupt("Canonical journal format is not admitted.");
    }
    const stored: StoredEntry[] = [];
    const entries: ActionsJournalEntry[] = [];
    let previousHash = ZERO_HASH;
    for (let index = 0; index < document.entries.length; index += 1) {
      const raw = record(document.entries[index], `entry ${index + 1}`);
      const sequence = integer(raw.sequence, "sequence");
      const entryPreviousHash = text(raw.previousHash, "previousHash");
      const hash = text(raw.hash, "hash");
      if (sequence !== index + 1 || entryPreviousHash !== previousHash) {
        throw corrupt("Journal sequence or hash linkage is incoherent.");
      }
      const body = { sequence, previousHash: entryPreviousHash, command: raw.command, receipt: raw.receipt };
      if (hash !== digest(body)) throw corrupt("Journal entry integrity check failed.");
      const command = decodeCommand(raw.command);
      stored.push(Object.freeze({ ...body, hash }));
      entries.push(Object.freeze({ command, receiptDocument: raw.receipt }));
      previousHash = hash;
    }
    return Object.freeze({ stored: Object.freeze(stored), entries: Object.freeze(entries) });
  }

  #replace(document: JournalDocument): void {
    mkdirSync(dirname(this.#canonicalPath), { recursive: true });
    const temporaryPath = `${this.#canonicalPath}.next-${process.pid}-${Date.now()}`;
    let descriptor: number | undefined;
    try {
      descriptor = openSync(temporaryPath, "wx");
      writeFileSync(descriptor, `${JSON.stringify(document)}\n`, "utf8");
      fsyncSync(descriptor);
      closeSync(descriptor);
      descriptor = undefined;
      this.replaceCanonical(temporaryPath);
    } catch (error) {
      if (descriptor !== undefined) closeSync(descriptor);
      if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
      throw new ActionsJournalError(
        "ACTIONS_JOURNAL_WRITE_FAILED",
        "Atomic canonical replacement did not complete.",
        { cause: error },
      );
    }
  }

  protected replaceCanonical(temporaryPath: string): void {
    renameSync(temporaryPath, this.#canonicalPath);
  }

  #withLock<T>(operation: () => T): T {
    mkdirSync(dirname(this.#canonicalPath), { recursive: true });
    const deadline = Date.now() + 5_000;
    let acquired = false;
    while (!acquired) {
      const contenderPath = `${this.#lockPath}.candidate-${process.pid}-${Date.now()}`;
      let contenderDescriptor: number | undefined;
      try {
        contenderDescriptor = openSync(contenderPath, "wx");
        writeFileSync(contenderDescriptor, String(process.pid), "utf8");
        fsyncSync(contenderDescriptor);
        closeSync(contenderDescriptor);
        contenderDescriptor = undefined;
        linkSync(contenderPath, this.#lockPath);
        acquired = true;
      } catch (error) {
        if (!isAlreadyExists(error)) throw error;
        this.#removeAbandonedLock();
        if (Date.now() >= deadline) {
          throw new ActionsJournalError("ACTIONS_JOURNAL_BUSY", "Canonical journal is locked by a live writer.");
        }
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
      } finally {
        if (contenderDescriptor !== undefined) closeSync(contenderDescriptor);
        if (existsSync(contenderPath)) unlinkSync(contenderPath);
      }
    }
    try {
      return operation();
    } finally {
      if (existsSync(this.#lockPath)) unlinkSync(this.#lockPath);
    }
  }

  #removeAbandonedLock(): void {
    try {
      const owner = Number(readFileSync(this.#lockPath, "utf8"));
      if (Number.isSafeInteger(owner) && owner > 0) {
        try { process.kill(owner, 0); return; } catch { /* abandoned */ }
      }
      unlinkSync(this.#lockPath);
    } catch (error) {
      if (!isMissing(error)) throw error;
    }
  }
}

export function actionsJournalDocumentsEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function decodeCommand(value: unknown): ActionsCommand {
  const source = record(value, "command");
  const type = text(source.type, "command.type") as ActionsCommand["type"];
  const base = {
    commandId: CommandId.of(identifier(source.commandId, "commandId")),
    causalityId: text(source.causalityId, "causalityId"),
    expectedRevision: integer(source.expectedRevision, "expectedRevision"),
    provenance: provenance(source.provenance),
    actionReference: actionReference(source.actionReference),
  };
  switch (type) {
    case "ProposeAction": return { type, ...base, purpose: purpose(source.purpose) };
    case "AcceptAction": case "StartAction": case "RetryAction": return { type, ...base };
    case "BlockAction": return { type, ...base, condition: text(source.condition, "condition") };
    case "ResumeAction": {
      const destination = text(source.destination, "destination");
      if (destination !== "READY" && destination !== "IN_PROGRESS") throw corrupt("Resume destination is invalid.");
      return { type, ...base, destination };
    }
    case "CompleteAction": {
      const hasResult = source.result !== undefined;
      const hasCompletionObservation = source.completionObservation !== undefined;
      if (hasResult === hasCompletionObservation) {
        throw corrupt("CompleteAction must contain exactly one completion proof.");
      }
      return hasResult
        ? { type, ...base, result: actionResult(source.result) }
        : { type, ...base, completionObservation: activity(source.completionObservation) };
    }
    case "FailAction": return { type, ...base, outcome: text(source.outcome, "outcome") };
    case "CancelAction": return { type, ...base, reason: text(source.reason, "reason") };
    case "AddTask": return { type, ...base, task: task(source.task) };
    case "RemoveTask": return { type, ...base, taskId: text(source.taskId, "taskId") };
    case "IssueActionCommand": return { type, ...base, issuedCommand: actionCommand(source.issuedCommand) };
    case "ObserveActivity": return { type, ...base, activity: activity(source.activity) };
    case "StartExecution": return { type, ...base, execution: execution(source.execution) };
    case "EndExecution": return {
      type, ...base, executionId: text(source.executionId, "executionId"), outcome: text(source.outcome, "outcome"),
    };
    case "RecordResult": return { type, ...base, result: actionResult(source.result) };
    case "DeclareActionDependency": return {
      type, ...base, dependency: dependency(source.dependency),
      expectedGraphRevision: integer(source.expectedGraphRevision, "expectedGraphRevision"),
    };
    case "RemoveActionDependency": return {
      type, ...base, target: actionReference(source.target),
      expectedGraphRevision: integer(source.expectedGraphRevision, "expectedGraphRevision"),
    };
    default: throw corrupt("Journal contains an unknown Actions command.");
  }
}

function provenance(value: unknown): ActionProvenance {
  const source = record(value, "provenance");
  return ActionProvenance.of(
    text(source.authority, "authority"), text(source.source, "source"),
    text(source.businessCause, "businessCause"), new Date(integer(source.effectiveAtEpochMs, "effectiveAt")),
    text(source.origin, "origin") as "AUTHORITATIVE_BUSINESS_SOURCE" | "BUSINESS_OBSERVATION",
  );
}

function actionReference(value: unknown): ActionReference {
  const source = record(value, "actionReference");
  const work = record(source.workReference, "workReference");
  return ActionReference.of(
    WorkReference.of(text(work.projectIdentity, "projectIdentity"), text(work.workIdentity, "workIdentity")),
    ActionId.of(identifier(source.actionId, "actionId")),
  );
}

function purpose(value: unknown): ActionPurpose {
  const source = record(value, "purpose");
  return ActionPurpose.of(text(source.statement, "statement"), text(source.compatibility, "compatibility") as "CONTRIBUTES_TO_WORK_OBJECTIVE");
}

function task(value: unknown): Task {
  const source = record(value, "task");
  return Task.of(TaskId.of(identifier(source.id, "task.id")), text(source.purpose, "task.purpose"), provenance(source.provenance));
}

function actionCommand(value: unknown): ActionCommand {
  const source = record(value, "issuedCommand");
  return ActionCommand.record(CommandId.of(identifier(source.id, "issuedCommand.id")), text(source.instruction, "instruction"), provenance(source.provenance));
}

function activity(value: unknown): Activity {
  const source = record(value, "activity");
  return Activity.observe(ActivityId.of(identifier(source.id, "activity.id")), text(source.observedFact, "observedFact"), provenance(source.provenance));
}

function execution(value: unknown): Execution {
  const source = record(value, "execution");
  const targetSource = record(source.target, "execution.target");
  const kind = text(targetSource.kind, "execution.target.kind");
  const target = kind === "ACTION"
    ? Object.freeze({ kind: "ACTION" as const })
    : kind === "TASK"
      ? Object.freeze({ kind: "TASK" as const, taskId: TaskId.of(identifier(targetSource.taskId, "target.taskId")) })
      : (() => { throw corrupt("Execution target is invalid."); })();
  return Execution.occur(
    ExecutionId.of(identifier(source.id, "execution.id")), target,
    text(source.businessOccurrence, "businessOccurrence"), provenance(source.provenance),
  );
}

function actionResult(value: unknown): ActionResult {
  const source = record(value, "result");
  let externalReference: ResultExternalReference | null = null;
  if (source.externalReference !== null) {
    const reference = record(source.externalReference, "externalReference");
    externalReference = Object.freeze({
      kind: text(reference.kind, "externalReference.kind") as ResultExternalReference["kind"],
      identity: text(reference.identity, "externalReference.identity"),
    });
  }
  return ActionResult.record(
    ResultId.of(identifier(source.id, "result.id")), text(source.outcome, "result.outcome"),
    externalReference, provenance(source.provenance),
  );
}

function dependency(value: unknown): ActionDependency {
  const source = record(value, "dependency");
  return ActionDependency.from(
    actionReference(source.source), actionReference(source.target),
    text(source.condition, "dependency.condition"), provenance(source.provenance),
  );
}

function identifier(value: unknown, label: string): string {
  return text(record(value, label).canonicalValue, label);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw corrupt(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) throw corrupt(`${label} must be text.`);
  return value;
}

function integer(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw corrupt(`${label} must be a non-negative integer.`);
  return value as number;
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, canonicalize(entry)]));
  }
  return value;
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function corrupt(message: string, cause?: unknown): ActionsJournalError {
  return new ActionsJournalError("ACTIONS_JOURNAL_CORRUPT", message, cause === undefined ? undefined : { cause });
}

function isAlreadyExists(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "EEXIST";
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
