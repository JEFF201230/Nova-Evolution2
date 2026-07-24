# DECISION RECEIPT — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Données et état

| Donnée/état | Usage | Propriétaire | Source |
|---|---|---|---|
| activeDecision enrichie | Choix et rationale | App/module decision | D03; D16 |
| receipt reference/outcome/authority/timestamp | Receipt card | Decision result | D01 |
| resulting actions | Actions/assignees/dates | Receipt data | D01 |
| activeWork | Destination Return | App global | D16 |

- Aucun store, API ou mécanisme de persistance n’est ajouté.
- Toute conservation non spécifiée reste ND.

