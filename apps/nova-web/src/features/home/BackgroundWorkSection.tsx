import styles from './HomePage.module.css';

export function BackgroundWorkSection() {
  return (
    <div className={styles.backgroundSection}>
      <div className={styles.background}>
        <p className={styles.backgroundSummary}>Background work information is unavailable.</p>
        <p className={styles.backgroundDetails}>
          Home is not connected to a canonical background-work source.
        </p>
      </div>
    </div>
  );
}
