import { describe, expect, it } from 'vitest';
import {
  buildRouteHref,
  buildRoutePath,
  createFallbackLocation,
  resolveRouteId,
  resolveRouteLocation,
  resolveRouteName,
} from './routeResolver';

describe('routeResolver', () => {
  it('resolves known routes', () => {
    expect(resolveRouteId('/home')).toBe('home');
    expect(resolveRouteId('/work')).toBe('work');
    expect(resolveRouteId('/decisions')).toBe('decisions');
    expect(resolveRouteId('/deliverables')).toBe('deliverables');
    expect(resolveRouteId('/clarify')).toBe('clarify');
    expect(resolveRouteId('/canvas')).toBe('canvas');
    expect(resolveRouteId('/plan')).toBe('plan');
    expect(resolveRouteId('/confirm')).toBe('confirm');
  });

  it('falls back for unknown routes', () => {
    const location = resolveRouteLocation('/unknown', '?foo=bar');

    expect(location.routeId).toBe('home');
    expect(location.matched).toBe(false);
    expect(location.params.get('foo')).toBe('bar');
  });

  it.each([
    ['/work/work-001', 'work.detail', undefined],
    ['/work/work-001/overview', 'work.overview', 'overview'],
    ['/work/work-001/plan', 'work.plan', 'plan'],
    ['/work/work-001/activity', 'work.activity', 'activity'],
    ['/work/work-001/people', 'work.people', 'people'],
    ['/work/work-001/sources', 'work.sources', 'sources'],
    ['/work/work-001/decisions', 'work.decisions', 'decisions'],
    ['/work/work-001/deliverables', 'work.deliverables', 'deliverables'],
  ] as const)('resolves dynamic Work route %s', (pathname, routeName, workTab) => {
    const location = resolveRouteLocation(pathname, '?view=compact');

    expect(location.matched).toBe(true);
    expect(location.routeId).toBe('work');
    expect(location.routeName).toBe(routeName);
    expect(location.pathParams).toEqual({ workId: 'work-001' });
    expect(location.workTab).toBe(workTab);
    expect(location.params.get('view')).toBe('compact');
    expect(location.pathname).toBe(pathname);
  });

  it.each([
    ['/decisions/decision-001', 'decision.detail'],
    ['/decisions/decision-001/package', 'decision.package'],
    ['/decisions/decision-001/pause', 'decision.pause'],
    ['/decisions/decision-001/receipt', 'decision.receipt'],
  ] as const)('resolves dynamic Decision route %s', (pathname, routeName) => {
    const location = resolveRouteLocation(pathname);

    expect(location.matched).toBe(true);
    expect(location.routeId).toBe('decisions');
    expect(location.routeName).toBe(routeName);
    expect(location.pathParams).toEqual({ decisionId: 'decision-001' });
  });

  it('normalizes a trailing slash on dynamic routes', () => {
    const location = resolveRouteLocation('/work/work-001/activity/');

    expect(location.matched).toBe(true);
    expect(location.routeName).toBe('work.activity');
    expect(location.pathname).toBe('/work/work-001/activity');
  });

  it('decodes encoded identifiers and reports malformed encodings explicitly', () => {
    const encoded = resolveRouteLocation('/work/work%20%E2%82%AC/activity');
    const malformed = resolveRouteLocation('/work/%E0%A4%A/activity');

    expect(encoded.pathParams.workId).toBe('work €');
    expect(malformed.matched).toBe(false);
    expect(malformed.routeName).toBe('home');
    expect(malformed.pathParameterError).toBe('INVALID_PATH_PARAMETER_ENCODING');
  });

  it('builds hrefs while preserving search params', () => {
    expect(buildRouteHref('work', '?tab=overview')).toBe('/work?tab=overview');
    expect(createFallbackLocation('?view=all').pathname).toBe('/home');
  });

  it('builds dynamic paths centrally and encodes identifiers', () => {
    expect(buildRoutePath('work.activity', { workId: 'work 001/€' })).toBe(
      '/work/work%20001%2F%E2%82%AC/activity',
    );
    expect(buildRouteHref('decision.receipt', '?from=work', { decisionId: 'decision-001' })).toBe(
      '/decisions/decision-001/receipt?from=work',
    );
    expect(resolveRouteName('/decisions/decision-001/package')).toBe('decision.package');
    expect(() => buildRoutePath('work.overview')).toThrow('Missing path parameter: workId');
  });
});
