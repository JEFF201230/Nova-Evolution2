import type { HTMLAttributes, ReactNode } from 'react';
import styles from './RouteTitle.module.css';

export interface RouteTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function RouteTitle({ children, className, ...props }: RouteTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(' ');

  return (
    <h2 className={classes} {...props}>
      {children}
    </h2>
  );
}
