# WORK — DECISIONS — Drawers and Overlays

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Surfaces

| Nom | Type | Déclencheur | Fermeture | Statut | Source |
|---|---|---|---|---|---|
| Drawer propre | Aucun drawer Work Decisions direct démontré | ND | ND | ND | Constitution §5 |
| ConfChip | Popover | Clic chip | X | DOC+UX | D09; U18 |
| WhyInline | Disclosure | Why | Toggle | DOC+UX | U18 |
| Search Overlay | Global shell | Search/Cmd-Ctrl+K | Escape/backdrop | DOC | D16 |

- Single drawer; aucun nesting. [D10; A22]
- Escape et restauration du focus drawer restent ND. [A14]
- Search Overlay reste global et distinct du drawer.

