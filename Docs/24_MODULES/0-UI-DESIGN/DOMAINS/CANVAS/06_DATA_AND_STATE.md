# CANVAS — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Données et propriétaires

| Donnée/état | Usage | Propriétaire/nature | Source |
|---|---|---|---|
| CANVAS_ITEMS | Six cartes de synthèse | module scope | D16 |
| editing | Index de carte ou null | CanvasView local | D16 |
| Contenu carte | Valeur affichée/modifiée | état local documentaire | D02; D11 |
| Réponses Clarify | Entrée logique de synthèse | flux | D02 |

## Règles

- Les structures viennent de D03, D04, D16 et D17.
- Aucun store, API, cache ou persistance supplémentaire n’est supposé.
- Toute conservation d’état non contractualisée reste ND, notamment A30.

