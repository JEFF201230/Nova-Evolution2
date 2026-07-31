# PROGRAM BFF — MASTER ROADMAP

Statut du document : `CANONICAL`  
Certification documentaire : `NOT_CERTIFIED`  
Version : `1.1`  
Date d'initialisation : `2026-07-29`

## 1. Autorité documentaire

Ce document est la source canonique de la roadmap du programme BFF.

Il est établi uniquement à partir :

- des spécifications BFF enregistrées pour les LOT002 et LOT003 ;
- des rapports d'implémentation des LOT001 à LOT004 ;
- des rapports GO / NO GO des LOT001 à LOT004.

Une information absente des documents de référence est marquée `UNKNOWN`.
Aucun lot postérieur au LOT004 n'est déclaré par la présente version.

## 2. Roadmap officielle

### LOT001

| Champ | Valeur démontrée |
|---|---|
| Numéro officiel | `LOT001` |
| Nom officiel | `SECURITY FOUNDATION` |
| Statut | `READY` |
| Objectif | Mettre en place le service `nova-secure-bff`, son pipeline de sécurité, ses sessions serveur et ses endpoints techniques, sans route métier ni raccordement Runtime ou React. |
| Prérequis | `UNKNOWN` |
| Successeur | `LOT002` — démontré par le prérequis explicite du LOT002 : `BFF_LOT_001_READY`. |
| Documents de référence | Spécification : `UNKNOWN`; implémentation : `PROGRAM_BFF_LOT_001_IMPLEMENTATION_REPORT.md`; décision : `PROGRAM_BFF_LOT_001_GO_NO_GO.md` |
| Décision GO / NO GO | `BFF_LOT_001_READY` |

### LOT002

| Champ | Valeur démontrée |
|---|---|
| Numéro officiel | `LOT002` |
| Nom officiel | `SESSION AND IDENTITY` |
| Statut | `READY` |
| Objectif | Ajouter l'identité utilisateur serveur, le login, le logout, la lecture de session authentifiée, la politique de session et le RBAC documenté, sans raccordement Runtime ou React. |
| Prérequis | `BFF_LOT_001_READY` |
| Successeur | `LOT003` — démontré par le prérequis explicite du LOT003 : `BFF_LOT_002_READY`. |
| Documents de référence | Spécification : `tools/nova-core-runtime/PROGRAM_BFF_LOT_002_SESSION_IDENTITY_PROMPT.md`; implémentation : `PROGRAM_BFF_LOT_002_IMPLEMENTATION_REPORT.md`; décision : `PROGRAM_BFF_LOT_002_GO_NO_GO.md` |
| Décision GO / NO GO | `BFF_LOT_002_READY` |

### LOT003

| Champ | Valeur démontrée |
|---|---|
| Numéro officiel | `LOT003` |
| Nom officiel | `RUNTIME GATEWAY` |
| Statut | `READY` |
| Objectif | Implémenter le Gateway interne entre le Secure BFF et `ProgramProductionEntrypoint`, sans nouvelle route publique et sans accès Runtime depuis React. |
| Prérequis | `BFF_LOT_002_READY` |
| Successeur | `LOT004` — le LOT004 utilise exclusivement le `RuntimeGatewayPort` livré et validé au LOT003. |
| Documents de référence | Spécification : `tools/nova-core-runtime/PROGRAM_BFF_LOT_003_RUNTIME_GATEWAY_PROMPT.md`; implémentation : `PROGRAM_BFF_LOT_003_IMPLEMENTATION_REPORT.md`; décision : `PROGRAM_BFF_LOT_003_GO_NO_GO.md` |
| Décision GO / NO GO | `BFF_LOT_003_READY` |

### LOT004

| Champ | Valeur démontrée |
|---|---|
| Numéro officiel | `LOT004` |
| Nom officiel | `RUNTIME API SÉCURISÉE` |
| Statut | `READY` |
| Objectif | Exposer la route métier sécurisée unique `POST /api/runtime/execute`, avec authentification, CSRF, validation stricte et accès Runtime exclusivement par `RuntimeGatewayPort`. |
| Prérequis | `BFF_LOT_003_READY` — le Gateway du LOT003 doit être livré et validé pour constituer l'unique accès Runtime du LOT004. |
| Successeur | `UNKNOWN` |
| Documents de référence | Spécification : `UNKNOWN`; implémentation : `PROGRAM_BFF_LOT_004_IMPLEMENTATION_REPORT.md`; décision : `PROGRAM_BFF_LOT_004_GO_NO_GO.md` |
| Décision GO / NO GO | `BFF_LOT_004_READY` |

## 3. Continuité et cohérence

| Contrôle | Résultat |
|---|---|
| Continuité des lots identifiés | `PASS` — LOT001, LOT002, LOT003 et LOT004 sont documentés sans rupture numérique. |
| Prérequis LOT002 | `PASS` — dépend de `BFF_LOT_001_READY`. |
| Prérequis LOT003 | `PASS` — dépend de `BFF_LOT_002_READY`. |
| Prérequis LOT004 | `PASS` — dépend du Runtime Gateway livré et validé au LOT003. |
| Décisions GO / NO GO | `PASS` — chaque lot identifié possède une décision `BFF_LOT_00X_READY`. |
| Contradiction entre les décisions | `NONE_DETECTED` |
| Spécification LOT001 | `FAIL` — référence `UNKNOWN`. |
| Spécification LOT004 | `FAIL` — référence `UNKNOWN`. |
| Formulation du prérequis LOT003 | `FAIL` — la spécification nomme LOT002 comme « lot suivant » dans la section `PRÉREQUIS`; les rapports LOT003 le traitent comme lot précédent requis. |
| Successeur du LOT004 | `UNKNOWN` |
| Fin officielle du programme après LOT004 | `UNKNOWN` |
| Certification documentaire | `NOT_CERTIFIED` |

## 4. Prochain lot

| Champ | Valeur |
|---|---|
| Numéro officiel | `UNKNOWN` |
| Nom officiel | `UNKNOWN` |
| Statut | `UNKNOWN` |
| Objectif | `UNKNOWN` |
| Prérequis | `UNKNOWN` |
| Documents de référence | `UNKNOWN` |
| Décision GO / NO GO | `UNKNOWN` |

`LOT005` n'est pas déclaré officiellement par les documents de référence
analysés. Une spécification officielle est requise avant toute ouverture ou
implémentation d'un nouveau lot.

## 5. Historique

| Date | Version | Décision |
|---|---|---|
| 2026-07-29 | 1.0 | Initialisation canonique à partir des preuves documentaires LOT001 à LOT004. La mention illustrative non étayée d'un LOT005 a été retirée. |
| 2026-07-29 | 1.1 | Audit de cohérence : spécifications LOT001/LOT004 absentes, formulation LOT003 incohérente et absence de successeur ou de fin officielle après LOT004. Certification documentaire refusée. |
