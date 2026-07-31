# NOVA Core — Mission Preparation Engine MVP — Implementation Plan

## 1. Identification

| Champ | Valeur |
|---|---|
| Mission | `NOVA_CORE_MISSION_PREPARATION_ENGINE_MVP_001` |
| WAVE courante | `WAVE-001` |
| Programme | `NOVA CORE KNOWLEDGE EVOLUTION` |
| Capacité | `MISSION PREPARATION ENGINE` |
| Epic | `NOVA KNOWLEDGE RUNTIME` |
| Feature | `FEATURE-001 — Mission Preparation Engine MVP` |
| Mode courant | `READ_ONLY` |
| Autorité | `PROGRAM DIRECTOR` |
| Statut du document | `PLAN — aucun développement autorisé par cette WAVE` |

## 2. Objet

Ce plan décrit les WAVE de développement nécessaires après la fondation de connaissance.

Il ne constitue pas une autorisation de développement. Chaque WAVE future devra disposer :

- d'une mission d'écriture explicite ;
- de chemins de création et de modification autorisés ;
- d'un état initial validé depuis `knowledge-index.json` ;
- d'un Gate d'entrée ;
- d'une validation ciblée ;
- d'une preuve que le Feature Flag désactivé conserve le Runtime à l'identique.

## 3. Périmètre de WAVE-001

### 3.1 Fichier lu

| Fichier | Justification |
|---|---|
| `ARCHITECTURE/knowledge-index.json` | Point d'entrée unique exigé pour vérifier et compléter les métadonnées de l'index. |

Aucun document source NOVA, CEREBRAU, UX, domaine ou Design V7 n'a été ouvert pendant cette reprise de `WAVE-001`.

### 3.2 Fichiers réutilisés

| Fichier | Réutilisation |
|---|---|
| `ARCHITECTURE/knowledge-index.json` | Étendu uniquement par une section `DOCUMENTS` normalisée. |
| `ARCHITECTURE/REUSE_REPORT.md` | Conservé comme inventaire de réutilisation de la WAVE. |

### 3.3 Fichiers créés

| Fichier | Justification |
|---|---|
| `ARCHITECTURE/IMPLEMENTATION_PLAN.md` | Livrable obligatoire décrivant précisément les WAVE futures avant tout développement. |

### 3.4 Fichiers modifiés

| Fichier | Modification | Nature |
|---|---|---|
| `ARCHITECTURE/knowledge-index.json` | Ajout des métadonnées documentaires `domain`, `authority`, `type`, `dependencies`, `sourceRoot`, `path`. | Documentation JSON uniquement. |

### 3.5 Fichiers volontairement non modifiés

- Kernel ;
- Runtime ;
- orchestrateur ;
- Scheduler ;
- monitoring ;
- journalisation ;
- events ;
- certification ;
- API publiques ;
- contrats existants ;
- composants UX ;
- sources CEREBRAU ;
- PDS et WAVE existantes.

## 4. Architecture de développement planifiée

```text
Mission Intake existant
  → [Feature Flag]
  → knowledge-index.json
  → CerebrauKnowledgeAdapter
  → NovaUxKnowledgeAdapter
  → Authority Resolver
  → PROGRAM Knowledge Resolver
  → UX Knowledge Resolver
  → Mission Context Builder
  → Mission Brief Builder
  → RuntimeExecutionHandler existant
  → Codex
```

Principes invariants :

1. les adaptateurs lisent ou traduisent ; ils ne décident pas ;
2. les Resolvers sélectionnent des métadonnées indexées ; ils ne parcourent pas les SOURCE_ROOT ;
3. les Builders composent les résultats ; ils ne lisent aucun document ;
4. l'appel à Codex réutilise le point d'exécution existant ;
5. le Feature Flag désactivé contourne intégralement la préparation ;
6. aucun moteur CEREBRAU n'est copié ou recréé ;
7. aucun contrat public NOVA n'est modifié.

## 5. LOT-02 — ADAPTERS

### WAVE-03 — CerebrauKnowledgeAdapter

**Objectif**

Créer uniquement une façade de traduction entre les métadonnées CEREBRAU indexées et un résultat de Provider compatible avec la préparation NOVA.

**Entrées**

- section `DOCUMENTS` filtrée sur les domaines `KNOWLEDGE`, `AUTHORITY`, `PROGRAM_GOVERNANCE`, `MISSION_CONTEXT` et `MISSION_PREPARATION` ;
- sections `AUTHORITIES`, `PDS`, `PROGRAMS`, `MODULES` et `SERVICES` ;
- contrats indexés `ContextProvider<TData>` et `ContextProviderResult<TData>`.

**Sortie logique**

```text
CerebrauKnowledgeResult
  status: AVAILABLE | PARTIAL | ABSENT | ERROR
  sources: metadata references
  authorities: metadata references
  programReferences: metadata references
  warnings: explicit metadata only
  errors: explicit metadata only
```

**Interdictions**

- aucun scan de dossier ;
- aucune résolution d'autorité ;
- aucune reconstruction du Context Engine ;
- aucune lecture directe depuis un Builder ;
- aucune invention si une métadonnée manque.

**Tests ciblés**

- sélection déterministe ;
- statut `ABSENT` sur entrée inexistante ;
- statut `PARTIAL` sur dépendance absente ;
- rejet des doublons d'identifiants ;
- absence de contenu documentaire dans la sortie.

### WAVE-04 — NovaUxKnowledgeAdapter

**Objectif**

Créer uniquement une façade de traduction des métadonnées UX vers domaines, routes, dépendances et composants.

**Entrées**

- `DOMAINS` ;
- `ROUTES` ;
- `COMPONENTS.UX` ;
- documents indexés de type `INVENTORY`, `MATRIX`, `GRAPH` et `ARCHITECTURE` dans les domaines UX ;
- conflits connus enregistrés sous `UX.knownConflicts`.

**Sortie logique**

```text
NovaUxKnowledgeResult
  status: AVAILABLE | PARTIAL | ABSENT | ERROR
  domains
  routes
  components
  dependencies
  conflicts
  sourceMetadata
```

**Interdictions**

- aucun routeur parallèle ;
- aucune copie de `RouteRegistry` ;
- aucune ouverture automatique d'un dossier de domaine ;
- aucun accès au Design V7 sauf référence indexée explicitement sélectionnée.

**Tests ciblés**

- résolution route → domaine ;
- résolution domaine → routes ;
- déduplication des composants ;
- propagation des conflits connus ;
- ordre stable des résultats.

### Gate LOT-02

| Critère | Résultat requis |
|---|---|
| Compilation ciblée | `PASS` |
| Tests unitaires des deux adaptateurs | `PASS` |
| Scan global absent | `PASS` |
| Aucune modification Kernel/Runtime/CEREBRAU | `PASS` |
| Sorties limitées aux métadonnées | `PASS` |

## 6. LOT-03 — KNOWLEDGE ENGINE

### WAVE-05 — Authority Resolver

**Objectif**

Résoudre l'autorité applicable à partir de `AUTHORITIES` et des autorités portées par les documents indexés.

**Règles**

- priorité à la mission courante ;
- aucune autorité implicite ;
- conservation d'un conflit non résolu ;
- état final séparé : `RESOLVED`, `CONFLICT`, `ABSENT` ;
- aucune décision de certification.

**Sortie logique**

```text
AuthorityResolution
  status
  selectedAuthority
  candidates
  conflicts
  evidenceIds
```

### WAVE-06 — PROGRAM Knowledge Resolver

**Objectif**

Sélectionner uniquement les métadonnées nécessaires au PROGRAM de la mission.

**Entrées**

- mission ;
- résultat du `CerebrauKnowledgeAdapter` ;
- résultat de l'`Authority Resolver` ;
- sections `PROGRAMS`, `MODULES`, `PDS`, `WAVES`.

**Sortie logique**

```text
ProgramKnowledgeResolution
  program
  authority
  pds
  currentLot
  currentWave
  requiredDocumentIds
  serviceIds
  missingMetadata
```

Toute donnée « dernière décision », « dernière Gate » ou « dernier LOT » absente de l'index reste `ABSENT`.

### WAVE-07 — UX Knowledge Resolver

**Objectif**

Sélectionner les domaines, routes et composants UX strictement nécessaires à la mission.

**Entrées**

- mission ;
- résultat du `NovaUxKnowledgeAdapter` ;
- `queryMap` de l'index.

**Sortie logique**

```text
UxKnowledgeResolution
  domains
  routes
  components
  dependencyDocumentIds
  conflicts
  missingMetadata
```

### Gate LOT-03

Chaque Resolver doit fonctionner sans les deux autres.

| Test | Résultat requis |
|---|---|
| Authority Resolver isolé | `PASS` |
| PROGRAM Knowledge Resolver isolé | `PASS` |
| UX Knowledge Resolver isolé | `PASS` |
| Entrées immuables | `PASS` |
| Sorties déterministes | `PASS` |
| Aucune lecture documentaire directe | `PASS` |

## 7. LOT-04 — CONTEXT

### WAVE-08 — Mission Context Builder

**Objectif**

Composer un contexte unique à partir de résultats déjà résolus.

**Entrées**

- mission normalisée ;
- `AuthorityResolution` ;
- `ProgramKnowledgeResolution` ;
- `UxKnowledgeResolution`.

**Sortie logique obligatoire**

```text
MissionContext
  program
  mission
  latestDecision
  latestGate
  latestLot
  mandatoryDocumentIds
  routes
  domains
  services
  components
  prohibitions
  passCriteria
  missingMetadata
```

**Invariants**

- aucune lecture de fichier ;
- aucun appel à Codex ;
- aucune décision ;
- aucune transformation d'une valeur `ABSENT` en valeur supposée ;
- uniquement des identifiants, chemins et métadonnées nécessaires.

### WAVE-09 — Mission Brief Builder

**Objectif**

Projeter `MissionContext` en brief compact destiné à Codex.

**Contenu maximal**

- identité et objectif ;
- autorité résolue ;
- scope autorisé et interdit ;
- références obligatoires ;
- composants à réutiliser ;
- livrables ;
- critères PASS ;
- métadonnées manquantes ou conflictuelles.

**Optimisation tokens**

- pas de contenu documentaire embarqué ;
- pas de duplication entre contexte et brief ;
- références par ID et chemin ;
- sections vides omises sauf `missingMetadata` ;
- ordre stable pour favoriser le cache et les tests snapshot.

### Gate LOT-04

```text
Mission
  → Resolvers
  → MissionContext
  → MissionBrief
```

Tests requis :

- contexte complet ;
- métadonnée optionnelle absente ;
- autorité en conflit ;
- mission UX uniquement ;
- mission PROGRAM uniquement ;
- brief sans contenu source ;
- résultat déterministe.

## 8. LOT-05 — INTEGRATION

### WAVE-10 — Intégration de la préparation

**Branchement planifié**

```text
Mission Intake
  → Feature Flag
  → Knowledge Index
  → Adapters
  → Resolvers
  → Context
  → Brief
```

**Feature Flag proposé**

`NOVA_MISSION_PREPARATION_ENABLED`

Le nom définitif et son emplacement devront être confirmés par la mission d'écriture.

**Comportement obligatoire**

| Flag | Comportement |
|---|---|
| `OFF` ou absent | Chemin Runtime actuel strictement inchangé ; aucun adaptateur, Resolver ou Builder appelé. |
| `ON` | Préparation exécutée avant l'appel existant à Codex. |

### WAVE-11 — Brief vers Codex

**Objectif**

Transmettre le brief au point d'exécution existant, sans nouvelle API publique.

**Réutilisation**

- `RuntimeExecutionHandler` ;
- `MissionDefinition` ;
- `RuntimeContext` ;
- contrat Mission Builder CEREBRAU.

**Interdictions**

- aucun client Codex parallèle ;
- aucune modification de Scheduler ;
- aucune modification des events ;
- aucune nouvelle journalisation ;
- aucune certification automatique.

### Gate LOT-05

| Critère | Résultat requis |
|---|---|
| Flag `OFF` : tests de régression existants | `PASS` |
| Flag `ON` : mission → brief → handler | `PASS` |
| API publiques inchangées | `PASS` |
| Runtime, Scheduler et monitoring inchangés | `PASS` |
| Erreur de préparation fail-closed avant Codex | `PASS` |

## 9. LOT-06 — VALIDATION

### WAVE-12 — KNOWLEDGE_MAP.json

Produire une vue de relations dérivée de `knowledge-index.json` :

- PROGRAM → WAVE ;
- document → dépendances ;
- route → domaine ;
- service → module ;
- composant → source ;
- autorité → périmètre.

Le fichier doit rester dérivé, sans contenu documentaire.

### WAVE-13 — Tests

Pyramide minimale :

1. tests unitaires des adaptateurs ;
2. tests unitaires isolés des trois Resolvers ;
3. tests des deux Builders ;
4. test d'intégration mission → brief ;
5. test d'intégration brief → handler Codex ;
6. tests Feature Flag `OFF` ;
7. compilation ;
8. contrôle de format et de dépendances de l'index ;
9. contrôle de l'absence de contenu documentaire dans les artefacts.

### WAVE-14 — Certification

La certification doit réutiliser le mécanisme existant et ne pas créer de nouveau moteur.

Preuves minimales :

- résultats de compilation ;
- résultats de tests ;
- matrice de traçabilité WAVE → test → preuve ;
- preuve Flag `OFF` ;
- preuve d'absence de modification des contrats publics ;
- contrôle des fichiers modifiés ;
- `git diff --check` dans une mission autorisant l'accès Git ;
- décision humaine finale.

## 10. Dépendances entre WAVE

| WAVE | Dépend de | Condition de sortie |
|---|---|---|
| `WAVE-03` | `WAVE-001` | Adapter CEREBRAU testé isolément. |
| `WAVE-04` | `WAVE-001` | Adapter UX testé isolément. |
| `WAVE-05` | `WAVE-03` | Autorité résolue ou conflit explicite. |
| `WAVE-06` | `WAVE-03`, `WAVE-05` | Sélection PROGRAM déterministe. |
| `WAVE-07` | `WAVE-04` | Sélection UX déterministe. |
| `WAVE-08` | `WAVE-05`, `WAVE-06`, `WAVE-07` | MissionContext valide. |
| `WAVE-09` | `WAVE-08` | MissionBrief compact valide. |
| `WAVE-10` | `WAVE-09` | Pipeline sous Feature Flag. |
| `WAVE-11` | `WAVE-10` | Brief transmis au handler existant. |
| `WAVE-12` | `WAVE-001` à `WAVE-11` | Graphe de connaissance dérivé. |
| `WAVE-13` | `WAVE-12` | Compilation et tests complets PASS. |
| `WAVE-14` | `WAVE-13` | Dossier de preuves prêt pour décision humaine. |

## 11. Fichiers logiques futurs

Les composants logiques autorisés par le programme sont :

- `CerebrauKnowledgeAdapter` et son test ;
- `NovaUxKnowledgeAdapter` et son test ;
- `AuthorityResolver` et son test ;
- `ProgramKnowledgeResolver` et son test ;
- `UxKnowledgeResolver` et son test ;
- `MissionContextBuilder` et son test ;
- `MissionBriefBuilder` et son test ;
- composition d'intégration sous Feature Flag et son test ;
- `KNOWLEDGE_MAP.json`.

Les chemins physiques ne sont pas définis dans cette WAVE. Ils devront être choisis depuis l'architecture indexée et explicitement autorisés avant toute création. Cette absence n'autorise pas une recherche hors SOURCE_ROOT.

## 12. Estimation d'impact

| Zone | Impact prévu | Commentaire |
|---|---|---|
| Kernel | Nul | Aucun changement autorisé. |
| Runtime existant, Flag `OFF` | Nul | Bypass obligatoire. |
| Runtime existant, Flag `ON` | Faible et localisé | Une étape de préparation avant le handler existant. |
| Contrats publics | Nul | Réutilisation des contrats existants. |
| CEREBRAU | Nul | Adaptation en lecture, aucune modification. |
| UX | Nul | Métadonnées seulement, aucune nouvelle surface requise. |
| Tokens | Réduction attendue élevée | Index et résolutions ciblées avant toute référence détaillée. |
| Tests | Impact modéré | Tests unitaires nouveaux et régression Flag `OFF`. |

## 13. Estimation des risques

| Risque | Niveau | Réduction prévue |
|---|---|---|
| Réinvention du Knowledge Engine | Élevé | Adaptateur limité à la traduction de métadonnées. |
| Lecture documentaire excessive | Élevé | Builders sans I/O, sélection via `queryMap`. |
| Régression Runtime | Élevé | Feature Flag `OFF` et tests de non-régression obligatoires. |
| Autorité ambiguë | Élevé | État `CONFLICT`, arrêt sans décision implicite. |
| Contrat public modifié | Élevé | Composition externe, aucune extension publique. |
| Divergence routes/domaines | Moyen | `RouteRegistry` et matrices indexées comme autorités. |
| Brief trop volumineux | Moyen | IDs et chemins uniquement, pas de contenu source. |
| Métadonnée absente | Faible | `ABSENT`/`PARTIAL`, jamais d'invention. |

## 14. Critères d'entrée en développement

Le développement peut commencer uniquement si :

- les trois livrables de `WAVE-001` sont validés ;
- le Program Director rend une décision `GO` explicite ;
- une nouvelle mission passe en mode écriture ;
- les chemins de code autorisés sont déclarés ;
- le Feature Flag et son emplacement sont confirmés ;
- les commandes de compilation et de test sont autorisées ;
- l'état initial du code est établi sans sortir des frontières de la nouvelle mission.

## 15. Décision de WAVE-001

Ce document ne prononce pas la certification.

État proposé :

```text
KNOWLEDGE FOUNDATION = READY_FOR_VALIDATION
DEVELOPMENT = NOT_STARTED
SOURCE CODE CHANGES = NONE
```
