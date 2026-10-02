import {
  parseWorkPlanResponse,
  workPlanPath,
  type WorkPlanReadModel,
} from '../../../../../contracts/work-plan.contract';

export class WorkPlanHttpError extends Error {
  constructor(readonly status: number) {
    super(`Work Plan read failed with HTTP ${status}.`);
  }
}

export type WorkPlanLoader = (
  workId: string,
  signal?: AbortSignal,
) => Promise<WorkPlanReadModel>;

export const loadWorkPlan: WorkPlanLoader = async (workId, signal) => {
  const response = await fetch(workPlanPath(workId), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new WorkPlanHttpError(response.status);
  const plan = parseWorkPlanResponse(await response.json()).plan;
  if (plan.workIdentity.workId !== workId) {
    throw new Error('Work Plan identity mismatch.');
  }
  return plan;
};
