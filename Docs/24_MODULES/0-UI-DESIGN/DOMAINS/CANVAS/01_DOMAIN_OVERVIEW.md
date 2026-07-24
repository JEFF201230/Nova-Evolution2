# CANVAS — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Présenter la compréhension synthétisée par NOVA et permettre sa correction avant le plan. [D01/D03; Constitution §3]

## Objectif utilisateur

Vérifier que NOVA a correctement compris l’objectif. [D01]

## Périmètre

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/canvas` | D01 |
| Parent | Work Setup | Constitution §3 |
| Nature | Domaine documentaire; aucune implémentation | Mission P37-MO-003 |
| Captures | U01-U23 | D/U registry |

## Éléments majeurs

| Élément | Description | Source |
|---|---|---|
| Header | Back, NOVA label, heading et CTA | D01 Screen 3; D03 Canvas |
| Cards grid | Outcome, Audience, Success, Constraints, Assumptions, People | D01; D16 CANVAS_ITEMS |
| Card edit mode | Textarea locale par carte | D02 Flow 3; D11 Canvas |
| Warning | Assumptions incertaines | D01; D02 |
| Bottom CTA | Prepare a plan | D01; D11 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A01 | Version d’autorité | CONFLIT |
| A24 | Responsive navigation précise | ND |
| A25 | Valeurs dimensionnelles divergentes globales | CONFLIT |

