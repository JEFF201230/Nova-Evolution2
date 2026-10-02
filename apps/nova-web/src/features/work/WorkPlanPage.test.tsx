import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkPlanResponse } from '../../../../../contracts/work-plan.contract';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { WorkSetupProvider } from '../work-setup';
import { WorkPlanPage } from './WorkPlanPage';
import { workOverviewTestResponse } from './workOverview.test-support';

const AVAILABLE: WorkPlanResponse = {
  plan: {
    workIdentity: { projectId: 'NOVA', workId: 'work-001' },
    state: 'AVAILABLE',
    phase: { current: 2, total: 3, phaseId: 'review' },
    dueAt: '2026-10-31T17:00:00.000Z',
    dependencies: [{ prerequisite: 'draft', dependent: 'review' }],
  },
};

beforeEach(() => {
  vi.stubGlobal('fetch', defaultFetch());
});

afterEach(() => vi.unstubAllGlobals());

function defaultFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = url.endsWith('/overview')
      ? workOverviewTestResponse('work-001')
      : AVAILABLE;
    return jsonResponse(body);
  });
}

function renderWorkSurface(pathname: string) {
  window.history.replaceState({}, '', pathname);
  return render(
    <NavigationProvider>
      <WorkSurface />
    </NavigationProvider>,
  );
}

describe('Work Plan runtime path', () => {
  it('loads the URL workId once from the authenticated BFF service and renders real Planning data', async () => {
    const fetcher = vi.mocked(fetch);
    renderWorkSurface('/work/work-001/plan');

    expect(screen.getByRole('status', { name: 'Loading Work Plan' })).toBeInTheDocument();
    const planRegion = await screen.findByRole('main', { name: 'Work plan' });
    expect(within(planRegion).getByRole('heading', { name: 'Current phase: review' })).toBeInTheDocument();
    expect(within(planRegion).getByText('Phase 2 of 3')).toBeInTheDocument();
    expect(within(planRegion).getByText('draft')).toBeInTheDocument();
    expect(within(planRegion).getByText('review')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'work-001', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plan' })).toHaveAttribute('aria-current', 'page');

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('/api/work/work-001/plan', expect.objectContaining({
      method: 'GET',
      credentials: 'include',
    }));
    expect(screen.queryByText('Board-ready draft approved by all reviewers')).not.toBeInTheDocument();
  });

  it('opens Plan from real Work Overview and preserves workId', async () => {
    const user = userEvent.setup();
    renderWorkSurface('/work/work-001');
    await user.click(await screen.findByRole('link', { name: 'Plan' }));
    expect(window.location.pathname).toBe('/work/work-001/plan');
    expect(await screen.findByRole('main', { name: 'Work plan' })).toBeInTheDocument();
    expect(vi.mocked(fetch).mock.calls.map(([input]) => String(input))).toEqual([
      '/api/work/work-001/overview',
      '/api/work/work-001/plan',
    ]);
  });

  it('keeps the existing Shell around the dynamic real Work Plan', async () => {
    window.history.replaceState({}, '', '/work/work-001/plan');
    render(
      <NavigationProvider>
        <WorkSetupProvider>
          <NavigationShell />
        </WorkSetupProvider>
      </NavigationProvider>,
    );
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByRole('main', { name: 'Work plan' })).toBeInTheDocument();
  });

  it('keeps loading visible while the BFF request is pending', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => undefined)));
    renderWorkSurface('/work/work-001/plan');
    expect(screen.getByRole('status', { name: 'Loading Work Plan' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders Planning absence without fixture fallback', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      plan: { workIdentity: { projectId: 'NOVA', workId: 'work-001' }, state: 'ABSENT' },
    })));
    renderWorkSurface('/work/work-001/plan');
    expect(await screen.findByRole('heading', { name: 'No plan available' })).toBeInTheDocument();
    expect(screen.queryByRole('main', { name: 'Work plan' })).not.toBeInTheDocument();
  });

  it('renders producer unavailable separately from transport error and missing Work', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        plan: { workIdentity: { projectId: 'NOVA', workId: 'work-001' }, state: 'UNAVAILABLE' },
      }))
      .mockResolvedValueOnce(jsonResponse({ error: { code: 'INTERNAL_ERROR' } }, 503))
      .mockResolvedValueOnce(jsonResponse({ error: { code: 'WORK_NOT_FOUND' } }, 404));
    vi.stubGlobal('fetch', fetcher);

    const first = renderWorkSurface('/work/work-001/plan');
    expect(await screen.findByText('The Planning producer is currently unavailable.')).toBeInTheDocument();
    first.unmount();

    const second = renderWorkSurface('/work/work-001/plan');
    expect(await screen.findByText('The Work Plan could not be displayed.')).toBeInTheDocument();
    second.unmount();

    renderWorkSurface('/work/work-001/plan');
    expect(await screen.findByRole('heading', { name: 'Work not found' })).toBeInTheDocument();
  });

  it('renders isolated page states honestly', () => {
    const { rerender } = render(<WorkPlanPage state="withdrawn" />);
    expect(screen.getByRole('heading', { name: 'Plan withdrawn' })).toBeInTheDocument();
    rerender(<WorkPlanPage state="error" />);
    expect(screen.getByRole('heading', { name: 'Plan unavailable' })).toBeInTheDocument();
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
