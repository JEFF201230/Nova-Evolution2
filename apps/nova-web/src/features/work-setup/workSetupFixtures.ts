import type {
  WorkSetupAutonomyLevel,
  WorkSetupCanvasItem,
  WorkSetupClarifyStep,
  WorkSetupPlanPhase,
} from './workSetupTypes';

export const workSetupClarifySteps: readonly WorkSetupClarifyStep[] = [
  {
    id: 'audience-deadline',
    question: 'Who needs to act and by when?',
    suggestions: ['Board / 18 Jul', 'CFO only', 'Full executive team'],
  },
  {
    id: 'success',
    question: 'What would success look like?',
    suggestions: ['Decision approved', 'Recommendation ready', 'Validated deliverable'],
  },
  {
    id: 'constraints',
    question: 'What constraints should NOVA respect?',
    suggestions: ['Use approved sources only', 'Keep the current scope', 'Escalate blockers'],
  },
] as const;

export const initialWorkSetupCanvasItems: readonly WorkSetupCanvasItem[] = [
  { id: 'objective', title: 'Objective', value: 'Objective captured from Home' },
  { id: 'outcome', title: 'Expected outcome', value: 'To be refined from Clarify answers' },
  { id: 'constraints', title: 'Constraints', value: 'Approved scope and sources only' },
] as const;

export const workSetupPlanPhases: readonly WorkSetupPlanPhase[] = [
  { id: 'understand', title: 'Understand', description: 'Confirm the objective and available context.' },
  { id: 'prepare', title: 'Prepare', description: 'Organize the work, sources, and contributors.' },
  { id: 'execute', title: 'Execute', description: 'Produce the requested work and evidence.' },
  { id: 'validate', title: 'Validate', description: 'Review evidence and prepare delivery.' },
] as const;

export const workSetupAutonomyLevels: readonly WorkSetupAutonomyLevel[] = [
  { level: 0, label: 'A0 — Assist', description: 'NOVA prepares proposals for review.' },
  { level: 1, label: 'A1 — Guided execution', description: 'NOVA executes with validation gates.' },
  { level: 2, label: 'A2 — Delegated execution', description: 'NOVA executes within the approved scope.' },
] as const;
