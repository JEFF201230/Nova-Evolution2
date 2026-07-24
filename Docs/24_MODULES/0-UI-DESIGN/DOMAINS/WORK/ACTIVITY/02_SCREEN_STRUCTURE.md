# WORK — ACTIVITY — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
WORK
└── ACTIVITY
    ├── Work shell
    ├── Filter row
    ├── Event list
    ├── NOVA box
    └── Comment composer
```

| Zone | Responsabilité | Source |
|---|---|---|
| Work shell | Header et tabs | D03; U06-U10 |
| Filter row | All, Human, AI, Critical, Sources | D02 Flow 7; U06-U10 |
| Event list | ActivityEvent narratif | D03; D04 ActivityEvent |
| NOVA box | Impact, delta, why, sources selon event | D18 Pitfall Activity |
| Comment composer | Textarea et Post | D02; U06-U10 |

- WorkHeader et WorkTabs appartiennent au parent Work et ne sont pas dupliqués. [NOVA_REUSE_MATRIX]
- Toute zone absente reste ND.

