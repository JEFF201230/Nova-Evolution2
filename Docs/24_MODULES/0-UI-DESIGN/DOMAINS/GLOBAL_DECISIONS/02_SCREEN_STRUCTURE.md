# GLOBAL DECISIONS — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
GLOBAL DECISIONS
├── Page header
├── Filter tabs
├── Decision list
├── Decision card
└── NavRail
```

| Zone | Responsabilité | Source |
|---|---|---|
| Page header | All decisions et compte/urgence | D01 Screen 7; D03 Global |
| Filter tabs | All, Needs my decision/Pending, Waiting, History/Decided | D01; D03 |
| Decision list | GlobalDecisionCard[] | D03 |
| Decision card | Statement, deadline, confidence, outcome éventuel | D01 |
| NavRail | Entrée Decisions active | D03 |

- Aucune zone supplémentaire n’est autorisée.
- Toute absence reste ND.

