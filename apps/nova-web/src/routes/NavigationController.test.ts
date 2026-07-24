import { describe, expect, it, vi } from 'vitest';
import { createNavigationController } from './NavigationController';

describe('NavigationController', () => {
  it('pushes routes with preserved search parameters', () => {
    window.history.replaceState({}, '', '/home?tab=overview');
    const controller = createNavigationController();

    const location = controller.push('work');

    expect(window.location.pathname).toBe('/work');
    expect(window.location.search).toBe('?tab=overview');
    expect(location.routeId).toBe('work');
  });

  it('pushes dynamic routes through centralized path parameters', () => {
    window.history.replaceState({}, '', '/home?from=home');
    const controller = createNavigationController();

    const location = controller.push('work.deliverables', { pathParams: { workId: 'work-001' } });

    expect(window.location.pathname).toBe('/work/work-001/deliverables');
    expect(window.location.search).toBe('?from=home');
    expect(location.routeName).toBe('work.deliverables');
    expect(location.pathParams.workId).toBe('work-001');
  });

  it('replaces routes with explicit search parameters', () => {
    window.history.replaceState({}, '', '/home?tab=overview');
    const controller = createNavigationController();

    controller.replace('decisions', { search: '?tab=package' });

    expect(window.location.pathname).toBe('/decisions');
    expect(window.location.search).toBe('?tab=package');
  });

  it('uses replaceState when replace is requested through navigate', () => {
    window.history.replaceState({}, '', '/home');
    const pushSpy = vi.spyOn(window.history, 'pushState');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    const controller = createNavigationController();

    controller.push('decision.package', {
      replace: true,
      pathParams: { decisionId: 'decision-001' },
    });

    expect(window.location.pathname).toBe('/decisions/decision-001/package');
    expect(replaceSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).not.toHaveBeenCalled();
    pushSpy.mockRestore();
    replaceSpy.mockRestore();
  });

  it('uses pushState for normal navigation', () => {
    window.history.replaceState({}, '', '/home');
    const pushSpy = vi.spyOn(window.history, 'pushState');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    const controller = createNavigationController();

    controller.push('work.detail', { pathParams: { workId: 'work-001' } });

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).not.toHaveBeenCalled();
    pushSpy.mockRestore();
    replaceSpy.mockRestore();
  });

  it('syncs from the current window location', () => {
    window.history.replaceState({}, '', '/deliverables?view=compact');
    const controller = createNavigationController();

    const location = controller.sync();

    expect(location.routeId).toBe('deliverables');
    expect(location.params.get('view')).toBe('compact');
  });

  it('replaces a truly unknown route with home while preserving its query', () => {
    window.history.replaceState({}, '', '/not-a-nova-route?from=unknown');
    const controller = createNavigationController();

    const location = controller.sync();

    expect(window.location.pathname).toBe('/home');
    expect(window.location.search).toBe('?from=unknown');
    expect(location.routeName).toBe('home');
  });

  it('emits navigation change events', () => {
    const controller = createNavigationController();
    const handler = vi.fn();
    window.addEventListener('nova:navigationchange', handler);

    controller.push('work');

    expect(handler).toHaveBeenCalled();
    window.removeEventListener('nova:navigationchange', handler);
  });

  it('categorizes browser synchronization as pop', () => {
    window.history.replaceState({}, '', '/work/work-001/activity');
    const controller = createNavigationController();
    const handler = vi.fn();
    window.addEventListener('nova:navigationchange', handler);

    controller.sync('pop');

    expect(handler).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ source: 'pop' }) }),
    );
    window.removeEventListener('nova:navigationchange', handler);
  });

  it('navigates through every Work Setup route', () => {
    window.history.replaceState({}, '', '/home');
    const controller = createNavigationController();

    expect(controller.push('clarify').pathname).toBe('/clarify');
    expect(controller.push('canvas').pathname).toBe('/canvas');
    expect(controller.push('plan').pathname).toBe('/plan');
    expect(controller.push('confirm').pathname).toBe('/confirm');
  });
});
