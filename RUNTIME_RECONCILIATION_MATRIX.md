# RUNTIME-NOVA-AUDIT-001 — Matrice de réconciliation NOVA ↔ CEREBRAU

Date : 24 juillet 2026

## 1. Référence de comparaison

Baseline CEREBRAU : `../DOCS/cerebrau-audit-20260724-101440.zip`  
SHA-256 : `14622D482B5C914EBCF13F4932418F9EC25954CF5FD7330C5CE615FAFA3219E5`

La comparaison porte sur l’archive fournie, pas sur un runtime CEREBRAU actif. Aucun fichier CEREBRAU n’a été modifié.

## 2. Résultat de filiation

Après normalisation stricte des noms :

| CEREBRAU | NOVA | Résultat |
|---|---|---|
| `Invoke-CerebrauMission.ps1` | `Invoke-NovaCoreMission.ps1` | identique |
| `Cerebrau.ContextAssembly.psm1` | `NovaCore.ContextAssembly.psm1` | identique |
| `Resolve-CerebrauProfile.ps1` | `Resolve-NovaCoreProfile.ps1` | identique |
| `Cerebrau.Reporting.psm1` | `NovaCore.Reporting.psm1` | adapté |
| `Cerebrau.Governance.psm1` | `NovaCore.Governance.psm1` | adapté aux domaines NOVA |
| `Test-CerebrauMission.ps1` | `Test-NovaCoreMission.ps1` | étendu aux commandes NOVA |

Conséquence : les défauts du lanceur unitaire, du journal unitaire, de Git, de la CLI et de la décision PowerShell ne sont pas des régressions de copie. Ils sont hérités de CEREBRAU. Les régressions NOVA apparaissent surtout à la frontière TypeScript et dans l’exclusion du Campaign Runner.

## 3. Matrice détaillée

| Axe | CEREBRAU de référence | NOVA audité | Écart | Qualification | Justification |
|---|---|---|---|---|---|
| Lanceur unitaire | PowerShell `Invoke-CerebrauMission.ps1` | copie renommée | aucun écart fonctionnel | PARITÉ | fichiers identiques après renommage |
| Context Assembly | contexte hashé, sources ordonnées | copie renommée | aucun écart fonctionnel | PARITÉ | fichiers identiques après renommage |
| Profils | FAST/BUILD/ARCHITECTURE/READ_ONLY | mêmes paramètres techniques | descriptions adaptées | PARITÉ | registres équivalents |
| Protection secrets | backup de tous les fichiers inventoriés | contenu sensible exclu du backup | NOVA plus sûr | AMÉLIORATION | `NovaCore.Reporting.psm1:4-17`, `:75-91` |
| Commandes de validation | quatre commandes runtime | commandes runtime + NOVA Core + NOVA Web | extension ciblée | AMÉLIORATION PARTIELLE | allowlist adaptée, couverture serveur encore incomplète |
| Domaines de freeze | VEEDDA/client/offer/supabase | NOVA Web/Core/runtime/docs | adaptation | PARITÉ CIBLÉE | `NovaCore.Governance.psm1:7-12` |
| Orchestration multi-mission | Campaign Runner complet | volontairement exclu | capacités absentes | RÉGRESSION ARCHITECTURALE | rapport d’adaptation lignes 30-41 |
| Machine d’état campagne | NEW, VALIDATING, READY, RUNNING, review, terminal | DRAFT, READY, ASSIGNED, LOCKED, RUNNING, validations, ACCEPTED | vocabulaire et sémantique divergents | À RÉCONCILIER | pas de `COMPLETED`/`CERTIFIED` NOVA |
| Persistance | journal append-only + projection atomique write-through | snapshot JSON remplacé après mutation | durabilité inférieure | RÉGRESSION | CEREBRAU lignes 551-609 ; NOVA store lignes 24-29 |
| Reprise | replay journal, récupération/abandon des attempts | aucune reprise | absent | RÉGRESSION | CEREBRAU lignes 636-650, 877-903 |
| Idempotence | fingerprints campagne/mission/prompt/preuves | hash dans PowerShell, non lié au state TypeScript | chaîne coupée | RÉGRESSION | CEREBRAU lignes 511-540, 737-743 |
| Drift | preuve modifiée => `STALE` | aucune transition de drift | absent | RÉGRESSION | CEREBRAU lignes 1047-1057 |
| Rapport courant | nouvelle tentative exclut les rapports connus | rapport choisi par mtime | risque de rapport ancien | RÉGRESSION | CEREBRAU lignes 915-933 ; NOVA `findNewestOfficialReport()` |
| Revue | hash rapport requis et revérifié | endpoint approve sans hash | lien de preuve absent | RÉGRESSION CRITIQUE | CEREBRAU lignes 1107-1117 |
| Identité de l’autorité | auteur déclaratif | aucune identité dans l’appel | plus faible | RÉGRESSION | NOVA approve sans body |
| Contrôle stop/cancel | requête de contrôle et safe point | aucune route | absent | RÉGRESSION | CEREBRAU lignes 1063-1068 |
| Rollback | rollback documentaire borné et vérifié | aucun rollback | absent | ÉCART ASSUMÉ À RISQUE | CEREBRAU lignes 778-845 |
| Métriques | journal, counts, attempts, reviews, resumes | événements mission seulement | couverture inférieure | RÉGRESSION | CEREBRAU lignes 948-969 |
| Journal unité | stages start/finish/failure | copie identique | parité, mêmes limites | PARITÉ INSUFFISANTE | pas de stdout/stderr temps réel |
| Événements UI | CLI/campagne, pas UI NOVA | endpoint events + timeline | NOVA plus accessible | AMÉLIORATION PARTIELLE | pas de streaming ni progression |
| Git | snapshots/hash/delta/branche/HEAD | copie identique | mêmes limites | PARITÉ INSUFFISANTE | attribution externe possible |
| Codex CLI | version min, modèle/sandbox, stdin | copie identique | mêmes limites | PARITÉ INSUFFISANTE | config utilisateur non isolée |
| Preuves opérationnelles | 94 rapports, 99 journaux dans archive | zéro rapport/journal local | maturité non démontrée | RÉGRESSION DE PREUVE | seuls tests fake disponibles |
| Certification | décision structurée PowerShell + review campagne hashée | FinalAuthority PowerShell ignorée par TypeScript | autorité divergente | RÉGRESSION CRITIQUE | deux modèles de décision non réconciliés |

## 4. Réconciliation du cycle de vie

| Contrat cible | CEREBRAU campagne | NOVA actuel | Cible recommandée |
|---|---|---|---|
| `CREATED` | `NEW` | `DRAFT` + `MissionCreated` | état canonique `CREATED` ou mapping versionné |
| `ASSIGNED` | mission manifestée/ready set | `ASSIGNED` | conserver, avec affectation atomique |
| `STARTED` | `MISSION_STARTED` | `AgentStarted` puis `RUNNING` | événement durable `STARTED` |
| `RUNNING` | state + attempt durable | mémoire jusqu’à fin du handler | checkpoint durable + attempt id |
| `VALIDATING` | preflight/review states | trois états de validation | état parent + sous-étape |
| `COMPLETED` | `COMPLETED`/`SUCCEEDED` | `SUBMITTED` puis `ACCEPTED` | séparer exécution terminée et décision |
| `FAILED` | terminal/reprenable selon politique | présent, verrou conservé | terminal technique avec politique de reprise |
| `CERTIFIED` | review liée au hash | absent | décision d’autorité liée au fingerprint |

## 5. Réconciliation des responsabilités

| Responsabilité | Autorité recommandée | Motif |
|---|---|---|
| génération du prompt/manifeste | NOVA service | identité et persistance centralisées |
| exécution Codex unitaire | moteur PowerShell NOVA | filiation CEREBRAU déjà stable |
| journal technique des stages | moteur PowerShell | proximité du processus |
| état canonique mission | orchestrateur NOVA | source consommée par l’interface |
| projection du journal | orchestrateur NOVA | reprise et cohérence |
| validation du rapport/fingerprint | adaptateur NOVA | frontière de confiance |
| décision technique | validateur NOVA | séparée de l’exécution |
| certification | autorité authentifiée | jamais le worker ou un POST anonyme |
| émission du certificat | service de certification | doit lier mission, run, rapport et autorité |

## 6. Décisions de réconciliation proposées

1. Conserver le moteur PowerShell NOVA autonome et les exclusions de contenu sensible.
2. Ne pas réintroduire une dépendance d’exécution vers CEREBRAU actif.
3. Porter dans NOVA les primitives, pas nécessairement le Campaign Runner entier :
   journal append-only, attempt, replay, fingerprint, drift, report binding et contrôle.
4. Établir un mapping d’état unique et versionné entre PowerShell, orchestrateur et UI.
5. Faire du `runId` NOVA l’identité transmise au moteur et présente dans tous les artefacts.
6. Refuser tout rapport qui ne correspond pas à `projectId + missionId + runId + manifestHash`.
7. Lier toute décision finale au `ReportFingerprint` et à une autorité authentifiée.
8. Traiter les défauts du cœur unitaire comme dettes communes héritées, pas comme preuve de parité suffisante.

## 7. Conclusion

NOVA a correctement isolé et adapté le moteur unitaire CEREBRAU, avec une amélioration réelle sur les backups sensibles. Il n’a pas encore réconcilié les garanties du Campaign Runner avec son nouvel orchestrateur.

La parité de code du lanceur ne vaut donc pas parité de runtime complet. Sur robustesse, reprise, déterminisme, traçabilité et certification, CEREBRAU reste la baseline supérieure dans l’archive auditée.

