import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { buildRoutePath, resolveRouteLocation } from '../../routes/routeResolver';
import { WorkSetupProvider } from '../work-setup';
import { workDecisionsFixtures } from './workDecisionsFixture';
import { WorkDecisionsPage } from './WorkDecisionsPage';
import { workOverviewFixtures } from './workOverviewFixture';

function renderWorkSurface(pathname: string) {
  window.history.replaceState({}, '', pathname);

  return render(
    <NavigationProvider>
      <WorkSurface />
    </NavigationProvider>,
  );
}

describe('Work Decisions', () => {
  it('reads workId and renders the official Decisions fixture', () => {
    const work = workOverviewFixtures['work-001'];
    const decisions = workDecisionsFixtures['work-001'];
    const decision = decisions.decisions[0];
    renderWorkSurface('/work/work-001/decisions');

    expect(screen.getByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Decisions (1)' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('heading', { name: 'Decisions', level: 2 })).toBeInTheDocument();

    const page = screen.getByRole('main', { name: 'Work decisions' });
    const card = within(page).getByRole('article', { name: decision.title });
    expect(within(card).getByText(`◷ ${decision.dueLabel}`)).toBeInTheDocument();
    expect(within(card).getByText(`${decision.confidence}%`)).toBeInTheDocument();
    expect(within(card).getByText(`✣ ${decision.recommendation}`)).toBeInTheDocument();
    expect(within(card).getByText(decision.approvedImpact)).toBeInTheDocument();
    expect(within(card).getByText(decision.rejectedImpact)).toBeInTheDocument();
    expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(decisions.workId);
  });

  it('opens the documented Decision route with the fixture decisionId', async () => {
    const user = userEvent.setup();
    const decision = workDecisionsFixtures['work-001'].decisions[0];
    renderWorkSurface('/work/work-001/decisions');

    await user.click(screen.getByRole('button', { name: 'Review & decide →' }));

    expect(window.location.pathname).toBe(
      buildRoutePath('decision.detail', { decisionId: decision.decisionId }),
    );
  });

  it('opens Decisions from Sources and navigates to the other Work tabs', async () => {
    const user = userEvent.setup();
    const workId = 'work-001';
    renderWorkSurface(`/work/${workId}/sources`);

    await user.click(screen.getByRole('link', { name: 'Decisions (1)' }));
    expect(window.location.pathname).toBe(buildRoutePath('work.decisions', { workId }));
    expect(screen.getByRole('main', { name: 'Work decisions' })).toBeInTheDocument();

    const destinations = [
      ['Overview', 'work.overview'],
      ['Plan', 'work.plan'],
      ['Activity', 'work.activity'],
      ['People', 'work.people'],
      ['Sources', 'work.sources'],
      ['Deliverables (2)', 'work.deliverables'],
    ] as const;

    for (const [label, routeName] of destinations) {
      await user.click(screen.getByRole('link', { name: 'Decisions (1)' }));
      await user.click(screen.getByRole('link', { name: label }));
      expect(window.location.pathname).toBe(buildRoutePath(routeName, { workId }));
    }
  });

  it('does not render a Drawer absent from the Work Decisions reference', () => {
    renderWorkSurface('/work/work-001/decisions');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the existing Shell around dynamic Work Decisions', () => {
    window.history.replaceState({}, '', '/work/work-001/decisions');

    render(
      <NavigationProvider>
        <WorkSetupProvider>
          <NavigationShell />
        </WorkSetupProvider>
      </NavigationProvider>,
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Work decisions' })).toBeInTheDocument();
  });

  it('renders the loading state with existing loading primitives', () => {
    render(<WorkDecisionsPage state="loading" />);

    expect(screen.getByRole('status', { name: 'Loading Work Decisions' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders the empty state when no Decisions fixture is available', () => {
    const { unmount } = renderWorkSurface('/work/work-002/decisions');
    expect(screen.getByRole('heading', { name: 'No decisions available' })).toBeInTheDocument();

    unmount();
    renderWorkSurface('/work/work-unknown/decisions');
    expect(screen.getByRole('heading', { name: 'No decisions available' })).toBeInTheDocument();
  });

  it('renders the error state', () => {
    render(<WorkDecisionsPage state="error" />);

    expect(screen.getByRole('heading', { name: 'Decisions unavailable' })).toBeInTheDocument();
    expect(screen.getByText('The Work Decisions could not be displayed.')).toBeInTheDocument();
  });
});
