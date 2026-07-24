import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { buildRoutePath, resolveRouteLocation } from '../../routes/routeResolver';
import { WorkSetupProvider } from '../work-setup';
import { WorkSourcesPage } from './WorkSourcesPage';
import { workOverviewFixtures } from './workOverviewFixture';
import { workSourcesFixtures } from './workSourcesFixture';

function renderWorkSurface(pathname: string) {
  window.history.replaceState({}, '', pathname);

  return render(
    <NavigationProvider>
      <WorkSurface />
    </NavigationProvider>,
  );
}

describe('Work Sources', () => {
  it('reads workId and renders the official Sources fixture', () => {
    const work = workOverviewFixtures['work-001'];
    const sources = workSourcesFixtures['work-001'];
    renderWorkSurface('/work/work-001/sources');

    expect(screen.getByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sources' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'Sources', level: 2 })).toBeInTheDocument();
    expect(screen.getByText(`Overall coverage: ${sources.coverage}%`)).toBeInTheDocument();
    expect(screen.getByText(`${sources.summary.available} available`)).toBeInTheDocument();

    const page = screen.getByRole('main', { name: 'Work sources' });
    expect(within(page).getAllByRole('article')).toHaveLength(sources.sources.length);
    for (const source of sources.sources) {
      const card = within(page).getByRole('article', { name: source.title });
      expect(within(card).getByRole('heading', { name: source.title })).toBeInTheDocument();
      expect(within(card).getByText(source.statusLabel)).toBeInTheDocument();
      expect(within(card).getByText(/Freshness:/)).toBeInTheDocument();
      expect(within(card).getByText(`✣ ${source.insight}`)).toBeInTheDocument();
    }

    expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(sources.workId);
  });

  it('opens and closes the documented missing-source Drawer', async () => {
    const user = userEvent.setup();
    const source = workSourcesFixtures['work-001'].sources[0];
    renderWorkSurface('/work/work-001/sources');

    const card = screen.getByRole('article', { name: source.title });
    await user.click(within(card).getByRole('button', { name: 'Details' }));

    const drawer = screen.getByRole('dialog', { name: source.title });
    expect(within(drawer).getByText(source.detail!.summary)).toBeInTheDocument();
    expect(within(drawer).getByText(source.detail!.supports)).toBeInTheDocument();
    for (const item of [...source.detail!.keyEvidence, ...source.detail!.history]) {
      expect(within(drawer).getByText(item.label)).toBeInTheDocument();
    }

    await user.click(within(drawer).getByRole('button', { name: 'Close drawer' }));
    expect(screen.queryByRole('dialog', { name: source.title })).not.toBeInTheDocument();
  });

  it('opens Sources from People and navigates to the other Work tabs', async () => {
    const user = userEvent.setup();
    const workId = 'work-001';
    renderWorkSurface(`/work/${workId}/people`);

    await user.click(screen.getByRole('link', { name: 'Sources' }));
    expect(window.location.pathname).toBe(buildRoutePath('work.sources', { workId }));
    expect(screen.getByRole('main', { name: 'Work sources' })).toBeInTheDocument();

    const destinations = [
      ['Overview', 'work.overview'],
      ['Plan', 'work.plan'],
      ['Activity', 'work.activity'],
      ['People', 'work.people'],
      ['Decisions (1)', 'work.decisions'],
      ['Deliverables (2)', 'work.deliverables'],
    ] as const;

    for (const [label, routeName] of destinations) {
      await user.click(screen.getByRole('link', { name: 'Sources' }));
      await user.click(screen.getByRole('link', { name: label }));
      expect(window.location.pathname).toBe(buildRoutePath(routeName, { workId }));
    }
  });

  it('keeps the existing Shell around dynamic Work Sources', () => {
    window.history.replaceState({}, '', '/work/work-001/sources');

    render(
      <NavigationProvider>
        <WorkSetupProvider>
          <NavigationShell />
        </WorkSetupProvider>
      </NavigationProvider>,
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Work sources' })).toBeInTheDocument();
  });

  it('renders the loading state with existing loading primitives', () => {
    render(<WorkSourcesPage state="loading" />);

    expect(screen.getByRole('status', { name: 'Loading Work Sources' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders the empty state when no Sources fixture is available', () => {
    const { unmount } = renderWorkSurface('/work/work-002/sources');
    expect(screen.getByRole('heading', { name: 'No sources available' })).toBeInTheDocument();

    unmount();
    renderWorkSurface('/work/work-unknown/sources');
    expect(screen.getByRole('heading', { name: 'No sources available' })).toBeInTheDocument();
  });

  it('renders the error state', () => {
    render(<WorkSourcesPage state="error" />);

    expect(screen.getByRole('heading', { name: 'Sources unavailable' })).toBeInTheDocument();
    expect(screen.getByText('The Work Sources could not be displayed.')).toBeInTheDocument();
  });
});
