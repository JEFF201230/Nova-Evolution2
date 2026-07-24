import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { EmptyState } from '../surfaces/EmptyState';
import { Panel } from '../surfaces/Panel';
import { Section } from '../surfaces/Section';
import styles from './RoutePlaceholder.module.css';

export interface RoutePlaceholderProps {
  title: string;
  description: string;
  surfaceLabel: string;
  nextLotLabel: string;
}

export function RoutePlaceholder({ title, description, surfaceLabel, nextLotLabel }: RoutePlaceholderProps) {
  return (
    <div className={styles.stack}>
      <Section heading={title} description={description}>
        <div className={styles.row}>
          <Badge tone="nova">{surfaceLabel}</Badge>
          <Badge tone="action">Structural route</Badge>
        </div>
      </Section>

      <Panel heading="Reserved areas" description="Structure only. Content will arrive in future LOTs.">
        <div className={styles.grid}>
          <EmptyState
            heading="Reserved for future implementation"
            description="This route is intentionally structural. Real functionality will be added later."
            actionLabel="View next LOT"
            onAction={() => undefined}
          />
          <div className={styles.note}>
            <p>Next authorized step: {nextLotLabel}</p>
            <Button variant="secondary">Structure only</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
