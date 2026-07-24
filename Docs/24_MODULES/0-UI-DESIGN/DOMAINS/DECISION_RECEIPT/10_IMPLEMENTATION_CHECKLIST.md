# DECISION RECEIPT — Implementation Checklist

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Préparation

- [ ] Constitution et vues ARCHITECTURE lues.
- [ ] Route, parent, transitions et CTA vérifiés.
- [ ] Composants et réutilisations vérifiés.
- [ ] Données et propriétaires vérifiés.

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A05 | NavRail fullscreen | CONFLIT |
| A18 | Share/Export | ND |
| A25 | Dimensions centered narrow | CONFLIT |
| A30 | Retour et état | ND |

## Certification

- [ ] Aucun parcours, CTA, composant, drawer ou overlay inventé.
- [ ] Typecheck/build/tests applicables passent.
- [ ] Accessibilité contrôlée selon D13.
- [ ] Pixel Perfect validé seulement avec preuves disponibles.
- [ ] Toute nouvelle décision est tracée avant implémentation.

