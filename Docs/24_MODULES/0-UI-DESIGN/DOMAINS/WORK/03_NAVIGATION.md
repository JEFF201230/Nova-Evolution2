# WORK — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Home | Open presentation/active row | Work Overview | DOC | T016-T017 |
| Confirm | Start work | Work Overview | DOC | T037 |
| NavRail | Work | Work actif | DOC | T003 |
| Search | Work result | Work sélectionné | DOC | T089 |
| Receipt | Return to work | Work | DOC | T084 |
| Work | Onglet | Sous-domaine sélectionné | DOC+UX | T039-T045 |
| Breadcrumb Work | Clic | Home | DOC+UX | T038; A29 |

## Règles

- Aucune destination n’est déduite d’un libellé ou d’une capture seule. [NOVA_NAVIGATION_MATRIX]
- Les retours non définis restent ND.
- Le contrat URL/state et l’historique navigateur restent soumis à A02/A03.

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A08 | Work sans activeWork | ND |
| A09 | Sous-routes des tabs | ND |
| A10 | Work Plan | CONFLIT |
| A16 | Pause/More | ND |
| A29 | Breadcrumb Work vers Home | DOC |
| A30 | État conservé au retour | ND |

