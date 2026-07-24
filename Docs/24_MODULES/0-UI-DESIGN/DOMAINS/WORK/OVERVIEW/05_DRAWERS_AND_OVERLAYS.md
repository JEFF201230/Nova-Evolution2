# WORK — OVERVIEW — Drawers and Overlays

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Surfaces

| Nom | Type | Déclencheur | Fermeture | Statut | Source |
|---|---|---|---|---|---|
| Work Full Analysis | Drawer | Full analysis sidebar | X/backdrop; Escape/focus ND | DOC | DR02; D10 |
| ConfChip | Popover | Clic chip | X | DOC | D09 |
| Search Overlay | Overlay global | Search/Cmd-Ctrl+K | Escape/backdrop | DOC | D16 |

- Single drawer; aucun nesting. [D10; A22]
- Escape et restauration du focus drawer restent ND. [A14]
- Search Overlay reste global et distinct du drawer.

