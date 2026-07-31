import type { HomeActiveWorkItem } from '../../../../../contracts/home-active-work.contract';
import { ActiveWorkCard } from './ActiveWorkCard';
import type { HomeActiveWorkState } from './useHomeActiveWork';
import styles from './HomePage.module.css';

export interface ActiveWorkSectionProps {
  works: readonly HomeActiveWorkItem[];
  state: HomeActiveWorkState;
  onOpenWork: (workId: string) => void;
}

export function ActiveWorkSection({
  works,
  state,
  onOpenWork,
}: ActiveWorkSectionProps) {
  return (
    <section
      aria-busy={state === 'loading'}
      className={styles.activeSection}
    >
      <h2 className={styles.activeSectionTitle}>ACTIVE WORK</h2>
      <div className={styles.activeList}>
        {works.map((work) => (
          <ActiveWorkCard
            key={`${work.workIdentity.projectId}:${work.workIdentity.workId}`}
            work={work}
            onOpen={onOpenWork}
          />
        ))}
      </div>
    </section>
  );
}
