# WORK — SOURCES — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| WorkSourcesTab | Composite | drawer SourceData/null | D16 |
| SourceCard | Résumé source | available/stale/missing/conflict | D03; U17 |
| StatusBadge | Statut source | semantic | D06 |
| Counter strip | Agrégats | dynamic | D03; D18 |
| Btn | Add/Refresh/Details | effects Add/Refresh ND | D09; D20 |
| Drawer/Section/Row | Source Detail | open/closed | D10 |

- Aucun composant absent de D04/D09/D16 ou des patterns architecturaux n’est autorisé.
- Réutiliser WorkView, WorkHeader et WorkTabs depuis le domaine parent.

