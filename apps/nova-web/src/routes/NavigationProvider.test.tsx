import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../components/shared/Button';
import { AppShell } from '../components/shell/AppShell';
import { ContentArea } from '../components/shell/ContentArea';
import { ContentViewport } from '../components/shell/ContentViewport';
import { NavigationItem } from '../components/shell/NavigationItem';
import { NavigationSection } from '../components/shell/NavigationSection';
import { ShellFooter } from '../components/shell/ShellFooter';
import { ShellLogo } from '../components/shell/ShellLogo';
import { SideNavigation } from '../components/shell/SideNavigation';
import { TopBar } from '../components/shell/TopBar';
import { NavigationProvider } from './NavigationProvider';
import { useCurrentRoute } from '../hooks/useCurrentRoute';
import { useNavigation } from '../hooks/useNavigation';
import { usePathParams, useRouteParams, useWorkTab } from '../hooks/useRouteParams';

function Probe() {
  const currentRoute = useCurrentRoute();
  const params = useRouteParams();
  const pathParams = usePathParams();
  const workTab = useWorkTab();
  const { navigate, replace, hrefFor } = useNavigation();

  return (
    <div>
      <p data-testid="current-route">{currentRoute}</p>
      <p data-testid="params">{params.toString()}</p>
      <p data-testid="path-params">{JSON.stringify(pathParams)}</p>
      <p data-testid="work-tab">{workTab ?? 'none'}</p>
      <a data-testid="href" href={hrefFor('work')}>
        href
      </a>
      <Button onClick={() => navigate('decisions')}>Go decisions</Button>
      <Button onClick={() => replace('deliverables', { search: '?view=receipt' })}>Replace deliverables</Button>
      <Button onClick={() => navigate('work.activity', { pathParams: { workId: 'work-001' } })}>
        Go work activity
      </Button>
    </div>
  );
}

describe('NavigationProvider', () => {
  it('exposes navigation state and hooks', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/home?tab=overview');

    render(
      <NavigationProvider>
        <Probe />
      </NavigationProvider>,
    );

    expect(screen.getByTestId('current-route')).toHaveTextContent('home');
    expect(screen.getByTestId('params')).toHaveTextContent('tab=overview');
    expect(screen.getByTestId('href')).toHaveAttribute('href', '/work?tab=overview');

    await user.click(screen.getByRole('button', { name: 'Go decisions' }));
    expect(window.location.pathname).toBe('/decisions');
    expect(screen.getByTestId('current-route')).toHaveTextContent('decisions');

    await user.click(screen.getByRole('button', { name: 'Replace deliverables' }));
    expect(window.location.pathname).toBe('/deliverables');
    expect(window.location.search).toBe('?view=receipt');
  });

  it('exposes dynamic path parameters and handles popstate as pop navigation', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/home?from=home');
    const navigationHandler = vi.fn();
    window.addEventListener('nova:navigationchange', navigationHandler);

    render(
      <NavigationProvider>
        <Probe />
      </NavigationProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Go work activity' }));
    expect(screen.getByTestId('current-route')).toHaveTextContent('work');
    expect(screen.getByTestId('path-params')).toHaveTextContent('work-001');
    expect(screen.getByTestId('work-tab')).toHaveTextContent('activity');
    expect(screen.getByTestId('params')).toHaveTextContent('from=home');

    window.history.replaceState({}, '', '/decisions/decision-001/receipt?from=history');
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(screen.getByTestId('current-route')).toHaveTextContent('decisions');
    expect(screen.getByTestId('path-params')).toHaveTextContent('decision-001');
    expect(screen.getByTestId('params')).toHaveTextContent('from=history');
    expect(navigationHandler).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: expect.objectContaining({ source: 'pop' }) }),
    );
    window.removeEventListener('nova:navigationchange', navigationHandler);
  });

  it('cleans up listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <NavigationProvider>
        <div>child</div>
      </NavigationProvider>,
    );

    unmount();

    expect(addSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
