import { useState } from 'react';
import { Badge } from '../../components/shared/Badge';
import { Skeleton } from '../../components/shared/Skeleton';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Surface } from '../../components/surfaces/Surface';
import type { WorkOverviewFixture } from './workOverviewFixture';
import type {
  WorkActivityEventFixture,
  WorkActivityFilter,
  WorkActivityFixture,
} from './workActivityFixture';
import { WorkPageHeader } from './WorkPageHeader';
import overviewStyles from './WorkOverviewPage.module.css';
import styles from './WorkActivityPage.module.css';

export type WorkActivityState = 'ready' | 'loading' | 'empty' | 'error';

export interface WorkActivityPageProps {
  work?: WorkOverviewFixture;
  activity?: WorkActivityFixture;
  state?: WorkActivityState;
}

const activityFilters: readonly { id: WorkActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'human', label: 'Human' },
  { id: 'ai', label: 'AI' },
  { id: 'critical', label: 'Critical' },
  { id: 'sources', label: 'Sources' },
];

function ActivityEvent({ event }: { event: WorkActivityEventFixture }) {
  return (
    <article className={styles.event}>
      <span
        aria-hidden="true"
        className={[styles.avatar, event.kind === 'nova' && styles.novaAvatar].filter(Boolean).join(' ')}
      >
        {event.initials}
      </span>
      <div className={styles.eventContent}>
        <div className={styles.eventHeader}>
          <div className={styles.actorRow}>
            <strong>{event.actor}</strong>
            {event.kind === 'nova' ? <Badge size="sm" tone="nova">✣ NOVA</Badge> : null}
            {event.critical ? <Badge size="sm" tone="error">⚠ Critical</Badge> : null}
          </div>
          <time>{event.timeLabel}</time>
        </div>
        <p className={styles.summary}>{event.summary}</p>
        {event.detail ? (
          <Surface className={styles.detailCard} padding="sm">
            <p className={styles[event.detail.tone]}>{event.detail.headline}</p>
            <p className={styles.detailDescription}>{event.detail.description}</p>
            {event.detail.sources.length ? (
              <ul aria-label="Related sources" className={styles.sourceList}>
                {event.detail.sources.map((source) => <li key={source}>{source}</li>)}
              </ul>
            ) : null}
          </Surface>
        ) : null}
      </div>
    </article>
  );
}

export function WorkActivityPage({ activity, work, state = 'ready' }: WorkActivityPageProps) {
  const [activeFilter, setActiveFilter] = useState<WorkActivityFilter>('all');

  if (state === 'loading') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}>
            <Spinner label="Loading Work Activity" />
            <span>Loading Work Activity</span>
          </div>
          <Skeleton height="var(--n-space-96)" />
          <Skeleton height="var(--n-space-120)" />
          <Skeleton height="var(--n-space-96)" />
        </div>
      </PageContainer>
    );
  }

  if (state === 'error') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState
          heading="Activity unavailable"
          description="The Work Activity could not be displayed."
        />
      </PageContainer>
    );
  }

  if (state === 'empty' || !work || !activity) {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState
          heading="No activity available"
          description="Select a Work with available Activity."
        />
      </PageContainer>
    );
  }

  const visibleEvents = activeFilter === 'all'
    ? activity.events
    : activity.events.filter((event) => event.filters.includes(activeFilter));

  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="activity" showConfidenceLabel work={work} />
      <main aria-label="Work activity" className={styles.activity}>
        <div aria-label="Activity filters" className={styles.filters} role="group">
          {activityFilters.map((filter) => (
            <button
              key={filter.id}
              aria-pressed={activeFilter === filter.id}
              className={[
                styles.filterButton,
                activeFilter === filter.id && styles.filterButtonActive,
              ].filter(Boolean).join(' ')}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div aria-live="polite" className={styles.timeline}>
          {visibleEvents.map((event) => <ActivityEvent event={event} key={event.id} />)}
        </div>
        <textarea aria-label="Add a comment" className={styles.comment} placeholder="Add a comment..." />
      </main>
    </PageContainer>
  );
}
