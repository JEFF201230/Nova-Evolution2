import { homeFixture } from './homeFixture';
import styles from './HomePage.module.css';

export function HomeHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.greeting}>{homeFixture.header.greeting}</h1>
      <p className={styles.summary}>{homeFixture.header.summary}</p>
    </header>
  );
}
