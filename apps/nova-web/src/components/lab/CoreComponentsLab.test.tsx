import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NOVAUIPlayground } from './NOVAUIPlayground';

describe('NOVAUIPlayground', () => {
  it('renders the technical demonstration page', () => {
    render(<NOVAUIPlayground />);

    expect(screen.getByRole('heading', { name: 'NOVA UI Playground' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Button' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Badge' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Spinner' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Skeleton' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Structural Routes' })).toBeInTheDocument();
  });
});
