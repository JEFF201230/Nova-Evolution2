import styles from './ShellLogo.module.css';

export function ShellLogo() {
  return (
    <div className={styles.logo} aria-label="NOVA">
      <span className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 20 20" focusable="false">
          <path d="M10 4.2v2.15M10 13.65v2.15M4.2 10h2.15M13.65 10h2.15M5.9 5.9l1.52 1.52M12.58 12.58l1.52 1.52M14.1 5.9l-1.52 1.52M7.42 12.58 5.9 14.1" />
          <path d="m10 7.15.72 2.13 2.13.72-2.13.72L10 12.85l-.72-2.13L7.15 10l2.13-.72L10 7.15Z" />
        </svg>
      </span>
      <span className={styles.wordmark}>NOVA</span>
    </div>
  );
}
