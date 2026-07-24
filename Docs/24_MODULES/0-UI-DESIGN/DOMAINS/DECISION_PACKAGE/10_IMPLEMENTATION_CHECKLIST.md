# DECISION PACKAGE — Implementation Checklist

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
| A01 | V6.1/V7 | CONFLIT |
| A04 | NavRail 56/220 | CONFLIT |
| A07 | Retour selon origine | ND |
| A15 | Liens drawer | ND |
| A25 | 800/780 et drawer | CONFLIT |
| A30 | État option/scroll au retour | ND |

## Certification

- [ ] Aucun parcours, CTA, composant, drawer ou overlay inventé.
- [ ] Typecheck/build/tests applicables passent.
- [ ] Accessibilité contrôlée selon D13.
- [ ] Pixel Perfect validé seulement avec preuves disponibles.
- [ ] Toute nouvelle décision est tracée avant implémentation.

