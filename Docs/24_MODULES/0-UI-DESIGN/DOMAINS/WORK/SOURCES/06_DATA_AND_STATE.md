# WORK — SOURCES — Data and State

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Données et état

| Donnée/état | Usage | Propriétaire | Source |
|---|---|---|---|
| sources | SourceData[] | WorkItem | D03; D04 |
| drawer | SourceData ou null | WorkSourcesTab local | D16 |
| quality/reliability/evidence/conflicts | Drawer evidence | SourceData | D10 |
| freshness/lastVerified/uses | History | SourceData | D10 |
| decisionsImpacted/referencedBy | Why it matters | SourceData | D10 |

- Aucun store/API/cache supplémentaire n’est supposé.
- activeWork appartient à App et tab à WorkView. [D16]
- La conservation exacte au retour reste ND. [A30]

