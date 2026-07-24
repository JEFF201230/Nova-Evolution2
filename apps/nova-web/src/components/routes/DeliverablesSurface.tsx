import { useMemo, useState } from 'react';
import { Button } from '../shared/Button';
import {
  ConfidenceChip,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  FilterTabs,
  type FilterOption,
} from './GlobalRouteComponents';
import {
  globalDeliverablesFixture,
  type GlobalDeliverableStatus,
} from './globalRouteFixtures';
import styles from './GlobalRoutes.module.css';

type DeliverableFilter = 'all' | GlobalDeliverableStatus;

const deliverableFilters: readonly FilterOption<DeliverableFilter>[] = [
  { id: 'all', label: 'All', count: globalDeliverablesFixture.length },
  {
    id: 'draft',
    label: 'Drafts',
    count: globalDeliverablesFixture.filter((deliverable) => deliverable.status === 'draft').length,
  },
  {
    id: 'review',
    label: 'In review',
    count: globalDeliverablesFixture.filter((deliverable) => deliverable.status === 'review').length,
  },
  {
    id: 'published',
    label: 'Published',
    count: globalDeliverablesFixture.filter((deliverable) => deliverable.status === 'published').length,
  },
];

export function DeliverablesSurface() {
  const [filter, setFilter] = useState<DeliverableFilter>('all');
  const deliverables = useMemo(
    () =>
      globalDeliverablesFixture.filter(
        (deliverable) => filter === 'all' || deliverable.status === filter,
      ),
    [filter],
  );

  return (
    <main className={styles.page}>
      <header className={styles.headerWithAction}>
        <div>
          <h1 className={styles.title}>Deliverables</h1>
        </div>
        <Button aria-label="Create deliverable" size="sm">Create</Button>
      </header>

      <FilterTabs
        label="Deliverable filters"
        onChange={setFilter}
        options={deliverableFilters}
        value={filter}
      />

      <section aria-label="Deliverables" className={styles.deliverableList}>
        {deliverables.length === 0 ? (
          <div className={styles.emptyState}>No deliverables in this view.</div>
        ) : (
          deliverables.map((deliverable) => (
            <article className={styles.deliverableRow} key={deliverable.deliverableId}>
              <FileIcon />
              <div>
                <h2 className={styles.deliverableTitle}>{deliverable.title}</h2>
                <p className={styles.deliverableMetadata}>{deliverable.metadata}</p>
              </div>
              <ConfidenceChip confidence={deliverable.confidence} />
              <div className={styles.rowActions}>
                <button
                  aria-label={`View ${deliverable.title}`}
                  className={styles.iconButton}
                  type="button"
                >
                  <EyeIcon />
                </button>
                {deliverable.status === 'published' ? (
                  <button
                    aria-label={`Download ${deliverable.title}`}
                    className={styles.iconButton}
                    type="button"
                  >
                    <DownloadIcon />
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
