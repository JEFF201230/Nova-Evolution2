import type { HTMLAttributes } from 'react';
import styles from './Status.module.css';

export interface StatusProps extends HTMLAttributes<HTMLSpanElement> {
  value: 'available' | 'busy' | 'away';
  label?: string;
}

export function Status({ value, label, className, ...props }: StatusProps) {
  const text = label ?? value;
  const classes = [styles.status, styles[value], className].filter(Boolean).join(' ');

  return (
    <span aria-label={text} className={classes} {...props}>
      <span aria-hidden="true" className={styles.dot} />
      <span className={styles.label}>{text}</span>
    </span>
  );
}
