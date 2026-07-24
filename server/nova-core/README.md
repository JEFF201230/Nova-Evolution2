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
npm install
npm run start:nova-core
```

NOVA répond ensuite sur `http://127.0.0.1:4100`.

Sa mémoire est enregistrée dans `.nova-data/runtime.json`.

Ouvrir `http://127.0.0.1:4100` dans un navigateur affiche le tableau de pilotage.

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
