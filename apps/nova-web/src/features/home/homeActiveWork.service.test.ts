import { describe, expect, it, vi } from 'vitest';
import {
  HOME_ACTIVE_WORK_PATH,
  type HomeActiveWorkResponse,
} from '../../../../../contracts/home-active-work.contract';
import { loadHomeActiveWork } from './homeActiveWork.service';

const response: HomeActiveWorkResponse = {
  works: [{
    workIdentity: {
      workId: 'HOME-001',
      projectId: 'NOVA',
    },
    mission: {
      projectId: 'NOVA',
      missionId: 'MISSION-HOME-001',
    },
    goal: 'Connect HOME Active Work.',
    lifecycle: 'READY',
    progress: 20,
    updatedAt: '2026-07-30T12:00:00.000Z',
    provenance: {
      identity: {
        sourceDomain: 'MISSIONS',
        producer: 'ORCHESTRATOR_RUNTIME',
        sourceId: 'NOVA/MISSION-HOME-001',
        observedAt: '2026-07-30T11:00:00.000Z',
      },
      lifecycle: {
        sourceDomain: 'WORK',
        producer: 'WCF-001-LIFECYCLE-001',
        sourceId: 'NOVA/HOME-001/READY',
        observedAt: '2026-07-30T12:00:00.000Z',
      },
      progress: {
        sourceDomain: 'MONITORING',
        producer: 'ORCHESTRATOR_OBSERVABILITY',
        sourceId: 'OBS-HOME-001',
        observedAt: '2026-07-30T12:00:00.000Z',
        sequence: 2,
        correlationId: 'CORR-HOME-001',
        runId: null,
      },
    },
  }],
};

describe('HOME Active Work service', () => {
  it('uses the canonical BFF endpoint and preserves the exact contract', async () => {
    const fetcher = vi.fn(async () => new Response(
      JSON.stringify(response),
      { status: 200 },
    ));

    const works = await loadHomeActiveWork({ fetcher });

    expect(works).toEqual(response.works);
    expect(fetcher).toHaveBeenCalledWith(
      HOME_ACTIVE_WORK_PATH,
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );
  });

  it('rejects non-contract fields instead of exposing extra HOME data', async () => {
    const fetcher = vi.fn(async () => new Response(
      JSON.stringify({
        ...response,
        decisions: [],
      }),
      { status: 200 },
    ));

    await expect(loadHomeActiveWork({ fetcher })).rejects.toThrow(
      'HOME_ACTIVE_WORK_CONTRACT_INVALID',
    );
  });
});
