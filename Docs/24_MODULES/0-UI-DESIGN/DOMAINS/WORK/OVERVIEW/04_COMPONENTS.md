# WORK — OVERVIEW — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| WorkOverviewTab | Composite du tab | detailOpen | D16 |
| Card | Hero, NBA, décisions, progress | statique/cliquable | D04; D09 |
| WhyInline | Justification NBA | closed/open | D09 |
| DeadlineBadge/ConfChip | Décision et confiance | semantic/open | D04; D09 |
| Drawer/DrawerSection/DrawerRow | Full Analysis | closed/open | D10 |
| Health bar pattern | Métriques sidebar/drawer | scores | D08; D10 |

- Aucun composant absent de D04/D09/D16 ou des patterns architecturaux n’est autorisé.
- Réutiliser WorkView, WorkHeader et WorkTabs depuis le domaine parent.

