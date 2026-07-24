# WORK — PEOPLE — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Parent | WorkView | Shell/tab | D16 |
| Appelée | DR03 | Person Detail | D10 |
| Réutilisation | PersonCard humain/NOVA | Variantes de données | NOVA_REUSE_MATRIX |
| Réutilisation | Drawer shell/rows/tags | Six drawers | NOVA_DRAWER_ARCHITECTURE |

- Consulter NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX.
- Ne pas dupliquer le shell Work, les cards ou les drawers.

