# WORK — OVERVIEW — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Parent | WorkView | Shell/tab | D16 |
| Appelée | Decision Package | Decision card | T052 |
| Appelée | DR02 | Full analysis | T053 |
| Réutilisation | DecisionCard, WhyInline, health bars | Work/Global/Drawer | NOVA_REUSE_MATRIX |

- Consulter NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX.
- Ne pas dupliquer le shell Work, les cards ou les drawers.

