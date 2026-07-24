import type { HTMLAttributes, ReactNode } from 'react';
import { Surface } from './Surface';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  heading?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  selected?: boolean;
  loading?: boolean;
}

export function Card({
  heading,
  description,
  footer,
  selected = false,
  loading = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Surface className={[styles.card, className].filter(Boolean).join(' ')} loading={loading} selected={selected} {...props}>
      {heading || description ? (
        <div className={styles.header}>
          {heading ? <h3 className={styles.title}>{heading}</h3> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
      ) : null}
      {children ? <div className={styles.body}>{children}</div> : null}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </Surface>
  );
}
