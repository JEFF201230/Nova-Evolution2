import { Badge } from '../../components/shared/Badge';
import styles from './HomePage.module.css';

export function PendingDecisionCard() {
  return (
    <section
      aria-labelledby="home-decision-status"
      className={styles.decision}
    >
      <div className={styles.decisionLayout}>
        <div className={styles.decisionContent}>
          <div className={styles.decisionMeta}>
            <Badge size="sm" tone="action">
              Unavailable
            </Badge>
          </div>
          <h3 id="home-decision-status" className={styles.decisionTitle}>
            Decision information is not available on Home.
          </h3>
          <p className={styles.decisionConsequence}>
            No canonical Decision Runtime source is connected.
          </p>
        </div>
      </div>
    </section>
  );
}
