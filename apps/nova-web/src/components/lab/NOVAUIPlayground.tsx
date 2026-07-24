import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Progress } from '../shared/Progress';
import { Skeleton } from '../shared/Skeleton';
import { Spinner } from '../shared/Spinner';
import { Status } from '../shared/Status';
import { Card } from '../surfaces/Card';
import { EmptyState } from '../surfaces/EmptyState';
import { PageContainer } from '../surfaces/PageContainer';
import { Panel } from '../surfaces/Panel';
import { Section } from '../surfaces/Section';
import { Surface } from '../surfaces/Surface';
import { RouteSurface } from '../routes/RouteSurface';
import { routeIds } from '../../routes/RouteDefinition';
import { NavigationProvider } from '../../routes/NavigationProvider';
import styles from './NOVAUIPlayground.module.css';

export function NOVAUIPlayground() {
  return (
    <PageContainer>
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>Technical demonstration</p>
          <h1 className={styles.title}>NOVA UI Playground</h1>
          <p className={styles.description}>
            Internal validation surface for Core Components and Surface Components.
          </p>
        </header>

        <Section heading="Core Components" description="Button, Badge, Status, Progress, Spinner, and Skeleton.">
          <div className={styles.grid}>
            <Card heading="Button" description="Primary, secondary, quiet, loading, and disabled states.">
              <div className={styles.row}>
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="quiet">Quiet</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </Card>

            <Card heading="Badge" description="Neutral, action, success, warning, error, and NOVA tones.">
              <div className={styles.row}>
                <Badge>Neutral</Badge>
                <Badge tone="action">Action</Badge>
                <Badge tone="success">Success</Badge>
                <Badge tone="warning">Warning</Badge>
                <Badge tone="error">Error</Badge>
                <Badge tone="nova">NOVA</Badge>
              </div>
            </Card>

            <Card heading="Status" description="Available, busy, and away states.">
              <div className={styles.row}>
                <Status value="available" label="Available" />
                <Status value="busy" label="Busy" />
                <Status value="away" label="Away" />
              </div>
            </Card>

            <Card heading="Progress" description="Labelled and percentage-based progress visualization.">
              <div className={styles.stack}>
                <Progress label="Coverage" value={72} />
                <Progress label="Completion" value={38} showValue={false} />
              </div>
            </Card>

            <Card heading="Spinner" description="Sizes and accessible status announcement.">
              <div className={styles.row}>
                <Spinner size="sm" label="Loading small" />
                <Spinner size="md" label="Loading medium" />
                <Spinner size="lg" label="Loading large" />
              </div>
            </Card>

            <Card heading="Skeleton" description="Stable placeholders for content and cards.">
              <div className={styles.stack}>
                <Skeleton height="1rem" />
                <Skeleton width="72%" height="1rem" />
                <Skeleton width="100%" height="72px" radius="lg" />
              </div>
            </Card>
          </div>
        </Section>

        <Section heading="Surface Components" description="Card, Panel, Surface, Section, PageContainer, and EmptyState.">
          <div className={styles.grid}>
            <Card
              selected
              heading="Card"
              description="Default and selected presentation for reusable content blocks."
              footer={<Badge tone="action">Selected</Badge>}
            >
              <p className={styles.copy}>Reusable card body content with a clear content hierarchy.</p>
            </Card>

            <Panel
              heading="Panel"
              description="Raised container used for denser content and grouped actions."
              actions={<Button variant="secondary">Inspect</Button>}
            >
              <div className={styles.stack}>
                <p className={styles.copy}>Panels can hold structured content, metrics, and actions.</p>
                <Progress label="Readiness" value={64} />
              </div>
            </Panel>

            <Surface tone="hero" padding="lg">
              <div className={styles.surfacePreview}>
                <h3>Surface</h3>
                <p>Hero-style surface with the certified NOVA gradient baseline.</p>
                <div className={styles.row}>
                  <Badge tone="nova">NOVA</Badge>
                  <Badge tone="action">Action</Badge>
                </div>
              </div>
            </Surface>

            <Section
              selected
              heading="Section"
              description="Semantic section wrapper with header, description, and body."
            >
              <p className={styles.copy}>Section is used to group related content under a clear heading.</p>
            </Section>

            <Surface tone="subtle" padding="lg">
              <div className={styles.pageContainerPreview}>
                <PageContainer narrow>
                  <div className={styles.previewFrame}>
                    <strong>PageContainer</strong>
                    <p>Constrained content width with certified spacing and horizontal padding.</p>
                  </div>
                </PageContainer>
              </div>
            </Surface>

            <EmptyState
              heading="EmptyState"
              description="Default empty state with optional primary and secondary actions."
              actionLabel="Create item"
              onAction={() => undefined}
              secondaryActionLabel="Learn more"
              onSecondaryAction={() => undefined}
            />
          </div>
        </Section>

        <Section
          heading="Structural Routes"
          description="Home, Work, Decisions, and Deliverables surfaces used to validate route shells."
        >
          <NavigationProvider>
            <div className={styles.routeGrid}>
              {routeIds.map((routeId) => (
                <RouteSurface key={routeId} routeId={routeId} />
              ))}
            </div>
          </NavigationProvider>
        </Section>
      </main>
    </PageContainer>
  );
}
