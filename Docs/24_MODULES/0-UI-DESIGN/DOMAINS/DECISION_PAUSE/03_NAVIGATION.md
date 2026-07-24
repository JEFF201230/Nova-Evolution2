# DECISION PAUSE — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Decision Package | Review and decide | Pause Review | DOC+UX | T077 |
| Review | Cancel/Back | Decision Package | DOC+UX | T078 |
| Review | Continue | Pause Decide | DOC+UX | T079 |
| Decide | Back | Pause Review | DOC+UX | T080 |
| Decide | Record valide | Decision Receipt | DOC | T083 |

- Les destinations viennent de NOVA_NAVIGATION_MATRIX.
- Le retour d’origine, l’URL/state et l’historique restent gouvernés par A02/A03/A07/A30.

