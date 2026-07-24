# WORK — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Fournir le contexte central d’un Work actif et porter sept sous-domaines persistants. [D01/D03; Constitution §3]

## Objectif utilisateur

Répondre à « Where is this work and what should I do next? ». [D01]

## Périmètre

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/work/:id` | D01 |
| Parent | Shell NOVA | Constitution §3 |
| Nature | Domaine documentaire; aucune implémentation | Mission P37-MO-003 |
| Captures | U05-U10,U16-U18,U22-U23; D03; U05-U10,U16-U18,U22-U23 | D/U registry |

## Éléments majeurs

| Élément | Description | Source |
|---|---|---|
| WorkBreadcrumb | Contexte et retour documenté vers Home | D03 Work Breadcrumb; A29 |
| WorkHeader | Confiance, phase, échéance, titre, Pause, More | D01 Screen 6; D03 Work |
| WorkTabs | Overview, Plan, Activity, People, Sources, Decisions, Deliverables | D01; U05-U10,U16-U18,U22-U23 |
| TabContent | Sous-domaine actif et scrollable | D03 Work |
| NavRail | Shell primaire visible dans captures | D03; U05-U10,U16-U18,U22-U23 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A08 | Work sans activeWork | ND |
| A09 | Sous-routes des tabs | ND |
| A10 | Work Plan | CONFLIT |
| A16 | Pause/More | ND |
| A29 | Breadcrumb Work vers Home | DOC |
| A30 | État conservé au retour | ND |

