# RUNTIME-NOVA-AUDIT-001 — Rapport d’audit du runtime NOVA Core

Date de l’audit : 24 juillet 2026  
Révision auditée : `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7` (`main`)  
Mode : lecture seule du code et des données existantes ; seuls les trois livrables d’audit ont été créés

## 1. Verdict exécutif

Le runtime NOVA Core est un MVP local partiellement opérationnel. Le moteur unitaire PowerShell est cohérent avec sa source CEREBRAU, ses tests fournis passent et sa ligne de commande est syntaxiquement compatible avec Codex CLI `0.145.0`.

Il n’est toutefois pas certifiable dans son état actuel et ne fournit pas les données nécessaires à un Mission Execution Monitor temps réel.

Les causes principales sont :

- l’approbation finale est non authentifiée, non signée et non liée à l’empreinte du rapport ;
- un rapport PowerShell `FAILED` est enregistré côté orchestrateur comme un rapport `SUBMITTED` ;
- les verrous survivent aux missions `FAILED` et peuvent bloquer durablement les missions suivantes ;
- les mutations ne sont pas transactionnelles et un échec conserve des états partiels ;
- `stdout`, `stderr`, les codes détaillés et le journal PowerShell ne sont pas propagés à l’API ;
- l’état `RUNNING` n’est pas durable pendant l’exécution et aucune reprise après incident n’existe ;
- le rapport choisi n’est pas lié cryptographiquement à l’invocation courante ;
- la configuration effective de Codex dépend de l’environnement utilisateur ;
- la machine d’état demandée (`CREATED` à `CERTIFIED`) n’est pas implémentée ;
- les mécanismes CEREBRAU de campagne, de reprise, de journal à projection et de revue liée au hash ont été volontairement exclus sans équivalent complet.

### Classement

| Sévérité | Nombre | Interprétation |
|---|---:|---|
| P0 | 1 | intégrité de certification compromise |
| P1 | 14 | défaillance majeure, blocage, fausse projection ou perte de preuve |
| P2 | 7 | robustesse, déterminisme ou validation incomplets |
| P3 | 1 | dette de bootstrap/reproductibilité |
| Total | 23 | anomalies distinctes |

## 2. Méthode et sources de preuve

### 2.1 Sources NOVA

- service : `server/nova-core/**` ;
- orchestrateur : `server/runtime/orchestrator/**` ;
- moteur unitaire : `tools/nova-core-runtime/**` ;
- interface : `server/nova-core/public/index.html` ;
- état réel : `.nova-data/runtime.json` ;
- documentation de livraison : `LIRE_EN_PREMIER.md`, `NOVA_CORE_RUNTIME_ADAPTATION_REPORT.md`.

### 2.2 Baseline CEREBRAU

La source CEREBRAU active n’est pas présente dans le dépôt NOVA. La comparaison a été réalisée contre l’archive de référence fournie :

`../DOCS/cerebrau-audit-20260724-101440.zip`

SHA-256 de l’archive :

`14622D482B5C914EBCF13F4932418F9EC25954CF5FD7330C5CE615FAFA3219E5`

Les membres utilisés sont notamment :

- `tools/cerebrau/Invoke-CerebrauMission.ps1` ;
- `tools/cerebrau/Cerebrau.Reporting.psm1` ;
- `tools/cerebrau/Cerebrau.Governance.psm1` ;
- `tools/cerebrau/Cerebrau.ContextAssembly.psm1` ;
- `tools/cerebrau/Invoke-CerebrauCampaign.ps1` ;
- `tools/cerebrau/Cerebrau.Campaign.psm1`.

Cette archive contient 94 rapports officiels CEREBRAU et 99 journaux d’exécution. L’état NOVA local contient zéro `official-report.json` et zéro `execution-journal.jsonl`.

### 2.3 Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `npm.cmd test` | PASS — orchestrateur 5/5, NOVA Core 5/5 |
| `npm.cmd run typecheck:nova-core` | PASS |
| `npm.cmd run test:nova-runtime:syntax` | PASS |
| `npm.cmd run test:nova-runtime:e2e` | PASS — 15/15 |
| `codex.cmd --version` | `codex-cli 0.145.0` |
| `codex.cmd exec --help` | les options utilisées existent |
| Git | dépôt valide, branche `main`, HEAD `d54cf2a…`, worktree propre avant rédaction |

Limite : `Test-NovaCoreRuntimeE2E.ps1:14-89` injecte un faux `codex.cmd`. Les tests TypeScript injectent aussi un `commandRunner` simulé (`server/nova-core/nova-core.execution.test.ts:21-54`, `server/nova-core/nova-core.http.test.ts:82-113`). Ils ne constituent pas une preuve d’exécution Codex réelle.

## 3. État du runtime par périmètre

| Périmètre | État | Conclusion |
|---|---|---|
| Initialisation | PARTIEL | chemins résolus, mais préflight et validation de configuration incomplets |
| Git | PARTIEL | branche contrôlée, mais dépôt/HEAD/outils et course temporelle insuffisamment maîtrisés |
| Construction mission | PARTIEL | prompt et manifeste générés, mais requête non persistée et contenu non lié côté service |
| Exécution Codex | PARTIEL | invocation compatible `0.145.0`, sans contrôle complet de l’environnement ni observabilité |
| Cycle de vie | NON CONFORME | vocabulaire demandé absent et états PowerShell/TypeScript divergents |
| Journalisation | PARTIEL | deux journaux existent conceptuellement, mais ils ne sont pas reliés ni exposés |
| Gestion d’erreurs | NON CONFORME | détails réels masqués et états partiels durables |
| Interface runtime | NON CONFORME | pas de progression, étape, durée ou journal temps réel |
| Traçabilité | INSUFFISANTE | empreintes PowerShell non vérifiées par le service |
| Certification | NON CERTIFIABLE | décision finale non authentifiée et non liée à une preuve immuable |

## 4. Cycle de vie demandé

| État demandé | Implémentation observée | Observable | Durable au moment de la transition | Verdict |
|---|---|---:|---:|---|
| `CREATED` | événement `MissionCreated`, état `DRAFT` | oui | oui | équivalence implicite seulement |
| `ASSIGNED` | état `ASSIGNED` | oui | oui, y compris après échec partiel | présent |
| `STARTED` | événement `AgentStarted`, passage direct à `RUNNING` | oui | non pendant l’appel long | pas d’état dédié |
| `RUNNING` | état `RUNNING` | en mémoire seulement pendant l’appel | non | insuffisant |
| `VALIDATING` | `TECHNICAL_VALIDATION`, `DOCUMENTARY_VALIDATION`, `HUMAN_VALIDATION` | oui après soumission | oui | vocabulaire divergent |
| `COMPLETED` | absent ; `SUBMITTED` puis `ACCEPTED` | non | non | absent |
| `FAILED` | présent | oui | oui | présent mais verrou non libéré |
| `CERTIFIED` | absent ; `ACCEPTED` est utilisé comme terminal | non | non | absent |

Preuves : `server/runtime/orchestrator/orchestrator-runtime.types.ts:1-18`, `server/runtime/orchestrator/orchestrator-runtime.service.ts:22-105`, `:451-502`, `:506-539`.

## 5. Anomalies

### NRA-001 — P0 — Certification finale non authentifiée et non liée au rapport

**Constat.** `POST .../approve` ne reçoit ni identité d’autorité, ni décision signée, ni hash de rapport (`server/nova-core/nova-core.http.ts:120-123`). `approveMission()` vérifie seulement l’état `HUMAN_VALIDATION` (`server/nova-core/nova-core.service.ts:200-209`). Le serveur autorise CORS `*` (`server/nova-core/nova-core.http.ts:186-189`) et aucune authentification n’existe, limite reconnue par `server/nova-core/README.md:55-60`.

L’endpoint manuel de preuve accepte des listes déclaratives et `scopeConfirmed: true`, sans artefact ni hash (`server/nova-core/nova-core.types.ts:3-12`, `nova-core.service.ts:258-267`).

**Impact.** Toute acceptation finale peut être déclenchée sans preuve d’identité et sans engagement sur une version précise du rapport. `ACCEPTED` ne peut pas valoir `CERTIFIED`.

**Écart CEREBRAU.** Le Campaign Runner exige le SHA-256 courant du rapport lors de la revue (`tools/cerebrau/Cerebrau.Campaign.psm1`, membre d’archive, lignes 1107-1117). L’auteur reste déclaratif dans CEREBRAU, donc l’authentification y est également à renforcer, mais le lien au rapport existe.

### NRA-002 — P1 — Une exécution PowerShell `FAILED` devient une mission `SUBMITTED`

**Constat.** Le moteur PowerShell classe correctement tout code non nul en `FAILED` (`NovaCore.Reporting.psm1:320-331`). Le mapper TypeScript transforme cependant tout rapport trouvé en `MissionReport`, ajoute seulement un blocker (`nova-core.execution.ts:288-350`), puis `executeMission()` appelle systématiquement `submitReport()` et transitionne `RUNNING -> SUBMITTED` (`orchestrator-runtime.service.ts:474-503`).

**Impact.** Le statut autoritatif du moteur et l’état canonique NOVA se contredisent. Les tableaux, automatismes et reprises ne peuvent pas déterminer l’issue réelle à partir de l’état mission.

### NRA-003 — P1 — Fuite de verrou après `FAILED`

**Constat.** Les seuls états terminaux libérant un verrou sont `ACCEPTED`, `REJECTED`, `CANCELLED` (`orchestrator-runtime.service.ts:20`, `:628-649`). `FAILED` n’en fait pas partie et `executeMission()` ne libère pas le verrou dans son `catch` (`:485-490`).

**Preuve d’exploitation.** `.nova-data/runtime.json:35` montre `UX-WORK-NAV-ICONS-001` en `FAILED`, tandis que le verrou associé reste `ACTIVE` à `.nova-data/runtime.json:364-374`.

**Impact.** Un échec peut bloquer indéfiniment le même périmètre sans endpoint public de récupération.

### NRA-004 — P1 — Mutation non transactionnelle et état partiel durable

**Constat.** `assignAndLock()` assigne puis acquiert le verrou dans une même mutation (`nova-core.service.ts:65-79`). Si l’acquisition échoue, le `catch` persiste quand même le snapshot partiellement modifié (`:239-248`).

**Preuve d’exploitation.** `.nova-data/runtime.json:45-74` montre `UX-WORK-NAV-ICONS-002` durablement `ASSIGNED` sans verrou, après le verrou actif de la mission précédente.

**Impact.** Les commandes ne sont pas atomiques ; un retry repart d’un état différent de l’intention initiale. Les mêmes effets existent pour toute séquence multi-transition.

### NRA-005 — P1 — Diagnostics réels masqués

**Constat.** `NovaCoreExecutionError` possède `details` (`nova-core.execution.ts:73-81`) et la résolution Git y place `stderr/stdout` (`:201-213`, `:413-417`). La traduction recrée toutefois un `NovaCoreError` avec le seul message (`nova-core.service.ts:278-287`), puis l’API n’émet que `code` et `message` (`nova-core.http.ts:173-183`). L’événement `ExecutionFailed` ne contient aussi que `error.message` (`orchestrator-runtime.service.ts:485-489`).

**Preuve d’exploitation.** `.nova-data/runtime.json:176-188` conserve uniquement le diagnostic générique « dépôt Git avec une branche active », sans `exitCode`, `stdout`, `stderr`, commande ni `cwd`.

**Impact.** La cause réelle d’un échec Git ou processus ne peut pas être établie après coup.

### NRA-006 — P1 — Absence d’observabilité temps réel

**Constat.** Le processus est lancé avec des pipes, mais les chunks sont seulement concaténés en mémoire (`nova-core.execution.ts:377-409`). Aucun événement de progression n’est publié. L’API `/execute` attend la fin (`nova-core.http.ts:101-110`). L’interface affiche un texte statique puis attend la réponse (`public/index.html:289-309`) ; elle ne poll pas la mission pendant l’appel et n’expose ni durée ni journal.

Le journal PowerShell contient des étapes (`Invoke-NovaCoreMission.ps1:129-148`) mais son chemin n’est pas projeté dans `MissionReport`.

**Impact.** Impossible d’alimenter correctement barre de progression, étape courante, temps écoulé, journal temps réel ou Mission Execution Monitor.

### NRA-007 — P1 — `RUNNING` non durable et aucune reprise après crash

**Constat.** La transition `AgentStarted` se produit avant le handler (`orchestrator-runtime.service.ts:451-475`), mais `NovaCoreService.mutate()` ne sauvegarde qu’après la fin ou le rejet de toute l’opération (`nova-core.service.ts:239-248`). Une exécution de plusieurs minutes n’a donc pas de checkpoint durable.

Le service ne restaure pas les tentatives interrompues, ne recherche pas de rapport nouveau associé à un run et n’offre ni reprise ni réconciliation.

**Impact.** Un crash peut restaurer `READY` ou `LOCKED` alors que Codex a modifié le worktree. Une relance peut réexécuter une mission dont les effets sont déjà partiels.

### NRA-008 — P1 — Rapport sélectionné par mtime, non lié à l’invocation et non vérifié

**Constat.** Le service choisit le `official-report.json` au `mtime` le plus récent (`nova-core.execution.ts:353-374`). Il ne connaît pas le `runId` PowerShell, ne compare pas l’heure de début, l’identité mission, le manifest hash ou `ReportFingerprint`, et n’applique aucun schéma avant le mapping (`:178-198`).

`pathScopeValid` vaut vrai si aucune validation `pathScope` n’est présente, par sémantique de `every()` sur une liste vide (`:304-310`).

**Impact.** Après une terminaison anormale, un ancien rapport peut être pris pour le rapport courant ; un rapport tronqué ou falsifié peut produire une projection plausible.

### NRA-009 — P1 — Requête d’exécution et prompt non durables côté service

**Constat.** L’appelant peut remplacer entièrement le prompt (`nova-core.execution.ts:121`) et choisir profil, branche attendue, `changesExpected` et revue humaine (`:12-18`). Ces paramètres ne sont pas ajoutés aux événements ni au `runtime.json`. Le prompt et le manifeste sont écrasés aux mêmes chemins mission (`:111-161`).

Le contexte PowerShell calcule des empreintes, mais le service ne les enregistre ni ne les vérifie lors de la soumission.

**Impact.** Deux exécutions d’une même mission canonique peuvent avoir des instructions différentes sans différence observable dans le journal NOVA.

### NRA-010 — P1 — Configuration effective Codex non maîtrisée

**Constat.** Le profil déclare `approvalPolicy: on-request` (`profiles.json`), mais `Invoke-NovaCoreMission.ps1:311-332` ne transmet aucune politique d’approbation. Codex CLI `0.145.0` ne propose d’ailleurs pas cette option dans `exec --help`.

Le runtime n’utilise pas `--ignore-user-config`, `--strict-config` ou `--ephemeral`. Il résout le premier `codex.cmd`/`codex` du `PATH` (`Invoke-NovaCoreMission.ps1:229-238`) et ne conserve ni chemin ni hash de l’exécutable. L’environnement complet est hérité.

**Impact.** Le rapport affirme une politique qui n’est pas prouvée comme effective ; configuration utilisateur, hooks, features et binaire peuvent modifier l’exécution.

### NRA-011 — P1 — Pas de timeout, annulation contrôlée ni bornage des sorties

**Constat.** `runCommand()` n’a ni timeout, ni `AbortSignal`, ni limite de taille (`nova-core.execution.ts:377-409`). L’API ne possède pas de route stop/cancel. Les validations PowerShell lisent synchroniquement `stdout` puis `stderr` avant `WaitForExit()` (`NovaCore.Reporting.psm1:199-211`), schéma exposé au blocage si un flux remplit son buffer pendant la lecture de l’autre.

**Impact.** Un Codex ou test bloqué monopolise le runtime global ; une sortie volumineuse peut épuiser la mémoire.

### NRA-012 — P1 — Couverture de validation insuffisante et déclarative

**Constat.** Tout chemin `server/**` déclenche `novaCoreTests` et le typecheck (`nova-core.execution.ts:279-283`). Or `package.json:12-17` limite `npm test` à l’orchestrateur et `server/nova-core/*.test.ts`, pas à l’ensemble de `server/**`.

Les livrables du `MissionReport` sont recopiés depuis les livrables attendus (`nova-core.execution.ts:338-350`) sans contrôle qu’ils existent. Les checks ne prouvent pas leur couverture.

**Impact.** Une mission peut être présentée avec tous ses livrables et validations alors que le module modifié n’a pas été testé.

### NRA-013 — P1 — Les audits ne sélectionnent pas automatiquement le profil `READ_ONLY`

**Constat.** `selectProfile()` route `AUDIT` et `INSPECTION` vers `FAST` (`nova-core.execution.ts:255-263`). `FAST` a un sandbox `workspace-write` et `changesExpected` vaut vrai sauf demande explicite (`:115-117`, `:156-157`).

**Impact.** Une mission d’audit créée par l’interface, qui envoie `{}` (`public/index.html:295-298`), autorise les écritures et attend des modifications.

### NRA-014 — P1 — Machine d’état et certification non conformes au contrat demandé

**Constat.** `CREATED`, `STARTED`, `VALIDATING`, `COMPLETED` et `CERTIFIED` ne sont pas des états mission (`orchestrator-runtime.types.ts:1-18`). `ACCEPTED` sert de terminal final sans produire de certificat. Les états PowerShell (`READY_FOR_REVIEW`, `FAILED`, etc.) ne sont pas projetés fidèlement.

Le contexte enregistré conserve en outre son état initial `LOCKED` et n’est jamais mis à jour après les transitions (`orchestrator-runtime.service.ts:431-448`). L’état réel le confirme dans `.nova-data/runtime.json:383-423`.

**Impact.** Les consommateurs doivent deviner des équivalences et peuvent afficher un état contradictoire selon la source.

### NRA-015 — P1 — Persistance locale insuffisante pour une chaîne de preuve

**Constat.** `runtime.json` est remplacé via fichier temporaire (`nova-core.store.ts:24-29`), mais son chargement ne valide que `version === 1` (`:8-20`). Il n’existe ni hash chain, signature, sauvegarde restaurable, validation structurelle, journal append-only autoritatif ou ancrage externe.

Les audits sont présents dans le snapshot mais aucune route ne les expose (`nova-core.http.ts:47-125`). `.nova-data/` est ignoré par Git (`.gitignore:2`).

**Impact.** Une altération ou corruption locale peut réécrire l’histoire sans détection et empêcher le redémarrage.

### NRA-016 — P2 — Validation Git incomplète et sujette aux courses

**Constat.** Le précheck TypeScript exécute seulement `git branch --show-current` (`nova-core.execution.ts:201-215`). Il ne vérifie pas `rev-parse --is-inside-work-tree`, le HEAD, la version Git ou les codes de toutes les commandes de snapshot.

Le snapshot traite un HEAD absent comme `UNBORN` (`NovaCore.Reporting.psm1:55-63`) et n’échoue pas. Une branche peut changer entre le précheck TypeScript et la validation PowerShell.

**Impact.** Reproductibilité non garantie et diagnostic ambigu dans un dépôt incomplet, worktree/submodule inattendu ou course externe.

### NRA-017 — P2 — Attribution non déterministe des changements

**Constat.** Le delta attribue à la mission toute différence entre deux snapshots (`NovaCore.Reporting.psm1:129-173`). Le verrou PowerShell ne contrôle que les autres verrous NOVA, pas les processus humains, outils ou watchers. Les fichiers ignorés par Git ne sont pas inventoriés (`:62-73`).

Le verrou TypeScript ne détecte que des chaînes de scope strictement identiques (`orchestrator-runtime.service.ts:402-410`), pas les recouvrements parent/enfant ou globaux.

**Impact.** Des changements externes peuvent être certifiés comme produits par Codex ; deux scopes réellement superposés peuvent être admis.

### NRA-018 — P2 — Sémantique de scope incohérente avec l’interface

**Constat.** Le matcher utilise PowerShell `-like` sans rendre un répertoire récursif (`NovaCore.Reporting.psm1:176-180`). Le champ UI propose par défaut `server/nova-core` (`public/index.html:104-105`).

Contrôle direct réalisé :

```text
ExactDirectory=false
GlobDirectory=true
ExactFile=true
```

pour le chemin `server/nova-core/file.ts`.

**Impact.** La mission par défaut de l’interface échoue au premier fichier enfant, sauf si l’utilisateur connaît la convention `/**`.

### NRA-019 — P2 — Collisions de noms et contrôles de containment fragiles

**Constat.** `safeName()` remplace tout caractère non autorisé par `_` (`nova-core.execution.ts:420-422`) sans hash d’identité. Des identifiants distincts peuvent partager le même dossier.

Plusieurs contrôles PowerShell utilisent `StartsWith(repositoryRoot)` sans frontière de séparateur (`Test-NovaCoreMission.ps1:104-106`, `:146-150`) : un chemin frère préfixé par le nom du dépôt peut être accepté.

**Impact.** Mélange possible de prompts/rapports entre identifiants et validation imparfaite de chemins.

### NRA-020 — P2 — Validation d’entrée API incomplète

**Constat.** `assertMissionDefinition()` vérifie surtout présence et longueur (`orchestrator-runtime.service.ts:679-691`). Il ne valide pas strictement les types, l’absence de conflit allowed/forbidden, les chemins, `authorizedReferences`, la priorité ou les limites de taille métier.

**Impact.** Des objets JSON structurellement invalides peuvent être persistés puis échouer tardivement avec un `500` générique.

### NRA-021 — P2 — Les tests ne couvrent pas les risques critiques

**Constat.** Les tests passent, mais utilisent des lanceurs simulés. Aucun test ne couvre :

- propagation `exitCode/stdout/stderr` jusqu’à HTTP ;
- rapport ancien ou fingerprint invalide ;
- crash pendant `RUNNING` et reprise ;
- libération de verrou après `FAILED` ;
- rollback transactionnel d’une mutation ;
- sortie volumineuse, timeout ou annulation ;
- observabilité temps réel ;
- approbation liée au rapport et à l’autorité ;
- Codex CLI réel.

**Impact.** La suite verte protège le happy path sans détecter les défaillances observées en données réelles.

### NRA-022 — P2 — Capacités CEREBRAU exclues sans réconciliation complète

**Constat.** `NOVA_CORE_RUNTIME_ADAPTATION_REPORT.md:30-41` confirme l’exclusion du Campaign Runner. Le remplacement TypeScript possède une machine d’état, mais pas les primitives CEREBRAU suivantes :

- journal append-only avec projection durable et write-through ;
- reconstruction du state depuis le journal ;
- fingerprint campagne + manifest mission + prompt + preuves ;
- détection de drift et état `STALE` ;
- tentatives, reprise d’exécution interrompue et abandon explicite ;
- revue liée au SHA-256 du rapport ;
- stop/cancel contrôlé ;
- rapport et métriques de campagne.

Preuves CEREBRAU : `Cerebrau.Campaign.psm1` lignes 551-609, 865-943, 1029-1084, 1107-1119 dans l’archive.

**Impact.** NOVA n’est pas fonctionnellement équivalent au runtime CEREBRAU au niveau orchestration, robustesse, reprise et certification.

### NRA-023 — P3 — Bootstrap non reproductible et version Node non imposée

**Constat.** `DEMARRER_NOVA.bat:5-20` vérifie seulement la présence de Node, malgré l’exigence `>=22`, puis lance `npm install` si `node_modules` manque. Il n’utilise pas `npm ci`.

**Impact.** Une machine avec Node ancien est acceptée jusqu’à un échec tardif ; l’installation de démarrage peut diverger ou modifier le lock.

## 6. Erreurs masquées recensées

| Origine | Information disponible en interne | Information exposée |
|---|---|---|
| Git branch | code, stdout, stderr dans `details` | code + message générique |
| spawn PowerShell | message système dans `details` | code + message générique |
| Codex non nul avec rapport | exit code dans rapport | erreur textuelle synthétique, pas stderr |
| erreur JSON rapport | exception de parsing | `INTERNAL_ERROR` |
| journal PowerShell | type, message, stack, cwd, repository | non exposé par l’API |
| validation nommée | stdout + stderr agrégés | message dans blocker seulement si rapport mappé |
| exception inconnue | objet Error serveur | `INTERNAL_ERROR` sans correlation/run id |

## 7. Risques de non-déterminisme

1. configuration Codex utilisateur et environnement hérités ;
2. modèle distant nommé mais non versionné ;
3. résolution de l’exécutable par `PATH` sans hash ;
4. `Date.now()` et timestamps utilisés comme identifiants ;
5. rapport choisi par mtime ;
6. changements externes attribués à la mission ;
7. requête d’exécution non persistée ;
8. prompt remplaçable et écrasé ;
9. validation dépendante des dépendances locales ;
10. ordre et état du worktree non exclusifs.

## 8. Points positifs vérifiés

- le cœur `Invoke-NovaCoreMission.ps1` est identique au cœur CEREBRAU après renommage ;
- `NovaCore.ContextAssembly.psm1` est également identique après renommage ;
- les fichiers sensibles ajoutés à NOVA ne sont pas copiés dans le backup temporaire (`NovaCore.Reporting.psm1:4-17`, `:75-91`) ;
- prompt et manifeste sont en UTF-8 et stockés dans un espace isolé ;
- le manifeste interdit `.git`, `.nova-data`, `node_modules`, secrets et clés (`nova-core.execution.ts:137-151`) ;
- branche et HEAD sont comparés avant/après ;
- les fichiers suivis et non suivis non ignorés sont hashés ;
- le journal PowerShell est flushé avec `WriteThrough` (`Invoke-NovaCoreMission.ps1:70-89`) ;
- les rapports PowerShell possèdent un fingerprint interne ;
- les appels du service sont sérialisés par une queue globale ;
- le worktree est resté inchangé après les contrôles d’audit, avant création des livrables.

## 9. Conclusion de certification

Décision d’audit : **NON CERTIFIABLE — CORRECTIONS P0/P1 REQUISES**.

Le runtime peut servir à une démonstration locale contrôlée. Il ne doit pas être présenté comme reproductible, déterministe, temps réel ou certifié tant que NRA-001 à NRA-015 ne sont pas traitées et testées.

