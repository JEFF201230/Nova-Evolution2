# P3-ACTIONS-001A — ACTIONS IMPLEMENTATION CONTRACT

## 1. IDENTITÉ

MissionId:

P3-ACTIONS-001A-IMPLEMENTATION-CONTRACT

DomainId:

ACTIONS

ParentLot:

P3-ACTIONS-001 — Actions Foundation

LotId:

P3-ACTIONS-001A — Actions Implementation Contract

Nature:

Contrat d'implémentation et admission documentaire du domaine ACTIONS.

---

## 2. CONTEXTE D'ADMISSION

Le domaine PLANNING est désormais intégralement certifié.

État canonique constaté :

- LastCertifiedLot = P3-PLANNING-001G ;
- CurrentLot = vide ;
- CurrentStatus = CERTIFIED ;
- DomainCertification = True.

P3-PLANNING-001G clôt Planning Foundation.

Le contrat Planning prévoit explicitement, après cette clôture, une décision d'ouverture éventuelle d'Actions.

Le domaine ACTIONS possède déjà une autorité métier documentaire :

`Docs/24_MODULES/WORK/ACTIONS_DOMAIN_BLUEPRINT.md`

En revanche :

- aucun `ACTIONS_IMPLEMENTATION_CONTRACT.md` n'existe actuellement ;
- aucun identifiant `P3-ACTIONS-*` antérieur n'a été trouvé ;
- `Resolve-DomainContext -DomainId ACTIONS` retourne actuellement `DOMAIN_UNKNOWN:ACTIONS`.

Cette mission constitue donc l'acte documentaire initial permettant de déterminer si P3-ACTIONS-001 peut être admis dans CEREBRAU.

---

## 3. OBJECTIF UNIQUE

Produire et certifier le contrat d'implémentation du domaine ACTIONS à partir des sources NOVA existantes et autoritatives.

Livrable principal attendu :

`Docs/24_MODULES/WORK/ACTIONS_IMPLEMENTATION_CONTRACT.md`

Cette mission ne doit implémenter aucun code Actions.

Elle doit transformer le blueprint ACTIONS en contrat d'implémentation déterministe, séquencé, testable et compatible avec CEREBRAU.

---

## 4. SOURCES CANONIQUES OBLIGATOIRES

Lire intégralement et utiliser en priorité :

1. `Docs/24_MODULES/WORK/ACTIONS_DOMAIN_BLUEPRINT.md`
   - autorité métier principale ACTIONS.

2. `Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md`
   - ownership Work ;
   - Identity ;
   - Objective ;
   - Lifecycle ;
   - Progress ;
   - relations avec les domaines Work.

3. `Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md`
   - précédent canonique d'admission d'un nouveau domaine ;
   - structure contractuelle ;
   - règles de séquencement ;
   - règles CEREBRAU ;
   - ne pas recopier mécaniquement le modèle métier Planning.

4. `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001G-PLANNING-FOUNDATION-CERTIFICATION/P3-PLANNING-001G_PLANNING_FOUNDATION_CERTIFICATION_REPORT.md`
   - uniquement pour vérifier la clôture Planning et les conditions d'ouverture éventuelle d'Actions.

5. `Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md`
   - précédent supplémentaire uniquement si nécessaire pour vérifier les conventions contractuelles CEREBRAU ;
   - ne pas recopier le modèle métier PEOPLE.

6. `Docs/12_CERTIFICATION/certification-registry.json`
   - uniquement pour comprendre le mécanisme générique d'admission.

7. Les fichiers CEREBRAU strictement nécessaires à la compréhension du mécanisme générique d'admission :
   - `tools/nova-core-runtime/Invoke-ImplementDomainV2.ps1`
   - `tools/nova-core-runtime/Cerebrau.DomainOrchestration.psm1`
   - `tools/nova-core-runtime/Cerebrau.Certification.psm1`

Ne pas lancer une exploration récursive générale du repository si ces sources suffisent.

---

## 5. AUTORITÉ MÉTIER ACTIONS À PRÉSERVER

Le contrat doit respecter strictement `ACTIONS_DOMAIN_BLUEPRINT.md`.

Principes déjà établis :

- Action est la racine métier du domaine Actions ;
- une Action représente une intention métier identifiée visant un changement ou un résultat utile au Work ;
- chaque Action appartient à exactement un Work ;
- un Work peut posséder zéro, une ou plusieurs Actions ;
- le but d'une Action ne remplace pas l'Objective global du Work ;
- Action, Task, Command, Activity, Execution et Result sont des concepts distincts ;
- le statut Action possède son propre vocabulaire ;
- un statut Action n'est ni un état Work, ni un état Mission, ni un état Planning ;
- Planning conserve les dates, Phases, Milestones, échéances et priorités planifiées ;
- People conserve Business Identity, rôles et Affectations ;
- Decisions conserve l'autorisation ;
- Runtime, queues, agents et mécanismes techniques ne deviennent pas une source métier Actions ;
- aucune seconde source de résultat n'est autorisée ;
- les relations interdomaines doivent préserver les sources de vérité existantes.

Ne modifier aucun de ces ownerships pour simplifier l'implémentation.

---

## 6. FRONTIÈRES À PROTÉGER

Le contrat doit déterminer explicitement ce qui appartient à Actions et ce qui reste hors Actions.

Actions ne doit notamment pas absorber :

- Work Identity ;
- Work Objective ;
- Work Lifecycle ;
- Work Progress ;
- Planning ;
- Phase ;
- Milestone ;
- Schedule ;
- Priority planifiée ;
- Business Identity PEOPLE ;
- rôles PEOPLE ;
- Affectations PEOPLE ;
- autorité Decision ;
- Deliverables ;
- Synthesis ;
- Mission Runtime ;
- Agent Runtime ;
- queues ;
- schedulers ;
- timers ;
- Monitoring technique.

Toute relation avec ces domaines doit conserver l'ownership de la source autoritative.

---

## 7. CONTRAT À PRODUIRE

Produire :

`Docs/24_MODULES/WORK/ACTIONS_IMPLEMENTATION_CONTRACT.md`

Le contrat doit fixer au minimum :

1. identité du domaine ;
2. autorité métier ;
3. frontières ;
4. ownership ;
5. agrégat Action ;
6. concepts Action / Task / Command / Activity / Execution / Result / Dependency ;
7. invariants ;
8. cycle et statuts Action ;
9. commandes métier autorisées ;
10. événements métier ;
11. modèle de résultat ;
12. provenance et causalité ;
13. idempotence ;
14. concurrence ;
15. modèle de persistence requis ou explicitement non requis ;
16. producteur autoritatif ;
17. accès interne Commands/Queries si nécessaire ;
18. relation Actions / Work ;
19. relation Actions / Planning ;
20. relation Actions / People ;
21. relation Actions / Decisions ;
22. relation Actions / Deliverables ;
23. séparation Actions / Progress ;
24. séparation Actions / Runtime ;
25. erreurs métier ;
26. stratégie de tests ;
27. non-régressions ;
28. règles de certification ;
29. séquence d'implémentation ;
30. gates d'entrée et de sortie de chaque sous-lot.

Aucune primitive métier absente du blueprint ne doit être inventée silencieusement.

Toute inconnue doit être qualifiée explicitement.

---

## 8. SÉQUENCE D'IMPLÉMENTATION À DÉTERMINER

Déterminer la séquence minimale de sous-lots postérieurs à P3-ACTIONS-001A nécessaire pour construire puis certifier :

`P3-ACTIONS-001 — Actions Foundation`

Ne pas recopier mécaniquement :

- B→H de PEOPLE ;
- B→G de PLANNING.

La séquence doit découler exclusivement des besoins réels du domaine ACTIONS.

Pour chaque sous-lot proposé, définir obligatoirement :

- LotId ;
- nom ;
- objectif ;
- périmètre autorisé ;
- fichiers ou zones autorisables ;
- critères d'entrée ;
- critères de sortie ;
- validations obligatoires ;
- régressions interdites ;
- PreviousLot ;
- NextAuthorizedLot.

Le dernier sous-lot doit être une certification consolidée de la Foundation ACTIONS.

---

## 9. PRODUCTEUR AUTORITATIF

Déterminer, depuis le blueprint, la frontière qui doit être l'unique producteur autoritatif des mutations Actions.

Le contrat doit interdire :

- plusieurs producteurs métier concurrents ;
- une mutation directe par Work ;
- une mutation directe par Planning ;
- une mutation directe par People ;
- une mutation directe par Runtime ;
- une mutation directe par un agent technique ;
- une mutation directe par le frontend ;
- un store miroir devenant autoritatif.

Si le blueprint ne permet pas de déterminer suffisamment cette autorité, conclure NO GO plutôt que l'inventer.

---

## 10. PERSISTENCE

Déterminer si les invariants ACTIONS imposent une persistence canonique durable.

Si oui, définir uniquement les propriétés contractuelles nécessaires :

- source durable unique ;
- identité ;
- état courant ;
- histoire si requise ;
- événements si requis ;
- idempotence ;
- concurrence ;
- recovery ;
- provenance.

La technologie de persistence ne doit être choisie que si les sources existantes l'imposent.

Ne créer aucune persistence pendant P3-ACTIONS-001A.

---

## 11. RELATION ACTIONS / WORK

Le contrat doit préserver :

- chaque Action appartient exactement à un Work ;
- Work conserve son propre ownership ;
- Action ne remplace pas Objective ;
- statut Action != Lifecycle Work ;
- statut Action != Progress Work ;
- Work ne doit pas devenir un second store autoritatif Actions.

Déterminer le mécanisme minimal de référence canonique entre Work et Action sans inventer une seconde identité Work.

---

## 12. RELATION ACTIONS / PLANNING

Planning est certifié et conserve :

- Plan ;
- Timeline ;
- Phase ;
- Milestone ;
- Schedule ;
- Priority planifiée ;
- Constraint.

Le blueprint ACTIONS qualifie la relation Planning de future et optionnelle.

Le contrat ACTIONS ne doit donc pas transférer ces propriétés vers Actions.

Toute intégration Actions / Planning doit être séquencée uniquement si elle est indispensable à Actions Foundation et suffisamment déterminée par les sources.

Sinon, la reporter explicitement.

---

## 13. RELATION ACTIONS / PEOPLE

People conserve :

- Business Identity ;
- rôles ;
- Affectations.

Le blueprint ACTIONS qualifie les responsabilités People détaillées comme futures.

Ne pas inventer une affectation Actions propriétaire de données PEOPLE.

Toute relation doit préserver la source PEOPLE.

---

## 14. RELATION ACTIONS / DECISIONS

Decisions conserve l'autorisation.

Une Action ne doit pas s'auto-attribuer une autorisation qui appartient au domaine Decisions.

Si Decisions n'est pas suffisamment matérialisé pour une intégration Foundation, qualifier cette dépendance et la différer.

---

## 15. ACTIONS / RUNTIME

Les concepts métier :

- Command ;
- Activity ;
- Execution ;

ne doivent pas être confondus avec les mécanismes techniques du Runtime.

Un Technical Agent peut éventuellement contribuer à une Activity uniquement selon les règles du blueprint.

Il ne devient :

- ni acteur PEOPLE ;
- ni propriétaire de l'Action ;
- ni autorité métier Actions.

Le Runtime ne doit pas devenir source de vérité Actions.

---

## 16. TEST CONTRACT

Définir les catégories minimales de tests nécessaires à la Foundation ACTIONS.

Évaluer notamment :

- invariants Action ;
- ownership ;
- relation Work ;
- transitions de statut ;
- Dependency ;
- Commands ;
- Events ;
- Result ;
- provenance ;
- causalité ;
- idempotence ;
- concurrence ;
- persistence si applicable ;
- Queries si applicables ;
- intégrations interdomaines strictement nécessaires ;
- séparation Work/Lifecycle/Progress ;
- séparation Planning ;
- séparation PEOPLE ;
- séparation Runtime ;
- non-régression Work ;
- non-régression Planning ;
- non-régression PEOPLE ;
- Runtime/Core applicables ;
- typecheck.

Attribuer explicitement les validations à chaque sous-lot.

---

## 17. ADMISSION CEREBRAU

Évaluer précisément ce qui sera nécessaire après GO de P3-ACTIONS-001A pour que :

`Invoke-ImplementDomainV2.ps1 -Domain ACTIONS -DryRun`

ne retourne plus :

`DOMAIN_UNKNOWN:ACTIONS`

Utiliser uniquement le mécanisme générique existant.

Ne pas introduire de spécial-case ACTIONS dans CEREBRAU.

Ne modifier :

`Docs/12_CERTIFICATION/certification-registry.json`

que si l'analyse prouve que cette écriture constitue l'acte canonique générique nécessaire à l'admission du premier lot.

Ne jamais précréer plusieurs lots ACTIONS dans le registre.

Ne jamais marquer comme CERTIFIED un sous-lot non exécuté.

---

## 18. INTERDICTIONS

Cette mission ne doit pas :

- implémenter le domaine Actions ;
- créer le modèle TypeScript Actions ;
- créer Actions Authority ;
- créer une persistence Actions ;
- créer Commands/Queries opérationnelles ;
- intégrer Work ;
- intégrer Planning ;
- intégrer People ;
- intégrer Decisions ;
- intégrer Deliverables ;
- modifier le Runtime métier ;
- modifier le Frontend ;
- modifier NOVA Web ;
- modifier le BFF ;
- créer une API publique ;
- créer IAM/RBAC ;
- modifier le blueprint ACTIONS ;
- modifier le blueprint WORK ;
- modifier le contrat PLANNING ;
- modifier le contrat PEOPLE ;
- réouvrir PLANNING ;
- modifier les certifications PLANNING existantes ;
- inventer une nouvelle doctrine métier.

---

## 19. RAPPORT OBLIGATOIRE

Créer :

`Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001A-IMPLEMENTATION-CONTRACT/P3-ACTIONS-001A_IMPLEMENTATION_CONTRACT_REPORT.md`

Le rapport doit contenir au minimum :

1. MissionId ;
2. DomainId ;
3. ParentLot ;
4. LotId ;
5. sources réellement consultées ;
6. fichiers créés ;
7. fichiers modifiés ;
8. faits prouvés ;
9. hypothèses éventuelles ;
10. inconnues éventuelles ;
11. décisions d'architecture ;
12. ownership Actions retenu ;
13. relation Actions / Work ;
14. séparation Actions / Progress ;
15. relation Actions / Planning ;
16. relation Actions / People ;
17. relation Actions / Decisions ;
18. séparation Actions / Runtime ;
19. producteur autoritatif retenu ;
20. persistence requise ou non ;
21. séquence des sous-lots proposée ;
22. validations par sous-lot ;
23. mécanisme d'admission CEREBRAU ;
24. non-régressions vérifiées ;
25. décision finale ;
26. prochain lot autorisable si GO.

---

## 20. CRITÈRES GO

GO uniquement si :

- `ACTIONS_DOMAIN_BLUEPRINT.md` est suffisamment déterministe pour produire un Implementation Contract sans invention métier critique ;
- l'ownership Actions reste unique ;
- Action reste rattachée exactement à un Work ;
- Action ne remplace pas Objective ;
- statut Action reste distinct de Work, Mission et Planning ;
- Planning conserve son ownership ;
- People conserve son ownership ;
- Decisions conserve son ownership ;
- Runtime ne devient pas autorité métier ;
- aucune seconde source de Result n'est créée ;
- le producteur autoritatif peut être déterminé ;
- la nécessité ou non d'une persistence peut être déterminée ;
- une séquence minimale de construction peut être définie ;
- les gates sont déterministes ;
- les validations sont définies ;
- l'admission CEREBRAU peut utiliser le mécanisme générique existant ;
- aucune régression certifiée Work, PEOPLE ou PLANNING n'est introduite.

Verdict :

`GO — P3-ACTIONS-001A — ACTIONS IMPLEMENTATION CONTRACT CERTIFIED`

---

## 21. CRITÈRES NO GO

NO GO notamment si :

- le blueprint exige une invention métier critique ;
- l'ownership Action reste ambigu ;
- Action et Work ne peuvent pas être séparés proprement ;
- Action et Progress ne peuvent pas être séparés proprement ;
- Action et Planning ne peuvent pas être séparés proprement ;
- le producteur autoritatif ne peut pas être déterminé ;
- une seconde source de résultat serait nécessaire ;
- l'admission nécessite un spécial-case CEREBRAU ;
- une régression d'un domaine certifié est nécessaire.

Verdict :

`NO GO — P3-ACTIONS-001A — ACTIONS IMPLEMENTATION CONTRACT NOT CERTIFIED`

---

## 22. STOP CONDITION

Même en cas de GO :

- ne pas commencer P3-ACTIONS-001B ;
- ne pas implémenter Actions ;
- ne pas ouvrir automatiquement une intégration Work/Planning/People ;
- ne pas lancer une autre mission ;
- ne pas certifier automatiquement un lot ultérieur.

S'arrêter après production du contrat, du rapport et de l'éventuel acte générique d'admission explicitement justifié.

La poursuite exige une décision humaine explicite.
