# NOVA Core — première tranche fonctionnelle

Cette version transforme le moteur NOVA existant en un petit service utilisable.

Elle sait :

- créer une mission et la placer dans la file de travail ;
- attribuer la mission et protéger son périmètre ;
- lancer Codex avec son propre moteur d’exécution local, copié puis adapté depuis la base CEREBRAU ;
- choisir automatiquement un profil FAST, BUILD ou ARCHITECTURE ;
- mesurer les fichiers réellement modifiés avant et après l’exécution ;
- recevoir les preuves du travail réalisé ;
- refuser une validation si les preuves sont insuffisantes ou si des problèmes restent ouverts ;
- demander une décision humaine finale ;
- conserver les missions et leur historique après un redémarrage.

## Démarrer

```bash
npm ci
npm run start:nova-core
```

NOVA répond ensuite sur `http://127.0.0.1:4100`.

Sa mémoire est enregistrée dans `.nova-data/runtime.json`.

Ouvrir `http://127.0.0.1:4100` dans un navigateur affiche le tableau de pilotage.

### Cibler le dépôt Git local VEEDDA

Le Runtime NOVA et le dépôt piloté sont deux racines distinctes. Les preuves, rapports et
verrous restent dans NOVA ; les commandes de lecture, build et test s'exécutent dans le
dépôt cible.

Sous PowerShell :

```powershell
$env:NOVA_TARGET_PROJECT_ID = "VEEDDA"
$env:NOVA_TARGET_REPOSITORY = "C:\DEV\veedda-cseV7-core"
$env:NOVA_TARGET_VALIDATION_PROFILE = "VEEDDA"
$env:NOVA_JOURNAL_ATTESTATION_KEY = "<clé locale d'au moins 32 caractères>"
npm.cmd run start:nova-core
```

`NOVA_TARGET_PROJECT_ID` et `NOVA_TARGET_REPOSITORY` doivent toujours être définis
ensemble. Le profil VEEDDA désactive l'assemblage intelligent de contexte à ce stade,
protège `tools/cerebrau/**` en écriture et sélectionne les validations du dépôt VEEDDA.

Les projets configurés et leur état Git sont consultables sans lancer Codex :

```text
GET /api/v1/projects
GET /api/v1/projects/VEEDDA/preflight
```

Le preflight refuse un dépôt non Git, un top-level différent, un HEAD absent ou détaché,
une branche inattendue, des conflits, un `index.lock` actif ou un sous-module invalide.
Un worktree déjà modifié est accepté comme baseline uniquement pour une mission
`READ_ONLY`; toute dérive produite pendant la mission reste bloquante.

## Parcours disponible

1. `POST /api/v1/missions` — créer une mission.
2. `POST /api/v1/missions/{projet}/{mission}/assign` — l’attribuer.
3. `POST /api/v1/missions/{projet}/{mission}/execute` — lancer le moteur NOVA Core et Codex.
4. `POST /api/v1/missions/{projet}/{mission}/evidence` — déposer manuellement des preuves si nécessaire.
5. `POST /api/v1/missions/{projet}/{mission}/technical-accept` — contrôler les preuves.
6. `POST /api/v1/missions/{projet}/{mission}/approve` — décision humaine finale.
7. `GET /api/v1/missions/{projet}/{mission}` — consulter la mission et son historique.

## Moteur autonome

Le moteur se trouve dans `tools/nova-core-runtime`.

Il s’agit d’une copie autonome du moteur unitaire CEREBRAU, renommée et adaptée à NOVA Core. Il ne lit et n’appelle aucun fichier du projet VEEDDA ou du runtime CEREBRAU actif.

Les missions, prompts, verrous et rapports sont écrits exclusivement sous `.nova-data/execution`.

Le moteur nécessite :

- Windows PowerShell ;
- Codex CLI disponible sous la commande `codex` ou `codex.cmd` ;
- un dépôt Git avec une branche active ;
- les dépendances NPM déjà installées.

## Limites assumées de cette première tranche

- la mémoire locale JSON est adaptée à une démonstration ou à un poste unique ; la cible de production reste PostgreSQL ;
- le moteur fonctionne localement et exécute une mission à la fois ;
- l’authentification et les droits multi-utilisateurs restent à ajouter ;
- la validation humaine finale reste obligatoire.
