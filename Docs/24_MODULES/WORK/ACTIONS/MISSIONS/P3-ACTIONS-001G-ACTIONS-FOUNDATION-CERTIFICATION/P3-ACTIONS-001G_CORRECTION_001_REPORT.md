# P3-ACTIONS-001G — RAPPORT DE CORRECTION 001

## 1. Identification

| Attribut | Valeur |
|---|---|
| DomainId | `ACTIONS` |
| LotId | `P3-ACTIONS-001G` |
| MissionId | `P3-ACTIONS-001G-CORRECTION-001` |
| Objet | Correction de l'écart n°1 `ACTIONS-G-001` |
| Périmètre | Vérification de l'existence du Work autoritatif lors de `ProposeAction` |
| Verdict de l'écart n°1 | **PASS** |

Ce document est un rapport factuel sur le delta déjà présent. La mission de reporting n'a réalisé aucune nouvelle correction fonctionnelle, n'a modifié aucun certificat et n'a modifié aucun registre canonique.

## 2. Problème initial

Le rapport de certification `P3-ACTIONS-001G_ACTIONS_FOUNDATION_CERTIFICATION_REPORT.md` constatait l'écart bloquant `ACTIONS-G-001` :

- `WorkReference.of` ne validait que la structure de deux identifiants non vides ;
- `ActionsAuthority` ne recevait aucune capacité de lecture permettant de vérifier un Work autoritatif ;
- `ActionsAuthority.#propose` contrôlait la révision attendue et l'unicité de l'Action, puis acceptait la proposition sans prouver l'existence du Work référencé ;
- `WORK_REFERENCE_NOT_FOUND` ne couvrait donc pas le cas d'une référence bien formée pointant vers un Work absent.

Le comportement ne satisfaisait pas les sections 6, 11.1, 12 et 15 du contrat d'implémentation ACTIONS, qui imposent qu'une Action soit proposée dans un Work existant et que l'absence du Work soit rejetée.

## 3. Cause racine

La cause racine était l'absence d'un port d'admission Work sur l'unique producteur autoritatif ACTIONS. Le constructeur de `ActionsAuthority` ne recevait auparavant que le journal optionnel ; aucune dépendance obligatoire ne permettait à la frontière de commande d'interroger l'existence du Work. La validation de `WorkReference` restait par conséquent syntaxique et ne pouvait pas établir l'existence autoritative.

## 4. Correction effectivement présente

Le delta courant réalise les changements suivants :

1. Ajout de l'interface obligatoire `ActionsAdmissionPolicy`, avec l'opération en lecture seule `workExists(workReference: WorkReference): boolean`.
2. Injection obligatoire de cette politique dans le constructeur de `ActionsAuthority` et conservation de la politique dans `#admission`.
3. Pour chaque commande `ProposeAction`, appel de `#assertWorkExists` avant la création ou l'évolution de l'état ACTIONS.
4. Si `workExists` retourne `false`, émission de `ActionDomainError` avec le code existant `WORK_REFERENCE_NOT_FOUND` et le message `WorkReference does not identify an authoritative Work.`
5. Propagation obligatoire de la politique d'admission dans les fabriques `ActionsInternalAccess.inMemory` et `ActionsInternalAccess.durable`.
6. Export public de type de `ActionsAdmissionPolicy` depuis le barrel interne ACTIONS.
7. Adaptation des usages de test existants par injection explicite d'une politique, sans valeur par défaut permissive dans le code fonctionnel.

La vérification est également empruntée lors de la reconstruction d'un journal, puisque le replay appelle le même chemin `#acceptInMemory` pour les commandes `ProposeAction` historiques.

## 5. Fichiers réellement créés ou modifiés

### Delta fonctionnel déjà présent

Aucun nouveau fichier fonctionnel n'a été créé par la correction. Sept fichiers préexistants ont été modifiés dans le groupe cohérent du correctif :

- `server/domain/actions/actions-authority.ts`
- `server/domain/actions/actions-internal-access.ts`
- `server/domain/actions/index.ts`
- `server/domain/actions/actions-authority.test.ts`
- `server/domain/actions/actions-persistence.test.ts`
- `server/domain/actions/actions-internal-access.test.ts`
- `server/domain/work/work-actions.test.ts`

### Delta de la présente mission de reporting

Un seul fichier est créé :

- `Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001G-ACTIONS-FOUNDATION-CERTIFICATION/P3-ACTIONS-001G_CORRECTION_001_REPORT.md`

Aucun autre fichier n'a été créé, modifié, supprimé, restauré ou nettoyé par cette mission de reporting.

## 6. Tests réellement ajoutés ou modifiés

Deux tests ont été ajoutés :

1. `actions-authority.test.ts` — `ProposeAction admits only Actions whose WorkReference identifies an authoritative Work` :
   - accepte une Action liée au Work déclaré existant ;
   - rejette une référence bien formée vers un Work absent avec `WORK_REFERENCE_NOT_FOUND` ;
   - vérifie que le rejet ne modifie pas l'état canonique en mémoire.
2. `actions-persistence.test.ts` — `rejected ProposeAction for an absent authoritative Work mutates and persists nothing` :
   - établit d'abord un état et un journal valides ;
   - rejette ensuite une proposition liée à un Work absent ;
   - vérifie l'identité de l'état avant/après et l'identité octet pour octet du journal avant/après.

Les tests existants des fichiers suivants ont été adaptés à la nouvelle signature obligatoire, sans ajout d'une nouvelle sémantique métier :

- `actions-authority.test.ts` : politique `ADMIT_ALL_WORKS` injectée dans les scénarios existants ;
- `actions-persistence.test.ts` : politique injectée dans les autorités en mémoire, durables, redémarrées et concurrentes ;
- `actions-internal-access.test.ts` : politique injectée dans les fabriques internes en mémoire et durables ;
- `work-actions.test.ts` : politique `ACTIONS_ADMISSION` limitée au `WorkReference` du fixture injectée dans les fabriques internes.

Le total ACTIONS passe du niveau antérieurement rapporté de 33 tests à 35 tests, ce qui correspond exactement aux deux nouveaux tests.

## 7. Validations réellement exécutées pendant ce reporting

Toutes les commandes ci-dessous ont été exécutées depuis la racine du dépôt le 11 septembre 2026.

| Validation | Commande exacte | Résultat mesuré |
|---|---|---|
| Tests ACTIONS | `node --import tsx --test server/domain/actions/*.test.ts` | **PASS** — 35 tests, 35 PASS, 0 FAIL, 0 cancelled, 0 skipped, 0 todo |
| Tests WORK applicables | `node --import tsx --test server/domain/work/*.test.ts server/runtime/work/*.test.ts` | **PASS** — 67 tests, 67 PASS, 0 FAIL, 0 cancelled, 0 skipped, 0 todo |
| Typecheck ACTIONS | `.\node_modules\.bin\tsc.cmd -p server/domain/actions/tsconfig.json` | **PASS** — code 0, 0 erreur |
| Typecheck WORK | `.\node_modules\.bin\tsc.cmd -p server/domain/work/tsconfig.json` | **PASS** — code 0, 0 erreur |
| Typecheck NOVA Core | `npm.cmd run typecheck:nova-core` | **PASS** — code 0, 0 erreur |
| Tests Core | `npm.cmd run test:core` | **PASS** — 541 tests, 541 PASS, 0 FAIL, 0 cancelled, 0 skipped, 0 todo |
| Whitespace Git global | `git diff --check` | **PASS** — code 0, aucune erreur whitespace |

Bilan exécutable chiffré des trois commandes de tests : **643 tests exécutés, 643 PASS, 0 FAIL, 0 cancelled, 0 skipped, 0 todo**.

Transparence d'exécution : les premières tentatives `npm run typecheck:nova-core` et `npm run test:core` ont chacune retourné le code 1 avant de lancer leur script, car PowerShell bloquait `npm.ps1` par sa politique d'exécution. Il s'agissait de deux erreurs d'invocation, pas de résultats de validation du code. Les commandes ont été rejouées avec l'exécutable Windows `npm.cmd` et ont ensuite produit les résultats PASS chiffrés ci-dessus.

Aucune autre validation n'est revendiquée par ce rapport.

## 8. Non-régressions constatées

- Les 33 tests ACTIONS préexistants restent verts ; les deux nouveaux tests portent le total à 35/35.
- Les 67 tests WORK et Runtime/Work restent verts, y compris les 8 tests de l'intégration Work/ACTIONS.
- Les 541 tests NOVA Core restent verts.
- Les compilations strictes ACTIONS, WORK et NOVA Core terminent avec 0 erreur.
- Aucune régression exécutable n'a été observée dans les périmètres effectivement relancés.

## 9. Résultat de `git diff --check`

`git diff --check` est disponible et a terminé avec le code 0. Aucune erreur d'espace final ou de whitespace n'a été signalée. Git a émis 9 avertissements LF/CRLF concernant des fichiers suivis préexistants hors du delta de cette correction.

Limite importante : l'arbre `server/domain/actions/` et une partie de `server/domain/work/` sont actuellement non suivis dans le worktree ; `git diff --check` n'inspecte pas le contenu des fichiers non suivis. Son résultat ne constitue donc pas, à lui seul, une preuve whitespace des sept fichiers du correctif.

## 10. Limites et traçabilité du delta

- Le dépôt est fortement sale et les racines ACTIONS/WORK concernées apparaissent comme non suivies. Git ne fournit donc pas de diff ligne à ligne contre une baseline versionnée pour ce correctif. L'attribution des sept fichiers repose sur le contenu courant, les rapports antérieurs et leur groupe d'horodatages cohérent du 11 septembre 2026 entre 17:08:47 et 17:11:10.
- La correction définit un port d'admission et rend son injection obligatoire, mais ce delta ne fournit pas de nouvel adaptateur de production vers une source Work concrète. Les tests utilisent des politiques injectées déterministes ; ils prouvent le comportement de la frontière ACTIONS, pas l'autorité réelle d'un futur fournisseur de `workExists`.
- La vérification est synchrone et son indisponibilité/exception n'est pas traduite par un code métier distinct dans ce delta.
- Parce que le replay durable emprunte le même contrôle, la reconstruction dépend de la réponse courante de la politique pour les Work historiques. Aucun test nouveau ne couvre la disparition ultérieure d'un Work déjà admis.
- Les validations PEOPLE, PLANNING et Runtime complet rapportées dans la certification 001G initiale n'ont pas été relancées pendant cette mission de reporting et ne sont pas revendiquées comme validations de cette correction.
- Le registre `Docs/12_CERTIFICATION/certification-registry.json` et l'arbre `Docs/12_CERTIFICATION/ACTIONS/` étaient déjà sales/non suivis à l'entrée ; ils n'ont pas été modifiés par cette mission.

## 11. Écarts n°2 et n°3 hors périmètre

Confirmation explicite :

- l'écart n°2 `ACTIONS-G-002`, relatif à l'alternative de constatation explicite lors de la complétion, reste hors périmètre et n'est pas corrigé par ce delta ;
- l'écart n°3 `ACTIONS-G-003`, relatif à l'événement émis par `RetryAction` pour la transition `FAILED -> READY`, reste hors périmètre et n'est pas corrigé par ce delta.

Aucun fichier portant la sémantique de complétion, le modèle de Result, la définition des événements ou la transition Retry n'appartient au groupe de fichiers modifiés par la correction 001.

## 12. Verdict

**PASS pour l'écart n°1 `ACTIONS-G-001`.**

La frontière autoritative ACTIONS exige désormais une capacité explicite de vérification Work, contrôle chaque `ProposeAction`, rejette un Work absent avec `WORK_REFERENCE_NOT_FOUND` et ne publie ni état mémoire ni écriture durable lors du rejet. Les deux tests dédiés passent, les régressions applicables relancées passent et les limites ci-dessus ne contredisent pas la fermeture technique de l'écart n°1 au niveau de la fondation ACTIONS.
