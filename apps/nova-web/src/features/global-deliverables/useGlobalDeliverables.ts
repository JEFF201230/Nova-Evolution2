import { useEffect, useState } from 'react';
import type { GlobalDeliverableEvidence } from '../../../../../contracts/global-deliverables.contract';
import {
  loadCanonicalGlobalDeliverables,
  type GlobalDeliverablesLoader,
} from './globalDeliverables.service';

export type GlobalDeliverablesState = 'loading' | 'ready' | 'error';

export function useGlobalDeliverables(
  loader: GlobalDeliverablesLoader = loadCanonicalGlobalDeliverables,
): { state: GlobalDeliverablesState; deliverables: readonly GlobalDeliverableEvidence[] } {
  const [result, setResult] = useState<{
    state: GlobalDeliverablesState;
    deliverables: readonly GlobalDeliverableEvidence[];
  }>({ state: 'loading', deliverables: [] });

  useEffect(() => {
    const controller = new AbortController();
    setResult({ state: 'loading', deliverables: [] });
    void loader(controller.signal)
      .then((deliverables) => setResult({ state: 'ready', deliverables }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setResult({ state: 'error', deliverables: [] });
      });
    return () => controller.abort();
  }, [loader]);

  return result;
}
