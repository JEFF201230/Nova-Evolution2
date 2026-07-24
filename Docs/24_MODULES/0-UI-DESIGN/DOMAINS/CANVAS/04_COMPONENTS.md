# CANVAS — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Composants consommateurs

| Nom | Rôle | États | Source |
|---|---|---|---|
| CanvasView | Composite | editing index/null | D04; D16 |
| Card/CanvasCard pattern | Six synthèses | lecture/édition | D03; D16 |
| NOVALabel | Contexte NOVA | variante conflictuelle | D04; D07 |
| Btn | Back, Edit, Save, Prepare a plan | variants | D04; D09 |
| Textarea | Édition locale | focus/filled | D09 |

## Gouvernance locale

- Aucun nom absent de D04, D09, D16 ou des patterns architecturaux n’est ajouté.
- Une variante visuelle conflictuelle reste CONFLIT.
- Les composants transverses doivent être réutilisés conformément à NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX.

