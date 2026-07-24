# WORK — ACTIVITY — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Parent | WorkView | Shell/tab | D16 |
| Donnée | ActivityEvent[] | Filtrage local | D04; D17 |
| Réutilisation | FilterPill, event list, NOVA box | Patterns transverses | NOVA_REUSE_MATRIX |
| Aucune page appelée | Filtres locaux uniquement | DOC | D02 |

- Consulter NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX.
- Ne pas dupliquer le shell Work, les cards ou les drawers.

