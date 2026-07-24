# DECISION PAUSE — Interactions and Events

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Interactions

| Interaction | Effet | Précondition | Source |
|---|---|---|---|
| Cancel/Back Review | Package | review active | T078 |
| Continue | Decide | review active | T079 |
| Back Decide | Review | decide active | T080 |
| Choice | Sélection locale | aucune | T081 |
| Rationale | Saisie locale | aucune | T082 |
| Record | Receipt | choice+rationale | T083 |

- Les placeholders restent ND.
- Une capture seule ne prouve pas la destination.

