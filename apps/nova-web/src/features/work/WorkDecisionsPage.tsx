import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Skeleton } from '../../components/shared/Skeleton';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Surface } from '../../components/surfaces/Surface';
import { useNavigation } from '../../hooks/useNavigation';
import type { WorkDecisionFixture, WorkDecisionsFixture } from './workDecisionsFixture';
import type { WorkOverviewFixture } from './workOverviewFixture';
import overviewStyles from './WorkOverviewPage.module.css';
import { WorkPageHeader } from './WorkPageHeader';
import styles from './WorkDecisionsPage.module.css';

export type WorkDecisionsState = 'ready' | 'loading' | 'empty' | 'error';

export interface WorkDecisionsPageProps {
  work?: WorkOverviewFixture;
  decisions?: WorkDecisionsFixture;
  state?: WorkDecisionsState;
}

function DecisionCard({ decision }: { decision: WorkDecisionFixture }) {
  const { navigate } = useNavigation();

  return (
    <Surface
      aria-label={decision.title}
      className={styles.decisionCard}
      padding="none"
      role="article"
    >
      <div className={styles.decisionMeta}>
        <Badge size="sm" tone="error">◷ {decision.dueLabel}</Badge>
        <strong>{decision.confidence}%</strong>
      </div>
      <h3>{decision.title}</h3>
      <p className={styles.recommendation}>✣ {decision.recommendation}</p>
      <div className={styles.impactGrid}>
        <div className={[styles.impact, styles.approvedImpact].join(' ')}>
          <strong>IF APPROVED</strong>
          <p>{decision.approvedImpact}</p>
        </div>
        <div className={[styles.impact, styles.rejectedImpact].join(' ')}>
          <strong>IF REJECTED</strong>
          <p>{decision.rejectedImpact}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          size="sm"
          onClick={() => navigate('decision.detail', {
            pathParams: { decisionId: decision.decisionId },
          })}
        >
          Review &amp; decide →
        </Button>
        <span className={styles.whyLabel}>Why?⌄</span>
      </div>
    </Surface>
  );
}

export function WorkDecisionsPage({ work, decisions, state = 'ready' }: WorkDecisionsPageProps) {
  if (state === 'loading') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}>
            <Spinner label="Loading Work Decisions" />
            <span>Loading Work Decisions</span>
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
          heading="Decisions unavailable"
          description="The Work Decisions could not be displayed."
        />
      </PageContainer>
    );
  }

  if (state === 'empty' || !work || !decisions || decisions.decisions.length === 0) {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState
          heading="No decisions available"
          description="Select a Work with decisions requiring review."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="decisions" work={work} />
      <main aria-label="Work decisions" className={styles.decisionsPage}>
        <h2>Decisions</h2>
        <div className={styles.decisionList}>
          {decisions.decisions.map((decision) => (
            <DecisionCard decision={decision} key={decision.decisionId} />
          ))}
        </div>
      </main>
    </PageContainer>
  );
}
