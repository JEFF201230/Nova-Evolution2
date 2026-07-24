import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Drawer,
  DrawerActionItem,
  DrawerActionList,
  DrawerAlertItem,
  DrawerAlertList,
  DrawerDivider,
  DrawerKeyValueRow,
  DrawerKeyValueTable,
  DrawerParagraph,
  DrawerSection,
  DrawerSectionTitle,
} from './Drawer';

function GenericDrawer({
  open = true,
  onClose = vi.fn(),
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Generic details">
      <DrawerSection>
        <DrawerSectionTitle>Summary</DrawerSectionTitle>
        <DrawerParagraph tone="primary">A reusable summary.</DrawerParagraph>
      </DrawerSection>
      <DrawerSection>
        <DrawerSectionTitle>Alerts</DrawerSectionTitle>
        <DrawerAlertList>
          <DrawerAlertItem>One blocker</DrawerAlertItem>
        </DrawerAlertList>
      </DrawerSection>
      <DrawerActionList>
        <DrawerActionItem>One action</DrawerActionItem>
      </DrawerActionList>
      <DrawerDivider />
      <DrawerKeyValueTable>
        <DrawerKeyValueRow label="Coverage" value="84%" />
      </DrawerKeyValueTable>
    </Drawer>
  );
}

describe('Drawer foundation', () => {
  it('does not render when closed', () => {
    render(<GenericDrawer open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a labelled modal with generic content primitives', () => {
    render(<GenericDrawer />);

    expect(screen.getByRole('dialog', { name: 'Generic details' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    expect(screen.getByRole('heading', { name: 'Summary' })).toBeInTheDocument();
    expect(screen.getByText('One blocker')).toBeInTheDocument();
    expect(screen.getByText('One action')).toBeInTheDocument();
    expect(screen.getByText('Coverage')).toBeInTheDocument();
    expect(screen.getByText('84%')).toBeInTheDocument();
  });

  it('closes from the close button, overlay, and Escape key', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<GenericDrawer onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close drawer' }));
    await user.click(screen.getByTestId('drawer-overlay'));
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('locks document scrolling while open and restores it on close', () => {
    const { rerender } = render(<GenericDrawer />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<GenericDrawer open={false} />);

    expect(document.body.style.overflow).toBe('');
  });
});
