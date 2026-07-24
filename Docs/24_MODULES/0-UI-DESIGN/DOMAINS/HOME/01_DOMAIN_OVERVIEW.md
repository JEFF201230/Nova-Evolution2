# HOME — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Fournir la conscience de situation, le point d’entrée de création d’un Work et l’accès aux urgences. [D01/D03; Constitution §3]

## Objectif utilisateur

Répondre à « What do I need to do right now? » et permettre de démarrer ou reprendre un travail. [D01]

## Périmètre

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/home` | D01 |
| Parent | Shell NOVA | Constitution §3 |
| Nature | Domaine documentaire; aucune implémentation | Mission P37-MO-003 |
| Captures | Constitution A13; I012 | D/U registry |

## Éléments majeurs

| Élément | Description | Source |
|---|---|---|
| Page header | Greeting et sous-caption avec compteurs | D01 Screen 1; D03 Home |
| Composer | États replié/développé, objectif, suggestions et CTA | D01; D02 Flow 1; D11 Home |
| Hero situation | Point focal NOVA avec Open presentation, Why et Details | D01; D03; D22 |
| Decision card | Décision urgente ouvrant Decision Package | D01; D11 |
| Active work list | Lignes compactes ouvrant le Work sélectionné | D01; D11 |
| NOVA background strip | Statut, temps gagné et Details | D01; D10; D11 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A01 | Docs V6.1 contre captures V7 | CONFLIT |
| A04 | NavRail 56/220 | CONFLIT |
| A13 | Drawer Home sans capture imposée | DOC sans UX |
| A25 | Dimensions overlays divergentes | CONFLIT |

