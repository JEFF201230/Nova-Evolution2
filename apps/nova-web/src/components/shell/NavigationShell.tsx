import { AppShell } from './AppShell';
import { ContentArea } from './ContentArea';
import { ContentViewport } from './ContentViewport';
import { NavigationItem } from './NavigationItem';
import { NavigationSection } from './NavigationSection';
import { HomePage } from '../../features/home/HomePage';
import { RouteSurface } from '../routes/RouteSurface';
import { ShellLogo } from './ShellLogo';
import { SideNavigation } from './SideNavigation';
import { TopBar } from './TopBar';
import { useCurrentRoute } from '../../hooks/useCurrentRoute';
import { useNavigation } from '../../hooks/useNavigation';
import { routeRegistry } from '../../routes/RouteRegistry';
import { primaryRouteIds, workSetupRouteIds } from '../../routes/RouteDefinition';
import { useWorkSetup } from '../../features/work-setup';
import styles from './NavigationShell.module.css';

type NavigationIconName =
  | 'home'
  | 'work'
  | 'decisions'
  | 'deliverables'
  | 'search'
  | 'notifications'
  | 'help'
  | 'preferences';

function NavigationIcon({ name }: { name: NavigationIconName }) {
  let paths;

  switch (name) {
    case 'home':
      paths = (
        <>
          <path d="m2.5 7 4.5-4 4.5 4" />
          <path d="M3.8 6v5h6.4V6M6 11V8h2v3" />
        </>
      );
      break;
    case 'work':
      paths = (
        <>
          <rect x="2.25" y="4" width="9.5" height="7.25" rx="1" />
          <path d="M5 4V2.75h4V4M2.5 7h9" />
        </>
      );
      break;
    case 'decisions':
      paths = (
        <>
          <path d="M7 2v9.5M4 3.5h6M3.75 4 2 7h3.5L3.75 4ZM10.25 4 8.5 7H12l-1.75-3ZM4.5 11.5h5" />
        </>
      );
      break;
    case 'deliverables':
      paths = (
        <>
          <path d="M3 2.25h5l3 3v6.5H3z" />
          <path d="M8 2.25v3h3M5 8h4M5 10h3" />
        </>
      );
      break;
    case 'search':
      paths = (
        <>
          <circle cx="6" cy="6" r="3.5" />
          <path d="m8.7 8.7 2.8 2.8" />
        </>
      );
      break;
    case 'notifications':
      paths = (
        <>
          <path d="M3.25 9.5h7.5l-1-1.25V6a2.75 2.75 0 0 0-5.5 0v2.25L3.25 9.5Z" />
          <path d="M5.75 11a1.4 1.4 0 0 0 2.5 0" />
        </>
      );
      break;
    case 'help':
      paths = (
        <>
          <circle cx="7" cy="7" r="5" />
          <path d="M5.8 5.5A1.35 1.35 0 0 1 7.1 4.4c.85 0 1.55.55 1.55 1.35 0 1.15-1.65 1.25-1.65 2.4M7 10.25h.01" />
        </>
      );
      break;
    case 'preferences':
      paths = (
        <>
          <circle cx="7" cy="7" r="1.75" />
          <path d="M7 2v1.25M7 10.75V12M2 7h1.25M10.75 7H12M3.45 3.45l.9.9M9.65 9.65l.9.9M10.55 3.45l-.9.9M4.35 9.65l-.9.9" />
        </>
      );
      break;
  }

  return (
    <svg
      aria-hidden="true"
      className={styles.navigationIcon}
      data-navigation-icon={name}
      focusable="false"
      viewBox="0 0 14 14"
    >
      {paths}
    </svg>
  );
}

export function NavigationShell() {
  const currentRoute = useCurrentRoute();
  const { navigate, hrefFor } = useNavigation();
  const { setObjective } = useWorkSetup();
  const isHome = currentRoute === 'home';
  const isWorkSetup = workSetupRouteIds.some((routeId) => routeId === currentRoute);
  const isWorkRoute = currentRoute === 'work' || currentRoute.startsWith('work.');
  const activeNavigationRoute = isWorkSetup ? 'home' : currentRoute;

  return (
    <AppShell
      className={isWorkRoute ? styles.workShell : undefined}
      sidebar={
        <SideNavigation header={<ShellLogo />}>
          <NavigationSection>
            {primaryRouteIds.map((routeId) => {
              return (
                <NavigationItem
                  key={routeId}
                  active={activeNavigationRoute === routeId}
                  href={hrefFor(routeId)}
                  icon={<NavigationIcon name={routeId} />}
                  onClick={(event) => {
                    if (
                      event.metaKey ||
                      event.altKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.button !== 0
                    ) {
                      return;
                    }
                    event.preventDefault();
                    navigate(routeId);
                  }}
                >
                  {routeRegistry[routeId].heading}
                </NavigationItem>
              );
            })}
          </NavigationSection>
          <NavigationSection className={styles.utilityNavigation}>
            <NavigationItem href="#search" icon={<NavigationIcon name="search" />}>
              Search
            </NavigationItem>
            <NavigationItem href="#notifications" icon={<NavigationIcon name="notifications" />}>
              Notifications
            </NavigationItem>
            <NavigationItem href="#help" icon={<NavigationIcon name="help" />}>
              Help
            </NavigationItem>
            <NavigationItem href="#preferences" icon={<NavigationIcon name="preferences" />}>
              Preferences
            </NavigationItem>
          </NavigationSection>
          <div className={styles.profileRow} aria-label="User profile row">
            <div className={styles.profileAvatar} aria-hidden="true">
              SC
            </div>
            <div className={styles.profileCopy}>
              <div className={styles.profileName}>Sarah Chen</div>
              <div className={styles.profileRole}>Standard</div>
            </div>
          </div>
        </SideNavigation>
      }
      topBar={isHome || isWorkRoute ? undefined : <TopBar logo={<ShellLogo />} />}
    >
      <ContentViewport>
        <ContentArea>
          {isHome ? (
            <HomePage
              onStartWorkSetup={(objective) => {
                setObjective(objective);
                navigate('clarify');
              }}
            />
          ) : isWorkSetup ? (
            <RouteSurface routeId={currentRoute} enableWorkSetup />
          ) : (
            <RouteSurface routeId={currentRoute} />
          )}
        </ContentArea>
      </ContentViewport>
    </AppShell>
  );
}
