import { useState } from 'react';
import {
  Drawer,
  DrawerKeyValueRow,
  DrawerKeyValueTable,
  DrawerParagraph,
  DrawerSection,
  DrawerSectionTitle,
} from '../../components/drawer/Drawer';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Skeleton } from '../../components/shared/Skeleton';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Surface } from '../../components/surfaces/Surface';
import type { WorkOverviewFixture } from './workOverviewFixture';
import type { WorkSourceFixture, WorkSourcesFixture } from './workSourcesFixture';
import { WorkPageHeader } from './WorkPageHeader';
import overviewStyles from './WorkOverviewPage.module.css';
import styles from './WorkSourcesPage.module.css';

export type WorkSourcesState = 'ready' | 'loading' | 'empty' | 'error';

export interface WorkSourcesPageProps {
  work?: WorkOverviewFixture;
  sources?: WorkSourcesFixture;
  state?: WorkSourcesState;
}

const statusTone = {
  available: 'success',
  stale: 'warning',
  missing: 'error',
} as const;

function SourceCard({ source, onOpen }: { source: WorkSourceFixture; onOpen?: () => void }) {
  return (
    <Surface
      aria-label={source.title}
      className={[styles.sourceCard, styles[source.status]].join(' ')}
      padding="none"
      role="article"
    >
      <div className={styles.sourceContent}>
        <div className={styles.sourceTitleRow}>
          <h3>{source.title}</h3>
          <Badge size="sm" tone={statusTone[source.status]}>{source.statusLabel}</Badge>
        </div>
        <p className={styles.metadata}>
          <span>{source.provenance}</span>
          <span>· Freshness: {source.freshness}</span>
          <span>· {source.usage}</span>
          {source.conflict ? <strong>· ⚠ {source.conflict}</strong> : null}
        </p>
        <p className={styles.insight}>✣ {source.insight}</p>
      </div>
      <div className={styles.sourceActions}>
        {source.primaryAction ? (
          <Button size="sm" variant="secondary">
            {source.primaryAction === 'Add' ? '↥ Add' : '⟳ Refresh'}
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={onOpen}>Details</Button>
      </div>
    </Surface>
  );
}

function SourceDrawer({ source, onClose }: { source?: WorkSourceFixture; onClose: () => void }) {
  return (
    <Drawer
      ariaDescription={source ? `${source.title} source details` : undefined}
      open={Boolean(source?.detail)}
      title={source?.title ?? ''}
      onClose={onClose}
    >
      {source?.detail ? (
        <>
          <DrawerSection>
            <DrawerSectionTitle>Summary</DrawerSectionTitle>
            <DrawerParagraph tone="primary">{source.detail.summary}</DrawerParagraph>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>Why it matters</DrawerSectionTitle>
            <DrawerParagraph>
              Supports: <strong className={styles.drawerStrong}>{source.detail.supports}</strong>
            </DrawerParagraph>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>Key evidence</DrawerSectionTitle>
            <DrawerKeyValueTable>
              {source.detail.keyEvidence.map((item) => (
                <DrawerKeyValueRow key={item.label} label={item.label} value={item.value} />
              ))}
            </DrawerKeyValueTable>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>History</DrawerSectionTitle>
            <DrawerKeyValueTable>
              {source.detail.history.map((item) => (
                <DrawerKeyValueRow key={item.label} label={item.label} value={item.value} />
              ))}
            </DrawerKeyValueTable>
          </DrawerSection>
        </>
      ) : null}
    </Drawer>
  );
}

export function WorkSourcesPage({ work, sources, state = 'ready' }: WorkSourcesPageProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string>();

  if (state === 'loading') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}>
            <Spinner label="Loading Work Sources" />
            <span>Loading Work Sources</span>
          </div>
          <Skeleton height="var(--n-space-96)" />
          <Skeleton height="var(--n-space-96)" />
          <Skeleton height="var(--n-space-96)" />
        </div>
      </PageContainer>
    );
  }

  if (state === 'error') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState heading="Sources unavailable" description="The Work Sources could not be displayed." />
      </PageContainer>
    );
  }

  if (state === 'empty' || !work || !sources) {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState heading="No sources available" description="Select a Work with available sources." />
      </PageContainer>
    );
  }

  const selectedSource = sources.sources.find((source) => source.id === selectedSourceId);

  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="sources" showConfidenceLabel work={work} />
      <main aria-label="Work sources" className={styles.sourcesPage}>
        <div className={styles.sourcesHeading}>
          <h2>Sources</h2>
          <div className={styles.headingActions}>
            {sources.validating ? <span className={styles.validating}>● Validating...</span> : null}
            <Button size="sm" variant="secondary">＋ Add</Button>
          </div>
        </div>
        <Surface className={styles.coverageBar} padding="none">
          <div className={styles.summaryCounts}>
            <strong className={styles.availableText}>{sources.summary.available} available</strong>
            <strong className={styles.warningText}>{sources.summary.outdated} outdated</strong>
            <strong className={styles.criticalText}>{sources.summary.missing} missing</strong>
            <strong className={styles.criticalText}>{sources.summary.conflicts} conflict</strong>
          </div>
          <span>Overall coverage: {sources.coverage}%</span>
        </Surface>
        <div className={styles.sourceList}>
          {sources.sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onOpen={source.detail ? () => setSelectedSourceId(source.id) : undefined}
            />
          ))}
        </div>
      </main>
      <SourceDrawer source={selectedSource} onClose={() => setSelectedSourceId(undefined)} />
    </PageContainer>
  );
}
