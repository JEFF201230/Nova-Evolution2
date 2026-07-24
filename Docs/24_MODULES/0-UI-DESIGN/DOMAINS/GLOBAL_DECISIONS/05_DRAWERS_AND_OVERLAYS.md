# GLOBAL DECISIONS — Drawers and Overlays

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Surfaces

| Nom | Type | Déclencheur | Fermeture | Statut | Source |
|---|---|---|---|---|---|
| Drawer propre | Aucun drawer Global Decisions démontré | ND | ND | ND | Constitution §5 |
| ConfChip | Popover | Clic chip | X | DOC | D09 |
| Search Overlay | Global | Search/Cmd-Ctrl+K | Escape/backdrop | DOC | D16 |

- Aucun drawer imbriqué. [A22]
- Escape/focus drawer restent ND. [A14]
- Une page fullscreen n’est pas requalifiée en modale.

