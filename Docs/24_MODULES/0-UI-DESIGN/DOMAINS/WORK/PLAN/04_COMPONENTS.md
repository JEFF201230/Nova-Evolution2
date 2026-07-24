# WORK — PLAN — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| WorkPlanTab | Composite | exp index/null dans D16 | D16 |
| PhaseRow/PhaseList | Phases | complete/active/future | D03; D16 |
| WorkHeader/WorkTabs | Shell persistant | tab Plan actif | D03; U05 |
| Status indicators | État phase | semantic | D06 |

- Aucun composant absent de D04/D09/D16 ou des patterns architecturaux n’est autorisé.
- Réutiliser WorkView, WorkHeader et WorkTabs depuis le domaine parent.

