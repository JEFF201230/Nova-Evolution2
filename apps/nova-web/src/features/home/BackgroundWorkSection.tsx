import { homeFixture } from './homeFixture';
import { NovaSuggestionCard } from './NovaSuggestionCard';
import styles from './HomePage.module.css';

export interface BackgroundWorkSectionProps {
  onOpenDetails?: () => void;
}

export function BackgroundWorkSection({ onOpenDetails }: BackgroundWorkSectionProps) {
  return (
    <div className={styles.backgroundSection}>
      <NovaSuggestionCard
        summary={homeFixture.background.summary}
        detailsLabel={homeFixture.background.detailsLabel}
        onDetails={onOpenDetails}
      />
    </div>
  );
}
