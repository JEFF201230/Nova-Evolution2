# HOME — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Données et propriétaires

| Donnée/état | Usage | Propriétaire/nature | Source |
|---|---|---|---|
| WORK_ITEMS | Hero, active work, later/background actions | module scope | D16 Static Data; D17 |
| DECISIONS | Decision card | module scope | D16; D17 |
| composerOpen | Ouverture du composer | HomeView local | D16 State Ownership |
| val/objective | Objectif saisi | HomeView local | D16 |
| loading | Soumission composer | HomeView local | D16 |
| detailOpen | Home Drawer | HomeView local | D10; D16 |
| activeWork/activeDecision | Entités sélectionnées avant navigation | App global | D03; D16 |

## Règles

- Les structures viennent de D03, D04, D16 et D17.
- Aucun store, API, cache ou persistance supplémentaire n’est supposé.
- Toute conservation d’état non contractualisée reste ND, notamment A30.

