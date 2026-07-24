# PLAN — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Composants consommateurs

| Nom | Rôle | États | Source |
|---|---|---|---|
| PlanView | Composite | exp index/null | D04; D16 |
| PhaseRow/PhaseList | Phases | complete/active/future; open/closed | D03; D16 |
| NOVALabel | Contexte NOVA | variant conflict | D04; D07 |
| Btn | Back et Review and start | variants | D04; D09 |
| Confidence strip pattern | Résumé confiance | statique | D01; D08 |

## Gouvernance locale

- Aucun nom absent de D04, D09, D16 ou des patterns architecturaux n’est ajouté.
- Une variante visuelle conflictuelle reste CONFLIT.
- Les composants transverses doivent être réutilisés conformément à NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX.

