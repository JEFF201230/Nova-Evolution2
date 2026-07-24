# WORK — PEOPLE — Interactions and Events

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Interactions

| Interaction | Effet | Précondition | Source |
|---|---|---|---|
| Invite | ND | ND | T057 |
| Details | Ouvre DR03 | personne sélectionnée | T058 |
| X/backdrop | Ferme DR03 | drawer ouvert | T093-T094 |

- Les CTA ND restent sans handler inventé.
- Une capture valide un état visible, pas une destination seule.

