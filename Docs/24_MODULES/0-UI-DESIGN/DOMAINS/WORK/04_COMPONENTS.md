# WORK — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Composants consommateurs

| Nom | Rôle | États | Source |
|---|---|---|---|
| WorkView | Shell composite | tab local | D03; D16 |
| WorkBreadcrumb | Retour contexte | sticky | D03 |
| WorkHeader | Identité/health/actions | persistant | D01; D08 |
| WorkTabs | Navigation secondaire | 7 états actifs | D01; D09 |
| ConfChip | Confiance | closed/open | D04; D09 |
| Btn/IconButton | Pause et More | destination ND | D20; A16 |
| NavRail | Navigation primaire | 56/220 CONFLIT | A04 |

## Gouvernance locale

- Aucun nom absent de D04, D09, D16 ou des patterns architecturaux n’est ajouté.
- Une variante visuelle conflictuelle reste CONFLIT.
- Les composants transverses doivent être réutilisés conformément à NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX.

