# HOME — Interactions and Events

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Inventaire

| Interaction/événement | Effet | Précondition | Source |
|---|---|---|---|
| Composer click | Développe le composer | aucune | T012; C011 |
| Suggestion | Préremplit l’objectif | aucune | T013; C012 |
| Cancel | Replie le composer | composer ouvert | T014; C013 |
| Continue | Ouvre Clarify | objectif non vide | T015; C014 |
| Why | Disclosure inline | aucune | T019; C017 |
| Details | Ouvre DR01 | aucune | T020-T021 |

## Gouvernance événementielle

- Les CTA renvoient à NOVA_CTA_MATRIX; les transitions à NOVA_NAVIGATION_MATRIX.
- Une action placeholder demeure ND.
- Une capture valide l’état visible, jamais seule la destination.

