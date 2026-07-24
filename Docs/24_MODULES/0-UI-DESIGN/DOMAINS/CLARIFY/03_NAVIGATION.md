# CLARIFY — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Home Composer | Submit valide | Clarify étape 1 | DOC | T015 |
| Clarify étape 1/2 | Continue/Skip | Étape suivante | DOC | T022-T023 |
| Clarify dernière étape | Continue/Skip | Canvas | DOC | T024 |
| Clarify étape 1 | Back | Home | DOC | T025 |
| Clarify étape >1 | Back | Étape précédente | DOC | T026 |

## Règles

- Aucune destination n’est déduite d’un libellé ou d’une capture seule. [NOVA_NAVIGATION_MATRIX]
- Les retours non définis restent ND.
- Le contrat URL/state et l’historique navigateur restent soumis à A02/A03.

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A01 | Version V6.1/V7 | CONFLIT |
| A06 | 3 questions contre 4 | CONFLIT |
| A25 | Largeur 600/640 | CONFLIT |

