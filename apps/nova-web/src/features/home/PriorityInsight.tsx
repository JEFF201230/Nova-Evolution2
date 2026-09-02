import { NextBestAction } from './NextBestAction';
import styles from './HomePage.module.css';

export function PriorityInsight() {
  return (
    <div className={styles.hero}>
      <NextBestAction />
    </div>
  );
}
