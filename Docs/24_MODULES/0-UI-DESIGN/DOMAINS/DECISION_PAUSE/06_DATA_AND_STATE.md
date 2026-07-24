# DECISION PAUSE — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Données et état

| Donnée/état | Usage | Propriétaire | Source |
|---|---|---|---|
| activeDecision | Décision courante | App global | D16 |
| step | review ou decide | DecisionPauseView local | D16 |
| choice | Choix ou null | DecisionPauseView local | D16 |
| rationale | Texte requis | DecisionPauseView local | D16 |
| loading | Enregistrement ~700 ms documenté | DecisionPauseView local | D02; D16 |

- Aucun store, API ou mécanisme de persistance n’est ajouté.
- Toute conservation non spécifiée reste ND.

