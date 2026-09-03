\# P3-PEOPLE-001F-M01



\## MISSION



P3-PEOPLE-001F-M01 — PEOPLE INTERNAL QUERIES



Mission d'implémentation strictement limitée au LOT :



P3-PEOPLE-001F — People Queries



\## OBJECTIF UNIQUE



Matérialiser le chemin interne de lecture PEOPLE en exposant exactement les 9 queries canoniques prévues par le contrat, au-dessus de la source PEOPLE autoritative déjà certifiée.



Appliquer strictement :



REUSE → COMPLETE → TEST



Ne recréer ni les agrégats, ni les règles métier, ni la persistance.



\## PRÉCONDITIONS ACQUISES



Les lots précédents sont considérés comme acquis et ne doivent pas faire l'objet d'un nouvel audit général :



\- P3-PEOPLE-001C : Authority / Commands / Events certifiés ;

\- P3-PEOPLE-001D : Persistence certifiée ;

\- P3-PEOPLE-001E : Internal Commands / Write Path certifié.



Vérifier seulement leurs statuts officiels si nécessaire au gate d'entrée.



\## CONTRAT CANONIQUE



Source :



Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md



LOT :



P3-PEOPLE-001F — People Queries



Le contrat canonique prévaut sur toute interprétation de cette mission.



\## GIT PREFLIGHT



Avant toute écriture :



1\. exécuter `git status --short` ;

2\. capturer les changements préexistants ;

3\. ne modifier, supprimer, stash, reset ou revert aucun changement préexistant hors mission.



\## LES 9 QUERIES CANONIQUES



Implémenter exactement :



1\. GetBusinessPerson

2\. GetWorkPeople

3\. GetWorkOwner

4\. GetWorkParticipants

5\. GetWorkContributors

6\. GetWorkReviewers

7\. GetWorkApprovers

8\. GetPersonAssignments

9\. GetAssignmentHistory



Ne créer aucune dixième query publique.



Ne renommer aucune query canonique sauf si le contrat machine impose explicitement une autre représentation.



\## ARCHITECTURE CIBLE MINIMALE



Le chemin recherché est :



PeoplePersistencePorts

→ PeopleQueryService

→ résultat qualifié



`PeopleQueryService` est le composant nouveau privilégié uniquement si aucune frontière équivalente n'existe déjà.



Avant création, vérifier factuellement l'absence d'un service Query PEOPLE équivalent.



Ne créer aucune seconde source autoritative.



\## SOURCES À RÉUTILISER



Réutiliser prioritairement :



server/domain/people/people-persistence-ports.ts

server/domain/people/people-persistence-aggregate-store.ts

server/domain/people/people-persistence-history.ts

server/domain/people/business-person.aggregate.ts

server/domain/people/work-people.aggregate.ts

server/domain/people/work-assignment.entity.ts

server/domain/people/role-assignment.entity.ts

server/domain/people/people.value-objects.ts



Réutiliser les méthodes existantes, notamment lorsque pertinentes :



\- BusinessPersonRepository.load(...)

\- BusinessPersonRepository.rehydrate(...)

\- BusinessPersonRepository.readHistory(...)

\- WorkPeopleRepository.load(...)

\- WorkPeopleRepository.rehydrate(...)

\- WorkPeopleRepository.readHistory(...)

\- WorkPeople.assignments

\- WorkPeople.activeAssignments

\- WorkAssignment.isParticipantAt(...)

\- WorkAssignment.hasRoleAt(...)

\- WorkAssignment.roleAssignments

\- WorkAssignment.provenanceTrail

\- RoleAssignment.isEffectiveAt(...)

\- RoleAssignment.provenanceTrail



Ne recopier aucune règle métier déjà portée par ces composants.



\## SÉMANTIQUE DES READS



Les queries doivent lire l'état autoritatif PEOPLE.



Une query :



\- ne modifie jamais l'état ;

\- ne répare jamais l'état ;

\- n'émet aucun événement ;

\- ne produit aucun receipt de commande ;

\- n'invoque aucune commande ;

\- ne devient jamais une deuxième PeopleAuthority ;

\- ne fabrique aucune donnée absente.



Distinguer explicitement lorsque le contrat l'exige :



\- source indisponible ;

\- agrégat absent ;

\- résultat valide mais vide.



\## QUALIFICATION TEMPORELLE



Les résultats dépendant d'un instant doivent utiliser explicitement un instant de qualification.



Ne pas introduire implicitement `new Date()` dans la logique de sélection si cela rend le résultat non déterministe.



Réutiliser les primitives temporelles du domaine.



Pour les rôles :



\- OWNER ;

\- CONTRIBUTOR ;

\- REVIEWER ;

\- APPROVER ;



utiliser les BusinessRole et méthodes canoniques existantes.



Ne comparer des chaînes directement que si le contrat/type existant l'impose.



\## GET BUSINESS PERSON



`GetBusinessPerson` doit lire le BusinessPerson autoritatif correspondant à son identifiant.



Le résultat doit préserver au minimum les informations canoniques nécessaires prévues par le contrat, notamment identité, provenance et qualification de lecture.



Ne fabriquer aucun BusinessPerson absent.



\## GET WORK PEOPLE



`GetWorkPeople` doit lire le WorkPeople autoritatif correspondant au WorkReference.



Le résultat doit préserver les informations nécessaires à une lecture cohérente de l'agrégat.



\## GET WORK OWNER



Résoudre l'Owner depuis l'état PEOPLE autoritatif.



Réutiliser :



WorkAssignment.hasRoleAt(OWNER, instant)



Ne réimplémenter ni la période, ni le statut, ni l'effectivité du rôle.



Le résultat doit respecter l'invariant d'unicité Owner déjà garanti par le domaine.



\## GET WORK PARTICIPANTS



Retourner les participants qualifiés à l'instant demandé.



Réutiliser :



WorkAssignment.isParticipantAt(instant)



ou une primitive existante strictement équivalente.



\## GET WORK CONTRIBUTORS



Sélectionner uniquement les assignments qualifiés portant le rôle CONTRIBUTOR à l'instant demandé.



Réutiliser :



WorkAssignment.hasRoleAt(...)



\## GET WORK REVIEWERS



Même principe pour REVIEWER.



\## GET WORK APPROVERS



Même principe pour APPROVER.



\## GET PERSON ASSIGNMENTS — GAP À TRAITER MINIMALEMENT



La persistence actuelle est principalement adressée par WorkReference.



Ne supposer aucune primitive inexistante permettant de retrouver tous les Work d'une personne.



Inspecter l'implémentation réelle avant toute décision.



Si aucune primitive certifiée ne permet `GetPersonAssignments`, implémenter le mécanisme minimal nécessaire.



Un index secondaire est autorisé uniquement s'il est :



\- reconstructible depuis la source PEOPLE ;

\- non autoritatif ;

\- transactionnellement cohérent avec la source ;

\- testable ;

\- supprimable/reconstructible sans perte de vérité métier.



Il ne doit jamais devenir une seconde source de vérité.



Ne créer ni moteur de recherche générique, ni projection framework, ni infrastructure V2.



Si satisfaire correctement cette query exige une modification structurante dépassant le périmètre 001F :



STOP et NO GO.



Ne masquer aucune lacune architecturale.



\## GET ASSIGNMENT HISTORY



Réutiliser la persistence/history certifiée.



Ne créer aucun second journal.



L'historique doit provenir des événements PEOPLE persistés.



Respecter ordre, séquence, causalité et pagination existants.



Ne reconstruire aucune histoire fictive à partir du seul état courant.



\## PROVENANCE ET COHÉRENCE



Les résultats doivent permettre de déterminer la provenance/cohérence exigée par le contrat 001F.



Réutiliser les métadonnées réellement disponibles :



\- aggregate revision ;

\- last event sequence ;

\- PeopleProvenance ;

\- historique persisté ;

\- autres métadonnées certifiées existantes.



Ne créer aucun indicateur de cohérence non démontrable.



\## FICHIERS



Avant écriture, déterminer la liste minimale exacte.



Fichiers nouveaux probables, seulement si nécessaires :



server/domain/people/people-query-service.ts

server/domain/people/people-query-service.test.ts



`server/domain/people/index.ts` peut être modifié uniquement si l'export du service Query est nécessaire.



Les fichiers de persistence PEOPLE peuvent être modifiés uniquement si `GetPersonAssignments` démontre factuellement qu'une primitive/index reconstructible minimal est indispensable.



Toute modification de persistence doit préserver intégralement P3-PEOPLE-001D.



\## PÉRIMÈTRE D'ÉCRITURE



Autorisé :



server/domain/people/



et le rapport :



Docs/24\_MODULES/WORK/PEOPLE\_QUERIES/MISSIONS/P3-PEOPLE-001F-M01\_REPORT.md



Aucune autre zone n'est autorisée.



\## INTERDICTIONS ABSOLUES



Ne modifier aucun fichier sous :



server/runtime/

server/nova-core/

server/nova-bff/

tools/

apps/

client/



Ne modifier :



\- aucun contrat canonique ;

\- aucune certification 001C ;

\- aucune certification 001D ;

\- aucune certification 001E ;

\- aucun registry de certification pendant M01.



Ne développer :



\- aucune API ;

\- aucun BFF ;

\- aucune intégration Work ;

\- aucun frontend ;

\- aucun dashboard ;

\- aucune commande supplémentaire ;

\- aucun workflow OFFER ;

\- aucune fonctionnalité P3-PEOPLE-001G.



Ne modifier aucun composant VEEDDA extérieur au domaine PEOPLE.



\## TESTS OBLIGATOIRES



Créer des tests ciblés couvrant les 9 queries.



Prouver au minimum :



\### GetBusinessPerson



\- présent ;

\- absent ;

\- aucune mutation.



\### GetWorkPeople



\- présent ;

\- absent ;

\- aucune mutation.



\### GetWorkOwner



\- Owner qualifié correctement ;

\- aucun Owner → résultat qualifié sans fabrication ;

\- sélection temporelle correcte.



\### GetWorkParticipants



\- participants actifs uniquement à l'instant demandé ;

\- résultat vide valide ;

\- suspended/ended correctement exclus selon les primitives métier existantes.



\### GetWorkContributors



\- qualification CONTRIBUTOR correcte ;

\- temporalité correcte.



\### GetWorkReviewers



\- qualification REVIEWER correcte ;

\- temporalité correcte.



\### GetWorkApprovers



\- qualification APPROVER correcte ;

\- temporalité correcte.



\### GetPersonAssignments



\- personne avec plusieurs assignments ;

\- personne sans assignment ;

\- cohérence après écriture ;

\- cohérence après redémarrage si un index persistant est nécessaire ;

\- reconstruction prouvée si index secondaire introduit.



\### GetAssignmentHistory



\- historique réel ;

\- ordre ;

\- séquences ;

\- causalité ;

\- pagination si exposée ;

\- absence d'historique correctement qualifiée.



\## TESTS TRANSVERSAUX



Prouver :



1\. zéro écriture pendant une Query ;

2\. zéro événement produit ;

3\. zéro invocation de PeopleAuthority pour modifier l'état ;

4\. déterminisme temporel ;

5\. provenance conservée ;

6\. distinction absence / vide ;

7\. aucun index autoritatif ;

8\. aucune exposition publique ;

9\. aucune dépendance Work/API/BFF.



\## VALIDATIONS



Exécuter au minimum :



node --import tsx --test server/domain/people/\*.test.ts



Exécuter le typecheck strict PEOPLE applicable.



Exécuter les validations plus larges uniquement si :



\- le contrat 001F les exige ;

\- ou une modification réalisée peut réellement les impacter.



Toujours exécuter :



git diff --check



et capturer :



git status --short



\## DISCIPLINE MVP



Ne pas transformer 001F en plateforme de Query générique.



Ne pas ajouter ORM, cache, bus, API, CQRS framework ou projection générique.



Réutiliser la persistence certifiée.



Créer uniquement ce qui manque pour satisfaire les 9 queries.



Priorité :



simplicité

→ déterminisme

→ cohérence

→ testabilité

→ non-régression.



\## RAPPORT UNIQUE



Créer :



Docs/24\_MODULES/WORK/PEOPLE\_QUERIES/MISSIONS/P3-PEOPLE-001F-M01\_REPORT.md



Le rapport doit contenir :



1\. préconditions ;

2\. composants réutilisés ;

3\. gap réellement constaté ;

4\. fichiers créés/modifiés ;

5\. architecture finale du read path ;

6\. traitement exact de GetPersonAssignments ;

7\. preuve que tout index éventuel est reconstructible et non autoritatif ;

8\. matrice des 9 queries ;

9\. tests exécutés ;

10\. résultats réels ;

11\. non-régressions ;

12\. git diff --check ;

13\. risques résiduels ;

14\. verdict unique.



\## CRITÈRE GO



GO uniquement si :



\- les 9 queries canoniques sont opérationnelles ;

\- elles lisent la source PEOPLE autoritative ;

\- elles ne contiennent aucune logique métier consommatrice ;

\- absence et résultat vide sont correctement distingués ;

\- temporalité et provenance sont démontrées ;

\- GetPersonAssignments est résolu sans seconde source de vérité ;

\- GetAssignmentHistory utilise l'histoire certifiée ;

\- aucune exposition publique n'est créée ;

\- tous les tests obligatoires passent ;

\- git diff --check passe ;

\- aucune régression bloquante n'est observée.



\## VERDICT FINAL



Terminer exactement par :



GO — P3-PEOPLE-001F-M01



ou :



NO GO — P3-PEOPLE-001F-M01



Ne pas certifier P3-PEOPLE-001F dans cette mission.



Ne pas ouvrir P3-PEOPLE-001G.

