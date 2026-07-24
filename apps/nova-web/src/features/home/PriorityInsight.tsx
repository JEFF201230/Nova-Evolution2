import { NextBestAction } from './NextBestAction';
import { homeFixture } from './homeFixture';
import styles from './HomePage.module.css';

export interface PriorityInsightProps {
  onOpenWork: (workId: string) => void;
  onOpenDetails?: () => void;
}

export function PriorityInsight({ onOpenWork, onOpenDetails }: PriorityInsightProps) {
  return (
    <div className={styles.hero}>
      <NextBestAction
        onPrimaryAction={() => onOpenWork(homeFixture.priorityInsight.workId)}
        onDetails={onOpenDetails}
      />
    </div>
  );
}
