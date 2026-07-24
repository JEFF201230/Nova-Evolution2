import type { RouteId } from '../../routes/RouteDefinition';
import { DecisionsSurface } from './DecisionsSurface';
import { DeliverablesSurface } from './DeliverablesSurface';
import { HomeSurface } from './HomeSurface';
import { WorkSurface } from './WorkSurface';
import { CanvasPage, ClarifyPage, ConfirmPage, PlanPage } from '../../features/work-setup';

export function RouteSurface({
  routeId,
  enableWorkSetup = false,
}: {
  routeId: RouteId;
  enableWorkSetup?: boolean;
}) {
  switch (routeId) {
    case 'home':
      return <HomeSurface />;
    case 'work':
      return <WorkSurface />;
    case 'decisions':
      return <DecisionsSurface />;
    case 'deliverables':
      return <DeliverablesSurface />;
    case 'clarify':
      return enableWorkSetup ? <ClarifyPage /> : null;
    case 'canvas':
      return enableWorkSetup ? <CanvasPage /> : null;
    case 'plan':
      return enableWorkSetup ? <PlanPage /> : null;
    case 'confirm':
      return enableWorkSetup ? <ConfirmPage /> : null;
    default:
      return <HomeSurface />;
  }
}
