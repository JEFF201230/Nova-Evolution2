import type { HomeActiveWorkState } from './useHomeActiveWork';
import styles from './HomePage.module.css';

export interface HomeHeaderProps {
  activeWorkCount: number;
  activeWorkState: HomeActiveWorkState;
}

export function HomeHeader({ activeWorkCount, activeWorkState }: HomeHeaderProps) {
  let summary = 'Active work is temporarily unavailable.';

  if (activeWorkState === 'loading') {
    summary = 'Loading active work from Runtime.';
  } else if (activeWorkState === 'ready') {
    summary = activeWorkCount === 0
      ? 'No active work returned by Runtime.'
      : `${activeWorkCount} active work ${activeWorkCount === 1 ? 'item' : 'items'} from Runtime.`;
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.greeting}>Home</h1>
      <p className={styles.summary}>{summary}</p>
    </header>
  );
}
