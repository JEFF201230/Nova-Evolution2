# WORK — SOURCES — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Présenter couverture, fraîcheur, statut et évaluation NOVA des sources du Work. [D01/D03]

## Objectif utilisateur

Savoir quelles sources sont disponibles, obsolètes, manquantes ou en conflit. [D01]

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/work/:id (tab Sources)` | D01; A09 |
| Parent | WORK | Constitution §3.3 |
| Nature | Sous-domaine Work; tab local | D16 |
| Autorité | Aucune implémentation déduite | P37-MO-003 |

## Structure majeure

| Élément | Description | Source |
|---|---|---|
| Sources header | Titre, validating state et Add | D03; U17 |
| Counter strip | available/stale/missing/conflict et coverage | D03; U17 |
| Source list | Status-sorted SourceCards | D02 Flow 9; U17 |
| Source actions | Add/Refresh et Details | D02; U17 |
| Source Drawer | Assessment, evidence et history | D10 Drawer 4; U16 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A14 | Escape/focus drawer | ND |
| A18 | Add/Refresh | ND |
| A25 | Dimensions drawer | CONFLIT |
| A30 | État au retour | ND |

