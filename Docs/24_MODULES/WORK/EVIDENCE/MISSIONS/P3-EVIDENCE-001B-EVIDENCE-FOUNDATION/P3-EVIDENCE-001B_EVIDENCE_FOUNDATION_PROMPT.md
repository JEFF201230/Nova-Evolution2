\# P3-EVIDENCE-001B — EVIDENCE FOUNDATION



\## MISSION



Implémenter uniquement :



P3-EVIDENCE-001B — Evidence Foundation



Mission strictement ciblée DELTA-ONLY.



Ne pas réauditer globalement NOVA.

Ne pas réauditer WORK.

Ne pas réauditer PEOPLE.

Ne pas réauditer PLANNING.

Ne pas réauditer ACTIONS.

Ne pas relire récursivement tout le dépôt.



Réutiliser les preuves certifiées existantes sauf contradiction matérielle directement détectée.



CEREBRAU gouverne cette mission de développement mais ne doit devenir ni une dépendance produit NOVA, ni une source métier Evidence.



\## SOURCES CANONIQUES AUTORISÉES



Lire prioritairement et uniquement les sections nécessaires de :



1\. Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/EVIDENCE\_DOMAIN\_BLUEPRINT.md

2\. Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/EVIDENCE\_IMPLEMENTATION\_CONTRACT.md

3\. Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/PROGRAM\_CERTIFICATION\_IDENTITY\_MAP.md

4\. Docs/12\_CERTIFICATION/certification-registry.json



Pour la résolution de la seule source métier admise, lire uniquement les contrats et ports ACTIONS strictement nécessaires pour utiliser :



ActionsInternalQueries.getActionHistory(ActionReference)



Le registre doit confirmer :



\- P3-EVIDENCE-001A = CERTIFIED

\- NextAuthorizedLot = P3-EVIDENCE-001B



Le contrat Evidence doit confirmer :



\- Status = CERTIFIED

\- VERDICT = GO

\- P3-EVIDENCE-001B est le lot courant autorisé

\- Authorized files = server/domain/evidence/\*\* and scoped tests only



Ne pas inventer de sémantique manquante.



Ne pas utiliser Runtime Evidence, Mission Technical Evidence, Deliverable Integrity Evidence ou Governance Evidence comme substitut de Business Evidence.



\## ENTRY GATE



Avant toute écriture, prouver :



1\. P3-EVIDENCE-001A est canoniquement CERTIFIED ;

2\. NextAuthorizedLot est P3-EVIDENCE-001B ;

3\. le contrat Evidence est CERTIFIED avec VERDICT GO ;

4\. P3-EVIDENCE-001B est le lot courant autorisé ;

5\. aucune autorité Business Evidence concurrente n'existe déjà ;

6\. les ports ACTIONS nécessaires à la résolution de la source admise existent réellement.



Si une condition d'entrée n'est pas prouvée :



STOP.



Ne pas contourner le blocage.



Rapporter factuellement BLOCKED.



\## OBJECTIF



Implémenter uniquement le domaine interne Business Evidence autorisé par P3-EVIDENCE-001B.



Le lot doit matérialiser :



\- BusinessEvidenceRecord ;

\- EvidenceId ;

\- référence source immuable ;

\- provenance ;

\- cycle de vie Evidence ;

\- historique de cycle de vie durable et append-only ;

\- EvidenceAuthority comme unique producteur Business Evidence ;

\- enregistrement idempotent ;

\- détection des enregistrements conflictuels ;

\- repository/journal autoritatif unique ;

\- implémentation de production de cette persistance ;

\- récupération après redémarrage ;

\- résolution de source de production ;

\- allow-list contenant uniquement ACTIONS\_ACTION\_RESULT\_RECORDED ;

\- requêtes internes par EvidenceId ;

\- requêtes internes par ensemble ordonné d'EvidenceId ;

\- résolution optionnelle Certification ;

\- distinction explicite entre absence, invalidité et indisponibilité de l'autorité ;

\- tsconfig Evidence strict couvrant toutes les sources Evidence et leurs ports de lecture certifiés importés ;

\- tests ciblés du domaine Evidence.



Le lot doit établir la source de vérité Business Evidence sans créer de seconde source de vérité pour les données appartenant aux domaines sources.



\## AUTORITÉ MÉTIER



EvidenceAuthority est l'unique producteur autoritatif de Business Evidence.



Aucun autre service, repository, Runtime component, Work component, fixture, rapport ou mécanisme CEREBRAU ne peut devenir producteur Business Evidence.



BusinessEvidenceRecord référence une occurrence métier existante.



Il ne possède pas et ne copie pas le payload métier de cette occurrence.



\## SOURCE MÉTIER INITIALE AUTORISÉE



La seule source métier autorisée dans P3-EVIDENCE-001B est :



ACTIONS\_ACTION\_RESULT\_RECORDED



Sa résolution doit utiliser uniquement :



ActionsInternalQueries.getActionHistory(ActionReference)



L'identité de l'occurrence source doit correspondre à :



\- WorkReference ;

\- ActionId ;

\- actionsRevision ;

\- ResultId.



La résolution doit identifier une occurrence réelle et non ambiguë dans l'historique ACTIONS.



Business Evidence ne doit copier :



\- ni Result payload ;

\- ni outcome ;

\- ni contenu métier appartenant à ACTIONS.



Evidence conserve uniquement la référence source et les métadonnées Evidence autorisées par le Blueprint et le contrat.



\## SOURCE ALLOW-LIST



L'allow-list de P3-EVIDENCE-001B contient exactement :



ACTIONS\_ACTION\_RESULT\_RECORDED



Toute autre source doit échouer en mode fail-closed.



Aucune extension implicite de l'allow-list n'est autorisée.



Sont notamment interdits comme Business Evidence :



\- Runtime Evidence ;

\- Mission Technical Evidence ;

\- Deliverable Integrity Evidence ;

\- Governance Evidence ;

\- fixtures ;

\- logs techniques ;

\- rapports libres ;

\- données CEREBRAU.



\## INVARIANTS OBLIGATOIRES



Démontrer au minimum :



1\. EvidenceAuthority est l'unique producteur Business Evidence.



2\. BusinessEvidenceRecord ne stocke aucun payload de la source métier.



3\. EvidenceId est stable et non ambigu.



4\. La référence source est immuable.



5\. L'identité d'occurrence source est stable et déterministe.



6\. L'enregistrement d'une même occurrence source est idempotent.



7\. Un enregistrement identique répété retourne le même EvidenceId.



8\. Un enregistrement conflictuel échoue explicitement.



9\. L'historique du cycle de vie est durable.



10\. L'historique est append-only.



11\. Aucun historique ne peut être silencieusement supprimé ou réécrit.



12\. Les transitions terminales définies par le Blueprint sont protégées.



13\. Withdrawal, invalidation et supersession survivent à la récupération après redémarrage.



14\. Une occurrence ACTIONS absente échoue explicitement.



15\. Une occurrence ACTIONS ambiguë échoue explicitement.



16\. Un historique ACTIONS indisponible échoue explicitement.



17\. Toute source non présente dans l'allow-list échoue explicitement.



18\. L'indisponibilité de l'autorité reste distincte de l'absence d'Evidence.



19\. L'invalidité reste distincte de l'absence et de l'indisponibilité.



20\. Certification est résolue depuis son propriétaire.



21\. Le statut Certification n'est jamais copié comme vérité Evidence.



22\. Le repository/journal Evidence est l'unique persistence autoritative Business Evidence.



23\. IntegrationRuntimeRepository n'est pas réutilisé comme store Business Evidence.



24\. MissionEvidenceCertifier n'est pas réutilisé comme autorité Business Evidence.



25\. Aucune donnée métier ACTIONS n'est dupliquée pour constituer une seconde source de vérité.



26\. Aucune dépendance produit/runtime vers CEREBRAU n'est créée.



\## PERSISTENCE ET RECOVERY



Implémenter une persistence Business Evidence autoritative conforme au contrat.



Elle doit permettre au minimum :



\- enregistrement durable ;

\- récupération ;

\- historique append-only ;

\- idempotence ;

\- préservation du lifecycle ;

\- récupération des références sources ;

\- requêtes internes autorisées.



Après reconstruction/redémarrage simulé par les tests :



\- la même Evidence doit être retrouvée ;

\- son EvidenceId doit rester stable ;

\- son historique doit rester cohérent ;

\- son état lifecycle doit être conservé ;

\- aucun payload source ne doit apparaître dans le stockage.



Aucun store Runtime Evidence existant ne doit être promu ou réutilisé comme source Business Evidence.



\## CERTIFICATION RESOLUTION



La résolution Certification est optionnelle conformément au contrat.



Si implémentée, elle doit retourner explicitement les états prévus par le Blueprint/contrat, notamment :



\- référence absente ;

\- autorité indisponible ;

\- référence résolue.



Le statut Certification appartient à son autorité d'origine.



Evidence ne doit pas en conserver une copie autoritative.



\## INTERNAL QUERIES



Implémenter uniquement les accès internes autorisés :



\- query par EvidenceId ;

\- query par ensemble ordonné d'EvidenceId.



Les Queries sont read-only.



Elles ne doivent pas :



\- muter Evidence ;

\- muter la source ;

\- créer une nouvelle Evidence ;

\- contourner EvidenceAuthority ;

\- introduire une projection métier concurrente.



\## PÉRIMÈTRE DE FICHIERS



Avant toute écriture :



1\. inspecter uniquement les précédents structurels strictement nécessaires ;

2\. déterminer la liste exacte minimale des fichiers nécessaires sous :



server/domain/evidence/



3\. déclarer cette liste dans le rapport ;

4\. ne modifier aucun fichier métier hors de cette liste.



Créer uniquement les composants réellement nécessaires au Blueprint, au contrat et aux tests.



Ne pas générer une architecture spéculative.



Réutiliser → compléter → construire.



\## INTERDICTIONS ABSOLUES



Ne pas implémenter dans P3-EVIDENCE-001B :



\- WCF-004 ;

\- association Work/Evidence ;

\- Authorized Work State Composer ;

\- Work Intelligence ;

\- Intelligence ;

\- Analysis ;

\- Insight ;

\- Recommendation ;

\- Next Best Action ;

\- Synthesis ;

\- Confidence ;

\- API publique ;

\- HTTP ;

\- BFF ;

\- frontend ;

\- UI ;

\- provider framework ;

\- scheduler ;

\- queue ;

\- intégration externe non autorisée ;

\- nouvelle source Evidence hors ACTIONS\_ACTION\_RESULT\_RECORDED ;

\- nouvelle sémantique ACTIONS ;

\- nouvelle sémantique WORK ;

\- nouvelle sémantique Certification ;

\- mécanisme générique de développement CEREBRAU ;

\- modification du mécanisme générique Domain Orchestration.



Ne pas modifier :



\- server/domain/actions/\*\* ;

\- server/domain/work/\*\* ;

\- server/domain/people/\*\* ;

\- server/domain/planning/\*\* ;

\- applications frontend ;

\- Runtime ;

\- Governance ;

\- CEREBRAU ;

\- Docs/12\_CERTIFICATION/certification-registry.json.



Si une contradiction bloquante impose une modification hors périmètre :



STOP.



Ne pas la corriger.



La documenter dans le rapport.



\## DIRTY WORKSPACE SAFETY



Le dépôt peut contenir des modifications préexistantes sans rapport avec cette mission.



Ne pas :



\- nettoyer globalement le dépôt ;

\- reset des fichiers étrangers à la mission ;

\- restore des fichiers étrangers à la mission ;

\- supprimer des fichiers étrangers à la mission ;

\- stage des fichiers étrangers à la mission ;

\- attribuer à cette mission des modifications préexistantes.



Capturer et distinguer :



\- état avant mission ;

\- delta exact de la mission ;

\- état après mission.



Le rapport doit identifier uniquement le delta P3-EVIDENCE-001B.



\## VALIDATION



Exécuter les validations proportionnées au delta.



Obligatoire :



\- tests invariants Evidence ;

\- tests idempotence ;

\- tests enregistrement conflictuel ;

\- tests lifecycle ;

\- tests persistence/recovery ;

\- tests source allow-list ;

\- tests source deny ;

\- tests occurrence ACTIONS réelle ;

\- tests occurrence ACTIONS absente ;

\- tests occurrence ACTIONS ambiguë ;

\- tests historique ACTIONS indisponible ;

\- tests Certification resolution ;

\- tests Queries read-only ;

\- tests absence de payload source persisté ;

\- tests unicité repository/authority ;

\- tests de séparation Runtime/CEREBRAU ;

\- tests de non-régression applicables ;

\- typecheck strict Evidence ;

\- typecheck NOVA applicable ;

\- git diff --check ;

\- contrôle qu'aucun fichier interdit n'a été modifié.



Le TEST CONTRACT canonique P3-EVIDENCE-001B exige :



\- Tests Evidence invariants ;

\- Tests idempotence ;

\- Tests lifecycle/recovery ;

\- Tests source allow/deny ;

\- Tests Certification resolution ;

\- Tests non-regression ;

\- Typecheck.



Ne pas masquer, réinterpréter ou ignorer un échec requis.



Tout échec obligatoire implique TECHNICAL NO-GO.



\## NON-RÉGRESSION



Aucune régression n'est autorisée dans les domaines certifiés consommés ou protégés.



En particulier :



\- ACTIONS reste propriétaire de Action et Result ;

\- WORK ne devient pas propriétaire du contenu Evidence ;

\- PEOPLE reste inchangé ;

\- PLANNING reste inchangé ;

\- Runtime Evidence reste technique et distinct de Business Evidence ;

\- CEREBRAU reste une gouvernance de développement externe au runtime produit NOVA.



\## CERTIFICATION



Ne déclarer P3-EVIDENCE-001B techniquement GO que si :



\- P3-EVIDENCE-001A est canoniquement CERTIFIED ;

\- P3-EVIDENCE-001B est canoniquement autorisé ;

\- EvidenceAuthority est unique ;

\- BusinessEvidenceRecord est durable ;

\- aucun payload source n'est persisté ;

\- ACTIONS\_ACTION\_RESULT\_RECORDED est correctement résolu ;

\- les doublons sont idempotents ;

\- les conflits échouent ;

\- les sources absentes, ambiguës, indisponibles ou non autorisées échouent correctement ;

\- lifecycle et historique survivent à recovery ;

\- Certification reste résolue depuis son propriétaire ;

\- aucune source de vérité concurrente n'est créée ;

\- aucune dépendance Runtime Evidence ou CEREBRAU interdite n'est introduite ;

\- tous les tests requis PASS ;

\- typecheck PASS ;

\- git diff --check PASS ;

\- aucun fichier interdit n'est modifié.



Cette mission produit l'implémentation et les preuves techniques nécessaires à la décision de certification.



Elle ne doit pas modifier elle-même :



Docs/12\_CERTIFICATION/certification-registry.json



Elle ne doit pas s'auto-certifier.



Ne pas commencer WCF-004.



Ne pas commencer Intelligence.



Ne pas commencer P3-SYNTHESIS.



Ne pas commencer P3-CONFIDENCE.



\## RAPPORT FINAL



Créer exactement :



Docs/24\_MODULES/WORK/EVIDENCE/MISSIONS/P3-EVIDENCE-001B-EVIDENCE-FOUNDATION/P3-EVIDENCE-001B\_EVIDENCE\_FOUNDATION\_REPORT.md



Le rapport doit contenir :



1\. identité de mission ;

2\. sources réellement consultées ;

3\. état canonique d'entrée ;

4\. preuve P3-EVIDENCE-001A CERTIFIED ;

5\. preuve P3-EVIDENCE-001B autorisé ;

6\. delta exact de mission ;

7\. fichiers créés/modifiés ;

8\. modèle BusinessEvidenceRecord ;

9\. EvidenceAuthority ;

10\. identité et référence source ;

11\. allow-list ;

12\. résolution ACTIONS\_ACTION\_RESULT\_RECORDED ;

13\. persistence et recovery ;

14\. idempotence et conflits ;

15\. lifecycle et historique append-only ;

16\. Internal Queries ;

17\. Certification resolution ;

18\. preuve d'absence de payload source ;

19\. preuve d'absence de seconde source de vérité ;

20\. preuve de séparation Runtime Evidence / Business Evidence ;

21\. preuve d'absence de dépendance CEREBRAU produit/runtime ;

22\. validations exactes exécutées ;

23\. résultats PASS/FAIL et comptes exacts ;

24\. contrôles de non-régression ;

25\. blockers ou inconnues restantes ;

26\. décision technique ;

27\. confirmation qu'aucune certification canonique n'a été effectuée.



Éviter toute narration d'audit non nécessaire.



\## VERDICT TERMINAL



Si toutes les conditions techniques passent, terminer exactement par :



TECHNICAL GO — P3-EVIDENCE-001B — READY FOR QA/CERTIFICATION ACCEPTANCE



Sinon terminer exactement par :



NO GO — P3-EVIDENCE-001B — EVIDENCE FOUNDATION NOT CERTIFIED



Ne pas commencer un autre lot.

Ne pas s'auto-certifier.

