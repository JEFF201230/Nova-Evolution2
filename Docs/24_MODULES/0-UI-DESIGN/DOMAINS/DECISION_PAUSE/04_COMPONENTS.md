# DECISION PAUSE — Components

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Composants

| Nom | Rôle | États | Source |
|---|---|---|---|
| DecisionPauseView | Composite | step/choice/rationale/loading | D04; D16 |
| Review cards | Éléments obligatoires | static | D01; U03 |
| Step indicator | Progression Review/Decide | review/decide | D01 |
| OptionButton | Quatre choix | selected/unselected | D02; U02 |
| Textarea | Rationale | empty/filled/required | D02; U02 |
| Btn | Continue/Record/Back | disabled/loading | D09; D11 |

- Aucun composant absent de D04/D09/D16 ou des patterns ARCHITECTURE n’est autorisé.
- Les variantes conflictuelles restent CONFLIT.

