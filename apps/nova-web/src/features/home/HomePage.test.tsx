import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { buildRoutePath, resolveRouteLocation } from '../../routes/routeResolver';
import { homeFixture } from './homeFixture';
import { HomePage, type HomePageProps } from './HomePage';

const defaultProps: HomePageProps = {
  onOpenDecision: vi.fn(),
  onOpenDetails: vi.fn(),
  onOpenWork: vi.fn(),
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
  it('renders the default home experience', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: 'Good afternoon, Sarah.' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Spend 15 minutes resolving the comments today and validation probability rises from 76% to 92%.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open presentation' })).toBeInTheDocument();
    expect(screen.getByText('What would you like to achieve?')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ACTIVE WORK' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Working in background · You save approximately 6 hours of review this week · 1 conflict detected',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('CRM source reconciliation')).not.toBeInTheDocument();
    expect(screen.queryByText('Open comment review')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Prepare Q3 budget review presentation for the board' }),
    ).toBeInTheDocument();
  });

  it('routes Open Presentation and Pending Decision through their fixture identifiers', async () => {
    const user = userEvent.setup();
    const onOpenWork = vi.fn();
    const onOpenDecision = vi.fn();
    const onOpenDetails = vi.fn();

    renderHome({ onOpenDecision, onOpenDetails, onOpenWork });

    await user.click(screen.getByRole('button', { name: 'Open presentation' }));
    expect(window.location.pathname).toBe(
      buildRoutePath('work.detail', { workId: homeFixture.priorityInsight.workId }),
    );
    expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(
      homeFixture.priorityInsight.workId,
    );

    await user.click(
      screen.getByText('Approve Q3 budget increase of €420k for cloud infrastructure'),
    );
    expect(window.location.pathname).toBe(
      buildRoutePath('decision.detail', {
        decisionId: homeFixture.pendingDecision.decisionId,
      }),
    );
    expect(resolveRouteLocation(window.location.pathname).pathParams.decisionId).toBe(
      homeFixture.pendingDecision.decisionId,
    );

    expect(onOpenWork).not.toHaveBeenCalled();
    expect(onOpenDecision).not.toHaveBeenCalled();
    expect(onOpenDetails).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Background details' }));
    expect(onOpenDetails).toHaveBeenCalledTimes(1);
  });

  it('opens every Active Work card with its own workId', async () => {
    const user = userEvent.setup();
    const onOpenWork = vi.fn();

    renderHome({ onOpenWork });

    for (const work of homeFixture.activeWork) {
      await user.click(screen.getByRole('button', { name: work.title }));
      expect(window.location.pathname).toBe(
        buildRoutePath('work.detail', { workId: work.workId }),
      );
      expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(work.workId);
    }

    expect(onOpenWork).not.toHaveBeenCalled();
  });

  it('opens Situation details only from its Details CTA and closes through every supported method', async () => {
    const user = userEvent.setup();
    const onOpenWork = vi.fn();
    const onOpenDetails = vi.fn();

    renderHome({ onOpenDetails, onOpenWork });

    const detailsButton = screen.getByRole('button', { name: 'Details' });

    await user.click(screen.getByRole('button', { name: 'Why?' }));
    expect(screen.queryByRole('dialog', { name: 'Situation details' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open presentation' }));
    expect(window.location.pathname).toBe(
      buildRoutePath('work.detail', { workId: homeFixture.priorityInsight.workId }),
    );
    expect(onOpenWork).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Situation details' })).not.toBeInTheDocument();

    await user.click(detailsButton);
    expect(screen.getByRole('dialog', { name: 'Situation details' })).toBeInTheDocument();
    expect(onOpenDetails).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('drawer-overlay'));
    expect(screen.queryByRole('dialog', { name: 'Situation details' })).not.toBeInTheDocument();
    expect(detailsButton).toHaveFocus();

    await user.click(detailsButton);
    await user.click(screen.getByRole('button', { name: 'Close drawer' }));
    expect(screen.queryByRole('dialog', { name: 'Situation details' })).not.toBeInTheDocument();
    expect(detailsButton).toHaveFocus();

    await user.click(detailsButton);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Situation details' })).not.toBeInTheDocument();
    expect(detailsButton).toHaveFocus();
  });

  it('renders the loading state', () => {
    renderHome({ state: 'loading' });

    expect(screen.getByText('Loading Home')).toBeInTheDocument();
    expect(screen.getByText('NOVA is preparing the situational overview.')).toBeInTheDocument();
  });

  it('renders the empty state', () => {
    renderHome({ state: 'empty' });

    expect(screen.getByRole('heading', { name: 'No active work yet' })).toBeInTheDocument();
  });

  it('renders the error and blocked states', () => {
    const { rerender } = renderHome({ state: 'error' });

    expect(
      screen.getByRole('heading', { name: 'Home temporarily unavailable' }),
    ).toBeInTheDocument();

    rerender(
      <NavigationProvider>
        <HomePage {...defaultProps} state="blocked" />
      </NavigationProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Home blocked' })).toBeInTheDocument();
  });

  it('starts Work Setup only with a non-empty objective', async () => {
    const user = userEvent.setup();
    const onStartWorkSetup = vi.fn();

    renderHome({ onStartWorkSetup });

    await user.click(screen.getByRole('button', { name: /What would you like to achieve/i }));
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    await user.type(
      screen.getByLabelText('What would you like to achieve?'),
      'Prepare the launch review',
    );
    await user.click(continueButton);

    expect(onStartWorkSetup).toHaveBeenCalledWith('Prepare the launch review');
  });

  it('fills the objective from a suggestion before continuation', async () => {
    const user = userEvent.setup();
    const onStartWorkSetup = vi.fn();

    renderHome({ onStartWorkSetup });

    await user.click(
      screen.getByRole('button', { name: 'Prepare a board presentation on Q3 results' }),
    );
    expect(screen.getByLabelText('What would you like to achieve?')).toHaveValue(
      'Prepare a board presentation on Q3 results',
    );
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onStartWorkSetup).toHaveBeenCalledWith('Prepare a board presentation on Q3 results');
  });
});
