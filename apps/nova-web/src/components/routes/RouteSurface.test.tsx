import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RouteSurface } from './RouteSurface';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { WorkSetupProvider } from '../../features/work-setup';

describe('RouteSurface', () => {
  it('renders the four structural route surfaces', () => {
    window.history.replaceState({}, '', '/work');

    render(
      <NavigationProvider>
        <div>
          <RouteSurface routeId="home" />
          <RouteSurface routeId="work" />
          <RouteSurface routeId="decisions" />
          <RouteSurface routeId="deliverables" />
        </div>
      </NavigationProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No work selected' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Decisions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Deliverables' })).toBeInTheDocument();
    expect(screen.getByText('1 decision requires your authority · due in 4 days')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading deliverable evidence' })).toBeInTheDocument();
    expect(screen.queryByText('Decisions surface')).not.toBeInTheDocument();
    expect(screen.queryByText('Deliverables surface')).not.toBeInTheDocument();
  });

  it('renders the four Work Setup route surfaces', () => {
    render(
      <NavigationProvider>
        <WorkSetupProvider>
          <div>
            <RouteSurface routeId="clarify" enableWorkSetup />
            <RouteSurface routeId="canvas" enableWorkSetup />
            <RouteSurface routeId="plan" enableWorkSetup />
            <RouteSurface routeId="confirm" enableWorkSetup />
          </div>
        </WorkSetupProvider>
      </NavigationProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Clarify', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Canvas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('filters global Decisions and opens only actionable decision packages', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/decisions');

    render(
      <NavigationProvider>
        <RouteSurface routeId="decisions" />
      </NavigationProvider>,
    );

    const filters = screen.getByRole('group', { name: 'Decision filters' });
    expect(within(filters).getByRole('button', { name: 'All 3' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getAllByRole('link', { name: /Open decision package:/ })).toHaveLength(2);
    expect(screen.getByText('Approved with conditions')).toBeInTheDocument();

    await user.click(within(filters).getByRole('button', { name: 'Needs my decision 1' }));
    expect(screen.getByText(/Approve Q3 budget increase/)).toBeInTheDocument();
    expect(screen.queryByText(/Select primary data analytics vendor/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Open decision package:/ }));
    expect(window.location.pathname).toBe('/decisions/decision-001/package');
  });

});
