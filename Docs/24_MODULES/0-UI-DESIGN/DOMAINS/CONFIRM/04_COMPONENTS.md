# CONFIRM — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Composants consommateurs

| Nom | Rôle | États | Source |
|---|---|---|---|
| ConfirmView | Composite | aut level | D04; D16 |
| OptionButton/autonomy pattern | Sélection A0-A3 | selected/unselected | D03; D11 |
| ConfChip | Confiance du Work | closed/open | D16 |
| Card | Détail autonomie | statique | D04 |
| Btn | Back et Start work | primary/quiet | D04; D09 |

## Gouvernance locale

- Aucun nom absent de D04, D09, D16 ou des patterns architecturaux n’est ajouté.
- Une variante visuelle conflictuelle reste CONFLIT.
- Les composants transverses doivent être réutilisés conformément à NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX.

