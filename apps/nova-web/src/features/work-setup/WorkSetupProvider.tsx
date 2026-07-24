import { useMemo, useState, type ReactNode } from 'react';
import { WorkSetupContext } from './WorkSetupContext';
import { initialWorkSetupCanvasItems } from './workSetupFixtures';
import type { WorkSetupCanvasItem, WorkSetupState } from './workSetupTypes';

function createInitialState(): WorkSetupState {
  return {
    objective: '',
    clarifyAnswers: [],
    canvasItems: initialWorkSetupCanvasItems.map((item) => ({ ...item })),
    selectedAutonomyLevel: 1,
  };
}

export interface WorkSetupProviderProps {
  children: ReactNode;
}

export function WorkSetupProvider({ children }: WorkSetupProviderProps) {
  const [state, setState] = useState<WorkSetupState>(createInitialState);

  const value = useMemo(
    () => ({
      ...state,
      setObjective(objective: string) {
        setState((current) => ({ ...current, objective }));
      },
      setClarifyAnswer(index: number, answer: string) {
        setState((current) => {
          const clarifyAnswers = [...current.clarifyAnswers];
          clarifyAnswers[index] = answer;
          return { ...current, clarifyAnswers };
        });
      },
      setCanvasItem(item: WorkSetupCanvasItem) {
        setState((current) => {
          const existingIndex = current.canvasItems.findIndex((candidate) => candidate.id === item.id);
          const canvasItems = [...current.canvasItems];

          if (existingIndex === -1) {
            canvasItems.push(item);
          } else {
            canvasItems[existingIndex] = item;
          }

          return { ...current, canvasItems };
        });
      },
      setAutonomyLevel(selectedAutonomyLevel: number) {
        setState((current) => ({ ...current, selectedAutonomyLevel }));
      },
      resetWorkSetup() {
        setState(createInitialState());
      },
    }),
    [state],
  );

  return <WorkSetupContext.Provider value={value}>{children}</WorkSetupContext.Provider>;
}
