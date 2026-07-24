# WORK — PEOPLE — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Afficher les personnes et NOVA pouvant contribuer ou débloquer le Work. [D01/D03]

## Objectif utilisateur

Identifier qui peut agir, sa disponibilité et sa contribution. [D01]

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/work/:id (tab People)` | D01; A09 |
| Parent | WORK | Constitution §3.3 |
| Nature | Sous-domaine Work; tab local | D16 |
| Autorité | Aucune implémentation déduite | P37-MO-003 |

## Structure majeure

| Élément | Description | Source |
|---|---|---|
| People header | Titre et Invite | D03 WorkPeople; U15 |
| Person list | Sarah, NOVA, Thomas, Marie dans capture | U15 |
| PersonCard | Avatar, name, role, availability, contribution, Details | D03; U15 |
| NOVA reasoning | Seulement si novaState non nul | D18; U15 |
| Person Drawer | Détail humain/NOVA | D10 Drawer 3; U11-U14 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail non visible U15 et 56/220 | CONFLIT/ND |
| A14 | Escape/focus drawer | ND |
| A18 | Invite | ND |
| A25 | Dimensions drawer | CONFLIT |
| A30 | État au retour | ND |

