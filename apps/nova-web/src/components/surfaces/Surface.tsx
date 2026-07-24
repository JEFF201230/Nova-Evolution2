import type { HTMLAttributes } from 'react';
import styles from './Surface.module.css';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'subtle' | 'raised' | 'hero' | 'overlay';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  selected?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export function Surface({
  tone = 'default',
  padding = 'md',
  selected = false,
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}: SurfaceProps) {
  const classes = [
    styles.surface,
    styles[tone],
    styles[padding],
    selected && styles.selected,
    loading && styles.loading,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-busy={loading || undefined} aria-disabled={disabled || undefined} className={classes} {...props}>
      {children}
    </div>
  );
}
