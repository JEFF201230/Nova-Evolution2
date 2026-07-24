# DECISION PACKAGE — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| DecisionPackageView | Composite | sel/detailOpen | D04; D16 |
| NOVALabel | Recommandation NOVA | variant | D04 |
| DeadlineBadge/ConfChip | Urgence/confiance | semantic/open | D04; D09 |
| WhyInline | Justification | closed/open | D09; U21 |
| OptionButton | Options | selected/unselected | D03; D11 |
| Btn | Review and decide | hero/bottom | D09; U04 |
| Drawer/Section/Row | Full Package | closed/open | D10 |

- Aucun composant absent de D04/D09/D16 ou des patterns ARCHITECTURE n’est autorisé.
- Les variantes conflictuelles restent CONFLIT.

