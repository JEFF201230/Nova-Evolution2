import type { HTMLAttributes } from 'react';
import styles from './ContentViewport.module.css';

export function ContentViewport({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const classes = [styles.viewport, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
