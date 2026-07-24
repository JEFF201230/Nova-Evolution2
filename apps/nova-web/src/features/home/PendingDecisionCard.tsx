import { Badge } from '../../components/shared/Badge';
import { homeFixture } from './homeFixture';
import styles from './HomePage.module.css';

export interface PendingDecisionCardProps {
  onOpenDecision: (decisionId: string) => void;
}

export function PendingDecisionCard({ onOpenDecision }: PendingDecisionCardProps) {
  return (
    <button
      className={styles.decision}
      type="button"
      onClick={() => onOpenDecision(homeFixture.pendingDecision.decisionId)}
    >
      <div className={styles.decisionLayout}>
        <div className={styles.decisionContent}>
          <div className={styles.decisionMeta}>
            <Badge size="sm" tone="error">
              {homeFixture.pendingDecision.dueLabel}
            </Badge>
            <Badge size="sm" tone="success">
              {homeFixture.pendingDecision.confidenceLabel}
            </Badge>
          </div>
          <h3 className={styles.decisionTitle}>{homeFixture.pendingDecision.statement}</h3>
          <p className={styles.decisionConsequence}>{homeFixture.pendingDecision.consequence}</p>
        </div>
        <span aria-hidden="true" className={styles.decisionArrow}>
          →
        </span>
      </div>
    </button>
  );
}
