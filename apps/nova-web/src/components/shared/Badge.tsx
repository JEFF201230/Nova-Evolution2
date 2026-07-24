import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'action' | 'success' | 'warning' | 'error' | 'nova';
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

export function Badge({
  tone = 'neutral',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const classes = [styles.badge, styles[tone], styles[size], className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
    </span>
  );
}
