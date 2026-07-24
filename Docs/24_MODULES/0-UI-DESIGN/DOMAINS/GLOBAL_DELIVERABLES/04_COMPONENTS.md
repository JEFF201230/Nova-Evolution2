# GLOBAL DELIVERABLES — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| GlobalDeliverablesView | Composite | filter selon inventaire; props absentes D16 | D04; D16 |
| DeliverableCard | Résumé transverse | readiness/blocker | D03 |
| Filter tabs | Filtrage | selected/unselected | D01 |
| ConfChip | Confiance | closed/open | D03; D16 |
| NavRail | Navigation primaire | active Deliverables | D03 |

- Aucun composant absent de D04/D09/D16 ou des patterns ARCHITECTURE n’est autorisé.
- Les variantes conflictuelles restent CONFLIT.

