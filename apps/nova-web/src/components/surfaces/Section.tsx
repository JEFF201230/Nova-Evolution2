import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Section.module.css';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  heading?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  selected?: boolean;
}

export function Section({
  heading,
  description,
  actions,
  selected = false,
  className,
  children,
  ...props
}: SectionProps) {
  const classes = [styles.section, selected && styles.selected, className].filter(Boolean).join(' ');

  return (
    <section className={classes} {...props}>
      {(heading || description || actions) && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {heading ? <h2 className={styles.title}>{heading}</h2> : null}
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      )}
      {children ? <div className={styles.body}>{children}</div> : null}
    </section>
  );
}
