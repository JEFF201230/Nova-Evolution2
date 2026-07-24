# GLOBAL DECISIONS — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| GlobalDecisionsView | Composite | filter | D04; D16 |
| DecisionCard/Card | Décision transverse | pending/waiting/decided | D03; D16 |
| Filter tabs/pills | Filtrage | selected/unselected | D01; D03 |
| DeadlineBadge | Échéance | semantic | D04; D09 |
| ConfChip | Confiance | closed/open | D04; D09 |
| NavRail | Navigation primaire | active Decisions | D03 |

- Aucun composant absent de D04/D09/D16 ou des patterns ARCHITECTURE n’est autorisé.
- Les variantes conflictuelles restent CONFLIT.

