# NOVA Program Engine — Production Certification Matrix

Résultats autorisés : PASS, FAIL, BLOCKED, NOT_APPLICABLE.  
Décision globale : **NO_GO_PRODUCTION**.

| ControlId | Domaine | Contrôle | Méthode | Preuve | Résultat | Sévérité | Impact | Remédiation requise | Gate bloquée | Décision |
|---|---|---|---|---|---|---|---|---|---|---|
| INT-001 | Intégrité | Continuité MissionContext → PromptPackage | Tests ciblés | EV-003 | PASS | P3 | Aucun observé | Non | — | Accepté |
| INT-002 | Intégrité | Compatibilité TypeScript | `tsc` | EV-007 | PASS | P3 | Aucun observé | Non | — | Accepté |
| INT-003 | Intégrité | Mapping sans perte | Test deep-equal | EV-004 | PASS | P3 | Aucun observé | Non | — | Accepté |
| INT-004 | Intégrité | Déterminisme mapping | Double exécution test | EV-004 | PASS | P3 | Aucun observé | Non | — | Accepté |
| INT-005 | Intégrité | Conservation identifiants nominale | Exécution réelle | EV-009, EV-010 | PASS | P2 | Corrélation nominale | Non | — | Accepté |
| INT-006 | Intégrité | Unicité globale des identifiants | Concurrence négative | EV-012 | FAIL | P1 | Corrélation ambiguë/double exécution | Oui | PRODUCTION | Bloquant |
| INT-007 | Intégrité | Raccord au service certifié concret | Revue imports + exécution | EV-016 | FAIL | P1 | Chaîne réelle non certifiée jusqu’au repository | Oui | PRODUCTION | Bloquant |
| INT-008 | Intégrité | Propagation fidèle des erreurs | Tests d’identité d’objet | EV-005 | PASS | P2 | Aucun observé | Non | — | Accepté |
| INT-009 | Intégrité | Absence de double chemin prompt | Revue ciblée | EV-016 | FAIL | P1 | `PromptComposer` et ancien `PromptAssembler` coexistent | Oui | PRODUCTION | Bloquant |
| INT-010 | Intégrité | Absence de cycle import ciblé | Graphe imports ciblé + `tsc` | EV-002, EV-007 | PASS | P2 | Aucun cycle observé | Non | — | Accepté |
| INT-011 | Intégrité | Feature Flag OFF isolé | Tests getters piégés | EV-003, EV-004, EV-005 | PASS | P1 | Aucun traitement OFF | Non | — | Accepté |
| SEC-001 | Sécurité | Secret en clair | Recherche de signature sans valeur | EV-015 | PASS | P1 | Aucun secret détecté | Non | — | Accepté |
| SEC-002 | Sécurité | Token persistant dans rapports | Inspection artefacts générés | EV-015 | PASS | P1 | Aucun token reproduit | Non | — | Accepté |
| SEC-003 | Sécurité | Politique Human Approval | Tests rôles/self-approval | EV-008 | PASS | P1 | Approbation structurelle | Non | — | Accepté |
| SEC-004 | Sécurité | Authentification production | Contrat + statut CLI | EV-014, EV-017 | FAIL | P1 | Identité production absente | Oui | PRODUCTION | Bloquant |
| SEC-005 | Sécurité | Sandbox Codex | Arguments + exécution réelle | EV-009, EV-010 | PASS | P0 | Écriture dépôt empêchée | Non | — | Accepté |
| SEC-006 | Sécurité | Restriction READ_ONLY | Git avant/après | EV-009, EV-010, EV-013 | PASS | P0 | Dépôt inchangé | Non | — | Accepté |
| SEC-007 | Sécurité | Permissions fichiers/ACL | Contrôle OS non exécuté | Aucune preuve suffisante | BLOCKED | P2 | ACL non certifiées | Oui | PRODUCTION | À prouver |
| SEC-008 | Sécurité | Permissions processus | Revue sandbox, pas d’audit OS complet | EV-016 | BLOCKED | P2 | Frontière hôte non certifiée | Oui | PRODUCTION | À prouver |
| SEC-009 | Sécurité | Validation entrées | Tests négatifs | EV-003 à EV-005 | PASS | P1 | Entrées structurées | Non | — | Accepté |
| SEC-010 | Sécurité | Injection commande shell | Prompt par stdin, args fixes | EV-016 | PASS | P1 | Métacaractères hors commande | Non | — | Accepté |
| SEC-011 | Sécurité | Injection de prompt | Revue de structure | EV-016 | FAIL | P1 | Données/instructions non séparées | Oui | PRODUCTION | Bloquant |
| SEC-012 | Sécurité | Protection chemins arbitraires | Exécution avec `C:\Windows` | EV-013 | FAIL | P1 | Accès lecture hors workspace possible | Oui | PRODUCTION | Bloquant |
| SEC-013 | Sécurité | Configuration utilisateur implicite | Argument CLI | EV-016 | PASS | P1 | Config ignorée | Non | — | Accepté |
| SEC-014 | Sécurité | Échec auth réel | Non provoqué pour protéger credential | Tests injectés seulement | BLOCKED | P2 | Réaction réelle non certifiée | Oui | PRODUCTION | À prouver |
| RES-001 | Résilience | Timeout | Timeout Codex réel 1 ms | EV-011 | PASS | P1 | Erreur typée propagée | Non | — | Accepté |
| RES-002 | Résilience | Annulation | AbortSignal réel précoce | EV-011 | PASS | P1 | Objet erreur conservé | Non | — | Accepté |
| RES-003 | Résilience | Interruption utilisateur | Aucun SIGINT réel sûr | EV-008 partiel | BLOCKED | P2 | État terminal non prouvé | Oui | PRODUCTION | À prouver |
| RES-004 | Résilience | Arrêt brutal processus Codex | Non exécuté | Aucune preuve suffisante | BLOCKED | P1 | Processus descendant possible | Oui | PRODUCTION | Bloquant |
| RES-005 | Résilience | Perte connexion | Injection seulement | EV-005 | BLOCKED | P2 | Comportement réseau réel non prouvé | Oui | PRODUCTION | À prouver |
| RES-006 | Résilience | Erreur Runtime | Injection + suite complète | EV-005, EV-008 | PASS | P1 | Erreur propagée | Non | — | Accepté |
| RES-007 | Résilience | Erreur Repository | Tests corruption/recovery | EV-008 | PASS | P1 | Fail closed observé | Non | — | Accepté |
| RES-008 | Résilience | Erreur Human Approval | Tests négatifs | EV-008 | PASS | P1 | Décision protégée | Non | — | Accepté |
| RES-009 | Résilience | Erreur Certification | Tests preuves altérées | EV-008 | PASS | P1 | Certification refusée | Non | — | Accepté |
| RES-010 | Résilience | Recovery ExecutionSession | Revue chemin réel | EV-016 | FAIL | P1 | Session d’échec non persistée | Oui | PRODUCTION | Bloquant |
| RES-011 | Résilience | Absence lock orphelin Runtime | Tests Runtime | EV-006, EV-008 | PASS | P1 | Locks libérés | Non | — | Accepté |
| RES-012 | Résilience | Idempotence relance Codex | Collision concurrente | EV-012 | FAIL | P1 | Deux exécutions acceptées | Oui | PRODUCTION | Bloquant |
| CON-001 | Concurrence | Deux missions indépendantes parallèles | Codex réel | EV-010 | PASS | P1 | Sorties isolées | Non | — | Accepté |
| CON-002 | Concurrence | Même workspace | Codex réel | EV-010 | PASS | P1 | Nominal isolé | Non | — | Accepté |
| CON-003 | Concurrence | Collision ExecutionSessionId | Deux appels concurrents | EV-012 | FAIL | P1 | Identifiant dupliqué | Oui | PRODUCTION | Bloquant |
| CON-004 | Concurrence | Collision MissionId | Deux appels concurrents | EV-012 | FAIL | P1 | Mission doublée | Oui | PRODUCTION | Bloquant |
| CON-005 | Concurrence | Collision PromptPackageId | Deux appels concurrents | EV-012 | FAIL | P1 | Package ambigu | Oui | PRODUCTION | Bloquant |
| CON-006 | Concurrence | Isolation résultats | Deux réponses distinctes | EV-010 | PASS | P1 | Aucun mélange observé | Non | — | Accepté |
| CON-007 | Concurrence | Isolation journaux/preuves réels | Pas de persistence dans chemin réel | EV-016 | BLOCKED | P1 | Mélange non exclu | Oui | PRODUCTION | Bloquant |
| CON-008 | Concurrence | Repository concurrent | Test deux écritures | EV-008 | PASS | P1 | Sérialisation observée | Non | — | Accepté |
| OBS-001 | Observabilité | Quatre identifiants requis | ExecutionSession réelle | EV-009, EV-010 | PASS | P1 | Corrélation nominale | Non | — | Accepté |
| OBS-002 | Observabilité | Timestamps/durée/statut | ExecutionSession réelle | EV-009, EV-010 | PASS | P2 | Chronologie nominale | Non | — | Accepté |
| OBS-003 | Observabilité | Code sortie et brut Codex | JSONL conservé | EV-009, EV-010 | PASS | P1 | Diagnostic succès | Non | — | Accepté |
| OBS-004 | Observabilité | Étape courante | Revue contrat | EV-016 | FAIL | P2 | Localisation panne limitée | Oui | PRODUCTION | À corriger |
| OBS-005 | Observabilité | Erreur liée à une session | Erreur transport | EV-005, EV-011 | FAIL | P1 | Échec non reconstruisible | Oui | PRODUCTION | Bloquant |
| OBS-006 | Observabilité | Événements Runtime du chemin réel | Relais en mémoire seulement | EV-009, EV-016 | BLOCKED | P1 | Audit Runtime incomplet | Oui | PRODUCTION | Bloquant |
| OBS-007 | Observabilité | Reconstruction bout en bout | Revue preuves persistées | EV-016 | FAIL | P1 | Mission réelle non reconstructible | Oui | PRODUCTION | Bloquant |
| DAT-001 | Données | Immutabilité preuves certifiées | Fingerprints/tests | EV-008 | PASS | P1 | Altération détectée | Non | — | Accepté |
| DAT-002 | Données | Cohérence timestamps/statuts | Tests + exécution | EV-005, EV-009 | PASS | P2 | Cohérence nominale | Non | — | Accepté |
| DAT-003 | Données | Absence donnée inventée | Mapping deep-equal | EV-004 | PASS | P1 | Mapping fidèle | Non | — | Accepté |
| DAT-004 | Données | PromptPackage original conservé | Résultat pipeline | EV-004, EV-005 | PASS | P1 | Référence conservée | Non | — | Accepté |
| DAT-005 | Données | Résultat brut conservé | ExecutionSession | EV-009, EV-010 | PASS | P1 | Brut accessible en mémoire | Non | — | Accepté |
| DAT-006 | Données | Décisions Human Approval/certification | Repository/tests | EV-008 | PASS | P1 | Décisions persistées | Non | — | Accepté |
| DAT-007 | Données | Absence écrasement silencieux | Repository collisions | EV-008 | PASS | P1 | Conflits rejetés | Non | — | Accepté |
| DAT-008 | Données | Conservation lors d’un échec réel | Revue adaptateur | EV-016 | FAIL | P1 | Session perdue à l’exception | Oui | PRODUCTION | Bloquant |
| PER-001 | Performance | Mesures étapes locales | 5 000 itérations | EV-018 | PASS | P3 | Baseline locale disponible | Non | — | Accepté |
| PER-002 | Performance | Exécutions successives/réelles | 3 exécutions observées | EV-009, EV-010 | PASS | P3 | Valeurs disponibles | Non | — | Accepté |
| PER-003 | Performance | Mémoire accessible | `process.memoryUsage` | EV-018 | PASS | P3 | Mesure limitée | Non | — | Accepté avec réserve |
| STA-001 | Stabilité | Suite complète | 424/424 | EV-008 | PASS | P0 | Aucune régression test | Non | — | Accepté |
| STA-002 | Stabilité | TypeScript | `tsc` code 0 | EV-007 | PASS | P0 | Contrats compilent | Non | — | Accepté |
| STA-003 | Stabilité | Runtime | 15/15 | EV-006 | PASS | P0 | Runtime stable | Non | — | Accepté |
| STA-004 | Stabilité | Intégrité Git/release | `git status`, HEAD | EV-001, EV-019 | FAIL | P1 | Composants absents du HEAD | Oui | PRODUCTION | Bloquant |
| STA-005 | Stabilité | Packages | `npm ls --depth=0` | EV-020 | PASS | P2 | Aucun package ajouté | Non | — | Accepté |
| OPS-001 | Exploitation | Configuration production | Preuve ciblée absente | EV-017 | FAIL | P1 | Déploiement non défini | Oui | PRODUCTION | Bloquant |
| OPS-002 | Exploitation | Secrets et rotation | Preuve ciblée absente | EV-014, EV-017 | FAIL | P1 | Credential non gouverné | Oui | PRODUCTION | Bloquant |
| OPS-003 | Exploitation | Supervision/alertes | Recherche ciblée | EV-017 | FAIL | P2 | Incident non détecté | Oui | PRODUCTION | À corriger |
| OPS-004 | Exploitation | Sauvegarde/restauration | Tests techniques, procédure absente | EV-008 | BLOCKED | P2 | RTO/RPO inconnus | Oui | PRODUCTION | À prouver |
| OPS-005 | Exploitation | Arrêt urgence | AbortSignal + flag | EV-005, EV-011 | PASS | P2 | Arrêt local possible | Non | — | Accepté partiellement |
| OPS-006 | Exploitation | Ownership/escalade | Preuve absente | EV-017 | FAIL | P2 | Responsabilité inconnue | Oui | PRODUCTION | À corriger |
| OPS-007 | Exploitation | Désactivation Feature Flag | Tests OFF | EV-003 à EV-005 | PASS | P1 | Kill switch logique | Non | — | Accepté |
| MPR-001 | Multi-projet | Contextes projet | Tests Runtime | EV-006, EV-008 | PASS | P2 | Isolation cœur observée | Non | — | Accepté |
| MPR-002 | Multi-projet | Workspaces autorisés | Chemin arbitraire | EV-013 | FAIL | P1 | Frontière projet absente | Oui | PRODUCTION | Bloquant |
| MPR-003 | Multi-projet | Corrélation projectId complète | Revue contrats | EV-016 | FAIL | P1 | Projet absent package/session | Oui | PRODUCTION | Bloquant |
| MPR-004 | Multi-projet | Priorité/allocation/capacité | Aucune preuve ciblée | EV-017 | BLOCKED | P2 | Orchestration autonome non prouvée | Oui | PRODUCTION | À prouver |
| DEC-001 | Décision | Évaluation native | Evaluator avec faits audit | EV-019 | FAIL | P1 | `NOT_READY`, activation false | Oui | PRODUCTION | NO_GO |

Conclusion matricielle : présence de plusieurs P1 ouverts et de contrôles sécurité/recovery critiques en échec.

NO_GO_PRODUCTION
