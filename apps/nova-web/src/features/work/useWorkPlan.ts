import { useEffect, useState } from 'react';
import type { WorkPlanAvailable } from '../../../../../contracts/work-plan.contract';
import {
  loadWorkPlan,
  WorkPlanHttpError,
  type WorkPlanLoader,
} from './workPlan.service';

export type WorkPlanRuntimeState =
  | Readonly<{ state: 'loading' }>
  | Readonly<{ state: 'ready'; plan: WorkPlanAvailable }>
  | Readonly<{ state: 'empty' | 'withdrawn' | 'unavailable' | 'not-found' | 'error' }>;

export function useWorkPlan(
  workId: string | undefined,
  enabled: boolean,
  loader: WorkPlanLoader = loadWorkPlan,
): WorkPlanRuntimeState {
  const [value, setValue] = useState<WorkPlanRuntimeState>({
    state: enabled && workId ? 'loading' : 'empty',
  });

  useEffect(() => {
    if (!enabled || !workId) {
      setValue({ state: 'empty' });
      return;
    }
    const controller = new AbortController();
    setValue({ state: 'loading' });
    void loader(workId, controller.signal)
      .then((plan) => {
        switch (plan.state) {
          case 'AVAILABLE': setValue({ state: 'ready', plan }); break;
          case 'ABSENT': setValue({ state: 'empty' }); break;
          case 'WITHDRAWN': setValue({ state: 'withdrawn' }); break;
          case 'UNAVAILABLE': setValue({ state: 'unavailable' }); break;
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setValue({
          state: error instanceof WorkPlanHttpError && error.status === 404
            ? 'not-found'
            : 'error',
        });
      });
    return () => controller.abort();
  }, [enabled, loader, workId]);

  return value;
}
