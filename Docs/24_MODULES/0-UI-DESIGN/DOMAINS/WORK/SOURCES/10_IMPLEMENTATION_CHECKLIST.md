# WORK — SOURCES — Implementation Checklist

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Gate documentaire

- [ ] Constitution et matrices ARCHITECTURE lues.
- [ ] Route/tab/parent vérifiés.
- [ ] Transitions et CTA vérifiés par T/C.
- [ ] Composants limités à 04_COMPONENTS.
- [ ] Données/owners conformes à 06_DATA_AND_STATE.
- [ ] Réutilisation du shell Work confirmée.

## ND et CONFLIT à conserver

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A14 | Escape/focus drawer | ND |
| A18 | Add/Refresh | ND |
| A25 | Dimensions drawer | CONFLIT |
| A30 | État au retour | ND |

## Gate de certification

- [ ] Aucun CTA, composant, drawer ou route inventé.
- [ ] Typecheck/build/tests applicables passent.
- [ ] Accessibilité vérifiée selon D13.
- [ ] Pixel Perfect validé seulement contre preuves disponibles.
- [ ] Traçabilité mise à jour avant toute décision produit.

