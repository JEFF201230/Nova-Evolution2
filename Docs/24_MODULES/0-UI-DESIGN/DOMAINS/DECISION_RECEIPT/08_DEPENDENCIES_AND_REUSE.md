# DECISION RECEIPT — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Appelante | Decision Pause | Record | T083 |
| Appelée | Work | Return to work | T084 |
| Réutilisation | Consequence/action/card patterns | Decision flow | NOVA_REUSE_MATRIX |
| Aucune capture | Validation UX directe absente | ND | U01-U23 |

- Consulter NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX avant toute implémentation.
- Aucune réutilisation ne crée une transition.

