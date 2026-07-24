# WORK — ACTIVITY — Domain Overview

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** Constitution → ARCHITECTURE → SOURCE → UX. ND et CONFLIT sont conservés.

## Rôle fonctionnel

Présenter la timeline narrative du Work et ses vues filtrées. [D01/D03]

## Objectif utilisateur

Comprendre ce qui a changé, par qui et avec quel impact. [D01]

| Attribut | Valeur | Preuve |
|---|---|---|
| Route | `/work/:id (tab Activity)` | D01; A09 |
| Parent | WORK | Constitution §3.3 |
| Nature | Sous-domaine Work; tab local | D16 |
| Autorité | Aucune implémentation déduite | P37-MO-003 |

## Structure majeure

| Élément | Description | Source |
|---|---|---|
| Work shell | Header et tabs | D03; U06-U10 |
| Filter row | All, Human, AI, Critical, Sources | D02 Flow 7; U06-U10 |
| Event list | ActivityEvent narratif | D03; D04 ActivityEvent |
| NOVA box | Impact, delta, why, sources selon event | D18 Pitfall Activity |
| Comment composer | Textarea et Post | D02; U06-U10 |

## ND et CONFLIT

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A18 | Post placeholder | ND |
| A27 | Chrome Figma | Artefact |
| A30 | État filtre au retour | ND |

