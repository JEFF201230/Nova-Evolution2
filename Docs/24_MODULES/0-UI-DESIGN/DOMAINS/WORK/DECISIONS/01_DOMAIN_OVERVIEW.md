# WORK — DECISIONS — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Afficher les décisions liées au Work et faire converger celles nécessitant autorité vers Decision Package. [D01/D03]

## Objectif utilisateur

Identifier les décisions en attente et lancer leur revue. [D01]

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/work/:id (tab Decisions)` | D01; A09 |
| Parent | WORK | Constitution §3.3 |
| Nature | Sous-domaine Work; tab local | D16 |
| Autorité | Aucune implémentation déduite | P37-MO-003 |

## Structure majeure

| Élément | Description | Source |
|---|---|---|
| Work shell | Header et tab Decisions actif | D03; U18 |
| Decision list | DecisionCard[] | D03 WorkDecisions |
| Badge row | DeadlineBadge et ConfChip | D03; U18 |
| Recommendation | NOVA recommendation | D03; U18 |
| Consequences | If approved / If rejected | D03; U18 |
| CTA row | Review & decide et Why | D02 Flow 10; U18 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A07 | Retour du Package selon origine | ND |
| A27 | Chrome Figma | Artefact |
| A30 | État au retour | ND |

