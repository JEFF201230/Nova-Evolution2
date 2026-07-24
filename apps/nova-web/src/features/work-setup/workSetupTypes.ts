export interface WorkSetupCanvasItem {
  id: string;
  title: string;
  value: string;
}

export interface WorkSetupState {
  objective: string;
  clarifyAnswers: string[];
  canvasItems: WorkSetupCanvasItem[];
  selectedAutonomyLevel: number;
}

export interface WorkSetupContextValue extends WorkSetupState {
  setObjective: (objective: string) => void;
  setClarifyAnswer: (index: number, answer: string) => void;
  setCanvasItem: (item: WorkSetupCanvasItem) => void;
  setAutonomyLevel: (level: number) => void;
  resetWorkSetup: () => void;
}

export interface WorkSetupClarifyStep {
  id: string;
  question: string;
  suggestions: readonly string[];
}

export interface WorkSetupPlanPhase {
  id: string;
  title: string;
  description: string;
}

export interface WorkSetupAutonomyLevel {
  level: number;
  label: string;
  description: string;
}
