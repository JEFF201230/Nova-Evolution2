import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { NavigationShell } from './NavigationShell';
import { WorkSetupProvider } from '../../features/work-setup';
import { buildRoutePath } from '../../routes/routeResolver';

function renderNavigationShell(pathname = '/home') {
  window.history.replaceState({}, '', pathname);

  return render(
    <NavigationProvider>
      <WorkSetupProvider>
        <NavigationShell />
      </WorkSetupProvider>
    </NavigationProvider>,
  );
}

function getPrimaryNavigation() {
  return within(screen.getByRole('navigation', { name: 'Application navigation' }));
}

function dispatchPopState(pathname: string) {
  act(() => {
    window.history.pushState({}, '', pathname);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

describe('NavigationShell', () => {
  it('renders the shell and changes active route', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderNavigationShell('/home?tab=overview');

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Situation insights are not available from Runtime.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByLabelText('NOVA')).toHaveLength(1);
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.queryByText('Primary')).not.toBeInTheDocument();
    expect(screen.queryByText('Structure only.')).not.toBeInTheDocument();
    expect(screen.queryByText('Utilities')).not.toBeInTheDocument();
    expect(screen.queryByText('Source-only shell utilities.')).not.toBeInTheDocument();
    expect(screen.queryByText('LOT 001 foundation baseline')).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-navigation-icon]')).toHaveLength(8);
    expect(
      screen.getByRole('link', { name: 'Home' }).querySelector('[data-navigation-icon="home"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Work' }).querySelector('[data-navigation-icon="work"]'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('link', { name: 'Decisions' })
        .querySelector('[data-navigation-icon="decisions"]'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('link', { name: 'Deliverables' })
        .querySelector('[data-navigation-icon="deliverables"]'),
    ).toBeInTheDocument();

    const navigation = getPrimaryNavigation();
    const referenceWorkPath = buildRoutePath('work');

    expect(navigation.getByRole('link', { name: 'Work' })).toHaveAttribute(
      'href',
      `${referenceWorkPath}?tab=overview`,
    );
    await user.click(navigation.getByRole('link', { name: 'Work' }));

    expect(window.location.pathname).toBe(referenceWorkPath);
    expect(navigation.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'No work selected' })).toBeInTheDocument();

    await user.click(navigation.getByRole('link', { name: 'Decisions' }));
    expect(window.location.pathname).toBe('/decisions');
    expect(navigation.getByRole('link', { name: 'Decisions' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.queryByRole('navigation', { name: 'Work sections' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: 'Prepare Q3 budget review presentation for the board',
        level: 1,
      }),
    ).not.toBeInTheDocument();

    await user.click(navigation.getByRole('link', { name: 'Deliverables' }));
    expect(window.location.pathname).toBe('/deliverables');
    expect(navigation.getByRole('link', { name: 'Deliverables' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('heading', { name: 'Deliverables', level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Work sections' })).not.toBeInTheDocument();

    await user.click(navigation.getByRole('link', { name: 'Home' }));
    expect(window.location.pathname).toBe('/home');
    expect(navigation.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

    errorSpy.mockRestore();
  });

  it('keeps Home active throughout Work Setup without adding contextual entries to the rail', async () => {
    const homeRoutes = ['/home', '/clarify', '/canvas', '/plan', '/confirm'];
    renderNavigationShell(homeRoutes[0]);
    const navigation = getPrimaryNavigation();

    for (const pathname of homeRoutes) {
      dispatchPopState(pathname);

      await waitFor(() => {
        expect(navigation.getByRole('link', { name: 'Home' })).toHaveAttribute(
          'aria-current',
          'page',
        );
      });
    }

    expect(screen.queryByRole('link', { name: 'Clarify' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Canvas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Plan' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Confirm' })).not.toBeInTheDocument();
  });

  it('renders Work Overview without technical diagnostic panels', () => {
    renderNavigationShell('/work/work-001');

    expect(screen.getAllByLabelText('NOVA')).toHaveLength(1);
    expect(getPrimaryNavigation().getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(getPrimaryNavigation().getByRole('link', { name: 'Work' })).toBeInTheDocument();
    expect(getPrimaryNavigation().getByRole('link', { name: 'Decisions' })).toBeInTheDocument();
    expect(getPrimaryNavigation().getByRole('link', { name: 'Deliverables' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Prepare Q3 budget review presentation for the board',
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Route state')).not.toBeInTheDocument();
    expect(screen.queryByText('Navigation engine')).not.toBeInTheDocument();
    expect(screen.queryByText(/Active route:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/URL path:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Current route resolved from the URL.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Replace same route' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go home' })).not.toBeInTheDocument();
    expect(screen.queryByText('History API and URLSearchParams aware.')).not.toBeInTheDocument();
    expect(screen.queryByText('LOT 001 foundation baseline')).not.toBeInTheDocument();
    expect(screen.queryByText('React 18 / TypeScript / CSS Modules')).not.toBeInTheDocument();
  });

  it('keeps Work active on every dynamic Work route and preserves workId in contextual tabs', async () => {
    const workId = 'work-001';
    const workPaths = [
      buildRoutePath('work.detail', { workId }),
      buildRoutePath('work.overview', { workId }),
      buildRoutePath('work.plan', { workId }),
      buildRoutePath('work.activity', { workId }),
      buildRoutePath('work.people', { workId }),
      buildRoutePath('work.sources', { workId }),
      buildRoutePath('work.decisions', { workId }),
      buildRoutePath('work.deliverables', { workId }),
    ];

    renderNavigationShell(workPaths[0]);
    const navigation = getPrimaryNavigation();

    for (const pathname of workPaths) {
      dispatchPopState(pathname);

      await waitFor(() => {
        expect(navigation.getByRole('link', { name: 'Work' })).toHaveAttribute(
          'aria-current',
          'page',
        );
      });
    }

    const contextualNavigation = within(screen.getByRole('navigation', { name: 'Work sections' }));
    const expectedTabs = [
      ['Overview', 'work.overview'],
      ['Plan', 'work.plan'],
      ['Activity', 'work.activity'],
      ['People', 'work.people'],
      ['Sources', 'work.sources'],
      ['Decisions (1)', 'work.decisions'],
      ['Deliverables (2)', 'work.deliverables'],
    ] as const;

    for (const [label, routeName] of expectedTabs) {
      expect(contextualNavigation.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        buildRoutePath(routeName, { workId }),
      );
    }
  });

  it('keeps global Decisions active on its child routes and Deliverables active on its domain', async () => {
    const decisionId = 'decision-001';
    const routes = [
      ['/decisions', 'Decisions'],
      [buildRoutePath('decision.detail', { decisionId }), 'Decisions'],
      [buildRoutePath('decision.package', { decisionId }), 'Decisions'],
      [buildRoutePath('decision.pause', { decisionId }), 'Decisions'],
      [buildRoutePath('decision.receipt', { decisionId }), 'Decisions'],
      ['/deliverables', 'Deliverables'],
    ] as const;

    renderNavigationShell('/decisions');
    const navigation = getPrimaryNavigation();

    for (const [pathname, activeLabel] of routes) {
      dispatchPopState(pathname);

      await waitFor(() => {
        expect(navigation.getByRole('link', { name: activeLabel })).toHaveAttribute(
          'aria-current',
          'page',
        );
      });
    }
  });
});
