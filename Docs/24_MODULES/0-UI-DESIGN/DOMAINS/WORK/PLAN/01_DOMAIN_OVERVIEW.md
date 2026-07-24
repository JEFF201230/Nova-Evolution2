# WORK — PLAN — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Afficher l’avancement des phases du Work dans le shell Work. [D01/D03]

## Objectif utilisateur

Consulter les phases, leur état et leurs contributions dans le contexte du Work actif. [D01]

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/work/:id (tab Plan)` | D01; A09 |
| Parent | WORK | Constitution §3.3 |
| Nature | Sous-domaine Work; tab local | D16 |
| Autorité | Aucune implémentation déduite | P37-MO-003 |

## Structure majeure

| Élément | Description | Source |
|---|---|---|
| Work shell | Breadcrumb, header, tabs | D03 Work; U05 |
| Plan content | Liste de PhaseRows | D03 WorkPlan |
| Phase rows | Outcome, phase, probability, tasks/contributions selon sources | D01; D03; U05 |
| Status | complete/active/future | D06; D16 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A09 | URL du tab | ND |
| A10 | read-only/accordion | CONFLIT |
| A30 | État au retour | ND |

