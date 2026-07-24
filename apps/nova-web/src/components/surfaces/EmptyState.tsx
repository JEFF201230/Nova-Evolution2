import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from '../shared/Button';
import { Surface } from './Surface';
import styles from './EmptyState.module.css';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  heading: ReactNode;
  description: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
  secondaryActionLabel?: ReactNode;
  onSecondaryAction?: () => void;
  loading?: boolean;
}

export function EmptyState({
  heading,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  loading = false,
  className,
  ...props
}: EmptyStateProps) {
  const classes = [styles.emptyState, className].filter(Boolean).join(' ');

  return (
    <Surface className={classes} loading={loading} tone="subtle" padding="lg" {...props}>
      <div className={styles.content}>
        <h3 className={styles.title}>{heading}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      {(actionLabel || secondaryActionLabel) && (
        <div className={styles.actions}>
          {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
          {secondaryActionLabel ? (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      )}
    </Surface>
  );
}
