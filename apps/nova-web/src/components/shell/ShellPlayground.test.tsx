import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShellPlayground } from './ShellPlayground';

describe('ShellPlayground', () => {
  it('renders the shell playground layout', () => {
    render(<ShellPlayground />);

    expect(screen.getByRole('heading', { name: 'NOVA Application Shell' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shell Playground' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shell playground' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shell action' })).toBeInTheDocument();
  });
});
