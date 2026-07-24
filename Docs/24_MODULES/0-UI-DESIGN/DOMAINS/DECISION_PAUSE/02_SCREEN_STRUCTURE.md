# DECISION PAUSE — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Arbre

```text
DECISION PAUSE
├── Checkpoint header
├── Step indicator
├── Review step
├── Decide step
├── Rationale
├── Record CTA
└── Fullscreen
```

| Zone | Responsabilité | Source |
|---|---|---|
| Checkpoint header | Lock, authority, permanent record | D01 Screen 10; U02-U03 |
| Step indicator | Review puis Decide | D01; U02-U03 |
| Review step | Decision, Recommended, approved/rejected, Uncertainty | D02 Flow 13; U03 |
| Decide step | Approve, Request changes, Reject, Defer | D02 Flow 14; U02,U19 |
| Rationale | Textarea required | D02; U02,U19 |
| Record CTA | Disabled jusqu’à choice+rationale | D02; D11 |
| Fullscreen | Sans NavRail selon App/captures; matrice contraire | A05 |

- Aucune zone supplémentaire n’est autorisée.
- Toute absence reste ND.

