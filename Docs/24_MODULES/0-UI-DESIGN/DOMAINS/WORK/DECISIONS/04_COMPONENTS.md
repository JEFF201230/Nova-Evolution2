# WORK — DECISIONS — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| WorkDecisionsTab | Composite | decisions | D16 |
| DecisionCard/Card | Brief décision | pending/waiting/decided data | D03; D16 |
| DeadlineBadge | Échéance | semantic | D04; D09 |
| ConfChip | Confiance | closed/open | D04; D09 |
| WhyInline | Justification | closed/open | D09 |
| Btn | Review & decide | navigation | D09; D11 |

- Aucun composant absent de D04/D09/D16 ou des patterns architecturaux n’est autorisé.
- Réutiliser WorkView, WorkHeader et WorkTabs depuis le domaine parent.

