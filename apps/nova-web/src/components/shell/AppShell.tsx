import type { HTMLAttributes, ReactNode } from 'react';
import styles from './AppShell.module.css';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  sidebar: ReactNode;
  topBar?: ReactNode;
  footer?: ReactNode;
}

export function AppShell({ sidebar, topBar, footer, children, className, ...props }: AppShellProps) {
  const classes = [styles.shell, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      <aside className={styles.sidebar}>{sidebar}</aside>
      <div className={[styles.frame, !topBar && styles.frameWithoutTopBar].filter(Boolean).join(' ')}>
        {topBar ? <header className={styles.topBar}>{topBar}</header> : null}
        <main className={styles.content}>{children}</main>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>
  );
}
