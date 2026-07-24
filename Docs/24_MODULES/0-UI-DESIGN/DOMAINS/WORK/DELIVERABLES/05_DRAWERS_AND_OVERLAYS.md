# WORK — DELIVERABLES — Drawers and Overlays

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Surfaces

| Nom | Type | Déclencheur | Fermeture | Statut | Source |
|---|---|---|---|---|---|
| Deliverable Detail | Drawer | Details | X/backdrop; Escape/focus ND | DOC+UX | DR05; U22 |
| ConfChip | Popover | Clic | X | DOC+UX | U23 |
| Search Overlay | Global shell | Search/Cmd-Ctrl+K | Escape/backdrop | DOC | D16 |

- Single drawer; aucun nesting. [D10; A22]
- Escape et restauration du focus drawer restent ND. [A14]
- Search Overlay reste global et distinct du drawer.

