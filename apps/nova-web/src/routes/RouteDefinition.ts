export const primaryRouteIds = ['home', 'work', 'decisions', 'deliverables'] as const;
export const workSetupRouteIds = ['clarify', 'canvas', 'plan', 'confirm'] as const;
export const routeIds = [...primaryRouteIds, ...workSetupRouteIds] as const;

export const dynamicRouteNames = [
  'work.detail',
  'work.overview',
  'work.plan',
  'work.activity',
  'work.people',
  'work.sources',
  'work.decisions',
  'work.deliverables',
  'decision.detail',
  'decision.package',
  'decision.pause',
  'decision.receipt',
] as const;

export const routeNames = [...routeIds, ...dynamicRouteNames] as const;

export type RouteId = (typeof routeIds)[number];
export type DynamicRouteName = (typeof dynamicRouteNames)[number];
export type RouteName = (typeof routeNames)[number];
export type WorkTab = 'overview' | 'plan' | 'activity' | 'people' | 'sources' | 'decisions' | 'deliverables';

export interface RoutePathParams {
  workId?: string;
  decisionId?: string;
}

export interface RouteDefinition {
  id: RouteName;
  path: `/${string}`;
  surfaceRouteId: RouteId;
  workTab?: WorkTab;
  heading: string;
  description: string;
}
