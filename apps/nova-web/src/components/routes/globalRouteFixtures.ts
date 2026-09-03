import { workDecisionsFixtures } from '../../features/work/workDecisionsFixture';

export type GlobalDecisionStatus = 'pending' | 'waiting' | 'decided';

export interface GlobalDecisionFixture {
  decisionId: string;
  status: GlobalDecisionStatus;
  heroSentence?: string;
  dueLabel?: string;
  confidence?: number;
  statement: string;
  outcome?: string;
}

const referenceDecision = workDecisionsFixtures['work-001'].decisions[0];

export const globalDecisionsFixture: readonly GlobalDecisionFixture[] = [
  {
    decisionId: referenceDecision.decisionId,
    status: 'pending',
    heroSentence: 'Without this decision by 15 July, the Q3 product launch is cancelled.',
    dueLabel: referenceDecision.dueLabel,
    confidence: referenceDecision.confidence,
    statement: referenceDecision.title,
  },
  {
    decisionId: 'decision-002',
    status: 'waiting',
    heroSentence: 'Three vendors evaluated. Waiting for procurement committee to convene.',
    dueLabel: 'Due in 11 days',
    statement: 'Select primary data analytics vendor for 2025–2027 contract',
  },
  {
    decisionId: 'decision-003',
    status: 'decided',
    confidence: 91,
    statement: 'Extend remote work policy to all EU entities',
    outcome: 'Approved with conditions',
  },
];
