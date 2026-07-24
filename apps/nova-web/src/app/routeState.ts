import { routeIds, routeRegistry } from '../routes/RouteRegistry';
import { resolveRouteId, routeToPath as resolveRoutePath } from '../routes/routeResolver';

export type NovaRoute = (typeof routeIds)[number];

export const routeOrder: NovaRoute[] = [...routeIds];

export function parseRoute(pathname: string): NovaRoute {
  return resolveRouteId(pathname);
}

export function routeToPath(route: NovaRoute): string {
  return resolveRoutePath(route);
}

export function nextRoute(route: NovaRoute): NovaRoute {
  const index = routeOrder.indexOf(route);
  return routeOrder[(index + 1) % routeOrder.length];
}

export const routeMeta: Record<NovaRoute, { title: string; description: string }> = Object.fromEntries(
  routeIds.map((routeId) => [
    routeId,
    {
      title: routeRegistry[routeId].heading,
      description: routeRegistry[routeId].description,
    },
  ]),
) as Record<NovaRoute, { title: string; description: string }>;
