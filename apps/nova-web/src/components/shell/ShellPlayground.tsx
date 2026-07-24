import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Card } from '../surfaces/Card';
import { PageContainer } from '../surfaces/PageContainer';
import { AppShell } from './AppShell';
import { ContentArea } from './ContentArea';
import { ContentViewport } from './ContentViewport';
import { NavigationItem } from './NavigationItem';
import { NavigationSection } from './NavigationSection';
import { ShellDivider } from './ShellDivider';
import { ShellFooter } from './ShellFooter';
import { ShellLogo } from './ShellLogo';
import { SideNavigation } from './SideNavigation';
import { TopBar } from './TopBar';
import styles from './ShellPlayground.module.css';

export function ShellPlayground() {
  return (
    <AppShell
      sidebar={
        <SideNavigation header={<ShellLogo />}>
          <NavigationSection heading="Primary" description="Structural navigation only.">
            <NavigationItem href="#home" active>
              Home
            </NavigationItem>
            <NavigationItem href="#work">Work</NavigationItem>
            <NavigationItem href="#decisions">Decisions</NavigationItem>
            <NavigationItem href="#deliverables">Deliverables</NavigationItem>
          </NavigationSection>
          <NavigationSection heading="Utilities" description="Shell-only utilities.">
            <NavigationItem href="#playground">Shell playground</NavigationItem>
            <NavigationItem href="#settings">Settings</NavigationItem>
          </NavigationSection>
        </SideNavigation>
      }
      topBar={
        <TopBar
          logo={<ShellLogo />}
          heading="NOVA Application Shell"
          description="Permanent frame for future NOVA screens."
          actions={<Badge tone="nova">Shell foundation</Badge>}
        />
      }
      footer={<ShellFooter left="Program-036" center="Shell foundation" right="React 18 / TS / CSS Modules" />}
    >
      <ContentViewport>
        <ContentArea
          heading="Shell Playground"
          description="Validation surface for AppShell, TopBar, SideNavigation, and content primitives."
        >
          <PageContainer narrow>
            <div className={styles.grid}>
              <Card heading="AppShell" description="Main layout wrapper." footer={<Badge tone="action">Ready</Badge>}>
                <p className={styles.copy}>The shell maintains structure without business logic.</p>
              </Card>
              <Card
                heading="TopBar"
                description="Persistent header surface."
                footer={<Button variant="secondary">Shell action</Button>}
              >
                <p className={styles.copy}>Top-level context, actions, and brand are composed here.</p>
              </Card>
              <Card heading="SideNavigation" description="Primary application navigation structure.">
                <p className={styles.copy}>Navigation sections and items stay composable and accessible.</p>
              </Card>
              <Card heading="ContentViewport" description="Viewport and width control.">
                <ShellDivider />
                <p className={styles.copy}>Content width, spacing, and scroll containment stay predictable.</p>
              </Card>
            </div>
          </PageContainer>
        </ContentArea>
      </ContentViewport>
    </AppShell>
  );
}
