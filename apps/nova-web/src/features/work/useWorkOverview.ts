import { useEffect, useState } from 'react';
import type { WorkOverviewReadModel } from '../../../../../contracts/work-overview.contract';
import { loadWorkOverview, type WorkOverviewLoader } from './workOverview.service';
export type WorkOverviewRuntimeState = Readonly<{ state: 'loading' | 'ready' | 'empty' | 'error'; work?: WorkOverviewReadModel }>;
export function useWorkOverview(workId: string | undefined, enabled: boolean, loader: WorkOverviewLoader = loadWorkOverview): WorkOverviewRuntimeState {
  const [value, setValue] = useState<WorkOverviewRuntimeState>({ state: enabled && workId ? 'loading' : 'empty' });
  useEffect(() => {
    if (!enabled || !workId) { setValue({ state: 'empty' }); return; }
    const controller = new AbortController(); setValue({ state: 'loading' });
    void loader(workId, controller.signal).then((work) => setValue({ state: 'ready', work })).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setValue({ state: 'error' });
    });
    return () => controller.abort();
  }, [enabled, loader, workId]);
  return value;
}
