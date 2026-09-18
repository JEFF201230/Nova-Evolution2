MISSION\_ID: WCF-004-IMPLEMENTATION-001

PROGRAM: PROGRAM-003

LOT: WCF-004

MISSION\_TYPE: IMPLEMENTATION

PROFILE: BUILD



MODE:

PROGRAM DIRECTOR

MVP STRICT

DELTA-ONLY

FACTUAL ONLY

EVIDENCE DRIVEN

FAIL CLOSED



MISSION



Implémenter uniquement WCF-004 — Work Sources and Evidence.



Le lot est autorisé à entrer en IMPLEMENTATION.



Ne pas réauditer globalement NOVA.

Ne pas réauditer Evidence.

Ne pas réauditer WORK.

Ne pas reconstruire les domaines déjà certifiés.

Ne pas relire récursivement tout le dépôt.



Inspecter directement les fichiers strictement nécessaires à l'implémentation.



CEREBRAU gouverne cette mission de développement mais ne doit devenir ni une dépendance produit NOVA ni une source métier.



AUTHORITATIVE INPUTS



Utiliser comme autorités :



1\. Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/MISSION\_ORDER\_WCF\_004.md



2\. Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/WORK\_IMPLEMENTATION\_CONTRACT.md



3\. Docs/24\_MODULES/WORK/WORK\_DOMAIN\_BLUEPRINT.md



4\. Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/EVIDENCE\_DOMAIN\_BLUEPRINT.md



5\. server/domain/evidence/\*\*



6\. server/domain/work/work-actions.\*

&#x20;  server/domain/work/work-planning.\*



7\. Docs/12\_CERTIFICATION/certification-registry.json



ÉTAT D'ENTRÉE ACQUIS



P3-EVIDENCE-001B = CERTIFIED

WCF-004A = CERTIFIED

NextAuthorizedLot = WCF-004

WCF-004 = AUTHORIZED

ExecutionMode = IMPLEMENTATION

CodeExists = False



Ne pas demander une nouvelle validation humaine de ces faits sauf contradiction matérielle directement détectée.



OBJECTIF



Implémenter l'association canonique Work/Evidence sans transférer l'autorité Evidence vers WORK.



L'association unique est :



(projectId, workId, EvidenceId)



WORK peut posséder uniquement :



\- l'identité du lien ;

\- WorkReference ;

\- EvidenceId ;

\- provenance du lien ;

\- timestamp du lien ;

\- mécanisme nécessaire à sa persistance/recovery.



WORK ne possède pas :



\- BusinessEvidenceRecord ;

\- payload Evidence ;

\- contenu de la source métier ;

\- lifecycle Evidence ;

\- statut Evidence autoritatif ;

\- Certification autoritative ;

\- copie mutable d'une vérité appartenant à Evidence.



EVIDENCE reste l'autorité métier Business Evidence.



IMPLEMENTATION



Créer uniquement les composants nécessaires sous :



server/domain/work/work-evidence\*.ts



Adapter uniquement si nécessaire :



server/domain/work/index.ts

server/domain/work/tsconfig.json



Créer les tests WCF-004 strictement nécessaires dans server/domain/work/.



Réutiliser les conventions existantes de :



work-actions.\*

work-planning.\*



mais respecter la spécificité WCF-004 : le lien WorkReference/EvidenceId peut être persisté, tandis que le contenu Evidence reste résolu depuis son propriétaire.



INVARIANTS



Démontrer au minimum :



1\. unicité de (projectId, workId, EvidenceId) ;



2\. création idempotente d'un lien identique ;



3\. absence de duplication Evidence dans WORK ;



4\. suppression d'un lien Work/Evidence sans suppression de l'Evidence ;



5\. zéro Evidence liée retourne un état AVAILABLE\_EMPTY lorsque l'autorité Evidence est disponible ;



6\. une ou plusieurs Evidence liées retournent AVAILABLE ;



7\. indisponibilité du producteur/reader Evidence retourne UNAVAILABLE et ne doit jamais être transformée en EMPTY ;



8\. Evidence inconnue est distinguée de l'indisponibilité de l'autorité ;



9\. Evidence invalidée/withdrawn reste interprétée depuis Evidence et non depuis une copie WORK ;



10\. Certification est résolue depuis son propriétaire lorsqu'elle est demandée ;



11\. indisponibilité Certification reste explicitement représentable ;



12\. lecture read-only ;



13\. aucune mutation Evidence depuis WORK ;



14\. aucune création/certification Evidence depuis WORK ;



15\. association many-to-many autorisée lorsque cohérente ;



16\. persistance/recovery des liens conserve leur identité et leur provenance ;



17\. aucune seconde source de vérité Business Evidence ;



18\. aucune dépendance produit/runtime vers CEREBRAU.



QUERY



Fournir une capacité interne WORK permettant de lire les Evidence associées à un WorkReference.



La résolution doit utiliser l'autorité/query Evidence certifiée existante.



Ne pas inventer une deuxième Evidence query si l'API certifiée existante répond déjà au besoin.



Les résultats doivent distinguer explicitement au minimum :



AVAILABLE

AVAILABLE\_EMPTY

UNAVAILABLE



et les autres états nécessaires déjà définis par les contrats Evidence.



PERSISTENCE



Si le contrat WCF-004 exige une persistance des associations, implémenter uniquement la persistance des LIENS.



Aucun BusinessEvidenceRecord ou payload métier ne doit être copié dans cette persistance.



Le recovery doit restaurer les associations sans reconstruire une autorité Evidence parallèle.



BOUNDARIES



Ne pas modifier :



server/domain/evidence/\*\*

server/domain/actions/\*\*

server/domain/people/\*\*

server/domain/planning/\*\*



Ne pas réécrire Work Core.



Ne pas modifier :



apps/\*\*

frontend

BFF

HTTP/API publics

Runtime Evidence

Mission Technical Evidence

CEREBRAU Domain Orchestration



Ne pas commencer :



WORK-AUTHORIZED-STATE-001

P3-INTELLIGENCE-001

P3-SYNTHESIS-001

P3-CONFIDENCE-001

WCF-008-CLOSURE



DIRTY WORKSPACE SAFETY



Le dépôt contient potentiellement des modifications préexistantes.



Ne jamais :



git reset

git restore sur des fichiers étrangers

git clean

supprimer des modifications étrangères

attribuer à WCF-004 des modifications préexistantes

git add .



Identifier uniquement le delta WCF-004.



VALIDATION



Exécuter les validations proportionnées au lot.



Obligatoire :



\- tests WCF-004 ;

\- tests duplicate/idempotence ;

\- tests unlink ;

\- tests zero/one/many ;

\- tests many-to-many ;

\- tests unknown Evidence ;

\- tests withdrawn/invalid Evidence ;

\- tests AVAILABLE\_EMPTY ;

\- tests producer UNAVAILABLE ;

\- tests Certification unavailable si applicable ;

\- tests no-copy/no competing truth ;

\- tests persistence/recovery si persistance requise ;

\- tests read-only ;

\- tests de non-régression WORK ;

\- tests de non-régression Evidence ;

\- tests NOVA applicables ;

\- TypeScript strict/typecheck ;

\- git diff --check ;

\- contrôle des fichiers interdits.



Tout échec obligatoire implique TECHNICAL NO-GO.



CERTIFICATION



Cette mission implémente WCF-004 et produit les preuves techniques nécessaires.



Elle ne doit PAS :



\- modifier manuellement Docs/12\_CERTIFICATION/certification-registry.json ;

\- créer une fausse approbation humaine ;

\- s'auto-certifier ;

\- certifier elle-même WCF-004 ;

\- ouvrir manuellement WORK-AUTHORIZED-STATE-001.



La certification officielle doit rester effectuée par le mécanisme CEREBRAU autorisé après réussite technique.



REPORT



Créer un rapport WCF-004 dans le répertoire de mission approprié.



Le rapport doit fournir au minimum :



\- état d'entrée ;

\- sources consultées ;

\- delta exact ;

\- fichiers créés/modifiés ;

\- modèle d'association ;

\- preuve de l'unicité ;

\- preuve d'idempotence ;

\- modèle de persistance/recovery éventuel ;

\- query WORK/Evidence ;

\- états AVAILABLE / AVAILABLE\_EMPTY / UNAVAILABLE ;

\- comportement Evidence inconnue/invalidée/withdrawn ;

\- comportement Certification ;

\- preuve qu'aucun payload Evidence n'est stocké dans WORK ;

\- preuve qu'aucune seconde autorité Evidence n'est créée ;

\- validations exécutées ;

\- comptes PASS/FAIL exacts ;

\- non-régressions ;

\- fichiers interdits contrôlés ;

\- blockers éventuels ;

\- décision technique.



VERDICT TERMINAL



Si toutes les conditions techniques passent, terminer exactement par :



TECHNICAL GO — WCF-004 — READY FOR QA/CERTIFICATION ACCEPTANCE



Sinon terminer exactement par :



NO GO — WCF-004 — WORK EVIDENCE ASSOCIATION NOT CERTIFIED



Ne pas commencer le lot suivant.

Ne pas s'auto-certifier.

