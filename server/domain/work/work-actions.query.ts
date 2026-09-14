import {
  Action,
  WorkReference,
  type CurrentAction,
} from "../actions/index.js";
import {
  WORK_ACTIONS_SOURCE_DOMAIN,
  type WorkActionReadItem,
  type WorkActionsReadResult,
  type WorkActionsReference,
  type WorkActionsUnavailableReason,
} from "./work-actions.types.js";

/** The certified ACTIONS internal read capability consumed by Work. */
export interface WorkActionsReadSource {
  listActionsByWork(workReference: WorkReference): readonly CurrentAction[];
}

/**
 * Internal, read-only Work -> ACTIONS boundary.
 *
 * This adapter owns no Action aggregate, command, result, dependency, cache,
 * repository or persistence. Every item is rebuilt transiently from the
 * certified ACTIONS internal query for the requested WorkReference.
 */
export class WorkActionsQuery {
  constructor(private readonly actions: WorkActionsReadSource) {}

  get(work: WorkActionsReference): WorkActionsReadResult {
    const workReference = WorkReference.of(work.projectId, work.workId);
    const reference = Object.freeze({
      projectId: workReference.projectIdentity,
      workId: workReference.workIdentity,
    });

    let current: unknown;
    try {
      current = this.actions.listActionsByWork(workReference);
    } catch {
      return unavailable(reference, "ACTIONS_READ_UNAVAILABLE");
    }
    if (!Array.isArray(current)) {
      return unavailable(reference, "ACTIONS_READ_INCONSISTENT");
    }

    const actionIds = new Set<string>();
    const projected: WorkActionReadItem[] = [];
    for (const candidate of current) {
      if (!isConsistent(candidate, workReference)) {
        return unavailable(reference, "ACTIONS_READ_INCONSISTENT");
      }
      const actionId = candidate.action.reference.actionId.value;
      if (actionIds.has(actionId)) {
        return unavailable(reference, "ACTIONS_READ_INCONSISTENT");
      }
      actionIds.add(actionId);
      projected.push(Object.freeze({
        actionId,
        status: candidate.action.status,
        revision: candidate.revision,
        graphRevision: candidate.graphRevision,
      }));
    }

    projected.sort((left, right) => left.actionId.localeCompare(right.actionId));
    if (projected.length === 0) {
      return Object.freeze({
        ...reference,
        status: "ACTIONS_AVAILABLE_EMPTY",
        sourceDomain: WORK_ACTIONS_SOURCE_DOMAIN,
        actions: Object.freeze([] as []),
      });
    }
    return Object.freeze({
      ...reference,
      status: "ACTIONS_AVAILABLE",
      sourceDomain: WORK_ACTIONS_SOURCE_DOMAIN,
      actions: Object.freeze(projected) as readonly [WorkActionReadItem, ...WorkActionReadItem[]],
    });
  }
}

function unavailable(
  reference: Readonly<{ projectId: string; workId: string }>,
  reason: WorkActionsUnavailableReason,
): WorkActionsReadResult {
  return Object.freeze({
    ...reference,
    status: "ACTIONS_UNAVAILABLE",
    sourceDomain: WORK_ACTIONS_SOURCE_DOMAIN,
    reason,
  });
}

function isConsistent(candidate: unknown, requested: WorkReference): candidate is CurrentAction {
  if (typeof candidate !== "object" || candidate === null) return false;
  const record = candidate as Partial<CurrentAction>;
  return record.action instanceof Action
    && record.action.reference.workReference.equals(requested)
    && Number.isSafeInteger(record.revision)
    && (record.revision as number) >= 1
    && Number.isSafeInteger(record.graphRevision)
    && (record.graphRevision as number) >= 0;
}
