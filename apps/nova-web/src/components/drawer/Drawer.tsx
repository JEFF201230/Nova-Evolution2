import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './Drawer.module.css';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  ariaDescription?: string;
}

export function Drawer({ open, onClose, title, children, ariaDescription }: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusCloseButton = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('[data-drawer-close]')?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusCloseButton);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={styles.root} data-testid="drawer-root">
      <DrawerOverlay onDismiss={onClose} />
      <DrawerPanel
        ref={panelRef}
        aria-describedby={ariaDescription ? descriptionId : undefined}
        aria-labelledby={titleId}
      >
        <DrawerHeader title={title} titleId={titleId} onClose={onClose} />
        {ariaDescription ? (
          <p className={styles.visuallyHidden} id={descriptionId}>
            {ariaDescription}
          </p>
        ) : null}
        <DrawerBody>{children}</DrawerBody>
      </DrawerPanel>
    </div>,
    document.body,
  );
}

export interface DrawerOverlayProps extends HTMLAttributes<HTMLDivElement> {
  onDismiss: () => void;
}

export function DrawerOverlay({ onDismiss, className, ...props }: DrawerOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={[styles.overlay, className].filter(Boolean).join(' ')}
      data-testid="drawer-overlay"
      onClick={onDismiss}
      {...props}
    />
  );
}

export interface DrawerPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DrawerPanel = forwardRef<HTMLDivElement, DrawerPanelProps>(function DrawerPanel(
  { children, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-modal="true"
      className={[styles.panel, className].filter(Boolean).join(' ')}
      data-drawer-panel
      role="dialog"
      tabIndex={-1}
      {...props}
    >
      {children}
    </div>
  );
});

export interface DrawerHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string;
  titleId: string;
  onClose: () => void;
}

export function DrawerHeader({ title, titleId, onClose, className, ...props }: DrawerHeaderProps) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')} {...props}>
      <h2 className={styles.title} id={titleId}>
        {title}
      </h2>
      <DrawerCloseButton onClick={onClose} />
    </header>
  );
}

export function DrawerCloseButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label="Close drawer"
      className={[styles.closeButton, className].filter(Boolean).join(' ')}
      data-drawer-close
      type="button"
      {...props}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
        <path d="M3.5 3.5l9 9m0-9-9 9" />
      </svg>
    </button>
  );
}

export function DrawerBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.body, className].filter(Boolean).join(' ')} {...props} />;
}

export function DrawerSection({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={[styles.section, className].filter(Boolean).join(' ')} {...props} />;
}

export function DrawerSectionTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={[styles.sectionTitle, className].filter(Boolean).join(' ')} {...props} />;
}

export interface DrawerParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: 'primary' | 'secondary';
}

export function DrawerParagraph({ tone = 'secondary', className, ...props }: DrawerParagraphProps) {
  return (
    <p
      className={[styles.paragraph, styles[tone], className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}

export function DrawerAlertList({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={[styles.alertList, className].filter(Boolean).join(' ')} {...props} />;
}

export function DrawerAlertItem({ className, children, ...props }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={[styles.alertItem, className].filter(Boolean).join(' ')} {...props}>
      <svg aria-hidden="true" className={styles.alertIcon} focusable="false" viewBox="0 0 12 12">
        <path d="M6 1.25 11 10H1L6 1.25Z" />
        <path d="M6 4.25v2.5M6 8.5h.01" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

export function DrawerActionList({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={[styles.actionList, className].filter(Boolean).join(' ')} {...props} />;
}

export function DrawerActionItem({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return <li className={[styles.actionItem, className].filter(Boolean).join(' ')} {...props} />;
}

export function DrawerKeyValueTable({ className, ...props }: HTMLAttributes<HTMLDListElement>) {
  return <dl className={[styles.keyValueTable, className].filter(Boolean).join(' ')} {...props} />;
}

export interface DrawerKeyValueRowProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
}

export function DrawerKeyValueRow({ label, value, className, ...props }: DrawerKeyValueRowProps) {
  return (
    <div className={[styles.keyValueRow, className].filter(Boolean).join(' ')} {...props}>
      <dt className={styles.keyValueLabel}>{label}</dt>
      <dd className={styles.keyValueValue}>{value}</dd>
    </div>
  );
}

export function DrawerDivider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={[styles.divider, className].filter(Boolean).join(' ')} {...props} />;
}
