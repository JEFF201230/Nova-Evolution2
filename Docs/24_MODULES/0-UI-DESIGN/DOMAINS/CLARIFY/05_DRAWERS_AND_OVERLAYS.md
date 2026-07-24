# CLARIFY — Drawers and Overlays

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Surfaces temporaires

| Nom | Type | Déclencheur | Fermeture | Statut | Source |
|---|---|---|---|---|---|
| Drawer propre | Aucun drawer Clarify démontré | ND | ND | ND | Constitution §5 |
| Search Overlay | Overlay du shell selon App | Cmd/Ctrl+K ou Search | Escape/backdrop | DOC; visibilité UX ND | D16; T006-T007 |

## Règles

- Un seul drawer simultané; aucun drawer imbriqué. [D10; A22]
- X et backdrop sont les seules fermetures drawer démontrées; Escape et focus return restent ND. [A14]
- Search Overlay ne doit pas être confondu avec un drawer. [D03; NOVA_DRAWER_ARCHITECTURE]

