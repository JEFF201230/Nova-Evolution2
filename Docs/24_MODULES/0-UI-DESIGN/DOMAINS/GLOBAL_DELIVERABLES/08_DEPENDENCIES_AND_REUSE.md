# GLOBAL DELIVERABLES — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Appelante | NavRail | Deliverables | T005 |
| Page appelée | Aucune démontrée | ND | A12 |
| Réutilisation | DeliverableCard | Work Deliverables | D03; NOVA_REUSE_MATRIX |
| Limite | DR05 | Ne pas connecter sans preuve | A12 |

- Consulter NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX avant toute implémentation.
- Aucune réutilisation ne crée une transition.

