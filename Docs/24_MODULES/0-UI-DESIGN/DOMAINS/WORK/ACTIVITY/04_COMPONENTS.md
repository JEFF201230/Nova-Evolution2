# WORK — ACTIVITY — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| WorkActivityTab | Composite | filter/comment | D16 |
| FilterPill | Filtres | selected/unselected | D06; D11 |
| ActivityEvent | Événement narratif | human/ai/critical/source | D04; D16 |
| NOVA reasoning box | Impact NOVA | conditionnel | D18 |
| Textarea/Btn | Comment/Post | empty/filled; effect ND | D09; D20 |

- Aucun composant absent de D04/D09/D16 ou des patterns architecturaux n’est autorisé.
- Réutiliser WorkView, WorkHeader et WorkTabs depuis le domaine parent.

