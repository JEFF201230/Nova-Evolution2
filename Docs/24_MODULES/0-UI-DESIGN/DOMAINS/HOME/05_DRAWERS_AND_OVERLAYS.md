# HOME — Drawers and Overlays

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Surfaces temporaires

| Nom | Type | Déclencheur | Fermeture | Statut | Source |
|---|---|---|---|---|---|
| Home Situation Details | Drawer | Details hero ou NOVA strip | X/backdrop; Escape/focus ND | DOC sans UX imposée | DR01; D10 Drawer 1 |
| Search Overlay | Overlay global | Nav Search ou Cmd/Ctrl+K | Escape/backdrop | DOC | T006-T007,T091-T092 |

## Règles

- Un seul drawer simultané; aucun drawer imbriqué. [D10; A22]
- X et backdrop sont les seules fermetures drawer démontrées; Escape et focus return restent ND. [A14]
- Search Overlay ne doit pas être confondu avec un drawer. [D03; NOVA_DRAWER_ARCHITECTURE]

