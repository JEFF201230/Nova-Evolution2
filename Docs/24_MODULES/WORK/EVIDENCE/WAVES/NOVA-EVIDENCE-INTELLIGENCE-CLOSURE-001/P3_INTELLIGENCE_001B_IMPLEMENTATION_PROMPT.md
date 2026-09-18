MISSION\_ID: P3-INTELLIGENCE-001B-IMPLEMENTATION-001

PROGRAM: PROGRAM-003

DOMAIN: INTELLIGENCE

LOT: P3-INTELLIGENCE-001B

MISSION\_TYPE: IMPLEMENTATION

PROFILE: BUILD

TARGET: NOVA



\# OBJECTIF



Implémenter et valider la fondation métier autoritaire du domaine NOVA Intelligence conformément :



\- au Blueprint Intelligence canonique ;

\- à INTELLIGENCE\_IMPLEMENTATION\_CONTRACT.md ;

\- au Mission Order P3-INTELLIGENCE-001 ;

\- aux décisions Program Owner déjà consignées ;

\- aux autorités Evidence, Business Certification, Work, Actions, Planning et People déjà certifiées.



Ne pas reconstruire les fondations certifiées.



\# ÉTAT D'ENTRÉE ACQUIS



Considérer les gates suivants comme fermés lorsqu'ils sont confirmés par les autorités canoniques :



\- Business Evidence : CERTIFIED

\- Business Certification : CERTIFIED

\- WCF-004 Work Evidence : CERTIFIED

\- WORK-AUTHORIZED-STATE-001 : CERTIFIED

\- RT-12 CertificationReference : PASS

\- P3-EVIDENCE-001B provenance : RATIFIED

\- WCF-004 provenance : RATIFIED

\- WORK-AUTHORIZED-STATE-001 provenance : RATIFIED

\- Red Team Evidence finale : PASS

\- P3-INTELLIGENCE-001A : CERTIFIED



Ne pas redemander une validation humaine de ces décisions.

Ne pas réimplémenter ces domaines.



\# RESPONSABILITÉ INTELLIGENCE



Intelligence transforme :



\- faits autoritaires ;

\- Work Authorized State ;

\- Evidence admissibles ;

\- Knowledge reconnue lorsqu'elle est autorisée ;



en résultats raisonnés traçables.



Intelligence possède notamment :



\- Analysis

\- Insights

\- Recommendations

\- Evaluations

\- Diagnostics

\- leurs révisions/retraits

\- leurs liens de provenance



Intelligence ne possède PAS :



\- les faits sources ;

\- Business Evidence ;

\- Business Certification ;

\- Work ;

\- Planning ;

\- Actions ;

\- People ;

\- Decisions ;

\- Synthesis ;

\- Confidence.



\# RÈGLE ABSOLUE — ASSERTIONS FACTUELLES



Toute assertion factuelle produite par Intelligence doit être reliée à une Evidence active et admissible.



Interdit :



\- assertion factuelle sans Evidence ;

\- transformation d'une fixture en vérité métier ;

\- transformation d'un diagnostic runtime en Intelligence métier ;

\- suppression silencieuse d'une contradiction ;

\- invention d'une source ;

\- invention d'une confiance.



Les contradictions, limites et Evidence concurrentes doivent rester explicitement représentables.



\# NEXT BEST ACTION



Décision Program Owner canonique :



EXISTING\_ACTION



Une Next Best Action est :



la Recommendation Intelligence non impérative actuellement la mieux classée et référençant un ActionId autoritaire existant.



Intelligence peut :



\- analyser une Action existante ;

\- classer une Action existante ;

\- recommander une Action existante.



Intelligence ne peut PAS :



\- créer une Action ;

\- exécuter une Action ;

\- modifier une Action ;

\- admettre une Action ;

\- approuver une Action ;

\- commander une Action ;

\- modifier la priorité Planning.



Une Recommendation sans ActionId reste une Recommendation générale.



Elle n'est PAS une Next Best Action.



\# MODÈLE ET LIFECYCLE



L'implémentation doit être :



\- déterministe ;

\- explicitement typée ;

\- idempotente lorsque requis ;

\- traçable ;

\- append-only pour l'historique métier lorsqu'une révision doit être conservée ;

\- fail-closed sur les autorités nécessaires.



Une révision ne doit pas effacer silencieusement le résultat antérieur.



Un retrait doit rester traçable.



Ne pas dupliquer les états mutables des domaines sources.



Conserver des références autoritaires plutôt que des copies divergentes.



\# INTÉGRATION WORK



Intelligence consomme le Work Authorized State certifié.



Intelligence ne devient pas propriétaire du lifecycle Work.



Work ne devient pas propriétaire du contenu Intelligence.



La future intégration WCF-008 doit rester une association/read model gouverné.



Ne pas implémenter WCF-008 dans ce lot.



\# EVIDENCE



Utiliser exclusivement les frontières métier Evidence/Business Certification certifiées.



Ne pas contourner RT-12.



Une Evidence devenue inadmissible ne doit pas être silencieusement considérée comme toujours valide par un nouveau résultat Intelligence.



Le comportement doit être fail-closed lorsque l'autorité nécessaire est indisponible.



\# FRONTIÈRES PRODUIT



Priorité d'implémentation :



server/domain/intelligence/\*\*



Les adaptations minimales des frontières certifiées existantes ne sont permises que si elles sont strictement nécessaires au contrat Intelligence et démontrées par les tests.



Ne pas réécrire :



server/domain/evidence/\*\*

server/domain/business-certification/\*\*

server/domain/work/\*\*

server/domain/actions/\*\*

server/domain/planning/\*\*

server/domain/people/\*\*



sauf adaptation d'interface minimale réellement indispensable et non destructive.



\# SÉPARATION CEREBRAU / NOVA



Aucune dépendance produit/runtime NOVA vers CEREBRAU.



Interdit comme source métier Intelligence :



\- tools/cerebrau

\- runtime CEREBRAU

\- Docs/12\_CERTIFICATION

\- Mission certificates

\- OfficialStatus

\- rapports CI

\- résultats Git

\- résultats de tests techniques



CEREBRAU gouverne le développement.

Il n'est pas une autorité métier NOVA.



\# SYNTHESIS / CONFIDENCE



NE PAS implémenter :



\- P3-SYNTHESIS-001

\- P3-CONFIDENCE-001

\- WCF-008-CLOSURE



dans ce lot.



Intelligence doit seulement fournir des résultats suffisamment propres, typés et traçables pour permettre ces étapes ultérieures.



\# TESTS OBLIGATOIRES



Démontrer au minimum :



1\. création d'un résultat Intelligence à partir d'un Work Authorized State admissible ;

2\. assertion factuelle reliée à Evidence admissible ;

3\. rejet d'une assertion factuelle sans Evidence requise ;

4\. comportement fail-closed si l'autorité Evidence nécessaire est indisponible ;

5\. conservation explicite des contradictions ;

6\. conservation explicite des limites ;

7\. Recommendation générale sans ActionId ;

8\. Recommendation avec ActionId autoritaire existant ;

9\. rejet/non-admission d'un ActionId inexistant lorsque la résolution autoritaire est requise ;

10\. Next Best Action déterminée uniquement parmi les Recommendations éligibles avec ActionId existant ;

11\. aucun effet de bord sur Action ;

12\. aucun effet de bord sur Planning ;

13\. révision traçable ;

14\. retrait traçable ;

15\. déterminisme ;

16\. idempotence lorsque le contrat l'exige ;

17\. aucune dépendance CEREBRAU produit ;

18\. aucune implémentation Synthesis ;

19\. aucune implémentation Confidence ;

20\. aucune fermeture WCF-008.



Exécuter également les régressions pertinentes des domaines certifiés impactés par le delta réel.



\# VALIDATIONS



Utiliser les validations canoniques existantes.



Au minimum lorsque applicables :



\- tests Intelligence ;

\- tests Evidence ;

\- tests Business Certification ;

\- tests Work ;

\- tests Actions ;

\- tests Planning ;

\- tests People ;

\- NOVA Runtime ;

\- NOVA Core ;

\- runtime E2E ;

\- TypeScript typecheck ;

\- git diff --check ;

\- contrôle des chemins autorisés/interdits ;

\- contrôle dépendances CEREBRAU produit.



Ne pas fabriquer un PASS.



\# ANTI-DRIFT



Ne pas :



\- réimplémenter les domaines déjà certifiés ;

\- modifier VEEDDA ;

\- modifier l'UI ;

\- modifier les installations globales Codex/npm/PATH ;

\- utiliser git reset --hard ;

\- utiliser git clean ;

\- utiliser git checkout . ;

\- utiliser git restore . ;

\- utiliser git add . ;

\- supprimer les changements externes ;

\- attribuer à cette mission les changements préexistants ;

\- fabriquer une approbation ;

\- fabriquer une certification ;

\- fabriquer un fingerprint ;

\- fabriquer un résultat de test.



\# AUTONOMIE



Inspecter les autorités canoniques nécessaires.



Ne pas interrompre l'exécution pour des micro-validations lorsque la réponse peut être déterminée depuis le dépôt, les contrats, les rapports ou les autorités existantes.



En cas de contradiction réellement bloquante :

STOP avec preuve exacte.



Sinon :

implémenter, tester et produire les preuves.



\# FRONTIÈRE DE FIN



Résultat maximal autorisé :



P3-INTELLIGENCE-001B

READY\_FOR\_REVIEW



ou l'état gouverné techniquement équivalent prévu par le Runtime.



NE PAS auto-fabriquer l'approbation humaine finale.



NE PAS poursuivre vers :



P3-SYNTHESIS-001

P3-CONFIDENCE-001

WCF-008-CLOSURE



\# RAPPORT FINAL



Produire exactement :



MISSION\_STATUS:

SUCCESS | PARTIAL | BLOCKED | FAILED



INTELLIGENCE\_001B:

READY\_FOR\_REVIEW | BLOCKED | FAILED



ANALYSIS:

PASS | FAIL



INSIGHTS:

PASS | FAIL



RECOMMENDATIONS:

PASS | FAIL



EVALUATIONS\_DIAGNOSTICS:

PASS | FAIL



NEXT\_BEST\_ACTION:

PASS | FAIL



EVIDENCE\_TRACEABILITY:

PASS | FAIL



CONTRADICTIONS\_LIMITS:

PASS | FAIL



REGRESSIONS:

PASS | FAIL



CEREBRAU\_PRODUCT\_DEPENDENCIES:

0 | <nombre>



SYNTHESIS:

NOT\_STARTED



CONFIDENCE:

NOT\_STARTED



WCF\_008:

OPEN



TESTS:

<résultats réels>



MODIFIED\_FILES:

<liste exacte>



PROTECTED\_FILES\_CHANGED:

NONE | <liste exacte>



BLOCKERS:

NONE | <liste exacte>



NEXT\_AUTHORIZED\_ACTION:

<une seule action exacte>



Commencer l'implémentation maintenant.

