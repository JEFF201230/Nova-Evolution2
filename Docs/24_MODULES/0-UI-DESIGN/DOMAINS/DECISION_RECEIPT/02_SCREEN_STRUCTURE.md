# DECISION RECEIPT — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
DECISION RECEIPT
├── Success header
├── Receipt card
├── Resulting actions
├── CTA row
└── Fullscreen
```

| Zone | Responsabilité | Source |
|---|---|---|
| Success header | Confirmation et permanent record | D01 Screen 11 |
| Receipt card | Reference, outcome, decision, option, authority, timestamp, Export | D01 |
| Resulting actions | Trois actions avec assignees/dates | D01 |
| CTA row | Return to work et Share receipt | D01; D02 Flow 15 |
| Fullscreen | Sans NavRail selon App; matrice contraire | A05 |

- Aucune zone supplémentaire n’est autorisée.
- Toute absence reste ND.

