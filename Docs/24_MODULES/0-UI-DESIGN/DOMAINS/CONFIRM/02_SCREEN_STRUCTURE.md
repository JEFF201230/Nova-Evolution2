# CONFIRM — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Arbre

```text
CONFIRM
├── Back
├── Heading/sub-caption
├── Autonomy grid
├── Detail card
└── Start work
```

## Structure détaillée

| Zone | Responsabilité | Source |
|---|---|---|
| Back | Retour Plan Setup | D01 Screen 5 |
| Heading/sub-caption | One last check et contexte | D01; D03 Confirm |
| Autonomy grid | A0, A1, A2, A3 | D01; D16 AUTONOMY_LEVELS |
| Detail card | NOVA will / NOVA will ask first | D01; D02 Flow 5 |
| Start work | CTA final du setup | D01; D11 |

## Contraintes

- L’ordre et la présence des zones ne peuvent être changés sans mise à jour de l’autorité. [Constitution §15]
- Toute zone absente des sources reste ND.
- Aucun sous-écran supplémentaire n’est autorisé.

