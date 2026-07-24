import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createNavigationController, type NavigationController } from './NavigationController';
import { NAVIGATION_CHANGE_EVENT, type NavigationChangeDetail } from './navigationEvents';
import type { RouteLocation } from './routeResolver';

interface NavigationContextValue {
  controller: NavigationController;
  location: RouteLocation;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const controller = useMemo(() => createNavigationController(), []);
  const [location, setLocation] = useState<RouteLocation>(() => controller.sync());

  useEffect(() => {
    const onPopState = () => {
      const nextLocation = controller.sync('pop');
      setLocation(nextLocation);
    };

    const onNavigationChange = (event: Event) => {
      const customEvent = event as CustomEvent<NavigationChangeDetail>;
      setLocation(customEvent.detail.location);
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener(NAVIGATION_CHANGE_EVENT, onNavigationChange as EventListener);

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener(NAVIGATION_CHANGE_EVENT, onNavigationChange as EventListener);
    };
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      controller,
      location,
    }),
    [controller, location],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error('Navigation hooks must be used inside NavigationProvider.');
  }

  return context;
}

export function useNavigationController() {
  return useNavigationContext().controller;
}

export function useNavigationLocation() {
  return useNavigationContext().location;
}

export function useCurrentRouteId() {
  return useNavigationLocation().routeId;
}

export function useRouteParamsObject() {
  return useNavigationLocation().params;
}

export function useRoutePathParams() {
  return useNavigationLocation().pathParams;
}

export function useNavigationState() {
  const { controller, location } = useNavigationContext();

  return {
    location,
    currentRoute: location.routeId,
    navigate: controller.push,
    replace: controller.replace,
    hrefFor: controller.hrefFor,
  };
}
