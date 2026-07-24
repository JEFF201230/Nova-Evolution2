# PLAN — Interactions and Events

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Inventaire

| Interaction/événement | Effet | Précondition | Source |
|---|---|---|---|
| Back | Canvas | aucune | T033 |
| Phase toggle | Ouvre/replie; une ouverte selon checklist | phase choisie | T032; D18 |
| Review and start | Confirm | plan disponible | T034 |

## Gouvernance événementielle

- Les CTA renvoient à NOVA_CTA_MATRIX; les transitions à NOVA_NAVIGATION_MATRIX.
- Une action placeholder demeure ND.
- Une capture valide l’état visible, jamais seule la destination.

