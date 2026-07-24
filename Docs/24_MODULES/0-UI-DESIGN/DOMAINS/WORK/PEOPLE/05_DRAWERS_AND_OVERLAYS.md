# WORK — PEOPLE — Drawers and Overlays

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Surfaces

| Nom | Type | Déclencheur | Fermeture | Statut | Source |
|---|---|---|---|---|---|
| Person Detail | Drawer | Details PersonCard | X/backdrop; Escape/focus ND | DOC+UX | DR03; U11-U14 |
| Search Overlay | Global shell | Search/Cmd-Ctrl+K | Escape/backdrop | DOC | D16 |
| ConfChip | Work Header | Clic | X | DOC; shell absent U15 | D09 |

- Single drawer; aucun nesting. [D10; A22]
- Escape et restauration du focus drawer restent ND. [A14]
- Search Overlay reste global et distinct du drawer.

