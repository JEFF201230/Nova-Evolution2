# CLARIFY — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Données et propriétaires

| Donnée/état | Usage | Propriétaire/nature | Source |
|---|---|---|---|
| CLARIFY_QS | Questions et suggestions | module scope | D16 |
| step | Index de question | ClarifyView local | D16 |
| current | Réponse courante | ClarifyView local | D16 |
| answers | Réponses du flux | flux Work Setup | D02 |
| Nombre d’étapes | 3 dans flows; 4 dans données | CONFLIT | A06; D01,D02,D16 |

## Règles

- Les structures viennent de D03, D04, D16 et D17.
- Aucun store, API, cache ou persistance supplémentaire n’est supposé.
- Toute conservation d’état non contractualisée reste ND, notamment A30.

