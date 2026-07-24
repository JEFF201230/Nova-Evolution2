import { useNavigationLocation } from '../routes/NavigationProvider';

export function useCurrentRoute() {
  return useNavigationLocation().routeId;
}
