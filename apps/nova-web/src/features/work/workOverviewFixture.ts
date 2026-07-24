export interface WorkOverviewFixture {
  workId: string;
  title: string;
  confidence: number;
  phase: number;
  phaseCount: number;
  dueLabel: string;
  insight: {
    summary: string;
    recommendation: string;
  };
  nextAction: {
    title: string;
    durationLabel: string;
    impactLabel: string;
    confidenceFrom: number;
    confidenceTo: number;
    why: string;
  };
  laterActionCount: number;
  pendingDecision: {
    decisionId: string;
    dueLabel: string;
    confidence: number;
    title: string;
    consequence: string;
  };
  progress: {
    value: number;
    owner: string;
    deadline: string;
    phaseLabel: string;
    updatedLabel: string;
  };
  deliverables: readonly {
    id: string;
    title: string;
    confidence: number;
  }[];
  people: readonly {
    id: string;
    name: string;
    availability: string;
    initials: string;
    kind: 'person' | 'nova';
    active: boolean;
  }[];
  novaUpdate: string;
}

const sharedInsight = {
  summary: 'Your board presentation is blocked by 3 open comments and a missing CRM source.',
  recommendation:
    'Spend 15 minutes resolving the comments today and validation probability rises from 76% to 92%.',
};

export const workOverviewFixtures: Record<string, WorkOverviewFixture> = {
  'work-001': {
    workId: 'work-001',
    title: 'Prepare Q3 budget review presentation for the board',
    confidence: 76,
    phase: 3,
    phaseCount: 4,
    dueLabel: '18 Jul',
    insight: sharedInsight,
    nextAction: {
      title: "Review Sarah Chen's 3 comments in the revenue section",
      durationLabel: '~15 min',
      impactLabel: 'Unblocks CFO review',
      confidenceFrom: 76,
      confidenceTo: 92,
      why: 'Resolving the comments removes the final review blocker before the CFO validation.',
    },
    laterActionCount: 3,
    pendingDecision: {
      decisionId: 'decision-001',
      dueLabel: 'Due in 4 days',
      confidence: 82,
      title: 'Approve Q3 budget increase of €420k for cloud infrastructure',
      consequence: 'Without this decision by 15 July, the Q3 product launch is cancelled.',
    },
    progress: {
      value: 72,
      owner: 'Sarah Chen',
      deadline: '18 Jul',
      phaseLabel: '3/4',
      updatedLabel: '2 hours ago',
    },
    deliverables: [
      { id: 'board-presentation', title: 'Q3 Budget Review — Board Presentation', confidence: 76 },
      { id: 'investment-summary', title: 'Infrastructure Investment Summary', confidence: 41 },
    ],
    people: [
      {
        id: 'sarah-chen',
        name: 'Sarah Chen',
        availability: 'Available now',
        initials: 'SC',
        kind: 'person',
        active: true,
      },
      {
        id: 'nova',
        name: 'NOVA',
        availability: 'Active',
        initials: '✣',
        kind: 'nova',
        active: true,
      },
      {
        id: 'thomas-vidal',
        name: 'Thomas Vidal',
        availability: 'Available from 14 Jul',
        initials: 'TV',
        kind: 'person',
        active: false,
      },
    ],
    novaUpdate:
      'Synthesizing revenue assumptions across 3 sources — waiting for CRM export to resolve contradiction in Section 3.',
  },
  'work-002': {
    workId: 'work-002',
    title: 'Analyze reasons for customer churn increase in June',
    confidence: 41,
    phase: 2,
    phaseCount: 4,
    dueLabel: '22 Jul',
    insight: sharedInsight,
    nextAction: {
      title: 'Review NOVA synthesis draft',
      durationLabel: '~20 min',
      impactLabel: 'Unblocks analysis review',
      confidenceFrom: 41,
      confidenceTo: 68,
      why: 'Reviewing the synthesis confirms the evidence before the analysis is shared.',
    },
    laterActionCount: 3,
    pendingDecision: {
      decisionId: 'decision-002',
      dueLabel: 'Due in 7 days',
      confidence: 68,
      title: 'Approve the prioritized churn analysis scope',
      consequence: 'Without approval, the synthesis cannot move to final validation.',
    },
    progress: { value: 48, owner: 'Sarah Chen', deadline: '22 Jul', phaseLabel: '2/4', updatedLabel: 'Today' },
    deliverables: [
      { id: 'churn-analysis', title: 'June Churn Analysis', confidence: 41 },
      { id: 'evidence-summary', title: 'Customer Evidence Summary', confidence: 68 },
    ],
    people: [],
    novaUpdate: 'Synthesizing customer evidence and validating the principal churn segments.',
  },
  'work-003': {
    workId: 'work-003',
    title: 'Onboard new supply chain partner for EU operations',
    confidence: 22,
    phase: 1,
    phaseCount: 4,
    dueLabel: '31 Jul',
    insight: sharedInsight,
    nextAction: {
      title: 'Assign an owner to the overdue legal review',
      durationLabel: '~10 min',
      impactLabel: 'Unblocks legal review',
      confidenceFrom: 22,
      confidenceTo: 55,
      why: 'An accountable owner is required before the legal review can resume.',
    },
    laterActionCount: 3,
    pendingDecision: {
      decisionId: 'decision-003',
      dueLabel: 'Due in 10 days',
      confidence: 55,
      title: 'Approve the EU partner evidence package',
      consequence: 'Without approval, operational onboarding remains blocked.',
    },
    progress: { value: 31, owner: 'Thomas Vidal', deadline: '31 Jul', phaseLabel: '1/4', updatedLabel: 'Yesterday' },
    deliverables: [
      { id: 'evidence-package', title: 'Partner Evidence Package', confidence: 22 },
      { id: 'readiness-summary', title: 'Operational Readiness Summary', confidence: 55 },
    ],
    people: [],
    novaUpdate: 'Waiting for an owner to resume the legal evidence review.',
  },
};

export function getWorkOverviewFixture(workId: string) {
  return workOverviewFixtures[workId];
}
