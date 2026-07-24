# CONFIRM — Interactions and Events

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Inventaire

| Interaction/événement | Effet | Précondition | Source |
|---|---|---|---|
| Back | Plan Setup | aucune | T036 |
| A0/A1/A2/A3 | Met à jour détail | niveau disponible | T035 |
| ConfChip | Ouvre popover | données confiance | T046 pattern |
| Start work | Work Overview | niveau sélectionné par défaut ou utilisateur | T037 |

## Gouvernance événementielle

- Les CTA renvoient à NOVA_CTA_MATRIX; les transitions à NOVA_NAVIGATION_MATRIX.
- Une action placeholder demeure ND.
- Une capture valide l’état visible, jamais seule la destination.

