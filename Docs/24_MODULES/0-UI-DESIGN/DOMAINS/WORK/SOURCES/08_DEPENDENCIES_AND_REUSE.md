# WORK — SOURCES — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Parent | WorkView | Shell/tab | D16 |
| Appelée | DR04 | Source Detail | D10 |
| Réutilisation | SourceCard/status/counter | Sources domain | NOVA_REUSE_MATRIX |
| Réutilisation | Drawer shell/rows | Six drawers | NOVA_DRAWER_ARCHITECTURE |

- Consulter NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX.
- Ne pas dupliquer le shell Work, les cards ou les drawers.

