# PLAN — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Arbre

```text
PLAN
├── Header
├── Phase timeline
├── Expanded phase
├── Confidence strip
└── CTA
```

## Structure détaillée

| Zone | Responsabilité | Source |
|---|---|---|
| Header | Back, NOVA label, heading et CTA | D01 Screen 4; D03 Plan |
| Phase timeline | Quatre PhaseRows verticales | D01; D02 Flow 4; D16 PLAN_PHASES |
| Expanded phase | AI contribution, Human contribution, checklist/summary selon sources | D01; D03 |
| Confidence strip | Confiance NOVA | D01 |
| CTA | Review and start | D01; D11 |

## Contraintes

- L’ordre et la présence des zones ne peuvent être changés sans mise à jour de l’autorité. [Constitution §15]
- Toute zone absente des sources reste ND.
- Aucun sous-écran supplémentaire n’est autorisé.

