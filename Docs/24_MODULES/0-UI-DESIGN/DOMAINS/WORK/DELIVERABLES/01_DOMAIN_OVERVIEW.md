# WORK — DELIVERABLES — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Afficher la readiness des livrables liés au Work et leur détail. [D01/D03]

## Objectif utilisateur

Savoir quels livrables sont prêts, bloqués ou nécessitent une action. [D01]

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/work/:id (tab Deliverables)` | D01; A09 |
| Parent | WORK | Constitution §3.3 |
| Nature | Sous-domaine Work; tab local | D16 |
| Autorité | Aucune implémentation déduite | P37-MO-003 |

## Structure majeure

| Élément | Description | Source |
|---|---|---|
| Work shell | Header et tab Deliverables actif | D03; U22-U23 |
| Deliverables header | Titre et Create | U23 |
| Deliverable list | DeliverableCard[] | D03; U23 |
| Readiness | Progress bar, percentage, blocker, next action | D03; U23 |
| Actions | Eye et Details | D02 Flow 11; U23 |
| Deliverable Drawer | Summary à Technical details | D10 Drawer 5; U22 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A12 | Global Deliverables et drawer | ND |
| A14 | Escape/focus | ND |
| A18 | Create/Eye | ND |
| A25 | Drawer dimensions | CONFLIT |
| A28 | Dossier DELIVBERABLES | Ambiguïté |

