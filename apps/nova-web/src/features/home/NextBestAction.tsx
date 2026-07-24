import { useState } from 'react';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { homeFixture } from './homeFixture';
import styles from './HomePage.module.css';

export interface NextBestActionProps {
  onPrimaryAction: () => void;
  onDetails?: () => void;
}

export function NextBestAction({ onPrimaryAction, onDetails }: NextBestActionProps) {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <div className={styles.heroHeader}>
      <div className={styles.heroMeta}>
        <Badge size="sm" tone="nova">
          {homeFixture.priorityInsight.label}
        </Badge>
        <Badge size="sm" tone="action">
          {homeFixture.priorityInsight.status}
        </Badge>
      </div>
      <p className={styles.heroSummary}>{homeFixture.priorityInsight.summary}</p>
      <h2 className={styles.heroGain}>{homeFixture.priorityInsight.gain}</h2>
      <div className={styles.heroActions}>
        <Button onClick={onPrimaryAction}>{homeFixture.priorityInsight.actionLabel}</Button>
        <Button variant="quiet" onClick={() => setWhyOpen((value) => !value)}>
          {homeFixture.priorityInsight.whyLabel}
        </Button>
        {onDetails ? (
          <Button variant="quiet" onClick={onDetails}>
            {homeFixture.priorityInsight.detailsLabel}
          </Button>
        ) : null}
      </div>
      {whyOpen ? <p className={styles.heroDetails}>{homeFixture.priorityInsight.why}</p> : null}
    </div>
  );
}
