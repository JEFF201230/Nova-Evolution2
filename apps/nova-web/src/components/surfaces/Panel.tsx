import type { HTMLAttributes, ReactNode } from 'react';
import { Surface } from './Surface';
import styles from './Panel.module.css';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  heading?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  selected?: boolean;
  loading?: boolean;
}

export function Panel({
  heading,
  description,
  actions,
  selected = false,
  loading = false,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <Surface
      className={[styles.panel, className].filter(Boolean).join(' ')}
      loading={loading}
      padding="lg"
      selected={selected}
      tone="raised"
      {...props}
    >
      {(heading || description || actions) && (
        <div className={styles.header}>
          <div className={styles.heading}>
            {heading ? <h3 className={styles.title}>{heading}</h3> : null}
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      )}
      {children ? <div className={styles.body}>{children}</div> : null}
    </Surface>
  );
}
