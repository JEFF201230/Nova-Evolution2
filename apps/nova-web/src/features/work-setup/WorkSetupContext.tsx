import { createContext, useContext } from 'react';
import type { WorkSetupContextValue } from './workSetupTypes';

export const WorkSetupContext = createContext<WorkSetupContextValue | null>(null);

export function useWorkSetup() {
  const context = useContext(WorkSetupContext);

  if (!context) {
    throw new Error('useWorkSetup must be used inside WorkSetupProvider.');
  }

  return context;
}
