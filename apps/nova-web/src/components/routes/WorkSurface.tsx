import { WorkActivityPage } from '../../features/work/WorkActivityPage';
import { WorkDecisionsPage } from '../../features/work/WorkDecisionsPage';
import { WorkDeliverablesPage } from '../../features/work/WorkDeliverablesPage';
import { WorkOverviewPage } from '../../features/work/WorkOverviewPage';
import { WorkPeoplePage } from '../../features/work/WorkPeoplePage';
import { WorkPlanPage } from '../../features/work/WorkPlanPage';
import { WorkSourcesPage } from '../../features/work/WorkSourcesPage';
import { getWorkDecisionsFixture } from '../../features/work/workDecisionsFixture';
import { getWorkDeliverablesFixture } from '../../features/work/workDeliverablesFixture';
import { getWorkOverviewFixture } from '../../features/work/workOverviewFixture';
import { useWorkOverview } from '../../features/work/useWorkOverview';
import { useWorkPlan } from '../../features/work/useWorkPlan';
import { useWorkPeople } from '../../features/work/useWorkPeople';
import { getWorkSourcesFixture } from '../../features/work/workSourcesFixture';
import { usePathParams, useWorkTab } from '../../hooks/useRouteParams';

export function WorkSurface() {
  const { workId } = usePathParams();
  const activeTab = useWorkTab() ?? 'overview';
  const overview = useWorkOverview(workId, activeTab === 'overview');
  const plan = useWorkPlan(workId, activeTab === 'plan');
  const people = useWorkPeople(workId, activeTab === 'people');

  if (activeTab === 'overview') {
    return <WorkOverviewPage activeTab="overview" state={overview.state} work={overview.work} />;
  }
  if (activeTab === 'plan') {
    return (
      <WorkPlanPage
        plan={plan.state === 'ready' ? plan.plan : undefined}
        state={plan.state}
        workId={workId}
      />
    );
  }

  const work = workId ? getWorkOverviewFixture(workId) : undefined;

  if (activeTab === 'activity') {
    return (
      <WorkActivityPage
        work={work}
        workId={workId}
      />
    );
  }

  if (activeTab === 'people') {
    return (
      <WorkPeoplePage
        people={people.state === 'ready' ? people.people : undefined}
        state={people.state}
        workId={workId}
      />
    );
  }

  if (activeTab === 'sources') {
    const sources = workId ? getWorkSourcesFixture(workId) : undefined;

    return (
      <WorkSourcesPage
        sources={sources}
        state={work && sources ? 'ready' : 'empty'}
        work={work}
      />
    );
  }

  if (activeTab === 'decisions') {
    const decisions = workId ? getWorkDecisionsFixture(workId) : undefined;

    return (
      <WorkDecisionsPage
        decisions={decisions}
        state={work && decisions ? 'ready' : 'empty'}
        work={work}
      />
    );
  }

  if (activeTab === 'deliverables') {
    const deliverables = workId ? getWorkDeliverablesFixture(workId) : undefined;

    return (
      <WorkDeliverablesPage
        deliverables={deliverables}
        state={work && deliverables ? 'ready' : 'empty'}
        work={work}
      />
    );
  }

  return <WorkOverviewPage activeTab={activeTab} state="empty" />;
}
