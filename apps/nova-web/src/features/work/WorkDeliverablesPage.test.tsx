import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { buildRoutePath, resolveRouteLocation } from '../../routes/routeResolver';
import { WorkSetupProvider } from '../work-setup';
import { workDeliverablesFixtures } from './workDeliverablesFixture';
import { WorkDeliverablesPage } from './WorkDeliverablesPage';
import { workOverviewFixtures } from './workOverviewFixture';

function renderWorkSurface(pathname: string) {
  window.history.replaceState({}, '', pathname);

  return render(
    <NavigationProvider>
      <WorkSurface />
    </NavigationProvider>,
  );
}

describe('Work Deliverables', () => {
  it('reads workId and renders every official Deliverables fixture', () => {
    const work = workOverviewFixtures['work-001'];
    const deliverables = workDeliverablesFixtures['work-001'];
    renderWorkSurface('/work/work-001/deliverables');

    expect(screen.getByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Deliverables (2)' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('heading', { name: 'Deliverables', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/ })).toBeInTheDocument();

    const page = screen.getByRole('main', { name: 'Work deliverables' });
    expect(within(page).getAllByRole('article')).toHaveLength(deliverables.deliverables.length);

    for (const deliverable of deliverables.deliverables) {
      const card = within(page).getByRole('article', { name: deliverable.title });
      expect(within(card).getByRole('heading', { name: deliverable.title })).toBeInTheDocument();
      expect(within(card).getByText(`${deliverable.confidence}%`)).toBeInTheDocument();
      expect(within(card).getByText(`${deliverable.publicationScore}%`)).toBeInTheDocument();
      expect(within(card).getByText(`△ ${deliverable.alert}`)).toBeInTheDocument();
      expect(within(card).getByText(deliverable.nextAction)).toBeInTheDocument();
      expect(within(card).getByRole('progressbar')).toHaveValue(deliverable.publicationScore);
    }

    expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(deliverables.workId);
  });

  it('opens and closes the documented Deliverable Drawer', async () => {
    const user = userEvent.setup();
    const deliverable = workDeliverablesFixtures['work-001'].deliverables[0];
    renderWorkSurface('/work/work-001/deliverables');

    const card = screen.getByRole('article', { name: deliverable.title });
    await user.click(within(card).getByRole('button', { name: 'Details' }));

    const drawer = screen.getByRole('dialog', { name: deliverable.title });
    expect(within(drawer).getByText(deliverable.detail!.summary)).toBeInTheDocument();
    expect(within(drawer).getByText(deliverable.detail!.whyItMatters)).toBeInTheDocument();

    for (const blocker of deliverable.detail!.blocking) {
      expect(within(drawer).getByText(blocker)).toBeInTheDocument();
    }
    for (const metric of deliverable.detail!.keyEvidence) {
      expect(within(drawer).getByText(metric.label)).toBeInTheDocument();
      expect(within(drawer).getByText(metric.value)).toBeInTheDocument();
    }
    for (const entry of deliverable.detail!.history) {
      expect(within(drawer).getByText(entry.version)).toBeInTheDocument();
      expect(within(drawer).getByText(entry.description)).toBeInTheDocument();
    }
    for (const item of deliverable.detail!.technicalDetails) {
      expect(within(drawer).getByText(item.label)).toBeInTheDocument();
      expect(within(drawer).getByText(item.value)).toBeInTheDocument();
    }

    await user.click(within(drawer).getByRole('button', { name: 'Close drawer' }));
    expect(screen.queryByRole('dialog', { name: deliverable.title })).not.toBeInTheDocument();
  });

  it('does not invent an undocumented Drawer for the second Deliverable', async () => {
    const user = userEvent.setup();
    const deliverable = workDeliverablesFixtures['work-001'].deliverables[1];
    renderWorkSurface('/work/work-001/deliverables');

    const card = screen.getByRole('article', { name: deliverable.title });
    await user.click(within(card).getByRole('button', { name: 'Details' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens Deliverables from Decisions and navigates to the other Work tabs', async () => {
    const user = userEvent.setup();
    const workId = 'work-001';
    renderWorkSurface(`/work/${workId}/decisions`);

    await user.click(screen.getByRole('link', { name: 'Deliverables (2)' }));
    expect(window.location.pathname).toBe(buildRoutePath('work.deliverables', { workId }));
    expect(screen.getByRole('main', { name: 'Work deliverables' })).toBeInTheDocument();

    const destinations = [
      ['Overview', 'work.overview'],
      ['Plan', 'work.plan'],
      ['Activity', 'work.activity'],
      ['People', 'work.people'],
      ['Sources', 'work.sources'],
      ['Decisions (1)', 'work.decisions'],
    ] as const;

    for (const [label, routeName] of destinations) {
      await user.click(screen.getByRole('link', { name: 'Deliverables (2)' }));
      await user.click(screen.getByRole('link', { name: label }));
      expect(window.location.pathname).toBe(buildRoutePath(routeName, { workId }));
    }
  });

  it('keeps the existing Shell around dynamic Work Deliverables', () => {
    window.history.replaceState({}, '', '/work/work-001/deliverables');

    render(
      <NavigationProvider>
        <WorkSetupProvider>
          <NavigationShell />
        </WorkSetupProvider>
      </NavigationProvider>,
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Work deliverables' })).toBeInTheDocument();
  });

  it('renders the loading state with existing loading primitives', () => {
    render(<WorkDeliverablesPage state="loading" />);

    expect(screen.getByRole('status', { name: 'Loading Work Deliverables' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders the empty state when no Deliverables fixture is available', () => {
    const { unmount } = renderWorkSurface('/work/work-002/deliverables');
    expect(screen.getByRole('heading', { name: 'No deliverables available' })).toBeInTheDocument();

    unmount();
    renderWorkSurface('/work/work-unknown/deliverables');
    expect(screen.getByRole('heading', { name: 'No deliverables available' })).toBeInTheDocument();
  });

  it('renders the error state', () => {
    render(<WorkDeliverablesPage state="error" />);

    expect(screen.getByRole('heading', { name: 'Deliverables unavailable' })).toBeInTheDocument();
    expect(screen.getByText('The Work Deliverables could not be displayed.')).toBeInTheDocument();
  });
});
