# CLARIFY — Interactions and Events

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Inventaire

| Interaction/événement | Effet | Précondition | Source |
|---|---|---|---|
| Back | Étape précédente ou Home | selon step | T025-T026 |
| Suggestion | Met à jour current | question courante | T027 |
| Textarea | Met à jour current | question courante | T027 |
| Continue | Étape suivante/Canvas | selon étape et règles documentées | T022-T024 |
| Skip | Étape suivante/Canvas | aucune | T022-T024 |
| Why | Disclosure local | aucune | T027 |

## Gouvernance événementielle

- Les CTA renvoient à NOVA_CTA_MATRIX; les transitions à NOVA_NAVIGATION_MATRIX.
- Une action placeholder demeure ND.
- Une capture valide l’état visible, jamais seule la destination.

