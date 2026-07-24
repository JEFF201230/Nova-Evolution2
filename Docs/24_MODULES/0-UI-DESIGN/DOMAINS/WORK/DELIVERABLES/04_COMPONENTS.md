# WORK — DELIVERABLES — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| WorkDeliverablesTab | Composite | drawer DeliverableData/null | D16 |
| DeliverableCard | Readiness | score/blocker | D03; U23 |
| ConfChip | Confiance | closed/open | D04; D09 |
| ProgressBar | Publication readiness | score semantic | D08 |
| Btn/IconButton | Create/Eye/Details | Create/Eye ND | D20 |
| Drawer/Section/Row | Deliverable Detail | open/closed | D10 |

- Aucun composant absent de D04/D09/D16 ou des patterns architecturaux n’est autorisé.
- Réutiliser WorkView, WorkHeader et WorkTabs depuis le domaine parent.

