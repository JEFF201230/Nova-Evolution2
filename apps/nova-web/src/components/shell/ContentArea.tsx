import type { HTMLAttributes, ReactNode } from 'react';
import styles from './ContentArea.module.css';

export interface ContentAreaProps extends HTMLAttributes<HTMLDivElement> {
  heading?: ReactNode;
  description?: ReactNode;
}

export function ContentArea({ heading, description, className, children, ...props }: ContentAreaProps) {
  const classes = [styles.contentArea, className].filter(Boolean).join(' ');

  return (
    <section className={classes} {...props}>
      {(heading || description) ? (
        <header className={styles.header}>
          {heading ? <h2 className={styles.title}>{heading}</h2> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
