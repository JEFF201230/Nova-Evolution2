# CONFIRM — Visual and Pixel Perfect

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Contraintes visuelles

| Contrainte | Statut | Source |
|---|---|---|
| Centered narrow, autonomie 2x2 ou rangée selon sources | CONFLIT de layout potentiel | D01; D03; D08; D21 |
| Largeur 560 contre 580 documentée | CONFLIT | A25; D08/D21 |
| États sélectionnés utilisent tokens Action | DOC | D05; D06; D09 |
| Aucune capture Confirm imposée | ND validation UX | U01-U23 |

## Gate Pixel Perfect

- Utiliser D05 Design Tokens, D06 Color, D07 Typography, D08 Layout, D09 Component Specs, D12 Responsive et D19 Checklist.
- Comparer uniquement aux captures référencées pour ce domaine.
- Ne jamais trancher A01, A04, A05 ou A25 par préférence visuelle.
- Sans capture directe, la validation Pixel Perfect reste ND.

