# CONFIRM — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Données et propriétaires

| Donnée/état | Usage | Propriétaire/nature | Source |
|---|---|---|---|
| AUTONOMY_LEVELS | Quatre niveaux | module scope | D16 |
| aut | Niveau sélectionné | ConfirmView local | D16 |
| activeWork | Work à ouvrir | App global | D16 Data Flow |
| Work summary | Titre, phase, confiance | donnée Work | D03 Confirm |

## Règles

- Les structures viennent de D03, D04, D16 et D17.
- Aucun store, API, cache ou persistance supplémentaire n’est supposé.
- Toute conservation d’état non contractualisée reste ND, notamment A30.

