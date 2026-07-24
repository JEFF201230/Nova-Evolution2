export interface RuntimeScheduleItem {
  readonly id: string;
  readonly order: number;
  readonly ready: boolean;
}

export interface RuntimeScheduleEvidence {
  readonly itemCount: number;
  readonly readyItemCount: number;
  readonly orderedItemIds: readonly string[];
  readonly ready: boolean;
}

export interface RuntimeSchedulerResult {
  readonly passed: boolean;
  readonly evidence: RuntimeScheduleEvidence;
}

export function createRuntimeScheduleEvidence(
  items: readonly RuntimeScheduleItem[],
): RuntimeScheduleEvidence {
  assertRuntimeScheduleItems(items);

  const orderedItems = [...items].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    if (left.id < right.id) {
      return -1;
    }

    if (left.id > right.id) {
      return 1;
    }

    return 0;
  });
  const readyItemCount = orderedItems.filter((item) => item.ready).length;

  return Object.freeze({
    itemCount: orderedItems.length,
    readyItemCount,
    orderedItemIds: Object.freeze(orderedItems.map((item) => item.id)),
    ready: orderedItems.length > 0 && readyItemCount === orderedItems.length,
  });
}

export function verifyRuntimeScheduler(
  items: readonly RuntimeScheduleItem[],
): RuntimeSchedulerResult {
  const evidence = createRuntimeScheduleEvidence(items);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertRuntimeScheduleItems(items: readonly RuntimeScheduleItem[]): void {
  const seen = new Set<string>();

  for (const item of items) {
    if (item.id.trim().length === 0 || item.id !== item.id.trim()) {
      throw new Error(
        "RSCHED-001: Runtime Scheduler rejects empty or non-normalized internal work item ids.",
      );
    }

    if (!Number.isInteger(item.order) || item.order < 0) {
      throw new Error(
        "RSCHED-002: Runtime Scheduler rejects invalid internal work item ordering.",
      );
    }

    if (seen.has(item.id)) {
      throw new Error(
        "RSCHED-003: Runtime Scheduler rejects duplicate internal work item ids.",
      );
    }

    seen.add(item.id);
  }
}
