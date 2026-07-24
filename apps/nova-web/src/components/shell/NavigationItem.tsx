import type { AnchorHTMLAttributes, ReactNode } from 'react';
import styles from './NavigationItem.module.css';

export interface NavigationItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  icon?: ReactNode;
}

export function NavigationItem({ active = false, icon, className, children, ...props }: NavigationItemProps) {
  const classes = [styles.item, active && styles.active, className].filter(Boolean).join(' ');

  return (
    <a aria-current={active ? 'page' : undefined} className={classes} {...props}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
    </a>
  );
}
