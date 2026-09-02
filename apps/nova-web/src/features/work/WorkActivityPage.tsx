import { useEffect, useState, type ReactNode } from 'react';
import {
  parseWorkActivityResponse,
  workActivityPath,
  type WorkActivityRuntimeEvent,
} from '../../../../../contracts/work-activity.contract';
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
  workId?: string;
  activity?: WorkActivityFixture;
  state?: WorkActivityState;
}

interface WorkActivityRuntimeState {
  activity?: WorkActivityFixture;
  state: WorkActivityState;
}

interface WorkActivityLoadOptions {
  fetcher?: typeof fetch;
  signal?: AbortSignal;
}

const activityFilters: readonly { id: WorkActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'human', label: 'Human' },
  { id: 'ai', label: 'AI' },
  { id: 'critical', label: 'Critical' },
  { id: 'sources', label: 'Sources' },
];

function producerInitials(producer: string): string {
  const initials = producer
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || 'RT';
}

function runtimeEventToActivityEvent(event: WorkActivityRuntimeEvent): WorkActivityEventFixture {
  const critical = event.targetState === 'FAILED' || event.targetState === 'TIMEOUT';
  const transition = `${event.sourceState ?? 'NONE'} → ${event.targetState ?? 'NONE'}`;

  return {
    id: event.eventId,
    actor: event.producer,
    initials: producerInitials(event.producer),
    kind: 'nova',
    timeLabel: event.occurredAt,
    summary: event.eventName,
    ...(critical ? { critical: true } : {}),
    filters: critical ? ['ai', 'critical'] : ['ai'],
    detail: {
      headline: transition,
      tone: critical ? 'critical' : 'neutral',
      description: `Sequence ${event.sequence} · Correlation ${event.correlationId}`,
      sources: [],
    },
  };
}

export async function loadWorkActivity(
  workId: string,
  {
    fetcher = fetch,
    signal,
  }: WorkActivityLoadOptions = {},
): Promise<WorkActivityFixture | undefined> {
  const response = await fetcher(workActivityPath(workId), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Work Activity BFF read failed with HTTP ${response.status}.`);
  }

  const activity = parseWorkActivityResponse(await response.json());
  if (activity.workIdentity.workId !== workId) {
    throw new Error('Work Activity BFF identity does not match the requested Work.');
  }
  if (activity.events.length === 0) {
    return undefined;
  }

  return {
    workId: activity.workIdentity.workId,
    events: activity.events.map(runtimeEventToActivityEvent),
  };
}

function useWorkActivityRuntime(
  workId: string | undefined,
  enabled: boolean,
): WorkActivityRuntimeState {
  const [runtimeState, setRuntimeState] = useState<WorkActivityRuntimeState>({
    state: enabled ? 'loading' : 'empty',
  });

  useEffect(() => {
    if (!enabled || !workId) {
      return;
    }

    const controller = new AbortController();
    setRuntimeState({ state: 'loading' });
    void loadWorkActivity(workId, { signal: controller.signal })
      .then((activity) => {
        setRuntimeState(activity ? { activity, state: 'ready' } : { state: 'empty' });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setRuntimeState({ state: 'error' });
      });

    return () => controller.abort();
  }, [enabled, workId]);

  return runtimeState;
}

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
          <time dateTime={event.timeLabel}>{event.timeLabel}</time>
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

function WorkActivityFrame({
  children,
  work,
}: {
  children: ReactNode;
  work?: WorkOverviewFixture;
}) {
  if (!work) {
    return <PageContainer className={overviewStyles.pageState}>{children}</PageContainer>;
  }

  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="activity" showConfidenceLabel work={work} />
      <main aria-label="Work activity" className={styles.activity}>
        {children}
      </main>
    </PageContainer>
  );
}

export function WorkActivityPage({
  activity: activityOverride,
  state: stateOverride,
  work,
  workId,
}: WorkActivityPageProps) {
  const [activeFilter, setActiveFilter] = useState<WorkActivityFilter>('all');
  const useRuntime = stateOverride === undefined && activityOverride === undefined;
  const runtimeState = useWorkActivityRuntime(workId, useRuntime);
  const state = stateOverride ?? (activityOverride ? 'ready' : runtimeState.state);
  const activity = activityOverride ?? runtimeState.activity;

  if (state === 'loading') {
    return (
      <WorkActivityFrame work={work}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}>
            <Spinner label="Loading Work Activity" />
            <span>Loading Work Activity</span>
          </div>
          <Skeleton height="var(--n-space-96)" />
          <Skeleton height="var(--n-space-120)" />
          <Skeleton height="var(--n-space-96)" />
        </div>
      </WorkActivityFrame>
    );
  }

  if (state === 'error') {
    return (
      <WorkActivityFrame work={work}>
        <EmptyState
          heading="Activity unavailable"
          description="The Work Activity could not be displayed."
        />
      </WorkActivityFrame>
    );
  }

  if (state === 'empty' || !activity) {
    return (
      <WorkActivityFrame work={work}>
        <EmptyState
          heading="No activity available"
          description="Select a Work with available Activity."
        />
      </WorkActivityFrame>
    );
  }

  const visibleEvents = activeFilter === 'all'
    ? activity.events
    : activity.events.filter((event) => event.filters.includes(activeFilter));

  return (
    <WorkActivityFrame work={work}>
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
    </WorkActivityFrame>
  );
}
