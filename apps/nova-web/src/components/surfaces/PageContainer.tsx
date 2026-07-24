import type { HTMLAttributes } from 'react';
import styles from './PageContainer.module.css';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  narrow?: boolean;
}

export function PageContainer({ narrow = false, className, children, ...props }: PageContainerProps) {
  const classes = [styles.container, narrow && styles.narrow, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
