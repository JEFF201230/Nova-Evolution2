import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  RuntimeEvent,
  RuntimeMission,
} from '../../../../../server/runtime/orchestrator/orchestrator-runtime.types';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { buildRoutePath, resolveRouteLocation } from '../../routes/routeResolver';
import { WorkSetupProvider } from '../work-setup';
import {
  NOVA_CORE_ORIGIN,
  WorkActivityPage,
  loadWorkActivity,
} from './WorkActivityPage';
import { workOverviewFixtures } from './workOverviewFixture';

const runtimeMission: RuntimeMission = {
  projectId: 'NOVA-CORE',
  missionId: 'work-001',
  missionType: 'READ_ONLY',
  objective: 'Prepare Q3 budget review presentation for the board',
  authority: 'HUMAN_OWNER',
  scope: { allowed: [], forbidden: [] },
  deliverables: [],
  stopCriteria: [],
  authorizedReferences: [],
  state: 'RUNNING',
  assignedAgentId: 'NOVA-DEVELOPER',
  lockId: 'lock-001',
  runId: 'run-001',
  contextId: 'context-001',
  reportId: null,
  updatedAt: '2026-07-30T10:00:00.000Z',
};

const runtimeEvents: RuntimeEvent[] = [
  {
    eventId: 'event-001',
    eventName: 'AgentStarted',
    projectId: 'NOVA-CORE',
    missionId: 'work-001',
    runId: 'run-001',
    correlationId: 'correlation-001',
    sequence: 1,
    sourceState: 'LOCKED',
    targetState: 'RUNNING',
    producer: 'orchestrator-runtime',
    occurredAt: '2026-07-30T10:00:00.000Z',
    publishedAt: '2026-07-30T10:00:00.001Z',
    payload: {},
    metadata: {},
  },
  {
    eventId: 'event-002',
    eventName: 'ExecutionFailed',
    projectId: 'NOVA-CORE',
    missionId: 'work-001',
    runId: 'run-001',
    correlationId: 'correlation-002',
    sequence: 2,
    sourceState: 'RUNNING',
    targetState: 'FAILED',
    producer: 'orchestrator-runtime',
    occurredAt: '2026-07-30T10:01:00.000Z',
    publishedAt: '2026-07-30T10:01:00.001Z',
    payload: {},
    metadata: {},
  },
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function installRuntimeFetch({
  events = runtimeEvents,
  missions = [runtimeMission],
}: {
  events?: RuntimeEvent[];
  missions?: RuntimeMission[];
} = {}) {
  const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
    const url = String(input);
    expect(init?.method).toBe('GET');
    expect(init?.body).toBeUndefined();

    if (url === `${NOVA_CORE_ORIGIN}/api/v1/missions`) {
      return jsonResponse({ missions });
    }
    if (url === `${NOVA_CORE_ORIGIN}/api/v1/missions/NOVA-CORE/work-001/events`) {
      return jsonResponse({ events });
    }
    return jsonResponse({ error: { code: 'ROUTE_NOT_FOUND' } }, 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderWorkSurface(pathname: string) {
  window.history.replaceState({}, '', pathname);

  return render(
    <NavigationProvider>
      <WorkSurface />
    </NavigationProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Work Activity Runtime read-only', () => {
  it('loads missions and renders Runtime events through GET-only Core v1 calls', async () => {
    const fetchMock = installRuntimeFetch();
    const work = workOverviewFixtures['work-001'];
    renderWorkSurface('/work/work-001/activity');

    expect(await screen.findByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Activity' })).toHaveAttribute('aria-current', 'page');

    const activityRegion = screen.getByRole('main', { name: 'Work activity' });
    expect(within(activityRegion).getAllByRole('article')).toHaveLength(runtimeEvents.length);
    for (const event of runtimeEvents) {
      expect(within(activityRegion).getByText(event.eventName)).toBeInTheDocument();
      expect(within(activityRegion).getByText(event.occurredAt)).toBeInTheDocument();
    }

    expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(runtimeMission.missionId);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      `${NOVA_CORE_ORIGIN}/api/v1/missions`,
      `${NOVA_CORE_ORIGIN}/api/v1/missions/NOVA-CORE/work-001/events`,
    ]);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.method).toBe('GET');
      expect(init?.body).toBeUndefined();
    }
  });

  it('keeps the five documented Activity filters on Runtime events', async () => {
    installRuntimeFetch();
    const user = userEvent.setup();
    renderWorkSurface('/work/work-001/activity');
    await screen.findByRole('main', { name: 'Work activity' });

    const expectedCounts = [
      ['All', 2],
      ['Human', 0],
      ['AI', 2],
      ['Critical', 1],
      ['Sources', 0],
    ] as const;

    for (const [label, count] of expectedCounts) {
      const filter = screen.getByRole('button', { name: label });
      await user.click(filter);
      expect(filter).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryAllByRole('article')).toHaveLength(count);
    }
  });

  it('opens Activity from Plan and navigates to the other Work tabs', async () => {
    installRuntimeFetch();
    const user = userEvent.setup();
    const workId = 'work-001';
    renderWorkSurface(`/work/${workId}/plan`);

    await user.click(screen.getByRole('link', { name: 'Activity' }));
    expect(window.location.pathname).toBe(buildRoutePath('work.activity', { workId }));
    expect(await screen.findByRole('main', { name: 'Work activity' })).toBeInTheDocument();

    const destinations = [
      ['Overview', 'work.overview'],
      ['Plan', 'work.plan'],
      ['People', 'work.people'],
      ['Sources', 'work.sources'],
      ['Decisions (1)', 'work.decisions'],
      ['Deliverables (2)', 'work.deliverables'],
    ] as const;

    for (const [label, routeName] of destinations) {
      await user.click(screen.getByRole('link', { name: 'Activity' }));
      await screen.findByRole('main', { name: 'Work activity' });
      await user.click(screen.getByRole('link', { name: label }));
      expect(window.location.pathname).toBe(buildRoutePath(routeName, { workId }));
    }
  });

  it('keeps the existing Shell around the dynamic Work Activity', async () => {
    installRuntimeFetch();
    window.history.replaceState({}, '', '/work/work-001/activity');

    render(
      <NavigationProvider>
        <WorkSetupProvider>
          <NavigationShell />
        </WorkSetupProvider>
      </NavigationProvider>,
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(await screen.findByRole('main', { name: 'Work activity' })).toBeInTheDocument();
  });

  it('renders the loading state with existing loading primitives', () => {
    render(<WorkActivityPage state="loading" />);

    expect(screen.getByRole('status', { name: 'Loading Work Activity' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders the empty state when the mission list is empty', async () => {
    const fetchMock = installRuntimeFetch({ missions: [] });
    renderWorkSurface('/work/work-001/activity');

    expect(await screen.findByRole('heading', { name: 'No activity available' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('renders the empty state when the mission has no Runtime events', async () => {
    installRuntimeFetch({ events: [] });
    renderWorkSurface('/work/work-001/activity');

    expect(await screen.findByRole('heading', { name: 'No activity available' })).toBeInTheDocument();
  });

  it('renders the error state after a Core API failure', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => jsonResponse({
      error: { code: 'RUNTIME_UNAVAILABLE' },
    }, 503));
    vi.stubGlobal('fetch', fetchMock);
    renderWorkSurface('/work/work-001/activity');

    expect(await screen.findByRole('heading', { name: 'Activity unavailable' })).toBeInTheDocument();
    expect(screen.getByText('The Work Activity could not be displayed.')).toBeInTheDocument();
  });

  it('rejects an invalid Core response without inventing a fallback contract', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => jsonResponse({ items: [] }));

    await expect(loadWorkActivity('work-001', { fetcher })).rejects.toThrow(
      'NOVA Core mission list response is invalid.',
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('preserves explicit empty and error visual states without a network call', () => {
    const fetchMock = vi.fn<typeof fetch>(async () => jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    const { unmount } = render(<WorkActivityPage state="empty" />);
    expect(screen.getByRole('heading', { name: 'No activity available' })).toBeInTheDocument();

    unmount();
    render(<WorkActivityPage state="error" />);
    expect(screen.getByRole('heading', { name: 'Activity unavailable' })).toBeInTheDocument();
    expect(screen.getByText('The Work Activity could not be displayed.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
