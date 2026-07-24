# CONFIRM — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Plan Setup | Review and start | Confirm | DOC | T034 |
| Confirm | Back | Plan Setup | DOC | T036 |
| Confirm | Start work | Work Overview | DOC | T037 |
| Autonomy | Sélection A0-A3 | État local | DOC | T035 |

## Règles

- Aucune destination n’est déduite d’un libellé ou d’une capture seule. [NOVA_NAVIGATION_MATRIX]
- Les retours non définis restent ND.
- Le contrat URL/state et l’historique navigateur restent soumis à A02/A03.

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A01 | V6.1/V7 | CONFLIT |
| A25 | 560/580 et layout autonomie | CONFLIT |
| A24 | Navigation responsive précise | ND |

