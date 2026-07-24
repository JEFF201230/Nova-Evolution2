# CANVAS — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Arbre

```text
CANVAS
├── Header
├── Cards grid
├── Card edit mode
├── Warning
└── Bottom CTA
```

## Structure détaillée

| Zone | Responsabilité | Source |
|---|---|---|
| Header | Back, NOVA label, heading et CTA | D01 Screen 3; D03 Canvas |
| Cards grid | Outcome, Audience, Success, Constraints, Assumptions, People | D01; D16 CANVAS_ITEMS |
| Card edit mode | Textarea locale par carte | D02 Flow 3; D11 Canvas |
| Warning | Assumptions incertaines | D01; D02 |
| Bottom CTA | Prepare a plan | D01; D11 |

## Contraintes

- L’ordre et la présence des zones ne peuvent être changés sans mise à jour de l’autorité. [Constitution §15]
- Toute zone absente des sources reste ND.
- Aucun sous-écran supplémentaire n’est autorisé.

