export type WorkSourceStatus = 'available' | 'stale' | 'missing';

export interface WorkSourceDetailFixture {
  summary: string;
  supports: string;
  keyEvidence: readonly { label: string; value: string }[];
  history: readonly { label: string; value: string }[];
}

export interface WorkSourceFixture {
  id: string;
  title: string;
  status: WorkSourceStatus;
  statusLabel: string;
  provenance: string;
  freshness: string;
  usage: string;
  conflict?: string;
  insight: string;
  primaryAction?: 'Add' | 'Refresh';
  detail?: WorkSourceDetailFixture;
}

export interface WorkSourcesFixture {
  workId: string;
  validating: boolean;
  coverage: number;
  summary: {
    available: number;
    outdated: number;
    missing: number;
    conflicts: number;
  };
  sources: readonly WorkSourceFixture[];
}

export const workSourcesFixtures: Record<string, WorkSourcesFixture> = {
  'work-001': {
    workId: 'work-001',
    validating: true,
    coverage: 75,
    summary: { available: 2, outdated: 1, missing: 1, conflicts: 1 },
    sources: [
      {
        id: 'crm-pipeline-export',
        title: 'CRM Pipeline Export — June 2025',
        status: 'missing',
        statusLabel: 'Missing',
        provenance: 'External',
        freshness: '—',
        usage: 'Unused',
        insight:
          'Absent. Revenue projection in Section 3 is provisional. Load this source to raise confidence from 76% to 92%.',
        primaryAction: 'Add',
        detail: {
          summary:
            'Absent. Revenue projection in Section 3 is provisional. Load this source to raise confidence from 76% to 92%.',
          supports: 'Approve Q3 budget increase',
          keyEvidence: [
            { label: 'Type', value: 'External' },
            { label: 'Quality score', value: '—' },
            { label: 'Reliability', value: '—' },
            { label: 'Evidence score', value: '—' },
            { label: 'Conflicts', value: 'None' },
          ],
          history: [
            { label: 'Last verified', value: '—' },
            { label: 'Freshness', value: '—' },
            { label: 'Usage', value: 'Unused' },
          ],
        },
      },
      {
        id: 'product-roadmap',
        title: 'Product Roadmap Board Deck',
        status: 'stale',
        statusLabel: 'Stale',
        provenance: 'Internal',
        freshness: '6 days',
        usage: '3 sections',
        conflict: '1 conflict',
        insight:
          '6 days old. 1 timeline conflict with Infrastructure Report. Refresh before final presentation.',
        primaryAction: 'Refresh',
      },
      {
        id: 'financial-model',
        title: 'Q3 Financial Model v4',
        status: 'available',
        statusLabel: 'Available',
        provenance: 'Internal',
        freshness: '2 days',
        usage: '8 sections',
        insight:
          'Cross-checked against 2 sources. No discrepancies in capex section. Revenue projection provisional pending CRM data.',
      },
      {
        id: 'capacity-report',
        title: 'Infrastructure Capacity Report — July 2025',
        status: 'available',
        statusLabel: 'Available',
        provenance: 'Official',
        freshness: '4 days',
        usage: '5 sections',
        insight:
          'Authoritative for infrastructure capacity claims. Validated against 2025 procurement contracts.',
      },
    ],
  },
};

export function getWorkSourcesFixture(workId: string) {
  return workSourcesFixtures[workId];
}
