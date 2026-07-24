import type { HTMLAttributes } from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: string | number;
  height?: string | number;
  radius?: 'sm' | 'md' | 'lg' | 'pill';
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  radius = 'md',
  className,
  style,
  ...props
}: SkeletonProps) {
  const classes = [styles.skeleton, styles[radius], className].filter(Boolean).join(' ');

  return (
    <span
      aria-hidden="true"
      className={classes}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}
