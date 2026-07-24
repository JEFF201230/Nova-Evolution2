export interface WorkDecisionFixture {
  decisionId: string;
  dueLabel: string;
  confidence: number;
  title: string;
  recommendation: string;
  approvedImpact: string;
  rejectedImpact: string;
}

export interface WorkDecisionsFixture {
  workId: string;
  decisions: readonly WorkDecisionFixture[];
}

export const workDecisionsFixtures: Record<string, WorkDecisionsFixture> = {
  'work-001': {
    workId: 'work-001',
    decisions: [
      {
        decisionId: 'decision-001',
        dueLabel: 'Due in 4 days',
        confidence: 82,
        title: 'Approve Q3 budget increase of €420k for cloud infrastructure',
        recommendation:
          'Approve €420k in full — the only path that preserves the 23 August launch date.',
        approvedImpact:
          'Infrastructure procurement starts 16 Jul. Full Q3 roadmap preserved. Board presentation on track.',
        rejectedImpact:
          'Q3 launch cancelled. Engineering reallocation required. Estimated €2.1M revenue impact.',
      },
    ],
  },
};

export function getWorkDecisionsFixture(workId: string) {
  return workDecisionsFixtures[workId];
}
