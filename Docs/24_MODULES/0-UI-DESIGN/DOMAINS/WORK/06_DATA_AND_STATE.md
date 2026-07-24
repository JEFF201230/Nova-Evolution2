# WORK — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Données et propriétaires

| Donnée/état | Usage | Propriétaire/nature | Source |
|---|---|---|---|
| activeWork | Identifiant Work sélectionné | App global | D03; D16 |
| WorkItem | Titre, statut, health, phase, deadline, confidence et collections | module scope | D03 Data; D04 WorkItem |
| tab | Sous-domaine actif | WorkView local | D16 |
| activeDecision | Décision sélectionnée depuis Overview/Decisions | App global | D16 |
| Scroll/filter state | Conservation exacte au retour | ND | A30 |

## Règles

- Les structures viennent de D03, D04, D16 et D17.
- Aucun store, API, cache ou persistance supplémentaire n’est supposé.
- Toute conservation d’état non contractualisée reste ND, notamment A30.

