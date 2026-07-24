# WORK — DELIVERABLES — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Données et état

| Donnée/état | Usage | Propriétaire | Source |
|---|---|---|---|
| deliverables | DeliverableData[] | WorkItem | D03; D04 |
| drawer | DeliverableData ou null | WorkDeliverablesTab local | D16 |
| readiness/publication scores | Card/drawer | DeliverableData | D10 |
| missingInfo/comments/reviews | Blockers/evidence | DeliverableData | D10 |
| version history/technical fields | Drawer | DeliverableData | D10 |

- Aucun store/API/cache supplémentaire n’est supposé.
- activeWork appartient à App et tab à WorkView. [D16]
- La conservation exacte au retour reste ND. [A30]

