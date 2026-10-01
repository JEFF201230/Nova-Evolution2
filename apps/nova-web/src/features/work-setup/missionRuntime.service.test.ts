import { describe, expect, it, vi } from 'vitest';
import {
  MISSION_RUNTIME_MISSIONS_PATH,
  MISSION_RUNTIME_PROJECTS_PATH,
  createAndExecuteWork,
  parseExplicitTechnicalScope,
} from './missionRuntime.service';

const missionId = 'NOVA-WORK-12345678-1234-4234-8234-123456789abc';
const projectId = 'TARGET-PROJECT';

function input() {
  return {
    missionId,
    objective: 'Prepare the Q3 launch review',
    clarifyAnswers: ['Board / 18 Jul', 'Decision approved', 'Use approved sources only'],
    canvasItems: [{ id: 'objective', title: 'Objective', value: 'Captured' }],
    selectedAutonomyLevel: 2,
    allowedScopeText: 'apps/nova-web/src/**\ncontracts/work-overview.contract.ts',
    forbiddenScopeText: 'server/nova-core/**\nserver/runtime/**',
  };
}

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('Work Setup Mission Runtime service', () => {
  it('discovers one reduced project target, refreshes CSRF for both mutations, creates and executes one Mission', async () => {
    const requests: Array<{ path: string; init?: RequestInit }> = [];
    const fetcher = vi.fn(async (request: RequestInfo | URL, init?: RequestInit) => {
      const path = String(request);
      requests.push({ path, init });
      if (path === MISSION_RUNTIME_PROJECTS_PATH) return json({ projects: [{ projectId }] });
      if (path === '/session') return json({ authenticated: true }, 200, { 'X-CSRF-Token': `csrf-${requests.length}` });
      if (path === MISSION_RUNTIME_MISSIONS_PATH) return json({ created: true, mission: { projectId, missionId } }, 201);
      if (path.endsWith('/execute')) return json({ mission: { projectId, missionId }, report: { reportId: 'REPORT-1' } });
      throw new Error(`Unexpected request: ${path}`);
    });

    await expect(createAndExecuteWork(input(), fetcher)).resolves.toEqual({ projectId, missionId });

    expect(requests.map(({ path }) => path)).toEqual([
      MISSION_RUNTIME_PROJECTS_PATH,
      '/session',
      MISSION_RUNTIME_MISSIONS_PATH,
      '/session',
      `${MISSION_RUNTIME_MISSIONS_PATH}/${projectId}/${missionId}/execute`,
    ]);
    const createRequest = requests[2].init;
    const executeRequest = requests[4].init;
    expect(createRequest).toEqual(expect.objectContaining({ method: 'POST', credentials: 'include' }));
    expect(new Headers(createRequest?.headers).get('X-CSRF-Token')).toBe('csrf-2');
    expect(new Headers(executeRequest?.headers).get('X-CSRF-Token')).toBe('csrf-4');
    expect(new Headers(createRequest?.headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(String(createRequest?.body))).toEqual({
      projectId,
      missionId,
      missionType: 'WORK',
      objective: input().objective,
      authority: 'WAVE',
      scope: {
        allowed: ['apps/nova-web/src/**', 'contracts/work-overview.contract.ts'],
        forbidden: ['server/nova-core/**', 'server/runtime/**'],
      },
      deliverables: [],
      stopCriteria: [],
      authorizedReferences: [],
    });
    const executionBody = JSON.parse(String(executeRequest?.body)) as { prompt: string; profile?: string };
    expect(executionBody.profile).toBeUndefined();
    expect(JSON.parse(executionBody.prompt)).toEqual({
      workSetup: {
        objective: input().objective,
        clarifyAnswers: input().clarifyAnswers,
        canvasItems: input().canvasItems,
        selectedAutonomyLevel: 2,
      },
    });
  });

  it.each([
    [{ projects: [] }, 'ambiguous or empty'],
    [{ projects: [{ projectId: 'ONE' }, { projectId: 'TWO' }] }, 'ambiguous or empty'],
    [{ projects: [{ projectId, repositoryRoot: 'C:/private' }] }, 'invalid response'],
  ])('fails closed for unusable project discovery %#', async (body, message) => {
    const fetcher = vi.fn(async () => json(body));
    await expect(createAndExecuteWork(input(), fetcher)).rejects.toThrow(message);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('does not execute when Mission creation fails and keeps authentication failures explicit', async () => {
    const fetcher = vi.fn(async (request: RequestInfo | URL) => {
      const path = String(request);
      if (path === MISSION_RUNTIME_PROJECTS_PATH) return json({ projects: [{ projectId }] });
      if (path === '/session') return json({}, 200, { 'X-CSRF-Token': 'csrf' });
      return json({ error: { code: 'AUTHENTICATION_REQUIRED' } }, 401);
    });

    await expect(createAndExecuteWork(input(), fetcher)).rejects.toThrow('Mission creation failed (HTTP 401).');
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('never reports success when execution fails', async () => {
    const fetcher = vi.fn(async (request: RequestInfo | URL) => {
      const path = String(request);
      if (path === MISSION_RUNTIME_PROJECTS_PATH) return json({ projects: [{ projectId }] });
      if (path === '/session') return json({}, 200, { 'X-CSRF-Token': 'csrf' });
      if (path === MISSION_RUNTIME_MISSIONS_PATH) return json({ created: true, mission: { projectId, missionId } }, 201);
      return json({ error: { code: 'FORBIDDEN' } }, 403);
    });

    await expect(createAndExecuteWork(input(), fetcher)).rejects.toThrow('Mission execution failed (HTTP 403).');
    expect(fetcher).toHaveBeenCalledTimes(5);
  });

  it('rejects absent and global technical scope before any request', async () => {
    const fetcher = vi.fn();
    await expect(createAndExecuteWork({ ...input(), allowedScopeText: '' }, fetcher)).rejects.toThrow('must contain');
    await expect(createAndExecuteWork({ ...input(), allowedScopeText: '**' }, fetcher)).rejects.toThrow('unsafe or global');
    await expect(createAndExecuteWork({ ...input(), allowedScopeText: '../outside/**' }, fetcher)).rejects.toThrow('unsafe or global');
    expect(fetcher).not.toHaveBeenCalled();
    expect(() => parseExplicitTechnicalScope('C:/private/**', 'Allowed scope')).toThrow('unsafe or global');
  });
});
