# WORK — PLAN — Interactions and Events

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Interactions

| Interaction | Effet | Précondition | Source |
|---|---|---|---|
| Tab Plan | Affiche Work Plan | Work actif | T040 |
| Phase row | read-only selon D11; exp selon D16 | CONFLIT | T054; A10 |
| Autre tab | Change sous-domaine | Work actif | T039-T045 |

- Les CTA ND restent sans handler inventé.
- Une capture valide un état visible, pas une destination seule.

