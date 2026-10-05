import { useState, type ReactNode } from 'react';
import type { WorkPeopleAvailable, WorkPeopleParticipant } from '../../../../../contracts/work-people.contract';
import { Drawer, DrawerKeyValueRow, DrawerKeyValueTable, DrawerSection, DrawerSectionTitle } from '../../components/drawer/Drawer';
import { Button } from '../../components/shared/Button';
import { Skeleton } from '../../components/shared/Skeleton';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Surface } from '../../components/surfaces/Surface';
import { WorkPageHeader } from './WorkPageHeader';
import overviewStyles from './WorkOverviewPage.module.css';
import styles from './WorkPeoplePage.module.css';

export type WorkPeopleState = 'ready' | 'loading' | 'empty' | 'absent' | 'unavailable' | 'not-found' | 'error';

export interface WorkPeoplePageProps {
  workId?: string;
  people?: WorkPeopleAvailable;
  state?: WorkPeopleState;
}

function StateFrame({ children, workId }: { children: ReactNode; workId?: string }) {
  if (!workId) return <PageContainer className={overviewStyles.pageState}>{children}</PageContainer>;
  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="people" work={{ workId, title: workId }} />
      <div className={overviewStyles.pageState}>{children}</div>
    </PageContainer>
  );
}

function ParticipantCard({ participant, onOpen }: { participant: WorkPeopleParticipant; onOpen: () => void }) {
  return (
    <Surface aria-label={`Business person ${participant.businessPersonId}`} className={styles.personCard} padding="none" role="article">
      <span aria-hidden="true" className={styles.avatar}>P</span>
      <div className={styles.personContent}>
        <div className={styles.personNameRow}><h2>{participant.businessPersonId}</h2></div>
        <p className={styles.personMeta}>Business person</p>
        <p className={styles.responsibility}>Assignment {participant.workAssignmentId}</p>
      </div>
      <Button className={styles.detailsButton} size="sm" variant="secondary" onClick={onOpen}>Details</Button>
    </Surface>
  );
}

export function WorkPeoplePage({ workId, people, state = 'ready' }: WorkPeoplePageProps) {
  const [selectedId, setSelectedId] = useState<string>();
  const selected = people?.participants.find((item) => item.workAssignmentId === selectedId);

  if (state === 'loading') {
    return (
      <StateFrame workId={workId}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}><Spinner label="Loading Work People" /><span>Loading Work People</span></div>
          <Skeleton height="var(--n-space-96)" />
          <Skeleton height="var(--n-space-96)" />
        </div>
      </StateFrame>
    );
  }
  if (state === 'unavailable') return <StateFrame workId={workId}><EmptyState heading="People unavailable" description="The People producer is currently unavailable." /></StateFrame>;
  if (state === 'not-found') return <StateFrame workId={workId}><EmptyState heading="Work not found" description="The requested Work does not exist." /></StateFrame>;
  if (state === 'error') return <StateFrame workId={workId}><EmptyState heading="People unavailable" description="The Work People could not be displayed." /></StateFrame>;
  if (state === 'absent') return <StateFrame workId={workId}><EmptyState heading="People data absent" description="No People aggregate exists for this Work." /></StateFrame>;
  if (state === 'empty' || !people) return <StateFrame workId={workId}><EmptyState heading="No active participants" description="People has no active participant for this Work at the qualified time." /></StateFrame>;

  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="people" work={{ workId: people.workIdentity.workId, title: people.workIdentity.workId }} />
      <main aria-label="Work people" className={styles.peoplePage}>
        <div className={styles.peopleHeading}><h2>People</h2></div>
        <div className={styles.peopleList}>
          {people.participants.map((participant) => (
            <ParticipantCard key={participant.workAssignmentId} participant={participant} onOpen={() => setSelectedId(participant.workAssignmentId)} />
          ))}
        </div>
      </main>
      <Drawer ariaDescription={selected ? `Assignment ${selected.workAssignmentId}` : undefined} open={Boolean(selected)} title={selected?.businessPersonId ?? ''} onClose={() => setSelectedId(undefined)}>
        {selected ? (
          <DrawerSection>
            <DrawerSectionTitle>Authoritative identifiers</DrawerSectionTitle>
            <DrawerKeyValueTable>
              <DrawerKeyValueRow label="Business person" value={selected.businessPersonId} />
              <DrawerKeyValueRow label="Work assignment" value={selected.workAssignmentId} />
              <DrawerKeyValueRow label="Source domain" value={people.qualification.sourceDomain} />
              <DrawerKeyValueRow label="Qualified at" value={people.qualification.qualifiedAt} />
            </DrawerKeyValueTable>
          </DrawerSection>
        ) : null}
      </Drawer>
    </PageContainer>
  );
}
