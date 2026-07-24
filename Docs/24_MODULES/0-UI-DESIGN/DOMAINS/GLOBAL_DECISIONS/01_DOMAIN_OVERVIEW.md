# GLOBAL DECISIONS — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Rôle

Présenter les décisions de tous les Works selon leur état et leur besoin d’autorité. [D01/D03]

## Objectif utilisateur

Identifier les décisions qui requièrent une action maintenant. [D01]

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/decisions` | D01 |
| Parent | Shell NOVA | Constitution §3 |
| Nature | Domaine documentaire | P37-MO-003 |
| Autorité | Aucune information complétée | Mission |

## Structure majeure

| Élément | Description | Source |
|---|---|---|
| Page header | All decisions et compte/urgence | D01 Screen 7; D03 Global |
| Filter tabs | All, Needs my decision/Pending, Waiting, History/Decided | D01; D03 |
| Decision list | GlobalDecisionCard[] | D03 |
| Decision card | Statement, deadline, confidence, outcome éventuel | D01 |
| NavRail | Entrée Decisions active | D03 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A07 | Retour depuis Package | ND |
| A11 | Filtres | CONFLIT |
| A30 | État filtre au retour | ND |

