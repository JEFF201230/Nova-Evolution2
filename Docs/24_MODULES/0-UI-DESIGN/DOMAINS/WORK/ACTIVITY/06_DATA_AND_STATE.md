# WORK — ACTIVITY — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Données et état

| Donnée/état | Usage | Propriétaire | Source |
|---|---|---|---|
| events | Timeline | WorkItem ActivityEvent[] | D03; D04 |
| filter | all/human/ai/critical/sources | WorkActivityTab local | D16 |
| comment | Texte saisi | WorkActivityTab local | D16 |
| activeWork/tab | Contexte | App/WorkView | D16 |

- Aucun store/API/cache supplémentaire n’est supposé.
- activeWork appartient à App et tab à WorkView. [D16]
- La conservation exacte au retour reste ND. [A30]

