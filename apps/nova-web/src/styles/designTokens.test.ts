import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const tokensCss = readFileSync(resolve(currentDir, 'designTokens.css'), 'utf8');

function extractCustomProperties(source: string) {
  return [...source.matchAll(/--n-[a-z0-9-]+(?=\s*:)/gi)].map((match) => match[0]);
}

describe('designTokens', () => {
  it('declares each token once', () => {
    const names = extractCustomProperties(tokensCss);
    const uniqueNames = new Set(names);

    expect(names.length).toBe(uniqueNames.size);
  });

  it('contains the core token categories', () => {
    const requiredGroups = [
      '--n-color-canvas',
      '--n-font-family-ui',
      '--n-space-4',
      '--n-radius-12',
      '--n-border-width-1',
      '--n-shadow-card',
      '--n-opacity-disabled',
      '--n-blur-drawer',
      '--n-z-search',
      '--n-duration-fast',
      '--n-viewport-min-desktop-width',
    ];

    for (const token of requiredGroups) {
      expect(tokensCss).toContain(token);
    }
  });

  it('uses only documented source values for representative tokens', () => {
    expect(tokensCss).toContain('--n-color-canvas: #f8fafc;');
    expect(tokensCss).toContain("--n-font-family-ui: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;");
    expect(tokensCss).toContain('--n-space-4: 4px;');
    expect(tokensCss).toContain('--n-radius-12: 12px;');
    expect(tokensCss).toContain('--n-shadow-card: 0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);');
    expect(tokensCss).toContain('--n-duration-fast: 120ms;');
    expect(tokensCss).toContain('--n-viewport-min-desktop-width: 960px;');
    expect(tokensCss).not.toContain('--n-breakpoint-');
  });
});
