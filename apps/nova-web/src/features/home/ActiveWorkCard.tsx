import { Badge } from '../../components/shared/Badge';
import styles from './HomePage.module.css';

export interface ActiveWorkCardProps {
  workId: string;
  title: string;
  description: string;
  confidenceLabel: string;
  dueLabel: string;
  dotTone?: 'active' | 'muted';
  onOpen: (workId: string) => void;
}

export function ActiveWorkCard({
  workId,
  title,
  description,
  confidenceLabel,
  dueLabel,
  dotTone = 'muted',
  onOpen,
}: ActiveWorkCardProps) {
  const confidenceTone: 'success' | 'warning' | 'error' = confidenceLabel.startsWith('8')
    ? 'success'
    : confidenceLabel.startsWith('5') || confidenceLabel.startsWith('6') || confidenceLabel.startsWith('7')
      ? 'warning'
      : 'error';

  return (
    <button
      aria-label={title}
      className={styles.activeCard}
      type="button"
      onClick={() => onOpen(workId)}
    >
      <span aria-hidden="true" className={`${styles.activeDot} ${dotTone === 'active' ? styles.activeDotActive : styles.activeDotMuted}`} />
      <div className={styles.activeLead}>
        <div className={styles.activeText}>
          <h3 className={styles.activeTitle}>{title}</h3>
          <p className={styles.activeDescription}>{description}</p>
        </div>
      </div>
      <div className={styles.activeMeta}>
        <Badge size="sm" tone={confidenceTone}>
          {confidenceLabel}
        </Badge>
        <span>{dueLabel}</span>
      </div>
    </button>
  );
}
