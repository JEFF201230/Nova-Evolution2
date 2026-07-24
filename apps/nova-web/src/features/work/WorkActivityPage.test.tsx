import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { buildRoutePath, resolveRouteLocation } from '../../routes/routeResolver';
import { WorkSetupProvider } from '../work-setup';
import { WorkActivityPage } from './WorkActivityPage';
import { workActivityFixtures } from './workActivityFixture';
import { workOverviewFixtures } from './workOverviewFixture';

function renderWorkSurface(pathname: string) {
  window.history.replaceState({}, '', pathname);

  return render(
    <NavigationProvider>
      <WorkSurface />
    </NavigationProvider>,
  );
}

describe('Work Activity', () => {
  it('reads workId and renders every event from the official Activity fixture', () => {
    const work = workOverviewFixtures['work-001'];
    const activity = workActivityFixtures['work-001'];
    renderWorkSurface('/work/work-001/activity');

    expect(screen.getByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Activity' })).toHaveAttribute('aria-current', 'page');

    const activityRegion = screen.getByRole('main', { name: 'Work activity' });
    expect(within(activityRegion).getAllByRole('article')).toHaveLength(activity.events.length);
    for (const event of activity.events) {
      expect(within(activityRegion).getByText(event.summary)).toBeInTheDocument();
      if (event.detail) {
        expect(within(activityRegion).getByText(event.detail.headline)).toBeInTheDocument();
      }
    }

    expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(activity.workId);
  });

  it('reproduces the five documented Activity filters', async () => {
    const user = userEvent.setup();
    renderWorkSurface('/work/work-001/activity');

    const expectedCounts = [
      ['All', 8],
      ['Human', 3],
      ['AI', 5],
      ['Critical', 2],
      ['Sources', 3],
    ] as const;

    for (const [label, count] of expectedCounts) {
      const filter = screen.getByRole('button', { name: label });
      await user.click(filter);
      expect(filter).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getAllByRole('article')).toHaveLength(count);
    }
  });

  it('opens Activity from Plan and navigates to the other Work tabs', async () => {
    const user = userEvent.setup();
    const workId = 'work-001';
    renderWorkSurface(`/work/${workId}/plan`);

    await user.click(screen.getByRole('link', { name: 'Activity' }));
    expect(window.location.pathname).toBe(buildRoutePath('work.activity', { workId }));
    expect(screen.getByRole('main', { name: 'Work activity' })).toBeInTheDocument();

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
      await user.click(screen.getByRole('link', { name: label }));
      expect(window.location.pathname).toBe(buildRoutePath(routeName, { workId }));
    }
  });

  it('keeps the existing Shell around the dynamic Work Activity', () => {
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
    expect(screen.getByRole('main', { name: 'Work activity' })).toBeInTheDocument();
  });

  it('renders the loading state with existing loading primitives', () => {
    render(<WorkActivityPage state="loading" />);

    expect(screen.getByRole('status', { name: 'Loading Work Activity' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders the empty state when no Activity fixture is available', () => {
    const { unmount } = renderWorkSurface('/work/work-002/activity');
    expect(screen.getByRole('heading', { name: 'No activity available' })).toBeInTheDocument();

    unmount();
    renderWorkSurface('/work/work-unknown/activity');
    expect(screen.getByRole('heading', { name: 'No activity available' })).toBeInTheDocument();
  });

  it('renders the error state', () => {
    render(<WorkActivityPage state="error" />);

    expect(screen.getByRole('heading', { name: 'Activity unavailable' })).toBeInTheDocument();
    expect(screen.getByText('The Work Activity could not be displayed.')).toBeInTheDocument();
  });
});
