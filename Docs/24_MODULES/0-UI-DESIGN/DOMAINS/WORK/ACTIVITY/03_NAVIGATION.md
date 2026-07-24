# WORK — ACTIVITY — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Work tabs | Activity | Work Activity | DOC+UX | T041 |
| Activity | Filtre | Liste filtrée | DOC+UX | T055; U06-U10 |
| Activity | Post | ND | ND | T056; A18 |
| Activity | Autre tab | Sous-domaine choisi | DOC+UX | T039-T045 |

- Le Work actif est conservé lors d’un changement de tab. [D16]
- Les tabs n’ont pas de sous-routes démontrées. [A09]
- Les retours et états non contractualisés restent ND. [A30]

