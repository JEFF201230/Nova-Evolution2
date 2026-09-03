\# P3-PEOPLE-001H — PEOPLE FOUNDATION FINAL CERTIFICATION



\## MISSION



Certifier exclusivement :



P3-PEOPLE-001H — People Certification



Objet :



certification finale de l'ensemble P3-PEOPLE-001.



Cette mission doit déterminer si People Foundation peut être définitivement clôturé par un verdict GO ou NO GO.



Cette mission n'est PAS une mission de développement.



\## OBJECTIF UNIQUE



Auditer et certifier de manière consolidée l'ensemble de la chaîne :



P3-PEOPLE-001B — People Foundation Model

P3-PEOPLE-001C — People Authoritative Producer

P3-PEOPLE-001D — People Persistence

P3-PEOPLE-001E — People Commands

P3-PEOPLE-001F — People Queries

P3-PEOPLE-001G — Work Integration



Puis décider factuellement :



1\. si P3-PEOPLE-001 peut être clôturé ;

2\. si People Foundation est conforme au blueprint et au contrat ;

3\. si l'ouverture de Planning peut être autorisée.



\## SOURCE CANONIQUE PRINCIPALE



Lire obligatoirement :



Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md



Le contrat canonique prévaut sur :



\- les rapports intermédiaires ;

\- les certifications intermédiaires ;

\- les commentaires de code ;

\- les hypothèses ;

\- le présent prompt en cas de divergence.



Ne modifier jamais ce contrat.



\## PRÉCONDITIONS



Avant toute écriture, vérifier factuellement :



\- P3-PEOPLE-001G est officiellement CERTIFIED ;

\- son fichier officiel de certification existe ;

\- `Status` vaut `CERTIFIED` ;

\- `PreviousLot` vaut `P3-PEOPLE-001F` ;

\- `NextAuthorizedLot` vaut `P3-PEOPLE-001H` ;

\- les rapports nécessaires B à G existent ;

\- les certifications intermédiaires attendues existent ;

\- aucun sous-lot B à G ne reste officiellement NO GO ou PENDING\_EVIDENCE.



Si une précondition obligatoire échoue :



STOP.



Ne réparer aucune certification précédente silencieusement.



Retourner :



NO GO — P3-PEOPLE-001H — P3-PEOPLE-001 NOT CERTIFIED



\## GIT PREFLIGHT



Avant toute écriture :



1\. exécuter `git status --short` ;

2\. capturer l'état initial ;

3\. identifier les modifications préexistantes ;

4\. préserver intégralement les changements hors mission ;

5\. ne faire aucun reset, restore, checkout, stash ou revert destructif.



Le worktree n'a pas besoin d'être propre pour certifier, mais aucune modification préexistante ne doit être attribuée artificiellement à 001H.



\## INVENTAIRE B → G



Construire factuellement l'inventaire des preuves pour :



\### B — Foundation Model



Vérifier :



\- agrégats ;

\- entités ;

\- Value Objects ;

\- invariants ;

\- erreurs internes ;

\- séparation des responsabilités.



\### C — Authoritative Producer



Vérifier :



\- People Authority ;

\- unicité du producteur ;

\- provenance ;

\- causalité ;

\- événements ;

\- absence de source technique concurrente.



\### D — Persistence



Vérifier :



\- source durable unique ;

\- état canonique ;

\- histoire ;

\- atomicité ;

\- concurrence ;

\- CAS/révisions ;

\- idempotence ;

\- migrations ;

\- recovery ;

\- absence de duplication autoritative.



\### E — Commands



Vérifier :



\- commandes contractuelles ;

\- chemin interne d'écriture ;

\- erreurs ;

\- événements ;

\- idempotence ;

\- ordre causal ;

\- absence d'exposition publique.



\### F — Queries



Vérifier :



\- neuf Queries contractuelles ;

\- lecture canonique ;

\- absences qualifiées ;

\- cohérence temporelle ;

\- absence de logique métier consommatrice ;

\- absence d'exposition publique.



\### G — Work Integration



Vérifier :



\- lecture interne Work → PEOPLE ;

\- absence de duplication ;

\- quatre états contractuels ;

\- séparation Business Person / Technical Agent ;

\- non-régression des domaines Work Phase 1 ;

\- absence API/BFF/Frontend.



\## RÈGLE DE PREUVE



Une certification intermédiaire est une preuve documentaire, mais ne dispense pas de vérifier la cohérence globale.



Ne pas réimplémenter tous les audits B → G sans raison.



Appliquer :



REUSE DES PREUVES → CONTRÔLE DE COHÉRENCE → TESTS FINAUX



Réutiliser les rapports et certifications existants lorsque leur identité, leur statut et leurs preuves sont cohérents.



Réouvrir une analyse détaillée uniquement lorsqu'une contradiction, une preuve absente ou une anomalie réelle est détectée.



\## MATRICE DE CONFORMITÉ GLOBALE



Construire une matrice finale reliant au minimum :



\- exigence du blueprint/contrat ;

\- sous-lot responsable ;

\- implémentation réelle ;

\- preuve documentaire ;

\- test/preuve exécutable ;

\- résultat PASS/FAIL.



Aucune exigence obligatoire ne doit rester :



\- UNKNOWN ;

\- NOT\_EVALUATED ;

\- PENDING\_EVIDENCE ;

\- contradictoire.



\## OWNERSHIP



Prouver que PEOPLE reste l'autorité unique sur :



\- BusinessPerson ;

\- WorkPeople ;

\- WorkAssignment ;

\- RoleAssignment ;

\- rôles PEOPLE ;

\- provenance PEOPLE ;

\- temporalité PEOPLE ;

\- historique PEOPLE.



Rechercher explicitement toute seconde source de vérité.



Toute source autoritative concurrente entraîne NO GO.



\## BUSINESS PERSON / TECHNICAL AGENT



Prouver globalement :



Business Person ≠ RuntimeAgent ≠ Technical Agent



Vérifier qu'aucune évolution B → G n'a introduit :



\- conversion implicite ;

\- fallback ;

\- ownership croisé ;

\- stockage commun ambigu ;

\- promotion d'une identité technique en Business Person.



Toute ambiguïté d'identité bloquante entraîne NO GO.



\## PERSISTENCE



Confirmer que la persistence certifiée reste cohérente avec le modèle métier final.



Vérifier notamment :



\- état + histoire + reçu + révision ;

\- transaction atomique ;

\- concurrence ;

\- replay ;

\- recovery ;

\- migration ;

\- intégrité ;

\- aucune suppression métier incompatible ;

\- aucune seconde persistence PEOPLE.



Ne modifier aucune persistence dans 001H.



\## COMMAND / QUERY COHERENCE



Prouver que :



Commands

→ People Authority

→ Persistence



et :



Persistence

→ People Queries



restent cohérents.



Les Queries ne doivent pas constituer une seconde source.



Les Commands ne doivent pas contourner People Authority.



\## WORK INTEGRATION



Prouver que :



PEOPLE

→ read path certifié

→ Work integration



reste unidirectionnel en lecture pour le périmètre 001G.



Work ne devient pas propriétaire de PEOPLE.



Les quatre états d'absence doivent rester distincts :



1\. PEOPLE indisponible ;

2\. WorkPeople absent ;

3\. WorkPeople présent avec zéro Participant actif ;

4\. Participants disponibles.



\## FRONTIÈRES



Rechercher explicitement toute violation introduite pendant B → G.



People Foundation ne doit avoir créé prématurément aucune :



\- API publique ;

\- route HTTP ;

\- BFF ;

\- UI ;

\- dashboard ;

\- workflow OFFER ;

\- ownership Planning ;

\- dépendance circulaire Work/People ;

\- framework générique inutile.



\## WP-001



Identifier dans les sources canoniques les invariants WP-001 applicables.



Prouver qu'aucun n'a été affaibli.



Ne pas inventer leur définition depuis le présent prompt : utiliser les documents canoniques.



Un invariant obligatoire WP-001 affaibli entraîne NO GO.



\## CONTRADICTIONS



Rechercher particulièrement :



\- doubles sources de vérité ;

\- doubles producteurs ;

\- doubles chemins de commande ;

\- doubles chemins de query ;

\- duplication d'Assignments ;

\- duplication de rôles ;

\- divergence des temporalités ;

\- divergence des identités ;

\- divergence entre certification JSON et implémentation ;

\- divergence entre rapports et tests réels.



Toute contradiction critique non résolue entraîne NO GO.



\## TESTS FINAUX OBLIGATOIRES



Exécuter les tests PEOPLE ciblés applicables.



Exécuter :



node --import tsx --test server/domain/people/\*.test.ts



Exécuter :



node --import tsx --test server/runtime/work/\*.test.ts



Exécuter les tests Runtime obligatoires du dépôt.



Exécuter les tests Core obligatoires du dépôt.



Exécuter les typechecks pertinents.



Exécuter les contrôles CEREBRAU/certification applicables existants lorsque leur usage est prévu par le dépôt.



Toujours exécuter :



git diff --check



Si le contrôle global est anormalement lent à cause de l'état préexistant du worktree :



\- documenter le comportement ;

\- ne pas déclarer artificiellement PASS ;

\- utiliser si nécessaire des contrôles ciblés complémentaires ;

\- préciser exactement leur portée.



Un test non exécuté n'est jamais PASS.



Un résultat historique n'est pas présenté comme un résultat de cette mission.



\## NON-RÉGRESSION



Vérifier qu'aucune régression bloquante n'est détectée sur :



\- PEOPLE ;

\- Work ;

\- Runtime ;

\- Core.



Une régression critique entraîne NO GO.



Ne pas corriger cette régression dans 001H sans autorisation distincte.



\## CORRECTIONS



Le contrat autorise uniquement les corrections strictement indispensables préalablement autorisées.



Par défaut :



AUCUNE CORRECTION.



Si une correction devient nécessaire :



STOP avant modification.



Documenter :



\- défaut ;

\- fichier ;

\- impact ;

\- raison pour laquelle la certification ne peut pas continuer ;

\- correction minimale proposée.



Retourner NO GO sauf autorisation explicite distincte.



\## FICHIERS FONCTIONNELS



Aucun fichier fonctionnel TypeScript ne doit être modifié.



Ne modifier aucun fichier sous :



server/domain/people/

server/runtime/work/

server/nova-core/

server/nova-bff/

tools/

apps/

client/



Ne modifier aucun contrat ou blueprint.



\## CERTIFICATION FINALE



Inspecter d'abord la convention réelle de :



Docs/12\_CERTIFICATION/



et :



Docs/12\_CERTIFICATION/certification-registry.json



Ne pas inventer un schéma.



Si et seulement si toutes les conditions GO sont satisfaites, matérialiser la certification finale conformément à la convention existante.



Le LotId doit représenter exactement le lot certifié par le contrat.



Ne pas inventer un identifiant différent pour faciliter la certification.



Le statut doit être :



CERTIFIED



uniquement après toutes les preuves obligatoires PASS.



\## PLANNING



Le contrat indique que 001H doit produire une décision sur l'ouverture de Planning.



Cette décision doit être dérivée des sources canoniques.



Ne pas inventer un identifiant de lot Planning.



Rechercher le prochain lot/programme explicitement autorisé dans :



\- contrat PEOPLE ;

\- blueprint applicable ;

\- registre/certifications applicables ;

\- roadmap canonique si nécessaire.



Si un identifiant Planning précis est explicitement défini et toutes les conditions sont PASS, le rapport peut déclarer cet identifiant comme prochain lot autorisé.



S'il n'est pas déterminable de manière canonique :



ne pas l'inventer.



Indiquer que People Foundation est certifiable mais que l'identifiant d'ouverture Planning reste à résoudre selon la gouvernance applicable.



\## ÉCRITURE AUTORISÉE



Limiter les écritures aux artefacts documentaires strictement nécessaires à 001H :



1\. rapport final 001H ;

2\. certification officielle finale, si la convention existante l'exige ;

3\. entrée de registre strictement nécessaire, si la convention existante l'exige.



Aucun code fonctionnel.



\## RAPPORT FINAL



Créer :



Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/MISSIONS/P3-PEOPLE-001H\_CERTIFICATION\_REPORT.md



Le rapport doit contenir :



1\. objectif ;

2\. préconditions ;

3\. état Git initial ;

4\. sources canoniques ;

5\. inventaire B → G ;

6\. état des certifications B → G ;

7\. matrice de conformité globale ;

8\. ownership ;

9\. People Authority ;

10\. persistence ;

11\. Commands ;

12\. Queries ;

13\. Work Integration ;

14\. quatre états d'absence ;

15\. séparation Business Person / RuntimeAgent / Technical Agent ;

16\. conformité WP-001 ;

17\. contrôle des frontières ;

18\. recherche de contradictions ;

19\. tests PEOPLE ;

20\. tests Work ;

21\. tests Runtime ;

22\. tests Core ;

23\. typechecks ;

24\. contrôles CEREBRAU applicables ;

25\. git diff --check et portée réelle ;

26\. non-régressions ;

27\. fichiers modifiés par 001H ;

28\. risques résiduels ;

29\. état final de People Foundation ;

30\. décision sur l'ouverture de Planning ;

31\. verdict terminal unique.



\## CRITÈRES GO



GO uniquement si :



\- P3-PEOPLE-001G est certifié ;

\- toutes les preuves B → G requises sont disponibles ;

\- aucune contradiction critique n'existe ;

\- ownership PEOPLE est unique ;

\- People Authority est unique ;

\- persistence PEOPLE est unique ;

\- Commands et Queries sont cohérents ;

\- Work lit PEOPLE sans duplication ;

\- Business Person reste distinct de RuntimeAgent et Technical Agent ;

\- tous les invariants obligatoires du contrat sont respectés ;

\- WP-001 n'est pas affaibli ;

\- aucune frontière interdite n'est franchie ;

\- tests PEOPLE PASS ;

\- tests Work PASS ;

\- tests Runtime PASS ;

\- tests Core PASS ;

\- typechecks applicables PASS ;

\- contrôles obligatoires applicables PASS ;

\- aucune régression critique n'est constatée ;

\- toutes les preuves obligatoires sont disponibles.



\## RÈGLE NO GO



Retourner NO GO si :



\- une source/producteur est ambigu ;

\- une preuve obligatoire manque ;

\- une certification intermédiaire est incohérente ;

\- une seconde source de vérité existe ;

\- une donnée technique a été promue en donnée PEOPLE ;

\- une persistence concurrente existe ;

\- un invariant WP-001 est affaibli ;

\- une frontière API/BFF/UI a été ouverte prématurément ;

\- une régression est détectée ;

\- une validation obligatoire échoue ;

\- une correction fonctionnelle est nécessaire pour obtenir PASS.



Ne jamais modifier du code pour transformer NO GO en GO pendant cette mission.



\## VERDICT TERMINAL



Si toutes les conditions passent, terminer exactement par :



GO — P3-PEOPLE-001H — P3-PEOPLE-001 CERTIFIED



Sinon terminer exactement par :



NO GO — P3-PEOPLE-001H — P3-PEOPLE-001 NOT CERTIFIED



Ne pas commencer Planning.



Ne créer aucun artefact Planning.



Une éventuelle ouverture de Planning est uniquement une décision de gouvernance produite par cette certification.

