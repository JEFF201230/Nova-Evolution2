# WORK — Interactions and Events

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Inventaire

| Interaction/événement | Effet | Précondition | Source |
|---|---|---|---|
| 7 tabs | Change sous-domaine | Work actif | T039-T045 |
| Breadcrumb | Home | aucune | T038 |
| ConfChip | Popover | confidence data | T046 |
| Pause | ND | ND | T047 |
| More | ND | ND | T048 |

## Gouvernance événementielle

- Les CTA renvoient à NOVA_CTA_MATRIX; les transitions à NOVA_NAVIGATION_MATRIX.
- Une action placeholder demeure ND.
- Une capture valide l’état visible, jamais seule la destination.

