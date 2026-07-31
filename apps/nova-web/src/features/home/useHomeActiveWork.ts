import { useEffect, useState } from 'react';
import type { HomeActiveWorkItem } from '../../../../../contracts/home-active-work.contract';
import {
  loadCanonicalHomeActiveWork,
  type HomeActiveWorkLoader,
} from './homeActiveWork.service';

export type HomeActiveWorkState = 'loading' | 'ready' | 'error';

export interface HomeActiveWorkRuntimeState {
  readonly works: readonly HomeActiveWorkItem[];
  readonly state: HomeActiveWorkState;
}

export function useHomeActiveWork(
  enabled: boolean,
  loader: HomeActiveWorkLoader = loadCanonicalHomeActiveWork,
): HomeActiveWorkRuntimeState {
  const [runtimeState, setRuntimeState] = useState<HomeActiveWorkRuntimeState>({
    works: [],
    state: enabled ? 'loading' : 'ready',
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    setRuntimeState({ works: [], state: 'loading' });
    void loader(controller.signal)
      .then((works) => {
        setRuntimeState({ works, state: 'ready' });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setRuntimeState({ works: [], state: 'error' });
      });

    return () => controller.abort();
  }, [enabled, loader]);

  return runtimeState;
}
