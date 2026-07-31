# PROGRAM NOVA — ROADMAP D'INTÉGRATION UX / RUNTIME

Mission : `PROGRAM-NOVA-UX-RUNTIME-INTEGRATION-001`  
Nature : architecture et planification uniquement  
Implémentation réalisée : aucune

## 1. Principes

La trajectoire doit respecter simultanément :

- zéro modification du comportement de l'interface historique pendant la transition ;
- lecture seule avant toute mutation ;
- contrats versionnés ;
- secrets et opérations privilégiées exclusivement côté serveur ;
- certification indépendante de chaque tranche ;
- retour instantané vers l'interface historique ;
- aucun remplacement du Runtime ou du Kernel ;
- aucune assimilation de l'API v1 actuelle au `ProgramProductionEntrypoint`.

## 2. Architecture cible proposée

Cette architecture est une proposition pour une future mission d'implémentation ; elle n'existe pas dans l'état audité.

```text
Navigateur
   |
   v
Reverse proxy HTTPS, même origine
   |------------------------------|
   v                              v
UX historique                    React/Vite NOVA Web
route legacy                     route /v2
   |                              |
   |                              v
   |                        API d'intégration /api/v2
   |                        - session opérateur
   |                        - autorisation par action
   |                        - projections UX
   |                        - idempotence
   |                        - erreurs versionnées
   |                              |
   |                 |------------|-------------|
   |                 v                          v
   |          Lectures v1 stables       ProgramProductionEntrypoint
   |          missions/events/SSE       execute + reconstruct
   |                                             |
   |                                  Runtime, Evidence, Certification
   |                                  sessions durables et provenance
   |_____________________________________________|
```

Règles d'architecture :

1. L'UX historique et son API restent disponibles jusqu'au cutover certifié.
2. React est publié sous une route ou un origin explicitement sélectionnable.
3. Le reverse proxy fournit HTTPS et une origine cohérente ; CORS `*` n'est pas la politique cible.
4. Une API v2 sert de façade d'intégration, sans casser les contrats v1.
5. La façade compose côté serveur le vrai `ProgramProductionEntrypoint`.
6. Les clés Bearer, HMAC, transport Codex et autorités ne sont jamais envoyées au bundle React.
7. Les commandes sont idempotentes et retournent les IDs mission, run et session.
8. Les lectures événements/SSE conservent séquence et corrélation.
9. Les projections UX sont dérivées des modèles Runtime ; elles ne deviennent pas une seconde source de vérité.

## 3. Contrats à figer avant implémentation

### 3.1 Identité et autorisation

- mécanisme de session navigateur ;
- identité opérateur côté serveur ;
- matrice action/rôle ;
- protection CSRF si authentification par cookie ;
- politique CORS/origin ;
- audit des refus ;
- révocation.

### 3.2 Mission et Program Engine

- endpoint de préparation d'un brouillon ;
- validation de `MissionDefinition` et construction de `PromptPackage` ;
- lancement idempotent via `ProgramProductionEntrypoint.execute`;
- lecture du résultat avec mission, run et `ExecutionSessionId` ;
- reconstruction via `reconstruct` ;
- exposition contrôlée des checkpoints ;
- annulation et recovery sans double transport ni double Runtime.

### 3.3 Human Approval

- demande d'approbation ;
- package de décision ;
- décisions `APPROVED`, `REJECTED`, `CHANGES_REQUESTED`, `BLOCKED` ;
- rôle et interdiction d'auto-approbation ;
- historique et receipt ;
- idempotence ;
- liaison aux evidence et à la certification.

### 3.4 Projections de lecture

- Home summary ;
- Work overview/plan/activity/people/sources/decisions/deliverables ;
- Missions list/detail ;
- Monitoring snapshot + SSE ;
- Evidence index/detail ;
- Certification view.

Chaque projection doit publier un schéma JSON versionné et documenter la source Runtime de chaque champ.

## 4. Phases d'intégration

### Phase 0 — Gate de faisabilité

Objectif :

- décider et documenter le modèle d'autorité HTTP ;
- composer le `ProgramProductionEntrypoint` côté serveur ;
- figer `/api/v2`, modèles et erreurs ;
- résoudre le double type `RuntimeMission` par nommage/version explicite ;
- définir Human Approval et la médiation de certification.

Entrée : code actuel et présente cartographie.  
Sortie : contrats approuvés et tests de contrat prévus.  
Gate : aucune mutation React autorisée avant certification de cette phase.  
Rollback : aucun impact, l'UX historique reste seule active.

### Phase 1 — Shell et lectures fondamentales

Écrans :

- Navigation ;
- Home minimal ;
- Missions minimal.

APIs :

- health ;
- projects/preflight ;
- missions list/detail.

Contraintes :

- feature switch de route React ;
- lecture seule ;
- IDs réels ;
- loading, empty, error et blocked ;
- aucune action factice présentée comme réussie.

Gate :

- tests de contrat ;
- vérification 401/403/404/409/5xx ;
- test de non-régression de `/` legacy ;
- capture et preuve écran par écran.

Rollback : route proxy vers legacy, sans migration de données.

### Phase 2 — Work Activity et Monitoring

Écrans :

- Work Overview ;
- Work Activity ;
- Monitoring.

APIs :

- mission detail ;
- monitor ;
- events ;
- monitor/stream SSE.

Gate :

- ordre par `sequence` ;
- corrélation mission/run ;
- rejeu initial ;
- reconnexion sans duplication visuelle ;
- fermeture et reprise SSE ;
- comportement après redémarrage Runtime ;
- fallback polling documenté.

Rollback : désactivation du client SSE et retour aux lectures ponctuelles ou au legacy.

### Phase 3 — Work Setup en brouillon

Écrans :

- Clarify ;
- Canvas ;
- Plan ;
- Confirm en mode préparation.

APIs futures :

- draft create/read/update ;
- validate ;
- projection du plan ;
- preview de `MissionDefinition` et `PromptPackage`.

Gate :

- persistance du brouillon ;
- validation exhaustive des champs ;
- aucune exécution ;
- reprise après rafraîchissement ;
- contrôle des références et du scope.

Rollback : conserver le brouillon, masquer la route React, aucune mission exécutée.

### Phase 4 — Création et exécution certifiée

Actions :

- création idempotente ;
- assignation ;
- exécution via `ProgramProductionEntrypoint` ;
- annulation ;
- reconstruction ;
- soumission de preuves ;
- validation technique.

Gate :

- authentification et autorisation ;
- un seul transport Codex ;
- un seul appel Runtime ;
- checkpoints durables ;
- reprise crash ;
- idempotence réseau ;
- timeouts et annulation ;
- provenance Git ;
- absence de secret côté navigateur.

Rollback :

- bloquer les nouvelles commandes React ;
- conserver les sessions durables ;
- reconstruire les runs interrompus ;
- revenir au frontend legacy sans réémettre une commande.

### Phase 5 — Decisions, Human Approval et Certification

Écrans :

- Decisions list/detail/package/pause/receipt ;
- Certification ;
- Evidence nécessaire à la décision.

Gate :

- rôle Human Approval ;
- absence d'auto-approbation ;
- décisions et receipt persistés ;
- attestation et certificat liés au bon run/report ;
- secrets exclusivement serveur ;
- double soumission idempotente ;
- audit complet ;
- scénarios reject/change/block.

Rollback :

- désactiver les mutations React ;
- conserver décisions et certificats append-only ;
- consultation toujours disponible ;
- aucune inversion ou suppression de décision.

### Phase 6 — Domaines Work enrichis

Écrans :

- Plan ;
- People ;
- Sources ;
- Deliverables ;
- Evidence complet.

Gate :

- contrats de vue approuvés ;
- provenance de chaque champ ;
- contrôle d'accès artifacts ;
- aucune donnée fictive en mode connecté ;
- états incomplets explicitement affichés.

### Phase 7 — Cutover

Conditions cumulatives :

- toutes les phases nécessaires certifiées ;
- parcours production complet ;
- replay/restart/recovery testés ;
- Human Approval et Certification certifiés ;
- monitoring et alertes opérationnels ;
- runbook de rollback exécuté ;
- période d'observation sans régression ;
- décision explicite de retirer ou conserver le legacy.

Le retrait du legacy n'est pas inclus dans cette roadmap d'intégration et exige une décision séparée.

## 5. Certification écran par écran

Pour chaque écran :

1. figer le schéma d'entrée ;
2. relier chaque champ à une source Runtime ;
3. tester loading, empty, success, partial, unauthorized, forbidden, conflict et server error ;
4. vérifier la navigation directe et après refresh ;
5. vérifier l'accessibilité existante ;
6. vérifier qu'aucune fixture n'est utilisée en mode connecté ;
7. capturer la preuve ;
8. exécuter la non-régression legacy ;
9. enregistrer la version UX et API ;
10. autoriser la phase suivante uniquement après décision.

## 6. Stratégie de coexistence

| Élément | Legacy | React pendant migration |
|---|---|---|
| route | `/` existante | `/v2` proposée |
| API | v1 inchangée | lectures v1 contrôlées, mutations v2 |
| activation | valeur sûre | feature switch/proxy |
| données | source Runtime existante | mêmes sources via projections |
| secrets | serveur | serveur uniquement |
| rollback | destination immédiate | désactivation sans suppression |

## 7. Rollback minimal

1. désactiver l'entrée des nouvelles mutations React ;
2. relever missions, runs et sessions en cours ;
3. attendre ou annuler via une commande autorisée ;
4. vérifier les checkpoints durables ;
5. basculer la route frontend vers le legacy ;
6. ne pas modifier les journaux, evidence, décisions ou certificats ;
7. reconstruire les sessions interrompues côté serveur ;
8. vérifier absence de double transport et double Runtime ;
9. exécuter smoke tests legacy ;
10. maintenir React en lecture seule pour diagnostic si autorisé.

## 8. Critères de levée des blocages

La certification pourra être réévaluée uniquement après preuve de :

- composition serveur du `ProgramProductionEntrypoint` ;
- API versionnée pour execute et reconstruct ;
- authentification des mutations ;
- Human Approval HTTP complet ;
- médiation serveur de la certification ;
- projections minimales Home/Work/Missions/Monitoring ;
- client React réel sans fixtures dans les parcours connectés ;
- tests de contrat et d'idempotence ;
- parcours end-to-end par le vrai entrypoint ;
- rollback vers le legacy démontré.

## 9. État de la roadmap

La roadmap est exécutable comme plan de travail, mais sa Phase 0 correspond à des composants absents du dépôt observé. Elle ne constitue donc pas une preuve de disponibilité actuelle.

UX_RUNTIME_INTEGRATION_BLOCKED
