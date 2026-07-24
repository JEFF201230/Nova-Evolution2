import type { RouteLocation } from './routeResolver';

export const NAVIGATION_CHANGE_EVENT = 'nova:navigationchange';

export interface NavigationChangeDetail {
  location: RouteLocation;
  source: 'push' | 'replace' | 'pop' | 'initial';
}

export function dispatchNavigationChange(detail: NavigationChangeDetail) {
  window.dispatchEvent(new CustomEvent<NavigationChangeDetail>(NAVIGATION_CHANGE_EVENT, { detail }));
}
