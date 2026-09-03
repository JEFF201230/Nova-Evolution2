import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GlobalDeliverableEvidence } from '../../../../../contracts/global-deliverables.contract';
import { DeliverablesSurface } from '../../components/routes/DeliverablesSurface';
import { globalDecisionsFixture } from '../../components/routes/globalRouteFixtures';

const EVIDENCE: GlobalDeliverableEvidence = {
  projectId: 'PROJECT-A',
  missionId: 'MISSION-1',
  reportId: 'REPORT-1',
  path: 'Docs/runtime-proof.md',
  size: 42,
  sha256: 'a'.repeat(64),
  modifiedAt: '2026-07-30T12:00:00.000Z',
  runId: 'run-001',
};

describe('Global Deliverables Runtime surface', () => {
  it('renders loading explicitly', () => {
    render(<DeliverablesSurface loader={() => new Promise(() => undefined)} />);
    expect(screen.getByRole('status', { name: 'Loading deliverable evidence' })).toBeInTheDocument();
  });

  it('renders empty explicitly', async () => {
    render(<DeliverablesSurface loader={async () => []} />);
    expect(await screen.findByText('No deliverable evidence is available.')).toBeInTheDocument();
  });

  it('renders errors explicitly', async () => {
    render(<DeliverablesSurface loader={async () => { throw new Error('unavailable'); }} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Runtime deliverable evidence is unavailable.');
  });

  it('renders only factual Runtime evidence and no functional Create, View, or Download CTA', async () => {
    render(<DeliverablesSurface loader={async () => [EVIDENCE]} />);
    const list = screen.getByRole('region', { name: 'Deliverables' });
    await waitFor(() => expect(within(list).getAllByRole('article')).toHaveLength(1));
    expect(within(list).getByRole('heading', { name: EVIDENCE.path })).toBeInTheDocument();
    expect(within(list).getByText(/Project PROJECT-A · Mission MISSION-1 · Report REPORT-1/)).toBeInTheDocument();
    expect(within(list).getByText(EVIDENCE.sha256)).toBeInTheDocument();
    expect(within(list).getByText(EVIDENCE.modifiedAt)).toBeInTheDocument();
    expect(within(list).getByText(EVIDENCE.runId)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create|view|download/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/confidence|publication score|published|draft|in review/i)).not.toBeInTheDocument();
  });

  it('preserves the out-of-scope Global Decisions fixtures', () => {
    expect(globalDecisionsFixture).toHaveLength(3);
    expect(globalDecisionsFixture.map((decision) => decision.decisionId)).toEqual([
      'decision-001', 'decision-002', 'decision-003',
    ]);
  });
});
