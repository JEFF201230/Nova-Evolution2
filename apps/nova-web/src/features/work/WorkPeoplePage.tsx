import { useState } from 'react';
import {
  Drawer,
  DrawerKeyValueRow,
  DrawerKeyValueTable,
  DrawerParagraph,
  DrawerSection,
  DrawerSectionTitle,
} from '../../components/drawer/Drawer';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Skeleton } from '../../components/shared/Skeleton';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/surfaces/EmptyState';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Surface } from '../../components/surfaces/Surface';
import type { WorkOverviewFixture } from './workOverviewFixture';
import type { WorkPeopleFixture, WorkPersonFixture } from './workPeopleFixture';
import { WorkPageHeader } from './WorkPageHeader';
import overviewStyles from './WorkOverviewPage.module.css';
import styles from './WorkPeoplePage.module.css';

export type WorkPeopleState = 'ready' | 'loading' | 'empty' | 'error';

export interface WorkPeoplePageProps {
  work?: WorkOverviewFixture;
  people?: WorkPeopleFixture;
  state?: WorkPeopleState;
}

function PersonCard({ person, onOpen }: { person: WorkPersonFixture; onOpen: () => void }) {
  return (
    <Surface
      aria-label={person.name}
      className={[styles.personCard, person.kind === 'nova' && styles.novaCard].filter(Boolean).join(' ')}
      padding="none"
      role="article"
    >
      <span
        aria-hidden="true"
        className={[styles.avatar, person.kind === 'nova' && styles.novaAvatar].filter(Boolean).join(' ')}
      >
        {person.initials}
      </span>
      <div className={styles.personContent}>
        <div className={styles.personNameRow}>
          <h2>{person.name}</h2>
          {person.kind === 'nova' ? <Badge size="sm" tone="nova">✣ NOVA</Badge> : null}
          <span
            aria-label={person.active ? 'Active' : 'Inactive'}
            className={[styles.statusDot, person.active && styles.statusDotActive].filter(Boolean).join(' ')}
          />
        </div>
        <p className={styles.personMeta}>{person.role} · {person.availability}</p>
        <p
          className={[
            styles.responsibility,
            person.responsibilityTone === 'critical' && styles.responsibilityCritical,
          ].filter(Boolean).join(' ')}
        >
          {person.responsibility}
        </p>
        {person.reasoning ? (
          <div className={styles.reasoning}>
            <strong>● CURRENT REASONING</strong>
            <p>{person.reasoning}</p>
          </div>
        ) : null}
      </div>
      <Button className={styles.detailsButton} size="sm" variant="secondary" onClick={onOpen}>
        Details
      </Button>
    </Surface>
  );
}

function PersonDrawer({ person, onClose }: { person?: WorkPersonFixture; onClose: () => void }) {
  return (
    <Drawer
      ariaDescription={person ? `${person.name} work details` : undefined}
      open={Boolean(person)}
      title={person?.name ?? ''}
      onClose={onClose}
    >
      {person ? (
        <>
          <DrawerSection>
            <DrawerSectionTitle>Summary</DrawerSectionTitle>
            <DrawerParagraph tone="primary">{person.details.summary}</DrawerParagraph>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>Why it matters</DrawerSectionTitle>
            <DrawerParagraph>{person.details.whyItMatters}</DrawerParagraph>
          </DrawerSection>
          {person.details.reasoning ? (
            <DrawerSection>
              <DrawerSectionTitle>Current reasoning</DrawerSectionTitle>
              <DrawerParagraph className={styles.drawerReasoning} tone="primary">
                {person.details.reasoning}
              </DrawerParagraph>
            </DrawerSection>
          ) : null}
          <DrawerSection>
            <DrawerSectionTitle>Key evidence</DrawerSectionTitle>
            <DrawerKeyValueTable>
              {person.details.evidence.map((item) => (
                <DrawerKeyValueRow
                  key={item.label}
                  label={item.label}
                  value={
                    <span className={item.tone ? styles[item.tone] : undefined}>
                      {item.value}
                    </span>
                  }
                />
              ))}
            </DrawerKeyValueTable>
          </DrawerSection>
          <DrawerSection>
            <DrawerSectionTitle>Technical details</DrawerSectionTitle>
            <div className={styles.skillList}>
              {person.details.skills.map((skill) => <Badge key={skill} tone="neutral">{skill}</Badge>)}
            </div>
          </DrawerSection>
        </>
      ) : null}
    </Drawer>
  );
}

export function WorkPeoplePage({ work, people, state = 'ready' }: WorkPeoplePageProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>();

  if (state === 'loading') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <div aria-busy="true" className={styles.loading}>
          <div className={styles.loadingStatus}>
            <Spinner label="Loading Work People" />
            <span>Loading Work People</span>
          </div>
          <Skeleton height="var(--n-space-96)" />
          <Skeleton height="var(--n-space-120)" />
          <Skeleton height="var(--n-space-96)" />
        </div>
      </PageContainer>
    );
  }

  if (state === 'error') {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState heading="People unavailable" description="The Work People could not be displayed." />
      </PageContainer>
    );
  }

  if (state === 'empty' || !work || !people) {
    return (
      <PageContainer className={overviewStyles.pageState}>
        <EmptyState heading="No people available" description="Select a Work with assigned people." />
      </PageContainer>
    );
  }

  const selectedPerson = people.people.find((person) => person.id === selectedPersonId);

  return (
    <PageContainer className={overviewStyles.page}>
      <WorkPageHeader activeTab="people" showConfidenceLabel work={work} />
      <main aria-label="Work people" className={styles.peoplePage}>
        <div className={styles.peopleHeading}>
          <h2>People &amp; experts</h2>
          <Button size="sm" variant="secondary">＋ Invite</Button>
        </div>
        <div className={styles.peopleList}>
          {people.people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onOpen={() => setSelectedPersonId(person.id)}
            />
          ))}
        </div>
      </main>
      <PersonDrawer person={selectedPerson} onClose={() => setSelectedPersonId(undefined)} />
    </PageContainer>
  );
}
