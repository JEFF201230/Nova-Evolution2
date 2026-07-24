# NOVA Core — rapport d’adaptation du moteur d’exécution

Date : 24 juillet 2026  
Décision : moteur CEREBRAU copié et adapté dans NOVA Core  
Architecture retenue : runtime autonome, sans passerelle vers le CEREBRAU actif

## 1. Résultat

NOVA Core possède maintenant sa propre copie du moteur d’exécution unitaire.

Le code source est installé dans :

`tools/nova-core-runtime`

Le service NOVA Core appelle exclusivement cette copie locale. Il ne lit et n’exécute aucun script situé dans VEEDDA ou dans le dossier CEREBRAU actif.

## 2. Composants copiés puis renommés

| Source CEREBRAU | Copie NOVA Core | Fonction |
|---|---|---|
| `Invoke-CerebrauMission.ps1` | `Invoke-NovaCoreMission.ps1` | lancement de Codex |
| `Resolve-CerebrauProfile.ps1` | `Resolve-NovaCoreProfile.ps1` | choix du modèle et du niveau de raisonnement |
| `Test-CerebrauMission.ps1` | `Test-NovaCoreMission.ps1` | validation du manifeste |
| `Cerebrau.Reporting.psm1` | `NovaCore.Reporting.psm1` | snapshots, delta, tests et rapports |
| `Cerebrau.Governance.psm1` | `NovaCore.Governance.psm1` | contrôle du périmètre et verrous |
| `Cerebrau.ContextAssembly.psm1` | `NovaCore.ContextAssembly.psm1` | préparation du contexte |

Les suites de tests unitaires correspondantes ont également été copiées et renommées.

## 3. Éléments volontairement exclus

Les éléments suivants n’ont pas été copiés :

- les missions VEEDDA ;
- le prompt VEEDDA ;
- les rapports d’exécution CEREBRAU ;
- les campagnes VEEDDA ;
- le Campaign Runner CEREBRAU, car NOVA Core possède déjà sa propre orchestration ;
- les outils de reconstruction de gouvernance propres au projet VEEDDA.

Cette exclusion évite deux orchestrateurs concurrents et toute dépendance avec le chantier VEEDDA en cours.

## 4. Personnalisation NOVA Core

- namespace des fonctions : `NovaCore` ;
- codes d’erreur : `NOVA_CORE_*` ;
- profils : FAST, BUILD, ARCHITECTURE et READ_ONLY ;
- stockage : `.nova-data/execution` ;
- commandes autorisées : tests, contrôle TypeScript et build NOVA ;
- génération automatique du prompt à partir de la mission NOVA ;
- génération automatique du manifeste PowerShell ;
- récupération automatique du rapport officiel ;
- retour automatique des fichiers modifiés, contrôles, blocages et erreurs dans la mission NOVA ;
- décision humaine finale maintenue.

## 5. Sécurité ajoutée

La copie CEREBRAU sauvegardait temporairement le contenu de tous les fichiers suivis par Git.

La version NOVA Core interdit maintenant la copie du contenu des fichiers sensibles :

- `.env` et variantes ;
- clés et certificats ;
- fichiers contenant `credential` ou `secret` ;
- `.git` ;
- `node_modules` ;
- `.nova-data` ;
- rapports du runtime.

Leur empreinte peut être observée pour détecter une modification, mais leur contenu n’est pas copié dans la sauvegarde temporaire.

## 6. Intégration au service et à l’interface

Le nouveau composant TypeScript est :

`server/nova-core/nova-core.execution.ts`

La nouvelle route est :

`POST /api/v1/missions/{projet}/{mission}/execute`

L’interface affiche maintenant le bouton :

`Lancer le travail avec NOVA`

Ce bouton :

1. attribue la mission si nécessaire ;
2. protège son périmètre ;
3. crée le prompt et le manifeste ;
4. lance le moteur NOVA Core ;
5. lance Codex ;
6. récupère le rapport ;
7. affiche les fichiers modifiés et les contrôles ;
8. demande ensuite la validation humaine.

## 7. Vérifications réalisées

- TypeScript NOVA Core : PASS ;
- Orchestrator Runtime : 5 tests sur 5 réussis ;
- NOVA Core et intégration du moteur : 5 tests sur 5 réussis ;
- interface NOVA Web : 143 tests sur 143 réussis ;
- typecheck NOVA Web : PASS ;
- build NOVA Web : PASS.

Les tests Windows PowerShell du moteur sont fournis, mais n’ont pas pu être relancés dans l’environnement Linux de préparation. L’exécution réelle avec Codex doit donc encore être confirmée une fois sur le poste Windows cible.

## 8. Conditions de fonctionnement

Le dossier NOVA Core doit :

- être un dépôt Git ;
- avoir une branche active ;
- disposer de Node.js, NPM, Git et Codex CLI ;
- avoir ses dépendances NPM installées.

Le moteur est local, séquentiel et prévu pour une seule exécution à la fois dans ce MVP.
