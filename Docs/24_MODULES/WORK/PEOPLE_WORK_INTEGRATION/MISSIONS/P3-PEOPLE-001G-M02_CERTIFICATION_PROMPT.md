\# P3-PEOPLE-001G-M02 — CERTIFICATION FINALE WORK / PEOPLE INTEGRATION



\## MISSION



Certifier exclusivement :



P3-PEOPLE-001G — Work Integration



Mission :



P3-PEOPLE-001G-M02



Cette mission est une mission de CERTIFICATION.



Aucun nouveau développement fonctionnel n'est autorisé.



\## OBJECTIF UNIQUE



Déterminer factuellement si l'intégration interne Work → PEOPLE réalisée par P3-PEOPLE-001G-M01 respecte intégralement le contrat P3-PEOPLE-001G et peut recevoir le statut officiel :



CERTIFIED



Ne pas améliorer l'implémentation pendant cette mission.



Ne pas anticiper le lot suivant.



\## PRÉCONDITIONS OBLIGATOIRES



Vérifier avant toute certification :



1\. `P3-PEOPLE-001F` est officiellement `CERTIFIED`.

2\. `Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json` existe.

3\. Son `NextAuthorizedLot` autorise `P3-PEOPLE-001G`.

4\. Le rapport M01 existe :



`Docs/24\_MODULES/WORK/PEOPLE\_WORK\_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M01\_REPORT.md`



5\. Le verdict terminal M01 est exactement :



`GO — P3-PEOPLE-001G-M01`



6\. Les fichiers d'intégration M01 existent réellement.

7\. Aucun lot suivant n'a été ouvert par M01.



Si une précondition obligatoire échoue :



STOP.



Ne pas réparer silencieusement le défaut.



Retourner :



NO GO — P3-PEOPLE-001G-M02 — P3-PEOPLE-001G NOT CERTIFIED



\## SOURCES CANONIQUES



Lire obligatoirement :



`Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md`



Lire :



`Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json`



Lire :



`Docs/24\_MODULES/WORK/PEOPLE\_WORK\_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M01\_REPORT.md`



Inspecter l'implémentation réelle M01.



Le contrat canonique prévaut sur le rapport M01 en cas de divergence.



\## GIT PREFLIGHT



Avant toute écriture :



\- exécuter `git status --short` ;

\- identifier les changements préexistants ;

\- distinguer les changements appartenant réellement à 001G ;

\- préserver tous les changements hors mission ;

\- ne faire aucun `reset`, `checkout`, `restore`, `stash` ou revert destructif.



\## INTERDICTION DE DÉVELOPPEMENT



Cette mission ne doit :



\- ajouter aucune fonctionnalité ;

\- refactorer aucun code ;

\- modifier aucune règle métier ;

\- corriger aucun défaut fonctionnel silencieusement ;

\- modifier aucune persistence PEOPLE ;

\- modifier aucun domaine Work pour obtenir artificiellement PASS.



Si une correction fonctionnelle est nécessaire :



STOP.



Documenter précisément le défaut.



Retourner NO GO.



\## MATRICE A — CHEMIN DE LECTURE



Prouver que le chemin réel est cohérent avec :



PEOPLE source certifiée

→ PeopleQueryService / read path certifié

→ intégration interne Work/People

→ consommateur interne Work



Prouver qu'aucune seconde voie autoritative PEOPLE n'a été créée.



\## MATRICE B — READ ONLY



Prouver que l'intégration Work/People :



\- ne modifie aucun état PEOPLE ;

\- ne modifie aucun état Work ;

\- n'exécute aucune Command PEOPLE ;

\- n'émet aucun événement métier ;

\- ne crée aucun command receipt ;

\- ne persiste aucune copie PEOPLE ;

\- ne devient aucune nouvelle PeopleAuthority.



\## MATRICE C — QUATRE ÉTATS CONTRACTUELS



Prouver par implémentation et tests la distinction exacte entre :



\### C1 — PEOPLE indisponible



La source PEOPLE ne peut pas fournir la lecture.



Cet état doit rester distinct de tous les autres.



\### C2 — WorkPeople absent



PEOPLE est disponible mais aucun WorkPeople n'existe.



Cet état doit rester distinct de l'indisponibilité.



\### C3 — WorkPeople existe, zéro Participant actif



WorkPeople existe réellement.



Le résultat Participants est valide mais vide.



Cet état doit rester distinct de C1 et C2.



\### C4 — Participants disponibles



WorkPeople existe et des Participants actifs sont disponibles.



Ils proviennent exclusivement du read path PEOPLE.



Aucun des quatre états ne doit être fabriqué, fusionné ou remplacé par un fallback.



\## MATRICE D — OWNER ET RÔLES



Si l'intégration expose ou consulte :



\- Owner ;

\- Participants ;

\- Contributors ;

\- Reviewers ;

\- Approvers ;



prouver que la qualification provient des Queries PEOPLE certifiées.



Work ne doit réimplémenter aucune règle de :



\- rôle ;

\- Assignment ;

\- période ;

\- statut ;

\- Owner unique ;

\- effectivité temporelle.



\## MATRICE E — TEMPORALITÉ



Prouver que les résultats temporels sont déterministes et utilisent les primitives/Queries PEOPLE certifiées.



Vérifier notamment qu'aucune règle métier temporelle parallèle n'est recréée côté Work.



Si un instant d'observation est nécessaire, vérifier qu'il est explicitement contrôlable/testable.



\## MATRICE F — BUSINESS PERSON / TECHNICAL AGENT



Prouver strictement :



Business Person ≠ RuntimeAgent ≠ Technical Agent



Inspecter particulièrement les fichiers `work-technical-agent.\*`.



Vérifier qu'aucun Business Person n'est :



\- stocké comme Technical Agent ;

\- converti implicitement en Technical Agent ;

\- utilisé comme fallback Technical Agent ;

\- enrichi artificiellement avec une identité technique.



Vérifier également qu'un Technical Agent ne devient pas :



\- Owner PEOPLE ;

\- Participant PEOPLE ;

\- Business Person.



\## MATRICE G — OWNERSHIP ET DUPLICATION



Prouver que PEOPLE reste propriétaire de :



\- BusinessPerson ;

\- WorkPeople ;

\- WorkAssignment ;

\- RoleAssignment ;

\- rôles PEOPLE ;

\- temporalité PEOPLE ;

\- provenance PEOPLE.



Work ne doit posséder :



\- aucune table PEOPLE ;

\- aucun snapshot PEOPLE autoritatif ;

\- aucun cache persistant PEOPLE ;

\- aucun second journal PEOPLE ;

\- aucun index autoritatif PEOPLE.



Toute représentation interne doit être une lecture non autoritative.



\## MATRICE H — WORK PHASE 1



Prouver que les domaines Work Phase 1 identifiés par le contrat restent fonctionnellement inchangés.



Inspecter les modifications réelles et les tests.



L'intégration PEOPLE doit être additive.



Aucune régression métier Work ne doit être masquée.



\## MATRICE I — FRONTIÈRES



Prouver que 001G n'introduit aucune :



\- API publique ;

\- route HTTP ;

\- BFF ;

\- DTO public ;

\- interface frontend ;

\- page ;

\- dashboard ;

\- intégration OFFER ;

\- nouvelle persistence ;

\- modification CEREBRAU ;

\- modification NOVA Core ;

\- fonctionnalité appartenant au lot suivant.



\## MATRICE J — OFFER



Vérifier explicitement qu'aucun workflow OFFER n'a été modifié par 001G.



Aucune logique OFFER ne doit être ajoutée ou adaptée dans cette mission.



\## MATRICE K — TESTS ET NON-RÉGRESSION



Exécuter au minimum les tests ciblés de l'intégration Work/People.



Exécuter :



`node --import tsx --test server/runtime/work/\*.test.ts`



Exécuter :



`node --import tsx --test server/domain/people/\*.test.ts`



si applicable à l'état réel de l'intégration.



Exécuter le typecheck pertinent.



Exécuter également toute validation obligatoire explicitement exigée par le contrat 001G.



Toujours exécuter un contrôle whitespace Git.



Si `git diff --check` global est anormalement lent à cause du worktree préexistant, il est permis de compléter le diagnostic avec un `git diff --check -- <liste exacte des fichiers 001G>`.



Ne jamais transformer un contrôle ciblé en preuve du worktree global : documenter exactement la portée réellement contrôlée.



Reporter uniquement les commandes réellement exécutées et leurs résultats réels.



Un test non exécuté n'est jamais PASS.



\## ENCODAGE DU RAPPORT M01



Le terminal a précédemment affiché au moins une chaîne mojibake de type :



`critÃ¨res`



Déterminer factuellement s'il s'agit :



\- uniquement d'un problème d'affichage/console ;

\- ou d'un encodage réellement altéré dans le fichier.



Ne modifier pas le rapport M01 uniquement pour embellir son texte.



Si le verdict terminal réel est exactement :



`GO — P3-PEOPLE-001G-M01`



et que le contenu reste exploitable sans ambiguïté, documenter l'anomalie comme risque documentaire non bloquant si approprié.



Si l'encodage rend une preuve obligatoire ambiguë ou corrompue, retourner NO GO.



\## FICHIERS M01 À CONTRÔLER



Inspecter les fichiers réellement créés/modifiés par M01.



La liste attendue d'après la mission est limitée notamment à :



`server/runtime/work/work-people.query.ts`



`server/runtime/work/work-people.types.ts`



`server/runtime/work/work-people.test.ts`



`server/runtime/work/work-core.ts`



et :



`Docs/24\_MODULES/WORK/PEOPLE\_WORK\_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M01\_REPORT.md`



Ne pas supposer que cette liste constitue une preuve : confirmer avec Git et le contenu réel.



\## CERTIFICATION OFFICIELLE



Avant création, inspecter la convention réelle utilisée dans :



`Docs/12\_CERTIFICATION/PEOPLE/`



et :



`Docs/12\_CERTIFICATION/certification-registry.json`



Réutiliser exactement le schéma existant.



Ne pas inventer une nouvelle structure de certification.



Si et seulement si toutes les conditions GO sont satisfaites, créer :



`Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001G.certification.json`



Le fichier doit représenter correctement au minimum :



\- `MissionId`: `P3-PEOPLE-001G-CERTIFICATION`

\- `DomainId`: `PEOPLE`

\- `LotId`: `P3-PEOPLE-001G`

\- `Status`: `CERTIFIED`

\- `CertifiedAt`: timestamp réel

\- `Evidence`: preuves réellement vérifiées

\- `Tests`: commandes réellement exécutées et résultats réels

\- `Regressions`: `NONE`

\- `PreviousLot`: `P3-PEOPLE-001F`



Pour le prochain lot :



NE PAS INVENTER `NextAuthorizedLot`.



Lire le contrat canonique et le registre.



Utiliser uniquement le prochain lot explicitement autorisé par la source canonique.



S'il n'existe aucun prochain lot autorisé, représenter exactement la convention officielle applicable sans en créer un.



\## REGISTRE



Mettre à jour :



`Docs/12\_CERTIFICATION/certification-registry.json`



uniquement conformément à la convention déjà utilisée.



Ajouter/modifier exclusivement l'entrée nécessaire à `P3-PEOPLE-001G`.



Ne modifier aucune certification précédente.



\## ÉCRITURE AUTORISÉE



Uniquement :



`Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001G.certification.json`



`Docs/12\_CERTIFICATION/certification-registry.json`



`Docs/24\_MODULES/WORK/PEOPLE\_WORK\_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M02\_CERTIFICATION\_REPORT.md`



Aucun fichier TypeScript ne doit être modifié pendant M02.



Aucun fichier M01 ne doit être réécrit.



\## RAPPORT UNIQUE



Créer :



`Docs/24\_MODULES/WORK/PEOPLE\_WORK\_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M02\_CERTIFICATION\_REPORT.md`



Le rapport doit contenir :



1\. préconditions ;

2\. état Git initial ;

3\. sources canoniques examinées ;

4\. fichiers M01 réellement contrôlés ;

5\. matrice A–K ;

6\. preuve des quatre états ;

7\. preuve read-only ;

8\. preuve d'absence de duplication ;

9\. preuve Business Person ≠ RuntimeAgent ≠ Technical Agent ;

10\. preuve de non-régression Work ;

11\. preuve d'absence de modification OFFER ;

12\. commandes réellement exécutées ;

13\. résultats réels ;

14\. typecheck ;

15\. contrôle `git diff --check` et sa portée exacte ;

16\. état de l'encodage du rapport M01 ;

17\. fichiers créés/modifiés par M02 ;

18\. état de la certification officielle ;

19\. état du registry ;

20\. risques résiduels ;

21\. décision terminale unique.



\## CRITÈRES GO



GO uniquement si :



\- 001F est officiellement CERTIFIED ;

\- M01 est réellement GO ;

\- le chemin Work → PEOPLE utilise la source certifiée ;

\- les quatre états contractuels sont prouvés ;

\- l'intégration est strictement read-only ;

\- aucune règle PEOPLE n'est dupliquée dans Work ;

\- aucune source PEOPLE parallèle n'existe ;

\- Business Person reste distinct de RuntimeAgent et Technical Agent ;

\- les domaines Work existants restent fonctionnellement conformes ;

\- aucun workflow OFFER n'est modifié ;

\- aucune API/BFF/UI n'est créée ;

\- tous les tests obligatoires réellement exécutés passent ;

\- le typecheck applicable passe ;

\- le contrôle Git applicable passe ;

\- aucune régression bloquante n'est constatée ;

\- toutes les preuves obligatoires sont disponibles.



Une preuve absente n'est pas PASS.



Un test non exécuté n'est pas PASS.



\## RÈGLE D'ÉCHEC



Si une condition de certification nécessite une modification fonctionnelle :



STOP.



Ne modifier aucun code.



Ne contourner aucune frontière.



Ne corriger aucune implémentation dans M02.



Retourner :



NO GO — P3-PEOPLE-001G-M02 — P3-PEOPLE-001G NOT CERTIFIED



\## VERDICT FINAL



Terminer exactement par l'une des deux lignes suivantes :



GO — P3-PEOPLE-001G-M02 — P3-PEOPLE-001G CERTIFIED



ou :



NO GO — P3-PEOPLE-001G-M02 — P3-PEOPLE-001G NOT CERTIFIED



Ne pas ouvrir le lot suivant.

