import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SituationDetailsDrawer } from './SituationDetailsDrawer';

describe('SituationDetailsDrawer', () => {
  it('renders only a truthful unavailable state', () => {
    render(<SituationDetailsDrawer open onClose={vi.fn()} />);

    const drawer = screen.getByRole('dialog', { name: 'Situation details' });
    expect(within(drawer).getByRole('heading', { name: 'Unavailable' })).toBeInTheDocument();
    expect(
      within(drawer).getByText('Situation details are not available from the canonical Home Runtime contract.'),
    ).toBeInTheDocument();
    expect(within(drawer).queryByText(/Sarah/)).not.toBeInTheDocument();
    expect(within(drawer).queryByText(/76%/)).not.toBeInTheDocument();
    expect(within(drawer).queryByText(/~6 h/)).not.toBeInTheDocument();
  });

  it('stays absent when closed', () => {
    render(<SituationDetailsDrawer open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog', { name: 'Situation details' })).not.toBeInTheDocument();
  });
});
