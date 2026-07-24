import type { HTMLAttributes, ReactNode } from 'react';
import styles from './ShellFooter.module.css';

export interface ShellFooterProps extends HTMLAttributes<HTMLElement> {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function ShellFooter({ left, center, right, className, ...props }: ShellFooterProps) {
  const classes = [styles.footer, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      <div className={styles.slot}>{left}</div>
      <div className={styles.slot}>{center}</div>
      <div className={styles.slot}>{right}</div>
    </div>
  );
}
