# DECISION PAUSE — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Appelante | Decision Package | Review and decide | T077 |
| Appelée | Decision Package | Cancel/Back | T078 |
| Appelée | Decision Receipt | Record | T083 |
| Réutilisation | Consequence/review patterns | Package/Receipt | NOVA_REUSE_MATRIX |

- Consulter NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX avant toute implémentation.
- Aucune réutilisation ne crée une transition.

