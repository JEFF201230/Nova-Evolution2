import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Primary action</Button>);

    expect(screen.getByRole('button', { name: 'Primary action' })).toBeInTheDocument();
  });

  it('supports variants', () => {
    render(
      <div>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="quiet">Quiet</Button>
      </div>,
    );

    expect(screen.getByRole('button', { name: 'Primary' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Quiet' })).toBeVisible();
  });

  it('disables itself while loading', () => {
    render(<Button loading>Saving</Button>);

    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('triggers click handlers when enabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByRole('button', { name: 'Click me' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
