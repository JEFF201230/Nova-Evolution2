# CANVAS — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Appelante | Clarify | Fin des questions | T024 |
| Appelante | Plan Setup | Back | T033 |
| Appelée | Clarify | Back | T030 |
| Appelée | Plan Setup | Prepare a plan | T031 |
| Réutilisation | Card, Btn, textarea, NOVALabel | Patterns partagés | NOVA_SHARED_COMPONENTS |

## Réutilisation obligatoire

- Consulter NOVA_SHARED_COMPONENTS avant toute extraction.
- Consulter NOVA_REUSE_MATRIX avant toute nouvelle structure.
- Ne pas transformer une réutilisation de carte ou layout en navigation non prouvée.

