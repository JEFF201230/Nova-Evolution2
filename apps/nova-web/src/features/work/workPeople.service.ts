import {
  parseWorkPeopleResponse,
  workPeoplePath,
  type WorkPeopleReadModel,
} from '../../../../../contracts/work-people.contract';

export class WorkPeopleHttpError extends Error {
  constructor(readonly status: number) {
    super(`Work People read failed with HTTP ${status}.`);
  }
}

export type WorkPeopleLoader = (workId: string, signal?: AbortSignal) => Promise<WorkPeopleReadModel>;

export const loadWorkPeople: WorkPeopleLoader = async (workId, signal) => {
  const response = await fetch(workPeoplePath(workId), {
    method: 'GET', credentials: 'include', headers: { Accept: 'application/json' }, signal,
  });
  if (!response.ok) throw new WorkPeopleHttpError(response.status);
  const people = parseWorkPeopleResponse(await response.json()).people;
  if (people.workIdentity.workId !== workId) throw new Error('Work People identity mismatch.');
  return people;
};
