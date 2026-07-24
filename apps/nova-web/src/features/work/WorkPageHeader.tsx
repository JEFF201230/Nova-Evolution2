import type { MouseEvent } from 'react';
import { Button } from '../../components/shared/Button';
import { useNavigation } from '../../hooks/useNavigation';
import type { RouteName, WorkTab } from '../../routes/RouteDefinition';
import type { WorkOverviewFixture } from './workOverviewFixture';
import styles from './WorkOverviewPage.module.css';
import planStyles from './WorkPlanPage.module.css';

const workTabs: readonly { id: WorkTab; label: string; routeName: RouteName }[] = [
  { id: 'overview', label: 'Overview', routeName: 'work.overview' },
  { id: 'plan', label: 'Plan', routeName: 'work.plan' },
  { id: 'activity', label: 'Activity', routeName: 'work.activity' },
  { id: 'people', label: 'People', routeName: 'work.people' },
  { id: 'sources', label: 'Sources', routeName: 'work.sources' },
  { id: 'decisions', label: 'Decisions', routeName: 'work.decisions' },
  { id: 'deliverables', label: 'Deliverables', routeName: 'work.deliverables' },
] as const;

export function getWorkTabLabel(tabId: WorkTab) {
  return workTabs.find((tab) => tab.id === tabId)?.label ?? tabId;
}

export function WorkPageHeader({
  work,
  activeTab,
  showConfidenceLabel = false,
}: {
  work: WorkOverviewFixture;
  activeTab: WorkTab;
  showConfidenceLabel?: boolean;
}) {
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
    <header className={styles.workHeader}>
      <div className={styles.workHeading}>
        <div
          className={[
            styles.workMeta,
            showConfidenceLabel && planStyles.workMetaCompact,
          ].filter(Boolean).join(' ')}
        >
          {showConfidenceLabel ? (
            <>
              <span className={planStyles.confidenceCluster}>
                <strong>{work.confidence}%</strong>
                <span>confidence⌄</span>
              </span>
              <span aria-hidden="true">·</span>
            </>
          ) : (
            <strong className={styles.confidenceText}>{work.confidence}%</strong>
          )}
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
    </header>
  );
}
