# CLARIFY — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Appelante | Home | Composer submit | T015 |
| Appelante | Canvas | Back | T030 |
| Appelée | Home | Back étape 1 | T025 |
| Appelée | Canvas | Fin Clarify | T024 |
| Réutilisation | Btn, option pattern, textarea, progress | Setup/Decision | NOVA_REUSE_MATRIX |

## Réutilisation obligatoire

- Consulter NOVA_SHARED_COMPONENTS avant toute extraction.
- Consulter NOVA_REUSE_MATRIX avant toute nouvelle structure.
- Ne pas transformer une réutilisation de carte ou layout en navigation non prouvée.

