# CEREBRAU Knowledge Index Storage

Version : 1.0

Statut : Reference

---

# 1. Objet

Le present document definit l'architecture physique permanente du referentiel documentaire CEREBRAU.

Il constitue la reference officielle de la couche de stockage du CEREBRAU Knowledge Index.

Il complete le modele documentaire defini dans `KNOWLEDGE_INDEX_SCHEMA.md` et le moteur logique defini dans `KNOWLEDGE_INDEX_ENGINE.md`.

Il ne modifie pas le modele documentaire.

Il ne modifie pas le moteur logique.

Il definit uniquement ou les connaissances, registres, index, metadonnees, references, legacy et archives doivent etre stockes.

---

# 2. Principes de stockage

Le stockage documentaire CEREBRAU repose sur les principes suivants :

- chaque document source reste lisible directement dans l'arborescence ;
- chaque registre permanent possede un emplacement stable ;
- chaque index physique possede un emplacement stable ;
- les metadonnees sont separees des documents sources ;
- les documents actifs sont separes des documents legacy et archives ;
- les chemins doivent rester explicites ;
- les noms doivent rester stables ;
- les futurs enrichissements ne doivent pas remettre en cause l'organisation physique.

La couche de stockage ne remplace pas le Knowledge Model.

La couche de stockage ne remplace pas le Knowledge Engine.

La couche de stockage fournit le socle physique permettant leur exploitation.

---

# 3. Organisation physique officielle

## 3.1 Racine CEREBRAU Operating System

La racine documentaire officielle est :

`Docs/09_CEREBRAU OPERATING SYSTEM/`

Cette racine contient les espaces permanents du CEREBRAU Operating System.

## 3.2 Espaces permanents

Les espaces permanents sont :

| Espace | Role |
|---|---|
| `01_CORE` | Documents de vision, mission, principes et fondation conceptuelle |
| `02_PROJECT_MANAGEMENT` | Lots, registres de pilotage, programmes, EPIC et suivi documentaire |
| `03_AGENTS` | Documents relatifs aux agents IA et a leurs perimetres |
| `04_WORKFLOWS` | Workflows documentaires et processus de coordination |
| `05_RULES` | Regles operationnelles ou doctrinales hors documents de gouvernance racine |
| `06_REFERENCE` | References transverses, schema, moteur, stockage et index du Knowledge Index |
| `99_ARCHIVES` | Documents sortis du flux actif et conserves pour historique |

Ces espaces constituent l'ossature physique stable du referentiel.

## 3.3 Espaces reserves

Les espaces reserves sont des emplacements dont l'existence stabilise la navigation future.

Ils ne doivent pas etre utilises pour stocker un document hors de leur role.

Les espaces reserves sont :

- `01_CORE` pour les fondations durables ;
- `02_PROJECT_MANAGEMENT` pour le pilotage ;
- `03_AGENTS` pour les specifications d'agents ;
- `04_WORKFLOWS` pour les parcours operationnels ;
- `05_RULES` pour les regles specialisees ;
- `06_REFERENCE` pour les references transverses ;
- `99_ARCHIVES` pour les documents archives.

Un espace reserve ne doit pas etre renomme sans decision explicite.

## 3.4 Registres

Les registres sont stockes dans `02_PROJECT_MANAGEMENT` lorsque leur fonction concerne le pilotage.

Les registres de reference transverse peuvent etre stockes dans `06_REFERENCE` lorsqu'ils servent directement le Knowledge Index.

Un registre ne doit pas etre duplique dans plusieurs espaces.

Un registre peut referencer des documents stockes dans plusieurs espaces.

## 3.5 Index

Les index physiques du Knowledge Index sont stockes dans `06_REFERENCE`.

Cette localisation garantit que les index restent separes :

- des documents sources ;
- des lots ;
- des programmes ;
- des archives ;
- des documents applicatifs.

## 3.6 Dossiers systeme

Les dossiers systeme documentaires sont les espaces dont le role soutient directement le fonctionnement du CEREBRAU Operating System.

Les dossiers systeme sont :

- `01_CORE` ;
- `02_PROJECT_MANAGEMENT` ;
- `03_AGENTS` ;
- `04_WORKFLOWS` ;
- `05_RULES` ;
- `06_REFERENCE` ;
- `99_ARCHIVES`.

Aucun dossier systeme ne doit contenir un document sans rapport avec son role.

---

# 4. Regles de stockage

## 4.1 Documents sources

Les documents sources sont stockes dans l'espace correspondant a leur fonction principale.

| Type de document | Emplacement physique |
|---|---|
| Vision, mission, principes | `01_CORE` |
| Lots | `02_PROJECT_MANAGEMENT` |
| Programmes et EPIC | `02_PROJECT_MANAGEMENT` |
| Registres de pilotage | `02_PROJECT_MANAGEMENT` |
| Agents IA | `03_AGENTS` |
| Workflows | `04_WORKFLOWS` |
| Regles specialisees | `05_RULES` |
| References transverses | `06_REFERENCE` |
| Index du Knowledge Index | `06_REFERENCE` |
| Documents archives | `99_ARCHIVES` |

Un document source doit rester dans l'espace qui correspond a son role principal.

## 4.2 Index

Les index du Knowledge Index sont stockes dans `06_REFERENCE`.

Les index ne doivent pas etre stockes dans les dossiers de lots.

Les index ne doivent pas etre stockes dans les dossiers d'archives sauf s'ils sont eux-memes archives.

Un index actif doit pointer vers les documents sources sans les dupliquer.

## 4.3 Registres

Les registres permanents sont stockes selon leur fonction :

- registres de pilotage dans `02_PROJECT_MANAGEMENT` ;
- registres de reference documentaire dans `06_REFERENCE` ;
- registres archives dans `99_ARCHIVES` uniquement apres sortie du flux actif.

Un registre actif doit rester accessible depuis l'espace de pilotage ou de reference correspondant.

## 4.4 Metadonnees

Les metadonnees d'indexation sont stockees dans les documents d'index ou registres de reference.

Elles ne doivent pas etre dispersees dans les documents sources lorsque cela rendrait la maintenance incoherente.

Les metadonnees peuvent etre citees dans un document source lorsqu'elles font partie de son contenu attendu.

Les metadonnees de pilotage restent rattachees aux registres.

Les metadonnees de recherche restent rattachees aux index.

## 4.5 Legacy

Les documents Legacy restent conserves avec une reference explicite a leur statut.

Un document Legacy peut rester a son emplacement d'origine si sa conservation locale est necessaire a la comprehension.

Un document Legacy peut etre deplace vers une zone d'archive uniquement si une mission explicite l'autorise.

L'index doit toujours indiquer qu'un document Legacy n'est pas la reference active par defaut.

## 4.6 Archives

Les documents archives sont stockes dans `99_ARCHIVES`.

Une archive doit conserver un lien vers son origine lorsque cette information existe.

Une archive ne doit pas etre utilisee comme document actif.

Une archive peut etre consultee pour comprendre l'historique, une evolution ou une decision ancienne.

---

# 5. Convention de nommage

## 5.1 Fichiers

Les noms de fichiers doivent etre :

- explicites ;
- stables ;
- en majuscules lorsque le document est une reference structurante ;
- compatibles avec une lecture humaine ;
- compatibles avec une recherche agent IA.

Les fichiers documentaires de reference utilisent le suffixe `.md`.

Exemples de noms stables :

- `VISION.md` ;
- `LOT_REGISTER.md` ;
- `PROGRAM_REGISTER.md` ;
- `KNOWLEDGE_INDEX_SCHEMA.md` ;
- `KNOWLEDGE_INDEX_ENGINE.md` ;
- `KNOWLEDGE_INDEX_STORAGE.md`.

## 5.2 Dossiers

Les dossiers systeme utilisent un prefixe numerique lorsque leur ordre de navigation est structurant.

Le format reconnu est :

`NN_NOM_DOSSIER`

Exemples :

- `01_CORE` ;
- `02_PROJECT_MANAGEMENT` ;
- `06_REFERENCE` ;
- `99_ARCHIVES`.

Un dossier systeme ne doit pas etre renomme sans decision explicite.

## 5.3 Registres

Les registres utilisent un nom explicite termine par `REGISTER`.

Le format recommande est :

`SUJET_REGISTER.md`

Exemples :

- `LOT_REGISTER.md` ;
- `PROGRAM_REGISTER.md` ;
- `EPIC_REGISTER.md` ;
- `DECISION_REGISTER.md` ;
- `ARCHITECTURE_REGISTER.md` ;
- `REFERENCE_REGISTER.md`.

## 5.4 Identifiants

Les identifiants suivent les familles definies par le Knowledge Index.

Les formats physiques reconnus sont :

| Famille | Format |
|---|---|
| Lot | `COS-XXX` |
| Programme | `PROGRAM-XXX` |
| EPIC | `EPIC-XXX` |
| Decision | `DECISION-XXX` |
| Roadmap | `ROADMAP-XXX` |
| Reference | `REF-XXX` |
| Architecture | `ARCH-XXX` |
| Audit | `AUDIT-XXX` |
| Module | `MOD-XXX` |
| Archive | `ARCHIVE-XXX` |

Un identifiant ne doit pas etre reutilise.

Un identifiant ne doit pas etre change lorsque le document evolue.

## 5.5 Index

Les index physiques utilisent un nom explicite contenant `INDEX`.

Le format recommande est :

`SUJET_INDEX.md`

Exemples :

- `KNOWLEDGE_INDEX.md` ;
- `KNOWLEDGE_INDEX_BY_TYPE.md` ;
- `KNOWLEDGE_INDEX_BY_STATUS.md` ;
- `KNOWLEDGE_INDEX_LEGACY.md` ;
- `KNOWLEDGE_INDEX_ARCHIVE.md`.

---

# 6. Registres permanents

Les registres permanents officiels sont :

| Registre | Emplacement | Role |
|---|---|---|
| Register Programs | `02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md` | Suivre les programmes |
| Register EPIC | `02_PROJECT_MANAGEMENT/EPIC_REGISTER.md` | Suivre les EPIC |
| Register LOT | `02_PROJECT_MANAGEMENT/LOT_REGISTER.md` | Suivre les lots |
| Register Decisions | `02_PROJECT_MANAGEMENT/DECISION_REGISTER.md` | Suivre les decisions |
| Register Architecture | `06_REFERENCE/ARCHITECTURE_REGISTER.md` | Suivre les references d'architecture |
| Register References | `06_REFERENCE/REFERENCE_REGISTER.md` | Suivre les references transverses |
| Register Agents | `03_AGENTS/AGENT_REGISTER.md` | Suivre les agents et leurs perimetres |
| Register Workflows | `04_WORKFLOWS/WORKFLOW_REGISTER.md` | Suivre les workflows |
| Register Rules | `05_RULES/RULE_REGISTER.md` | Suivre les regles specialisees |
| Register Archives | `99_ARCHIVES/ARCHIVE_REGISTER.md` | Suivre les archives |

Un registre permanent peut ne pas exister au demarrage.

Son emplacement officiel est neanmoins reserve par le present document.

La creation effective d'un registre doit faire l'objet d'un lot explicite.

---

# 7. Index physiques

## 7.1 Index principal

L'index principal represente la table d'orientation globale du Knowledge Index.

Emplacement officiel :

`06_REFERENCE/KNOWLEDGE_INDEX.md`

Role :

- recenser les entrees documentaires actives ;
- fournir l'acces par identifiant ;
- pointer vers les documents sources ;
- indiquer le type, statut, niveau, version et proprietaire ;
- servir de point d'entree aux agents IA.

## 7.2 Index secondaires

Les index secondaires servent a accelerer les recherches par axe.

Emplacements reserves :

- `06_REFERENCE/KNOWLEDGE_INDEX_BY_TYPE.md` ;
- `06_REFERENCE/KNOWLEDGE_INDEX_BY_STATUS.md` ;
- `06_REFERENCE/KNOWLEDGE_INDEX_BY_PROGRAM.md` ;
- `06_REFERENCE/KNOWLEDGE_INDEX_BY_EPIC.md` ;
- `06_REFERENCE/KNOWLEDGE_INDEX_BY_LOT.md` ;
- `06_REFERENCE/KNOWLEDGE_INDEX_BY_MODULE.md` ;
- `06_REFERENCE/KNOWLEDGE_INDEX_BY_DECISION.md` ;
- `06_REFERENCE/KNOWLEDGE_INDEX_BY_TAG.md` ;
- `06_REFERENCE/KNOWLEDGE_INDEX_BY_ALIAS.md`.

Un index secondaire ne remplace pas l'index principal.

Un index secondaire doit toujours permettre de revenir a l'identifiant principal.

## 7.3 Index Legacy

L'index Legacy recense les documents encore utiles mais non prioritaires.

Emplacement reserve :

`06_REFERENCE/KNOWLEDGE_INDEX_LEGACY.md`

Role :

- recenser les documents Legacy ;
- indiquer leur successeur actif si disponible ;
- conserver leur contexte historique ;
- empecher leur usage comme reference active par defaut.

## 7.4 Index Archive

L'index Archive recense les documents sortis du flux actif.

Emplacement reserve :

`06_REFERENCE/KNOWLEDGE_INDEX_ARCHIVE.md`

Role :

- recenser les archives ;
- indiquer leur origine ;
- indiquer leur date d'archivage si disponible ;
- permettre une recherche historique controlee.

## 7.5 Index de relations

L'index de relations recense les liens bidirectionnels, dependances et references croisees.

Emplacement reserve :

`06_REFERENCE/KNOWLEDGE_INDEX_RELATIONS.md`

Role :

- relier documents parents et enfants ;
- relier lots et livrables ;
- relier decisions et objets impactes ;
- relier documents et artefacts code ;
- detecter les objets orphelins.

---

# 8. Cycle de vie documentaire

## 8.1 Creation

Un document cree doit etre stocke dans l'espace correspondant a son role.

La creation doit produire un chemin stable.

La creation doit permettre l'attribution d'un identifiant.

La creation doit pouvoir etre rattachee a un lot, un programme, une decision ou une reference.

## 8.2 Evolution

Une evolution documentaire modifie le contenu d'un document existant sans changer son identite.

Le fichier reste a son emplacement.

L'identifiant reste stable.

La version peut evoluer.

Les index et registres associes peuvent etre mis a jour par mission explicite.

## 8.3 Remplacement

Un remplacement intervient lorsqu'un document actif est remplace par une nouvelle reference.

Le document remplace devient Legacy ou Archive selon la decision applicable.

Le nouvel objet devient la reference active.

L'index doit conserver le lien entre l'ancien et le nouveau document.

## 8.4 Archivage

L'archivage sort un document du flux actif.

L'archive est stockee ou referencee dans `99_ARCHIVES`.

L'index Archive doit permettre de retrouver l'origine du document.

L'archive ne doit pas etre consultee comme source active par defaut.

## 8.5 Suppression logique

La suppression logique signifie qu'un document n'est plus utilise comme reference active.

Elle ne signifie pas suppression physique du fichier.

La suppression physique n'est pas definie par le present document.

Un document en suppression logique doit rester tracable par les index Legacy ou Archive.

---

# 9. Compatibilite agents

## 9.1 Compatibilite ChatGPT

La structure physique est compatible avec ChatGPT si :

- les references actives sont localisables rapidement ;
- les registres sont nommes de maniere explicite ;
- les index sont centralises dans `06_REFERENCE` ;
- les archives sont separees du flux actif ;
- les chemins restent lisibles dans une reponse.

## 9.2 Compatibilite Codex

La structure physique est compatible avec Codex si :

- le perimetre autorise d'une mission peut etre verifie par chemin ;
- les fichiers de reference sont identifiables sans recherche large ;
- les livrables documentaires ont un emplacement stable ;
- les fichiers interdits peuvent etre distingues des fichiers autorises ;
- les registres et index ne sont pas confondus avec les documents sources.

## 9.3 Compatibilite OpenClaw

La structure physique est compatible avec OpenClaw si :

- les index principaux et secondaires sont localises dans un espace unique ;
- les identifiants sont stables ;
- les chemins physiques sont exploitables ;
- les relations peuvent etre resolues par index ;
- les documents actifs, legacy et archives sont distinguables.

---

# 10. Evolutivite

## 10.1 Moteur RAG

La structure physique doit permettre l'integration future d'un moteur RAG sans modifier l'emplacement des documents sources.

Le moteur RAG devra consommer les index et registres existants.

Il ne devra pas remplacer les documents de reference.

## 10.2 Recherche semantique

La recherche semantique future devra s'appuyer sur :

- les documents sources ;
- les metadonnees ;
- les mots-cles ;
- les alias ;
- les relations ;
- les statuts ;
- les niveaux hierarchiques.

La recherche semantique ne devra pas supprimer la recherche par identifiant.

## 10.3 Vectorisation

La vectorisation future devra rester une couche derivee.

Elle ne devra pas devenir la source de verite.

La source de verite restera composee des documents sources, registres et index physiques.

Les vecteurs devront pouvoir etre regeneres a partir de la structure physique officielle.

## 10.4 Agents multiples

La structure physique doit permettre a plusieurs agents de travailler sur des perimetres distincts.

Les agents devront s'appuyer sur :

- les chemins autorises ;
- les registres ;
- les index ;
- les statuts ;
- les dependances ;
- les documents de gouvernance.

Un agent ne doit pas modifier un espace documentaire hors de son perimetre explicite.

---

# 11. Regle de stabilite

Le present document constitue la reference officielle de la couche physique du Knowledge Index.

Les futurs lots peuvent :

- creer les registres reserves ;
- creer les index reserves ;
- enrichir les metadonnees physiques ;
- documenter des conventions complementaires ;
- ajouter des index secondaires ;
- preciser les parcours d'exploitation.

Les futurs lots ne doivent pas :

- remettre en cause la racine documentaire ;
- renommer les espaces permanents ;
- fusionner documents sources et index ;
- stocker les archives comme documents actifs ;
- supprimer la distinction entre registres et index ;
- remplacer les identifiants par les chemins ;
- rendre la vectorisation source de verite ;
- imposer une refonte de la structure physique.

Cette regle garantit que la couche de stockage peut evoluer sans refonte de son architecture.
