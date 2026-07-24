import type { HTMLAttributes } from 'react';
import styles from './Spinner.module.css';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label, className, ...props }: SpinnerProps) {
  const classes = [styles.spinner, styles[size], className].filter(Boolean).join(' ');

  if (!label) {
    return <span aria-hidden="true" className={classes} {...props} />;
  }

  return (
    <span aria-live="polite" aria-label={label} className={classes} role="status" {...props}>
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
}
