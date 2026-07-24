import { useNavigationLocation } from '../routes/NavigationProvider';

export function useRouteParams() {
  return useNavigationLocation().params;
}

export function usePathParams() {
  return useNavigationLocation().pathParams;
}

export function useWorkTab() {
  return useNavigationLocation().workTab;
}
