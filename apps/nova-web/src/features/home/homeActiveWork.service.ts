import {
  HOME_ACTIVE_WORK_PATH,
  parseHomeActiveWorkResponse,
  type HomeActiveWorkItem,
} from '../../../../../contracts/home-active-work.contract';

export interface HomeActiveWorkLoadOptions {
  endpoint?: string;
  fetcher?: typeof fetch;
  signal?: AbortSignal;
}

export type HomeActiveWorkLoader = (
  signal?: AbortSignal,
) => Promise<readonly HomeActiveWorkItem[]>;

export async function loadHomeActiveWork({
  endpoint = HOME_ACTIVE_WORK_PATH,
  fetcher = fetch,
  signal,
}: HomeActiveWorkLoadOptions = {}): Promise<readonly HomeActiveWorkItem[]> {
  const response = await fetcher(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`HOME Active Work read failed with HTTP ${response.status}.`);
  }

  return parseHomeActiveWorkResponse(await response.json()).works;
}

export const loadCanonicalHomeActiveWork: HomeActiveWorkLoader = (signal) =>
  loadHomeActiveWork({ signal });
