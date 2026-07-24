# PLAN — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Canvas | Prepare a plan | Plan Setup | DOC | T031 |
| Plan | Back | Canvas | DOC | T033 |
| Plan | Review and start | Confirm | DOC | T034 |
| Phase | Toggle | État local | DOC | T032 |

## Règles

- Aucune destination n’est déduite d’un libellé ou d’une capture seule. [NOVA_NAVIGATION_MATRIX]
- Les retours non définis restent ND.
- Le contrat URL/state et l’historique navigateur restent soumis à A02/A03.

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A01 | V6.1/V7 | CONFLIT |
| A10 | Réutilisation Work Plan read-only/accordion | CONFLIT |
| A25 | Dimensions globales | CONFLIT |

