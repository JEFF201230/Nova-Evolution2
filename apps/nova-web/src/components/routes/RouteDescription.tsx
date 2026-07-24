import type { HTMLAttributes, ReactNode } from 'react';
import styles from './RouteDescription.module.css';

export interface RouteDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function RouteDescription({ children, className, ...props }: RouteDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(' ');

  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
}
