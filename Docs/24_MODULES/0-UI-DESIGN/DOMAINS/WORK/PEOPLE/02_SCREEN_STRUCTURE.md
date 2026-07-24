# WORK — PEOPLE — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
WORK
└── PEOPLE
    ├── People header
    ├── Person list
    ├── PersonCard
    ├── NOVA reasoning
    └── Person Drawer
```

| Zone | Responsabilité | Source |
|---|---|---|
| People header | Titre et Invite | D03 WorkPeople; U15 |
| Person list | Sarah, NOVA, Thomas, Marie dans capture | U15 |
| PersonCard | Avatar, name, role, availability, contribution, Details | D03; U15 |
| NOVA reasoning | Seulement si novaState non nul | D18; U15 |
| Person Drawer | Détail humain/NOVA | D10 Drawer 3; U11-U14 |

- WorkHeader et WorkTabs appartiennent au parent Work et ne sont pas dupliqués. [NOVA_REUSE_MATRIX]
- Toute zone absente reste ND.

