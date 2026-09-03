import {
  GLOBAL_DELIVERABLES_PATH,
  parseGlobalDeliverablesResponse,
  type GlobalDeliverableEvidence,
} from '../../../../../contracts/global-deliverables.contract';

export type GlobalDeliverablesLoader = (
  signal?: AbortSignal,
) => Promise<readonly GlobalDeliverableEvidence[]>;

export async function loadGlobalDeliverables(
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<readonly GlobalDeliverableEvidence[]> {
  const response = await fetcher(GLOBAL_DELIVERABLES_PATH, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Global Deliverables read failed with HTTP ${response.status}.`);
  }
  return parseGlobalDeliverablesResponse(await response.json()).deliverables;
}

export const loadCanonicalGlobalDeliverables: GlobalDeliverablesLoader = (signal) =>
  loadGlobalDeliverables(signal);
