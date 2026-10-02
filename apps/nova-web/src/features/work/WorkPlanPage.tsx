import { type ReactNode } from 'react';
import type { WorkPlanAvailable } from '../../../../../contracts/work-plan.contract';
import { Skeleton } from '../../components/shared/Skeleton';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Surface } from '../../components/surfaces/Surface';
import { WorkPageHeader } from './WorkPageHeader';
import overviewStyles from './WorkOverviewPage.module.css';
import styles from './WorkPlanPage.module.css';

export type WorkPlanState =
  | 'ready'
  | 'loading'
  | 'empty'
  | 'withdrawn'
  | 'unavailable'
  | 'not-found'
  | 'error';

export interface WorkPlanPageProps {
  plan?: WorkPlanAvailable;
  state?: WorkPlanState;
  workId?: string;
}

function WorkPlanStateFrame({ children, workId }: { children: ReactNode; workId?: string }) {
  if (!workId) {
    return <PageContainer className={overviewStyles.pageState}>{children}</PageContainer>;
  }
  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="plan" work={{ workId, title: workId }} />
      <div className={overviewStyles.pageState}>{children}</div>
    </PageContainer>
  );
}

function CurrentPhase({ plan }: { plan: WorkPlanAvailable }) {
  return (
    <Surface className={[styles.phaseCard, styles.active].join(' ')} padding="none">
      <span aria-hidden="true" className={styles.phaseStatus}>↻</span>
      <div className={styles.phaseContent}>
        <h2>Current phase: {plan.phase.phaseId}</h2>
        <p className={styles.phaseMeta}>
          <span>Phase {plan.phase.current} of {plan.phase.total}</span>
          <span>·</span>
          <span>Due {plan.dueAt ?? 'Not scheduled'}</span>
        </p>
        {plan.dependencies.length > 0 ? (
          <>
            <h3 className={styles.dependencyHeading}>Dependencies</h3>
            <ul className={styles.dependencyList}>
              {plan.dependencies.map((dependency) => (
                <li key={`${dependency.prerequisite}:${dependency.dependent}`}>
                  <span>{dependency.prerequisite}</span>
                  <span aria-hidden="true">→</span>
                  <span>{dependency.dependent}</span>
                </li>
              ))}
            </ul>
          </>
        ) : <p className={styles.noDependencies}>No dependencies declared.</p>}
      </div>
    </Surface>
  );
}

export function WorkPlanPage({ plan, state = 'ready', workId }: WorkPlanPageProps) {
  if (state === 'loading') {
    return (
      <WorkPlanStateFrame workId={workId}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}>
            <Spinner label="Loading Work Plan" />
            <span>Loading Work Plan</span>
          </div>
          <Skeleton height="var(--n-space-120)" />
          <Skeleton height="var(--n-space-120)" />
          <Skeleton height="var(--n-space-120)" />
        </div>
      </WorkPlanStateFrame>
    );
  }

  if (state === 'error') {
    return (
      <WorkPlanStateFrame workId={workId}>
        <EmptyState heading="Plan unavailable" description="The Work Plan could not be displayed." />
      </WorkPlanStateFrame>
    );
  }

  if (state === 'unavailable') {
    return (
      <WorkPlanStateFrame workId={workId}>
        <EmptyState heading="Plan unavailable" description="The Planning producer is currently unavailable." />
      </WorkPlanStateFrame>
    );
  }

  if (state === 'not-found') {
    return (
      <WorkPlanStateFrame workId={workId}>
        <EmptyState heading="Work not found" description="The requested Work does not exist." />
      </WorkPlanStateFrame>
    );
  }

  if (state === 'withdrawn') {
    return (
      <WorkPlanStateFrame workId={workId}>
        <EmptyState heading="Plan withdrawn" description="The authoritative Planning revision was withdrawn." />
      </WorkPlanStateFrame>
    );
  }

  if (state === 'empty' || !plan) {
    return (
      <WorkPlanStateFrame workId={workId}>
        <EmptyState heading="No plan available" description="No Planning data is available for this Work." />
      </WorkPlanStateFrame>
    );
  }

  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader
        activeTab="plan"
        work={{
          workId: plan.workIdentity.workId,
          title: plan.workIdentity.workId,
          phase: plan.phase.current,
          phaseCount: plan.phase.total,
          dueLabel: plan.dueAt ?? 'Not scheduled',
        }}
      />
      <main aria-label="Work plan" className={styles.planList}>
        <CurrentPhase plan={plan} />
      </main>
    </PageContainer>
  );
}
