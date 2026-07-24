# GLOBAL DECISIONS — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Données et état

| Donnée/état | Usage | Propriétaire | Source |
|---|---|---|---|
| DECISIONS | Liste transverse | module scope | D16; D17 |
| filter | Filtre actif | GlobalDecisionsView local | D16 |
| activeDecision | Sélection avant Package | App global | D16 |
| counts/status | Tabs et cards | DecisionData agrégée | D01; D03 |

- Aucun store, API ou mécanisme de persistance n’est ajouté.
- Toute conservation non spécifiée reste ND.

