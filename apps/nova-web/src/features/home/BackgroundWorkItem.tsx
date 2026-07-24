import styles from './HomePage.module.css';

export interface BackgroundWorkItemProps {
  title: string;
  meta: string;
}

export function BackgroundWorkItem({ title, meta }: BackgroundWorkItemProps) {
  return (
    <div className={styles.backgroundItem}>
      <div>
        <p className={styles.backgroundItemTitle}>{title}</p>
        <p className={styles.backgroundItemMeta}>{meta}</p>
      </div>
    </div>
  );
}
