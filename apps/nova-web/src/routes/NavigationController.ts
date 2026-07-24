import { dispatchNavigationChange } from './navigationEvents';
import { buildRouteHref, resolveRouteLocation, type RouteLocation } from './routeResolver';
import { routeRegistry } from './RouteRegistry';
import type { RouteName, RoutePathParams } from './RouteDefinition';

export interface NavigationOptions {
  replace?: boolean;
  search?: string | URLSearchParams;
  pathParams?: RoutePathParams;
}

export interface NavigationController {
  readonly location: RouteLocation;
  push: (routeName: RouteName, options?: NavigationOptions) => RouteLocation;
  replace: (routeName: RouteName, options?: NavigationOptions) => RouteLocation;
  sync: (source?: 'initial' | 'pop') => RouteLocation;
  hrefFor: (routeName: RouteName, options?: NavigationOptions) => string;
}

function formatSearch(search?: string | URLSearchParams): string {
  if (!search) {
    return '';
  }

  if (typeof search === 'string') {
    return search.startsWith('?') || search === '' ? search : `?${search}`;
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

function buildSearch(options: NavigationOptions | undefined, currentSearch: string): string {
  if (options?.search !== undefined) {
    return formatSearch(options.search);
  }

  return currentSearch;
}

export function createNavigationController() {
  let location = resolveRouteLocation(window.location.pathname, window.location.search);

  function commit(routeName: RouteName, options: NavigationOptions = {}, source: 'push' | 'replace'): RouteLocation {
    const search = buildSearch(options, location.search);
    const href = buildRouteHref(routeName, search, options.pathParams);
    const effectiveSource = options.replace ? 'replace' : source;

    if (effectiveSource === 'push') {
      window.history.pushState({ routeName, pathParams: options.pathParams }, '', href);
    } else {
      window.history.replaceState({ routeName, pathParams: options.pathParams }, '', href);
    }

    location = resolveRouteLocation(window.location.pathname, window.location.search);
    dispatchNavigationChange({ location, source: effectiveSource });
    return location;
  }

  return {
    get location() {
      return location;
    },
    push(routeName: RouteName, options: NavigationOptions = {}) {
      return commit(routeName, options, 'push');
    },
    replace(routeName: RouteName, options: NavigationOptions = {}) {
      return commit(routeName, options, 'replace');
    },
    sync(source: 'initial' | 'pop' = 'initial') {
      const resolved = resolveRouteLocation(window.location.pathname, window.location.search);
      if (!resolved.matched) {
        const href = buildRouteHref(routeRegistry.home.id, resolved.search);
        window.history.replaceState({ routeName: routeRegistry.home.id }, '', href);
        location = resolveRouteLocation(window.location.pathname, window.location.search);
      } else {
        location = resolved;
      }
      dispatchNavigationChange({ location, source });
      return location;
    },
    hrefFor(routeName: RouteName, options: NavigationOptions = {}) {
      const search = options.search !== undefined ? formatSearch(options.search) : location.search;
      return buildRouteHref(routeName, search, options.pathParams);
    },
  } satisfies NavigationController;
}
