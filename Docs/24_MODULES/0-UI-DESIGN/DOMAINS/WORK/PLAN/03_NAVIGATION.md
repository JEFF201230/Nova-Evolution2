# WORK — PLAN — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Work tabs | Plan | Work Plan | DOC+UX | T040; U05 |
| Phase row | Interaction | read-only ou accordion | CONFLIT | T054; A10 |
| Work Plan | Autre tab | Sous-domaine choisi | DOC+UX | T039-T045 |

- Le Work actif est conservé lors d’un changement de tab. [D16]
- Les tabs n’ont pas de sous-routes démontrées. [A09]
- Les retours et états non contractualisés restent ND. [A30]

