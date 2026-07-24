import {
  routeNames,
  type RouteId,
  type RouteName,
  type RoutePathParams,
  type WorkTab,
} from './RouteDefinition';
import {
  routeDefinitionRegistry,
  routeDefinitions,
  routePathRegistry,
  routeRegistry,
} from './RouteRegistry';

export type PathParameterError = 'INVALID_PATH_PARAMETER_ENCODING';

export interface RouteLocation {
  routeId: RouteId;
  routeName: RouteName;
  pathname: string;
  search: string;
  params: URLSearchParams;
  pathParams: RoutePathParams;
  workTab?: WorkTab;
  matched: boolean;
  pathParameterError?: PathParameterError;
}

interface RouteMatch {
  definition: (typeof routeDefinitions)[number];
  pathParams: RoutePathParams;
}

export function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
}

function matchDefinition(pathname: string): RouteMatch | PathParameterError | undefined {
  const exactDefinition = routePathRegistry[pathname];
  if (exactDefinition) {
    return { definition: exactDefinition, pathParams: {} };
  }

  const pathnameSegments = pathname.split('/').filter(Boolean);

  for (const definition of routeDefinitions) {
    if (!definition.path.includes(':')) {
      continue;
    }

    const patternSegments = definition.path.split('/').filter(Boolean);
    if (patternSegments.length !== pathnameSegments.length) {
      continue;
    }

    const pathParams: RoutePathParams = {};
    let matched = true;

    for (let index = 0; index < patternSegments.length; index += 1) {
      const patternSegment = patternSegments[index];
      const pathnameSegment = pathnameSegments[index];

      if (!patternSegment.startsWith(':')) {
        if (patternSegment !== pathnameSegment) {
          matched = false;
          break;
        }
        continue;
      }

      const parameterName = patternSegment.slice(1) as keyof RoutePathParams;
      try {
        pathParams[parameterName] = decodeURIComponent(pathnameSegment);
      } catch (error) {
        if (error instanceof URIError) {
          return 'INVALID_PATH_PARAMETER_ENCODING';
        }
        throw error;
      }
    }

    if (matched) {
      return { definition, pathParams };
    }
  }

  return undefined;
}

export function resolveRouteLocation(pathname: string, search = ''): RouteLocation {
  const normalizedPathname = normalizePathname(pathname);
  const match = matchDefinition(normalizedPathname);

  if (!match || typeof match === 'string') {
    return {
      routeId: routeRegistry.home.surfaceRouteId,
      routeName: routeRegistry.home.id,
      pathname: routeRegistry.home.path,
      search,
      params: new URLSearchParams(search),
      pathParams: {},
      matched: false,
      ...(match ? { pathParameterError: match } : {}),
    };
  }

  return {
    routeId: match.definition.surfaceRouteId,
    routeName: match.definition.id,
    pathname: normalizedPathname,
    search,
    params: new URLSearchParams(search),
    pathParams: match.pathParams,
    workTab: match.definition.workTab,
    matched: true,
  };
}

export function resolveRouteId(pathname: string): RouteId {
  return resolveRouteLocation(pathname).routeId;
}

export function resolveRouteName(pathname: string): RouteName {
  return resolveRouteLocation(pathname).routeName;
}

export function buildRoutePath(routeName: RouteName, pathParams: RoutePathParams = {}): string {
  const definition = routeDefinitionRegistry[routeName];

  return definition.path.replace(/:([A-Za-z][A-Za-z0-9]*)/g, (_placeholder, parameterName: keyof RoutePathParams) => {
    const value = pathParams[parameterName];
    if (value === undefined || value === '') {
      throw new Error(`Missing path parameter: ${parameterName}`);
    }
    return encodeURIComponent(value);
  });
}

export function routeToPath(routeName: RouteName, pathParams: RoutePathParams = {}): string {
  return buildRoutePath(routeName, pathParams);
}

export function buildRouteHref(
  routeName: RouteName,
  search = '',
  pathParams: RoutePathParams = {},
): string {
  return `${buildRoutePath(routeName, pathParams)}${search}`;
}

export function createFallbackLocation(search = ''): RouteLocation {
  return resolveRouteLocation(routeRegistry.home.path, search);
}

export { routeNames };
