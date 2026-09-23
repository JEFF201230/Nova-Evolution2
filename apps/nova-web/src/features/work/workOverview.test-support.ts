import type { WorkOverviewReadModel } from '../../../../../contracts/work-overview.contract';
import { workOverviewFixtures } from './workOverviewFixture';

export function workOverviewTestResponse(workId: string): { overview: WorkOverviewReadModel } | null {
  const work = workOverviewFixtures[workId];
  if (!work) return null;
  return { overview: {
    projectId: 'NOVA', workId: work.workId, title: work.title, confidence: work.confidence,
    phase: { current: work.phase, total: work.phaseCount }, dueAt: '2026-10-01T00:00:00.000Z',
    insight: work.insight, nextAction: work.nextAction, deferredActionCount: work.laterActionCount,
    pendingDecision: {
      decisionId: work.pendingDecision.decisionId,
      dueAt: '2026-09-30T00:00:00.000Z',
      confidence: work.pendingDecision.confidence,
      title: work.pendingDecision.title,
      consequence: work.pendingDecision.consequence,
    },
    progress: { percentage: work.progress.value, owner: { id: 'owner-1', label: work.progress.owner }, updatedAt: '2026-09-21T00:00:00.000Z' },
    deliverables: work.deliverables,
    people: work.people.map((person) => ({ id: person.id, name: person.name, availability: person.availability, kind: person.kind === 'nova' ? 'NOVA' as const : 'HUMAN' as const, status: person.active ? 'AVAILABLE' as const : 'AWAY' as const })),
    novaUpdate: { message: work.novaUpdate, updatedAt: '2026-09-21T00:00:00.000Z' },
  } };
}
