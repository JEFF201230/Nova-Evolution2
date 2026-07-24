# WORK — PEOPLE — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| WorkPeopleTab | Composite | drawer PersonData/null | D16 |
| PersonCard | Résumé personne/NOVA | human/AI; availability | D03; U15 |
| NOVALabel | Identité AI | variant | D04 |
| StatusDot | Disponibilité | 3 statuses/boolean CONFLIT | D04; D09 |
| Drawer/Section/Row | Détail personne | human/NOVA variants | D10 |

- Aucun composant absent de D04/D09/D16 ou des patterns architecturaux n’est autorisé.
- Réutiliser WorkView, WorkHeader et WorkTabs depuis le domaine parent.

