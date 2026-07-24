export interface WorkPersonEvidenceFixture {
  label: string;
  value: string;
  tone?: 'critical' | 'success' | 'warning';
}

export interface WorkPersonFixture {
  id: string;
  name: string;
  initials: string;
  kind: 'human' | 'nova';
  role: string;
  availability: string;
  active: boolean;
  responsibility: string;
  responsibilityTone?: 'critical';
  reasoning?: string;
  details: {
    summary: string;
    whyItMatters: string;
    reasoning?: string;
    evidence: readonly WorkPersonEvidenceFixture[];
    skills: readonly string[];
  };
}

export interface WorkPeopleFixture {
  workId: string;
  people: readonly WorkPersonFixture[];
}

export const workPeopleFixtures: Record<string, WorkPeopleFixture> = {
  'work-001': {
    workId: 'work-001',
    people: [
      {
        id: 'sarah-chen',
        name: 'Sarah Chen',
        initials: 'SC',
        kind: 'human',
        role: 'Finance Partner',
        availability: 'Available now',
        active: true,
        responsibility: 'Can unblock financial review — 2 pending requests awaiting her input',
        responsibilityTone: 'critical',
        details: {
          summary:
            'Can unblock financial review — 2 pending requests awaiting her input. 2 pending requests awaiting input. Response time: < 2 hours.',
          whyItMatters:
            'Sarah Chen has reviewed 7 documents and validated 4 sections. Their sign-off is required before CFO review can begin.',
          evidence: [
            { label: 'Availability', value: 'Available now' },
            { label: 'Workload', value: '72%', tone: 'warning' },
            { label: 'Response time', value: '< 2 hours' },
            { label: 'Docs reviewed', value: '7' },
            { label: 'Validations', value: '4' },
            { label: 'Trust score', value: '91%', tone: 'success' },
          ],
          skills: ['Financial modelling', 'Board presentations', 'Capex analysis'],
        },
      },
      {
        id: 'nova',
        name: 'NOVA',
        initials: '✣',
        kind: 'nova',
        role: 'AI collaborator',
        availability: 'Active',
        active: true,
        responsibility:
          'Cross-checking sources · waiting for CRM export to resolve contradiction in Section 3',
        reasoning:
          'Synthesizing revenue assumptions across 3 sources — waiting for CRM export to resolve contradiction in Section 3.',
        details: {
          summary:
            'Cross-checking sources · waiting for CRM export to resolve contradiction in Section 3. NOVA is working continuously on this project and cannot be reassigned.',
          whyItMatters:
            'NOVA is the primary source of cross-source validation. Its output determines which assumptions are safe to include in the final deliverable.',
          reasoning:
            'Synthesizing revenue assumptions across 3 sources — waiting for CRM export to resolve contradiction in Section 3.',
          evidence: [
            { label: 'Availability', value: 'Active' },
            { label: 'Workload', value: '100%', tone: 'critical' },
            { label: 'Response time', value: '< 1 min' },
            { label: 'Docs reviewed', value: '42' },
            { label: 'Validations', value: '18' },
            { label: 'Trust score', value: '94%', tone: 'success' },
          ],
          skills: ['Document analysis', 'Contradiction detection', 'Evidence synthesis'],
        },
      },
      {
        id: 'thomas-vidal',
        name: 'Thomas Vidal',
        initials: 'TV',
        kind: 'human',
        role: 'Head of Infrastructure',
        availability: 'Available from 14 Jul',
        active: false,
        responsibility: '1 pending request — technical cost validation not yet started',
        responsibilityTone: 'critical',
        details: {
          summary:
            '1 pending request — technical cost validation not yet started. 1 pending request awaiting input. Response time: < 24 hours.',
          whyItMatters:
            'Thomas Vidal has reviewed 3 documents and validated 1 sections. Their sign-off is required before CFO review can begin.',
          evidence: [
            { label: 'Availability', value: 'Available from 14 Jul' },
            { label: 'Workload', value: '45%', tone: 'success' },
            { label: 'Response time', value: '< 24 h' },
            { label: 'Docs reviewed', value: '3' },
            { label: 'Validations', value: '1' },
            { label: 'Trust score', value: '78%', tone: 'warning' },
          ],
          skills: ['Infrastructure architecture', 'Cloud costs', 'Vendor management'],
        },
      },
      {
        id: 'marie-dupont',
        name: 'Marie Dupont',
        initials: 'MD',
        kind: 'human',
        role: 'Legal Counsel',
        availability: 'Available',
        active: false,
        responsibility: 'Not yet assigned to any section',
        details: {
          summary: 'Not yet assigned to any section. Response time: Unknown.',
          whyItMatters:
            'Marie Dupont has reviewed 0 documents and validated 0 sections. Their sign-off is required before CFO review can begin.',
          evidence: [
            { label: 'Availability', value: 'Available' },
            { label: 'Workload', value: '30%', tone: 'success' },
            { label: 'Response time', value: 'Unknown' },
            { label: 'Docs reviewed', value: '0' },
            { label: 'Validations', value: '0' },
          ],
          skills: ['Contract law', 'EU compliance', 'NDAs'],
        },
      },
    ],
  },
};

export function getWorkPeopleFixture(workId: string) {
  return workPeopleFixtures[workId];
}
