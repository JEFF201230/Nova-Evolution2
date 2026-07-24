# WORK — DECISIONS — Interactions and Events

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Interactions

| Interaction | Effet | Précondition | Source |
|---|---|---|---|
| Why | Toggle local | aucune | T062 |
| Review & decide | Decision Package | decision id | T063 |
| ConfChip | Popover | confidence data | T046 pattern |
| Autre tab | Change tab | Work actif | T039-T045 |

- Les CTA ND restent sans handler inventé.
- Une capture valide un état visible, pas une destination seule.

