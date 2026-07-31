export const homeFixture = {
  header: {
    greeting: 'Good afternoon, Sarah.',
    summary: '1 decision due in 4 days · 2 active work items',
  },
  composer: {
    title: 'What would you like to achieve?',
    description:
      'Describe your objective. NOVA builds the work, coordinates contributors, validates evidence and prepares the final deliverables.',
    suggestions: [
      'Prepare a board presentation on Q3 results',
      'Analyse reasons for the drop in NPS',
      'Draft a proposal for a new supplier partnership',
    ],
  },
  priorityInsight: {
    workId: 'work-001',
    label: 'NOVA',
    status: 'Situation · now',
    summary: 'Your board presentation is blocked by 3 open comments and a missing CRM source.',
    gain:
      'Spend 15 minutes resolving the comments today and validation probability rises from 76% to 92%.',
    why:
      'Clearing the comments and restoring the missing source reduces the blocker before the board review.',
    details:
      'The best next step is to close the comments, attach the missing CRM source and keep the presentation in a ready state.',
    actionLabel: 'Open presentation',
    detailsLabel: 'Details',
    whyLabel: 'Why?',
  },
  pendingDecision: {
    decisionId: 'decision-001',
    dueLabel: 'Due in 4 days',
    confidenceLabel: '82% confidence',
    statement: 'Approve Q3 budget increase of €420k for cloud infrastructure',
    consequence:
      'Without this decision by 15 July, the Q3 product launch is cancelled.',
    actionLabel: 'Open decision',
  },
  background: {
    summary: 'Working in background · You save approximately 6 hours of review this week · 1 conflict detected',
    items: [
      {
        title: 'CRM source reconciliation',
        meta: '1 missing source remains under review',
      },
      {
        title: 'Open comment review',
        meta: '3 comments tracked on the presentation deck',
      },
    ],
    detailsLabel: 'Details',
  },
  loading: {
    title: 'Loading Home',
    description: 'NOVA is preparing the situational overview.',
  },
  empty: {
    title: 'No active work yet',
    description: 'Home is waiting for the first objective to be loaded.',
  },
  error: {
    title: 'Home temporarily unavailable',
    description: 'The overview could not be rendered right now.',
  },
  blocked: {
    title: 'Home blocked',
    description: 'A required source or decision is still missing.',
  },
} as const;
