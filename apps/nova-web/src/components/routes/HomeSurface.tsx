import { Card } from '../surfaces/Card';
import { RouteDescription } from './RouteDescription';
import { RoutePlaceholder } from './RoutePlaceholder';
import { RouteTitle } from './RouteTitle';

export function HomeSurface() {
  return (
    <div>
      <RouteTitle>Home</RouteTitle>
      <RouteDescription>
        Structural entry point reserved for future LOTs. This surface only frames the area where
        Home functionality will later be added.
      </RouteDescription>
      <RoutePlaceholder
        title="Home surface"
        description="Reserved structural home surface. No business content is rendered here."
        surfaceLabel="Home"
        nextLotLabel="Lot 004 — Home"
      />
      <Card heading="Reserved zones" description="Placeholders for future content blocks.">
        <p>Summary, next actions, and home-specific workspaces will be introduced later.</p>
      </Card>
    </div>
  );
}
