# WORK — PLAN — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
WORK
└── PLAN
    ├── Work shell
    ├── Plan content
    ├── Phase rows
    └── Status
```

| Zone | Responsabilité | Source |
|---|---|---|
| Work shell | Breadcrumb, header, tabs | D03 Work; U05 |
| Plan content | Liste de PhaseRows | D03 WorkPlan |
| Phase rows | Outcome, phase, probability, tasks/contributions selon sources | D01; D03; U05 |
| Status | complete/active/future | D06; D16 |

- WorkHeader et WorkTabs appartiennent au parent Work et ne sont pas dupliqués. [NOVA_REUSE_MATRIX]
- Toute zone absente reste ND.

