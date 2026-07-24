import type { HTMLAttributes, ReactNode } from 'react';
import styles from './SideNavigation.module.css';

export interface SideNavigationProps extends HTMLAttributes<HTMLElement> {
  header?: ReactNode;
}

export function SideNavigation({ header, className, children, ...props }: SideNavigationProps) {
  const classes = [styles.sideNavigation, className].filter(Boolean).join(' ');

  return (
    <nav className={classes} aria-label="Application navigation" {...props}>
      {header ? <div className={styles.header}>{header}</div> : null}
      <div className={styles.sections}>{children}</div>
    </nav>
  );
}
