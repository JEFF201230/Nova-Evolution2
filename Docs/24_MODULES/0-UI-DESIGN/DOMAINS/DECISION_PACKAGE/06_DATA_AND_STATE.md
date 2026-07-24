# DECISION PACKAGE — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Données et état

| Donnée/état | Usage | Propriétaire | Source |
|---|---|---|---|
| activeDecision | Décision courante | App global | D16 |
| DecisionData | Statement, recommendation, options, evidence, impacts | module scope | D03; D04 |
| sel | Option locale | DecisionPackageView | D16 |
| detailOpen | DR06 | DecisionPackageView | D16 |
| option preselection | Non requise pour Review | DOC | D02 Flow 12 |

- Aucun store, API ou mécanisme de persistance n’est ajouté.
- Toute conservation non spécifiée reste ND.

