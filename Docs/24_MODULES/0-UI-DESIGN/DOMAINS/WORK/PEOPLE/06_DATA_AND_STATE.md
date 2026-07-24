# WORK — PEOPLE — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Données et état

| Donnée/état | Usage | Propriétaire | Source |
|---|---|---|---|
| people | PersonData[] | WorkItem | D03; D04 |
| drawer | PersonData ou null | WorkPeopleTab local | D16 |
| novaState | Current reasoning conditionnel | PersonData | D10; D18 |
| availability/workload/response/trust | Drawer rows | PersonData | D10 |
| activeWork/tab | Contexte | App/WorkView | D16 |

- Aucun store/API/cache supplémentaire n’est supposé.
- activeWork appartient à App et tab à WorkView. [D16]
- La conservation exacte au retour reste ND. [A30]

