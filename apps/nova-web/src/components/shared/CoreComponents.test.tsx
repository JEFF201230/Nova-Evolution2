import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';
import { Progress } from './Progress';
import { Skeleton } from './Skeleton';
import { Spinner } from './Spinner';
import { Status } from './Status';

describe('core shared components', () => {
  it('renders badges with tones', () => {
    render(
      <div>
        <Badge tone="action">Action</Badge>
        <Badge tone="success">Success</Badge>
      </div>,
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders status labels', () => {
    render(
      <div>
        <Status value="available" label="Available" />
        <Status value="busy" label="Busy" />
        <Status value="away" label="Away" />
      </div>,
    );

    expect(screen.getByLabelText('Available')).toBeVisible();
    expect(screen.getByLabelText('Busy')).toBeVisible();
    expect(screen.getByLabelText('Away')).toBeVisible();
  });

  it('renders progress bars with accessible labels', () => {
    render(<Progress label="Coverage" value={72} />);

    expect(screen.getByText('Coverage')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '72');
  });

  it('renders spinners with live labels when provided', () => {
    render(<Spinner label="Loading data" />);

    expect(screen.getByRole('status', { name: 'Loading data' })).toBeInTheDocument();
  });

  it('renders skeletons as decorative placeholders', () => {
    const { container } = render(<Skeleton width="120px" height="16px" />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
