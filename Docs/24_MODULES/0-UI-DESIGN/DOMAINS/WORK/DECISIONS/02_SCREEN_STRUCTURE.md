# WORK — DECISIONS — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
WORK
└── DECISIONS
    ├── Work shell
    ├── Decision list
    ├── Badge row
    ├── Recommendation
    ├── Consequences
    └── CTA row
```

| Zone | Responsabilité | Source |
|---|---|---|
| Work shell | Header et tab Decisions actif | D03; U18 |
| Decision list | DecisionCard[] | D03 WorkDecisions |
| Badge row | DeadlineBadge et ConfChip | D03; U18 |
| Recommendation | NOVA recommendation | D03; U18 |
| Consequences | If approved / If rejected | D03; U18 |
| CTA row | Review & decide et Why | D02 Flow 10; U18 |

- WorkHeader et WorkTabs appartiennent au parent Work et ne sont pas dupliqués. [NOVA_REUSE_MATRIX]
- Toute zone absente reste ND.

