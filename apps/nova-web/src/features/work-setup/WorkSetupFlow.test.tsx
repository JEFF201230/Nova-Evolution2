import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../../App';

async function startWorkSetup(objective: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /What would you like to achieve/i }));
  await user.type(screen.getByLabelText('What would you like to achieve?'), objective);
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  return user;
}

async function completeClarify(user: ReturnType<typeof userEvent.setup>) {
  for (let index = 0; index < 3; index += 1) {
    await user.type(screen.getByLabelText('Clarify answer'), `Answer ${index + 1}`);
    await user.click(
      screen.getByRole('button', { name: index === 2 ? 'Review understanding' : 'Continue' }),
    );
  }
}

describe('Work Setup flow', () => {
  it('navigates Home → Clarify → Canvas → Plan → Confirm → Work and retains state', async () => {
    window.history.replaceState({}, '', '/home');
    render(<App />);

    const user = await startWorkSetup('Prepare the Q3 launch review');
    expect(window.location.pathname).toBe('/clarify');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

    await completeClarify(user);
    expect(window.location.pathname).toBe('/canvas');
    expect(screen.getByText('Prepare the Q3 launch review')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
    expect(screen.getByText('Objective captured from Home')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Prepare a plan' }));
    expect(window.location.pathname).toBe('/plan');
    expect(screen.getAllByText(/Phase [1-4]/)).toHaveLength(4);

    await user.click(screen.getByRole('button', { name: 'Continue to confirm' }));
    expect(window.location.pathname).toBe('/confirm');
    expect(screen.getByText('Objective: Prepare the Q3 launch review')).toBeInTheDocument();
    expect(screen.getByText('Clarify answers: 3')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /A2 — Delegated execution/ }));
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(window.location.pathname).toBe('/plan');
    await user.click(screen.getByRole('button', { name: 'Continue to confirm' }));
    expect(screen.getByRole('radio', { name: /A2 — Delegated execution/ })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Create work' }));
    expect(window.location.pathname).toBe('/work');
    expect(screen.getByRole('heading', { name: 'No work selected' })).toBeInTheDocument();
  });

  it.each([
    ['/clarify', '/home'],
    ['/canvas', '/clarify'],
    ['/plan', '/canvas'],
    ['/confirm', '/plan'],
  ])('implements Back from %s to %s', async (source, target) => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', source);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(window.location.pathname).toBe(target);
  });

  it('synchronizes Work Setup routes with browser back and forward', async () => {
    window.history.replaceState({}, '', '/home');
    render(<App />);
    const user = await startWorkSetup('Browser navigation objective');
    await completeClarify(user);
    expect(window.location.pathname).toBe('/canvas');

    act(() => window.history.back());
    await waitFor(() => expect(window.location.pathname).toBe('/clarify'));
    expect(screen.getByRole('heading', { name: 'Clarify', level: 3 })).toBeInTheDocument();

    act(() => window.history.forward());
    await waitFor(() => expect(window.location.pathname).toBe('/canvas'));
    expect(screen.getByRole('heading', { name: 'Canvas' })).toBeInTheDocument();
  });

  it.each([
    ['/home', 'Home'],
    ['/work', 'No work selected'],
    ['/decisions', 'Decisions'],
    ['/deliverables', 'Deliverables'],
    ['/lab', 'NOVA UI Playground'],
    ['/shell', 'NOVA Application Shell'],
  ])('keeps the existing route %s operational', (path, heading) => {
    window.history.replaceState({}, '', path);
    render(<App />);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
