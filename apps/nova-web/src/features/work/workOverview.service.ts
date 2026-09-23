import { parseWorkOverviewResponse, workOverviewPath, type WorkOverviewReadModel } from '../../../../../contracts/work-overview.contract';
export type WorkOverviewLoader = (workId: string, signal?: AbortSignal) => Promise<WorkOverviewReadModel>;
export const loadWorkOverview: WorkOverviewLoader = async (workId, signal) => {
  const response = await fetch(workOverviewPath(workId), { method: 'GET', credentials: 'include', headers: { Accept: 'application/json' }, signal });
  if (!response.ok) throw new Error(`Work Overview read failed with HTTP ${response.status}.`);
  const value = parseWorkOverviewResponse(await response.json()).overview;
  if (value.workId !== workId) throw new Error('Work Overview identity mismatch.');
  return value;
};
