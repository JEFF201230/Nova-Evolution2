import { homeFixture } from './homeFixture';
import { ActiveWorkCard } from './ActiveWorkCard';
import styles from './HomePage.module.css';

export interface ActiveWorkSectionProps {
  onOpenWork: (workId: string) => void;
}

export function ActiveWorkSection({ onOpenWork }: ActiveWorkSectionProps) {
  return (
    <section className={styles.activeSection}>
      <h2 className={styles.activeSectionTitle}>ACTIVE WORK</h2>
      <div className={styles.activeList}>
        {homeFixture.activeWork.map((item, index) => (
          <ActiveWorkCard
            key={item.workId}
            workId={item.workId}
            title={item.title}
            description={item.description}
            confidenceLabel={item.confidenceLabel}
            dueLabel={item.dueLabel}
            dotTone={index === 1 ? 'active' : 'muted'}
            onOpen={onOpenWork}
          />
        ))}
      </div>
    </section>
  );
}
