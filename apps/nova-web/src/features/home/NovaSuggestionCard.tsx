import { Badge } from '../../components/shared/Badge';
import styles from './HomePage.module.css';

export interface NovaSuggestionCardProps {
  summary: string;
  detailsLabel: string;
  onDetails?: () => void;
}

export function NovaSuggestionCard({ summary, detailsLabel, onDetails }: NovaSuggestionCardProps) {
  return (
    <div className={styles.background}>
      <div className={styles.backgroundSummary}>
        <Badge size="sm" tone="nova">
          NOVA
        </Badge>
        <span>{summary}</span>
      </div>
      {onDetails ? (
        <button aria-label="Background details" className={styles.backgroundDetails} type="button" onClick={onDetails}>
          {detailsLabel}
        </button>
      ) : null}
    </div>
  );
}
