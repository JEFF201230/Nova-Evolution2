# DECISION PACKAGE — Dependencies and Reuse

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Dépendances

| Type | Élément | Relation | Source |
|---|---|---|---|
| Appelantes | Home, Work Overview, Work Decisions, Global Decisions, Search | Cinq origines | Constitution §4.4 |
| Appelée | Work | Back | T072 |
| Appelée | Decision Pause | Review and decide | T077 |
| Appelée | DR06 | Full package | T076 |
| Réutilisation | Decision patterns/consequence grid | Work/Global/Pause | NOVA_REUSE_MATRIX |

- Consulter NOVA_SHARED_COMPONENTS et NOVA_REUSE_MATRIX avant toute implémentation.
- Aucune réutilisation ne crée une transition.

