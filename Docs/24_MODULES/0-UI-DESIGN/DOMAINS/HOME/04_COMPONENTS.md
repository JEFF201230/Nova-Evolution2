# HOME — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Composants consommateurs

| Nom | Rôle | États | Source |
|---|---|---|---|
| HomeView | Composite de page | composer fermé/ouvert; loading; detailOpen | D04; D16 |
| Card | Hero, décision et listes selon structure | statique/cliquable | D04; D09 |
| Btn | CTA composer et Open presentation | disabled/loading/variants | D04; D09 |
| NOVALabel | Identité NOVA | variantes typographiques en CONFLIT | D04; D07; D21 |
| DeadlineBadge | Échéance décision | urgence | D04; D09 |
| ConfChip | Confiance et popover | fermé/ouvert | D04; D09 |
| WhyInline | Justification locale | fermé/ouvert | D04; D09 |
| Drawer/DrawerSection/DrawerRow | Situation Details | ouvert/fermé | D04; D10 |

## Gouvernance locale

- Aucun nom absent de D04, D09, D16 ou des patterns architecturaux n’est ajouté.
- Une variante visuelle conflictuelle reste CONFLIT.
- Les composants transverses doivent être réutilisés conformément à NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX.

