import { once } from 'node:events';
import { mkdtemp } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RUNTIME_ACTIVE_WORK_PATH } from '../../../../../contracts/home-active-work.contract';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { loadHomeActiveWork } from '../home/homeActiveWork.service';
import { WorkSetupProvider } from '../work-setup';
import { sessionCookiePair, startTestBff, TEST_PASSWORD, testBffConfig } from '../../../../../server/nova-bff/bff.test-support';
import { HttpHomeActiveWorkGateway } from '../../../../../server/nova-bff/home-active-work.gateway';
import { HttpWorkOverviewGateway } from '../../../../../server/nova-bff/work-overview.gateway';
import { createNovaCoreHttpServer } from '../../../../../server/nova-core/nova-core.http';
import { NovaCoreService } from '../../../../../server/nova-core/nova-core.service';
import { E2E_OBJECTIVE, E2E_PROJECT_ID, E2E_WORK_ID, seedWorkOverviewAuthorities } from '../../../../../server/nova-core/work-overview.test-support';

afterEach(() => vi.unstubAllGlobals());

describe('real HOME to Work Overview path', () => {
  it('selects a Runtime Work and displays authoritative Planning and Confidence', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'work-overview-ui-e2e-'));
    const authorities = seedWorkOverviewAuthorities(directory);
    const core = await NovaCoreService.open(join(directory, 'runtime.json'), undefined, {
      journalAttestationKey: 'work-overview-ui-e2e-attestation-key-001', planningDatabasePath: authorities.planningPath, confidenceJournalPath: authorities.confidencePath,
      intelligenceJournalPath: join(directory, 'intelligence.json'), synthesisJournalPath: join(directory, 'synthesis.json'), peopleDatabasePath: join(directory, 'people.sqlite'),
    });
    await core.createMission({ projectId: E2E_PROJECT_ID, missionId: E2E_WORK_ID, missionType: 'WORK', objective: E2E_OBJECTIVE, authority: 'PROGRAM_DIRECTOR', scope: { allowed: ['server', 'apps/nova-web'], forbidden: ['VEEDDA', 'CEREBRAU'] }, deliverables: ['Authoritative Work Overview'], stopCriteria: ['The real UI path displays it.'], authorizedReferences: [] });
    const coreServer = createNovaCoreHttpServer(core); coreServer.listen(0, '127.0.0.1'); await once(coreServer, 'listening');
    const coreOrigin = `http://127.0.0.1:${(coreServer.address() as AddressInfo).port}`;
    const serverFetch = globalThis.fetch;
    const nodeFetcher = ((input: RequestInfo | URL, init?: RequestInit) => serverFetch(input, { ...init, signal: undefined })) as typeof fetch;
    const bff = await startTestBff(testBffConfig({ runtimeOrigin: coreOrigin }), { homeActiveWorkGateway: new HttpHomeActiveWorkGateway(coreOrigin, nodeFetcher), workOverviewGateway: new HttpWorkOverviewGateway(coreOrigin, nodeFetcher) });
    try {
      const nativeFetch = globalThis.fetch; const cookie = await authenticate(nativeFetch, bff.baseUrl);
      const coreProbe = await nativeFetch(`${coreOrigin}${RUNTIME_ACTIVE_WORK_PATH}`);
      expect(coreProbe.status, await coreProbe.text()).toBe(200);
      const forwardingFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers); headers.set('Cookie', cookie);
        return nativeFetch(new URL(String(input), bff.baseUrl), { ...init, signal: undefined, headers });
      }) as typeof fetch;
      expect((await loadHomeActiveWork({ fetcher: forwardingFetch })).map((work) => work.workIdentity.workId)).toEqual([E2E_WORK_ID]);
      vi.stubGlobal('fetch', vi.fn(forwardingFetch));
      window.history.replaceState({}, '', '/home');
      render(<NavigationProvider><WorkSetupProvider><NavigationShell /></WorkSetupProvider></NavigationProvider>);
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: E2E_OBJECTIVE }));
      expect(window.location.pathname).toBe(`/work/${E2E_WORK_ID}`);
      expect(await screen.findByRole('heading', { name: E2E_OBJECTIVE, level: 1 })).toBeInTheDocument();
      expect(screen.getAllByText('75%').length).toBeGreaterThan(0);
      expect(screen.getByText('Phase 1/1 · Due 2099-01-01T00:00:00.000Z')).toBeInTheDocument();
    } finally { await bff.close(); coreServer.close(); await once(coreServer, 'close'); }
  });
});

async function authenticate(fetcher: typeof fetch, baseUrl: string): Promise<string> {
  const anonymous = await fetcher(`${baseUrl}/session`); const anonymousCookie = sessionCookiePair(anonymous.headers.get('set-cookie') ?? '');
  const csrf = anonymous.headers.get('x-csrf-token') ?? '';
  const login = await fetcher(`${baseUrl}/session/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: anonymousCookie, Origin: 'https://bff.test', 'X-CSRF-Token': csrf }, body: JSON.stringify({ username: 'active.operator', password: TEST_PASSWORD }) });
  expect(login.status).toBe(200); return sessionCookiePair(login.headers.get('set-cookie') ?? '');
}
