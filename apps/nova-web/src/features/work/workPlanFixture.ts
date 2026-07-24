export type WorkPlanPhaseState = 'complete' | 'active' | 'upcoming';

export interface WorkPlanTaskFixture {
  id: string;
  label: string;
  complete: boolean;
}

export interface WorkPlanPhaseFixture {
  id: string;
  title: string;
  category: string;
  probability: number;
  remaining: string;
  state: WorkPlanPhaseState;
  warning?: string;
  tasks: readonly WorkPlanTaskFixture[];
}

export interface WorkPlanFixture {
  workId: string;
  phases: readonly WorkPlanPhaseFixture[];
}

export const workPlanFixtures: Record<string, WorkPlanFixture> = {
  'work-001': {
    workId: 'work-001',
    phases: [
      {
        id: 'research',
        title: 'All data assembled and contradiction-free',
        category: 'Research and sources',
        probability: 98,
        remaining: '0 h',
        state: 'complete',
        tasks: [
          { id: 'financial-model', label: 'Lead Q3 financial model', complete: true },
          { id: 'infrastructure-report', label: 'Infrastructure report reviewed', complete: true },
          { id: 'crm-export', label: 'CRM export requested', complete: true },
        ],
      },
      {
        id: 'analysis',
        title: '3 options ranked with risk and financial impact',
        category: 'Analysis and synthesis',
        probability: 94,
        remaining: '0 h',
        state: 'complete',
        tasks: [
          { id: 'performance', label: 'Q3 performance synthesized', complete: true },
          { id: 'investment-case', label: 'Investment case developed', complete: true },
          { id: 'financial-review', label: 'Sarah Chen financial review', complete: true },
        ],
      },
      {
        id: 'draft',
        title: 'Board-ready draft approved by all reviewers',
        category: 'Draft and review',
        probability: 81,
        remaining: '~6 h',
        state: 'active',
        warning: '3 comments unresolved · CRM source missing',
        tasks: [
          { id: 'slide-draft', label: 'Slide draft v1 generated', complete: true },
          { id: 'comments', label: 'Resolve 3 open comments', complete: false },
          { id: 'cfo-review', label: 'CFO pre-review', complete: false },
        ],
      },
      {
        id: 'delivery',
        title: 'Approved presentation delivered to board',
        category: 'Finalize and deliver',
        probability: 74,
        remaining: '~4 h',
        state: 'upcoming',
        warning: 'CFO approval not yet secured',
        tasks: [
          { id: 'final-approval', label: 'Final approval', complete: false },
          { id: 'board-delivery', label: 'Board delivery', complete: false },
        ],
      },
    ],
  },
};

export function getWorkPlanFixture(workId: string) {
  return workPlanFixtures[workId];
}
