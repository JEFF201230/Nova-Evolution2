import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../shared/Button';
import { Card } from './Card';
import { EmptyState } from './EmptyState';
import { PageContainer } from './PageContainer';
import { Panel } from './Panel';
import { Section } from './Section';
import { Surface } from './Surface';

describe('surface components', () => {
  it('renders a card with title and footer', () => {
    render(
      <Card heading="Work item" description="Card description" footer="Footer">
        Body content
      </Card>,
    );

    expect(screen.getByRole('heading', { name: 'Work item' })).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders a selected panel with actions', () => {
    render(
      <Panel heading="Panel" description="Details" selected actions={<Button>Action</Button>}>
        Panel content
      </Panel>,
    );

    expect(screen.getByRole('heading', { name: 'Panel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('renders a section with semantic heading', () => {
    render(
      <Section heading="Section title" description="Section description">
        Section body
      </Section>,
    );

    expect(screen.getByRole('heading', { name: 'Section title' })).toBeInTheDocument();
    expect(screen.getByText('Section body')).toBeInTheDocument();
  });

  it('renders a page container', () => {
    render(
      <PageContainer>
        <span>Container content</span>
      </PageContainer>,
    );

    expect(screen.getByText('Container content')).toBeInTheDocument();
  });

  it('renders an empty state with actions', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <EmptyState
        heading="Nothing here"
        description="Create the first item."
        actionLabel="Create item"
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Create item' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders a loading surface state', () => {
    const { container } = render(<Surface loading>Loading surface</Surface>);

    expect(screen.getByText('Loading surface')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
  });
});
