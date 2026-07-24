# WORK — SOURCES — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Work tabs | Sources | Work Sources | DOC+UX | T043 |
| Source | Add | ND | ND | T059 |
| Source stale | Refresh | ND | ND | T060 |
| SourceCard | Details | Source Drawer | DOC+UX | T061 |
| Sources | Autre tab | Sous-domaine choisi | DOC+UX | T039-T045 |

- Le Work actif est conservé lors d’un changement de tab. [D16]
- Les tabs n’ont pas de sous-routes démontrées. [A09]
- Les retours et états non contractualisés restent ND. [A30]

