# HOME — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Home Composer | Continue ou Cmd/Ctrl+Enter | Clarify étape 1 | DOC | T015; C014-C015 |
| Hero | Open presentation | Work w1 / Overview | DOC | T016; C016 |
| Active work row | Clic | Work sélectionné | DOC | T017; C019 |
| Decision card | Clic | Decision Package d1 | DOC | T018; C020 |
| Hero ou NOVA strip | Details | Home Situation Drawer | DOC | T020-T021; C018,C021 |
| Clarify étape 1 | Back | Home | DOC | T025; C022 |

## Règles

- Aucune destination n’est déduite d’un libellé ou d’une capture seule. [NOVA_NAVIGATION_MATRIX]
- Les retours non définis restent ND.
- Le contrat URL/state et l’historique navigateur restent soumis à A02/A03.

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A01 | Docs V6.1 contre captures V7 | CONFLIT |
| A04 | NavRail 56/220 | CONFLIT |
| A13 | Drawer Home sans capture imposée | DOC sans UX |
| A25 | Dimensions overlays divergentes | CONFLIT |

