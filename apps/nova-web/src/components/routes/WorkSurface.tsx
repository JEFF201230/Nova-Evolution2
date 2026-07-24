import { WorkActivityPage } from '../../features/work/WorkActivityPage';
import { WorkDecisionsPage } from '../../features/work/WorkDecisionsPage';
import { WorkDeliverablesPage } from '../../features/work/WorkDeliverablesPage';
import { WorkOverviewPage } from '../../features/work/WorkOverviewPage';
import { WorkPeoplePage } from '../../features/work/WorkPeoplePage';
import { WorkPlanPage } from '../../features/work/WorkPlanPage';
import { WorkSourcesPage } from '../../features/work/WorkSourcesPage';
import { getWorkActivityFixture } from '../../features/work/workActivityFixture';
import { getWorkDecisionsFixture } from '../../features/work/workDecisionsFixture';
import { getWorkDeliverablesFixture } from '../../features/work/workDeliverablesFixture';
import { getWorkOverviewFixture } from '../../features/work/workOverviewFixture';
import { getWorkPeopleFixture } from '../../features/work/workPeopleFixture';
import { getWorkPlanFixture } from '../../features/work/workPlanFixture';
import { getWorkSourcesFixture } from '../../features/work/workSourcesFixture';
import { usePathParams, useWorkTab } from '../../hooks/useRouteParams';

export function WorkSurface() {
  const { workId } = usePathParams();
  const activeTab = useWorkTab() ?? 'overview';
  const work = workId ? getWorkOverviewFixture(workId) : undefined;

  if (activeTab === 'plan') {
    const plan = workId ? getWorkPlanFixture(workId) : undefined;

    return (
      <WorkPlanPage
        plan={plan}
        state={work && plan ? 'ready' : 'empty'}
        work={work}
      />
    );
  }

  if (activeTab === 'activity') {
    const activity = workId ? getWorkActivityFixture(workId) : undefined;

    return (
      <WorkActivityPage
        activity={activity}
        state={work && activity ? 'ready' : 'empty'}
        work={work}
      />
    );
  }

  if (activeTab === 'people') {
    const people = workId ? getWorkPeopleFixture(workId) : undefined;

    return (
      <WorkPeoplePage
        people={people}
        state={work && people ? 'ready' : 'empty'}
        work={work}
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

  return <WorkOverviewPage activeTab={activeTab} state={work ? 'ready' : 'empty'} work={work} />;
}
