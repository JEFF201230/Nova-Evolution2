# HOME — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Appelante | App/NavRail | Home est view initiale et destination Home | D16; T001-T002 |
| Appelante | Clarify | Back étape 1 | T025 |
| Appelante | WorkBreadcrumb | Lien Work documenté vers Home | T038; A29 |
| Appelée | Clarify | Création Work | T015 |
| Appelée | Work | Reprise/présentation | T016-T017 |
| Appelée | Decision Package | Urgence | T018 |
| Réutilisation | DecisionCard, ConfChip, WhyInline, Drawer | Patterns transverses | NOVA_REUSE_MATRIX §§1-8 |

## Réutilisation obligatoire

- Consulter NOVA_SHARED_COMPONENTS avant toute extraction.
- Consulter NOVA_REUSE_MATRIX avant toute nouvelle structure.
- Ne pas transformer une réutilisation de carte ou layout en navigation non prouvée.

