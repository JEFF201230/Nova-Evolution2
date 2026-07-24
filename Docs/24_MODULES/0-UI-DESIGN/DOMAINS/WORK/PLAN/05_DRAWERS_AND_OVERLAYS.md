# WORK — PLAN — Drawers and Overlays

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Surfaces

| Nom | Type | Déclencheur | Fermeture | Statut | Source |
|---|---|---|---|---|---|
| Drawer propre | Aucun drawer Work Plan démontré | ND | ND | ND | Constitution §5 |
| Search Overlay | Global shell | Search/Cmd-Ctrl+K | Escape/backdrop | DOC | D16 |
| ConfChip | Work Header popover | Clic chip | X | DOC+UX | U05; D09 |

- Single drawer; aucun nesting. [D10; A22]
- Escape et restauration du focus drawer restent ND. [A14]
- Search Overlay reste global et distinct du drawer.

