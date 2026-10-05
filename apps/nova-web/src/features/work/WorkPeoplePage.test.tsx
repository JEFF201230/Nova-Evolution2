import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkPeopleResponse } from '../../../../../contracts/work-people.contract';
import { WorkSurface } from '../../components/routes/WorkSurface';
import { NavigationProvider } from '../../routes/NavigationProvider';
import { WorkPeoplePage } from './WorkPeoplePage';

const RESPONSE: WorkPeopleResponse = { people: {
  workIdentity: { projectId: 'NOVA', workId: 'work-001' }, state: 'AVAILABLE',
  participants: [{ businessPersonId: 'person-1', workAssignmentId: 'assignment-1' }],
  qualification: {
    sourceDomain: 'PEOPLE', aggregateRevision: 2, lastEventSequence: 3,
    qualifiedAt: '2026-10-03T10:00:00.000Z',
    provenance: { authority: 'PEOPLE', businessCause: 'assignment', effectiveAt: '2026-10-02T10:00:00.000Z' },
  },
} };

function renderSurface() {
  window.history.replaceState({}, '', '/work/work-001/people');
  return render(<NavigationProvider><WorkSurface /></NavigationProvider>);
}

describe('Work People real path', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(RESPONSE), { status: 200, headers: { 'Content-Type': 'application/json' } })));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('loads real People data through the runtime service and keeps navigation', async () => {
    renderSurface();
    expect(screen.getByRole('status', { name: 'Loading Work People' })).toBeInTheDocument();
    const main = await screen.findByRole('main', { name: 'Work people' });
    expect(screen.getByRole('link', { name: 'People' })).toHaveAttribute('aria-current', 'page');
    expect(within(main).getByRole('article', { name: 'Business person person-1' })).toBeInTheDocument();
    expect(within(main).getByText('Assignment assignment-1')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/work/work-001/people', expect.objectContaining({ credentials: 'include' }));
  });

  it('shows only authoritative identifiers in participant details', async () => {
    const user = userEvent.setup();
    renderSurface();
    const card = await screen.findByRole('article', { name: 'Business person person-1' });
    await user.click(within(card).getByRole('button', { name: 'Details' }));
    const drawer = screen.getByRole('dialog', { name: 'person-1' });
    expect(within(drawer).getByText('assignment-1')).toBeInTheDocument();
    expect(within(drawer).getByText('PEOPLE')).toBeInTheDocument();
  });

  it.each([
    ['EMPTY', 'No active participants'],
    ['ABSENT', 'People data absent'],
    ['UNAVAILABLE', 'People unavailable'],
  ] as const)('renders the %s producer state explicitly', async (state, heading) => {
    const people = state === 'EMPTY'
      ? { ...RESPONSE.people, state, participants: [] }
      : { workIdentity: RESPONSE.people.workIdentity, state };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ people }), { status: 200 })));
    renderSurface();
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('renders transport errors separately from source unavailability', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));
    renderSurface();
    expect(await screen.findByText('The Work People could not be displayed.')).toBeInTheDocument();
  });

  it('renders direct loading and absent-work states', () => {
    const { rerender } = render(<NavigationProvider><WorkPeoplePage state="loading" workId="work-001" /></NavigationProvider>);
    expect(screen.getByRole('status', { name: 'Loading Work People' })).toBeInTheDocument();
    rerender(<NavigationProvider><WorkPeoplePage state="not-found" workId="work-001" /></NavigationProvider>);
    expect(screen.getByRole('heading', { name: 'Work not found' })).toBeInTheDocument();
  });
});
