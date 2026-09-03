\# P3-PEOPLE-001G-M01 — WORK / PEOPLE INTERNAL INTEGRATION



\## MISSION



Implémenter exclusivement :



P3-PEOPLE-001G — Work Integration



Mission :



P3-PEOPLE-001G-M01



Cette mission ouvre uniquement le chemin interne permettant à Work de lire PEOPLE.



Aucune exposition publique.

Aucune nouvelle autorité métier.

Aucune duplication de PEOPLE dans Work.



\## OBJECTIF UNIQUE



Permettre aux composants internes Work de consulter les informations PEOPLE nécessaires via le read path PEOPLE déjà certifié.



Architecture cible minimale :



People Persistence

→ PeopleQueryService

→ Work/People internal integration

→ consommateur interne Work



Appliquer strictement :



REUSE → COMPLETE → TEST



Ne construire aucun framework générique d'intégration.



\## PRÉCONDITIONS



Vérifier factuellement avant écriture :



\- P3-PEOPLE-001F est officiellement CERTIFIED ;

\- `Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json` existe ;

\- son `Status` est `CERTIFIED` ;

\- son `NextAuthorizedLot` est `P3-PEOPLE-001G`.



Si une précondition échoue :



STOP.



Verdict :



NO GO — P3-PEOPLE-001G-M01



Ne réparer aucune certification précédente dans cette mission.



\## SOURCE CANONIQUE



Lire :



Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md



Section :



P3-PEOPLE-001G — Work Integration



Le contrat canonique prévaut sur cette mission en cas de divergence.



\## GIT PREFLIGHT



Avant toute écriture :



1\. exécuter `git status --short` ;

2\. capturer les changements préexistants ;

3\. identifier les fichiers réellement nécessaires ;

4\. préserver intégralement les changements préexistants ;

5\. ne faire aucun stash, reset, checkout ou revert destructif.



\## ÉTAT EXISTANT À RÉUTILISER



Le domaine PEOPLE dispose déjà du read path certifié.



Réutiliser notamment lorsque pertinent :



server/domain/people/people-query-service.ts

server/domain/people/people-persistence-ports.ts

server/domain/people/business-person.aggregate.ts

server/domain/people/work-people.aggregate.ts

server/domain/people/work-assignment.entity.ts

server/domain/people/role-assignment.entity.ts



Ne recréer aucune des 9 Queries PEOPLE.



Ne contourner jamais PeopleQueryService pour créer une seconde voie métier si le service certifié permet la lecture requise.



\## FRONTIÈRE WORK EXISTANTE



Work expose actuellement ses composants internes via :



server/runtime/work/work-core.ts



`WorkCoreAggregate` reste propriété de Work.



Ne pas injecter directement dans `WorkCoreAggregate` :



\- Owner ;

\- Participants ;

\- Contributors ;

\- Reviewers ;

\- Approvers ;

\- BusinessPerson ;

\- WorkPeople ;

\- copie d'Assignment PEOPLE.



Les données PEOPLE restent propriété de PEOPLE.



\## BUSINESS PERSON ≠ TECHNICAL AGENT



Maintenir strictement :



Business Person ≠ RuntimeAgent ≠ Technical Agent



En particulier :



`work-technical-agent.\*` ne doit pas devenir un stockage, proxy ou modèle de Business Person.



Ne pas ajouter `owner`, `participant`, `businessPerson` ou équivalent dans le modèle Technical Agent.



Ne pas utiliser Technical Agent comme fallback lorsqu'une information PEOPLE est absente.



\## INTÉGRATION CIBLE



Créer uniquement si aucun composant équivalent n'existe déjà une frontière interne Work → PEOPLE.



Nom privilégié si cohérent avec les conventions existantes :



server/runtime/work/work-people.query.ts



avec éventuellement :



server/runtime/work/work-people.types.ts



et :



server/runtime/work/work-people.test.ts



Ne créer ces fichiers que si leur responsabilité est réellement nécessaire.



Éviter un `service` supplémentaire si une Query interne suffit.



`work-core.ts` peut être modifié uniquement pour exporter explicitement cette nouvelle frontière interne si nécessaire.



\## RESPONSABILITÉ



La frontière Work/People :



\- reçoit une référence Work ;

\- consulte PEOPLE via son read path certifié ;

\- retourne un résultat interne qualifié ;

\- ne modifie aucune donnée ;

\- ne crée aucune règle PEOPLE ;

\- ne copie aucune source autoritative ;

\- ne persiste aucune donnée PEOPLE côté Work.



\## QUATRE ÉTATS OBLIGATOIRES



L'intégration doit distinguer explicitement et sans ambiguïté :



\### ÉTAT 1 — PEOPLE INDISPONIBLE



La source/service PEOPLE ne peut pas fournir la lecture.



Ce cas ne doit jamais être transformé en :



\- WorkPeople absent ;

\- zéro participant ;

\- Owner absent normal ;

\- collection vide artificielle.



Retourner un état explicitement qualifié comme indisponible selon le contrat.



\### ÉTAT 2 — WORKPEOPLE ABSENT



PEOPLE est disponible mais aucun `WorkPeople` n'existe pour la référence Work.



Ce cas est différent d'une indisponibilité.



Ne fabriquer :



\- aucun Owner ;

\- aucun Participant ;

\- aucune Assignment.



\### ÉTAT 3 — WORKPEOPLE EXISTE, ZÉRO PARTICIPANT ACTIF



Le WorkPeople existe réellement mais aucune Assignment ne qualifie un Participant actif à l'instant demandé.



Ce cas doit être représenté comme un résultat valide vide.



Il ne doit pas être confondu avec :



\- WorkPeople absent ;

\- PEOPLE indisponible.



\### ÉTAT 4 — PARTICIPANTS DISPONIBLES



WorkPeople existe et un ou plusieurs Participants sont qualifiés.



Retourner uniquement les données nécessaires au consommateur Work.



Ne pas transférer inutilement l'intégralité de l'agrégat PEOPLE si le contrat n'en a pas besoin.



\## TEMPORALITÉ



Toute lecture dépendant d'un instant doit être explicitement qualifiée.



Ne pas cacher un `new Date()` au cœur de l'adaptateur si cela rend les résultats non déterministes.



Réutiliser la qualification temporelle certifiée de PeopleQueryService.



Ne recalculer aucune règle d'effectivité côté Work.



\## OWNER ET RÔLES



Si Work doit consulter Owner, Participants ou rôles PEOPLE, utiliser les Queries PEOPLE certifiées correspondantes.



Ne réimplémenter dans Work aucune logique :



\- Owner ;

\- Participant ;

\- Contributor ;

\- Reviewer ;

\- Approver ;

\- période ;

\- statut d'Assignment ;

\- effectivité de rôle.



PEOPLE reste autorité.



\## PROVENANCE



Préserver la qualification/provenance nécessaire pour que Work sache que l'information provient de PEOPLE.



Ne créer aucune provenance artificielle.



Ne convertir aucune donnée PEOPLE en donnée Work autoritative.



\## ABSENCE DE CACHE AUTORITATIF



Aucun cache PEOPLE persistant côté Work.



Aucune table PEOPLE côté Work.



Aucun snapshot PEOPLE propriétaire de Work.



Aucun index PEOPLE autoritatif côté Work.



Si un mécanisme technique temporaire est réellement nécessaire, il doit être démontré comme non autoritatif et reconstructible.



Par défaut : ne pas en créer.



\## SEPT DOMAINES WORK



Les domaines Work Phase 1 existants doivent rester fonctionnellement inchangés.



Ne modifier aucune logique métier existante de :



\- Work Core/Foundation ;

\- Objective ;

\- Deliverables ;

\- Decisions ;

\- Technical Agent ;

\- ni aucun autre domaine Work Phase 1 identifié par le contrat.



L'intégration PEOPLE est additive et interne.



Si le contrat canonique identifie sept domaines précis, utiliser exactement cette liste comme référence.



Ne modifier leur comportement que si le contrat 001G l'exige explicitement.



\## FICHIERS POTENTIELLEMENT AUTORISÉS



Après inspection, limiter l'écriture au strict minimum.



Fichiers nouveaux potentiels :



server/runtime/work/work-people.query.ts

server/runtime/work/work-people.types.ts

server/runtime/work/work-people.test.ts



Fichier existant potentiellement modifiable :



server/runtime/work/work-core.ts



Fichiers PEOPLE :



lecture uniquement par défaut.



Toute nécessité de modifier :



server/domain/people/



doit entraîner STOP sauf défaut strictement nécessaire démontré par le contrat.



Ne corriger aucun défaut PEOPLE silencieusement dans 001G.



\## ZONES INTERDITES



Ne modifier aucun fichier sous :



server/nova-core/

server/nova-bff/

tools/

apps/

client/



Ne modifier aucune persistence PEOPLE.



Ne modifier aucune certification précédente.



Ne modifier aucun contrat canonique.



Ne modifier aucun blueprint.



Ne modifier aucune infrastructure CEREBRAU/NOVA.



\## EXPOSITIONS INTERDITES



Ne créer :



\- aucune route HTTP ;

\- aucune API publique ;

\- aucun endpoint ;

\- aucun resolver public ;

\- aucun DTO BFF ;

\- aucun composant frontend ;

\- aucune page ;

\- aucun dashboard.



001G est exclusivement une intégration interne Work/People.



\## OFFER



Ne modifier aucun workflow OFFER.



Ne lire OFFER que si une preuve contractuelle indispensable l'exige.



Aucun développement OFFER n'appartient à cette mission.



\## TESTS OBLIGATOIRES



Créer des tests ciblés démontrant au minimum :



\### T1 — PEOPLE indisponible



Le résultat indique explicitement l'indisponibilité.



Aucun fallback fabriqué.



\### T2 — WorkPeople absent



PEOPLE est disponible.



WorkPeople est absent.



Le résultat est distinct de T1.



\### T3 — zéro Participant actif



WorkPeople existe.



Aucun Participant n'est actif à l'instant demandé.



Le résultat est valide et vide.



Il est distinct de T1 et T2.



\### T4 — Participants disponibles



WorkPeople existe.



Les Participants actifs sont retournés correctement.



\### T5 — Owner



Si Owner fait partie de la lecture requise, démontrer que sa valeur vient de la Query PEOPLE correspondante.



Aucune règle Owner ne doit exister côté Work.



\### T6 — temporalité



À deux instants différents, la lecture respecte exactement les résultats PEOPLE correspondants.



\### T7 — read only



Démontrer que l'intégration :



\- ne commande rien ;

\- n'écrit rien ;

\- n'émet aucun événement ;

\- ne persiste aucune copie PEOPLE.



\### T8 — séparation identitaire



Démontrer que :



Business Person ≠ Technical Agent.



Aucun fallback de l'un vers l'autre.



\### T9 — non-régression Work



Les tests Work existants restent PASS.



\## VALIDATIONS MINIMALES



Exécuter les tests ciblés de la nouvelle intégration.



Exécuter ensuite :



node --import tsx --test server/runtime/work/\*.test.ts



Exécuter :



node --import tsx --test server/domain/people/\*.test.ts



si l'intégration importe directement les contrats PEOPLE et que cette validation est applicable.



Exécuter le typecheck pertinent.



Toujours exécuter :



git diff --check



et :



git status --short



Reporter uniquement les résultats réellement observés.



Un test non exécuté n'est jamais déclaré PASS.



\## NON-RÉGRESSION



Prouver que l'intégration ne modifie pas les comportements certifiés de :



\- PEOPLE Authority ;

\- PEOPLE Persistence ;

\- PEOPLE Commands ;

\- PEOPLE Queries ;

\- Work Core ;

\- Work Objective ;

\- Work Deliverables ;

\- Work Decisions ;

\- Work Technical Agent.



\## DISCIPLINE MVP



Ne créer aucun :



\- framework d'intégration générique ;

\- event bus ;

\- CQRS framework ;

\- cache distribué ;

\- nouvelle persistence ;

\- synchronisation bidirectionnelle ;

\- projection globale ;

\- API ;

\- BFF ;

\- UI.



La solution la plus petite respectant le contrat doit être privilégiée.



\## RAPPORT



Créer uniquement :



Docs/24\_MODULES/WORK/PEOPLE\_WORK\_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M01\_REPORT.md



Le rapport doit contenir :



1\. préconditions ;

2\. état Git initial ;

3\. composants PEOPLE réutilisés ;

4\. composants Work inspectés ;

5\. gap réellement constaté ;

6\. architecture finale ;

7\. liste exacte des fichiers créés/modifiés ;

8\. preuve des quatre états ;

9\. preuve Business Person ≠ Technical Agent ;

10\. preuve d'absence de duplication PEOPLE ;

11\. matrice des tests ;

12\. commandes réellement exécutées ;

13\. résultats réels ;

14\. non-régressions ;

15\. git diff --check ;

16\. risques résiduels ;

17\. verdict unique.



\## CRITÈRES GO



GO uniquement si :



\- P3-PEOPLE-001F est officiellement CERTIFIED ;

\- Work peut lire PEOPLE via le chemin certifié ;

\- les quatre états contractuels sont distincts et testés ;

\- aucune donnée PEOPLE n'est dupliquée comme autorité Work ;

\- aucune règle PEOPLE n'est réimplémentée dans Work ;

\- Business Person reste distinct de Technical Agent ;

\- les domaines Work existants restent inchangés fonctionnellement ;

\- aucune API/BFF/UI n'est créée ;

\- aucun workflow OFFER n'est modifié ;

\- tous les tests obligatoires exécutés passent ;

\- typecheck applicable PASS ;

\- git diff --check PASS ;

\- aucune régression bloquante n'est observée.



\## RÈGLE D'ÉCHEC



Si satisfaire 001G exige :



\- une modification structurelle de PEOPLE ;

\- une seconde source de vérité ;

\- une modification non autorisée d'un domaine Work ;

\- une exposition publique ;

\- une correction hors périmètre ;



STOP.



Documenter le blocage.



Retourner NO GO.



Ne contourner aucune frontière pour obtenir artificiellement GO.



\## VERDICT FINAL



Terminer exactement par :



GO — P3-PEOPLE-001G-M01



ou :



NO GO — P3-PEOPLE-001G-M01



Ne pas certifier P3-PEOPLE-001G dans cette mission.



Ne pas ouvrir le lot suivant.

