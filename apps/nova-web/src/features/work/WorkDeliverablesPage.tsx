import { useState } from 'react';
import {
  Drawer,
  DrawerAlertItem,
  DrawerAlertList,
  DrawerKeyValueRow,
  DrawerKeyValueTable,
  DrawerParagraph,
  DrawerSection,
  DrawerSectionTitle,
} from '../../components/drawer/Drawer';
import { Button } from '../../components/shared/Button';
import { Progress } from '../../components/shared/Progress';
import { Skeleton } from '../../components/shared/Skeleton';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Surface } from '../../components/surfaces/Surface';
import type {
  WorkDeliverableFixture,
  WorkDeliverablesFixture,
} from './workDeliverablesFixture';
import type { WorkOverviewFixture } from './workOverviewFixture';
import overviewStyles from './WorkOverviewPage.module.css';
import { WorkPageHeader } from './WorkPageHeader';
import styles from './WorkDeliverablesPage.module.css';

export type WorkDeliverablesState = 'ready' | 'loading' | 'empty' | 'error';

export interface WorkDeliverablesPageProps {
  work?: WorkOverviewFixture;
  deliverables?: WorkDeliverablesFixture;
  state?: WorkDeliverablesState;
}

function DeliverableCard({
  deliverable,
  onOpen,
}: {
  deliverable: WorkDeliverableFixture;
  onOpen?: () => void;
}) {
  return (
    <Surface
      aria-label={deliverable.title}
      className={styles.deliverableCard}
      padding="none"
      role="article"
    >
      <div className={styles.cardHeader}>
        <div className={styles.titleCluster}>
          <h3>{deliverable.title}</h3>
          <span className={styles.confidence}>
            <strong>{deliverable.confidence}%</strong> confidence⌄
          </span>
        </div>
        <span aria-label="Deliverable visible" className={styles.visibilityIcon} role="img">⊙</span>
      </div>
      <div className={styles.progressRow}>
        <span>{deliverable.readinessLabel}</span>
        <Progress
          aria-label={`${deliverable.title} publication readiness`}
          className={[styles.progress, styles[deliverable.progressTone]].join(' ')}
          showValue={false}
          value={deliverable.publicationScore}
        />
        <strong className={styles[`${deliverable.progressTone}Text`]}>
          {deliverable.publicationScore}%
        </strong>
        <Button size="sm" variant="secondary" onClick={onOpen}>Details</Button>
      </div>
      <p className={styles.alert}>△ {deliverable.alert}</p>
      <p className={styles.nextAction}>{deliverable.nextAction}</p>
    </Surface>
  );
}

function DeliverableDrawer({
  deliverable,
  onClose,
}: {
  deliverable?: WorkDeliverableFixture;
  onClose: () => void;
}) {
  return (
    <Drawer
      ariaDescription={deliverable ? `${deliverable.title} deliverable details` : undefined}
      open={Boolean(deliverable?.detail)}
      title={deliverable?.title ?? ''}
      onClose={onClose}
    >
      {deliverable?.detail ? (
        <>
          <DrawerSection>
            <DrawerSectionTitle>Summary</DrawerSectionTitle>
            <DrawerParagraph tone="primary">{deliverable.detail.summary}</DrawerParagraph>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>Why it matters</DrawerSectionTitle>
            <DrawerParagraph>{deliverable.detail.whyItMatters}</DrawerParagraph>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>What is blocking</DrawerSectionTitle>
            <DrawerAlertList>
              {deliverable.detail.blocking.map((blocker) => (
                <DrawerAlertItem key={blocker}>{blocker}</DrawerAlertItem>
              ))}
            </DrawerAlertList>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>Key evidence</DrawerSectionTitle>
            <DrawerKeyValueTable>
              {deliverable.detail.keyEvidence.map((metric) => (
                <DrawerKeyValueRow
                  key={metric.label}
                  label={metric.label}
                  value={<span className={metric.tone ? styles[metric.tone] : undefined}>{metric.value}</span>}
                />
              ))}
            </DrawerKeyValueTable>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>History</DrawerSectionTitle>
            <ol className={styles.historyList}>
              {deliverable.detail.history.map((entry) => (
                <li key={entry.version}>
                  <strong>{entry.version}</strong>
                  <time>{entry.date}</time>
                  <span>{entry.description}</span>
                </li>
              ))}
            </ol>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>Technical details</DrawerSectionTitle>
            <DrawerKeyValueTable>
              {deliverable.detail.technicalDetails.map((item) => (
                <DrawerKeyValueRow key={item.label} label={item.label} value={item.value} />
              ))}
            </DrawerKeyValueTable>
          </DrawerSection>
        </>
      ) : null}
    </Drawer>
  );
}

export function WorkDeliverablesPage({
  work,
  deliverables,
  state = 'ready',
}: WorkDeliverablesPageProps) {
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>();

  if (state === 'loading') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}>
            <Spinner label="Loading Work Deliverables" />
            <span>Loading Work Deliverables</span>
          </div>
          <Skeleton height="var(--n-space-24)" />
          <Skeleton height="var(--n-space-120)" />
          <Skeleton height="var(--n-space-120)" />
        </div>
      </PageContainer>
    );
  }

  if (state === 'error') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState
          heading="Deliverables unavailable"
          description="The Work Deliverables could not be displayed."
        />
      </PageContainer>
    );
  }

  if (state === 'empty' || !work || !deliverables || deliverables.deliverables.length === 0) {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState
          heading="No deliverables available"
          description="Select a Work with available deliverables."
        />
      </PageContainer>
    );
  }

  const selectedDeliverable = deliverables.deliverables.find(
    (deliverable) => deliverable.deliverableId === selectedDeliverableId,
  );

  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="deliverables" showConfidenceLabel work={work} />
      <main aria-label="Work deliverables" className={styles.deliverablesPage}>
        <div className={styles.pageHeading}>
          <h2>Deliverables</h2>
          <Button size="sm" variant="secondary">＋ Create</Button>
        </div>
        <div className={styles.deliverableList}>
          {deliverables.deliverables.map((deliverable) => (
            <DeliverableCard
              key={deliverable.deliverableId}
              deliverable={deliverable}
              onOpen={deliverable.detail
                ? () => setSelectedDeliverableId(deliverable.deliverableId)
                : undefined}
            />
          ))}
        </div>
      </main>
      <DeliverableDrawer
        deliverable={selectedDeliverable}
        onClose={() => setSelectedDeliverableId(undefined)}
      />
    </PageContainer>
  );
}
