import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { WorkSetupProvider } from '../work-setup';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { buildRoutePath, resolveRouteLocation } from '../../routes/routeResolver';
import { WorkOverviewPage } from './WorkOverviewPage';
import { workOverviewFixtures } from './workOverviewFixture';
import { workOverviewTestResponse } from './workOverview.test-support';

function renderWorkSurface(pathname: string) {
  window.history.replaceState({}, '', pathname);

  return render(
    <NavigationProvider>
      <WorkSurface />
    </NavigationProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const workId = decodeURIComponent(String(input).split('/').at(-2) ?? '');
    const response = workOverviewTestResponse(workId);
    return new Response(response ? JSON.stringify(response) : '{}', { status: response ? 200 : 404, headers: { 'Content-Type': 'application/json' } });
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe('Work Overview', () => {
  it('reads workId from the dynamic URL and displays its authoritative response', async () => {
    const work = workOverviewFixtures['work-001'];
    renderWorkSurface('/work/work-001');

    expect(await screen.findByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(`Phase ${work.phase}/${work.phaseCount} · Due 2026-10-01T00:00:00.000Z`)).toBeInTheDocument();
    expect(screen.getByText(work.insight.summary)).toBeInTheDocument();
    expect(screen.getByText(work.insight.recommendation)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: work.nextAction.title })).toBeInTheDocument();
    expect(screen.getByText(`${work.laterActionCount} more — Later & Background`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: work.pendingDecision.title })).toBeInTheDocument();
    expect(screen.getByText(work.pendingDecision.consequence)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveValue(work.progress.value);

    const details = screen.getByRole('complementary', { name: 'Work overview details' });
    expect(within(details).getAllByText(work.progress.owner)).toHaveLength(2);
    for (const deliverable of work.deliverables) {
      expect(within(details).getByText(deliverable.title)).toBeInTheDocument();
    }
    const peopleCard = within(details).getByText('PEOPLE').parentElement;
    expect(peopleCard).not.toBeNull();
    for (const person of work.people) {
      expect(within(peopleCard!).getByText(person.name)).toBeInTheDocument();
    }
    expect(within(details).getByText(work.novaUpdate)).toBeInTheDocument();
    expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(work.workId);
  });

  it('selects the response matching another workId', async () => {
    const work = workOverviewFixtures['work-002'];
    renderWorkSurface('/work/work-002');

    expect(await screen.findByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: work.nextAction.title })).toBeInTheDocument();
  });

  it('navigates to every certified Work tab for the current workId', async () => {
    const user = userEvent.setup();
    const workId = 'work-001';
    const tabs = [
      ['Overview', 'work.overview'],
      ['Plan', 'work.plan'],
      ['Activity', 'work.activity'],
      ['People', 'work.people'],
      ['Sources', 'work.sources'],
      ['Decisions (1)', 'work.decisions'],
      ['Deliverables (2)', 'work.deliverables'],
    ] as const;

    renderWorkSurface(`/work/${workId}`);

    await screen.findByRole('heading', { name: workOverviewFixtures[workId].title });
    for (const [label, routeName] of tabs) {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('href', buildRoutePath(routeName, { workId }));
      await user.click(link);
      expect(window.location.pathname).toBe(buildRoutePath(routeName, { workId }));
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    }
  });

  it('keeps the existing shell around a dynamic Work Overview', async () => {
    const work = workOverviewFixtures['work-001'];
    window.history.replaceState({}, '', '/work/work-001');

    render(
      <NavigationProvider>
        <WorkSetupProvider>
          <NavigationShell />
        </WorkSetupProvider>
      </NavigationProvider>,
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
  });

  it('renders the loading state with existing loading primitives', () => {
    render(<WorkOverviewPage state="loading" />);

    expect(screen.getByRole('status', { name: 'Loading Work Overview' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders empty and error states for missing and unknown workIds', async () => {
    const { unmount } = renderWorkSurface('/work');
    expect(screen.getByRole('heading', { name: 'No work selected' })).toBeInTheDocument();

    unmount();
    renderWorkSurface('/work/work-unknown');
    expect(await screen.findByRole('heading', { name: 'Work unavailable' })).toBeInTheDocument();
  });

  it('renders the error state', () => {
    render(<WorkOverviewPage state="error" />);

    expect(screen.getByRole('heading', { name: 'Work unavailable' })).toBeInTheDocument();
    expect(screen.getByText('The Work Overview could not be displayed.')).toBeInTheDocument();
  });
});
