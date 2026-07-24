import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SituationDetailsDrawer } from './SituationDetailsDrawer';

describe('SituationDetailsDrawer', () => {
  it('renders the exact official section hierarchy and content', () => {
    render(<SituationDetailsDrawer open onClose={vi.fn()} />);

    const drawer = screen.getByRole('dialog', { name: 'Situation details' });
    const headings = within(drawer)
      .getAllByRole('heading')
      .map((heading) => heading.textContent);

    expect(headings).toEqual([
      'Situation details',
      'Summary',
      'Why it matters',
      'What is blocking',
      'Later actions',
      'Technical details',
    ]);
    expect(
      within(drawer).getByText(/The board presentation is the highest priority item/),
    ).toBeInTheDocument();
    expect(
      within(drawer).getByText('3 open comments in revenue section — Sarah Chen'),
    ).toBeInTheDocument();
    expect(
      within(drawer).getByText('Schedule partner kickoff once legal clears'),
    ).toBeInTheDocument();
    expect(within(drawer).getByText('Documents analysed')).toBeInTheDocument();
    expect(within(drawer).getByText('3 of 4')).toBeInTheDocument();
    expect(within(drawer).getByText('~6 h')).toBeInTheDocument();
  });

  it('stays absent when closed', () => {
    render(<SituationDetailsDrawer open={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog', { name: 'Situation details' })).not.toBeInTheDocument();
  });
});
