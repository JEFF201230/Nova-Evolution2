MISSION\_ID: F04-A-GLOBAL-DELIVERABLES-PARTIAL-READ-001

PROGRAM: NOVA-FRONT-RUNTIME-INTEGRATION

LOT: F04-A

TITLE: Global Deliverables Partial Read

PROFILE: BUILD



\# 1. OBJECTIF



Implémenter la première intégration Runtime strictement read-only de la page globale NOVA `/deliverables`.



Cette mission doit remplacer la représentation fictive actuelle de Global Deliverables par une projection partielle, factuelle et vérifiable des preuves de livrables réellement présentes dans les MissionReport du Runtime.



Cette mission n'implémente PAS un domaine Global Deliverables complet.



Cette mission n'implémente PAS un index global canonique de Deliverables.



Elle expose uniquement une projection read-only des `MissionReport.deliverableEvidence` réellement disponibles.



\# 2. CONTEXTE ARCHITECTURAL PROUVÉ



Le Runtime possède :



GET /api/v1/missions



Cette route retourne les RuntimeMission réelles.



RuntimeMission contient notamment :



\- projectId

\- missionId

\- reportId

\- state

\- runId

\- updatedAt



Le Runtime possède également :



GET /api/v1/missions/{projectId}/{missionId}



Cette route retourne notamment :



\- mission

\- report

\- events

\- observabilityEvents

\- incompleteRuns



`MissionReport.deliverableEvidence` constitue la source canonique disponible pour cette mission.



Chaque preuve expose uniquement :



\- path

\- size

\- sha256

\- modifiedAt

\- runId



Un socle interne read-only existe déjà :



\- server/runtime/work/work-deliverables.model.ts

\- server/runtime/work/work-deliverables.query.ts

\- server/runtime/work/work-deliverables.service.ts

\- server/runtime/work/work-deliverables.types.ts

\- server/runtime/work/work-deliverables.test.ts



Ce socle établit notamment les principes suivants :



\- sourceDomain = MISSIONS

\- producer = ORCHESTRATOR\_RUNTIME

\- aucune persistance

\- aucune mutation

\- aucune inférence métier

\- aucun tri artificiel

\- aucune identité Deliverable inventée

\- aucun title inventé

\- aucun status inventé

\- aucun downloadUrl inventé



\# 3. ARCHITECTURE CIBLE



La chaîne cible doit être :



NOVA Web

→ BFF authentifié

→ capability-specific Global Deliverables Gateway

→ NOVA Core read-only

→ RuntimeMission

→ MissionReport

→ MissionReport.deliverableEvidence



Le navigateur ne doit jamais appeler directement NOVA Core :4100.



Le BFF ne doit pas devenir un proxy générique de `/api/v1/\*`.



La route générique Core actuellement fermée côté navigateur doit rester fermée.



\# 4. RÉSOLUTION DES DONNÉES



Le Gateway doit :



1\. appeler GET `/api/v1/missions` ;

2\. parser strictement la réponse Runtime ;

3\. identifier uniquement les missions possédant un `reportId` non null ;

4\. pour ces missions seulement, appeler :

&#x20;  GET `/api/v1/missions/{projectId}/{missionId}`

5\. parser strictement la réponse ;

6\. vérifier avant toute exposition :



&#x20;  mission.projectId === report.projectId



&#x20;  mission.missionId === report.missionId



&#x20;  mission.reportId === report.reportId



7\. rejeter toute incohérence ;

8\. exposer uniquement les preuves réellement présentes dans `report.deliverableEvidence`.



Aucune mission sans reportId ne doit provoquer une invention de Deliverable.



Un rapport sans `deliverableEvidence` représente légitimement zéro preuve exposable.



\# 5. FAIL-CLOSED OBLIGATOIRE



Les snapshots Runtime ne garantissent actuellement pas toutes les relations Mission ↔ MissionReport.



Le BFF constitue donc une frontière de validation obligatoire.



Toute incohérence de contrat Runtime doit échouer explicitement.



Conserver la doctrine déjà utilisée par Work Activity :



\- réponse Runtime invalide → 502 RUNTIME\_RESPONSE\_INVALID

\- Runtime indisponible → 503 RUNTIME\_UNAVAILABLE

\- timeout Runtime → 504 RUNTIME\_TIMEOUT

\- requête Runtime rejetée → erreur BFF contrôlée

\- propagation X-Correlation-ID



Ne jamais ignorer silencieusement une mission ou un rapport invalide afin de produire une collection apparemment complète.



Ne jamais transformer une erreur partielle en succès silencieux.



\# 6. COLLISIONS REPORT ID



Le Runtime ne protège pas explicitement l'unicité de `reportId` entre plusieurs missions d'un même projet avant `stores.reports.set(...)`.



Le Gateway doit donc refuser une situation où plusieurs missions d'un même `projectId` déclarent le même `reportId`.



Cette situation doit être traitée comme une incohérence Runtime.



Aucune déduplication silencieuse n'est autorisée.



\# 7. CONTRAT GLOBAL DELIVERABLES



Créer un contrat partagé dédié.



Le contrat ne doit contenir que des données réellement dérivables des producteurs canoniques.



Une entrée exposée peut contenir les identités/provenances nécessaires directement issues des sources :



\- projectId

\- missionId

\- reportId

\- path

\- size

\- sha256

\- modifiedAt

\- runId



Ne PAS créer :



\- deliverableId artificiel

\- title métier artificiel

\- status

\- confidence

\- readiness

\- publicationScore

\- downloadUrl

\- owner artificiel

\- deadline artificielle

\- classification métier non produite par le Runtime



Le `path` peut être présenté comme chemin de preuve.



Il ne doit pas être transformé en titre métier canonique.



\# 8. FRONTEND `/deliverables`



La page globale Deliverables est actuellement alimentée par des fixtures.



La mission doit retirer les fixtures uniquement de la chaîne Global Deliverables concernée.



Préserver intégralement les fixtures Global Decisions présentes dans :



`apps/nova-web/src/components/routes/globalRouteFixtures.ts`



Global Decisions est hors scope.



La page `/deliverables` doit gérer explicitement :



\- loading

\- success avec preuves

\- empty

\- error



Elle doit afficher uniquement les informations réellement fournies par le contrat.



\# 9. CTA INTERDITS



Les actions suivantes ne disposent pas actuellement d'un contrat Runtime/BFF réel :



\- Create Deliverable

\- View Deliverable métier

\- Download Deliverable



Elles ne doivent pas rester présentées comme des actions fonctionnelles connectées.



Ne créer aucun faux comportement.



Ne créer aucun téléchargement local ou URL artificielle.



Ne créer aucune mutation.



\# 10. HORS SCOPE ABSOLU



Ne PAS implémenter :



\- Global Decisions

\- Search Overlay

\- Decision Flow

\- Human Approval

\- Create Deliverable

\- Update Deliverable

\- Delete Deliverable

\- Download Deliverable

\- publication workflow

\- Deliverable business lifecycle

\- nouvel index global Runtime

\- nouvelle persistance

\- mutation Runtime

\- mission creation

\- runtime execution

\- IAM

\- changement d'authentification

\- bypass d'authentification

\- proxy générique Core

\- modification du registre CEREBRAU

\- certification CEREBRAU artificielle



Ne PAS connecter les Decisions par inférence depuis les Runtime events.



\# 11. AUTHENTIFICATION



La nouvelle route BFF Global Deliverables doit être authentifiée.



Réutiliser la politique BFF existante.



Ne pas modifier `requireAuthentication`.



Ne pas créer de bypass DEV supplémentaire.



Ne pas affaiblir CSRF, session ou cookies.



Cette mission doit rester compatible avec la future architecture IAM.



\# 12. CORE / RUNTIME



Privilégier l'utilisation des endpoints read-only Core existants.



Ne modifier NOVA Core ou Orchestrator Runtime que si une impossibilité technique démontrée l'exige.



Aucune modification Core/Runtime ne doit être réalisée simplement pour simplifier le frontend ou le BFF.



Le socle `server/runtime/work/work-deliverables\*` est une référence normative.



Ne pas modifier `server/runtime/work/work-core.ts` dans cette mission : ce fichier contient actuellement des modifications locales PEOPLE hors scope.



\# 13. GLOBALROUTEFIXTURES



Le fichier :



`apps/nova-web/src/components/routes/globalRouteFixtures.ts`



contient également Global Decisions.



Ne pas supprimer le fichier entier.



Retirer ou neutraliser uniquement la dépendance Global Deliverables devenue obsolète.



Préserver Global Decisions sans modification fonctionnelle.



\# 14. LIMITATION MVP CONNUE



`GET /api/v1/missions` n'est actuellement ni paginé ni limité.



La mission peut utiliser cette source pour cette intégration partielle MVP.



Cette limitation doit être documentée explicitement dans le rapport final.



Ne pas inventer une pagination frontend ou BFF qui n'existe pas dans le producteur.



Ne pas présenter cette projection comme un index Global Deliverables scalable ou définitif.



\# 15. TESTS OBLIGATOIRES



Ajouter des tests couvrant au minimum :



\- authentification obligatoire de la route BFF ;

\- réponse Runtime valide ;

\- aucune mission ;

\- mission sans reportId ;

\- rapport sans deliverableEvidence ;

\- plusieurs missions avec preuves réelles ;

\- projectId incohérent ;

\- missionId incohérent ;

\- reportId incohérent ;

\- reportId dupliqué dans un même projet ;

\- réponse Runtime structurellement invalide ;

\- Runtime indisponible ;

\- timeout Runtime ;

\- aucune mutation Runtime ;

\- aucun proxy générique ;

\- frontend loading ;

\- frontend empty ;

\- frontend error ;

\- frontend success ;

\- absence de données métier inventées ;

\- absence de CTA Create fonctionnel ;

\- absence de CTA Download fonctionnel ;

\- conservation de Global Decisions hors scope.



Exécuter les suites pertinentes BFF et frontend.



Exécuter les typechecks pertinents.



Exécuter le build NOVA Web.



Exécuter `git diff --check`.



\# 16. ÉTAT GIT



Le repository contient actuellement de nombreuses modifications locales hors scope, notamment PEOPLE, PLANNING, Runtime, outils, rapports et dist.



Elles doivent être strictement préservées.



INTERDIT :



\- git add .

\- git add -A

\- git restore .

\- git clean

\- reset destructif



Ne pas modifier, supprimer, restaurer ou embarquer des travaux hors F04-A.



\# 17. GOUVERNANCE



F02-A Work Activity a :



\- implémentation SUCCESS

\- preuves techniques VALID

\- Human Authority ACCEPTED



Mais aucune certification CEREBRAU WORK n'a été matérialisée car aucun domaine CEREBRAU WORK canonique n'existe.



Ne pas inventer cette certification.



Pour cette mission, considérer F02-A uniquement comme une chaîne Work/mission techniquement prouvée et humainement acceptée dans le programme NOVA-FRONT-RUNTIME-INTEGRATION.



Ne modifier aucun registre de certification pour résoudre artificiellement cette nuance.



F04 complet reste NO GO.



Seul F04-A Global Deliverables Partial Read est autorisé par cette mission.



\# 18. RAPPORT OBLIGATOIRE



Créer :



`Docs/24\_MODULES/GLOBAL/MISSIONS/F04-A-GLOBAL-DELIVERABLES-PARTIAL-READ/F04-A\_GLOBAL\_DELIVERABLES\_PARTIAL\_READ\_REPORT.md`



Le rapport doit préciser :



\- fichiers modifiés ;

\- fichiers créés ;

\- architecture finale ;

\- endpoint BFF créé ;

\- endpoints Core consommés ;

\- contrat exposé ;

\- validations fail-closed ;

\- comportement loading/empty/error/success ;

\- fixtures supprimées de Global Deliverables ;

\- fixtures Global Decisions préservées ;

\- tests exécutés et résultats exacts ;

\- typechecks ;

\- build ;

\- git diff --check ;

\- limitations connues ;

\- absence de mutation Runtime ;

\- absence de proxy générique ;

\- absence de données inventées ;

\- absence de certification CEREBRAU artificielle ;

\- état final GO / NO GO / READY\_FOR\_REVIEW.



\# 19. STOP CRITERIA



STOP immédiat si l'implémentation exige :



\- d'inventer une identité Deliverable ;

\- d'inventer un état métier ;

\- d'inventer un téléchargement ;

\- d'exposer un proxy Core générique ;

\- de désactiver l'authentification ;

\- de modifier une donnée Runtime ;

\- de créer un index global fictif ;

\- de connecter Decisions par inférence ;

\- de modifier des travaux PEOPLE/PLANNING hors scope ;

\- de matérialiser une fausse certification CEREBRAU.



Dans ce cas :



ne pas contourner le problème.



Documenter le blocage dans le rapport et conclure NO GO.



\# 20. RÉSULTAT ATTENDU



À la fin de F04-A :



`/deliverables`



doit être une surface read-only factuelle alimentée par les preuves réellement présentes dans les MissionReport du Runtime, via un BFF authentifié et capability-specific.



La page ne doit plus prétendre disposer d'un domaine Global Deliverables complet.



Aucune donnée métier non produite ne doit être affichée comme vérité Runtime.



Aucune mutation ne doit être introduite.



Aucun autre sous-domaine F04 ne doit être implémenté.

