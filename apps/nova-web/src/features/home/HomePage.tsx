import { useEffect, useState } from 'react';
import type { HomeActiveWorkItem } from '../../../../../contracts/home-active-work.contract';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { Skeleton } from '../../components/shared/Skeleton';
import { useNavigation } from '../../hooks/useNavigation';
import { SituationDetailsDrawer } from '../situation-details';
import { LoginDialog } from '../authentication/LoginDialog';
import { homeFixture } from './homeFixture';
import { HomeHeader } from './HomeHeader';
import { ObjectiveComposer } from './ObjectiveComposer';
import { PriorityInsight } from './PriorityInsight';
import { PendingDecisionCard } from './PendingDecisionCard';
import { ActiveWorkSection } from './ActiveWorkSection';
import { BackgroundWorkSection } from './BackgroundWorkSection';
import styles from './HomePage.module.css';
import type { HomeActiveWorkLoader } from './homeActiveWork.service';
import { useHomeActiveWork } from './useHomeActiveWork';

export type HomePageState = 'default' | 'loading' | 'empty' | 'error' | 'blocked';

export interface HomePageProps {
  activeWork?: readonly HomeActiveWorkItem[];
  activeWorkLoader?: HomeActiveWorkLoader;
  state?: HomePageState;
  onOpenWork: () => void;
  onOpenDecision: () => void;
  onOpenDetails?: () => void;
  onStartWorkSetup: (objective: string) => void;
}

export function HomePage({
  activeWork,
  activeWorkLoader,
  state = 'default',
  onOpenWork,
  onOpenDecision,
  onOpenDetails,
  onStartWorkSetup,
}: HomePageProps) {
  const { navigate } = useNavigation();
  const [situationDetailsOpen, setSituationDetailsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

useEffect(() => {
  const controller = new AbortController();

  void fetch('/session', {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        return;
      }

      const session = await response.json() as { authenticated?: boolean };
      setAuthenticated(session.authenticated === true);
    })
    .catch(() => undefined);

  return () => controller.abort();
}, []);
  const activeWorkRuntime = useHomeActiveWork(
    state === 'default' && activeWork === undefined,
    activeWorkLoader,
  );
  const activeWorks = activeWork ?? activeWorkRuntime.works;
  const activeWorkState = activeWork === undefined
    ? activeWorkRuntime.state
    : 'ready';

  function openWork(workId: string) {
    navigate('work.detail', { pathParams: { workId } });
  }

  function openDecision(decisionId: string) {
    navigate('decision.detail', { pathParams: { decisionId } });
  }

  if (state === 'loading') {
    return (
      <div className={styles.homeView}>
        <div className={styles.page}>
          <div className={styles.header}>
            <p className={styles.sectionHeading}>{homeFixture.loading.title}</p>
            <p className={styles.sectionDescription}>{homeFixture.loading.description}</p>
          </div>
          <div className={styles.loadingCard}>
            <Skeleton className={styles.loadingHero} />
            <Skeleton className={styles.loadingBlock} />
            <Skeleton className={styles.loadingBlock} />
            <Skeleton className={styles.loadingBlock} />
          </div>
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className={styles.homeView}>
        <div className={styles.page}>
          <HomeHeader />
          <EmptyState
            className={styles.stateCard}
            heading={homeFixture.empty.title}
            description={homeFixture.empty.description}
            actionLabel="Open work"
            onAction={onOpenWork}
            secondaryActionLabel="Open decisions"
            onSecondaryAction={onOpenDecision}
          />
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={styles.homeView}>
        <div className={styles.page}>
          <HomeHeader />
          <EmptyState
            className={styles.stateCard}
            heading={homeFixture.error.title}
            description={homeFixture.error.description}
            actionLabel="Retry"
            onAction={onOpenWork}
            secondaryActionLabel="Open work"
            onSecondaryAction={onOpenWork}
          />
        </div>
      </div>
    );
  }

  if (state === 'blocked') {
    return (
      <div className={styles.homeView}>
        <div className={styles.page}>
          <HomeHeader />
          <EmptyState
            className={styles.stateCard}
            heading={homeFixture.blocked.title}
            description={homeFixture.blocked.description}
            actionLabel="Open decision"
            onAction={onOpenDecision}
            secondaryActionLabel="Open work"
            onSecondaryAction={onOpenWork}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.homeView}>
      <div className={styles.page}>
        <HomeHeader />

        <ObjectiveComposer onContinue={onStartWorkSetup} />

        <PriorityInsight
          onOpenWork={openWork}
          onOpenDetails={() => setSituationDetailsOpen(true)}
        />

        <PendingDecisionCard onOpenDecision={openDecision} />

        <ActiveWorkSection
          works={activeWorks}
          state={activeWorkState}
          onOpenWork={openWork}
        />

        <BackgroundWorkSection onOpenDetails={onOpenDetails} />
        {!authenticated ? (
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
          >
            Connexion
          </button>
        ) : null}
      </div>

      <SituationDetailsDrawer
        open={situationDetailsOpen}
        onClose={() => setSituationDetailsOpen(false)}
      />

      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onAuthenticated={() => window.location.reload()}
      />
    </div>
  );
}
