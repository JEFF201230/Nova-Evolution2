import type { HTMLAttributes, ReactNode } from 'react';
import styles from './TopBar.module.css';

export interface TopBarProps extends HTMLAttributes<HTMLElement> {
  logo: ReactNode;
  heading?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function TopBar({ logo, heading, description, actions, className, ...props }: TopBarProps) {
  const classes = [styles.topBar, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      <div className={styles.branding}>
        <div className={styles.logo}>{logo}</div>
        {heading ? (
          <div className={styles.heading}>
            <h1 className={styles.title}>{heading}</h1>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
        ) : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
