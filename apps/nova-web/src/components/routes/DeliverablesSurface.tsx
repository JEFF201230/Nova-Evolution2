import type { GlobalDeliverablesLoader } from '../../features/global-deliverables/globalDeliverables.service';
import { useGlobalDeliverables } from '../../features/global-deliverables/useGlobalDeliverables';
import { FileIcon } from './GlobalRouteComponents';
import styles from './GlobalRoutes.module.css';

export function DeliverablesSurface({ loader }: { loader?: GlobalDeliverablesLoader }) {
  const { deliverables, state } = useGlobalDeliverables(loader);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Deliverables</h1>
          <p className={styles.subtitle}>Read-only Runtime evidence from mission reports.</p>
        </div>
      </header>

      <section aria-label="Deliverables" className={styles.deliverableList}>
        {state === 'loading' ? (
          <div aria-label="Loading deliverable evidence" className={styles.emptyState} role="status">
            Loading deliverable evidence…
          </div>
        ) : state === 'error' ? (
          <div className={styles.emptyState} role="alert">
            Runtime deliverable evidence is unavailable.
          </div>
        ) : deliverables.length === 0 ? (
          <div className={styles.emptyState}>No deliverable evidence is available.</div>
        ) : (
          deliverables.map((deliverable, index) => (
            <article
              className={styles.deliverableRow}
              key={`${deliverable.projectId}/${deliverable.missionId}/${deliverable.reportId}/${index}`}
            >
              <FileIcon />
              <div>
                <h2 className={styles.deliverableTitle}>{deliverable.path}</h2>
                <p className={styles.deliverableMetadata}>
                  Project {deliverable.projectId} · Mission {deliverable.missionId} · Report {deliverable.reportId}
                </p>
                <dl className={styles.evidenceDetails}>
                  <div><dt>Size</dt><dd>{deliverable.size} bytes</dd></div>
                  <div><dt>SHA-256</dt><dd>{deliverable.sha256}</dd></div>
                  <div><dt>Modified</dt><dd>{deliverable.modifiedAt}</dd></div>
                  <div><dt>Run</dt><dd>{deliverable.runId}</dd></div>
                </dl>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
