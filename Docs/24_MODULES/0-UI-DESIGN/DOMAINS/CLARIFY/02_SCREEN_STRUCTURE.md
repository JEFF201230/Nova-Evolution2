# CLARIFY — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Arbre

```text
CLARIFY
├── Back et progress
├── Objective recap
├── Question block
├── Suggestions
├── Textarea
└── Action row
```

## Structure détaillée

| Zone | Responsabilité | Source |
|---|---|---|
| Back et progress | Retour et progression step N/M | D01 Screen 2; D03 Clarify |
| Objective recap | Objectif en lecture seule | D01 |
| Question block | Catégorie, question et Why | D01; D03 |
| Suggestions | Choix proposés | D01; D02 Flow 2 |
| Textarea | Réponse libre | D01; D11 |
| Action row | Continue et Skip | D01; D03; D11 |

## Contraintes

- L’ordre et la présence des zones ne peuvent être changés sans mise à jour de l’autorité. [Constitution §15]
- Toute zone absente des sources reste ND.
- Aucun sous-écran supplémentaire n’est autorisé.

