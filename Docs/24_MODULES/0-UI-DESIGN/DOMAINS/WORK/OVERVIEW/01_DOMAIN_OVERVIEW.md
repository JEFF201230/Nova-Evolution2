# WORK — OVERVIEW — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Synthétiser la situation du Work, mettre en avant la prochaine action et exposer les décisions en attente. [D01/D03]

## Objectif utilisateur

Comprendre où en est le Work et quelle action doit être traitée maintenant. [D01]

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/work/:id (tab Overview)` | D01; A09 |
| Parent | WORK | Constitution §3.3 |
| Nature | Sous-domaine Work; tab local | D16 |
| Autorité | Aucune implémentation déduite | P37-MO-003 |

## Structure majeure

| Élément | Description | Source |
|---|---|---|
| Work shell | Breadcrumb, header et sept tabs persistants | D03 Work |
| Hero situation | Situation courante | D03 WorkOverview |
| Next Best Action | Carte focale avec Open et Why | D02 Flow 6; D03 |
| Later & Background | Disclosure natif | D02; D11 |
| Pending decisions | DecisionCards | D02; D03 |
| Progress sidebar | Health bars et Full analysis | D03; D10 Drawer 2 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A18 | Open placeholder | ND |
| A25 | Dimensions | CONFLIT |
| A30 | État au retour | ND |

