# WORK — SOURCES — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
WORK
└── SOURCES
    ├── Sources header
    ├── Counter strip
    ├── Source list
    ├── Source actions
    └── Source Drawer
```

| Zone | Responsabilité | Source |
|---|---|---|
| Sources header | Titre, validating state et Add | D03; U17 |
| Counter strip | available/stale/missing/conflict et coverage | D03; U17 |
| Source list | Status-sorted SourceCards | D02 Flow 9; U17 |
| Source actions | Add/Refresh et Details | D02; U17 |
| Source Drawer | Assessment, evidence et history | D10 Drawer 4; U16 |

- WorkHeader et WorkTabs appartiennent au parent Work et ne sont pas dupliqués. [NOVA_REUSE_MATRIX]
- Toute zone absente reste ND.

