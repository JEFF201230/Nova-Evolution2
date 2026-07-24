# CANVAS — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Clarify | Fin du flow | Canvas | DOC | T024 |
| Canvas | Back | Clarify | DOC | T030 |
| Canvas | Prepare a plan | Plan Setup | DOC | T031 |
| Canvas card | Edit/Save | État local | DOC | T028-T029 |

## Règles

- Aucune destination n’est déduite d’un libellé ou d’une capture seule. [NOVA_NAVIGATION_MATRIX]
- Les retours non définis restent ND.
- Le contrat URL/state et l’historique navigateur restent soumis à A02/A03.

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A01 | Version d’autorité | CONFLIT |
| A24 | Responsive navigation précise | ND |
| A25 | Valeurs dimensionnelles divergentes globales | CONFLIT |

