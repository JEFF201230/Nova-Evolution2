# DECISION RECEIPT — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Rôle

Confirmer l’enregistrement immuable de la décision et exposer les actions résultantes. [D01/D03]

## Objectif utilisateur

Savoir ce qui a été décidé et ce qui se passe ensuite. [D01]

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/decisions/:id/receipt` | D01 |
| Parent | Decision flow | Constitution §3 |
| Nature | Domaine documentaire | P37-MO-003 |
| Autorité | Aucune information complétée | Mission |

## Structure majeure

| Élément | Description | Source |
|---|---|---|
| Success header | Confirmation et permanent record | D01 Screen 11 |
| Receipt card | Reference, outcome, decision, option, authority, timestamp, Export | D01 |
| Resulting actions | Trois actions avec assignees/dates | D01 |
| CTA row | Return to work et Share receipt | D01; D02 Flow 15 |
| Fullscreen | Sans NavRail selon App; matrice contraire | A05 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A05 | NavRail fullscreen | CONFLIT |
| A18 | Share/Export | ND |
| A25 | Dimensions centered narrow | CONFLIT |
| A30 | Retour et état | ND |

