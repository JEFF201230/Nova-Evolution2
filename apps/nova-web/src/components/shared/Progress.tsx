import type { HTMLAttributes } from 'react';
import styles from './Progress.module.css';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

export function Progress({ value, max = 100, label, showValue = true, className, ...props }: ProgressProps) {
  const percent = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const labelId = label ? `progress-label-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined;
  const classes = [styles.progress, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {label ? (
        <div className={styles.header}>
          <span id={labelId} className={styles.label}>
            {label}
          </span>
          {showValue ? <span className={styles.value}>{percent}%</span> : null}
        </div>
      ) : null}
      <progress aria-labelledby={labelId} className={styles.bar} max={max} value={value} />
    </div>
  );
}
