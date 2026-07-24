# WORK — OVERVIEW — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Données et état

| Donnée/état | Usage | Propriétaire | Source |
|---|---|---|---|
| WorkItem heroSentence/heroGain | Hero | active Work | D03 Data |
| nextAction* | Next Best Action | WorkItem | D03 Data |
| laterActions/backgroundActions | Disclosure | WorkItem | D03 Data |
| decisions | Pending cards | WorkItem | D03 Data |
| health scores | Sidebar et drawer | WorkItem/static | D10 |
| detailOpen | DR02 | WorkOverviewTab local | D16 |

- Aucun store/API/cache supplémentaire n’est supposé.
- activeWork appartient à App et tab à WorkView. [D16]
- La conservation exacte au retour reste ND. [A30]

