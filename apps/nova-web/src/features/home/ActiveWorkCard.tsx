import type { HomeActiveWorkItem } from '../../../../../contracts/home-active-work.contract';
import { Badge } from '../../components/shared/Badge';
import styles from './HomePage.module.css';

export interface ActiveWorkCardProps {
  work: HomeActiveWorkItem;
  onOpen: (workId: string) => void;
}

export function ActiveWorkCard({
  work,
  onOpen,
}: ActiveWorkCardProps) {
  const progressLabel = `${work.progress}% progress`;

  return (
    <button
      aria-label={work.goal}
      className={styles.activeCard}
      type="button"
      onClick={() => onOpen(work.workIdentity.workId)}
    >
      <span
        aria-hidden="true"
        className={`${styles.activeDot} ${styles.activeDotActive}`}
      />
      <div className={styles.activeLead}>
        <div className={styles.activeText}>
          <h3 className={styles.activeTitle}>{work.goal}</h3>
          <p className={styles.activeDescription}>
            {`Work ${work.workIdentity.workId} · Mission ${work.mission.missionId} · ${work.lifecycle}`}
          </p>
        </div>
      </div>
      <div className={styles.activeMeta}>
        <Badge size="sm" tone="nova">
          {progressLabel}
        </Badge>
        <time dateTime={work.updatedAt}>{work.updatedAt}</time>
      </div>
    </button>
  );
}
