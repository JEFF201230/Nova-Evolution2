# DECISION RECEIPT — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| DecisionReceiptView | Composite | decision recorded | D04; D16 |
| Success header pattern | Confirmation | static | D01 |
| Receipt Card | Record fields | static | D01 |
| Action list | Resulting actions | static | D01 |
| Btn | Return/Share/Export | Share/Export ND | D09; D20 |

- Aucun composant absent de D04/D09/D16 ou des patterns ARCHITECTURE n’est autorisé.
- Les variantes conflictuelles restent CONFLIT.

