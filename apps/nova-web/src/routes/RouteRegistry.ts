import {
  primaryRouteIds,
  dynamicRouteNames,
  routeIds,
  routeNames,
  workSetupRouteIds,
  type RouteDefinition,
  type RouteId,
  type RouteName,
} from './RouteDefinition';

export const routeDefinitions: RouteDefinition[] = [
  {
    id: 'home',
    path: '/home',
    surfaceRouteId: 'home',
    heading: 'Home',
    description: 'Structural home route reserved for the NOVA shell.',
  },
  {
    id: 'work',
    path: '/work',
    surfaceRouteId: 'work',
    heading: 'Work',
    description: 'Structural work route reserved for future workspace surfaces.',
  },
  {
    id: 'decisions',
    path: '/decisions',
    surfaceRouteId: 'decisions',
    heading: 'Decisions',
    description: 'Structural decisions route reserved for future decision surfaces.',
  },
  {
    id: 'deliverables',
    path: '/deliverables',
    surfaceRouteId: 'deliverables',
    heading: 'Deliverables',
    description: 'Structural deliverables route reserved for future delivery surfaces.',
  },
  {
    id: 'clarify',
    path: '/clarify',
    surfaceRouteId: 'clarify',
    heading: 'Clarify',
    description: 'Work Setup clarification flow.',
  },
  {
    id: 'canvas',
    path: '/canvas',
    surfaceRouteId: 'canvas',
    heading: 'Canvas',
    description: 'Work Setup understanding review.',
  },
  {
    id: 'plan',
    path: '/plan',
    surfaceRouteId: 'plan',
    heading: 'Plan',
    description: 'Work Setup plan review.',
  },
  {
    id: 'confirm',
    path: '/confirm',
    surfaceRouteId: 'confirm',
    heading: 'Confirm',
    description: 'Work Setup autonomy confirmation.',
  },
  {
    id: 'work.detail',
    path: '/work/:workId',
    surfaceRouteId: 'work',
    heading: 'Work',
    description: 'Selected NOVA work.',
  },
  ...(['overview', 'plan', 'activity', 'people', 'sources', 'decisions', 'deliverables'] as const).map(
    (workTab): RouteDefinition => ({
      id: `work.${workTab}`,
      path: `/work/:workId/${workTab}`,
      surfaceRouteId: 'work',
      workTab,
      heading: `Work ${workTab}`,
      description: `Selected NOVA work ${workTab} tab.`,
    }),
  ),
  {
    id: 'decision.detail',
    path: '/decisions/:decisionId',
    surfaceRouteId: 'decisions',
    heading: 'Decision',
    description: 'Selected NOVA decision.',
  },
  ...(['package', 'pause', 'receipt'] as const).map(
    (step): RouteDefinition => ({
      id: `decision.${step}`,
      path: `/decisions/:decisionId/${step}`,
      surfaceRouteId: 'decisions',
      heading: `Decision ${step}`,
      description: `Selected NOVA decision ${step}.`,
    }),
  ),
];

export const routeDefinitionRegistry = Object.fromEntries(routeDefinitions.map((route) => [route.id, route])) as Record<
  RouteName,
  RouteDefinition
>;

export const routeRegistry = Object.fromEntries(
  routeIds.map((routeId) => [routeId, routeDefinitionRegistry[routeId]]),
) as Record<
  RouteId,
  RouteDefinition
>;

export const routePathRegistry = Object.fromEntries(
  routeDefinitions.filter((route) => !route.path.includes(':')).map((route) => [route.path, route]),
) as Record<string, RouteDefinition>;

export { dynamicRouteNames, primaryRouteIds, routeIds, routeNames, workSetupRouteIds };
