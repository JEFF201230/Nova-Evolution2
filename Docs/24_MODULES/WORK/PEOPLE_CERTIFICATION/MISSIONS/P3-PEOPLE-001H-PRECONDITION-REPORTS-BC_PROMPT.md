\# P3-PEOPLE-001H-PRECONDITION-REPORTS-BC — RÉGULARISATION DOCUMENTAIRE B/C



\## NATURE DE LA MISSION



Mission documentaire corrective préalable à :



P3-PEOPLE-001H — People Certification



Cette mission NE réouvre PAS :



\- P3-PEOPLE-001B ;

\- P3-PEOPLE-001C.



Elle NE modifie PAS leurs statuts de certification.



Elle NE développe aucune fonctionnalité.



Elle vise exclusivement à traiter une précondition documentaire manquante identifiée avant P3-PEOPLE-001H.



\## FAIT DÉCLENCHEUR



Le contrat canonique :



`Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md`



exige pour l'entrée dans P3-PEOPLE-001H :



`P3-PEOPLE-001G GO ; tous les rapports B à G disponibles`



Les certifications officielles suivantes existent :



`Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001B.certification.json`



`Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001C.certification.json`



Elles portent actuellement :



\- P3-PEOPLE-001B : CERTIFIED ;

\- P3-PEOPLE-001C : CERTIFIED.



Cependant, aucune recherche documentaire préalable n'a identifié de rapport physique B ou C.



La mission doit vérifier ce fait elle-même avant toute écriture.



\## OBJECTIF UNIQUE



Déterminer si les preuves historiques et l'état actuel du dépôt permettent de matérialiser, sans invention ni falsification :



1\. un rapport documentaire de preuve pour P3-PEOPLE-001B ;

2\. un rapport documentaire de preuve pour P3-PEOPLE-001C ;



afin de satisfaire la précondition documentaire de P3-PEOPLE-001H.



Cette mission ne doit PAS transformer une preuve absente en preuve historique fictive.



\## PRINCIPE ABSOLU



Distinguer strictement :



\### PREUVE HISTORIQUE



Information explicitement enregistrée dans une certification ou un artefact existant.



\### PREUVE ACTUELLE



Information vérifiée pendant cette mission sur l'état courant du dépôt.



\### INCONNU



Information qui ne peut être prouvée ni historiquement ni actuellement.



Ne jamais présenter une preuve actuelle comme ayant été exécutée lors de B ou C.



Ne jamais inventer :



\- commande historique ;

\- timestamp historique ;

\- résultat historique ;

\- fichier historique ;

\- rapport historique ;

\- auteur ;

\- exécution Codex ;

\- décision non matérialisée.



\## SOURCES CANONIQUES



Lire obligatoirement :



`Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md`



Lire obligatoirement :



`Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001B.certification.json`



`Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001C.certification.json`



Inspecter également les références canoniques nécessaires identifiées par le contrat.



Le contrat canonique prévaut sur cette mission en cas de divergence.



\## PREFLIGHT GIT



Avant toute écriture :



\- exécuter `git status --short` ;

\- capturer les changements préexistants ;

\- préserver intégralement ces changements ;

\- ne faire aucun reset ;

\- ne faire aucun restore ;

\- ne faire aucun checkout destructif ;

\- ne faire aucun stash ;

\- ne modifier aucun fichier hors liste autorisée.



\## ÉTAPE 1 — RECHERCHE EXHAUSTIVE DES RAPPORTS B/C



Avant de créer quoi que ce soit, rechercher dans le dépôt entier toute trace de :



\- P3-PEOPLE-001B ;

\- P3-PEOPLE-001C ;

\- rapport B ;

\- rapport C ;

\- certification B ;

\- certification C ;

\- éventuels anciens noms ou chemins manifestement associés.



Si un véritable rapport B ou C existe déjà :



STOP pour le rapport concerné.



Ne pas créer de doublon.



Documenter son chemin exact.



\## ÉTAPE 2 — AUDIT DE LA CERTIFICATION B



Contrôler :



`Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001B.certification.json`



Vérifier au minimum :



\- MissionId ;

\- DomainId ;

\- LotId ;

\- Status ;

\- CertifiedAt ;

\- Evidence ;

\- Tests ;

\- Regressions ;

\- PreviousLot ;

\- NextAuthorizedLot.



Vérifier que le document affirme réellement :



`P3-PEOPLE-001B — CERTIFIED`



Ne modifier aucune de ces valeurs.



\## ÉTAPE 3 — AUDIT FACTUEL DE B



À partir du contrat canonique, identifier les exigences exactes de P3-PEOPLE-001B.



Contrôler l'état courant des artefacts Foundation concernés, notamment lorsque réellement applicables :



\- `business-person.aggregate.ts`

\- `work-people.aggregate.ts`

\- `work-assignment.entity.ts`

\- `role-assignment.entity.ts`

\- `people.value-objects.ts`

\- `people.errors.ts`

\- `people-foundation-access.ts`

\- `index.ts`



Vérifier les affirmations contenues dans `Evidence` de la certification B.



Classer chaque affirmation :



\- HISTORICALLY\_RECORDED ;

\- CURRENTLY\_VERIFIED ;

\- BOTH ;

\- UNVERIFIED.



Une affirmation non vérifiable ne doit pas être inventée ou transformée en PASS.



\## ÉTAPE 4 — AUDIT DE LA CERTIFICATION C



Contrôler :



`Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001C.certification.json`



Vérifier au minimum :



\- MissionId ;

\- DomainId ;

\- LotId ;

\- Status ;

\- CertifiedAt ;

\- Evidence ;

\- Tests ;

\- Regressions ;

\- PreviousLot ;

\- NextAuthorizedLot.



Ne modifier aucune valeur.



\## ÉTAPE 5 — AUDIT FACTUEL DE C



À partir du contrat canonique, identifier les exigences exactes de P3-PEOPLE-001C.



Contrôler l'état courant des artefacts Authoritative Producer concernés, notamment lorsque réellement applicables :



\- `people-authority.guard.ts`

\- `people-authority.commands.ts`

\- `people-authority.events.ts`

\- `people-authority.ts`

\- `people-authority.test.ts`



Vérifier les affirmations contenues dans `Evidence` de la certification C.



Classer chaque affirmation :



\- HISTORICALLY\_RECORDED ;

\- CURRENTLY\_VERIFIED ;

\- BOTH ;

\- UNVERIFIED.



\## ÉTAPE 6 — COHÉRENCE B → C



Prouver sur l'état courant que :



Foundation

→ People Authority



respecte toujours la séparation prévue par le contrat.



Vérifier notamment :



\- deux agrégats Foundation attendus ;

\- Foundation ne devient pas People Authority ;

\- People Authority reste le producteur autoritatif ;

\- absence de dépendance RuntimeAgent / Technical Agent dans Foundation ;

\- absence de persistence dans B ;

\- absence de Query dans B/C lorsque interdite par leur périmètre historique ;

\- absence de source autoritative concurrente.



Ne pas modifier le code si une anomalie est trouvée.



\## TESTS



La mission peut exécuter des tests actuels afin de vérifier que les preuves documentaires restent compatibles avec l'état courant.



Ces résultats doivent être explicitement marqués :



`CURRENT VERIFICATION`



et jamais présentés comme les tests historiques de B/C.



Exécuter au minimum, si applicables à l'état courant :



`node --import tsx --test server/domain/people/\*.test.ts`



le typecheck PEOPLE pertinent ;



le typecheck NOVA Core pertinent.



Exécuter les contrôles Runtime/Core uniquement si nécessaires pour confirmer une affirmation utilisée dans les rapports ou exigés par le contrat applicable.



Exécuter :



`git diff --check`



Si le contrôle global est anormalement lent en raison du worktree préexistant, documenter ce fait et utiliser un contrôle ciblé sur les fichiers écrits par cette mission.



Ne jamais déclarer un test non exécuté PASS.



\## INTERDICTION DE RECERTIFICATION



Cette mission ne doit PAS :



\- changer `Status` de B ;

\- changer `Status` de C ;

\- changer `CertifiedAt` ;

\- modifier `Evidence` dans les JSON existants ;

\- modifier `Tests` dans les JSON existants ;

\- modifier `PreviousLot` ;

\- modifier `NextAuthorizedLot` ;

\- réécrire `certification-registry.json` ;

\- prétendre avoir rejoué les missions historiques.



Les certifications existantes restent les sources historiques officielles.



\## INTERDICTION DE CODE



Aucun fichier sous les chemins suivants ne peut être modifié :



`server/`



`tools/`



`apps/`



`client/`



Aucun contrat ou blueprint ne peut être modifié.



Si une correction fonctionnelle devient nécessaire :



STOP.



Retourner NO GO documentaire.



\## RAPPORT B AUTORISÉ



Si et seulement si :



\- aucun véritable rapport B n'existe déjà ;

\- la certification officielle B est cohérente ;

\- ses affirmations structurantes sont suffisamment corroborées par les artefacts actuels ;

\- aucune contradiction bloquante n'est trouvée ;



créer :



`Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/P3-PEOPLE-001B\_EVIDENCE\_RECOVERY\_REPORT.md`



Le titre doit être :



`# P3-PEOPLE-001B — EVIDENCE RECOVERY REPORT`



Le document doit déclarer explicitement :



`This is a retrospective evidence-recovery document. It is not the original P3-PEOPLE-001B execution report and does not alter the historical certification.`



Le rapport doit distinguer :



\- certification historique ;

\- preuves historiques enregistrées ;

\- vérifications actuelles ;

\- éléments non reconstructibles ;

\- conclusion documentaire.



Ne jamais le présenter comme le rapport original de B.



\## RAPPORT C AUTORISÉ



Sous les mêmes conditions, créer :



`Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/P3-PEOPLE-001C\_EVIDENCE\_RECOVERY\_REPORT.md`



Titre :



`# P3-PEOPLE-001C — EVIDENCE RECOVERY REPORT`



Inclure obligatoirement :



`This is a retrospective evidence-recovery document. It is not the original P3-PEOPLE-001C execution report and does not alter the historical certification.`



\## QUESTION DE CONFORMITÉ CRITIQUE



Après création éventuelle des documents, déterminer explicitement si ces rapports de récupération peuvent légitimement satisfaire la condition contractuelle :



`tous les rapports B à G disponibles`



Ne pas supposer que la création suffit.



Analyser la sémantique du contrat.



Si le contrat exige nécessairement les rapports originaux d'exécution et qu'un rapport de récupération ne peut pas les remplacer :



retourner NO GO.



Si le contrat permet factuellement que les preuves documentaires B/C soient rendues disponibles par une récupération transparente, sans falsifier l'historique :



retourner GO documentaire.



\## RAPPORT DE MISSION



Créer obligatoirement :



`Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/MISSIONS/P3-PEOPLE-001H-PRECONDITION-REPORTS-BC\_REPORT.md`



Il doit contenir :



1\. objectif ;

2\. état Git initial ;

3\. recherche des rapports existants ;

4\. sources examinées ;

5\. état certification B ;

6\. matrice de preuves B ;

7\. vérifications actuelles B ;

8\. état certification C ;

9\. matrice de preuves C ;

10\. vérifications actuelles C ;

11\. cohérence B → C ;

12\. tests actuels exécutés ;

13\. résultats exacts ;

14\. fichiers créés ;

15\. fichiers explicitement non modifiés ;

16\. inconnues restantes ;

17\. analyse de la précondition 001H ;

18\. décision sur la possibilité de reprendre 001H ;

19\. verdict terminal.



\## FICHIERS AUTORISÉS EN ÉCRITURE



Exclusivement :



`Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/P3-PEOPLE-001B\_EVIDENCE\_RECOVERY\_REPORT.md`



`Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/P3-PEOPLE-001C\_EVIDENCE\_RECOVERY\_REPORT.md`



`Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/MISSIONS/P3-PEOPLE-001H-PRECONDITION-REPORTS-BC\_REPORT.md`



Aucun autre fichier.



\## CRITÈRES GO



GO uniquement si :



\- aucun rapport original B/C n'a été trouvé ;

\- B est officiellement CERTIFIED ;

\- C est officiellement CERTIFIED ;

\- leurs identités sont cohérentes ;

\- leurs chaînes Previous/Next sont cohérentes ;

\- les preuves historiques enregistrées sont explicitement distinguées des vérifications actuelles ;

\- les affirmations structurantes nécessaires sont corroborées ;

\- aucune contradiction critique n'est détectée ;

\- aucun code n'est modifié ;

\- aucune certification existante n'est modifiée ;

\- les rapports de récupération sont transparents sur leur nature rétrospective ;

\- la condition documentaire de 001H peut être considérée satisfaite sans falsification.



\## RÈGLE NO GO



NO GO si :



\- un rapport original existe et serait dupliqué ;

\- une certification B/C est incohérente ;

\- une affirmation indispensable est contredite ;

\- une preuve indispensable ne peut être corroborée ;

\- une modification fonctionnelle serait nécessaire ;

\- satisfaire le gate 001H nécessiterait de prétendre que les rapports récupérés sont les rapports originaux ;

\- une ambiguïté critique subsiste.



\## VERDICT TERMINAL



Terminer exactement par :



`GO — P3-PEOPLE-001H-PRECONDITION-REPORTS-BC — B/C EVIDENCE RECOVERY ACCEPTABLE`



ou :



`NO GO — P3-PEOPLE-001H-PRECONDITION-REPORTS-BC — B/C EVIDENCE RECOVERY INSUFFICIENT`



Ne pas relancer P3-PEOPLE-001H.



Ne pas ouvrir Planning.

