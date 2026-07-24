import { NOVAUIPlayground } from './components/lab/NOVAUIPlayground';
import { ShellPlayground } from './components/shell/ShellPlayground';
import { NavigationProvider } from './routes/NavigationProvider';
import { NavigationShell } from './components/shell/NavigationShell';
import { WorkSetupProvider } from './features/work-setup';

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isLabPath = pathname === '/lab' || pathname.startsWith('/lab/');
  const isShellPath = pathname === '/shell' || pathname.startsWith('/shell/');

  if (isShellPath) {
    return <ShellPlayground />;
  }

  if (isLabPath) {
    return <NOVAUIPlayground />;
  }

  return (
    <NavigationProvider>
      <WorkSetupProvider>
        <NavigationShell />
      </WorkSetupProvider>
    </NavigationProvider>
  );
}
