# GLOBAL DECISIONS — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Appelante | NavRail | Decisions | T004 |
| Appelée | Decision Package | pending/waiting | T068 |
| Réutilisation | DecisionCard | Home/Work/Global | NOVA_REUSE_MATRIX |
| Donnée | DECISIONS | Liste et counts | D16; D17 |

- Consulter NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX avant toute implémentation.
- Aucune réutilisation ne crée une transition.

