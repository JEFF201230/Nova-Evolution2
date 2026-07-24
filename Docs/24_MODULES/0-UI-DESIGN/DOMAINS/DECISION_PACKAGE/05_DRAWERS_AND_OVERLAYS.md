# DECISION PACKAGE — Drawers and Overlays

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Surfaces

| Nom | Type | Déclencheur | Fermeture | Statut | Source |
|---|---|---|---|---|---|
| Full Package | Drawer | Full package | X/backdrop; Escape/focus ND | DOC+UX | DR06; U01,U20 |
| WhyInline | Disclosure | Why | Toggle | DOC+UX | U21 |
| ConfChip | Popover | Clic | X | DOC+UX | U04 |
| Search Overlay | Global selon shell | Search/Cmd-Ctrl+K | Escape/backdrop | DOC | D16 |

- Aucun drawer imbriqué. [A22]
- Escape/focus drawer restent ND. [A14]
- Une page fullscreen n’est pas requalifiée en modale.

