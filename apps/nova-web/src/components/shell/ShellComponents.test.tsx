import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShellDivider } from './ShellDivider';
import { ShellFooter } from './ShellFooter';
import { ShellLogo } from './ShellLogo';
import { AppShell } from './AppShell';
import { ContentArea } from './ContentArea';
import { ContentViewport } from './ContentViewport';
import { NavigationItem } from './NavigationItem';
import { NavigationSection } from './NavigationSection';
import { SideNavigation } from './SideNavigation';
import { TopBar } from './TopBar';

describe('shell components', () => {
  it('renders the app shell structure', () => {
    render(
      <AppShell
        sidebar={
          <SideNavigation header={<ShellLogo />}>
            <NavigationSection heading="Navigation">
              <NavigationItem href="#home" active>
                Home
              </NavigationItem>
            </NavigationSection>
          </SideNavigation>
        }
        topBar={
          <TopBar
            logo={<ShellLogo />}
            heading="NOVA"
            description="Shell foundation"
          />
        }
        footer={<ShellFooter left="Left" center="Center" right="Right" />}
      >
        <ContentViewport>
          <ContentArea heading="Workspace" description="Application frame">
            <ShellDivider />
            <div>Body</div>
          </ContentArea>
        </ContentViewport>
      </AppShell>,
    );

    expect(screen.getByRole('navigation', { name: 'Application navigation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'NOVA' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
