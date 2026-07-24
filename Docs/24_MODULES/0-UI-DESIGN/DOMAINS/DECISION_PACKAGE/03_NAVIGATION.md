# DECISION PACKAGE — Navigation

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Transitions

| Origine | Action | Destination/effet | Statut | Source |
|---|---|---|---|---|
| Home/Work/Global/Search | Décision sélectionnée | Decision Package | DOC | T018,T052,T063,T068,T090 |
| Package | Back to work | Work | DOC+UX | T072 |
| Package | Why | Disclosure | DOC+UX | T074 |
| Package | Option | Sélection locale | DOC+UX | T075 |
| Package | Full package | DR06 | DOC+UX | T076 |
| Package | Review and decide | Decision Pause Review | DOC+UX | T077 |

- Les destinations viennent de NOVA_NAVIGATION_MATRIX.
- Le retour d’origine, l’URL/state et l’historique restent gouvernés par A02/A03/A07/A30.

