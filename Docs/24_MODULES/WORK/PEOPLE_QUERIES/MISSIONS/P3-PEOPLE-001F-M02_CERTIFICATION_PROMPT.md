\# P3-PEOPLE-001F-M02 — CERTIFICATION FINALE PEOPLE QUERIES



\## MISSION



Mission exclusivement de CERTIFICATION du lot :



P3-PEOPLE-001F — People Queries



Aucun nouveau développement fonctionnel n'est autorisé.



\## OBJECTIF UNIQUE



Déterminer factuellement si P3-PEOPLE-001F satisfait intégralement son contrat et peut recevoir le statut officiel CERTIFIED.



\## PRÉCONDITIONS



Vérifier avant toute certification :



1\. P3-PEOPLE-001E est officiellement CERTIFIED.

2\. P3-PEOPLE-001F-M01 existe.

3\. Le rapport M01 se termine par :

&#x20;  GO — P3-PEOPLE-001F-M01

4\. Les 9 queries canoniques sont réellement implémentées.

5\. Aucun développement P3-PEOPLE-001G n'a été ouvert.



Si une précondition échoue :



NO GO — P3-PEOPLE-001F-M02 — P3-PEOPLE-001F NOT CERTIFIED



\## SOURCE CANONIQUE



Lire :



Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md



et le rapport :



Docs/24\_MODULES/WORK/PEOPLE\_QUERIES/MISSIONS/P3-PEOPLE-001F-M01\_REPORT.md



Utiliser également les certifications officielles PEOPLE précédentes nécessaires pour vérifier la chaîne de certification.



Ne pas refaire les audits généraux 001C, 001D ou 001E.



\## INTERDICTION DE DÉVELOPPEMENT



Ne créer aucune nouvelle fonctionnalité.



Ne refactorer aucun code.



Ne corriger silencieusement aucun défaut fonctionnel.



Si la certification révèle un défaut nécessitant une modification du code :



STOP.



Documenter précisément le défaut et retourner NO GO.



\## MATRICE A — 9 QUERIES



Prouver l'existence et le fonctionnement de exactement :



1\. GetBusinessPerson

2\. GetWorkPeople

3\. GetWorkOwner

4\. GetWorkParticipants

5\. GetWorkContributors

6\. GetWorkReviewers

7\. GetWorkApprovers

8\. GetPersonAssignments

9\. GetAssignmentHistory



Aucune dixième Query publique ne doit avoir été introduite.



\## MATRICE B — SOURCE AUTORITATIVE



Prouver que les Queries lisent la source PEOPLE certifiée.



Aucune seconde source de vérité n'est autorisée.



Tout index éventuellement utilisé doit être :



\- reconstructible ;

\- non autoritatif ;

\- cohérent avec la source PEOPLE.



\## MATRICE C — READ ONLY



Prouver qu'une Query :



\- ne modifie aucun état métier ;

\- n'émet aucun événement métier ;

\- ne produit aucun command receipt ;

\- n'exécute aucune commande ;

\- ne devient pas une seconde PeopleAuthority.



\## MATRICE D — ABSENCE / VIDE



Prouver que le comportement distingue correctement selon le contrat :



\- agrégat absent ;

\- résultat valide mais vide ;

\- indisponibilité de source lorsque applicable.



Aucune donnée absente ne doit être fabriquée.



\## MATRICE E — TEMPORALITÉ



Prouver que :



\- Owner ;

\- Participants ;

\- Contributors ;

\- Reviewers ;

\- Approvers



sont qualifiés selon les primitives temporelles canoniques du domaine.



La couche Query ne doit pas dupliquer les règles métier portées par WorkAssignment ou RoleAssignment.



\## MATRICE F — PROVENANCE ET COHÉRENCE



Prouver que les informations nécessaires de provenance/cohérence sont conservées à partir des données réellement certifiées.



Ne certifier aucun indicateur qui serait artificiellement reconstruit sans preuve.



\## MATRICE G — GET PERSON ASSIGNMENTS



Contrôler particulièrement `GetPersonAssignments`.



Prouver :



\- personne avec plusieurs assignments ;

\- personne sans assignment ;

\- cohérence avec la source PEOPLE ;

\- absence de seconde source autoritative ;

\- reconstruction de tout index secondaire éventuel.



\## MATRICE H — GET ASSIGNMENT HISTORY



Prouver que `GetAssignmentHistory` utilise l'histoire PEOPLE persistée et certifiée.



Contrôler :



\- événements réels ;

\- ordre ;

\- séquences ;

\- causalité ;

\- pagination si applicable ;

\- absence correctement qualifiée.



Aucun second journal n'est autorisé.



\## MATRICE I — FRONTIÈRES



Prouver que 001F n'introduit aucune :



\- API publique ;

\- BFF ;

\- intégration Work ;

\- interface frontend ;

\- nouvelle commande ;

\- mutation Runtime ;

\- mutation CEREBRAU ;

\- fonctionnalité P3-PEOPLE-001G.



\## MATRICE J — TESTS



Exécuter au minimum :



node --import tsx --test server/domain/people/\*.test.ts



Exécuter également le typecheck strict PEOPLE applicable.



Si le contrat/gate 001F exige des validations plus larges, les exécuter sans modifier leur code.



Toujours exécuter :



git diff --check



et :



git status --short



Reporter les résultats réellement obtenus.



Ne jamais déclarer PASS pour une commande non exécutée.



\## MATRICE K — NON-RÉGRESSION



Vérifier que les changements de 001F ne compromettent pas les invariants certifiés de :



\- People Authority ;

\- Persistence ;

\- Commands ;

\- Owner unique ;

\- CAS ;

\- idempotence ;

\- histoire ;

\- causalité.



Ne modifier aucun de ces composants pour faire passer artificiellement la certification.



\## CERTIFICATION OFFICIELLE



Rechercher d'abord la convention réellement utilisée dans :



Docs/12\_CERTIFICATION/PEOPLE/



et :



Docs/12\_CERTIFICATION/certification-registry.json



Ne pas inventer un nouveau schéma.



Si toutes les conditions GO sont satisfaites, créer :



Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json



selon exactement la convention existante.



La certification doit au minimum représenter correctement :



MissionId = P3-PEOPLE-001F-CERTIFICATION

DomainId = PEOPLE

LotId = P3-PEOPLE-001F

Status = CERTIFIED

CertifiedAt = timestamp réel

Evidence = preuves réellement contrôlées

Tests = commandes réellement exécutées

Regressions = NONE

PreviousLot = P3-PEOPLE-001E

NextAuthorizedLot = P3-PEOPLE-001G



Mettre à jour :



Docs/12\_CERTIFICATION/certification-registry.json



uniquement si cette opération correspond à la convention officielle déjà utilisée.



Ne créer aucun artefact P3-PEOPLE-001G.



\## FICHIERS AUTORISÉS EN ÉCRITURE



Uniquement :



Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json



Docs/12\_CERTIFICATION/certification-registry.json



Docs/24\_MODULES/WORK/PEOPLE\_QUERIES/MISSIONS/P3-PEOPLE-001F-M02\_CERTIFICATION\_REPORT.md



Aucun autre fichier ne doit être modifié.



\## RAPPORT UNIQUE



Créer :



Docs/24\_MODULES/WORK/PEOPLE\_QUERIES/MISSIONS/P3-PEOPLE-001F-M02\_CERTIFICATION\_REPORT.md



Le rapport doit contenir :



1\. préconditions ;

2\. matrice A–K ;

3\. preuves examinées ;

4\. commandes réellement exécutées ;

5\. résultats réels ;

6\. état des 9 Queries ;

7\. état de GetPersonAssignments ;

8\. état de GetAssignmentHistory ;

9\. frontières vérifiées ;

10\. fichiers créés/modifiés ;

11\. état du fichier officiel de certification ;

12\. état du registry ;

13\. git diff --check ;

14\. risques résiduels ;

15\. décision unique.



\## RÈGLE DE DÉCISION



GO uniquement si toutes les préconditions, toutes les exigences contractuelles et tous les gates obligatoires sont PASS.



Une preuve manquante n'est pas un PASS.



Un test non exécuté n'est pas un PASS.



Un défaut nécessitant une modification fonctionnelle entraîne NO GO.



\## VERDICT FINAL



Terminer exactement par l'une des deux lignes :



GO — P3-PEOPLE-001F-M02 — P3-PEOPLE-001F CERTIFIED



ou :



NO GO — P3-PEOPLE-001F-M02 — P3-PEOPLE-001F NOT CERTIFIED



Ne pas ouvrir P3-PEOPLE-001G.



