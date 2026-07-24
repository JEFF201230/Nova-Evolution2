import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { resolveRouteLocation } from '../../routes/routeResolver';
import { WorkSetupProvider } from '../work-setup';
import { WorkPlanPage } from './WorkPlanPage';
import { workOverviewFixtures } from './workOverviewFixture';
import { workPlanFixtures } from './workPlanFixture';

function renderWorkSurface(pathname: string) {
  window.history.replaceState({}, '', pathname);

  return render(
    <NavigationProvider>
      <WorkSurface />
    </NavigationProvider>,
  );
}

describe('Work Plan', () => {
  it('reads workId from the dynamic URL and renders the official Plan fixture', () => {
    const work = workOverviewFixtures['work-001'];
    const plan = workPlanFixtures['work-001'];
    renderWorkSurface('/work/work-001/plan');

    expect(screen.getByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plan' })).toHaveAttribute('aria-current', 'page');

    const planRegion = screen.getByRole('main', { name: 'Work plan' });
    for (const phase of plan.phases) {
      expect(within(planRegion).getByRole('heading', { name: phase.title })).toBeInTheDocument();
      expect(within(planRegion).getByText(`${phase.probability}% probability`)).toBeInTheDocument();
      for (const task of phase.tasks) {
        expect(within(planRegion).getByText(task.label)).toBeInTheDocument();
      }
    }

    expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(plan.workId);
  });

  it('opens Plan from Work Overview and preserves the current workId', async () => {
    const user = userEvent.setup();
    renderWorkSurface('/work/work-001');

    await user.click(screen.getByRole('link', { name: 'Plan' }));

    expect(window.location.pathname).toBe('/work/work-001/plan');
    expect(screen.getByRole('main', { name: 'Work plan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plan' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the existing Shell around the dynamic Work Plan', () => {
    window.history.replaceState({}, '', '/work/work-001/plan');

    render(
      <NavigationProvider>
        <WorkSetupProvider>
          <NavigationShell />
        </WorkSetupProvider>
      </NavigationProvider>,
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Work plan' })).toBeInTheDocument();
    expect(screen.queryByText('Route state')).not.toBeInTheDocument();
    expect(screen.queryByText('Navigation engine')).not.toBeInTheDocument();
  });

  it('renders the loading state with existing loading primitives', () => {
    render(<WorkPlanPage state="loading" />);

    expect(screen.getByRole('status', { name: 'Loading Work Plan' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders the empty state when no Plan fixture is available', () => {
    const { unmount } = renderWorkSurface('/work/work-002/plan');
    expect(screen.getByRole('heading', { name: 'No plan available' })).toBeInTheDocument();

    unmount();
    renderWorkSurface('/work/work-unknown/plan');
    expect(screen.getByRole('heading', { name: 'No plan available' })).toBeInTheDocument();
  });

  it('renders the error state', () => {
    render(<WorkPlanPage state="error" />);

    expect(screen.getByRole('heading', { name: 'Plan unavailable' })).toBeInTheDocument();
    expect(screen.getByText('The Work Plan could not be displayed.')).toBeInTheDocument();
  });
});
