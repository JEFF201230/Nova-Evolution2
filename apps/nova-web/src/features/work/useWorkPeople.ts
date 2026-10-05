import { useEffect, useState } from 'react';
import type { WorkPeopleAvailable } from '../../../../../contracts/work-people.contract';
import { loadWorkPeople, WorkPeopleHttpError, type WorkPeopleLoader } from './workPeople.service';

export type WorkPeopleRuntimeState =
  | Readonly<{ state: 'loading' }>
  | Readonly<{ state: 'ready'; people: WorkPeopleAvailable }>
  | Readonly<{ state: 'empty' | 'absent' | 'unavailable' | 'not-found' | 'error' }>;

export function useWorkPeople(workId: string | undefined, enabled: boolean, loader: WorkPeopleLoader = loadWorkPeople): WorkPeopleRuntimeState {
  const [value, setValue] = useState<WorkPeopleRuntimeState>({ state: enabled && workId ? 'loading' : 'empty' });
  useEffect(() => {
    if (!enabled || !workId) { setValue({ state: 'empty' }); return; }
    const controller = new AbortController();
    setValue({ state: 'loading' });
    void loader(workId, controller.signal).then((people) => {
      switch (people.state) {
        case 'AVAILABLE': setValue({ state: 'ready', people }); break;
        case 'EMPTY': setValue({ state: 'empty' }); break;
        case 'ABSENT': setValue({ state: 'absent' }); break;
        case 'UNAVAILABLE': setValue({ state: 'unavailable' }); break;
      }
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setValue({ state: error instanceof WorkPeopleHttpError && error.status === 404 ? 'not-found' : 'error' });
    });
    return () => controller.abort();
  }, [enabled, loader, workId]);
  return value;
}
