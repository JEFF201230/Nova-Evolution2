import { useState, type MouseEvent } from 'react';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Progress } from '../../components/shared/Progress';
import { Skeleton } from '../../components/shared/Skeleton';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Surface } from '../../components/surfaces/Surface';
import { useNavigation } from '../../hooks/useNavigation';
import type { RouteName, WorkTab } from '../../routes/RouteDefinition';
import type { WorkOverviewFixture } from './workOverviewFixture';
import styles from './WorkOverviewPage.module.css';

export type WorkOverviewState = 'ready' | 'loading' | 'empty' | 'error';

export interface WorkOverviewPageProps {
  work?: WorkOverviewFixture;
  state?: WorkOverviewState;
  activeTab?: WorkTab;
}

const workTabs: readonly { id: WorkTab; label: string; routeName: RouteName }[] = [
  { id: 'overview', label: 'Overview', routeName: 'work.overview' },
  { id: 'plan', label: 'Plan', routeName: 'work.plan' },
  { id: 'activity', label: 'Activity', routeName: 'work.activity' },
  { id: 'people', label: 'People', routeName: 'work.people' },
  { id: 'sources', label: 'Sources', routeName: 'work.sources' },
  { id: 'decisions', label: 'Decisions', routeName: 'work.decisions' },
  { id: 'deliverables', label: 'Deliverables', routeName: 'work.deliverables' },
] as const;

function confidenceTone(confidence: number): 'success' | 'warning' | 'error' {
  if (confidence >= 80) {
    return 'success';
  }
  if (confidence >= 55) {
    return 'warning';
  }
  return 'error';
}

function WorkTabs({ work, activeTab }: { work: WorkOverviewFixture; activeTab: WorkTab }) {
  const { hrefFor, navigate } = useNavigation();

  function navigateToTab(event: MouseEvent<HTMLAnchorElement>, routeName: RouteName) {
    if (
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    navigate(routeName, { pathParams: { workId: work.workId } });
  }

  function tabLabel(tab: (typeof workTabs)[number]) {
    if (tab.id === 'decisions') {
      return `${tab.label} (1)`;
    }
    if (tab.id === 'deliverables') {
      return `${tab.label} (${work.deliverables.length})`;
    }
    return tab.label;
  }

  return (
    <nav aria-label="Work sections" className={styles.tabs}>
      {workTabs.map((tab) => (
        <a
          key={tab.id}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          className={[styles.tab, activeTab === tab.id && styles.tabActive].filter(Boolean).join(' ')}
          href={hrefFor(tab.routeName, { pathParams: { workId: work.workId } })}
          onClick={(event) => navigateToTab(event, tab.routeName)}
        >
          {tabLabel(tab)}
        </a>
      ))}
    </nav>
  );
}

export function WorkOverviewPage({
  work,
  state = 'ready',
  activeTab = 'overview',
}: WorkOverviewPageProps) {
  const [whyOpen, setWhyOpen] = useState(false);

  if (state === 'loading') {
    return (
      <PageContainer className={styles.pageState}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}>
            <Spinner label="Loading Work Overview" />
            <span>Loading Work Overview</span>
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
      <PageContainer className={styles.pageState}>
        <EmptyState
          heading="Work unavailable"
          description="The Work Overview could not be displayed."
        />
      </PageContainer>
    );
  }

  if (state === 'empty' || !work) {
    return (
      <PageContainer className={styles.pageState}>
        <EmptyState
          heading="No work selected"
          description="Select a Work from Home to open its Overview."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={styles.page}>
      <div className={styles.workHeaderBand}>
        <header className={styles.workHeader}>
          <div className={styles.workHeading}>
            <div className={styles.workMeta}>
              <strong className={styles.confidenceText}>{work.confidence}%</strong>
              <span>
                Phase {work.phase}/{work.phaseCount} · Due {work.dueLabel}
              </span>
            </div>
            <h1 className={styles.title}>{work.title}</h1>
          </div>
          <div className={styles.headerActions}>
            <Button size="sm" variant="secondary">
              ⏸ Pause
            </Button>
            <Button aria-label="More work actions" size="sm" variant="secondary">
              ···
            </Button>
          </div>
          <WorkTabs activeTab={activeTab} work={work} />
        </header>
      </div>

      {activeTab === 'overview' ? (
        <div className={styles.contentGrid}>
          <main className={styles.mainColumn}>
            <Surface className={styles.insightCard} padding="lg" tone="hero">
              <div className={styles.insightMeta}>
                <Badge size="sm" tone="nova">✣ NOVA</Badge>
                <strong className={styles.confidenceText}>{work.confidence}%</strong>
              </div>
              <p className={styles.insightSummary}>{work.insight.summary}</p>
              <p className={styles.insightRecommendation}>{work.insight.recommendation}</p>
            </Surface>

            <Surface className={styles.nextActionCard} padding="lg">
              <p className={styles.eyebrow}>NEXT BEST ACTION</p>
              <h2 className={styles.nextActionTitle}>{work.nextAction.title}</h2>
              <div className={styles.nextActionMeta}>
                <span>◷ {work.nextAction.durationLabel}</span>
                <strong>{work.nextAction.impactLabel}</strong>
                <strong className={styles.confidenceDelta}>
                  {work.nextAction.confidenceFrom}% → {work.nextAction.confidenceTo}%
                </strong>
              </div>
              <div className={styles.nextActionControls}>
                <Button>Open →</Button>
                <button
                  aria-expanded={whyOpen}
                  className={styles.whyButton}
                  type="button"
                  onClick={() => setWhyOpen((open) => !open)}
                >
                  Why?⌄
                </button>
              </div>
              {whyOpen ? <p className={styles.whyCopy}>{work.nextAction.why}</p> : null}
            </Surface>

            <button className={styles.laterActions} type="button">
              <span aria-hidden="true">›</span>
              <span>{work.laterActionCount} more — Later &amp; Background</span>
            </button>

            <Surface className={styles.decisionCard} padding="lg">
              <span aria-hidden="true" className={styles.decisionIcon}>⚖</span>
              <div className={styles.decisionContent}>
                <div className={styles.decisionMeta}>
                  <Badge size="sm" tone="error">◷ {work.pendingDecision.dueLabel}</Badge>
                  <strong className={styles.successText}>{work.pendingDecision.confidence}%</strong>
                </div>
                <h2 className={styles.decisionTitle}>{work.pendingDecision.title}</h2>
                <p className={styles.decisionConsequence}>{work.pendingDecision.consequence}</p>
              </div>
              <span aria-hidden="true" className={styles.decisionArrow}>→</span>
            </Surface>
          </main>

          <aside className={styles.sideColumn} aria-label="Work overview details">
            <Surface className={styles.sideCard} padding="md">
              <div className={styles.progressHeader}>
                <span className={styles.sideLabel}>PROGRESS</span>
                <strong>{work.progress.value}%</strong>
              </div>
              <Progress
                className={styles.progressBar}
                label="Work progress"
                showValue={false}
                value={work.progress.value}
              />
              <dl className={styles.progressDetails}>
                <div><dt>OWNER</dt><dd>{work.progress.owner}</dd></div>
                <div><dt>DEADLINE</dt><dd>{work.progress.deadline}</dd></div>
                <div><dt>PHASE</dt><dd>{work.progress.phaseLabel}</dd></div>
                <div><dt>UPDATED</dt><dd>{work.progress.updatedLabel}</dd></div>
              </dl>
              <button className={styles.inlineLink} type="button">Full analysis ›</button>
            </Surface>

            <Surface className={styles.sideCard} padding="md">
              <p className={styles.sideLabel}>DELIVERABLES</p>
              <ul className={styles.sideList}>
                {work.deliverables.map((deliverable) => (
                  <li className={styles.deliverableRow} key={deliverable.id}>
                    <span aria-hidden="true" className={styles.documentIcon}>▧</span>
                    <span className={styles.rowTitle}>{deliverable.title}</span>
                    <strong className={styles.confidenceText}>{deliverable.confidence}%</strong>
                  </li>
                ))}
              </ul>
            </Surface>

            <Surface className={styles.sideCard} padding="md">
              <p className={styles.sideLabel}>PEOPLE</p>
              {work.people.length ? (
                <ul className={styles.sideList}>
                  {work.people.map((person) => (
                    <li className={styles.personRow} key={person.id}>
                      <span className={[styles.avatar, person.kind === 'nova' && styles.novaAvatar].filter(Boolean).join(' ')}>
                        {person.initials}
                      </span>
                      <span className={styles.personCopy}>
                        <span className={styles.rowTitle}>{person.name}</span>
                        <span className={styles.personAvailability}>{person.availability}</span>
                      </span>
                      <span
                        aria-label={person.active ? 'Available' : 'Unavailable'}
                        className={[styles.availabilityDot, person.active && styles.availabilityDotActive].filter(Boolean).join(' ')}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptySideCopy}>No people assigned.</p>
              )}
            </Surface>

            <Surface className={styles.novaUpdate} padding="md">
              <Badge size="sm" tone="nova">✣ NOVA</Badge>
              <p>{work.novaUpdate}</p>
            </Surface>
          </aside>
        </div>
      ) : (
        <EmptyState
          heading={`${workTabs.find((tab) => tab.id === activeTab)?.label} is not available yet`}
          description="Only Work Overview is implemented in this lot."
        />
      )}
    </PageContainer>
  );
}
