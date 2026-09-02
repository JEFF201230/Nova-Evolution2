import { Badge } from '../../components/shared/Badge';
import styles from './HomePage.module.css';

export function NextBestAction() {
  return (
    <div className={styles.heroHeader}>
      <div className={styles.heroMeta}>
        <Badge size="sm" tone="nova">
          NOVA
        </Badge>
        <Badge size="sm" tone="action">
          Unavailable
        </Badge>
      </div>
      <p className={styles.heroSummary}>Situation insights are not available from Runtime.</p>
      <h2 className={styles.heroGain}>No priority or next action is shown.</h2>
    </div>
  );
}
