import { useMemo, useState } from 'react';
import { Badge } from '../shared/Badge';
import { useNavigation } from '../../hooks/useNavigation';
import { ConfidenceChip, FilterTabs, type FilterOption } from './GlobalRouteComponents';
import { globalDecisionsFixture, type GlobalDecisionStatus } from './globalRouteFixtures';
import styles from './GlobalRoutes.module.css';

type DecisionFilter = 'all' | GlobalDecisionStatus;

const decisionFilters: readonly FilterOption<DecisionFilter>[] = [
  { id: 'all', label: 'All', count: globalDecisionsFixture.length },
  {
    id: 'pending',
    label: 'Needs my decision',
    count: globalDecisionsFixture.filter((decision) => decision.status === 'pending').length,
  },
  {
    id: 'waiting',
    label: 'Waiting',
    count: globalDecisionsFixture.filter((decision) => decision.status === 'waiting').length,
  },
  {
    id: 'decided',
    label: 'History',
    count: globalDecisionsFixture.filter((decision) => decision.status === 'decided').length,
  },
];

export function DecisionsSurface() {
  const [filter, setFilter] = useState<DecisionFilter>('all');
  const { navigate } = useNavigation();
  const decisions = useMemo(
    () => globalDecisionsFixture.filter((decision) => filter === 'all' || decision.status === filter),
    [filter],
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Decisions</h1>
        <p className={styles.subtitle}>1 decision requires your authority · due in 4 days</p>
      </header>

      <FilterTabs label="Decision filters" onChange={setFilter} options={decisionFilters} value={filter} />

      <section aria-label="Decisions" className={styles.decisionList}>
        {decisions.map((decision) => {
          const content = (
            <>
              {decision.heroSentence ? (
                <p className={styles.heroSentence}>{decision.heroSentence}</p>
              ) : null}
              <div className={styles.decisionMeta}>
                {decision.dueLabel ? (
                  <Badge size="sm" tone={decision.status === 'pending' ? 'warning' : 'neutral'}>
                    {decision.dueLabel}
                  </Badge>
                ) : null}
                {decision.confidence !== undefined ? (
                  <ConfidenceChip confidence={decision.confidence} />
                ) : null}
              </div>
              <p className={styles.statement}>{decision.statement}</p>
              {decision.outcome ? <span className={styles.outcome}>{decision.outcome}</span> : null}
            </>
          );
          const className = `${styles.decisionCard} ${styles[decision.status]}`;

          return decision.status === 'decided' ? (
            <article className={className} key={decision.decisionId}>
              {content}
            </article>
          ) : (
            <article
              aria-label={`Open decision package: ${decision.statement}`}
              className={className}
              key={decision.decisionId}
              onClick={() =>
                navigate('decision.package', { pathParams: { decisionId: decision.decisionId } })
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate('decision.package', {
                    pathParams: { decisionId: decision.decisionId },
                  });
                }
              }}
              role="link"
              tabIndex={0}
            >
              {content}
            </article>
          );
        })}
      </section>
    </main>
  );
}
