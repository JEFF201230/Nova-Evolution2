import type { HTMLAttributes, ReactNode } from 'react';
import styles from './NavigationSection.module.css';

export interface NavigationSectionProps extends HTMLAttributes<HTMLElement> {
  heading?: ReactNode;
  description?: ReactNode;
}

export function NavigationSection({ heading, description, className, children, ...props }: NavigationSectionProps) {
  const classes = [styles.section, className].filter(Boolean).join(' ');

  return (
    <section className={classes} {...props}>
      {heading || description ? (
        <header className={styles.header}>
          {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
      ) : null}
      <div className={styles.items}>{children}</div>
    </section>
  );
}
