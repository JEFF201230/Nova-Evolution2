# WORK — DELIVERABLES — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
WORK
└── DELIVERABLES
    ├── Work shell
    ├── Deliverables header
    ├── Deliverable list
    ├── Readiness
    ├── Actions
    └── Deliverable Drawer
```

| Zone | Responsabilité | Source |
|---|---|---|
| Work shell | Header et tab Deliverables actif | D03; U22-U23 |
| Deliverables header | Titre et Create | U23 |
| Deliverable list | DeliverableCard[] | D03; U23 |
| Readiness | Progress bar, percentage, blocker, next action | D03; U23 |
| Actions | Eye et Details | D02 Flow 11; U23 |
| Deliverable Drawer | Summary à Technical details | D10 Drawer 5; U22 |

- WorkHeader et WorkTabs appartiennent au parent Work et ne sont pas dupliqués. [NOVA_REUSE_MATRIX]
- Toute zone absente reste ND.

