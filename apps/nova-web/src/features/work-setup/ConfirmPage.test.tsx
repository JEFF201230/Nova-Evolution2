import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { ConfirmPage } from './ConfirmPage';
import { WorkSetupProvider } from './WorkSetupProvider';

function renderConfirm() {
  window.history.replaceState({}, '', '/confirm');
  render(
    <NavigationProvider>
      <WorkSetupProvider>
        <ConfirmPage />
      </WorkSetupProvider>
    </NavigationProvider>,
  );
}

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

afterEach(() => vi.unstubAllGlobals());

describe('Confirm real Mission flow', () => {
  it('prevents a double submit while project discovery is pending', async () => {
    let resolveProjects: ((response: Response) => void) | undefined;
    const projectResponse = new Promise<Response>((resolve) => { resolveProjects = resolve; });
    let missionId = '';
    const fetcher = vi.fn(async (request: RequestInfo | URL, init?: RequestInit) => {
      const path = String(request);
      if (path === '/api/mission-runtime/projects') return await projectResponse;
      if (path === '/session') return json({}, 200, { 'X-CSRF-Token': 'csrf' });
      if (path === '/api/mission-runtime/missions') {
        missionId = (JSON.parse(String(init?.body)) as { missionId: string }).missionId;
        return json({ created: true, mission: { projectId: 'PROJECT-1', missionId } }, 201);
      }
      return json({ mission: { projectId: 'PROJECT-1', missionId }, report: {} });
    });
    vi.stubGlobal('fetch', fetcher);
    renderConfirm();
    fireEvent.change(screen.getByLabelText('Allowed repository paths (one per line)'), {
      target: { value: 'apps/nova-web/src/**' },
    });

    const create = screen.getByRole('button', { name: 'Create work' });
    fireEvent.click(create);
    fireEvent.click(create);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(create).toBeDisabled();
    resolveProjects?.(json({ projects: [{ projectId: 'PROJECT-1' }] }));
    await waitFor(() => expect(window.location.pathname).toBe(`/work/${missionId}/overview`));
    expect(fetcher.mock.calls.filter(([path]) => String(path) === '/api/mission-runtime/missions')).toHaveLength(1);
  });

  it('shows 401 without navigation and reuses the Mission identity on retry', async () => {
    const createdIds: string[] = [];
    let createAttempt = 0;
    const fetcher = vi.fn(async (request: RequestInfo | URL, init?: RequestInit) => {
      const path = String(request);
      if (path === '/api/mission-runtime/projects') return json({ projects: [{ projectId: 'PROJECT-1' }] });
      if (path === '/session') return json({}, 200, { 'X-CSRF-Token': 'csrf' });
      if (path === '/api/mission-runtime/missions') {
        const id = (JSON.parse(String(init?.body)) as { missionId: string }).missionId;
        createdIds.push(id);
        createAttempt += 1;
        return createAttempt === 1
          ? json({ error: { code: 'AUTHENTICATION_REQUIRED' } }, 401)
          : json({ created: false, mission: { projectId: 'PROJECT-1', missionId: id } });
      }
      const id = createdIds.at(-1) ?? '';
      return json({ mission: { projectId: 'PROJECT-1', missionId: id }, report: {} });
    });
    vi.stubGlobal('fetch', fetcher);
    renderConfirm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Allowed repository paths (one per line)'), 'apps/nova-web/src/**');

    await user.click(screen.getByRole('button', { name: 'Create work' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Mission creation failed (HTTP 401).');
    expect(window.location.pathname).toBe('/confirm');

    await user.click(screen.getByRole('button', { name: 'Create work' }));
    await waitFor(() => expect(window.location.pathname).toBe(`/work/${createdIds[0]}/overview`));
    expect(createdIds).toHaveLength(2);
    expect(createdIds[1]).toBe(createdIds[0]);
  });

  it('fails closed without an explicit allowed scope', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    renderConfirm();

    await userEvent.click(screen.getByRole('button', { name: 'Create work' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Allowed scope must contain');
    expect(window.location.pathname).toBe('/confirm');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('keeps an execution 403 visible and does not navigate', async () => {
    let missionId = '';
    const fetcher = vi.fn(async (request: RequestInfo | URL, init?: RequestInit) => {
      const path = String(request);
      if (path === '/api/mission-runtime/projects') return json({ projects: [{ projectId: 'PROJECT-1' }] });
      if (path === '/session') return json({}, 200, { 'X-CSRF-Token': 'csrf' });
      if (path === '/api/mission-runtime/missions') {
        missionId = (JSON.parse(String(init?.body)) as { missionId: string }).missionId;
        return json({ created: true, mission: { projectId: 'PROJECT-1', missionId } }, 201);
      }
      return json({ error: { code: 'AUTHORIZATION_FORBIDDEN' } }, 403);
    });
    vi.stubGlobal('fetch', fetcher);
    renderConfirm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Allowed repository paths (one per line)'), 'apps/nova-web/src/**');

    await user.click(screen.getByRole('button', { name: 'Create work' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Mission execution failed (HTTP 403).');
    expect(window.location.pathname).toBe('/confirm');
  });
});
