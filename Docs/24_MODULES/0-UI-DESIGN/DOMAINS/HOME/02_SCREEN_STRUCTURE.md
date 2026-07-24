# HOME — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Arbre

```text
HOME
├── Page header
├── Composer
├── Hero situation
├── Decision card
├── Active work list
└── NOVA background strip
```

## Structure détaillée

| Zone | Responsabilité | Source |
|---|---|---|
| Page header | Greeting et sous-caption avec compteurs | D01 Screen 1; D03 Home |
| Composer | États replié/développé, objectif, suggestions et CTA | D01; D02 Flow 1; D11 Home |
| Hero situation | Point focal NOVA avec Open presentation, Why et Details | D01; D03; D22 |
| Decision card | Décision urgente ouvrant Decision Package | D01; D11 |
| Active work list | Lignes compactes ouvrant le Work sélectionné | D01; D11 |
| NOVA background strip | Statut, temps gagné et Details | D01; D10; D11 |

## Contraintes

- L’ordre et la présence des zones ne peuvent être changés sans mise à jour de l’autorité. [Constitution §15]
- Toute zone absente des sources reste ND.
- Aucun sous-écran supplémentaire n’est autorisé.

