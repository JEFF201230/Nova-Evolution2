export type WorkActivityFilter = 'all' | 'human' | 'ai' | 'critical' | 'sources';

export interface WorkActivityDetailFixture {
  headline: string;
  tone: 'critical' | 'neutral' | 'success';
  description: string;
  sources: readonly string[];
}

export interface WorkActivityEventFixture {
  id: string;
  actor: string;
  initials: string;
  kind: 'human' | 'nova';
  timeLabel: string;
  summary: string;
  critical?: boolean;
  filters: readonly Exclude<WorkActivityFilter, 'all'>[];
  detail?: WorkActivityDetailFixture;
}

export interface WorkActivityFixture {
  workId: string;
  events: readonly WorkActivityEventFixture[];
}

export const workActivityFixtures: Record<string, WorkActivityFixture> = {
  'work-001': {
    workId: 'work-001',
    events: [
      {
        id: 'forecast-contradiction',
        actor: 'NOVA',
        initials: '✣',
        kind: 'nova',
        timeLabel: '20 min ago',
        summary: 'Revenue forecast differs from CRM pipeline by 23%',
        critical: true,
        filters: ['ai', 'critical'],
        detail: {
          headline: 'Revenue section confidence decreased from 82% to 76% (82% → 76%)',
          tone: 'critical',
          description:
            'Board presentation references June CRM data that has not been loaded — assumptions are inconsistent.',
          sources: ['Q3 Financial Model v4', 'CRM Pipeline Export'],
        },
      },
      {
        id: 'enterprise-deals',
        actor: 'Sarah Chen',
        initials: 'SC',
        kind: 'human',
        timeLabel: '2 hours ago',
        summary: 'Revenue projection needs to account for 3 pending enterprise deals',
        filters: ['human'],
      },
      {
        id: 'sources-consolidated',
        actor: 'NOVA',
        initials: '✣',
        kind: 'nova',
        timeLabel: '4 hours ago',
        summary: 'Overlapping infrastructure cost data consolidated into 1 authoritative source',
        filters: ['ai', 'sources'],
        detail: {
          headline: 'Source set consolidated — draft v1 ready for review. No change to confidence.',
          tone: 'neutral',
          description:
            'Infrastructure Capacity Report contained the same figures as the Financial Model — redundancy removed.',
          sources: ['Infrastructure Capacity Report', 'Q3 Financial Model v4'],
        },
      },
      {
        id: 'capacity-report-uploaded',
        actor: 'Thomas Vidal',
        initials: 'TV',
        kind: 'human',
        timeLabel: 'Yesterday',
        summary: 'Infrastructure Capacity Report July 2025 uploaded',
        filters: ['human', 'sources'],
      },
      {
        id: 'crm-source-absent',
        actor: 'NOVA',
        initials: '✣',
        kind: 'nova',
        timeLabel: 'Yesterday',
        summary: 'CRM Pipeline Export is absent from the source set',
        critical: true,
        filters: ['ai', 'critical', 'sources'],
        detail: {
          headline: 'Revenue section confidence decreased from 87% to 76% (87% → 76%)',
          tone: 'critical',
          description:
            'Revenue Section 3 references CRM data that has not been loaded. Without it, the projection is unverified.',
          sources: ['CRM Pipeline Export — June 2025'],
        },
      },
      {
        id: 'phase-ahead',
        actor: 'NOVA',
        initials: '✣',
        kind: 'nova',
        timeLabel: 'Yesterday',
        summary: 'Phase 3 started 1 day ahead of schedule',
        filters: ['ai'],
        detail: {
          headline: 'Estimated timeline reduced by 1 day. No confidence change.',
          tone: 'neutral',
          description: 'Phase 2 dependencies resolved — NOVA advanced the timeline.',
          sources: [],
        },
      },
      {
        id: 'audience-updated',
        actor: 'You',
        initials: 'SC',
        kind: 'human',
        timeLabel: '2 days ago',
        summary: 'Board members and executive team only',
        filters: ['human'],
      },
      {
        id: 'figures-cross-checked',
        actor: 'NOVA',
        initials: '✣',
        kind: 'nova',
        timeLabel: '2 days ago',
        summary: 'Financial figures cross-checked across 3 sources — no discrepancies',
        filters: ['ai'],
        detail: {
          headline: 'Capex section confidence increased from 74% to 96% (74% → 96%)',
          tone: 'success',
          description:
            'Capex figures were referenced in 3 different documents. NOVA verified all three agree.',
          sources: ['Q3 Financial Model v4', 'Infrastructure Capacity Report'],
        },
      },
    ],
  },
};

export function getWorkActivityFixture(workId: string) {
  return workActivityFixtures[workId];
}
