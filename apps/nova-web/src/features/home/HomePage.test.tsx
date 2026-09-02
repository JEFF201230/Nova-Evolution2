import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { HomeActiveWorkItem } from '../../../../../contracts/home-active-work.contract';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { buildRoutePath, resolveRouteLocation } from '../../routes/routeResolver';
import { HomePage, type HomePageProps } from './HomePage';

const activeWorks: readonly HomeActiveWorkItem[] = [{
  workIdentity: {
    workId: 'HOME-001',
    projectId: 'NOVA',
  },
  mission: {
    projectId: 'NOVA',
    missionId: 'MISSION-HOME-001',
  },
  goal: 'Connect HOME Active Work to WCF-001',
  lifecycle: 'ACTIVE',
  progress: 50,
  updatedAt: '2026-07-30T12:00:00.000Z',
  provenance: {
    identity: {
      sourceDomain: 'MISSIONS',
      producer: 'ORCHESTRATOR_RUNTIME',
      sourceId: 'NOVA/MISSION-HOME-001',
      observedAt: '2026-07-30T11:00:00.000Z',
    },
    lifecycle: {
      sourceDomain: 'WORK',
      producer: 'WCF-001-LIFECYCLE-001',
      sourceId: 'NOVA/HOME-001/ACTIVE',
      observedAt: '2026-07-30T12:00:00.000Z',
    },
    progress: {
      sourceDomain: 'MONITORING',
      producer: 'ORCHESTRATOR_OBSERVABILITY',
      sourceId: 'OBS-HOME-001',
      observedAt: '2026-07-30T12:00:00.000Z',
      sequence: 3,
      correlationId: 'CORR-HOME-001',
      runId: 'RUN-HOME-001',
    },
  },
}];

const defaultProps: HomePageProps = {
  activeWork: activeWorks,
  onStartWorkSetup: vi.fn(),
};

function renderHome(props: Partial<HomePageProps> = {}) {
  window.history.replaceState({}, '', '/home');

  return render(
    <NavigationProvider>
      <HomePage {...defaultProps} {...props} />
    </NavigationProvider>,
  );
}

describe('HomePage', () => {
  it('renders only canonical Active Work business data and truthful unavailable states', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('1 active work item from Runtime.')).toBeInTheDocument();
    expect(screen.getByText('Situation insights are not available from Runtime.')).toBeInTheDocument();
    expect(screen.getByText('Decision information is not available on Home.')).toBeInTheDocument();
    expect(screen.getByText('Background work information is unavailable.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ACTIVE WORK' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Connect HOME Active Work to WCF-001' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Work HOME-001 · Mission MISSION-HOME-001 · ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('50% progress')).toBeInTheDocument();
    expect(screen.getByText('2026-07-30T12:00:00.000Z')).toBeInTheDocument();

    expect(screen.queryByText(/Sarah/)).not.toBeInTheDocument();
    expect(screen.queryByText(/€420k/)).not.toBeInTheDocument();
    expect(screen.queryByText(/76%/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open presentation' })).not.toBeInTheDocument();
  });

  it('opens every Active Work card with its canonical workIdentity.workId', async () => {
    const user = userEvent.setup();
    renderHome();

    for (const work of activeWorks) {
      await user.click(screen.getByRole('button', { name: work.goal }));
      expect(window.location.pathname).toBe(
        buildRoutePath('work.detail', { workId: work.workIdentity.workId }),
      );
      expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(
        work.workIdentity.workId,
      );
    }
  });

  it('loads Active Work from the canonical read service without a fixture fallback', async () => {
    const activeWorkLoader = vi.fn(async () => activeWorks);

    renderHome({
      activeWork: undefined,
      activeWorkLoader,
    });

    expect(
      await screen.findByRole('button', {
        name: 'Connect HOME Active Work to WCF-001',
      }),
    ).toBeInTheDocument();
    expect(activeWorkLoader).toHaveBeenCalledTimes(1);
    expect(screen.getByText('1 active work item from Runtime.')).toBeInTheDocument();
    expect(screen.queryByText('Prepare Q3 budget review presentation for the board')).not.toBeInTheDocument();
  });

  it('keeps canonical Active Work loading, empty, and error states explicit', async () => {
    const neverResolves = vi.fn(() => new Promise<readonly HomeActiveWorkItem[]>(() => undefined));
    const loadingView = renderHome({ activeWork: undefined, activeWorkLoader: neverResolves });

    expect(screen.getAllByText('Loading active work from Runtime.')).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('Loading active work from Runtime.');
    loadingView.unmount();

    const emptyView = renderHome({ activeWork: undefined, activeWorkLoader: vi.fn(async () => []) });
    expect(await screen.findAllByText('No active work returned by Runtime.')).toHaveLength(2);
    emptyView.unmount();

    renderHome({
      activeWork: undefined,
      activeWorkLoader: vi.fn(async () => { throw new Error('unavailable'); }),
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Active work could not be loaded from Runtime.',
    );
    expect(screen.getByText('Active work is temporarily unavailable.')).toBeInTheDocument();
  });

  it('renders truthful page-level loading, empty, error, and blocked states', () => {
    const { rerender } = renderHome({ state: 'loading' });
    expect(screen.getByText('Loading the Home interface.')).toBeInTheDocument();

    rerender(
      <NavigationProvider>
        <HomePage {...defaultProps} state="empty" />
      </NavigationProvider>,
    );
    expect(screen.getByRole('heading', { name: 'No active work yet' })).toBeInTheDocument();

    rerender(
      <NavigationProvider>
        <HomePage {...defaultProps} state="error" />
      </NavigationProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Home temporarily unavailable' })).toBeInTheDocument();

    rerender(
      <NavigationProvider>
        <HomePage {...defaultProps} state="blocked" />
      </NavigationProvider>,
    );
    expect(screen.getByText('Home cannot continue in its current state.')).toBeInTheDocument();
  });

  it('labels Objective Composer as frontend Work Setup and starts only with a non-empty objective', async () => {
    const user = userEvent.setup();
    const onStartWorkSetup = vi.fn();
    renderHome({ onStartWorkSetup });

    expect(screen.getByText(/frontend Work Setup flow/)).toBeInTheDocument();
    expect(screen.getByText(/does not create or execute a Runtime mission/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /What would you like to achieve/i }));
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    await user.type(screen.getByLabelText('What would you like to achieve?'), 'Prepare the launch review');
    await user.click(continueButton);
    expect(onStartWorkSetup).toHaveBeenCalledWith('Prepare the launch review');
  });
});
