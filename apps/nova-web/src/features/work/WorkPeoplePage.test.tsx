import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationShell } from '../../components/shell/NavigationShell';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { buildRoutePath, resolveRouteLocation } from '../../routes/routeResolver';
import { WorkSetupProvider } from '../work-setup';
import { WorkPeoplePage } from './WorkPeoplePage';
import { workOverviewFixtures } from './workOverviewFixture';
import { workPeopleFixtures } from './workPeopleFixture';

function renderWorkSurface(pathname: string) {
  window.history.replaceState({}, '', pathname);

  return render(
    <NavigationProvider>
      <WorkSurface />
    </NavigationProvider>,
  );
}

describe('Work People', () => {
  it('reads workId and renders the official People fixture', () => {
    const work = workOverviewFixtures['work-001'];
    const people = workPeopleFixtures['work-001'];
    renderWorkSurface('/work/work-001/people');

    expect(screen.getByRole('heading', { name: work.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'People' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'People & experts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Invite/ })).toBeInTheDocument();

    const page = screen.getByRole('main', { name: 'Work people' });
    expect(within(page).getAllByRole('article')).toHaveLength(people.people.length);
    for (const person of people.people) {
      const card = within(page).getByRole('article', { name: person.name });
      expect(within(card).getByRole('heading', { name: person.name })).toBeInTheDocument();
      expect(within(card).getByText(`${person.role} · ${person.availability}`)).toBeInTheDocument();
      expect(within(card).getByText(person.responsibility)).toBeInTheDocument();
    }

    expect(resolveRouteLocation(window.location.pathname).pathParams.workId).toBe(people.workId);
  });

  it('opens every documented People drawer from its Details CTA', async () => {
    const user = userEvent.setup();
    const people = workPeopleFixtures['work-001'];
    renderWorkSurface('/work/work-001/people');

    for (const person of people.people) {
      const card = screen.getByRole('article', { name: person.name });
      await user.click(within(card).getByRole('button', { name: 'Details' }));

      const drawer = screen.getByRole('dialog', { name: person.name });
      expect(within(drawer).getByText(person.details.summary)).toBeInTheDocument();
      expect(within(drawer).getByText(person.details.whyItMatters)).toBeInTheDocument();
      for (const skill of person.details.skills) {
        expect(within(drawer).getByText(skill)).toBeInTheDocument();
      }

      await user.click(within(drawer).getByRole('button', { name: 'Close drawer' }));
      expect(screen.queryByRole('dialog', { name: person.name })).not.toBeInTheDocument();
    }
  });

  it('opens People from Activity and navigates to the other Work tabs', async () => {
    const user = userEvent.setup();
    const workId = 'work-001';
    renderWorkSurface(`/work/${workId}/activity`);

    await user.click(screen.getByRole('link', { name: 'People' }));
    expect(window.location.pathname).toBe(buildRoutePath('work.people', { workId }));
    expect(screen.getByRole('main', { name: 'Work people' })).toBeInTheDocument();

    const destinations = [
      ['Overview', 'work.overview'],
      ['Plan', 'work.plan'],
      ['Activity', 'work.activity'],
      ['Sources', 'work.sources'],
      ['Decisions (1)', 'work.decisions'],
      ['Deliverables (2)', 'work.deliverables'],
    ] as const;

    for (const [label, routeName] of destinations) {
      await user.click(screen.getByRole('link', { name: 'People' }));
      await user.click(screen.getByRole('link', { name: label }));
      expect(window.location.pathname).toBe(buildRoutePath(routeName, { workId }));
    }
  });

  it('keeps the existing Shell around dynamic Work People', () => {
    window.history.replaceState({}, '', '/work/work-001/people');

    render(
      <NavigationProvider>
        <WorkSetupProvider>
          <NavigationShell />
        </WorkSetupProvider>
      </NavigationProvider>,
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Work people' })).toBeInTheDocument();
  });

  it('renders the loading state with existing loading primitives', () => {
    render(<WorkPeoplePage state="loading" />);

    expect(screen.getByRole('status', { name: 'Loading Work People' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders the empty state when no People fixture is available', () => {
    const { unmount } = renderWorkSurface('/work/work-002/people');
    expect(screen.getByRole('heading', { name: 'No people available' })).toBeInTheDocument();

    unmount();
    renderWorkSurface('/work/work-unknown/people');
    expect(screen.getByRole('heading', { name: 'No people available' })).toBeInTheDocument();
  });

  it('renders the error state', () => {
    render(<WorkPeoplePage state="error" />);

    expect(screen.getByRole('heading', { name: 'People unavailable' })).toBeInTheDocument();
    expect(screen.getByText('The Work People could not be displayed.')).toBeInTheDocument();
  });
});
