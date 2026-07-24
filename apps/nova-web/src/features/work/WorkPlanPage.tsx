import { Skeleton } from '../../components/shared/Skeleton';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Surface } from '../../components/surfaces/Surface';
import type { WorkOverviewFixture } from './workOverviewFixture';
import type { WorkPlanFixture, WorkPlanPhaseFixture } from './workPlanFixture';
import { WorkPageHeader } from './WorkPageHeader';
import overviewStyles from './WorkOverviewPage.module.css';
import styles from './WorkPlanPage.module.css';

export type WorkPlanState = 'ready' | 'loading' | 'empty' | 'error';

export interface WorkPlanPageProps {
  work?: WorkOverviewFixture;
  plan?: WorkPlanFixture;
  state?: WorkPlanState;
}

function PhaseCard({ phase }: { phase: WorkPlanPhaseFixture }) {
  return (
    <Surface
      className={[styles.phaseCard, styles[phase.state]].join(' ')}
      padding="none"
    >
      <span aria-hidden="true" className={styles.phaseStatus}>
        {phase.state === 'complete' ? '✓' : phase.state === 'active' ? '↻' : ''}
      </span>
      <div className={styles.phaseContent}>
        <h2>{phase.title}</h2>
        <p className={styles.phaseMeta}>
          <span>{phase.category}</span>
          <span>·</span>
          <strong>{phase.probability}% probability</strong>
          <span>·</span>
          <span>Remaining: {phase.remaining}</span>
        </p>
        {phase.warning ? <p className={styles.warning}>⚠ {phase.warning}</p> : null}
        <ul className={styles.taskList}>
          {phase.tasks.map((task) => (
            <li className={task.complete ? styles.taskComplete : undefined} key={task.id}>
              <span aria-hidden="true" className={styles.taskMarker}>
                {task.complete ? '✓' : ''}
              </span>
              <span>{task.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Surface>
  );
}

export function WorkPlanPage({ work, plan, state = 'ready' }: WorkPlanPageProps) {
  if (state === 'loading') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}>
            <Spinner label="Loading Work Plan" />
            <span>Loading Work Plan</span>
          </div>
          <Skeleton height="var(--n-space-120)" />
          <Skeleton height="var(--n-space-120)" />
          <Skeleton height="var(--n-space-120)" />
        </div>
      </PageContainer>
    );
  }

  if (state === 'error') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState heading="Plan unavailable" description="The Work Plan could not be displayed." />
      </PageContainer>
    );
  }

  if (state === 'empty' || !work || !plan) {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState heading="No plan available" description="Select a Work with an available Plan." />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="plan" showConfidenceLabel work={work} />
      <main aria-label="Work plan" className={styles.planList}>
        {plan.phases.map((phase) => <PhaseCard key={phase.id} phase={phase} />)}
      </main>
    </PageContainer>
  );
}
