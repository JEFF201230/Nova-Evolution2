# PROGRAM ENGINE NOVA — Rapport de recertification production

Date de contrôle : 2026-07-28  
Mode : certification finale, lecture seule, aucune correction  
Périmètre : P1-001 à P1-007 et chaîne `PromptPackage → Runtime → Evidence → Certification`

## 1. Décision

La recertification ne démontre pas la fermeture effective de tous les P1 dans le chemin de production. Les suites automatisées sont vertes, mais quatre écarts bloquants restent directement observables ou reproductibles.

Décision recommandée : **NO_GO_PRODUCTION**.

## 2. Environnement observé

- OS : Windows
- Node.js : `v24.16.0`
- npm : `11.13.0`
- Git : `2.54.0.windows.1`
- Branche : `feature/nova-core-manager`
- HEAD : `7db9658902adf0496a8f681afbfbd3f19d21d7cc`
- État Git initial : 121 entrées porcelain
- Dépendances installées : `@types/node`, `tsx`, `typescript`
- Aucun package installé ou modifié pendant la mission

## 3. Méthode

La décision repose sur :

1. lecture des implémentations et de leurs contrats ;
2. recherche des raccordements non-test ;
3. exécution des tests P1 ciblés ;
4. compilation TypeScript stricte ;
5. tests Runtime, Kernel, E2E et suite complète ;
6. deux sondes d’exécution en mémoire, sans écriture sur le dépôt ;
7. contrôle Git et empreintes SHA-256.

Les déclarations de clôture antérieures n’ont pas été utilisées comme preuve.

## 4. Résultats des gates techniques

| Gate | Commande | Résultat |
|---|---|---|
| P1 ciblés | neuf fichiers de tests P1, adapter et pipeline | PASS — 86/86 |
| TypeScript / compilation | `npm run typecheck:nova-core` | PASS |
| Runtime certifié | `npm run test:runtime` | PASS — 15/15 |
| Kernel bootstrap | `npm run test:kernel:bootstrap` | PASS — 8/8 |
| Runtime syntax | `npm run test:nova-runtime:syntax` | PASS |
| Runtime E2E | `npm run test:nova-runtime:e2e` | PASS — 15/15 |
| Suite complète | `npm test` | PASS — Runtime 15/15, Core 490/490 |
| Packages | `npm ls --depth=0` | PASS |
| Whitespace Git | `git diff --check` | PASS, avertissements CRLF non bloquants |

Le `tsconfig.nova-core.json` utilise `strict: true` et `noEmit: true`. Aucun script de build distinct n’est défini ; la compilation de certification est donc la compilation TypeScript sans émission.

## 5. Réévaluation P1

| Risque | Contrôles observés | Résultat | Motif |
|---|---|---|---|
| P1-001 Production Authentication | Identités, `EXECUTE`, HMAC-SHA256, durée, comparaison constante, secret en environnement, transport après authentification | PASS | Contrôles fail-closed présents et tests 7/7 |
| P1-002 Execution Integrity | Réservation synchrone, collisions, idempotence active, libération | FAIL | Le replay `COMPLETED` retourne avant revalidation et l’empreinte omet workspace et authentification |
| P1-003 Workspace Security | Allow-list explicite, canonical path, repository, sandbox, traversal, symlink/junction | PASS | Contrôles fail-closed et tests 14/14 |
| P1-004 Prompt Isolation | Sections JSON distinctes System/User/Context/Evidence/Metadata/Package, instructions système fixes, hash du prompt source | PASS | Transport basé sur l’enveloppe isolée ; altérations testées |
| P1-005 ExecutionSession Persistence | États terminaux, journal append-only, replay et reconstruction | FAIL | Aucun enregistrement avant transport : un arrêt brutal avant le bloc terminal ne laisse aucune session reconstructible |
| P1-006 Integration Certification | Service certifié unitaire, build/verify/persist des preuves | FAIL | Aucun raccordement non-test du `CertifiedIntegrationService` ou de l’`IntegrationPipeline` au moteur de production |
| P1-007 Git Provenance | Repository, workspace, branche, HEAD, fingerprints, SHA | FAIL | SHA instable à cause de `certifiedAt` et worktree fingerprint non lié au contenu des fichiers |

## 6. Constats bloquants

### REC-P1-002-01 — Replay terminé sans revalidation

Sévérité : **P1**  
Résultat : **FAIL**

Preuves :

- `integration-pipeline.ts:205` retourne immédiatement `reservation.result` pour une réservation `COMPLETED`.
- Les revalidations Workspace, Git et Authentication sont situées après ce retour.
- `executionFingerprint()` (`integration-pipeline.ts:383-409`) inclut le prompt, le working directory et le timeout, mais pas `workspaceSecurity` ni l’identité d’authentification.
- Sonde observée :
  `{"cachedResultReturned":true,"executeCalls":1,"revalidationCalls":0}`.

La même clé et les mêmes identifiants ont accepté un workspace, un repository et une identité opérateur différents. Cela contredit l’exigence de refus d’une relance avec données différentes.

### REC-P1-005-01 — Reconstruction impossible après arrêt brutal pré-terminal

Sévérité : **P1**  
Résultat : **FAIL**

Preuves :

- `codex-execution-adapter.ts:238` crée uniquement les timestamps en mémoire.
- Le transport démarre à `codex-execution-adapter.ts:242`.
- La première persistance apparaît après retour ou interception du transport (`:260`, `:275`).
- Aucun état `STARTED` ou `RUNNING` durable n’est écrit avant le transport.

Un arrêt du processus entre le lancement du transport et la persistance terminale ne peut donc être rejoué ni reconstruit à partir du repository.

### REC-P1-006-01 — Chaîne de production non composée

Sévérité : **P1**  
Résultat : **FAIL**

Preuves :

- Hors tests, `CertifiedIntegrationService` n’est référencé que dans son propre fichier.
- Hors tests, aucune instanciation de `IntegrationPipeline` n’est observée.
- Les preuves de raccordement de `certified-integration-service.test.ts` utilisent un Runtime injecté de test.
- L’adapter par défaut construit `ExecutionSessionPersistence(null, enabled)` à `codex-execution-adapter.ts:188`, puis bloque à `:233`.

Les composants existent et sont testés isolément, mais aucune preuve de la chaîne de production concrète `IntegrationPipeline → IntegrationService → Runtime → Evidence → Certification` n’est présente.

### REC-P1-007-01 — Empreinte de provenance instable

Sévérité : **P1**  
Résultat : **FAIL**

Preuves :

- `git-provenance.ts:121` calcule `provenanceSha256` sur un objet contenant `certifiedAt`.
- `integration-pipeline.ts:269-270` compare ce SHA complet lors d’une reprise.
- Sonde sur un état repository strictement identique :
  `{"repositoryStateStable":true,"provenanceShaStable":false}`.

Une reprise production échoue donc sur le seul changement d’horodatage.

### REC-P1-007-02 — Worktree fingerprint non lié au contenu

Sévérité : **P1**  
Résultat : **FAIL**

Preuves :

- `git-preflight.ts:135` calcule le fingerprint uniquement sur la sortie de `git status --porcelain`.
- Cette sortie identifie les états et chemins, pas le contenu des fichiers modifiés ou non suivis.
- Les sources des remédiations P1 apparaissent actuellement comme fichiers non suivis ; elles ne sont pas contenues dans HEAD.

Le même statut porcelain peut rester identique après modification du contenu. L’état exact exécuté n’est donc pas certifié par le SHA observé.

## 7. Sécurité

### Contrôles satisfaisants

- HMAC-SHA256 avec secret lu depuis l’environnement.
- Valeur `EXECUTE` obligatoire.
- Identités opérateur, environnement, Runtime et transport contrôlées.
- Comparaison de signature avec `timingSafeEqual`.
- Aucun motif de clé privée ou token OpenAI détecté dans le code hors documentation.
- Workspace explicite et fail-closed.
- Prompt système fixe et données isolées dans une enveloppe canonique.
- Codex CLI configuré en sandbox read-only, ephemeral et sans configuration utilisateur implicite.

### Contrôle non satisfaisant

Le replay `COMPLETED` peut retourner un résultat à un appel portant une identité et un repository différents sans appeler l’authentification ni Workspace Security. La sécurité globale ne peut pas être classée PASS.

## 8. Persistance et reprise

Les états `SUCCESS`, `FAILED`, `CANCELLED` et `TIMEOUT` sont persistés et vérifiés. Les méthodes `history`, `replay` et `reconstruct` existent. Le repository conserve un journal et sérialise les écritures dans un processus.

La garantie de reconstruction complète échoue néanmoins pour un arrêt brutal avant la première écriture terminale. La reprise globale est donc **FAIL**.

## 9. Intégration et certification

`CertifiedIntegrationService` appelle bien son port Runtime puis `MissionEvidenceCertifier.build`, `verify` et `persist`. Cette preuve est unitaire.

La recherche hors tests ne montre aucune composition réelle de ce service, du pipeline, du Runtime et de la persistance. Le marqueur structurel `certificationMode` et le contrôle de forme `IP-017` ne constituent pas une preuve que le certificateur réel a été exécuté.

La certification de bout en bout est **FAIL**.

## 10. Git et traçabilité

La branche, HEAD et les identifiants repository/workspace sont capturés. Toutefois :

- le SHA de reprise varie avec l’heure ;
- le fingerprint du worktree ne couvre pas les octets des fichiers ;
- les sources de remédiation ne sont pas contenues dans HEAD.

La traçabilité exacte et reproductible est **FAIL**.

## 11. Non-régression

Les résultats automatisés sont égaux ou supérieurs à la validation précédente :

- Runtime : 15/15, inchangé ;
- Core : 490/490, inchangé ;
- ciblés : 86/86 contre 71/71 précédemment, périmètre élargi ;
- TypeScript : PASS dans les deux campagnes.

Aucune régression de test n’est détectée. Les écarts bloquants sont des lacunes de couverture et de raccordement révélées par la recertification, pas des échecs de la suite existante.

## 12. Intégrité de la mission

- Aucun fichier source modifié.
- Aucun package modifié ou installé.
- Aucun commit.
- Aucun push.
- Les seules écritures autorisées sont les cinq rapports de recertification.

## 13. Conclusion

Tous les critères de GO ne sont pas satisfaits : P1-002, P1-005, P1-006 et P1-007 ne sont pas effectivement fermés et la sécurité, la reprise, la certification de bout en bout et la traçabilité complète ne sont pas démontrées.

NO_GO_PRODUCTION
