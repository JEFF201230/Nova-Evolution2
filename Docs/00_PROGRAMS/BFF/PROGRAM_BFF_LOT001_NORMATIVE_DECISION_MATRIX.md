# PROGRAM BFF — LOT001 NORMATIVE DECISION MATRIX

Date : `2026-07-29`  
Mission : `PROGRAM_BFF_LOT001_NORMATIVE_DECISION_MATRIX`  
Nature : registre des décisions normatives manquantes  
Statut : `COMPLETED`

## 1. Objet

Le présent document identifie exclusivement les décisions normatives qui
restent nécessaires avant la création d'une spécification officielle du
LOT001 et dont la valeur ne peut pas être déduite du corpus autorisé.

Ce document :

- n'est pas une spécification ;
- ne fixe aucune valeur normative ;
- ne propose aucune règle ;
- ne modifie ni ne corrige les preuves existantes.

## 2. Corpus autorisé

| Référence | Document effectivement consulté |
|---|---|
| `S1` | `PROGRAM_BFF_LOT_001_IMPLEMENTATION_REPORT.md` |
| `S2` | `PROGRAM_BFF_LOT_001_GO_NO_GO.md` |
| `S3` | `Docs/00_PROGRAMS/BFF/PROGRAM_BFF_LOT001_SPECIFICATION_RECOVERABILITY_REPORT.md` |
| `S4` | `Docs/00_PROGRAMS/BFF/PROGRAM_BFF_MASTER_ROADMAP.md` |
| `S5` | `Docs/00_PROGRAMS/BFF/PROGRAM_BFF_LOT001_NORMATIVE_DECISION_MATRIX_VALIDATION_REPORT.md` |

Les deux premiers noms fournis dans la mission sans séparateur entre `LOT` et
`001` ne correspondent à aucun fichier présent. Les documents LOT001
effectivement référencés par `S3` et `S4`, et seuls présents sous ces rôles,
portent les noms avec séparateur `_` indiqués ci-dessus.

## 3. Règle d'inscription

Une ligne est inscrite uniquement lorsque :

1. la matière est nécessaire à l'un des domaines contrôlés ;
2. le corpus ne fournit pas une valeur normative exhaustive ;
3. la valeur ne peut pas être obtenue par recoupement des sources documentaires
   listées ;
4. renseigner cette valeur exigerait une décision nouvelle.

`UNKNOWN` signifie qu'aucune valeur normative n'est établie.  
`PARTIAL` signifie que des faits d'implémentation ou de validation existent,
mais qu'ils ne suffisent pas à établir la règle normative.

## 4. Matrice officielle des décisions manquantes

| Identifiant | Domaine | Élément concerné | Valeur actuelle | Justification | Source documentaire | Décision attendue | Impact documentaire |
|---|---|---|---|---|---|---|---|
| `LOT001-NDM-001` | Prérequis | Prérequis officiel d'entrée du LOT001 | `UNKNOWN` | La roadmap marque explicitement le prérequis `UNKNOWN`. Aucun document ne déclare une valeur, y compris une absence explicite de prérequis. Le fait que LOT001 soit le premier lot documenté ne permet pas de conclure. | `S4`, §2, LOT001 ; `S3`, §4 et §7 | Statuer sur la valeur officielle du prérequis du LOT001. | Section « Prérequis » et métadonnées d'ouverture de la future spécification. |
| `LOT001-NDM-002` | Prérequis | Condition et preuve de satisfaction du prérequis | `UNKNOWN` | Aucun mécanisme d'attestation n'est défini. Il ne peut être déduit tant que la valeur du prérequis elle-même reste inconnue. | `S3`, §7 ; `S4`, §2, LOT001 | Statuer sur la condition d'entrée et sur la preuve attendue pour le prérequis retenu. | Règles d'ouverture du lot, dossier de validation et traçabilité du prérequis. |
| `LOT001-NDM-003` | Référentiel normatif | Nature temporelle de la spécification à créer | `UNKNOWN` | Le corpus décrit l'état livré et validé après implémentation, mais ne dit pas si la future spécification doit reconstituer l'intention initiale, formaliser l'état accepté, ou suivre une autre base normative. Choisir l'une de ces bases serait une hypothèse. | `S1`, ensemble du rapport ; `S2`, décision postérieure ; `S3`, §4 et §7 | Statuer sur la base normative et la date d'effet que devra représenter la future spécification. | Objet, portée, statut et traitement des écarts dans la future spécification. |
| `LOT001-NDM-004` | Exigences | Catalogue exhaustif des exigences LOT001 | `PARTIAL` | Des propriétés livrées sont décrites, mais `S3` conclut que leur exhaustivité normative et les exigences initiales non livrées sont inconnues. Un rapport d'implémentation ne démontre pas à lui seul le catalogue prescriptif complet. | `S1`, §§ Résultat à Frontières respectées ; `S3`, §4 et §7 | Statuer sur la liste exhaustive des exigences appartenant au LOT001. | Corps des exigences et table de couverture de la future spécification. |
| `LOT001-NDM-005` | Exigences | Statut normatif du service, du serveur, du cycle de vie et des endpoints techniques livrés | `PARTIAL` | Les composants, comportements de démarrage et d'arrêt, quatre endpoints et réponses 404/405 sont prouvés comme livrés. Leur reprise exhaustive comme exigences normatives n'est pas décidée. | `S1`, §§ Résultat, Serveur et Endpoints exposés ; `S3`, §4 et §7 | Statuer, pour chaque propriété démontrée de cet ensemble, sur son appartenance au référentiel d'exigences et sa formulation normative. | Exigences d'architecture, d'exploitation et contrats HTTP de la future spécification. |
| `LOT001-NDM-006` | Exigences | Statut normatif des middlewares et contrôles de sécurité livrés | `PARTIAL` | Correlation ID, journalisation, erreurs, validation JSON, CSRF, authentification et RBAC sont implémentés et testés, sans preuve qu'ils constituent la totalité ni la formulation initiale des exigences. | `S1`, § Modules ; `S2`, matrice de décision ; `S3`, §4 et §7 | Statuer, contrôle par contrôle, sur son appartenance au référentiel d'exigences et sa formulation normative. | Exigences de sécurité, de traitement des requêtes, de journalisation et d'erreur. |
| `LOT001-NDM-007` | Exigences | Statut normatif de la politique de session et de cookies observée | `PARTIAL` | Le store mémoire mono-instance, la rotation, les expirations, les attributs du cookie et plusieurs contraintes sont décrits comme état livré. Leur caractère obligatoire, optionnel ou circonstanciel n'est pas établi par une spécification antérieure. | `S1`, §§ Sessions et Cookies ; `S2`, §§ Matrice de décision et Réserves ; `S3`, §4 et §7 | Statuer sur les propriétés de session et de cookie qui doivent devenir des exigences normatives. | Exigences de session, de cookie, de confidentialité et limites d'exploitation. |
| `LOT001-NDM-008` | Exigences | Statut normatif des modes HTTPS, du proxy de confiance et des paramètres de configuration | `PARTIAL` | Les modes et valeurs acceptés par l'implémentation sont documentés. Le corpus ne décide pas lesquels constituent des exigences prescriptives, des valeurs par défaut normatives ou de simples caractéristiques de l'état livré. | `S1`, §§ HTTPS et proxy interne et Configuration ; `S3`, §4 et §7 | Statuer sur le contenu normatif de la configuration, des modes de transport et du proxy de confiance. | Exigences de déploiement, configuration et sécurité transport. |
| `LOT001-NDM-009` | Exigences | Statut normatif des scripts, du `noEmit`, de l'empreinte et des frontières protégées | `PARTIAL` | Les scripts, l'absence de package ajouté, les frontières non modifiées et une empreinte sont constatés après livraison. Aucune source ne décide si chacun de ces faits était une exigence obligatoire du LOT001. | `S1`, §§ Scripts, Frontières respectées et Empreinte ; `S2`, matrice de décision ; `S3`, §4 et §7 | Statuer sur les propriétés de construction, d'artefact, d'empreinte et de frontière à inscrire comme exigences. | Exigences de build, intégrité du périmètre et exclusions normatives. |
| `LOT001-NDM-010` | Exigences | Niveau d'obligation de chaque exigence | `UNKNOWN` | `S3` constate explicitement l'absence de distinction obligatoire/optionnelle. Les résultats `PASS` ne permettent pas de reconstruire cette classification. | `S3`, §4 et §7 ; `S2`, matrice de décision | Statuer sur le niveau d'obligation de chaque exigence retenue. | Modalité normative de chaque exigence et règles d'acceptation associées. |
| `LOT001-NDM-011` | Exigences | Exigences initiales non livrées, abandonnées ou différées | `UNKNOWN` | Le rapport d'implémentation ne peut prouver l'absence d'exigences initialement prévues mais non livrées. `S3` identifie expressément cette lacune. Les réserves ne suffisent pas à reconstituer une liste normative. | `S1`, § Réserves fonctionnelles implicites dans les frontières ; `S2`, § Réserves ; `S3`, §4 et §7 | Statuer sur l'existence, l'identité et le statut normatif d'éventuelles exigences non livrées, abandonnées ou différées. | Historique des exigences, exclusions, écarts et traçabilité de couverture. |
| `LOT001-NDM-012` | Critères NO GO | Conditions normatives de refus du LOT001 | `NOT FOUND` | La décision GO/NO GO énumère seulement des critères ayant obtenu `PASS`. Aucun seuil d'échec, combinaison de résultats ou cas de refus n'est défini. L'inversion des critères GO serait une règle inventée. | `S2`, matrice de décision et décision ; `S3`, §4 et §7 | Statuer sur les conditions qui produisent un résultat NO GO. | Matrice de décision et règles de refus de la future spécification. |
| `LOT001-NDM-013` | Critères NO GO | Libellé et statut officiels de la décision alternative | `NOT FOUND` | Seule la valeur `BFF_LOT_001_READY` est démontrée. Aucune valeur alternative officielle en cas d'échec n'existe dans le corpus. | `S2`, § Décision ; `S3`, §4 et §7 ; `S4`, §2, LOT001 | Statuer sur la décision officielle à enregistrer lorsqu'un NO GO est prononcé. | Vocabulaire de décision, statuts du lot et enregistrement de certification. |
| `LOT001-NDM-014` | Critères NO GO | Conséquences documentaires et nouvelle évaluation après un échec | `UNKNOWN` | Aucun document ne décrit le traitement d'un `FAIL`, la levée d'une réserve ou les conditions d'une nouvelle évaluation. Les déduire de la décision GO observée est impossible. | `S2`, ensemble du document ; `S3`, §7 | Statuer sur le traitement documentaire et les conditions de réévaluation après un échec. | Cycle GO/NO GO, historique des décisions et gestion des écarts. |
| `LOT001-NDM-015` | Dépendances | Inventaire exhaustif et classification des dépendances | `PARTIAL` | Des frontières Runtime/React, des origines et un proxy sont décrits, tandis que le prérequis officiel et la liste normative exhaustive des dépendances sont absents. Il est impossible de distinguer exhaustivement dépendance requise, optionnelle et élément hors périmètre. | `S1`, §§ HTTPS et proxy interne, Configuration et Frontières respectées ; `S3`, §4 et §7 ; `S4`, §2, LOT001 | Statuer sur l'inventaire complet des dépendances et sur la classification normative de chacune. | Section « Dépendances », prérequis techniques et limites d'intégration. |
| `LOT001-NDM-016` | Dépendances | Contraintes de version, de disponibilité et d'environnement des dépendances | `UNKNOWN` | Les sources nomment Node/TypeScript, des scripts, un proxy éventuel et des origines, sans établir de matrice normative de versions, de disponibilité ou d'environnements supportés pour le LOT001. | `S1`, §§ Serveur, HTTPS et proxy interne, Configuration et Scripts ; `S3`, §7 | Statuer sur les contraintes normatives applicables aux dépendances retenues. | Compatibilité, environnements supportés et conditions reproductibles de build/exécution. |
| `LOT001-NDM-017` | Livrables | Liste exhaustive des livrables d'implémentation attendus | `PARTIAL` | `S1` inventorie l'état livré et une empreinte de 24 fichiers, mais aucune liste prescriptive préalable et exhaustive des livrables n'est fournie. L'état constaté ne peut être automatiquement promu en obligation. | `S1`, §§ Périmètre livré à Empreinte ; `S3`, §4 et §7 | Statuer sur la liste exhaustive des livrables d'implémentation du LOT001. | Section « Livrables » et contrôle de complétude de la future spécification. |
| `LOT001-NDM-018` | Livrables | Liste des livrables documentaires et des preuves attendues | `UNKNOWN` | Les rapports d'implémentation et GO/NO GO existent et la spécification est absente, mais aucun document ne définit le dossier documentaire obligatoire du lot ni ses preuves requises. | `S1`, ensemble du rapport ; `S2`, ensemble de la décision ; `S3`, §4, §7 et §9 ; `S4`, §2 et §3 | Statuer sur les documents et preuves qui doivent constituer le dossier officiel du LOT001. | Inventaire documentaire, annexes probatoires et dossier de certification. |
| `LOT001-NDM-019` | Livrables | Périmètre de fichiers autorisés, interdits ou protégés | `PARTIAL` | Les fichiers effectivement livrés et certaines frontières inchangées sont connus après coup. `S3` constate l'absence d'une liste officielle préalable des fichiers autorisés. | `S1`, §§ Frontières respectées et Empreinte ; `S2`, matrice de décision ; `S3`, §4 et §7 | Statuer sur le périmètre documentaire et technique autorisé, interdit ou protégé pour le LOT001. | Périmètre des livrables, contrôles de non-régression et règles d'écart. |
| `LOT001-NDM-020` | Règles de validation | Protocole complet de validation | `PARTIAL` | Des scripts et contrôles réussis sont cités, mais l'ordre, l'environnement, les entrées, les commandes exactes, les préconditions et la répétabilité du protocole ne sont pas établis exhaustivement. | `S1`, §§ Scripts et Empreinte ; `S2`, matrice de décision ; `S3`, §4 et §7 | Statuer sur le protocole normatif complet permettant de valider le LOT001. | Procédure de validation et mode opératoire de recette. |
| `LOT001-NDM-021` | Règles de validation | Catalogue détaillé des tests obligatoires et résultats attendus | `PARTIAL` | La matrice GO nomme des familles de tests et des résultats agrégés, sans fournir le catalogue normatif complet des cas, entrées et résultats attendus. `S3` qualifie explicitement cette couverture de partielle. | `S2`, matrice de décision ; `S3`, §4 et §7 | Statuer sur la liste détaillée des tests obligatoires et sur le résultat attendu de chacun. | Plan de tests, matrice exigences-tests et annexes de validation. |
| `LOT001-NDM-022` | Règles de validation | Seuils de réussite et règle d'agrégation vers GO | `UNKNOWN` | Tous les critères observés sont `PASS`, mais aucun document n'indique si tous sont obligatoires, si des seuils s'appliquent ou comment des résultats partiels sont agrégés. | `S2`, matrice de décision ; `S3`, §4 et §7 | Statuer sur les seuils et la règle d'agrégation des résultats de validation. | Algorithme décisionnel GO/NO GO et critères d'acceptation. |
| `LOT001-NDM-023` | Règles de validation | Référentiel de non-régression et vérification des empreintes | `PARTIAL` | Des totaux de tests, une empreinte protégée et un SHA-256 sont rapportés, sans définition normative de la baseline, du moment de capture, du contenu exact ni de la méthode de comparaison. | `S1`, §§ Frontières respectées et Empreinte ; `S2`, critères de non-régression et d'empreinte ; `S3`, §7 | Statuer sur le référentiel et la méthode normative de contrôle des non-régressions et empreintes. | Annexes de baseline, preuve d'intégrité et protocole de validation. |
| `LOT001-NDM-024` | Protocole de certification | Applicabilité et périmètre de la certification LOT001 | `UNKNOWN` | La roadmap est marquée `NOT_CERTIFIED`, mais elle ne dit pas si, quoi ni à quel niveau le LOT001 doit être certifié. L'état de la roadmap ne définit pas un protocole pour le lot. | `S4`, en-tête et §3 ; `S3`, §9 | Statuer sur l'applicabilité et le périmètre de la certification du LOT001. | Section « Certification », portée de l'attestation et statut documentaire. |
| `LOT001-NDM-025` | Protocole de certification | Autorité et responsabilité de certification | `UNKNOWN` | Aucune source n'identifie l'autorité qui examine, approuve, refuse ou enregistre la certification du LOT001. | `S1` à `S4`, absence concordante ; `S4`, certification `NOT_CERTIFIED` | Statuer sur l'autorité et les responsabilités de certification du LOT001. | Gouvernance, visas, responsabilités et enregistrement de la décision. |
| `LOT001-NDM-026` | Protocole de certification | Étapes, entrées et preuves du protocole de certification | `UNKNOWN` | Les preuves postérieures citées ne constituent pas un protocole normatif de certification. Aucun enchaînement, dossier d'entrée ou contrôle de complétude n'est défini. | `S1`, §§ Scripts et Empreinte ; `S2`, matrice de décision ; `S3`, §7 ; `S4`, §3 | Statuer sur les étapes, entrées et preuves obligatoires du protocole de certification. | Procédure de certification, dossier de preuves et procès-verbal. |
| `LOT001-NDM-027` | Protocole de certification | Résultats possibles et relation entre certification et GO/NO GO | `UNKNOWN` | Le corpus démontre `READY` et `BFF_LOT_001_READY`, tandis que la roadmap reste `NOT_CERTIFIED`. Aucune règle ne relie ces états ni ne définit les résultats possibles d'une certification. | `S2`, § Décision ; `S4`, en-tête, §2 LOT001 et §3 | Statuer sur les résultats de certification et leur relation avec les décisions GO/NO GO et le statut `READY`. | Modèle d'état, décision finale et cohérence entre documents officiels. |
| `LOT001-NDM-028` | Politique documentaire | Autorité, emplacement, nom, version et date d'effet de la future spécification | `UNKNOWN` | La roadmap est canonique pour la roadmap seulement et référence la spécification LOT001 comme `UNKNOWN`. Aucune règle n'établit l'identité documentaire ou l'autorité de la future spécification. | `S4`, §§1, 2 LOT001 et 3 ; `S3`, §§4 et 9 | Statuer sur l'identité, l'autorité, l'emplacement, la version initiale et la date d'effet de la future spécification. | En-tête, métadonnées, référencement canonique et historique documentaire. |
| `LOT001-NDM-029` | Politique documentaire | Processus de revue, approbation, modification et versionnement | `UNKNOWN` | Aucun document autorisé ne définit le cycle de vie de la spécification LOT001. L'historique propre à la roadmap ne peut pas être transposé sans décision. | `S4`, §§1 et 5 ; `S1` à `S3`, absence concordante | Statuer sur le processus documentaire applicable à la revue, l'approbation et aux versions ultérieures de la spécification. | Statut du document, historique, approbations et contrôle des changements. |
| `LOT001-NDM-030` | Politique documentaire | Priorité des sources et traitement des contradictions | `UNKNOWN` | La roadmap déclare sa propre autorité, mais aucune hiérarchie n'est définie entre future spécification, rapport d'implémentation, décision GO/NO GO et roadmap pour le LOT001. | `S4`, §1 ; `S3`, ensemble du rapport | Statuer sur la priorité documentaire et le traitement des contradictions concernant le LOT001. | Clause d'autorité, résolution des conflits et gouvernance documentaire. |
| `LOT001-NDM-031` | Politique documentaire | Règle de traçabilité entre exigences, livrables, tests, preuves et décisions | `UNKNOWN` | Les documents contiennent des correspondances descriptives, mais aucun schéma normatif de traçabilité, d'identifiants ou de couverture n'est défini. Il ne peut être reconstruit à partir des seules lignes `PASS`. | `S1`, inventaires ; `S2`, matrice de décision ; `S3`, §4 et §7 | Statuer sur la structure de traçabilité requise entre les objets normatifs et leurs preuves. | Identifiants d'exigence, matrices de couverture, annexes de preuve et auditabilité. |
| `LOT001-NDM-032` | Politique documentaire | Traitement des réserves, écarts et dérogations | `UNKNOWN` | `S2` contient des réserves et `S1` décrit des limites, mais aucune politique ne dit comment un écart à la future spécification serait déclaré, accepté, refusé, suivi ou clôturé. | `S1`, §§ Sessions et Frontières respectées ; `S2`, § Réserves ; `S3`, §7 | Statuer sur le processus documentaire applicable aux réserves, écarts et dérogations. | Registre des écarts, décisions d'acceptation, suivi et conditions de clôture. |
| `LOT001-NDM-033` | Références obligatoires | Corpus exhaustif des références obligatoires de la future spécification LOT001 | `UNKNOWN` | La matrice couvre les livrables documentaires, la priorité des sources et leur traçabilité, mais aucune décision officielle ne détermine la liste exhaustive des références obligatoires, leur statut documentaire, leur portée normative ou probatoire, ni le contrôle de complétude du corpus. Aucun document ne peut être sélectionné ou exclu sans décision nouvelle. | `S5`, §§3 et 4 | Statuer sur le corpus exhaustif des références que la future spécification LOT001 devra obligatoirement déclarer, sur le statut documentaire et la portée de chaque référence, ainsi que sur la vérification de complétude du corpus. | Section « Références obligatoires », portée des sources, traçabilité probatoire et contrôle de complétude de la future spécification. |
| `LOT001-NDM-034` | Conditions de clôture du lot | Conditions formelles permettant de déclarer le LOT001 clos | `UNKNOWN` | Aucune décision officielle ne définit l'état terminal du lot, les obligations et preuves de clôture, l'autorité habilitée ou le constat matérialisant la clôture. Le statut `READY`, la décision `BFF_LOT_001_READY` et leur relation encore indéterminée avec la certification ne démontrent aucune clôture formelle. | `S5`, §§3 et 4 | Statuer sur l'état terminal officiel, les obligations et preuves requises avant clôture, l'autorité habilitée, le document ou constat de clôture, et la relation entre `READY`, certification et clôture formelle. | Conditions de fin de lot, modèle d'état, dossier probatoire, autorité de clôture et constat documentaire de clôture. |

## 5. Domaines contrôlés sans décision manquante

| Domaine | Conclusion | Preuve |
|---|---|---|
| Critères GO — identité des critères effectivement appliqués | `FOUND` | `S2` énumère quinze critères, leurs preuves et leur résultat `PASS`; `S3`, §4, conclut `FOUND`. |
| Décision GO effectivement rendue | `FOUND` | `S2` fixe `BFF_LOT_001_READY`; `S4`, §2, fixe le statut `READY`; `S3`, §4, conclut `FOUND`. |

Cette conclusion ne couvre pas la règle d'agrégation des critères GO, inscrite
séparément sous `LOT001-NDM-022`.

## 6. Contrôle d'absence d'hypothèse

La matrice n'adopte aucune caractéristique de l'implémentation comme exigence
par simple rétro-déduction. Elle n'assimile pas non plus :

- l'absence de prérequis documenté à un prérequis nul ;
- un résultat `PASS` à une règle générale de validation ;
- une réserve observée à une dérogation normativement autorisée ;
- la décision `READY` à une certification ;
- l'empreinte livrée à une baseline normative.

Toute résolution d'une ligne exige donc une décision externe au corpus
autorisé.

## 7. Résultat

```text
DECISIONS_IDENTIFIED: 34
NORMATIVE_VALUES_INVENTED: 0
SPECIFICATION_CREATED: NO
SOURCE_DOCUMENT_MODIFIED: NO
```
