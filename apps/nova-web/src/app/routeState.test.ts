import { describe, expect, it } from 'vitest';
import { nextRoute, parseRoute, routeToPath } from './routeState';

describe('routeState', () => {
  it('parses known paths', () => {
    expect(parseRoute('/home')).toBe('home');
    expect(parseRoute('/work')).toBe('work');
    expect(parseRoute('/decisions')).toBe('decisions');
    expect(parseRoute('/deliverables')).toBe('deliverables');
    expect(parseRoute('/clarify')).toBe('clarify');
    expect(parseRoute('/canvas')).toBe('canvas');
    expect(parseRoute('/plan')).toBe('plan');
    expect(parseRoute('/confirm')).toBe('confirm');
  });

  it('falls back to home', () => {
    expect(parseRoute('/unknown')).toBe('home');
  });

  it('serializes routes', () => {
    expect(routeToPath('home')).toBe('/home');
    expect(routeToPath('work')).toBe('/work');
    expect(routeToPath('clarify')).toBe('/clarify');
    expect(routeToPath('canvas')).toBe('/canvas');
    expect(routeToPath('plan')).toBe('/plan');
    expect(routeToPath('confirm')).toBe('/confirm');
  });

  it('cycles routes', () => {
    expect(nextRoute('home')).toBe('work');
  });
});
