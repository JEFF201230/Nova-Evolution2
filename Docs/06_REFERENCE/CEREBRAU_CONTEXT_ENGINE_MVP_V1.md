# CEREBRAU Context Engine MVP V1

## 1. Vision

Le CEREBRAU Context Engine MVP V1 est la couche officielle de reconstruction automatique du contexte projet VEEDDA. Sa finalite est de permettre a ChatGPT de reprendre une session de travail avec une comprehension factuelle du projet, sans dependance a la memoire conversationnelle.

Le moteur ne constitue pas un Runtime complet, ne remplace pas le Knowledge Runtime et ne prend aucune decision metier. Il orchestre uniquement les Context Providers officiels, agrège leurs resultats et produit un etat projet unique, exploitable au demarrage d'une session.

## 2. Objectifs

Les objectifs de la V1 sont les suivants :

- reconstruire automatiquement le contexte courant de VEEDDA ;
- centraliser l'orchestration des 10 Context Providers officiels ;
- exposer une fonction d'entree unique, `reconstructContext()` ;
- produire un objet unique `CerebrauProjectState` ;
- conserver les donnees produites par les Providers sans les modifier ;
- poursuivre la reconstruction meme si un Provider echoue ;
- rendre visibles les alertes et les sources absentes ;
- fournir une base stable avant le demarrage de la V2.

## 3. Architecture générale

Schema complet du Context Engine MVP V1 :

```text
ChatGPT
  |
  | appelle
  v
reconstructContext(options)
  |
  v
CerebrauContextEngineService
  |
  | orchestre dans l'ordre COS-200
  v
+----------------------+---------------------------+
| Provider             | Responsabilite            |
+----------------------+---------------------------+
| Project Provider     | Projet et chantier        |
| Program Provider     | PROGRAM actif             |
| Epic Provider        | EPIC actif                |
| Lot Provider         | LOT actif                 |
| Knowledge Provider   | Sources et Knowledge Index|
| Architecture Provider| Architecture applicable   |
| Decision Provider    | Decisions applicables     |
| Agent Provider       | Agents concernes          |
| Git Provider         | Commits significatifs     |
| Component Provider   | Composants concernes      |
+----------------------+---------------------------+
  |
  | retourne ContextProviderResult<TData>
  v
Agrégation sans décision
  |
  v
CerebrauProjectState
```

Le moteur lit uniquement les resultats des Providers. Toute lecture documentaire, interrogation Git ou interpretation des sources reste encapsulee dans les Providers.

## 4. Contrat officiel des Context Providers

Le contrat officiel est unique pour tous les Providers :

```text
ContextProvider<TData>
  name: ContextProviderName
  provide(options: ContextProviderOptions): ContextProviderResult<TData> | Promise<ContextProviderResult<TData>>

ContextProviderResult<TData>
  providerName: ContextProviderName
  status: ContextProviderStatus
  sources: ContextProviderSource[]
  warnings: ContextProviderAlert[]
  errors: ContextProviderAlert[]
  metadata: TData
```

Les statuts autorises sont :

- `AVAILABLE` ;
- `PARTIAL` ;
- `ABSENT` ;
- `ERROR`.

Un Provider ne possede aucune logique d'orchestration. Il lit ses sources officielles, normalise ses donnees et retourne son resultat dans le contrat commun.

## 5. Liste des 10 Context Providers

### Project Provider

- role : restituer le cadre projet VEEDDA.
- responsabilite : identifier le nom du projet, le systeme documentaire, le chantier actif et les contraintes de contexte.
- sources : `01_CORE/VISION.md`, `01_CORE/DEVELOPMENT_ARCHITECTURE.md`.
- donnees produites : `ProjectContextData`.

### Program Provider

- role : restituer le PROGRAM actif.
- responsabilite : lire le registre PROGRAM et normaliser les programmes disponibles.
- sources : `02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md`.
- donnees produites : `ProgramContextData`.

### Epic Provider

- role : restituer l'EPIC actif ou documente.
- responsabilite : lire les documents EPIC et les references EPIC issues du registre PROGRAM.
- sources : `02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md`, `02_PROJECT_MANAGEMENT/EPIC_REGISTER.md`, documents `EPIC-*.md`.
- donnees produites : `EpicContextData`.

### Lot Provider

- role : restituer le LOT actif.
- responsabilite : lire le registre LOT et les documents `COS-*.md`, puis normaliser le lot courant.
- sources : `02_PROJECT_MANAGEMENT/LOT_REGISTER.md`, documents `COS-*.md`.
- donnees produites : `LotContextData`.

### Knowledge Provider

- role : restituer les sources de connaissance officielles.
- responsabilite : lire les documents d'autorite et le Knowledge Index physique.
- sources : `MASTER_EXECUTION_SPECIFICATION.md`, `04_WORKFLOWS`, `05_RULES`, `06_REFERENCE`, Knowledge Index.
- donnees produites : `KnowledgeContextData`.

### Architecture Provider

- role : restituer l'architecture applicable.
- responsabilite : extraire les principes, contraintes et elements de compatibilite d'architecture.
- sources : `01_CORE/DEVELOPMENT_ARCHITECTURE.md`.
- donnees produites : `ArchitectureContextData`.

### Decision Provider

- role : restituer les decisions applicables.
- responsabilite : lire les sources decisionnelles autorisees et signaler l'absence de decision explicite.
- sources : `05_RULES/KNOWLEDGE_GOVERNANCE.md`, `02_PROJECT_MANAGEMENT/DECISION_REGISTER.md`, `06_REFERENCE/KNOWLEDGE_INDEX_BY_DECISION.md`, LOT courant.
- donnees produites : `DecisionContextData`.

### Agent Provider

- role : restituer les agents IA concernes.
- responsabilite : lire la bibliotheque des agents et normaliser les fiches disponibles.
- sources : `03_AGENTS/README.md`, fichiers `*_AGENT.md`.
- donnees produites : `AgentContextData`.

### Git Provider

- role : restituer les derniers commits significatifs.
- responsabilite : lire l'historique Git local sans modifier le depot.
- sources : `.git`.
- donnees produites : `GitContextData`.

### Component Provider

- role : restituer les composants concernes.
- responsabilite : identifier les composants depuis le Knowledge Index et le LOT courant.
- sources : Knowledge Index, `KNOWLEDGE_INDEX_BY_MODULE.md`, `KNOWLEDGE_INDEX_RELATIONS.md`, LOT courant.
- donnees produites : `ComponentContextData`.

## 6. Fonction reconstructContext()

Signature officielle :

```text
reconstructContext(options?: ContextEngineOptions): Promise<CerebrauProjectState>
```

Fonctionnement :

- initialise un `CerebrauProjectState` complet ;
- orchestre les 10 Providers officiels ;
- transmet les options de contexte aux Providers ;
- agrège les `metadata` dans les sections correspondantes ;
- agrège les `warnings` et `errors` dans `alerts` ;
- transforme les sources non lues en `missingSources` ;
- renseigne `generatedAt` a la creation de l'etat ;
- poursuit l'orchestration si un Provider echoue.

Ordre d'orchestration COS-200 :

1. PROJECT
2. PROGRAM
3. EPIC
4. LOT
5. KNOWLEDGE
6. ARCHITECTURE
7. DECISION
8. AGENT
9. GIT
10. COMPONENT

## 7. CerebrauProjectState

`CerebrauProjectState` est l'objet unique retourne par le Context Engine V1.

Les 13 blocs produits sont :

- `project` : contexte projet produit par le Project Provider ;
- `workstream` : chantier actif extrait du contexte projet ;
- `program` : donnees PROGRAM produites par le Program Provider ;
- `epic` : donnees EPIC produites par le Epic Provider ;
- `lot` : donnees LOT produites par le Lot Provider ;
- `decisions` : decisions applicables produites par le Decision Provider ;
- `architecture` : principes et contraintes produits par le Architecture Provider ;
- `knowledge` : sources, index et documents d'autorite produits par le Knowledge Provider ;
- `git` : commits produits par le Git Provider ;
- `agents` : agents concernes produits par le Agent Provider ;
- `components` : composants concernes produits par le Component Provider ;
- `alerts` : alertes agregees depuis les Providers et erreurs d'execution ;
- `missingSources` : sources absentes ou illisibles signalees par les Providers.

Le champ `generatedAt` complete l'objet avec l'horodatage ISO de reconstruction. Il ne constitue pas un bloc fonctionnel, mais une metadonnee de generation.

## 8. Gestion des erreurs

En cas d'erreur d'un Provider, le Context Engine :

- ne stoppe pas la reconstruction ;
- ajoute une alerte `BLOCKING` dans `alerts` ;
- ajoute une entree dans `missingSources` ;
- laisse la section correspondante a `null` si aucune donnee n'a ete retournee ;
- poursuit l'execution des Providers suivants.

Le moteur ne tente pas de corriger, completer ou interpreter l'erreur. Il la rend visible dans l'etat projet.

## 9. Gestion des sources absentes

Chaque Provider retourne la liste des sources consultees avec un statut :

- `READ` ;
- `MISSING` ;
- `UNREADABLE`.

Le Context Engine transforme toute source dont le statut n'est pas `READ` en entree `missingSources`, avec :

- le Provider source ;
- le chemin de la source ;
- l'impact documentaire associe au role de la source.

Le moteur ne relit jamais directement une source absente.

## 10. Règles d'orchestration

Les regles d'orchestration V1 sont :

- le moteur orchestre uniquement les Providers officiels ;
- le moteur respecte l'ordre COS-200 ;
- chaque Provider est appele une seule fois par reconstruction ;
- le moteur ne lit aucun document directement ;
- le moteur ne modifie aucune source ;
- le moteur ne produit aucune decision metier ;
- le moteur n'execute aucune logique applicative VEEDDA ;
- le moteur agrège sans transformer les donnees metier des Providers ;
- le moteur reste tolerant aux erreurs unitaires de Provider.

## 11. Contrats d'architecture

La V1 respecte les contrats suivants :

- contrat unique `ContextProvider` ;
- contrat unique `ContextProviderResult<TData>` ;
- contrat unique `ContextProviderName` ;
- contrat unique `ContextProviderStatus` ;
- sortie unique `CerebrauProjectState` ;
- entree unique `reconstructContext()` ;
- separation stricte entre orchestration et lecture documentaire ;
- compatibilite avec PROGRAM, EPIC, LOT, Git, Knowledge Runtime et Bibliotheque officielle des Agents IA.

## 12. Tests

Etat valide de la V1 :

- 33 tests cibles passent ;
- la compilation TypeScript isolee du dossier `server/cerebrau-context` passe avec 0 erreur ;
- le contrat officiel des Context Providers est unique ;
- les tests verifient l'appel des 10 Providers ;
- les tests verifient l'ordre COS-200 ;
- les tests verifient la reconstruction complete de `CerebrauProjectState` ;
- les tests verifient la tolerance aux erreurs de Provider ;
- les tests verifient l'absence de logique metier applicative dans le Context Engine.

## 13. Performances observées

Les tests cibles observes sur la V1 s'executent en moins de quelques secondes dans l'environnement local. Les temps mesures lors des validations se situent autour d'une seconde pour l'ensemble des tests cibles.

La V1 ne comporte pas encore d'optimisation avancee. La performance depend principalement :

- du nombre de documents CEREBRAU lus par les Providers ;
- de la taille du Knowledge Index ;
- de l'acces a l'historique Git local ;
- du cout de parsing Markdown.

## 14. Limites du MVP

La V1 ne gere pas :

- l'authentification ;
- plusieurs projets ;
- plusieurs utilisateurs ;
- un serveur reseau generique ;
- la persistance des reconstructions ;
- le cache de resultats ;
- la resolution semantique avancee ;
- la priorisation dynamique des Providers ;
- l'execution multi-agent ;
- le remplacement du Knowledge Runtime.

Le MVP reste volontairement limite a une couche d'orchestration de contexte.

## 15. Ce qui sera développé en V2

La V2 pourra etendre la V1 avec :

- un mode serveur ou une interface d'appel standardisee ;
- une strategie de cache controlee ;
- une validation de schema de sortie ;
- une resolution plus fine du chantier actif ;
- une gestion multi-projets si elle devient necessaire ;
- une integration plus explicite avec les futurs agents orchestrateurs ;
- des controles de qualite automatises sur les sources ;
- une observation structuree des temps d'execution par Provider ;
- une politique de versionnement du `CerebrauProjectState`.

Ces evolutions devront conserver la separation stricte entre orchestration, Providers et Knowledge Runtime.

## 16. Conclusion

Le CEREBRAU Context Engine MVP V1 fournit le point d'entree officiel permettant de reconstruire automatiquement le contexte de VEEDDA au debut d'une session ChatGPT.

La V1 est centree sur un principe simple : les Providers lisent les sources officielles, le moteur orchestre et agrège, ChatGPT recoit un etat projet complet. Cette separation rend l'architecture robuste, testable et compatible avec les futures architectures multi-agents de CEREBRAU OS.
