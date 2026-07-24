# PLAN — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Appelante | Canvas | Prepare a plan | T031 |
| Appelante | Confirm | Back | T036 |
| Appelée | Canvas | Back | T033 |
| Appelée | Confirm | Review and start | T034 |
| Réutilisation | PhaseRow partagé avec Work Plan | interactivité Work en CONFLIT | A10; NOVA_REUSE_MATRIX |

## Réutilisation obligatoire

- Consulter NOVA_SHARED_COMPONENTS avant toute extraction.
- Consulter NOVA_REUSE_MATRIX avant toute nouvelle structure.
- Ne pas transformer une réutilisation de carte ou layout en navigation non prouvée.

