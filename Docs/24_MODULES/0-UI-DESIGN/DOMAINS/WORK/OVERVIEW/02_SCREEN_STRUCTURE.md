# WORK — OVERVIEW — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
WORK
└── OVERVIEW
    ├── Work shell
    ├── Hero situation
    ├── Next Best Action
    ├── Later & Background
    ├── Pending decisions
    └── Progress sidebar
```

| Zone | Responsabilité | Source |
|---|---|---|
| Work shell | Breadcrumb, header et sept tabs persistants | D03 Work |
| Hero situation | Situation courante | D03 WorkOverview |
| Next Best Action | Carte focale avec Open et Why | D02 Flow 6; D03 |
| Later & Background | Disclosure natif | D02; D11 |
| Pending decisions | DecisionCards | D02; D03 |
| Progress sidebar | Health bars et Full analysis | D03; D10 Drawer 2 |

- WorkHeader et WorkTabs appartiennent au parent Work et ne sont pas dupliqués. [NOVA_REUSE_MATRIX]
- Toute zone absente reste ND.

